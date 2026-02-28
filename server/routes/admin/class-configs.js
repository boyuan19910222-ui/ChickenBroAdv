/**
 * Admin API Routes - Class Configs
 * 管理员 API - 职业配置管理路由
 */
import { Router } from 'express'
import { ClassConfig } from '../../models/index.js'
import { reloadClassConfigs } from '../client/characters.js'

// 有效职业ID列表
const VALID_CLASS_IDS = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']

// 有效资源类型
const VALID_RESOURCE_TYPES = ['mana', 'rage', 'energy']

/**
 * Create admin class configs router.
 * @param {object} stmts - Database statement adapters
 * @returns {Router}
 */
export function createClassConfigAdminRouter() {
    const router = Router()

    // ── GET /api/admin/class-configs ─────────────────────────────
    // 获取职业配置列表
    router.get('/', async (req, res) => {
        try {
            const configs = await ClassConfig.findAll({
                order: [['class_id', 'ASC']]
            })

            // 格式化返回数据
            const data = configs.map(config => ({
                id: config.id,
                class_id: config.class_id,
                name: config.name,
                base_stats: config.base_stats,
                growth_per_level: config.growth_per_level,
                base_skills: config.base_skills,
                resource_type: config.resource_type,
                resource_max: config.resource_max,
                created_at: config.created_at,
                updated_at: config.updated_at
            }))

            return res.json({ data })
        } catch (err) {
            console.error('[admin/class-configs]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── POST /api/admin/class-configs ─────────────────────────
    // 创建职业配置（包含字段验证）
    router.post('/', async (req, res) => {
        try {
            const { class_id, name, base_stats, growth_per_level, base_skills, resource_type, resource_max } = req.body || {}

            // 验证必填字段
            if (!class_id || !name || !base_stats || !growth_per_level || !base_skills || !resource_type || resource_max === undefined) {
                return res.status(400).json({ error: 'MISSING_FIELDS', message: '缺少必填字段' })
            }

            // 验证 class_id
            if (!VALID_CLASS_IDS.includes(class_id)) {
                return res.status(400).json({ error: 'INVALID_CLASS_ID', message: '无效的职业ID' })
            }

            // 验证资源类型
            if (!VALID_RESOURCE_TYPES.includes(resource_type)) {
                return res.status(400).json({ error: 'INVALID_RESOURCE_TYPE', message: '无效的资源类型' })
            }

            // 验证 resource_max
            const resourceMaxNum = parseInt(resource_max, 10)
            if (isNaN(resourceMaxNum) || resourceMaxNum < 1) {
                return res.status(400).json({ error: 'INVALID_RESOURCE_MAX', message: '资源上限必须为正整数' })
            }

            // 检查是否已存在
            const existing = await ClassConfig.findOne({ where: { class_id } })
            if (existing) {
                return res.status(400).json({ error: 'CLASS_EXISTS', message: '该职业配置已存在' })
            }

            // 创建职业配置
            const config = await ClassConfig.create({
                class_id,
                name,
                base_stats,
                growth_per_level,
                base_skills,
                resource_type,
                resource_max: resourceMaxNum
            })

            return res.status(201).json({
                data: {
                    id: config.id,
                    class_id: config.class_id,
                    name: config.name,
                    base_stats: config.base_stats,
                    growth_per_level: config.growth_per_level,
                    base_skills: config.base_skills,
                    resource_type: config.resource_type,
                    resource_max: config.resource_max,
                    created_at: config.created_at,
                    updated_at: config.updated_at
                }
            })
        } catch (err) {
            console.error('[admin/class-configs POST]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── PUT /api/admin/class-configs/:id ─────────────────────────
    // 更新职业配置
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params
            const { name, base_stats, growth_per_level, base_skills, resource_type, resource_max } = req.body || {}

            // 验证配置存在
            const config = await ClassConfig.findOne({ where: { id: parseInt(id, 10) } })
            if (!config) {
                return res.status(404).json({ error: 'CONFIG_NOT_FOUND', message: '职业配置不存在' })
            }

            // 构建更新数据
            const updateData = { updated_at: new Date() }
            if (name !== undefined) updateData.name = name
            if (base_stats !== undefined) updateData.base_stats = base_stats
            if (growth_per_level !== undefined) updateData.growth_per_level = growth_per_level
            if (base_skills !== undefined) updateData.base_skills = base_skills
            if (resource_type !== undefined) {
                if (!VALID_RESOURCE_TYPES.includes(resource_type)) {
                    return res.status(400).json({ error: 'INVALID_RESOURCE_TYPE', message: '无效的资源类型' })
                }
                updateData.resource_type = resource_type
            }
            if (resource_max !== undefined) {
                const resourceMaxNum = parseInt(resource_max, 10)
                if (isNaN(resourceMaxNum) || resourceMaxNum < 1) {
                    return res.status(400).json({ error: 'INVALID_RESOURCE_MAX', message: '资源上限必须为正整数' })
                }
                updateData.resource_max = resourceMaxNum
            }

            // 执行更新
            await ClassConfig.update(updateData, { where: { id: parseInt(id, 10) } })

            // 返回更新后的配置
            const updatedConfig = await ClassConfig.findOne({ where: { id: parseInt(id, 10) } })

            return res.json({
                data: {
                    id: updatedConfig.id,
                    class_id: updatedConfig.class_id,
                    name: updatedConfig.name,
                    base_stats: updatedConfig.base_stats,
                    growth_per_level: updatedConfig.growth_per_level,
                    base_skills: updatedConfig.base_skills,
                    resource_type: updatedConfig.resource_type,
                    resource_max: updatedConfig.resource_max,
                    created_at: updatedConfig.created_at,
                    updated_at: updatedConfig.updated_at
                }
            })
        } catch (err) {
            console.error('[admin/class-configs PUT]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── DELETE /api/admin/class-configs/:id ─────────────────────────
    // 删除职业配置
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params
            const configId = parseInt(id, 10)

            // 验证配置存在
            const config = await ClassConfig.findOne({ where: { id: configId } })
            if (!config) {
                return res.status(404).json({ error: 'CONFIG_NOT_FOUND', message: '职业配置不存在' })
            }

            // 删除配置
            await ClassConfig.destroy({ where: { id: configId } })

            return res.status(204).send()
        } catch (err) {
            console.error('[admin/class-configs DELETE]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── POST /api/admin/class-configs/reload ─────────────────────
    // 热重载职业配置到内存
    router.post('/reload', async (req, res) => {
        try {
            // 导入 stmts 以调用 reloadClassConfigs
            const { getStatements } = await import('../../utils/db.js')
            const stmts = getStatements()

            await reloadClassConfigs(stmts)

            return res.json({
                success: true,
                message: '职业配置已热重载到内存'
            })
        } catch (err) {
            console.error('[admin/class-configs/reload]', err)
            return res.status(500).json({ error: 'RELOAD_FAILED', message: '热重载失败: ' + err.message })
        }
    })

    return router
}
