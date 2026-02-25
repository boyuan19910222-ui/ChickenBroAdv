## Why

当前装备系统存在严重的双轨不一致问题（PlayerSchema 5 槽位 vs EquipmentData 9 槽位），且缺少关键的装备槽位（手腕、腰带、披风、项链、戒指、饰品）、双手武器/双持机制、护甲值/武器伤害值独立字段、以及装备穿脱交互 UI。需要统一并扩展为完整的 16 槽位 WoW 风格装备系统，支撑后续的装备掉落、副本奖励等核心玩法。

## What Changes

- **BREAKING** 装备槽位从 9 个扩展到 16 个：新增手腕(wrists)、腰带(waist)、披风(back)、项链(neck)、戒指×2(finger1/finger2)、饰品×2(trinket1/trinket2)；删除独立的远程(ranged)槽位
- **BREAKING** 统一 PlayerSchema 和 EquipmentData 的槽位定义，消除双轨不一致
- **BREAKING** 职业武器类型限制从单数组 `weaponTypes: []` 改为分组对象 `weaponTypes: { oneHand: [], twoHand: [] }`，区分单手/双手武器能力
- 剑/斧/锤新增双手变体（双手剑、双手斧、双手锤），与单手版本共存
- 弓/枪/弩从独立 ranged 槽改为双手武器，占据 mainHand + offHand
- 新增副手物品类型(offhand category)：纯属性副手（书、水晶球等），供法师/术士/牧师/德鲁伊使用
- 新增双持系统：战士/盗贼/猎人天生双持，萨满需增强天赋解锁；副手武器 50% 伤害惩罚
- 新增双手武器互斥逻辑：穿双手武器自动卸下副手，穿副手自动卸下双手主手
- 护甲类装备新增独立 `armorValue` 字段，基于护甲类型系数 × 物品等级 × 品质
- 武器类装备新增 `damage: { min, max }` 字段，每次攻击随机取值
- 新增属性预算公式：`totalStatPoints = floor(itemLevel × slotWeight × qualityMultiplier)`，保证同物品等级+同品质+同槽位权重的装备属性总和一致
- 新增物理减伤公式：`reduction% = totalArmor / (totalArmor + K × attackerLevel)`
- 装备唯一性系统：`unique: true` 的装备同一角色只能装备一件
- 项链/戒指无耐久度；披风有护甲值和耐久度（cloth 系数，通用不限职业）
- 饰品预留特殊效果接口（本期作为纯属性棒，后续单独设计）
- 背包容量从 20 扩展到 40 格
- 新增经典 WoW 风格装备面板 UI（左列护甲、右列饰品、底部武器、中间角色模型）
- 新增装备穿戴/卸下/交换交互
- 新增装备对比 tooltip（绿色表示提升、红色表示下降）
- 萨满增强天赋树新增"双武器战斗"天赋

## Capabilities

### New Capabilities
- `equipment-slots`: 16 槽位定义、槽位权重、分类(armor/weapon/shield/offhand/accessory)
- `weapon-classification`: 武器单手/双手分类体系、剑斧锤双变体、weaponHand 字段
- `dual-wield-system`: 双持能力（天生/天赋解锁）、副手 50% 惩罚、双手武器互斥逻辑
- `armor-value-system`: 护甲值计算公式、护甲类型系数、物理减伤公式
- `weapon-damage-system`: 武器伤害 {min, max} 范围、伤害计算公式
- `stat-budget-formula`: 属性预算公式、槽位权重、品质缩放、同等级一致性约束
- `equipment-uniqueness`: 装备唯一性标记和校验
- `equipment-interaction-ui`: 经典 WoW 风格装备面板、穿脱交互、装备对比 tooltip

### Modified Capabilities
- `player-schema`: 装备结构从 5/9 槽位统一为 16 槽位，背包容量 20→40
- `save-migration`: 旧存档的 5 槽/9 槽装备数据迁移到 16 槽新结构

## Impact

- **数据层**: `EquipmentData.js` 重构（槽位/武器分类/属性预算）、`GameData.js` 职业 weaponTypes 结构变更、`TalentData.js` 萨满新增天赋
- **系统层**: `EquipmentSystem.js` 重构（双手互斥/双持检查/护甲值/伤害值）、`CharacterSystem.js` 统一装备逻辑（消除双轨）、`CombatSystem.js` 集成护甲减伤和武器伤害
- **UI 层**: `SystemPanel.vue` 重构（16 槽布局/穿脱交互/对比 tooltip）
- **存档**: `PlayerSchema.js` 结构变更、`SaveMigration.js` 新增迁移版本
- **战斗**: 物理伤害计算需集成护甲减伤公式，普攻伤害需集成武器 damage 范围
