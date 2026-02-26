import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize.js'

export class Room extends Model {}

Room.init(
    {
        id: {
            type:      DataTypes.STRING(36),
            allowNull: false,
            primaryKey: true,
        },
        host_id: {
            type:      DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        dungeon_id: {
            type:      DataTypes.STRING(128),
            allowNull: false,
        },
        dungeon_name: {
            type:      DataTypes.STRING(128),
            allowNull: false,
        },
        status: {
            type:         DataTypes.ENUM('waiting', 'in_battle', 'closed'),
            allowNull:    false,
            defaultValue: 'waiting',
        },
        max_players: {
            type:         DataTypes.INTEGER,
            allowNull:    false,
            defaultValue: 4,
        },
        players: {
            type:         DataTypes.JSON,
            allowNull:    false,
            defaultValue: [],
        },
        created_at: {
            type:         DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        battle_started_at: {
            type:      DataTypes.DATE,
            allowNull: true,
        },
        closed_at: {
            type:      DataTypes.DATE,
            allowNull: true,
        },
        battle_state: {
            // 持久化战斗启动时的 seed 与 party snapshots，供断线重连恢复 battle:init
            type:         DataTypes.JSON,
            allowNull:    true,
            defaultValue: null,
        },
    },
    {
        sequelize,
        tableName:   'rooms',
        underscored: false,
        timestamps:  false,
    }
)
