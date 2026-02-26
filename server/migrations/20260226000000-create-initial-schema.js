'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // ── users ─────────────────────────────────────────────────────────────
        await queryInterface.createTable('users', {
            id: {
                type:          Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey:    true,
            },
            username: {
                type:      Sequelize.STRING(255),
                allowNull: false,
                unique:    true,
            },
            password_hash: {
                type:      Sequelize.STRING(255),
                allowNull: false,
            },
            nickname: {
                type:      Sequelize.STRING(255),
                allowNull: false,
            },
            created_at: {
                type:         Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            last_login: {
                type:      Sequelize.DATE,
                allowNull: true,
            },
            oauth_provider: {
                type:      Sequelize.STRING(64),
                allowNull: true,
            },
            oauth_id: {
                type:      Sequelize.STRING(255),
                allowNull: true,
            },
            auto_login: {
                type:         Sequelize.TINYINT,
                defaultValue: 0,
            },
        })

        // ── characters ────────────────────────────────────────────────────────
        await queryInterface.createTable('characters', {
            id: {
                type:          Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey:    true,
            },
            user_id: {
                type:       Sequelize.INTEGER.UNSIGNED,
                allowNull:  false,
                references: { model: 'users', key: 'id' },
                onDelete:   'CASCADE',
            },
            name: {
                type:      Sequelize.STRING(255),
                allowNull: false,
            },
            class: {
                type:      Sequelize.STRING(64),
                allowNull: false,
            },
            level: {
                type:         Sequelize.INTEGER,
                defaultValue: 1,
            },
            // MEDIUMTEXT: up to 16 MB — safe for large game_state JSON blobs
            game_state: {
                type:      'MEDIUMTEXT',
                allowNull: false,
            },
            created_at: {
                type:         Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type:         Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
            last_played_at: {
                type:      Sequelize.DATE,
                allowNull: true,
            },
        })

        // indexes for characters
        await queryInterface.addIndex('characters', ['user_id'], {
            name: 'idx_characters_user',
        })
        await queryInterface.addIndex('characters', ['user_id', 'last_played_at'], {
            name:  'idx_characters_last_played',
            order: [['last_played_at', 'DESC']],
        })

        // trigger: limit 5 characters per user
        await queryInterface.sequelize.query(`
            CREATE TRIGGER limit_characters_per_user
            BEFORE INSERT ON characters
            FOR EACH ROW
            BEGIN
                IF (SELECT COUNT(*) FROM characters WHERE user_id = NEW.user_id) >= 5 THEN
                    SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Character limit reached (max 5)';
                END IF;
            END
        `)

        // ── battle_records ────────────────────────────────────────────────────
        await queryInterface.createTable('battle_records', {
            id: {
                type:          Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey:    true,
            },
            user_id: {
                type:       Sequelize.INTEGER.UNSIGNED,
                allowNull:  false,
                references: { model: 'users', key: 'id' },
            },
            dungeon_id: {
                type:      Sequelize.STRING(128),
                allowNull: false,
            },
            result: {
                type:      Sequelize.STRING(32),
                allowNull: false,
            },
            duration: {
                type:      Sequelize.INTEGER,
                allowNull: true,
            },
            created_at: {
                type:         Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        })
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS limit_characters_per_user')
        await queryInterface.dropTable('battle_records')
        await queryInterface.dropTable('characters')
        await queryInterface.dropTable('users')
    },
}
