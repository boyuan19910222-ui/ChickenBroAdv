'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('class_configs', {
            id: {
                type:          Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey:    true,
            },
            class_id: {
                type:      Sequelize.STRING(32),
                allowNull: false,
                unique:    true,
            },
            name: {
                type:      Sequelize.STRING(32),
                allowNull: false,
            },
            base_stats: {
                type:      Sequelize.JSON,
                allowNull: false,
            },
            growth_per_level: {
                type:      Sequelize.JSON,
                allowNull: false,
            },
            base_skills: {
                type:      Sequelize.JSON,
                allowNull: false,
            },
            resource_type: {
                type:      Sequelize.STRING(16),
                allowNull: false,
            },
            resource_max: {
                type:      Sequelize.INTEGER,
                allowNull: false,
            },
            created_at: {
                type:         Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type:         Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        })
    },

    async down(queryInterface) {
        await queryInterface.dropTable('class_configs')
    },
}
