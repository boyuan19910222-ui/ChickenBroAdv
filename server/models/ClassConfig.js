import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize.js'

export class ClassConfig extends Model {}

ClassConfig.init(
    {
        id: {
            type:          DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey:    true,
        },
        class_id: {
            type:      DataTypes.STRING(32),
            allowNull: false,
            unique:    true,
        },
        name: {
            type:      DataTypes.STRING(32),
            allowNull: false,
        },
        base_stats: {
            type:      DataTypes.JSON,
            allowNull: false,
        },
        growth_per_level: {
            type:      DataTypes.JSON,
            allowNull: false,
        },
        base_skills: {
            type:      DataTypes.JSON,
            allowNull: false,
        },
        resource_type: {
            type:      DataTypes.STRING(16),
            allowNull: false,
        },
        resource_max: {
            type:      DataTypes.INTEGER,
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
    },
    {
        sequelize,
        tableName:   'class_configs',
        underscored: false,
        timestamps:  false,
    }
)
