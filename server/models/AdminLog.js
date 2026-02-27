import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize.js'

export class AdminLog extends Model {}

AdminLog.init(
    {
        id: {
            type:          DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey:    true,
        },
        admin_user_id: {
            type:       DataTypes.INTEGER.UNSIGNED,
            allowNull:   false,
        },
        operation_type: {
            type:      DataTypes.STRING(32),
            allowNull:  false,
        },
        target_id: {
            type:      DataTypes.INTEGER.UNSIGNED,
            allowNull:  true,
        },
        old_value: {
            type:      DataTypes.TEXT,
            allowNull:  true,
        },
        new_value: {
            type:      DataTypes.TEXT,
            allowNull:  true,
        },
        created_at: {
            type:         DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName:   'admin_logs',
        underscored: false,
        timestamps:  false,
    }
)
