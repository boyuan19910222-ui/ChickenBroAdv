/**
 * Client API Routes (v1)
 * 前端用户 API 路由聚合
 */
import { Router } from 'express'
import { createAuthRouter } from './auth.js'
import { createCharactersRouter, loadClassConfigs, getClassConfig, reloadClassConfigs } from './characters.js'

/**
 * Create client router with v1 prefix
 * @param {object} stmts - Database statement adapters
 * @returns {Router}
 */
export function createClientRouter(stmts) {
    const router = Router()

    // Mount auth routes at /auth
    router.use('/auth', createAuthRouter(stmts))

    // Mount character routes at /characters
    router.use('/characters', createCharactersRouter(stmts))

    return router
}

export { createAuthRouter } from './auth.js'
export { createCharactersRouter, loadClassConfigs, getClassConfig, reloadClassConfigs } from './characters.js'
