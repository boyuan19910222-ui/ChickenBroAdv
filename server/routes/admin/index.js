/**
 * Admin API Routes
 * 后台管理 API 路由（预留）
 */
import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/index.js'

// 导入各资源管理路由
import { createUserAdminRouter } from './users.js'
import { createCharacterAdminRouter } from './characters.js'
import { createClassConfigAdminRouter } from './class-configs.js'

/**
 * Create admin router
 * @param {object} stmts - Database statement adapters
 * @returns {Router}
 */
export function createAdminRouter(stmts) {
    const router = Router()

    // 所有管理路由都需要管理员认证
    router.use(authenticateAdmin)


    // 挂载资源路由
    router.use('/users', createUserAdminRouter())
    router.use('/characters', createCharacterAdminRouter())
    router.use('/class-configs', createClassConfigAdminRouter())

    // Health check endpoint (无需认证)
    router.get('/health', (req, res) => {
        res.json({ status: 'ok', message: 'Admin API is ready' })
    })

    return router
}

export { createUserAdminRouter } from './users.js'
export { createCharacterAdminRouter } from './characters.js'
export { createClassConfigAdminRouter } from './class-configs.js'
