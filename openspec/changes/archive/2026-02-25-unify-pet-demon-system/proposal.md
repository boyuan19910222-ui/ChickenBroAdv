## Why

猎人和术士的宠物/恶魔系统存在两套并行但不对接的数据：ClassMechanics 定义了丰富的宠物/恶魔变体和技能，但 PetCombatSystem 硬编码了简化的 PET_CONFIG，导致 ClassMechanics 中的数据从未被实际使用。同时，猎人有冗余的 `petAttack` 手动技能（与宠物自动攻击功能重叠），术士的 `summonImp` 只能召唤小鬼（无法召唤其他恶魔类型）。需要统一两个职业的宠物召唤体系，让 ClassMechanics 成为唯一数据源，并使宠物战斗行为更丰富。

## What Changes

- **BREAKING** 删除猎人 `petAttack` 技能，宠物改为纯自动攻击（每回合自动触发，使用 ClassMechanics 定义的技能池）
- **BREAKING** 删除术士 `summonImp` 技能，替换为通用的 `summonDemon` 基础技能，支持按等级解锁 5 种恶魔：
  - Lv1: 小鬼（远程 DPS）
  - Lv4: 虚空行者（坦克）
  - Lv8: 魅魔（控制）
  - Lv12: 地狱猎犬（反法）
  - Lv16: 地狱火（AOE 限时）
- 重构 PetCombatSystem，删除硬编码的 `PET_CONFIG`，改为从 ClassMechanics 读取宠物/恶魔数据
- 统一野外战斗和副本战斗的宠物自动攻击路径，都委托 PetCombatSystem.performAutoAttack
- 宠物/恶魔具有独立技能池（来自 ClassMechanics），自动攻击时按优先级选择未冷却技能，无可用技能则普攻
- 宠物/恶魔死亡后需消耗 AP/mana 重新召唤（使用「召唤野兽」或「召唤恶魔」）
- 术士召唤恶魔时弹出选择面板（与猎人高级宠物选择体验一致）
- 猎人宠物体系保持不变：默认召唤狼，野兽控制天赋 T4 解锁后可选熊/猪/鹰

## Capabilities

### New Capabilities
- `pet-combat-unified`: 统一的宠物/恶魔战斗系统——ClassMechanics 作为唯一数据源，PetCombatSystem 负责创建、自动攻击（含技能池优先级）、死亡/复活流程

### Modified Capabilities
（无现有 spec 被修改）

## Impact

- **数据层**: `GameData.js`（删除 petAttack/summonImp，新增 summonDemon）、`ClassMechanics.js`（术士恶魔等级解锁字段）、`TalentData.js`（术士天赋树适配）、`ActionPointSystem.js`（AP 配置更新）
- **系统层**: `PetCombatSystem.js`（核心重构，读取 ClassMechanics）、`CombatSystem.js`（删除内联宠物自动攻击，委托 PetCombatSystem；更新召唤处理）、`DungeonCombatSystem.js`（对齐新召唤/自动攻击流程）、`EffectSystem.js`（召唤效果适配）
- **UI 层**: `CombatView.vue`（宠物技能按钮移除、召唤选择面板）、`DungeonCombatView.vue`（同上）、`CharacterPanel.vue`（宠物信息展示适配）、`TalentModal.vue`（emoji 映射更新）、`EffectIcons.vue`（效果名称更新）
- **存档兼容**: 需处理已存在 petAttack/summonImp 的旧存档迁移
