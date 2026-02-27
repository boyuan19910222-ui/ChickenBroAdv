/**
 * Admin API Routes - Characters
 * 管理员 API - 角色管理路由
 */
import { Router } from 'express'

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

            return res.json({
                data: [],
                pagination: {
                    total: 0,
                    page: pageNum,
                    pageSize: pageSizeNum,
                    totalPages: 0
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
            return res.status(404).json({ error: 'NOT_IMPLEMENTED', message: '功能未实现' })
        } catch (err) {
            console.error('[admin/characters/:id]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── PUT /api/admin/characters/:id ─────────────────────────
    // 更新角色信息（支持 game_state 增量更新）
    router.put('/:id', async (req, res) => {
        try {
            return res.status(404).json({ error: 'NOT_IMPLEMENTED', message: '功能未实现' })
        } catch (err) {
            console.error('[admin/characters PUT]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── DELETE /api/admin/characters/:id ─────────────────────────
    // 删除角色
    router.delete('/:id', async (req, res) => {
        try {
            return res.status(404).json({ error: 'NOT_IMPLEMENTED', message: '功能未实现' })
        } catch (err) {
            console.error('[admin/characters DELETE]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    return router
}
