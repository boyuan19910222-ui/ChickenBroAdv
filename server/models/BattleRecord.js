import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize.js'

export class BattleRecord extends Model {}

BattleRecord.init(
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
        dungeon_id: {
            type:      DataTypes.STRING(128),
            allowNull: false,
        },
        result: {
            type:      DataTypes.STRING(32),
            allowNull: false,
        },
        duration: {
            type:      DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: {
            type:         DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName:   'battle_records',
        underscored: false,
        timestamps:  false,
    }
)
