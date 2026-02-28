'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'is_admin', {
            type:        Sequelize.TINYINT,
            allowNull:    false,
            defaultValue: 0,
        })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('users', 'is_admin')
    },
}
