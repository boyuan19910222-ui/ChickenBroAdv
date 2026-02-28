/**
 * ChickenBro Server Entry Point
 *
 * 职责：
 *   - 应用初始化（Express, Socket.IO）
 *   - 中间件挂载
 *   - 路由挂载
 *   - Socket 事件注册
 *   - 服务启动
 *
 * 详细实现位于：
 *   - routes/        HTTP 路由定义
 *   - middleware/    Express 中间件
 *   - services/      业务逻辑服务
 *   - sockets/       Socket.IO 事件处理
 *   - models/        数据库模型
 *   - utils/         工具函数
 */
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

import config from './config.js'
import { getDb, getStatements } from './utils/db.js'
import { createRouter } from './routes/index.js'
import { loadClassConfigs } from './routes/client/characters.js'
import { authenticateSocket, globalErrorHandler } from './middleware/index.js'
import { registerSocketHandlers } from './sockets/index.js'
import { RoomManager } from './services/RoomManager.js'
import { ChatManager, setupChat } from './services/ChatService.js'
import { BattleEngine } from './services/BattleEngine.js'
import { generateWaves } from './services/WaveGenerator.js'
import { DungeonRegistry } from '../src/data/dungeons/DungeonRegistry.js'
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

// Mount API routes
// Client API: /api/v1/* (auth, characters, etc.)
// Admin API:  /api/admin/* (reserved for future use)
app.use('/api', createRouter(stmts))

// Protected /me endpoint
app.get('/api/v1/me', async (req, res, next) => {
    try {
        const { authenticateToken } = await import('./middleware/index.js')
        authenticateToken(req, res, async (err) => {
            if (err) return next(err)
            const user = await stmts.findUserById.get(req.user.id)
            if (!user) {
                return res.status(404).json({ error: 'USER_NOT_FOUND', message: '用户不存在' })
            }
            res.json({ user })
        })
    } catch (err) {
        next(err)
    }
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

// ── Services ────────────────────────────────────────────────
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

    const seed = Date.now()

    const humanPlayers = room.players.filter(p => !p.isAI)
    const { members: partySnapshots } = PartyFormationSystem.generateMultiplayerParty(
        humanPlayers, room.dungeonId, dungeonMeta
    )

    const engine = new BattleEngine(io, room.id, room)
    engine.seed = seed
    engine.party = partySnapshots.map(m => ({
        ...m,
        side: 'player',
        damage: m.stats?.strength || m.stats?.agility || (10 + (m.level || 1) * 2),
        armor: m.stats?.armor || Math.floor((m.level || 1) * 1.5),
        speed: 50,
    }))

    let waves
    try {
        waves = await generateWaves(room.dungeonId)
    } catch (err) {
        console.error(`[battle] generateWaves failed for room ${room.id}:`, err)
        io.to(room.id).emit('battle:error', { message: '波次数据生成失败: ' + err.message })
        return
    }

    engine.battleState = { seed, snapshots: partySnapshots, waves, currentWaveIndex: 0 }
    activeBattles.set(room.id, engine)
    const completionTracking = new Map()
    battleCompletionStatus.set(room.id, completionTracking)

    stmts.saveBattleState.run(room.id, { seed, snapshots: partySnapshots, waves, currentWaveIndex: 0 })
        .catch(err => console.error('[battle] Failed to save battle state:', err))

    io.to(room.id).emit('battle:init', {
        dungeonId: room.dungeonId,
        seed,
        snapshots: partySnapshots,
        roomId: room.id,
        waves,
    })

    console.log(`[battle] Launched battle:init for room ${room.id}, dungeon=${room.dungeonId}, seed=${seed}, party=${partySnapshots.length}, waves=${waves.length}`)
}

// Room manager — hook into battle start
const roomManager = new RoomManager({
    stmts,
    io,
    onRoomStart(room) {
        io.to(room.id).emit('room:battle_start', { room: sanitizeRoom(room) })
        launchBattle(room).catch(err => {
            console.error(`[battle] launchBattle failed for room ${room.id}:`, err)
            io.to(room.id).emit('battle:error', { message: '战斗初始化失败: ' + err.message })
        })
    },
})

/**
 * Strip non-serializable fields before sending room to clients
 */
function sanitizeRoom(room) {
    if (!room) return room
    const { waitTimer, ...safe } = room
    return safe
}

// Register all socket handlers
registerSocketHandlers(io, {
    roomManager,
    activeBattles,
    battleCompletionStatus,
    stmts,
    chatManager,
})

// Setup chat
setupChat(io, roomManager, chatManager)

// Global error handler (must be after all routes)
app.use(globalErrorHandler)

/**
 * 服务重启时恢复 in_battle 状态的房间和战斗引擎。
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

        for (const p of room.players) {
            if (p.userId > 0) {
                roomManager.userRoomMap.set(p.userId, row.id)
            }
        }

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
