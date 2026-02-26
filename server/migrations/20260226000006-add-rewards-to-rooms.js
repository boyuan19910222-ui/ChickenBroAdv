'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('rooms', 'rewards', {
            type:         Sequelize.JSON,
            allowNull:    true,
            defaultValue: null,
            after:        'battle_state',
        })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('rooms', 'rewards')
    },
}
