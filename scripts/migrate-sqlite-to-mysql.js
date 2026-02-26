/**
 * scripts/migrate-sqlite-to-mysql.js
 *
 * One-time data migration: copy all rows from the local SQLite database into
 * the online MySQL database via Sequelize models.
 *
 * Usage:
 *   node scripts/migrate-sqlite-to-mysql.js                          # dev, live
 *   node scripts/migrate-sqlite-to-mysql.js --dry-run                # dev, preview
 *   node scripts/migrate-sqlite-to-mysql.js --env=production         # prod, live
 *   node scripts/migrate-sqlite-to-mysql.js --env=production --dry-run
 *
 * Prerequisites:
 *   - .env.development / .env.production filled in with correct DB_* values
 *   - MySQL schema already migrated (run `npm run migrate` first)
 *   - DB_PATH pointing to the SQLite source file (default: ./data/chickenBro.db)
 */

import Database from 'better-sqlite3'
import { Sequelize, DataTypes } from 'sequelize'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── 解析命令行参数 ───────────────────────────────────────────────────────────
const isDryRun = process.argv.includes('--dry-run')
const envArg   = process.argv.find(a => a.startsWith('--env='))
const NODE_ENV = envArg ? envArg.slice(6) : (process.env.NODE_ENV || 'development')

// 加载对应 .env 文件（不覆盖已存在的系统环境变量）
loadEnv({ path: resolve(__dirname, `../.env.${NODE_ENV}`), override: false })
loadEnv({ path: resolve(__dirname, '../.env'),              override: false })

const start = Date.now()

console.log(`\n╔══════════════════════════════════════════════╗`)
console.log(`║   SQLite → MySQL Migration Script            ║`)
console.log(`║   Env : ${NODE_ENV.padEnd(36)} ║`)
console.log(`║   Mode: ${isDryRun ? 'DRY RUN (no writes)         ' : 'LIVE   (writing to MySQL)    '} ║`)
console.log(`╚══════════════════════════════════════════════╝\n`)

// ── 1. Open SQLite source ────────────────────────────────────────────────────

const sqlitePath = process.env.DB_PATH
    ? resolve(process.env.DB_PATH)
    : resolve(__dirname, '../data/chickenBro.db')

console.log(`SQLite source : ${sqlitePath}`)

let sqlite
try {
    sqlite = new Database(sqlitePath, { readonly: true })
} catch (err) {
    console.error(`✖ Cannot open SQLite file: ${err.message}`)
    process.exit(1)
}

// ── 2. Connect to MySQL target ───────────────────────────────────────────────

const DB_HOST     = process.env.DB_HOST     || 'localhost'
const DB_PORT     = process.env.DB_PORT     || '3306'
const DB_NAME     = process.env.DB_NAME     || 'chickenbroadv'
const DB_USER     = process.env.DB_USER     || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD

if (!DB_PASSWORD) {
    console.error(`✖ DB_PASSWORD is required (check .env.${NODE_ENV})`)
    process.exit(1)
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host:    DB_HOST,
    port:    parseInt(DB_PORT, 10),
    dialect: 'mysql',
    logging: false,
})

console.log(`MySQL target  : ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}\n`)

try {
    await sequelize.authenticate()
    console.log('✔ MySQL connection OK\n')
} catch (err) {
    console.error(`✖ Cannot connect to MySQL: ${err.message}`)
    process.exit(1)
}

// ── 3. Read SQLite data ──────────────────────────────────────────────────────

const users        = sqlite.prepare('SELECT * FROM users').all()
const characters   = sqlite.prepare('SELECT * FROM characters').all()
const battleRecords = sqlite.prepare('SELECT * FROM battle_records').all()

console.log(`Rows to migrate:`)
console.log(`  users          : ${users.length}`)
console.log(`  characters     : ${characters.length}`)
console.log(`  battle_records : ${battleRecords.length}\n`)

if (isDryRun) {
    console.log('DRY RUN — no data written to MySQL.')
    console.log(`\nCompleted in ${Date.now() - start}ms`)
    sqlite.close()
    await sequelize.close()
    process.exit(0)
}

// ── 4. Migrate data (live run) ───────────────────────────────────────────────

const t = await sequelize.transaction()

try {
    let insertedUsers = 0
    let insertedChars = 0
    let insertedBattle = 0

    // ── users ──────────────────────────────────────────────────────────────
    for (const row of users) {
        await sequelize.query(
            `INSERT INTO users
                (id, username, password_hash, nickname, created_at, last_login,
                 oauth_provider, oauth_id, auto_login)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE username = username`,
            {
                replacements: [
                    row.id, row.username, row.password_hash, row.nickname,
                    row.created_at  || null,
                    row.last_login  || null,
                    row.oauth_provider || null,
                    row.oauth_id    || null,
                    row.auto_login  || 0,
                ],
                transaction: t,
            }
        )
        insertedUsers++
    }
    console.log(`  ✔ users          : ${insertedUsers} rows inserted`)

    // ── characters ─────────────────────────────────────────────────────────
    for (const row of characters) {
        await sequelize.query(
            `INSERT INTO characters
                (id, user_id, name, \`class\`, level, game_state,
                 created_at, updated_at, last_played_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name = name`,
            {
                replacements: [
                    row.id, row.user_id, row.name, row.class, row.level,
                    row.game_state,
                    row.created_at     || null,
                    row.updated_at     || null,
                    row.last_played_at || null,
                ],
                transaction: t,
            }
        )
        insertedChars++
    }
    console.log(`  ✔ characters     : ${insertedChars} rows inserted`)

    // ── battle_records ──────────────────────────────────────────────────────
    for (const row of battleRecords) {
        await sequelize.query(
            `INSERT INTO battle_records
                (id, user_id, dungeon_id, result, duration, created_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE dungeon_id = dungeon_id`,
            {
                replacements: [
                    row.id, row.user_id, row.dungeon_id, row.result,
                    row.duration   || null,
                    row.created_at || null,
                ],
                transaction: t,
            }
        )
        insertedBattle++
    }
    console.log(`  ✔ battle_records : ${insertedBattle} rows inserted`)

    await t.commit()
    console.log('\n✔ All data committed to MySQL.')

} catch (err) {
    await t.rollback()
    console.error(`\n✖ Migration failed — rolled back: ${err.message}`)
    sqlite.close()
    await sequelize.close()
    process.exit(1)
}

// ── 5. Summary ───────────────────────────────────────────────────────────────

const elapsed = Date.now() - start
console.log(`\n╔══════════════════════════════════════════════╗`)
console.log(`║  Migration complete in ${String(elapsed + 'ms').padEnd(20)} ║`)
console.log(`╚══════════════════════════════════════════════╝\n`)

sqlite.close()
await sequelize.close()
