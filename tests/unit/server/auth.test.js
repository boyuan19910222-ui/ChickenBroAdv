import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import express from 'express'
import jwt from 'jsonwebtoken'
import { buildStatementAdapters } from '../../../server/db.js'
import { sequelize } from '../../../server/models/sequelize.js'
import { createAuthRouter } from '../../../server/auth.js'
import { authenticateToken } from '../../../server/middleware.js'
import config from '../../../server/config.js'

// Helper: create a test app backed by the shared test MySQL database.
// All adapter instances share the same Sequelize connection, so data created
// in one request is visible to the next within the same test.
function createTestApp() {
    const stmts = buildStatementAdapters()
    const app = express()
    app.use(express.json())
    app.use('/api/auth', createAuthRouter(stmts))

    // A protected test route
    app.get('/api/protected', authenticateToken, (req, res) => {
        res.json({ user: req.user })
    })

    return { app, stmts }
}

// Supertest-like helper using native fetch on the Express app
function request(app) {
    let server
    const base = new Promise((resolve) => {
        server = app.listen(0, () => {
            resolve(`http://127.0.0.1:${server.address().port}`)
        })
    })

    const api = {
        async post(path, body) {
            const url = await base
            const res = await fetch(`${url}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const json = await res.json()
            server.close()
            return { status: res.status, body: json }
        },
        async get(path, headers = {}) {
            const url = await base
            const res = await fetch(`${url}${path}`, { headers })
            const json = await res.json()
            server.close()
            return { status: res.status, body: json }
        },
    }
    return api
}

// Shared setup/teardown: sync DB schema once before all tests, close after all
beforeAll(async () => {
    await sequelize.sync({ force: true })
})

afterAll(async () => {
    await sequelize.close()
})

describe('Auth - Registration', () => {
    let app

    beforeEach(async () => {
        // Truncate users table to isolate each test
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        await sequelize.query('TRUNCATE TABLE users')
        await sequelize.query('TRUNCATE TABLE characters')
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')

        const ctx = createTestApp()
        app = ctx.app
    })

    it('should register a new user successfully', async () => {
        const res = await request(app).post('/api/auth/register', {
            username: 'testuser',
            password: 'password123',
            nickname: '测试玩家',
        })

        expect(res.status).toBe(201)
        expect(res.body.token).toBeDefined()
        expect(res.body.user.username).toBe('testuser')
        expect(res.body.user.nickname).toBe('测试玩家')
        expect(res.body.user.id).toBeTypeOf('number')
    })

    it('should reject duplicate username', async () => {
        await request(app).post('/api/auth/register', {
            username: 'testuser',
            password: 'password123',
            nickname: '玩家1',
        })

        // Second request — same stmts/DB state visible because we share one Sequelize instance
        const app2 = express()
        app2.use(express.json())
        app2.use('/api/auth', createAuthRouter(buildStatementAdapters()))

        const res = await request(app2).post('/api/auth/register', {
            username: 'testuser',
            password: 'password456',
            nickname: '玩家2',
        })

        expect(res.status).toBe(409)
        expect(res.body.error).toBe('USERNAME_EXISTS')
    })

    it('should reject invalid username (too short)', async () => {
        const res = await request(app).post('/api/auth/register', {
            username: 'ab',
            password: 'password123',
            nickname: '玩家',
        })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('INVALID_USERNAME')
    })

    it('should reject invalid username (special characters)', async () => {
        const res = await request(app).post('/api/auth/register', {
            username: 'user@name!',
            password: 'password123',
            nickname: '玩家',
        })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('INVALID_USERNAME')
    })

    it('should reject password that is too short', async () => {
        const res = await request(app).post('/api/auth/register', {
            username: 'testuser',
            password: '12345',
            nickname: '玩家',
        })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('INVALID_PASSWORD')
    })

    it('should reject password that is too long', async () => {
        const res = await request(app).post('/api/auth/register', {
            username: 'testuser',
            password: 'a'.repeat(33),
            nickname: '玩家',
        })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('INVALID_PASSWORD')
    })

    it('should reject nickname that is too short', async () => {
        const res = await request(app).post('/api/auth/register', {
            username: 'testuser',
            password: 'password123',
            nickname: '我',
        })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('INVALID_NICKNAME')
    })
})

describe('Auth - Login', () => {
    let app

    beforeEach(async () => {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        await sequelize.query('TRUNCATE TABLE users')
        await sequelize.query('TRUNCATE TABLE characters')
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')

        app = createTestApp().app

        // Register a user first
        await request(app).post('/api/auth/register', {
            username: 'loginuser',
            password: 'mypassword',
            nickname: '登录玩家',
        })

        // Fresh app for subsequent requests (same shared DB)
        app = createTestApp().app
    })

    it('should login successfully and return JWT', async () => {
        const res = await request(app).post('/api/auth/login', {
            username: 'loginuser',
            password: 'mypassword',
        })

        expect(res.status).toBe(200)
        expect(res.body.token).toBeDefined()
        expect(res.body.user.username).toBe('loginuser')
        expect(res.body.user.nickname).toBe('登录玩家')

        // Verify the token is valid
        const decoded = jwt.verify(res.body.token, config.jwtSecret)
        expect(decoded.username).toBe('loginuser')
    })

    it('should reject wrong password', async () => {
        const res = await request(app).post('/api/auth/login', {
            username: 'loginuser',
            password: 'wrongpassword',
        })

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('WRONG_PASSWORD')
    })

    it('should reject non-existent user', async () => {
        const res = await request(app).post('/api/auth/login', {
            username: 'nouser',
            password: 'password',
        })

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('USER_NOT_FOUND')
    })
})

describe('Auth - JWT Token verification', () => {
    let app

    beforeEach(async () => {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        await sequelize.query('TRUNCATE TABLE users')
        await sequelize.query('TRUNCATE TABLE characters')
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')

        app = createTestApp().app
    })

    it('should allow access to protected route with valid token', async () => {
        // Register to get a token
        const regRes = await request(app).post('/api/auth/register', {
            username: 'tokenuser',
            password: 'password123',
            nickname: '令牌玩家',
        })

        const token = regRes.body.token

        // Use a fresh app (same shared DB)
        const newApp = createTestApp().app

        const res = await request(newApp).get('/api/protected', {
            Authorization: `Bearer ${token}`,
        })

        expect(res.status).toBe(200)
        expect(res.body.user.username).toBe('tokenuser')
    })

    it('should reject request without token', async () => {
        const res = await request(app).get('/api/protected')

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('AUTH_REQUIRED')
    })

    it('should reject request with invalid token', async () => {
        const res = await request(app).get('/api/protected', {
            Authorization: 'Bearer invalid.token.here',
        })

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('TOKEN_INVALID')
    })
})

