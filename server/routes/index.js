/**
 * Routes Index
 * 路由聚合入口
 */
import { Router } from 'express'
import { createClientRouter } from './client/index.js'
import { createAdminRouter } from './admin/index.js'

/**
 * Create main router with all API routes
 * @param {object} stmts - Database statement adapters
 * @returns {Router}
 */
export function createRouter(stmts) {
    const router = Router()

    // Client API (v1)
    router.use('/v1', createClientRouter(stmts))

    // Admin API
    router.use('/admin', createAdminRouter(stmts))

    return router
}

export { createClientRouter } from './client/index.js'
export { createAdminRouter } from './admin/index.js'
