/**
 * 全局兼容层
 * 现有系统代码通过 window.XXX 互相引用
 * 此文件将 ES module 导出挂载到 window 上以保证兼容性
 * 随着重构的推进，可逐步移除此文件
 */
import { GameData } from '@/data/GameData.js'
import { ClassMechanics } from '@/data/ClassMechanics.js'
import { TalentData } from '@/data/TalentData.js'
import { WailingCaverns, DungeonData } from '@/data/dungeons/WailingCaverns.js'
import { DungeonRegistry } from '@/data/dungeons/DungeonRegistry.js'

import {
    ActionPointSystem,
    BossPhaseSystem,
    PartyFormationSystem,
    PetCombatSystem,
    PositioningSystem,
    ThreatSystem,
    TurnOrderSystem,
    CharacterSystem,
    ArmorTypes,
    WeaponTypes,
    ResourceTypes,
    CombatSystem,
    DungeonCombatSystem,
    TalentSystem,
} from '@/systems/index.js'

import { GameEngine } from '@/core/GameEngine.js'
import { EventBus } from '@/core/EventBus.js'
import { StateManager } from '@/core/StateManager.js'
import { SaveManager } from '@/core/SaveManager.js'

// 挂载数据到全局
window.GameData = GameData
window.ClassMechanics = ClassMechanics
window.TalentData = TalentData
window.WailingCaverns = WailingCaverns
window.DungeonData = DungeonData
window.DungeonRegistry = DungeonRegistry

// 挂载系统到全局
window.ActionPointSystem = ActionPointSystem
window.BossPhaseSystem = BossPhaseSystem
window.PartyFormationSystem = PartyFormationSystem
window.PetCombatSystem = PetCombatSystem
window.PositioningSystem = PositioningSystem
window.ThreatSystem = ThreatSystem
window.TurnOrderSystem = TurnOrderSystem
window.CharacterSystem = CharacterSystem
window.ArmorTypes = ArmorTypes
window.WeaponTypes = WeaponTypes
window.ResourceTypes = ResourceTypes
window.CombatSystem = CombatSystem
window.DungeonCombatSystem = DungeonCombatSystem
window.TalentSystem = TalentSystem

// 挂载核心到全局
window.GameEngine = GameEngine
window.EventBus = EventBus
window.StateManager = StateManager
window.SaveManager = SaveManager

console.log('🔗 全局兼容层已加载')
