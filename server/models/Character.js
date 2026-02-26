import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize.js'

export class Character extends Model {}

Character.init(
    {
        id: {
            type:          DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey:    true,
        },
        user_id: {
            type:      DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        name: {
            type:      DataTypes.STRING(255),
            allowNull: false,
        },
        // `class` is a reserved word in JS; Sequelize field name can still be 'class'
        class: {
            field:     'class',
            type:      DataTypes.STRING(64),
            allowNull: false,
        },
        level: {
            type:         DataTypes.INTEGER,
            defaultValue: 1,
        },
        // MEDIUMTEXT supports up to 16MB, safe for large game_state JSON strings
        game_state: {
            type:      DataTypes.TEXT('medium'),
            allowNull: false,
        },
        created_at: {
            type:         DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type:         DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        last_played_at: {
            type:      DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName:   'characters',
        underscored: false,
        timestamps:  false,
    }
)
