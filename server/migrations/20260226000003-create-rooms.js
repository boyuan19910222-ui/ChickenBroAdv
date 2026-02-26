'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('rooms', {
            id: {
                type:      Sequelize.STRING(36),
                allowNull: false,
                primaryKey: true,
            },
            host_id: {
                type:      Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            dungeon_id: {
                type:      Sequelize.STRING(128),
                allowNull: false,
            },
            dungeon_name: {
                type:      Sequelize.STRING(128),
                allowNull: false,
            },
            status: {
                type:         Sequelize.ENUM('waiting', 'in_battle', 'closed'),
                allowNull:    false,
                defaultValue: 'waiting',
            },
            max_players: {
                type:         Sequelize.INTEGER,
                allowNull:    false,
                defaultValue: 4,
            },
            players: {
                type:         Sequelize.JSON,
                allowNull:    false,
                defaultValue: [],
            },
            created_at: {
                type:         Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            battle_started_at: {
                type:      Sequelize.DATE,
                allowNull: true,
            },
            closed_at: {
                type:      Sequelize.DATE,
                allowNull: true,
            },
        })

        await queryInterface.addIndex('rooms', ['status'], { name: 'idx_rooms_status' })
        await queryInterface.addIndex('rooms', ['host_id'], { name: 'idx_rooms_host_id' })
    },

    async down(queryInterface) {
        await queryInterface.dropTable('rooms')
    },
}
