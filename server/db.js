import Database from 'better-sqlite3'
import config from './config.js'
import { mkdirSync } from 'fs'
import { dirname } from 'path'

/**
 * Initialize the SQLite database.
 * Accepts an optional dbPath; defaults to config.dbPath.
 * Pass ':memory:' for in-memory databases (useful for tests).
 */
export function createDatabase(dbPath) {
    const resolvedPath = dbPath ?? config.dbPath

    // Ensure parent directory exists for file-based databases
    if (resolvedPath !== ':memory:') {
        mkdirSync(dirname(resolvedPath), { recursive: true })
    }

    const db = new Database(resolvedPath)

    // Enable WAL mode for better concurrency (no-op for :memory:)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')

    // Create tables
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            nickname TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            oauth_provider TEXT,
            oauth_id TEXT,
            auto_login INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            class TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            game_state TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_played_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS battle_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            dungeon_id TEXT NOT NULL,
            result TEXT NOT NULL,
            duration INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- Indexes for characters table
        CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);
        CREATE INDEX IF NOT EXISTS idx_characters_last_played ON characters(user_id, last_played_at DESC);

        -- Trigger: limit 5 characters per user
        CREATE TRIGGER IF NOT EXISTS limit_characters_per_user
        BEFORE INSERT ON characters
        WHEN (SELECT COUNT(*) FROM characters WHERE user_id = NEW.user_id) >= 5
        BEGIN
            SELECT RAISE(ABORT, 'Character limit reached (max 5)');
        END;
    `)

    // Migration: Add auto_login column if it doesn't exist
    try {
        db.exec('ALTER TABLE users ADD COLUMN auto_login INTEGER DEFAULT 0')
    } catch (e) {
        // Column already exists, ignore error
        if (!e.message.includes('duplicate column name')) {
            throw e
        }
    }

    return db
}

// Prepared statement factories — call with a db instance
export function prepareStatements(db) {
    return {
        // User statements
        insertUser: db.prepare(
            'INSERT INTO users (username, password_hash, nickname) VALUES (?, ?, ?)'
        ),
        findUserByUsername: db.prepare(
            'SELECT * FROM users WHERE username = ?'
        ),
        findUserById: db.prepare(
            'SELECT id, username, nickname, created_at, last_login, auto_login FROM users WHERE id = ?'
        ),
        updateLastLogin: db.prepare(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
        ),
        updateAutoLogin: db.prepare(
            'UPDATE users SET auto_login = ? WHERE id = ?'
        ),

        // Character statements
        insertCharacter: db.prepare(
            'INSERT INTO characters (user_id, name, class, level, game_state, last_played_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
        ),
        findCharactersByUserId: db.prepare(
            'SELECT id, user_id, name, class, level, created_at, updated_at, last_played_at FROM characters WHERE user_id = ? ORDER BY last_played_at DESC'
        ),
        findCharacterById: db.prepare(
            'SELECT * FROM characters WHERE id = ?'
        ),
        findCharacterByIdAndUserId: db.prepare(
            'SELECT * FROM characters WHERE id = ? AND user_id = ?'
        ),
        updateCharacter: db.prepare(
            'UPDATE characters SET name = ?, class = ?, level = ?, game_state = ?, updated_at = CURRENT_TIMESTAMP, last_played_at = CURRENT_TIMESTAMP WHERE id = ?'
        ),
        updateCharacterGameState: db.prepare(
            'UPDATE characters SET game_state = ?, level = ?, updated_at = CURRENT_TIMESTAMP, last_played_at = CURRENT_TIMESTAMP WHERE id = ?'
        ),
        deleteCharacter: db.prepare(
            'DELETE FROM characters WHERE id = ? AND user_id = ?'
        ),
        countCharactersByUserId: db.prepare(
            'SELECT COUNT(*) as count FROM characters WHERE user_id = ?'
        ),

        // Battle record statements
        insertBattleRecord: db.prepare(
            'INSERT INTO battle_records (user_id, dungeon_id, result, duration) VALUES (?, ?, ?, ?)'
        ),
        getBattleRecords: db.prepare(
            'SELECT * FROM battle_records WHERE user_id = ? ORDER BY created_at DESC'
        ),
    }
}

// Default singleton for production use
let _db = null
let _stmts = null

export function getDb() {
    if (!_db) {
        _db = createDatabase()
        _stmts = prepareStatements(_db)
    }
    return _db
}

export function getStatements() {
    if (!_stmts) {
        getDb()
    }
    return _stmts
}

export function closeDb() {
    if (_db) {
        _db.close()
        _db = null
        _stmts = null
    }
}
