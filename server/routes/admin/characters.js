/**
 * Admin API Routes - Characters
 * 管理员 API - 角色管理路由
 */
import { Router } from 'express'
import { Character, User } from '../../models/index.js'
import { Op } from 'sequelize'

/**
 * Create admin characters router.
 * @param {object} stmts - Database statement adapters
 * @returns {Router}
 */
export function createCharacterAdminRouter() {
    const router = Router()

    // ── GET /api/admin/characters ─────────────────────────────
    // 获取角色列表（支持分页、搜索、关联用户信息）
    router.get('/', async (req, res) => {
        try {
            const { page = 1, pageSize = 20, search = '', userId } = req.query
            const pageNum = parseInt(page, 10)
            const pageSizeNum = parseInt(pageSize, 10)

            // 构建查询条件
            const whereCondition = {}
            if (userId) {
                whereCondition.user_id = parseInt(userId, 10)
            }
            if (search) {
                whereCondition[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } }
                ]
            }

            // 获取总数
            const total = await Character.count({ where: whereCondition })

            // 获取分页数据，关联用户信息
            const characters = await Character.findAll({
                where: whereCondition,
                attributes: ['id', 'user_id', 'name', 'class', 'level', 'created_at', 'updated_at', 'last_played_at'],
                limit: pageSizeNum,
                offset: (pageNum - 1) * pageSizeNum,
                order: [['last_played_at', 'DESC']],
                include: [{
                    model: User,
                    attributes: ['id', 'username', 'nickname'],
                    required: false
                }]
            })

            // 格式化返回数据
            const data = characters.map(char => ({
                id: char.id,
                user_id: char.user_id,
                name: char.name,
                class: char.class,
                level: char.level,
                created_at: char.created_at,
                updated_at: char.updated_at,
                last_played_at: char.last_played_at,
                user: char.User ? {
                    id: char.User.id,
                    username: char.User.username,
                    nickname: char.User.nickname
                } : null
            }))

            return res.json({
                data,
                pagination: {
                    total,
                    page: pageNum,
                    pageSize: pageSizeNum,
                    totalPages: Math.ceil(total / pageSizeNum)
                }
            })
        } catch (err) {
            console.error('[admin/characters]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── GET /api/admin/characters/:id ─────────────────────────
    // 获取单个角色详情（包含解析后的 game_state）
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params
            const character = await Character.findOne({
                where: { id: parseInt(id, 10) },
                include: [{
                    model: User,
                    attributes: ['id', 'username', 'nickname'],
                    required: false
                }]
            })

            if (!character) {
                return res.status(404).json({ error: 'CHARACTER_NOT_FOUND', message: '角色不存在' })
            }

            // 解析 game_state
            let gameState = {}
            try {
                if (character.game_state) {
                    gameState = JSON.parse(character.game_state)
                }
            } catch (parseErr) {
                console.error('[admin/characters/:id] Failed to parse game_state:', parseErr)
            }

            return res.json({
                data: {
                    id: character.id,
                    user_id: character.user_id,
                    name: character.name,
                    class: character.class,
                    level: character.level,
                    game_state: gameState,
                    created_at: character.created_at,
                    updated_at: character.updated_at,
                    last_played_at: character.last_played_at,
                    user: character.User ? {
                        id: character.User.id,
                        username: character.User.username,
                        nickname: character.User.nickname
                    } : null
                }
            })
        } catch (err) {
            console.error('[admin/characters/:id]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── PUT /api/admin/characters/:id ─────────────────────────
    // 更新角色信息（支持 game_state 增量更新）
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params
            const { name, level, game_state } = req.body || {}

            // 验证角色存在
            const character = await Character.findOne({ where: { id: parseInt(id, 10) } })
            if (!character) {
                return res.status(404).json({ error: 'CHARACTER_NOT_FOUND', message: '角色不存在' })
            }

            // 构建更新数据
            const updateData = { updated_at: new Date() }
            if (name !== undefined) {
                // 验证角色名格式
                const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,12}$/
                if (!nameRegex.test(name)) {
                    return res.status(400).json({ error: 'INVALID_NAME', message: '角色名须为2-12位中文、字母、数字或下划线' })
                }
                updateData.name = name
            }
            if (level !== undefined) {
                const levelNum = parseInt(level, 10)
                if (isNaN(levelNum) || levelNum < 1 || levelNum > 60) {
                    return res.status(400).json({ error: 'INVALID_LEVEL', message: '等级必须在1-60之间' })
                }
                updateData.level = levelNum
            }
            if (game_state !== undefined) {
                // 支持增量更新：合并现有 game_state
                let existingState = {}
                try {
                    if (character.game_state) {
                        existingState = JSON.parse(character.game_state)
                    }
                } catch (parseErr) {
                    console.warn('[admin/characters PUT] Failed to parse existing game_state:', parseErr)
                }

                // 深度合并
                const mergedState = deepMerge(existingState, game_state)
                updateData.game_state = JSON.stringify(mergedState)
            }

            // 执行更新
            await Character.update(updateData, { where: { id: parseInt(id, 10) } })

            // 返回更新后的角色信息
            const updatedCharacter = await Character.findOne({
                where: { id: parseInt(id, 10) },
                include: [{
                    model: User,
                    attributes: ['id', 'username', 'nickname'],
                    required: false
                }]
            })

            let gameState = {}
            try {
                if (updatedCharacter.game_state) {
                    gameState = JSON.parse(updatedCharacter.game_state)
                }
            } catch (parseErr) {
                console.warn('[admin/characters PUT] Failed to parse updated game_state:', parseErr)
            }

            return res.json({
                data: {
                    id: updatedCharacter.id,
                    user_id: updatedCharacter.user_id,
                    name: updatedCharacter.name,
                    class: updatedCharacter.class,
                    level: updatedCharacter.level,
                    game_state: gameState,
                    created_at: updatedCharacter.created_at,
                    updated_at: updatedCharacter.updated_at,
                    last_played_at: updatedCharacter.last_played_at,
                    user: updatedCharacter.User ? {
                        id: updatedCharacter.User.id,
                        username: updatedCharacter.User.username,
                        nickname: updatedCharacter.User.nickname
                    } : null
                }
            })
        } catch (err) {
            console.error('[admin/characters PUT]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── DELETE /api/admin/characters/:id ─────────────────────────
    // 删除角色
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params
            const characterId = parseInt(id, 10)

            // 验证角色存在
            const character = await Character.findOne({ where: { id: characterId } })
            if (!character) {
                return res.status(404).json({ error: 'CHARACTER_NOT_FOUND', message: '角色不存在' })
            }

            // 删除角色
            await Character.destroy({ where: { id: characterId } })

            return res.status(204).send()
        } catch (err) {
            console.error('[admin/characters DELETE]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    return router
}

/**
 * 深度合并两个对象
 * @param {object} target - 目标对象
 * @param {object} source - 源对象
 * @returns {object} 合并后的对象
 */
function deepMerge(target, source) {
    const result = { ...target }
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key])
        } else {
            result[key] = source[key]
        }
    }
    return result
}
