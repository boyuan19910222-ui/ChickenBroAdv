import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

import config from './config.js'
import { getDb, getStatements } from './db.js'
import { createAuthRouter } from './auth.js'
import { createCharactersRouter, loadClassConfigs } from './characters.js'
import { authenticateToken, authenticateSocket, globalErrorHandler } from './middleware.js'
import { RoomManager } from './rooms.js'
import { ChatManager, setupChat } from './chat.js'
import { BattleEngine } from './BattleEngine.js'
import { DungeonRegistry } from '../src/data/dungeons/DungeonRegistry.js'
import { SeededRandom } from '../src/core/SeededRandom.js'
import { PartyFormationSystem } from '../src/systems/PartyFormationSystem.js'

// ── Bootstrap ───────────────────────────────────────────────
const app = express()
const httpServer = createServer(app)

// Middleware
app.use(cors())
app.use(express.json())

// Initialize database
const db = getDb()
const stmts = getStatements()

// Auth routes (public)
app.use('/api/auth', createAuthRouter(stmts))

// Character routes (protected)
app.use('/api/characters', createCharactersRouter(stmts))

// Example protected route
app.get('/api/me', authenticateToken, async (req, res) => {
    const user = await stmts.findUserById.get(req.user.id)
    if (!user) {
        return res.status(404).json({ error: 'USER_NOT_FOUND', message: '用户不存在' })
    }
    res.json({ user })
})

// ── Socket.IO ───────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

// Socket.IO authentication middleware
io.use(authenticateSocket)

// ── Managers ────────────────────────────────────────────────
const chatManager = new ChatManager({ stmts })

/** @type {Map<string, BattleEngine>} roomId → BattleEngine (kept for loot generation) */
const activeBattles = new Map()

/** @type {Map<string, Map<number, string>>} roomId → userId → result ('victory'|'defeat') */
const battleCompletionStatus = new Map()

/**
 * 启动战斗（新版：客户端执行战斗，服务端仅下发初始数据）
 * @param {Object} room - 房间对象
 */
async function launchBattle(room) {
    const dungeonMeta = DungeonRegistry[room.dungeonId]
    if (!dungeonMeta) {
        console.error(`[battle] Unknown dungeon: ${room.dungeonId}`)
        io.to(room.id).emit('battle:error', { message: '未知副本' })
        return
    }

    // 生成种子
    const seed = Date.now()

    // 组装队伍快照（真人+AI补位）
    const humanPlayers = room.players.filter(p => !p.isAI)
    const { members: partySnapshots } = PartyFormationSystem.generateMultiplayerParty(
        humanPlayers, room.dungeonId, dungeonMeta
    )

    // 保存 BattleEngine 实例用于后续揔落计算
    const engine = new BattleEngine(io, room.id, room)
    engine.seed = seed
    engine.party = partySnapshots.map(m => ({
        ...m,
        side: 'player',
        damage: m.stats?.strength || m.stats?.agility || (10 + (m.level || 1) * 2),
        armor: m.stats?.armor || Math.floor((m.level || 1) * 1.5),
        speed: 50,
    }))
    // 保存 battleState 引用，用于重连时重发 battle:init
    engine.battleState = { seed, snapshots: partySnapshots }
    activeBattles.set(room.id, engine)
    // 初始化房间完成状态追踪（按玩家）
    const completionTracking = new Map()
    battleCompletionStatus.set(room.id, completionTracking)

    // 持久化战斗状态，用于断线重连时恢复 battle:init
    stmts.saveBattleState.run(room.id, { seed, snapshots: partySnapshots })
        .catch(err => console.error('[battle] Failed to save battle state:', err))

    // 广播 battle:init（客户端收到后启动本地 DungeonCombatSystem）
    io.to(room.id).emit('battle:init', {
        dungeonId: room.dungeonId,
        seed,
        snapshots: partySnapshots,
        roomId: room.id,
    })

    console.log(`[battle] Launched battle:init for room ${room.id}, dungeon=${room.dungeonId}, seed=${seed}, party=${partySnapshots.length}`)
}

/**
 * Strip non-serializable fields (waitTimer etc.) before sending room to clients
 */
function sanitizeRoom(room) {
    if (!room) return room
    const { waitTimer, ...safe } = room
    return safe
}

// Room manager — hook into battle start
const roomManager = new RoomManager({
    stmts,
    io,
    onRoomStart(room) {
        // Broadcast battle start to all players in the room
        io.to(room.id).emit('room:battle_start', { room: sanitizeRoom(room) })
        // Launch the battle asynchronously with error handling
        launchBattle(room).catch(err => {
            console.error(`[battle] launchBattle failed for room ${room.id}:`, err)
            io.to(room.id).emit('battle:error', { message: '战斗初始化失败: ' + err.message })
        })
    },
})

io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.user.username} (id=${socket.user.id})`)

    // 如果用户已在房间中，自动重新加入 Socket room
    const existingRoomId = roomManager.userRoomMap.get(socket.user.id)
    if (existingRoomId) {
        const room = roomManager.getRoom(existingRoomId)
        if (!room || room.status === 'closed') {
            // 检查数据库中是否有奖励信息（战斗完成后断线的情况）
            if (room?.status === 'closed' || !room) {
                // 从数据库查询房间信息
                stmts.findRoomById.get(existingRoomId).then(dbRoom => {
                    if (dbRoom && dbRoom.rewards) {
                        // 发送战斗结果和奖励
                        const battleState = dbRoom.battle_state || {}
                        socket.emit('battle:restore', {
                            battleState: {
                                seed: battleState.seed,
                                result: battleState.result || null,
                            },
                            rewards: dbRoom.rewards[socket.user.id] || [],
                        })
                        console.log(`[socket] Sent battle result and rewards to ${socket.user.username} for finished room ${existingRoomId}`)
                    } else {
                        // 真正的过期，清理残留映射
                        roomManager.userRoomMap.delete(socket.user.id)
                        console.log(`[socket] Cleared stale userRoomMap for ${socket.user.username} (roomId=${existingRoomId})`)
                    }
                }).catch(err => console.error('[socket] Failed to query room for reconnection:', err))
            }
        } else {
            // 重连时恢复玩家在线状态
            const player = room.players.find(p => p.userId === socket.user.id)
            if (player) player.isOnline = true

            socket.join(existingRoomId)
            console.log(`[socket] ${socket.user.username} rejoined room ${existingRoomId}`)
            // 发送房间更新（含最新 isOnline 状态）
            socket.emit('room:updated', { room: sanitizeRoom(room) })
            // 同步通知房间内其他成员
            socket.to(existingRoomId).emit('room:updated', { room: sanitizeRoom(room) })

            // 若房间是战斗中，重发 battle:init 让客户端恢复战斗
            if (room.status === 'in_battle') {
                const engine = activeBattles.get(existingRoomId)
                if (engine && engine.battleState) {
                    socket.emit('battle:init', {
                        dungeonId:        room.dungeonId,
                        seed:             engine.battleState.seed,
                        snapshots:        engine.battleState.snapshots,
                        roomId:           existingRoomId,
                        rejoin:           true,
                        currentWaveIndex: engine.battleState.currentWaveIndex || 0,
                    })
                    console.log(`[socket] Resent battle:init to ${socket.user.username} for room ${existingRoomId}`)
                }
            }
        }
    }

    // ── Room events ─────────────────────────────────────
    socket.on('room:create', ({ dungeonId, dungeonName, playerSnapshot }, callback) => {
        const result = roomManager.createRoom(socket.user, dungeonId, dungeonName, playerSnapshot)
        if (result.error) {
            // 如果是 rejoin 情况，将 room 信息一并返回给客户端
            return callback?.({
                error: result.error,
                message: result.message,
                ...(result.rejoin ? { rejoin: true, room: sanitizeRoom(result.room) } : {})
            })
        }
        socket.join(result.room.id)
        io.emit('room:list_updated', roomManager.getRoomList())
        callback?.({ room: sanitizeRoom(result.room) })
    })

    socket.on('room:join', ({ roomId, playerSnapshot }, callback) => {
        const result = roomManager.joinRoom(roomId, socket.user, playerSnapshot)
        if (result.error) {
            // 如果是 rejoin 情况，将原房间信息返回给客户端
            return callback?.({
                error: result.error,
                message: result.message,
                ...(result.rejoin ? { rejoin: true, room: sanitizeRoom(result.room) } : {})
            })
        }
        socket.join(roomId)
        io.to(roomId).emit('room:updated', { room: sanitizeRoom(result.room) })
        io.emit('room:list_updated', roomManager.getRoomList())
        callback?.({ room: sanitizeRoom(result.room) })
    })

    socket.on('room:leave', ({ roomId }, callback) => {
        const result = roomManager.leaveRoom(roomId, socket.user.id)
        if (result.error) {
            return callback?.({ error: result.error, message: result.message })
        }
        socket.leave(roomId)
        if (!result.destroyed) {
            io.to(roomId).emit('room:updated', { room: sanitizeRoom(result.room) })
        }
        io.emit('room:list_updated', roomManager.getRoomList())
        callback?.({ ok: true })
    })

    socket.on('room:list', (_, callback) => {
        callback?.(roomManager.getRoomList())
    })

    socket.on('room:start', ({ roomId }, callback) => {
        const room = roomManager.getRoom(roomId)
        if (!room) {
            return callback?.({ error: 'ROOM_NOT_FOUND', message: '房间不存在' })
        }
        if (room.hostId !== socket.user.id) {
            return callback?.({ error: 'NOT_HOST', message: '只有房主可以开始' })
        }
        const result = roomManager.startBattle(roomId)
        if (result.error) {
            return callback?.({ error: result.error, message: result.message })
        }
        // room:battle_start is already emitted by onRoomStart callback
        io.emit('room:list_updated', roomManager.getRoomList())
        callback?.({ room: sanitizeRoom(result.room) })
    })

    // ── Battle Events (Client → Server / Server → Client) ────────────
    /**
     * WebSocket Event Contracts:
     *
     * battle:init (Server → Client): Broadcast when battle starts
     *   payload: { dungeonId, seed, snapshots, roomId, rejoin?, currentWaveIndex? }
     *
     * battle:update (Client → Server): Client reports battle state updates
     *   payload: { roomId, battleState: { round, monsters[], lastUpdated? } }
     *
     * battle:finished (Client → Server): Client reports battle completion (alias: battle:complete)
     *   payload: { roomId, result: 'victory'|'defeat', dungeonId }
     *
     * battle:restore (Server → Client): Server sends battle state for reconnection
     *   payload: { battleState: { seed, result? }, rewards?: items[] }
     *
     * battle:reward (Server → Client): Server sends player rewards
     *   payload: { userId, items: [] }
     *
     * battle:wave_progress (Client → Server): Client reports wave progress
     *   payload: { roomId, waveIndex, totalWaves }
     */

    // ── 客户端上报波次进度（用于持久化和断线重连恢复）──
    socket.on('battle:wave_progress', ({ roomId, waveIndex, totalWaves }) => {
        const engine = activeBattles.get(roomId)
        if (!engine) return

        // 更新内存中的波次记录
        if (engine.battleState) {
            engine.battleState.currentWaveIndex = waveIndex
            engine.battleState.totalWaves       = totalWaves
        }

        // 持久化到 DB
        stmts.saveBattleState.run(roomId, engine.battleState)
            .catch(err => console.error('[battle] Failed to save wave progress:', err))

        // 广播给同房间其他玩家，让 UI 同步更新
        socket.to(roomId).emit('battle:wave_updated', { waveIndex, totalWaves })
        console.log(`[battle] Wave progress updated: room=${roomId}, wave=${waveIndex}/${totalWaves}`)
    })

    // ── 客户端上报战斗状态更新（怪物位置、血量等）──
    socket.on('battle:update', ({ roomId, battleState }) => {
        const engine = activeBattles.get(roomId)
        const room = roomManager.getRoom(roomId)

        if (!engine || !room || room.status !== 'in_battle') {
            console.warn(`[battle] Ignoring battle:update for room ${roomId}: engine=${!!engine}, room=${!!room}, status=${room?.status}`)
            return
        }

        // 单调递进检查：只接受更新的 round
        if (engine.battleState && battleState.round !== undefined) {
            if (battleState.round <= (engine.battleState.round || 0)) {
                console.warn(`[battle] Rejecting stale battle:update for room ${roomId}: current=${engine.battleState.round}, received=${battleState.round}`)
                return
            }
        }

        // 更新内存中的战斗状态
        if (engine.battleState) {
            engine.battleState = { ...engine.battleState, ...battleState, lastUpdated: new Date().toISOString() }
        } else {
            engine.battleState = { ...battleState, lastUpdated: new Date().toISOString() }
        }

        // 持久化到 DB
        stmts.saveBattleState.run(roomId, engine.battleState)
            .catch(err => console.error('[battle] Failed to save battle state update:', err))

        console.log(`[battle] Battle state updated: room=${roomId}, round=${battleState.round}`)
    })

    // ── 客户端上报战斗结果 ────────────────────────────
    socket.on('battle:complete', ({ roomId, result, dungeonId }) => {
        console.log(`[battle] battle:complete from ${socket.user.username}: room=${roomId}, result=${result}`)

        const engine = activeBattles.get(roomId)
        const room = roomManager.getRoom(roomId)

        if (!engine || !room) {
            console.warn(`[battle] No engine or room found for ${roomId}`)
            return
        }

        // 获取或初始化房间完成状态追踪
        const completionTracking = battleCompletionStatus.get(roomId) || new Map()
        battleCompletionStatus.set(roomId, completionTracking)

        // 记录当前玩家的完成状态
        completionTracking.set(socket.user.id, result)
        console.log(`[battle] Player ${socket.user.username} completed: ${result}, ${completionTracking.size}/${room.players.filter(p => !p.isAI).length} humans completed`)

        // 检查是否所有真人玩家都已完成
        const humanPlayers = room.players.filter(p => !p.isAI && p.userId > 0)
        const completedPlayers = humanPlayers.filter(p => completionTracking.has(p.userId))
        const allCompleted = completedPlayers.length === humanPlayers.length

        if (allCompleted) {
            console.log(`[battle] All human players completed for room ${roomId}, finalizing battle`)

            // 胜利时计算并下发个人掉落（只发给完成战斗的玩家）
            if (result === 'victory') {
                const lootResults = engine.generatePersonalLoot()

                // 持久化奖励到数据库
                stmts.saveRoomRewards.run(roomId, lootResults)
                    .catch(err => console.error('[battle] Failed to persist rewards:', err))

                // 发送奖励给完成的玩家
                for (const [userId, items] of Object.entries(lootResults)) {
                    const playerResult = completionTracking.get(Number(userId))
                    if (playerResult === 'victory') {
                        io.to(roomId).emit('battle:reward', {
                            userId: Number(userId),
                            items,
                        })
                    }
                }
                console.log(`[battle] Loot distributed and persisted for room ${roomId}`)
            }

            // 通知所有客户端服务端结算完成
            io.to(roomId).emit('battle:finished_server', {
                result,
                roomId,
            })

            // 清理战斗状态
            activeBattles.delete(roomId)
            battleCompletionStatus.delete(roomId)

            // 战斗结束后销毁房间，释放所有玩家的 userRoomMap 映射
            if (room) {
                // 让所有 socket 离开 Socket.IO room
                const socketsInRoom = io.sockets.adapter.rooms.get(roomId)
                if (socketsInRoom) {
                    for (const sid of socketsInRoom) {
                        const s = io.sockets.sockets.get(sid)
                        if (s) s.leave(roomId)
                    }
                }
                roomManager._destroyRoom(roomId)
                io.emit('room:list_updated', roomManager.getRoomList())
                console.log(`[battle] Room ${roomId} destroyed after battle`)
            }
        }
        // 注意：只在所有真人玩家都完成后才发送 battle:finished_server
        // 部分玩家完成时不发送，避免UI状态不一致（战斗还在进行但已显示结算）
    })

    // ── Disconnect ──────────────────────────────────────
    socket.on('disconnect', () => {
        console.log(`[socket] disconnected: ${socket.user.username}`)
        const result = roomManager.handleDisconnect(socket.user.id)
        if (result && result.room) {
            io.to(result.room.id).emit('room:updated', { room: sanitizeRoom(result.room) })
            io.emit('room:list_updated', roomManager.getRoomList())

            // If in battle, mark player as offline in engine (for loot eligibility)
            const battleEngine = activeBattles.get(result.room.id)
            if (battleEngine && result.action === 'marked_offline') {
                const unit = battleEngine.party.find(u => u.ownerId === socket.user.id)
                if (unit) unit.isOnline = false
            }
        }
    })
})

// Setup chat
setupChat(io, roomManager, chatManager)
// Global error handler (must be after all routes)
app.use(globalErrorHandler)

/**
 * 服务重启时恢复 in_battle 状态的房间和战斗引擎。
 * 从 DB 读取 battle_state，重建 BattleEngine 以支持断线重连时重发 battle:init。
 */
async function recoverInBattleRooms() {
    let rows
    try {
        rows = await stmts.findInBattleRooms.all()
    } catch (err) {
        console.error('[battle] Failed to query in_battle rooms for recovery:', err)
        return
    }

    let recovered = 0
    for (const row of rows) {
        const battleState = row.battle_state
        if (!battleState) continue

        // 恢复房间到内存
        const room = {
            id:              row.id,
            hostId:          row.host_id,
            dungeonId:       row.dungeon_id,
            dungeonName:     row.dungeon_name,
            status:          'in_battle',
            maxPlayers:      row.max_players,
            players:         Array.isArray(row.players) ? row.players : JSON.parse(row.players || '[]'),
            createdAt:       new Date(row.created_at),
            waitTimer:       null,
            battleStartedAt: row.battle_started_at ? new Date(row.battle_started_at) : null,
        }
        roomManager.rooms.set(row.id, room)

        // 恢复 userRoomMap（只恢复真人玩家）
        for (const p of room.players) {
            if (p.userId > 0) {
                roomManager.userRoomMap.set(p.userId, row.id)
            }
        }

        // 重建 BattleEngine（不重跑战斗，仅用于揔落和重连重发）
        const engine = new BattleEngine(io, row.id, room)
        engine.seed = battleState.seed
        engine.battleState = battleState
        engine.party = (battleState.snapshots || []).map(m => ({
            ...m,
            side: 'player',
            damage: m.stats?.strength || m.stats?.agility || (10 + (m.level || 1) * 2),
            armor: m.stats?.armor || Math.floor((m.level || 1) * 1.5),
            speed: 50,
        }))
        activeBattles.set(row.id, engine)
        // 初始化恢复房间的完成状态追踪
        battleCompletionStatus.set(row.id, new Map())

        recovered++
        console.log(`[battle] Recovered in_battle room ${row.id} (dungeon=${row.dungeon_id})`)
    }

    console.log(`[battle] In-battle room recovery complete: ${recovered} restored.`)
}
// ── Start ───────────────────────────────────────────────────
;(async () => {
    try {
        await loadClassConfigs(stmts)
        await chatManager.loadHistory(stmts)
        await roomManager.recoverRooms(stmts)
        await recoverInBattleRooms()
    } catch (err) {
        console.error('[server] Startup initialization failed:', err)
        process.exit(1)
    }

    httpServer.listen(config.port, '0.0.0.0', () => {
        console.log(`[server] ChickenBro server running on port ${config.port}`)
    })
})()

export { app, httpServer, io, roomManager, chatManager, activeBattles }
