'use strict'

/**
 * Seed Initial Admin User
 * 设置初始管理员账号
 *
 * 使用说明：
 * 1. 在执行此迁移前，先通过正常注册流程创建一个用户账号
 * 2. 或者修改此文件中的 DEFAULT_ADMIN_USERNAME 为您想要设置为管理员的用户名
 * 3. 执行迁移：npm run migrate
 *
 * 如果不想使用种子数据，也可以在部署后手动执行 SQL：
 *   UPDATE users SET is_admin = 1 WHERE username = 'your_username';
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 默认管理员用户名（可修改为实际用户名）
        const DEFAULT_ADMIN_USERNAME = 'admin'

        // 查找用户并设置为管理员
        const [users] = await queryInterface.sequelize.query(
            `UPDATE users SET is_admin = 1 WHERE username = :username`,
            {
                replacements: { username: DEFAULT_ADMIN_USERNAME },
                type: Sequelize.QueryTypes.UPDATE
            }
        )

        console.log(`Admin user '${DEFAULT_ADMIN_USERNAME}' has been granted admin privileges.`)
    },

    async down(queryInterface) {
        // 回滚：移除管理员权限
        const DEFAULT_ADMIN_USERNAME = 'admin'

        await queryInterface.sequelize.query(
            `UPDATE users SET is_admin = 0 WHERE username = :username`,
            {
                replacements: { username: DEFAULT_ADMIN_USERNAME },
                type: Sequelize.QueryTypes.UPDATE
            }
        )

        console.log(`Admin privileges removed for user '${DEFAULT_ADMIN_USERNAME}'.`)
    },
}
