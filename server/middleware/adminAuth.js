/**
 * Admin Authentication Middleware
 * 管理员认证中间件（JWT 验证 + is_admin 检查）
 */
import jwt from 'jsonwebtoken'
import config from '../config.js'

/**
 * Express middleware: authenticate JWT and verify admin role.
 * Sets req.user = { id, username, nickname, is_admin } on success.
 */
export function authenticateAdmin(req, res, next) {
    const authHeader = req.headers['authorization']

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: '未提供认证令牌' })
    }

    const token = authHeader.slice(7)

    try {
        const decoded = jwt.verify(token, config.jwtSecret)

        // Check if user is admin
        if (!decoded.is_admin || decoded.is_admin !== 1) {
            return res.status(403).json({ error: 'FORBIDDEN', message: '需要管理员权限' })
        }

        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: '认证令牌无效' })
    }
}
