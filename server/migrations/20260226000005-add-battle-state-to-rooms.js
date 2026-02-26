'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('rooms', 'battle_state', {
            type:         Sequelize.JSON,
            allowNull:    true,
            defaultValue: null,
            after:        'closed_at',
        })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('rooms', 'battle_state')
    },
}
