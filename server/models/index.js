import { sequelize } from './sequelize.js'
import { User }         from './User.js'
import { Character }    from './Character.js'
import { BattleRecord } from './BattleRecord.js'

// ── Associations ─────────────────────────────────────────────────────────────
User.hasMany(Character,      { foreignKey: 'user_id', onDelete: 'CASCADE' })
Character.belongsTo(User,    { foreignKey: 'user_id' })

User.hasMany(BattleRecord,   { foreignKey: 'user_id' })
BattleRecord.belongsTo(User, { foreignKey: 'user_id' })

export { sequelize, User, Character, BattleRecord }
export default sequelize
