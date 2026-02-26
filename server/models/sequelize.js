import { Sequelize } from 'sequelize'
import config from '../config.js'

const { host, port, name, user, password, poolMax, poolMin } = config.db

export const sequelize = new Sequelize(name, user, password, {
    host,
    port,
    dialect: 'mysql',
    pool: {
        max:     poolMax,
        min:     poolMin,
        acquire: 30000,
        idle:    10000,
    },
    define: {
        underscored: false,
        timestamps:  false,
    },
    logging: false,
})

export default sequelize
