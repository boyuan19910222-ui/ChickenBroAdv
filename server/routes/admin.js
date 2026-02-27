import express from 'express'
import { getStatements } from '../db.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = express.Router()
const stmts = getStatements()

// ── Admin Check Endpoint ───────────────────────────────────────────────────

/**
 * GET /api/admin/check
 * Check if the current user has admin privileges.
 * This endpoint does NOT require admin authentication (used to show/hide UI elements).
 */
router.get('/check', async (req, res) => {
    try {
        const userId = req.user?.id
        if (!userId) {
            return res.json({ isAdmin: false })
        }

        const isAdmin = await stmts.isAdminUser.get(userId)
        res.json({ isAdmin })
    } catch (error) {
        console.error('Admin check error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ── User Management Endpoints ─────────────────────────────────────────────

/**
 * GET /api/admin/users
 * Get paginated list of all users.
 * Requires admin privileges.
 */
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20

        const result = await stmts.listAllUsers.all(page, limit)
        res.json(result)
    } catch (error) {
        console.error('List users error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/admin/users/:id
 * Get detailed information about a specific user.
 * Requires admin privileges.
 */
router.get('/users/:id', requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const user = await stmts.getUserById.get(userId)

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json(user)
    } catch (error) {
        console.error('Get user error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PATCH /api/admin/users/:id/class
 * Update a user's character class.
 * Requires admin privileges.
 */
router.patch('/users/:id/class', requireAdmin, async (req, res) => {
    try {
        const characterId = parseInt(req.params.id)
        const { classId } = req.body

        if (!classId) {
            return res.status(400).json({ error: 'classId is required' })
        }

        const adminUserId = req.user.id
        await stmts.updateUserClass.run(characterId, classId, adminUserId)

        // Return updated character
        const updated = await stmts.getUserById.get(characterId)
        res.json(updated)
    } catch (error) {
        console.error('Update user class error:', error)
        if (error.message === 'Character not found') {
            return res.status(404).json({ error: error.message })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PATCH /api/admin/users/:id/level
 * Update a user's level.
 * Requires admin privileges.
 */
router.patch('/users/:id/level', requireAdmin, async (req, res) => {
    try {
        const characterId = parseInt(req.params.id)
        const { level } = req.body

        if (typeof level !== 'number' || level < 1 || level > 100) {
            return res.status(400).json({ error: 'Invalid level value (must be 1-100)' })
        }

        const adminUserId = req.user.id
        await stmts.updateUserLevel.run(characterId, level, adminUserId)

        const updated = await stmts.getUserById.get(characterId)
        res.json(updated)
    } catch (error) {
        console.error('Update user level error:', error)
        if (error.message === 'Character not found') {
            return res.status(404).json({ error: error.message })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PATCH /api/admin/users/:id/experience
 * Update a user's experience.
 * Requires admin privileges.
 */
router.patch('/users/:id/experience', requireAdmin, async (req, res) => {
    try {
        const characterId = parseInt(req.params.id)
        const { experience } = req.body

        if (typeof experience !== 'number' || experience < 0) {
            return res.status(400).json({ error: 'Invalid experience value' })
        }

        const adminUserId = req.user.id
        await stmts.updateUserExperience.run(characterId, experience, adminUserId)

        const updated = await stmts.getUserById.get(characterId)
        res.json(updated)
    } catch (error) {
        console.error('Update user experience error:', error)
        if (error.message === 'Character not found') {
            return res.status(404).json({ error: error.message })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * DELETE /api/admin/users/:id
 * Delete a user and all associated data.
 * Requires admin privileges.
 */
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id)

        // Prevent self-deletion
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' })
        }

        const adminUserId = req.user.id
        const { changes } = await stmts.deleteUser.run(userId, adminUserId)

        if (changes === 0) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.status(204).send()
    } catch (error) {
        console.error('Delete user error:', error)
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ── Class Config Management Endpoints ──────────────────────────────────

/**
 * GET /api/admin/class-config
 * Get all class configurations.
 * Requires admin privileges.
 */
router.get('/class-config', requireAdmin, async (req, res) => {
    try {
        const configs = await stmts.listAllClassConfigs.all()
        res.json({ configs })
    } catch (error) {
        console.error('List class configs error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * GET /api/admin/class-config/:id
 * Get a specific class configuration.
 * Requires admin privileges.
 */
router.get('/class-config/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const config = await stmts.getClassConfigById.get(id)

        if (!config) {
            return res.status(404).json({ error: 'Class config not found' })
        }

        res.json(config)
    } catch (error) {
        console.error('Get class config error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * POST /api/admin/class-config
 * Create a new class configuration.
 * Requires admin privileges.
 */
router.post('/class-config', requireAdmin, async (req, res) => {
    try {
        const data = req.body

        // Validate required fields
        if (!data.classId || !data.name || !data.baseStats || !data.growthPerLevel) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const adminUserId = req.user.id
        const { lastInsertRowid: id } = await stmts.createClassConfig.run(data, adminUserId)

        const config = await stmts.getClassConfigById.get(id)
        res.status(201).json(config)
    } catch (error) {
        console.error('Create class config error:', error)
        // Handle duplicate class_id error from database
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Class ID already exists' })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * PUT /api/admin/class-config/:id
 * Update an existing class configuration.
 * Requires admin privileges.
 */
router.put('/class-config/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const data = req.body

        // Validate required fields
        if (!data.name || !data.baseStats || !data.growthPerLevel) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const adminUserId = req.user.id
        await stmts.updateClassConfig.run(id, data, adminUserId)

        const updated = await stmts.getClassConfigById.get(id)
        res.json(updated)
    } catch (error) {
        console.error('Update class config error:', error)
        if (error.message === 'Class config not found') {
            return res.status(404).json({ error: error.message })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * DELETE /api/admin/class-config/:id
 * Delete a class configuration.
 * Requires admin privileges.
 */
router.delete('/class-config/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const adminUserId = req.user.id
        const { changes } = await stmts.deleteClassConfig.run(id, adminUserId)

        if (changes === 0) {
            return res.status(404).json({ error: 'Class config not found' })
        }

        res.status(204).send()
    } catch (error) {
        console.error('Delete class config error:', error)
        if (error.message === 'Class config not found') {
            return res.status(404).json({ error: error.message })
        }
        if (error.message.includes('Cannot delete class config')) {
            return res.status(400).json({ error: error.message })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
