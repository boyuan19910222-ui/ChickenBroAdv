import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize.js'

export class User extends Model {}

User.init(
    {
        id: {
            type:          DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey:    true,
        },
        username: {
            type:      DataTypes.STRING(255),
            allowNull: false,
            unique:    true,
        },
        password_hash: {
            type:      DataTypes.STRING(255),
            allowNull: false,
        },
        nickname: {
            type:      DataTypes.STRING(255),
            allowNull: false,
        },
        created_at: {
            type:         DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        last_login: {
            type:      DataTypes.DATE,
            allowNull: true,
        },
        oauth_provider: {
            type:      DataTypes.STRING(64),
            allowNull: true,
        },
        oauth_id: {
            type:      DataTypes.STRING(255),
            allowNull: true,
        },
        auto_login: {
            type:         DataTypes.TINYINT,
            defaultValue: 0,
        },
        is_admin: {
            type:         DataTypes.TINYINT,
            allowNull:    false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName:   'users',
        underscored: false,
        timestamps:  false,
    }
)
