import { v4 as uuidv4 } from 'uuid'
import config from './config.js'
import { DungeonRegistry } from '../src/data/dungeons/DungeonRegistry.js'

/** 合法职业列表 */
const VALID_CLASS_IDS = ['warrior', 'paladin', 'rogue', 'hunter', 'mage', 'warlock', 'priest', 'shaman', 'druid']

/**
 * RoomManager — manages multiplayer rooms in memory.
 *
 * Constructor accepts an optional `options` object:
 *   - timerFn:   replacement for setTimeout  (for testing)
 *   - clearFn:   replacement for clearTimeout (for testing)
 *   - onRoomStart: callback(room) when battle starts
 */
export class RoomManager {
    constructor(options = {}) {
        this.rooms = new Map()          // roomId → Room
        this.userRoomMap = new Map()    // userId → roomId  (quick lookup)

        // Allow dependency injection for timers so tests can control time
        this._setTimeout = options.timerFn || setTimeout
        this._clearTimeout = options.clearFn || clearTimeout
        this._onRoomStart = options.onRoomStart || null

        /** @type {object|null} Statement adapters for DB persistence (optional) */
        this._stmts = options.stmts || null
    }

    // ── Create ──────────────────────────────────────────────
    createRoom(hostUser, dungeonId, dungeonName, playerSnapshot) {
        // Prevent user from being in multiple rooms
        if (this.userRoomMap.has(hostUser.id)) {
            const existingRoomId = this.userRoomMap.get(hostUser.id)
            const existingRoom = this.rooms.get(existingRoomId)

            // 房间已关闭或不存在于内存中（持久化后重启等情况），清理映射后允许创建
            if (!existingRoom || existingRoom.status === 'closed') {
                this.userRoomMap.delete(hostUser.id)
            } else {
                // 房间仍然活跃，通知客户端重新连接该房间
                return { error: 'ALREADY_IN_ROOM', message: '你已经在一个房间中', rejoin: true, room: existingRoom }
            }
        }

        const roomId = uuidv4()
        const room = {
            id: roomId,
            hostId: hostUser.id,
            dungeonId,
            dungeonName: dungeonName || dungeonId,
            status: 'waiting',
            maxPlayers: config.maxPlayersPerRoom,
            players: [
                this._makePlayer(hostUser, true, playerSnapshot),
            ],
            createdAt: new Date(),
            waitTimer: null,
            battleStartedAt: null,
        }

        // Start 2-minute wait timer
        room.waitTimer = this._setTimeout(() => {
            this._onTimeout(roomId)
        }, config.maxRoomWaitTime)

        this.rooms.set(roomId, room)
        this.userRoomMap.set(hostUser.id, roomId)

        // Write-behind: persist room metadata to DB
        if (this._stmts) {
            const playerSnapshots = room.players.map(p => ({
                userId: p.userId, nickname: p.nickname, classId: p.classId, level: p.level
            }))
            this._stmts.insertRoom.run(
                roomId, hostUser.id, dungeonId, room.dungeonName, room.maxPlayers, playerSnapshots
            ).catch(err => console.error('[rooms] Failed to persist room creation:', err))
        }

        return { room }
    }

    // ── Snapshot validation ──────────────────────────────────
    /**
     * 校验玩家快照数据是否合法
     * @param {Object} snapshot - 玩家角色快照
     * @returns {{ valid: boolean, error: string }}
     */
    validateSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') {
            return { valid: false, error: '快照数据缺失' }
        }

        // name 校验
        if (typeof snapshot.name !== 'string' || snapshot.name.length < 1 || snapshot.name.length > 20) {
            return { valid: false, error: '角色名称必须是1-20个字符' }
        }

        // classId 校验
        if (!VALID_CLASS_IDS.includes(snapshot.classId)) {
            return { valid: false, error: `非法职业: ${snapshot.classId}` }
        }

        // level 校验
        if (typeof snapshot.level !== 'number' || snapshot.level < 1 || snapshot.level > 60 || !Number.isInteger(snapshot.level)) {
            return { valid: false, error: '等级必须是1-60的整数' }
        }

        return { valid: true, error: '' }
    }

    // ── Join ────────────────────────────────────────────────
    joinRoom(roomId, user, playerSnapshot) {
        const room = this.rooms.get(roomId)
        if (!room) {
            return { error: 'ROOM_NOT_FOUND', message: '房间不存在' }
        }
        if (room.status !== 'waiting') {
            return { error: 'ROOM_NOT_WAITING', message: '房间已开始或已结束' }
        }
        if (room.players.length >= room.maxPlayers) {
            return { error: 'ROOM_FULL', message: '房间已满' }
        }

        // 检查用户是否已在其他房间中
        const existingRoomId = this.userRoomMap.get(user.id)
        if (existingRoomId && existingRoomId !== roomId) {
            const existingRoom = this.rooms.get(existingRoomId)

            // 原房间已关闭或不存在，清理映射后允许加入新房间
            if (!existingRoom || existingRoom.status === 'closed') {
                this.userRoomMap.delete(user.id)
            } else {
                // 原房间仍活跃，通知客户端重新连接
                return { error: 'ALREADY_IN_ROOM', message: '你已经在一个房间中', rejoin: true, room: existingRoom }
            }
        }

        // 如果用户已在此房间中（断线重连），更新状态而不是重新添加
        const existingPlayer = room.players.find(p => p.userId === user.id)
        if (existingPlayer) {
            existingPlayer.isOnline = true
            return { room, rejoined: true }
        }

        // 校验快照合法性
        if (playerSnapshot) {
            const validation = this.validateSnapshot(playerSnapshot)
            if (!validation.valid) {
                return { error: 'INVALID_SNAPSHOT', message: validation.error }
            }
        }

        // 校验等级是否符合副本要求
        const levelCheck = this._checkLevelRequirement(room.dungeonId, playerSnapshot?.level)
        if (!levelCheck.valid) {
            return { error: 'LEVEL_REQUIREMENT_NOT_MET', message: levelCheck.message }
        }

        const player = this._makePlayer(user, false, playerSnapshot)
        room.players.push(player)
        this.userRoomMap.set(user.id, roomId)

        // Write-behind: update players snapshot in DB
        if (this._stmts) {
            const playerSnapshots = room.players.map(p => ({
                userId: p.userId, nickname: p.nickname, classId: p.classId, level: p.level
            }))
            this._stmts.updateRoomPlayers.run(roomId, playerSnapshots)
                .catch(err => console.error('[rooms] Failed to update room players:', err))
        }

        // If room is now full, start battle immediately
        if (room.players.length >= room.maxPlayers) {
            this._clearTimeout(room.waitTimer)
            room.waitTimer = null
            this._startBattle(room)
        }

        return { room }
    }

    // ── Leave ───────────────────────────────────────────────
    leaveRoom(roomId, userId) {
        const room = this.rooms.get(roomId)
        if (!room) {
            return { error: 'ROOM_NOT_FOUND', message: '房间不存在' }
        }

        const idx = room.players.findIndex(p => p.userId === userId)
        if (idx === -1) {
            return { error: 'NOT_IN_ROOM', message: '你不在该房间中' }
        }

        room.players.splice(idx, 1)
        this.userRoomMap.delete(userId)

        // If nobody left, destroy room
        if (room.players.length === 0) {
            this._destroyRoom(roomId)
            return { room: null, destroyed: true }
        }

        // If the host left, transfer host to first remaining player
        if (room.hostId === userId) {
            const newHost = room.players[0]
            room.hostId = newHost.userId
            newHost.isHost = true
        }

        // Write-behind: update players snapshot in DB
        if (this._stmts) {
            const playerSnapshots = room.players.map(p => ({
                userId: p.userId, nickname: p.nickname, classId: p.classId, level: p.level
            }))
            this._stmts.updateRoomPlayers.run(roomId, playerSnapshots)
                .catch(err => console.error('[rooms] Failed to update room players on leave:', err))
        }

        return { room }
    }

    // ── List (only waiting rooms) ───────────────────────────
    getRoomList() {
        const list = []
        for (const room of this.rooms.values()) {
            if (room.status === 'waiting') {
                list.push({
                    id: room.id,
                    hostId: room.hostId,
                    hostName: room.players[0]?.nickname || 'Unknown',
                    dungeonId: room.dungeonId,
                    dungeonName: room.dungeonName,
                    playerCount: room.players.length,
                    maxPlayers: room.maxPlayers,
                    status: room.status,
                    levelRange: this._getDungeonLevelRange(room.dungeonId),
                    createdAt: room.createdAt,
                })
            }
        }
        return list
    }

    // ── Get dungeon level range ──────────────────────────────
    _getDungeonLevelRange(dungeonId) {
        // Try to find dungeon in DungeonRegistry
        const dungeon = DungeonRegistry[dungeonId]
        if (dungeon?.levelRange) {
            return dungeon.levelRange
        }
        // Check wings
        for (const d of Object.values(DungeonRegistry)) {
            if (d.type === 'multi-wing' && d.wings) {
                const wing = d.wings.find(w => w.id === dungeonId)
                if (wing?.levelRange) {
                    return wing.levelRange
                }
            }
        }
        return null
    }

    // ── Get single room ─────────────────────────────────────
    getRoom(roomId) {
        return this.rooms.get(roomId) || null
    }

    // ── Start battle (public, e.g. host presses start) ─────
    startBattle(roomId) {
        const room = this.rooms.get(roomId)
        if (!room) {
            return { error: 'ROOM_NOT_FOUND', message: '房间不存在' }
        }
        if (room.status !== 'waiting') {
            return { error: 'ROOM_NOT_WAITING', message: '房间已开始或已结束' }
        }

        this._clearTimeout(room.waitTimer)
        room.waitTimer = null
        this._startBattle(room)
        return { room }
    }

    // ── Handle disconnect ───────────────────────────────────
    handleDisconnect(userId) {
        const roomId = this.userRoomMap.get(userId)
        if (!roomId) return null

        const room = this.rooms.get(roomId)
        if (!room) {
            this.userRoomMap.delete(userId)
            return null
        }

        // If room is in battle, mark offline rather than remove
        if (room.status === 'in_battle') {
            const player = room.players.find(p => p.userId === userId)
            if (player) player.isOnline = false
            return { room, action: 'marked_offline' }
        }

        // If waiting, fully remove
        return this.leaveRoom(roomId, userId)
    }

    // ── Internal helpers ────────────────────────────────────

    _makePlayer(user, isHost, snapshot) {
        return {
            userId: user.id,
            nickname: user.nickname || user.username,
            classId: snapshot?.classId || null,
            talent: snapshot?.talent || null,
            level: snapshot?.level || 1,
            role: snapshot?.role || null,
            isHost,
            isOnline: true,
            snapshot: snapshot || null,
        }
    }

    /**
     * 校验玩家等级是否符合副本要求
     * @param {string} dungeonId - 副本ID
     * @param {number} playerLevel - 玩家等级
     * @returns {{ valid: boolean, message: string }}
     */
    _checkLevelRequirement(dungeonId, playerLevel) {
        // 如果没有提供等级，默认通过（后续可强制要求）
        if (playerLevel === undefined || playerLevel === null) {
            return { valid: true, message: '' }
        }

        const dungeon = DungeonRegistry[dungeonId]
        if (!dungeon) {
            // 副本不存在，允许加入（可能是测试副本）
            return { valid: true, message: '' }
        }

        const { levelRange } = dungeon
        if (!levelRange) {
            // 副本没有等级限制，允许加入
            return { valid: true, message: '' }
        }

        const { min, max } = levelRange
        if (playerLevel < min || playerLevel > max) {
            return {
                valid: false,
                message: `等级不符合要求，需要 Lv.${min}-${max}`
            }
        }

        return { valid: true, message: '' }
    }

    _startBattle(room) {
        room.status = 'in_battle'
        room.battleStartedAt = new Date()

        // Write-behind: update room status to in_battle
        if (this._stmts) {
            this._stmts.updateRoomStatus.run(
                room.id, 'in_battle', { battle_started_at: room.battleStartedAt }
            ).catch(err => console.error('[rooms] Failed to update room status to in_battle:', err))
        }

        // Fill remaining slots with AI players
        let aiIndex = 1
        while (room.players.length < room.maxPlayers) {
            room.players.push({
                userId: -aiIndex,            // negative IDs for AI
                nickname: `AI冒险者${aiIndex}`,
                classId: 'warrior',
                talent: null,
                level: 1,
                role: 'dps',
                isHost: false,
                isOnline: true,
                isAI: true,
                snapshot: null,
            })
            aiIndex++
        }

        if (this._onRoomStart) {
            this._onRoomStart(room)
        }
    }

    _onTimeout(roomId) {
        const room = this.rooms.get(roomId)
        if (!room || room.status !== 'waiting') return

        room.waitTimer = null
        this._startBattle(room)
    }

    _destroyRoom(roomId) {
        const room = this.rooms.get(roomId)
        if (room) {
            if (room.waitTimer) {
                this._clearTimeout(room.waitTimer)
            }
            // Clean up user mappings
            for (const p of room.players) {
                this.userRoomMap.delete(p.userId)
            }

            // Write-behind: mark room as closed
            if (this._stmts) {
                this._stmts.updateRoomStatus.run(
                    roomId, 'closed', { closed_at: new Date() }
                ).catch(err => console.error('[rooms] Failed to update room status to closed:', err))
            }

            this.rooms.delete(roomId)
        }
    }

    /**
     * 服务启动时从数据库恢复 waiting 状态的房间。
     * 未超过 maxRoomWaitTime 的房间恢复到内存并重启剩余 waitTimer；
     * 超时的房间直接标记为 closed。
     * @param {object} stmts
     * @param {number} maxWaitMs - 最大等待时间（毫秒），默认与 config 一致
     */
    async recoverRooms(stmts, maxWaitMs = 2 * 60 * 1000) {
        let rows
        try {
            rows = await stmts.findWaitingRooms.all()
        } catch (err) {
            console.error('[rooms] Failed to query waiting rooms for recovery:', err)
            return
        }

        const now = Date.now()
        let recovered = 0
        let expired = 0

        for (const row of rows) {
            const createdAt = new Date(row.created_at).getTime()
            const elapsed = now - createdAt
            const remaining = maxWaitMs - elapsed

            if (remaining <= 0) {
                // 已超期，标记为 closed
                stmts.updateRoomStatus.run(row.id, 'closed', { closed_at: new Date() })
                    .catch(err => console.error('[rooms] Failed to close expired room:', err))
                expired++
                continue
            }

            // 恢复到内存
            const room = {
                id:              row.id,
                hostId:          row.host_id,
                dungeonId:       row.dungeon_id,
                dungeonName:     row.dungeon_name,
                status:          'waiting',
                maxPlayers:      row.max_players,
                players:         Array.isArray(row.players) ? row.players : JSON.parse(row.players || '[]'),
                createdAt:       new Date(row.created_at),
                waitTimer:       null,
                battleStartedAt: null,
            }

            // 重启剩余时间的 waitTimer
            room.waitTimer = this._setTimeout(() => {
                this._onTimeout(row.id)
            }, remaining)

            this.rooms.set(row.id, room)
            // 恢复 userRoomMap
            for (const p of room.players) {
                if (p.userId > 0) {
                    this.userRoomMap.set(p.userId, row.id)
                }
            }
            recovered++
        }

        console.log(`[rooms] Recovery complete: ${recovered} restored, ${expired} expired.`)
    }
}
