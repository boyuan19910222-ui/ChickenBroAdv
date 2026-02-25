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
