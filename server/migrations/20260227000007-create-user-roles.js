'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // ── user_roles ──────────────────────────────────────────────────────
        await queryInterface.createTable('user_roles', {
            id: {
                type:          Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey:    true,
            },
            user_id: {
                type:       Sequelize.INTEGER.UNSIGNED,
                allowNull:   false,
                unique:     true,
                references:  { model: 'users', key: 'id' },
                onDelete:    'CASCADE',
            },
            is_admin: {
                type:         Sequelize.TINYINT(1),
                allowNull:     false,
                defaultValue: 0,
            },
            created_at: {
                type:         Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        })

        // Index for user_id
        await queryInterface.addIndex('user_roles', ['user_id'], {
            name: 'idx_user_roles_user',
        })
    },

    async down(queryInterface) {
        await queryInterface.dropTable('user_roles')
    },
}
