'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // ── admin_logs ──────────────────────────────────────────────────────
        await queryInterface.createTable('admin_logs', {
            id: {
                type:          Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey:    true,
            },
            admin_user_id: {
                type:       Sequelize.INTEGER.UNSIGNED,
                allowNull:   false,
                references:  { model: 'users', key: 'id' },
                onDelete:    'CASCADE',
            },
            operation_type: {
                type:      Sequelize.STRING(32),
                allowNull:  false,
            },
            target_id: {
                type:      Sequelize.INTEGER.UNSIGNED,
                allowNull:  true,
            },
            old_value: {
                type:      Sequelize.TEXT,
                allowNull:  true,
            },
            new_value: {
                type:      Sequelize.TEXT,
                allowNull:  true,
            },
            created_at: {
                type:         Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        })

        // Indexes
        await queryInterface.addIndex('admin_logs', ['admin_user_id'], {
            name: 'idx_admin_logs_user',
        })
        await queryInterface.addIndex('admin_logs', ['operation_type'], {
            name: 'idx_admin_logs_operation',
        })
        await queryInterface.addIndex('admin_logs', ['created_at'], {
            name: 'idx_admin_logs_created',
        })
    },

    async down(queryInterface) {
        await queryInterface.dropTable('admin_logs')
    },
}
