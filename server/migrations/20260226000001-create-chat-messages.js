'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('chat_messages', {
            id: {
                type:          Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey:    true,
            },
            user_id: {
                type:      Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            nickname: {
                type:      Sequelize.STRING(64),
                allowNull: false,
            },
            content: {
                type:      Sequelize.STRING(200),
                allowNull: false,
            },
            type: {
                type:         Sequelize.STRING(16),
                allowNull:    false,
                defaultValue: 'lobby',
            },
            room_id: {
                type:      Sequelize.STRING(64),
                allowNull: true,
            },
            timestamp: {
                type:      Sequelize.BIGINT,
                allowNull: false,
            },
            created_at: {
                type:         Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        })

        await queryInterface.addIndex('chat_messages', ['type'], { name: 'idx_chat_messages_type' })
        await queryInterface.addIndex('chat_messages', ['created_at'], { name: 'idx_chat_messages_created_at' })
        await queryInterface.addIndex('chat_messages', ['room_id'], { name: 'idx_chat_messages_room_id' })
    },

    async down(queryInterface) {
        await queryInterface.dropTable('chat_messages')
    },
}
