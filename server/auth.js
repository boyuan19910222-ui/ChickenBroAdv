import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from './config.js'

// Validation patterns
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/
const NICKNAME_MIN = 2
const NICKNAME_MAX = 12
const PASSWORD_MIN = 6
const PASSWORD_MAX = 32

/**
 * Create the auth router.
 * Accepts a `stmts` object (prepared statements) so tests can inject in-memory DB.
 */
export function createAuthRouter(stmts) {
    const router = Router()

    // ── POST /api/auth/register ─────────────────────────────
    router.post('/register', (req, res) => {
        try {
            const { username, password, nickname, auto_login } = req.body || {}

            // Validate username
            if (!username || !USERNAME_RE.test(username)) {
                return res.status(400).json({
                    error: 'INVALID_USERNAME',
                    message: '用户名须为3-20位字母、数字或下划线',
                })
            }

            // Validate password
            if (!password || password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
                return res.status(400).json({
                    error: 'INVALID_PASSWORD',
                    message: `密码长度须为${PASSWORD_MIN}-${PASSWORD_MAX}位`,
                })
            }

            // Validate nickname
            if (!nickname || nickname.length < NICKNAME_MIN || nickname.length > NICKNAME_MAX) {
                return res.status(400).json({
                    error: 'INVALID_NICKNAME',
                    message: `昵称长度须为${NICKNAME_MIN}-${NICKNAME_MAX}个字符`,
                })
            }

            // Check duplicate username
            const existing = stmts.findUserByUsername.get(username)
            if (existing) {
                return res.status(409).json({
                    error: 'USERNAME_EXISTS',
                    message: '用户名已存在',
                })
            }

            // Hash password and insert
            const passwordHash = bcrypt.hashSync(password, config.bcryptRounds)
            const result = stmts.insertUser.run(username, passwordHash, nickname)
            const userId = result.lastInsertRowid

            // Generate JWT with appropriate expiration
            const expiresIn = auto_login ? config.jwtExpiresInAutoLogin : config.jwtExpiresIn
            const token = jwt.sign(
                { id: Number(userId), username, nickname },
                config.jwtSecret,
                { expiresIn }
            )

            return res.status(201).json({
                token,
                user: { id: Number(userId), username, nickname },
            })
        } catch (err) {
            console.error('[auth/register]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── POST /api/auth/login ────────────────────────────────
    router.post('/login', (req, res) => {
        try {
            const { username, password, auto_login } = req.body || {}

            if (!username || !password) {
                return res.status(400).json({
                    error: 'MISSING_FIELDS',
                    message: '请输入用户名和密码',
                })
            }

            const user = stmts.findUserByUsername.get(username)
            if (!user) {
                return res.status(401).json({
                    error: 'USER_NOT_FOUND',
                    message: '用户不存在',
                })
            }

            const valid = bcrypt.compareSync(password, user.password_hash)
            if (!valid) {
                return res.status(401).json({
                    error: 'WRONG_PASSWORD',
                    message: '密码错误',
                })
            }

            // Update last_login
            stmts.updateLastLogin.run(user.id)

            // Choose token expiration based on auto_login
            const expiresIn = auto_login ? config.jwtExpiresInAutoLogin : config.jwtExpiresIn

            const token = jwt.sign(
                { id: user.id, username: user.username, nickname: user.nickname },
                config.jwtSecret,
                { expiresIn }
            )

            return res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    nickname: user.nickname,
                },
            })
        } catch (err) {
            console.error('[auth/login]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── POST /api/auth/logout ────────────────────────────────
    router.post('/logout', (req, res) => {
        try {
            // JWT is stateless, so we just return success
            // Client should discard the token
            // Optional: Implement token blacklist for enhanced security
            return res.json({
                success: true,
                message: '登出成功',
            })
        } catch (err) {
            console.error('[auth/logout]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    return router
}
