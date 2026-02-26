// This file is intentionally CommonJS (.cjs) because sequelize-cli uses require() to load it.
// Used only by sequelize-cli commands (db:migrate, db:migrate:undo, etc.)
// Application runtime uses server/models/index.js directly.

const path = require('path')
require('dotenv').config({
    path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`),
    override: false,
})
require('dotenv').config({
    path: path.resolve(__dirname, '../../.env'),
    override: false,
})

const dbDefaults = {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME     || 'chickenbroadv',
    username: process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect:  'mysql',
    pool: {
        max:  parseInt(process.env.DB_POOL_MAX || '10', 10),
        min:  parseInt(process.env.DB_POOL_MIN || '2',  10),
        acquire: 30000,
        idle:    10000,
    },
    define: {
        underscored: false,
        timestamps:  false,
    },
    logging: false,
}

module.exports = {
    development: dbDefaults,
    test: {
        ...dbDefaults,
        database: process.env.DB_NAME_TEST || 'chickenbroadv_test',
        logging:  false,
    },
    production: {
        ...dbDefaults,
        logging: false,
    },
}
