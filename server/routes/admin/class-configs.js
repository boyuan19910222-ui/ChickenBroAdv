/**
 * Admin API Routes - Class Configs
 * 管理员 API - 职业配置管理路由
 */
import { Router } from 'express'

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
            return res.status(404).json({ error: 'NOT_IMPLEMENTED', message: '功能未实现' })
        } catch (err) {
            console.error('[admin/class-configs]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── POST /api/admin/class-configs ─────────────────────────
    // 创建职业配置（包含字段验证）
    router.post('/', async (req, res) => {
        try {
            return res.status(404).json({ error: 'NOT_IMPLEMENTED', message: '功能未实现' })
        } catch (err) {
            console.error('[admin/class-configs POST]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── PUT /api/admin/class-configs/:id ─────────────────────────
    // 更新职业配置
    router.put('/:id', async (req, res) => {
        try {
            return res.status(404).json({ error: 'NOT_IMPLEMENTED', message: '功能未实现' })
        } catch (err) {
            console.error('[admin/class-configs PUT]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── DELETE /api/admin/class-configs/:id ─────────────────────────
    // 删除职业配置
    router.delete('/:id', async (req, res) => {
        try {
            return res.status(404).json({ error: 'NOT_IMPLEMENTED', message: '功能未实现' })
        } catch (err) {
            console.error('[admin/class-configs DELETE]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── POST /api/admin/class-configs/reload ─────────────────────
    // 热重载职业配置到内存
    router.post('/reload', async (req, res) => {
        try {
            return res.status(404).json({ error: 'NOT_IMPLEMENTED', message: '功能未实现' })
        } catch (err) {
            console.error('[admin/class-configs/reload]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    return router
}
