import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize.js'

export class ChatMessage extends Model {}

ChatMessage.init(
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
        nickname: {
            type:      DataTypes.STRING(64),
            allowNull: false,
        },
        content: {
            type:      DataTypes.STRING(200),
            allowNull: false,
        },
        type: {
            type:         DataTypes.STRING(16),
            allowNull:    false,
            defaultValue: 'lobby',
        },
        room_id: {
            type:      DataTypes.STRING(64),
            allowNull: true,
        },
        timestamp: {
            type:      DataTypes.BIGINT,
            allowNull: false,
        },
        created_at: {
            type:         DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName:   'chat_messages',
        underscored: false,
        timestamps:  false,
    }
)
