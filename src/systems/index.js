/**
 * 系统注册表 - 将所有游戏系统导出
 * 部分系统为静态工具对象，部分为需要实例化的类
 */

// 静态工具系统
export { ActionPointSystem } from './ActionPointSystem.js'
export { BossPhaseSystem } from './BossPhaseSystem.js'
export { PartyFormationSystem } from './PartyFormationSystem.js'
export { PetCombatSystem } from './PetCombatSystem.js'
export { PositioningSystem } from './PositioningSystem.js'
export { ThreatSystem } from './ThreatSystem.js'
export { TurnOrderSystem } from './TurnOrderSystem.js'

// 需要实例化的类系统
export { CharacterSystem, ArmorTypes, WeaponTypes, ResourceTypes } from './CharacterSystem.js'
export { CombatSystem } from './CombatSystem.js'
export { DungeonCombatSystem } from './DungeonCombatSystem.js'
export { EquipmentSystem } from './EquipmentSystem.js'
export { default as LootSystem } from './LootSystem.js'
export { TalentSystem } from './TalentSystem.js'
export { QuestSystem } from './QuestSystem.js'
