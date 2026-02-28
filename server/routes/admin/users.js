/**
 * Admin API Routes - Users
 * 管理员 API - 用户管理路由
 */
import { Router } from 'express'
import { User, Character } from '../../models/index.js'
import { Op } from 'sequelize'

/**
 * Create admin users router.
 * @param {object} stmts - Database statement adapters
 * @returns {Router}
 */
export function createUserAdminRouter() {
    const router = Router()

    // ── GET /api/admin/users ─────────────────────────────
    // 获取用户列表（支持分页、搜索）
    router.get('/', async (req, res) => {
        try {
            const { page = 1, pageSize = 20, search = '' } = req.query
            const pageNum = parseInt(page, 10)
            const pageSizeNum = parseInt(pageSize, 10)

            // 构建查询条件
            const whereCondition = search ? {
                [Op.or]: [
                    { username: { [Op.like]: `%${search}%` } },
                    { nickname: { [Op.like]: `%${search}%` } }
                ]
            } : {}

            // 获取总数
            const total = await User.count({ where: whereCondition })

            // 获取分页数据
            const users = await User.findAll({
                where: whereCondition,
                attributes: ['id', 'username', 'nickname', 'is_admin', 'created_at', 'last_login'],
                limit: pageSizeNum,
                offset: (pageNum - 1) * pageSizeNum,
                order: [['created_at', 'DESC']]
            })

            // 获取每个用户的角色数量
            const userIds = users.map(u => u.id)
            const characterCounts = await Character.findAll({
                where: { user_id: { [Op.in]: userIds } },
                attributes: ['user_id'],
                group: ['user_id']
            }).then(rows => {
                const counts = {}
                rows.forEach(r => {
                    counts[r.user_id] = r.count || 0
                })
                return counts
            })

            // 返回数据
            return res.json({
                data: users,
                pagination: {
                    total,
                    page: pageNum,
                    pageSize: pageSizeNum,
                    totalPages: Math.ceil(total / pageSizeNum)
                }
            })
        } catch (err) {
            console.error('[admin/users]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── GET /api/admin/users/:id ─────────────────────────
    // 获取单个用户详情
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params
            const user = await User.findOne({
                where: { id: parseInt(id, 10) },
                attributes: ['id', 'username', 'nickname', 'is_admin', 'created_at', 'last_login', 'auto_login', 'oauth_provider', 'oauth_id']
            })

            if (!user) {
                return res.status(404).json({ error: 'USER_NOT_FOUND', message: '用户不存在' })
            }

            return res.json({ data: user })
        } catch (err) {
            console.error('[admin/users/:id]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── PUT /api/admin/users/:id ─────────────────────────
    // 更新用户信息（nickname、is_admin、auto_login）
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params
            const { nickname, is_admin, auto_login } = req.body || {}

            // 验证用户存在
            const user = await User.findOne({ where: { id: parseInt(id, 10) } })
            if (!user) {
                return res.status(404).json({ error: 'USER_NOT_FOUND', message: '用户不存在' })
            }

            // 构建更新数据
            const updateData = {}
            if (nickname !== undefined) updateData.nickname = nickname
            if (is_admin !== undefined) updateData.is_admin = is_admin ? 1 : 0
            if (auto_login !== undefined) updateData.auto_login = auto_login ? 1 : 0

            // 执行更新
            await User.update(updateData, { where: { id: parseInt(id, 10) } })

            // 返回更新后的用户信息
            const updatedUser = await User.findOne({
                where: { id: parseInt(id, 10) },
                attributes: ['id', 'username', 'nickname', 'is_admin', 'created_at', 'last_login', 'auto_login']
            })

            return res.json({ data: updatedUser })
        } catch (err) {
            console.error('[admin/users PUT]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    // ── DELETE /api/admin/users/:id ─────────────────────────
    // 删除用户（级联删除关联角色）
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params
            const userId = parseInt(id, 10)

            // 验证用户存在
            const user = await User.findOne({ where: { id: userId } })
            if (!user) {
                return res.status(404).json({ error: 'USER_NOT_FOUND', message: '用户不存在' })
            }

            // 删除用户（由于外键约束 ON DELETE CASCADE，关联角色会自动删除）
            await User.destroy({ where: { id: userId } })

            return res.status(204).send()
        } catch (err) {
            console.error('[admin/users DELETE]', err)
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: '服务器内部错误' })
        }
    })

    return router
}
