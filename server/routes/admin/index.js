/**
 * Admin API Routes
 * 后台管理 API 路由（预留）
 */
import { Router } from 'express'

/**
 * Create admin router
 * @param {object} stmts - Database statement adapters
 * @returns {Router}
 */
export function createAdminRouter(stmts) {
    const router = Router()

    // TODO: Add admin routes here
    // Example:
    // router.use('/users', createUserAdminRouter(stmts))
    // router.use('/rooms', createRoomAdminRouter(stmts))

    // Health check endpoint
    router.get('/health', (req, res) => {
        res.json({ status: 'ok', message: 'Admin API is ready' })
    })

    return router
}
