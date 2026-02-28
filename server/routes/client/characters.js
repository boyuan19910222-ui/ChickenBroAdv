import { Router } from 'express'
import { authenticateToken } from '../../middleware/index.js'

// ── 运行时职业配置缓存（由 loadClassConfigs 初始化） ───────────────────────────────
let _classConfigs = null  // classId → config

/**
 * 返回指定职业的配置。必须在 loadClassConfigs() 之后调用。
 * @param {string} classId
 * @returns {object}
 */
export function getClassConfig(classId) {
    if (!_classConfigs) {
        throw new Error('Class configs not loaded. Call loadClassConfigs(stmts) first.')
    }
    return _classConfigs[classId]
}

/**
 * 从数据库加载全部职业配置到模块缓存。
 * 服务启动时在 app.listen 前调用一次。
 * @param {object} stmts
 */
export async function loadClassConfigs(stmts) {
    const rows = await stmts.findAllClassConfigs.all()
    if (!rows || rows.length === 0) {
        throw new Error('[characters] class_configs table is empty. Run seed migration first.')
    }
    const map = {}
    for (const row of rows) {
        map[row.class_id] = {
            name:            row.name,
            baseStats:       row.base_stats,
            growthPerLevel:  row.growth_per_level,
            baseSkills:      row.base_skills,
            resourceType:    row.resource_type,
            resourceMax:     row.resource_max,
        }
    }
    _classConfigs = map
    console.log(`[characters] Loaded ${rows.length} class configs from DB.`)
}

/**
 * 线上重新加载职业配置，无需重启进程（防展用）。
 * @param {object} stmts
 */
export async function reloadClassConfigs(stmts) {
    await loadClassConfigs(stmts)
    console.log('[characters] Class configs reloaded.')
}

// Legacy placeholder — will be superseded by DB data at runtime
const CLASS_CONFIG = {
    warrior: {
        name: '战士',
        baseStats: { health: 180, mana: 30, strength: 15, agility: 8, intellect: 5, stamina: 8, spirit: 5 },
        growthPerLevel: { health: 15, mana: 3, strength: 3, agility: 1, intellect: 1, stamina: 0.5, spirit: 1 },
        baseSkills: ['heroicStrike', 'charge', 'rend', 'battleShout'],
        resourceType: 'rage',
        resourceMax: 100
    },
    paladin: {
        name: '圣骑士',
        baseStats: { health: 165, mana: 70, strength: 14, agility: 6, intellect: 10, stamina: 7, spirit: 10 },
        growthPerLevel: { health: 14, mana: 7, strength: 2, agility: 1, intellect: 2, stamina: 0.4, spirit: 2 },
        baseSkills: ['crusaderStrike', 'sealOfJustice', 'judgement', 'holyLight'],
        resourceType: 'mana',
        resourceMax: 70
    },
    hunter: {
        name: '猎人',
        baseStats: { health: 90, mana: 60, strength: 8, agility: 16, intellect: 6, stamina: 9, spirit: 8 },
        growthPerLevel: { health: 11, mana: 6, strength: 1, agility: 3, intellect: 1, stamina: 0.2, spirit: 1 },
        baseSkills: ['arcaneShot', 'serpentSting', 'huntersMark', 'summonPet'],
        resourceType: 'mana',
        resourceMax: 60
    },
    rogue: {
        name: '盗贼',
        baseStats: { health: 80, mana: 50, strength: 10, agility: 18, intellect: 5, stamina: 6, spirit: 6 },
        growthPerLevel: { health: 10, mana: 5, strength: 2, agility: 3, intellect: 1, stamina: 0.2, spirit: 0.5 },
        baseSkills: ['shadowStrike', 'eviscerate', 'stealth', 'backstab'],
        resourceType: 'energy',
        resourceMax: 100
    },
    priest: {
        name: '牧师',
        baseStats: { health: 70, mana: 90, strength: 4, agility: 5, intellect: 16, stamina: 5, spirit: 12 },
        growthPerLevel: { health: 9, mana: 9, strength: 0.5, agility: 0.5, intellect: 3, stamina: 0.2, spirit: 2 },
        baseSkills: ['smite', 'heal', 'powerWordShield', 'shadowWordPain'],
        resourceType: 'mana',
        resourceMax: 90
    },
    shaman: {
        name: '萨满祭司',
        baseStats: { health: 85, mana: 80, strength: 10, agility: 8, intellect: 14, stamina: 7, spirit: 10 },
        growthPerLevel: { health: 11, mana: 8, strength: 1, agility: 1, intellect: 2, stamina: 0.3, spirit: 1.5 },
        baseSkills: ['lightningBolt', 'healingWave', 'earthShock', 'searingTotem'],
        resourceType: 'mana',
        resourceMax: 80
    },
    mage: {
        name: '法师',
        baseStats: { health: 60, mana: 100, strength: 3, agility: 5, intellect: 18, stamina: 4, spirit: 12 },
        growthPerLevel: { health: 8, mana: 10, strength: 0.5, agility: 0.5, intellect: 3, stamina: 0.2, spirit: 2 },
        baseSkills: ['fireball', 'frostbolt', 'arcaneMissiles', 'iceBlock'],
        resourceType: 'mana',
        resourceMax: 100
    },
    warlock: {
        name: '术士',
        baseStats: { health: 70, mana: 95, strength: 4, agility: 5, intellect: 17, stamina: 6, spirit: 11 },
        growthPerLevel: { health: 9, mana: 10, strength: 0.5, agility: 0.5, intellect: 3, stamina: 0.3, spirit: 1.5 },
        baseSkills: ['shadowBolt', 'corruption', 'curseOfAgony', 'summonImp'],
        resourceType: 'mana',
        resourceMax: 95
    },
    druid: {
        name: '德鲁伊',
        baseStats: { health: 85, mana: 75, strength: 9, agility: 10, intellect: 12, stamina: 8, spirit: 11 },
        growthPerLevel: { health: 11, mana: 8, strength: 1.5, agility: 1, intellect: 2, stamina: 0.4, spirit: 1.5 },
        baseSkills: ['wrath', 'healingTouch', 'rejuvenation', 'moonfire'],
        resourceType: 'mana',
        resourceMax: 75
    }
}

// 经验值表（与 GameData.js 保持一致）
function generateExpTable() {
    const table = [0] // index 0 unused
    for (let L = 1; L <= 59; L++) {
        if (L < 20)      table[L] = 200 + 40 * (L - 1)
        else if (L < 40) table[L] = 1500 + 200 * (L - 20)
        else if (L < 55) table[L] = 7000 + 700 * (L - 40)
        else             table[L] = 18000 + 1200 * (L - 55)
    }
    return table
}
const EXP_TABLE = generateExpTable()

// 有效职业列表（保留静态列表作为备用，运行时会从 _classConfigs 动态读取）
const VALID_CLASSES = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']

// 最大角色数量
const MAX_CHARACTERS_PER_USER = 5

// 角色名验证正则
const CHARACTER_NAME_RE = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,12}$/

/**
 * 创建初始游戏状态
 * @param {string} name - 角色名
 * @param {string} characterClass - 职业ID
 * @returns {object} 初始游戏状态
 */
function createInitialGameState(name, characterClass) {
    // Use DB-loaded config if available, fall back to hardcoded for tests/startup
    let config
    try {
        config = getClassConfig(characterClass)
    } catch {
        config = CLASS_CONFIG[characterClass]
    }
    if (!config) {
        throw new Error(`Invalid character class: ${characterClass}`)
    }

    const { baseStats, baseSkills, resourceType, resourceMax, growthPerLevel } = config

    // 计算初始血量: baseHealth + (stamina × 30) + (level × 15)
    const baseHealth = baseStats.health
    const stamina = baseStats.stamina || 0
    const level = 1
    const calculatedHealth = baseHealth + (stamina * 30) + (level * 15)

    // 生成角色ID
    const characterId = 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    return {
        player: {
            id: characterId,
            name,
            class: characterClass,
            classId: characterClass,
            className: config.name,
            isPlayer: true,
            level: 1,
            experience: 0,
            experienceToNext: EXP_TABLE[1], // 200
            baseStats: { ...baseStats },
            stats: { ...baseStats, health: calculatedHealth },
            currentHp: calculatedHealth,
            maxHp: calculatedHealth,
            resource: {
                type: resourceType,
                current: resourceType === 'mana' ? baseStats.mana : 0,
                max: resourceMax,
                baseMax: resourceMax
            },
            currentMana: baseStats.mana,
            maxMana: baseStats.mana,
            equipment: {
                head: null, shoulders: null, chest: null, legs: null,
                hands: null, wrists: null, waist: null, feet: null,
                back: null, neck: null, finger1: null, finger2: null,
                trinket1: null, trinket2: null, mainHand: null, offHand: null,
            },
            inventory: [],
            skills: [...baseSkills],
            skillCooldowns: {},
            talents: {},
            buffs: [],
            debuffs: [],
            statistics: {
                monstersKilled: 0,
                damageDealt: 0,
                damageTaken: 0,
                healingDone: 0,
                goldEarned: 0,
                questsCompleted: 0
            },
            gold: 100,
            comboPoints: characterClass === 'rogue' ? { current: 0, max: 5 } : null,
            activePet: null,
            createdAt: new Date().toISOString(),
        },
        quest: {
            activeQuests: [],
            completedQuests: []
        },
        exploration: {
            currentArea: 'forest',
            discoveredAreas: ['forest']
        }
    }
}

/**
 * Create the characters router.
 * Accepts a `stmts` object (prepared statements) so tests can inject in-memory DB.
 */
export function createCharactersRouter(stmts) {
    const router = Router()

    // All character routes require authentication
    router.use(authenticateToken)

    // ── GET /api/characters ─────────────────────────────
    // 获取角色列表
    router.get('/', async (req, res) => {
        try {
            const userId = req.user.id
            const characters = await stmts.findCharactersByUserId.all(userId)

            // 返回简化的角色信息（不包含完整 game_state）
            const result = characters.map(char => ({
                id: char.id,
                name: char.name,
                class: char.class,
                level: char.level,
                created_at: char.created_at,
                last_played_at: char.last_played_at
            }))

            return res.json({ characters: result })
        } catch (err) {
            console.error('[characters/list]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── GET /api/characters/:id ─────────────────────────────
    // 获取单个角色
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params
            const userId = req.user.id

            // 验证角色归属
            const character = await stmts.findCharacterByIdAndUserId.get(id, userId)
            if (!character) {
                return res.status(404).json({ error: 'NOT_FOUND', message: '角色不存在' })
            }

            // 解析 game_state
            let gameState
            try {
                gameState = JSON.parse(character.game_state)
            } catch (parseErr) {
                console.error('[characters/get] Failed to parse game_state:', parseErr)
                gameState = {}
            }

            // 返回完整角色信息
            return res.json({
                character: {
                    id: character.id,
                    user_id: character.user_id,
                    name: character.name,
                    class: character.class,
                    level: character.level,
                    game_state: gameState,
                    created_at: character.created_at,
                    updated_at: character.updated_at,
                    last_played_at: character.last_played_at
                }
            })
        } catch (err) {
            console.error('[characters/get]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── POST /api/characters ─────────────────────────────
    // 创建角色
    router.post('/', async (req, res) => {
        try {
            const userId = req.user.id
            const { name, class: characterClass } = req.body || {}

            // 验证角色名
            if (!name || !CHARACTER_NAME_RE.test(name)) {
                return res.status(400).json({
                    error: 'INVALID_NAME',
                    message: '角色名须为2-12位中文、字母、数字或下划线'
                })
            }

            // 验证职业
            if (!characterClass || !VALID_CLASSES.includes(characterClass)) {
                return res.status(400).json({
                    error: 'INVALID_CLASS',
                    message: '无效的职业类型'
                })
            }

            // 检查角色数量限制
            const countResult = await stmts.countCharactersByUserId.get(userId)
            if (countResult.count >= MAX_CHARACTERS_PER_USER) {
                return res.status(400).json({
                    error: 'CHARACTER_LIMIT_REACHED',
                    message: `每个账号最多只能创建${MAX_CHARACTERS_PER_USER}个角色`
                })
            }

            // 创建初始游戏状态
            const gameState = createInitialGameState(name, characterClass)

            // 插入数据库
            const result = await stmts.insertCharacter.run(
                userId,
                name,
                characterClass,
                1, // level
                JSON.stringify(gameState)
            )

            const characterId = result.lastInsertRowid

            // 返回新创建的角色
            return res.status(201).json({
                character: {
                    id: characterId,
                    name,
                    class: characterClass,
                    level: 1,
                    game_state: gameState,
                    created_at: new Date().toISOString(),
                    last_played_at: new Date().toISOString()
                }
            })
        } catch (err) {
            console.error('[characters/create]', err)

            // 处理数据库触发器抛出的角色数量限制错误
            if (err.message && err.message.includes('Character limit reached')) {
                return res.status(400).json({
                    error: 'CHARACTER_LIMIT_REACHED',
                    message: `每个账号最多只能创建${MAX_CHARACTERS_PER_USER}个角色`
                })
            }

            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── PUT /api/characters/:id ─────────────────────────────
    // 更新角色（存档同步）
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params
            const userId = req.user.id
            const { game_state, level } = req.body || {}

            // 验证角色归属
            const character = await stmts.findCharacterByIdAndUserId.get(id, userId)
            if (!character) {
                return res.status(404).json({ error: 'NOT_FOUND', message: '角色不存在' })
            }

            // 验证 game_state
            if (!game_state) {
                return res.status(400).json({
                    error: 'MISSING_GAME_STATE',
                    message: '缺少游戏状态数据'
                })
            }

            // 解析 game_state（如果传入的是字符串）
            let gameStateStr
            if (typeof game_state === 'string') {
                gameStateStr = game_state
            } else {
                gameStateStr = JSON.stringify(game_state)
            }

            // 获取 level（优先使用请求中的 level，否则从 game_state 中提取）
            const newLevel = level || (game_state.player?.level) || character.level

            // 更新数据库
            await stmts.updateCharacterGameState.run(gameStateStr, newLevel, id)

            return res.json({
                success: true,
                message: '角色存档已更新',
                character: {
                    id: character.id,
                    level: newLevel,
                    updated_at: new Date().toISOString()
                }
            })
        } catch (err) {
            console.error('[characters/update]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── DELETE /api/characters/:id ─────────────────────────────
    // 删除角色
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params
            const userId = req.user.id

            // 删除角色（SQL 已包含 user_id 验证）
            const result = await stmts.deleteCharacter.run(id, userId)

            if (result.changes === 0) {
                return res.status(404).json({ error: 'NOT_FOUND', message: '角色不存在' })
            }

            return res.json({
                success: true,
                message: '角色已删除'
            })
        } catch (err) {
            console.error('[characters/delete]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    return router
}
