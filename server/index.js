import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

import config from './config.js'
import { getDb, getStatements } from './db.js'
import { createAuthRouter } from './auth.js'
import { createCharactersRouter } from './characters.js'
import { authenticateToken, authenticateSocket } from './middleware.js'
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
app.get('/api/me', authenticateToken, (req, res) => {
    const user = stmts.findUserById.get(req.user.id)
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
const chatManager = new ChatManager()

/** @type {Map<string, BattleEngine>} roomId → BattleEngine (kept for loot generation) */
const activeBattles = new Map()

/** @type {Map<string, boolean>} roomId → whether first battle:complete received */
const battleCompleteReceived = new Map()

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

    // 保存BattleEngine实例用于后续掉落计算
    const engine = new BattleEngine(io, room.id, room)
    engine.seed = seed
    engine.party = partySnapshots.map(m => ({
        ...m,
        side: 'player',
        damage: m.stats?.strength || m.stats?.agility || (10 + (m.level || 1) * 2),
        armor: m.stats?.armor || Math.floor((m.level || 1) * 1.5),
        speed: 50,
    }))
    activeBattles.set(room.id, engine)
    battleCompleteReceived.set(room.id, false)

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
        if (room) {
            socket.join(existingRoomId)
            console.log(`[socket] ${socket.user.username} rejoined room ${existingRoomId}`)
            // 发送房间更新
            socket.emit('room:updated', { room: sanitizeRoom(room) })
        }
    }

    // ── Room events ─────────────────────────────────────
    socket.on('room:create', ({ dungeonId, dungeonName, playerSnapshot }, callback) => {
        const result = roomManager.createRoom(socket.user, dungeonId, dungeonName, playerSnapshot)
        if (result.error) {
            return callback?.({ error: result.error, message: result.message })
        }
        socket.join(result.room.id)
        io.emit('room:list_updated', roomManager.getRoomList())
        callback?.({ room: sanitizeRoom(result.room) })
    })

    socket.on('room:join', ({ roomId, playerSnapshot }, callback) => {
        const result = roomManager.joinRoom(roomId, socket.user, playerSnapshot)
        if (result.error) {
            return callback?.({ error: result.error, message: result.message })
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

    // ── 客户端上报战斗结果 ────────────────────────────
    socket.on('battle:complete', ({ roomId, result, dungeonId }) => {
        console.log(`[battle] battle:complete from ${socket.user.username}: room=${roomId}, result=${result}`)

        // 以第一个收到的结果为准
        if (battleCompleteReceived.get(roomId)) {
            console.log(`[battle] Duplicate battle:complete for room ${roomId}, ignoring`)
            return
        }
        battleCompleteReceived.set(roomId, true)

        const engine = activeBattles.get(roomId)
        if (!engine) {
            console.warn(`[battle] No engine found for room ${roomId}`)
            return
        }

        engine.result = result
        engine.finished = true

        // 胜利时计算并下发个人掉落
        if (result === 'victory') {
            const lootResults = engine.generatePersonalLoot()
            for (const [userId, items] of Object.entries(lootResults)) {
                io.to(roomId).emit('battle:loot', {
                    userId: Number(userId),
                    items,
                })
            }
            console.log(`[battle] Loot distributed for room ${roomId}`)
        }

        // 通知所有客户端服务端结算完成
        io.to(roomId).emit('battle:finished_server', {
            result,
            roomId,
        })

        // 清理战斗状态
        activeBattles.delete(roomId)
        battleCompleteReceived.delete(roomId)

        // 战斗结束后销毁房间，释放所有玩家的 userRoomMap 映射
        const room = roomManager.getRoom(roomId)
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

// ── Start ───────────────────────────────────────────────────
httpServer.listen(config.port, '0.0.0.0', () => {
    console.log(`[server] ChickenBro server running on port ${config.port}`)
})

export { app, httpServer, io, roomManager, chatManager, activeBattles }
