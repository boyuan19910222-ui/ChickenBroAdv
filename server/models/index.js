import { sequelize } from './sequelize.js'
import { User }         from './User.js'
import { Character }    from './Character.js'
import { BattleRecord } from './BattleRecord.js'
import { ChatMessage }  from './ChatMessage.js'
import { ClassConfig }  from './ClassConfig.js'
import { Room }         from './Room.js'

// ── Associations ─────────────────────────────────────────────────────────────
User.hasMany(Character,      { foreignKey: 'user_id', onDelete: 'CASCADE' })
Character.belongsTo(User,    { foreignKey: 'user_id' })

User.hasMany(BattleRecord,   { foreignKey: 'user_id' })
BattleRecord.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(ChatMessage,    { foreignKey: 'user_id' })
ChatMessage.belongsTo(User,  { foreignKey: 'user_id' })

export { sequelize, User, Character, BattleRecord, ChatMessage, ClassConfig, Room }
export default sequelize
