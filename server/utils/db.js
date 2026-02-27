/**
 * db.js — Database access layer (MySQL + Sequelize ORM)
 *
 * Public API is intentionally kept identical to the old better-sqlite3 version
 * so that callers only need to add `await` — no structural changes required.
 *
 * Statement adapter shape:
 *   stmts.<name>.get(...args)  → Promise<row | undefined>
 *   stmts.<name>.run(...args)  → Promise<{ changes: number, lastInsertRowid: number }>
 *   stmts.<name>.all(...args)  → Promise<row[]>
 */

import { Op } from 'sequelize'
import { sequelize, User, Character, BattleRecord, ChatMessage, ClassConfig, Room } from '../models/index.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a Sequelize model instance (or null) to a plain object or undefined. */
function toPlain(instance) {
    if (instance == null) return undefined
    return instance.get({ plain: true })
}

/** Map an array of instances to plain objects. */
function toPlainArray(instances) {
    return instances.map(toPlain)
}

/**
 * Build a statement-adapter object whose keys match the old prepareStatements()
 * return value exactly. Each adapter exposes .get() / .run() / .all() as async
 * methods so callers can await them directly.
 */
export function buildStatementAdapters() {
    return {
        // ── User adapters ─────────────────────────────────────────────────────

        insertUser: {
            async run(username, passwordHash, nickname) {
                const row = await User.create({ username, password_hash: passwordHash, nickname })
                return { changes: 1, lastInsertRowid: row.id }
            },
        },

        findUserByUsername: {
            async get(username) {
                const row = await User.findOne({ where: { username } })
                return toPlain(row)
            },
        },

        findUserById: {
            async get(id) {
                const row = await User.findOne({
                    where:      { id },
                    attributes: ['id', 'username', 'nickname', 'created_at', 'last_login', 'auto_login'],
                })
                return toPlain(row)
            },
        },

        updateLastLogin: {
            async run(id) {
                const [changes] = await User.update(
                    { last_login: new Date() },
                    { where: { id } }
                )
                return { changes }
            },
        },

        updateAutoLogin: {
            async run(value, id) {
                const [changes] = await User.update(
                    { auto_login: value },
                    { where: { id } }
                )
                return { changes }
            },
        },

        // ── Character adapters ────────────────────────────────────────────────

        insertCharacter: {
            async run(userId, name, className, level, gameState) {
                // Enforce the 5-character-per-user limit at the application layer
                const count = await Character.count({ where: { user_id: userId } })
                if (count >= 5) {
                    throw new Error('Character limit reached (max 5)')
                }
                const row = await Character.create({
                    user_id:       userId,
                    name,
                    class:         className,
                    level,
                    game_state:    gameState,
                    last_played_at: new Date(),
                })
                return { changes: 1, lastInsertRowid: row.id }
            },
        },

        findCharactersByUserId: {
            async all(userId) {
                const rows = await Character.findAll({
                    where:      { user_id: userId },
                    attributes: ['id', 'user_id', 'name', 'class', 'level',
                                 'created_at', 'updated_at', 'last_played_at'],
                    order:      [['last_played_at', 'DESC']],
                })
                return toPlainArray(rows)
            },
        },

        findCharacterById: {
            async get(id) {
                const row = await Character.findOne({ where: { id } })
                return toPlain(row)
            },
        },

        findCharacterByIdAndUserId: {
            async get(id, userId) {
                const row = await Character.findOne({
                    where: { id, user_id: userId },
                })
                return toPlain(row)
            },
        },

        updateCharacter: {
            async run(name, className, level, gameState, id) {
                const [changes] = await Character.update(
                    {
                        name,
                        class:          className,
                        level,
                        game_state:     gameState,
                        updated_at:    new Date(),
                        last_played_at: new Date(),
                    },
                    { where: { id } }
                )
                return { changes }
            },
        },

        updateCharacterGameState: {
            async run(gameState, level, id) {
                const [changes] = await Character.update(
                    {
                        game_state:     gameState,
                        level,
                        updated_at:    new Date(),
                        last_played_at: new Date(),
                    },
                    { where: { id } }
                )
                return { changes }
            },
        },

        deleteCharacter: {
            async run(id, userId) {
                const changes = await Character.destroy({
                    where: { id, user_id: userId },
                })
                return { changes }
            },
        },

        countCharactersByUserId: {
            async get(userId) {
                const count = await Character.count({ where: { user_id: userId } })
                return { count }
            },
        },

        // ── BattleRecord adapters ─────────────────────────────────────────────

        insertBattleRecord: {
            async run(userId, dungeonId, result, duration) {
                const row = await BattleRecord.create({
                    user_id:    userId,
                    dungeon_id: dungeonId,
                    result,
                    duration,
                })
                return { changes: 1, lastInsertRowid: row.id }
            },
        },

        getBattleRecords: {
            async all(userId) {
                const rows = await BattleRecord.findAll({
                    where: { user_id: userId },
                    order: [['created_at', 'DESC']],
                })
                return toPlainArray(rows)
            },
        },

        // ── ChatMessage adapters ──────────────────────────────────────────────

        insertChatMessage: {
            async run(userId, nickname, content, type, roomId, timestamp) {
                const row = await ChatMessage.create({
                    user_id:   userId,
                    nickname,
                    content,
                    type,
                    room_id:   roomId || null,
                    timestamp: timestamp || Date.now(),
                })
                return { changes: 1, lastInsertRowid: row.id }
            },
        },

        getLobbyHistory: {
            async all(limit = 50) {
                const rows = await ChatMessage.findAll({
                    where: { type: 'lobby' },
                    order: [['created_at', 'DESC']],
                    limit,
                })
                // Return in ascending order (oldest first)
                return toPlainArray(rows).reverse()
            },
        },

        // ── ClassConfig adapters ──────────────────────────────────────────────

        findAllClassConfigs: {
            async all() {
                const rows = await ClassConfig.findAll({ order: [['class_id', 'ASC']] })
                return toPlainArray(rows)
            },
        },

        upsertClassConfig: {
            async run(classId, data) {
                const [row, created] = await ClassConfig.upsert({
                    class_id:         classId,
                    name:             data.name,
                    base_stats:       data.baseStats,
                    growth_per_level: data.growthPerLevel,
                    base_skills:      data.baseSkills,
                    resource_type:    data.resourceType,
                    resource_max:     data.resourceMax,
                    updated_at:       new Date(),
                })
                return { changes: 1, lastInsertRowid: row.id, created }
            },
        },

        // ── Room adapters ─────────────────────────────────────────────────────

        insertRoom: {
            async run(id, hostId, dungeonId, dungeonName, maxPlayers, players) {
                await Room.create({
                    id,
                    host_id:      hostId,
                    dungeon_id:   dungeonId,
                    dungeon_name: dungeonName,
                    status:       'waiting',
                    max_players:  maxPlayers,
                    players:      players || [],
                })
                return { changes: 1 }
            },
        },

        updateRoomPlayers: {
            async run(roomId, players) {
                const [changes] = await Room.update(
                    { players },
                    { where: { id: roomId } }
                )
                return { changes }
            },
        },

        updateRoomStatus: {
            async run(roomId, status, extra = {}) {
                const [changes] = await Room.update(
                    { status, ...extra },
                    { where: { id: roomId } }
                )
                return { changes }
            },
        },

        findWaitingRooms: {
            async all() {
                const rows = await Room.findAll({
                    where: { status: 'waiting' },
                    order: [['created_at', 'ASC']],
                })
                return toPlainArray(rows)
            },
        },

        findInBattleRooms: {
            async all() {
                const rows = await Room.findAll({
                    where: { status: 'in_battle' },
                    order: [['battle_started_at', 'ASC']],
                })
                return toPlainArray(rows)
            },
        },

        saveBattleState: {
            async run(roomId, battleState) {
                const [changes] = await Room.update(
                    { battle_state: battleState },
                    { where: { id: roomId } }
                )
                return { changes }
            },
        },

        getBattleState: {
            async get(roomId) {
                const row = await Room.findOne({
                    where: { id: roomId },
                    attributes: ['battle_state'],
                })
                return row?.battle_state || null
            },
        },

        saveRoomRewards: {
            async run(roomId, rewards) {
                const [changes] = await Room.update(
                    { rewards },
                    { where: { id: roomId } }
                )
                return { changes }
            },
        },

        getRoomRewards: {
            async get(roomId) {
                const row = await Room.findOne({
                    where: { id: roomId },
                    attributes: ['rewards'],
                })
                return row?.rewards || null
            },
        },

        findRoomById: {
            async get(roomId) {
                const row = await Room.findOne({
                    where: { id: roomId },
                })
                return toPlain(row)
            },
        },
    }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

let _stmts = null

export function getStatements() {
    if (!_stmts) {
        _stmts = buildStatementAdapters()
    }
    return _stmts
}

/**
 * Returns the raw Sequelize instance (replaces old getDb()).
 * Prefer getStatements() for data access; use this only for transactions.
 */
export function getDb() {
    return sequelize
}

export async function closeDb() {
    _stmts = null
    await sequelize.close()
}

/**
 * Health check — runs a lightweight query and reports connectivity.
 * Returns { ok: true } or { ok: false, error: string }.
 */
export async function checkDbHealth() {
    try {
        await sequelize.authenticate()
        return { ok: true }
    } catch (err) {
        return { ok: false, error: err.message }
    }
}

// ── Legacy exports kept for test-layer migration path ─────────────────────────
// TODO (task 7.2): remove once tests are updated to use buildStatementAdapters()

export function createDatabase() {
    // No-op in MySQL mode; returns the sequelize instance for compatibility.
    return sequelize
}

export function prepareStatements() {
    return buildStatementAdapters()
}
