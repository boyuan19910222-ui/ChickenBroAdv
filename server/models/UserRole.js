import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize.js'

export class UserRole extends Model {}

UserRole.init(
    {
        id: {
            type:          DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey:    true,
        },
        user_id: {
            type:       DataTypes.INTEGER.UNSIGNED,
            allowNull:   false,
            unique:     true,
        },
        is_admin: {
            type:         DataTypes.TINYINT(1),
            allowNull:     false,
            defaultValue:  0,
        },
        created_at: {
            type:         DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName:   'user_roles',
        underscored: false,
        timestamps:  false,
    }
)
