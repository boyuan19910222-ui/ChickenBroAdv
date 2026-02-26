import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Load .env.<NODE_ENV> from project root, then fall back to .env
const __dirname = dirname(fileURLToPath(import.meta.url))
const env = process.env.NODE_ENV || 'development'
loadEnv({ path: resolve(__dirname, `../.env.${env}`), override: false })
loadEnv({ path: resolve(__dirname, '../.env'),          override: false })

// Validate required environment variables in production
if (env === 'production' && !process.env.DB_PASSWORD) {
    throw new Error('Missing required environment variable: DB_PASSWORD')
}

export default {
    port: process.env.PORT || 3001,
    jwtSecret: process.env.JWT_SECRET || 'chicken-bro-dev-secret-key',
    jwtExpiresIn: '7d',              // 普通登录 token 有效期
    jwtExpiresInAutoLogin: '30d',    // 自动登录 token 有效期
    bcryptRounds: 12,
    dbPath: process.env.DB_PATH || './data/chickenBro.db',
    maxRoomWaitTime: 120000,  // 2 minutes
    maxPlayersPerRoom: 5,

    // MySQL connection settings
    db: {
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || '3306', 10),
        name:     process.env.DB_NAME     || 'chickenbroadv',
        user:     process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        poolMax:  parseInt(process.env.DB_POOL_MAX || '10', 10),
        poolMin:  parseInt(process.env.DB_POOL_MIN || '2',  10),
    },
}
