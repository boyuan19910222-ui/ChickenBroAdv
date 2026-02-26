import jwt from 'jsonwebtoken'
import config from './config.js'

/**
 * Express middleware: authenticate JWT from Authorization header.
 * Sets req.user = { id, username, nickname } on success.
 */
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null

    if (!token) {
        return res.status(401).json({ error: 'AUTH_REQUIRED', message: '需要登录' })
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({ error: 'TOKEN_INVALID', message: 'Token 无效或已过期' })
    }
}

/**
 * Socket.IO middleware: authenticate JWT from socket.handshake.auth.token.
 * Sets socket.user = { id, username, nickname } on success.
 */
export function authenticateSocket(socket, next) {
    const token = socket.handshake.auth && socket.handshake.auth.token

    if (!token) {
        return next(new Error('AUTH_REQUIRED'))
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret)
        socket.user = decoded
        next()
    } catch (err) {
        return next(new Error('TOKEN_INVALID'))
    }
}

/**
 * Global Express error handler.
 * Must be registered AFTER all routes with app.use(globalErrorHandler).
 *
 * - Sequelize connection / timeout errors  → HTTP 503
 * - Everything else                        → HTTP 500
 * Raw database stack traces are never exposed to the client.
 */
export function globalErrorHandler(err, req, res, _next) {
    const isSequelizeConnectionError =
        err.name === 'SequelizeConnectionError' ||
        err.name === 'SequelizeConnectionRefusedError' ||
        err.name === 'SequelizeHostNotFoundError' ||
        err.name === 'SequelizeAccessDeniedError' ||
        err.name === 'SequelizeConnectionTimedOutError'

    if (isSequelizeConnectionError) {
        console.error('[db] Connection error:', err.message)
        return res.status(503).json({
            error:   'SERVICE_UNAVAILABLE',
            message: '数据库暂时不可用，请稍后重试',
        })
    }

    console.error('[server] Unhandled error:', err)
    return res.status(500).json({
        error:   'INTERNAL_ERROR',
        message: '服务器内部错误',
    })
}

