import { getStatements } from '../db.js'

/**
 * Middleware to require admin privileges for API routes.
 * Verifies that the authenticated user has admin role.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export async function requireAdmin(req, res, next) {
    const stmts = getStatements()
    const userId = req.user?.id

    // Check if user is logged in
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check if user has admin privileges
    const isAdmin = await stmts.isAdminUser.get(userId)
    if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Admin privileges required' })
    }

    // User is admin, proceed to next handler
    next()
}
