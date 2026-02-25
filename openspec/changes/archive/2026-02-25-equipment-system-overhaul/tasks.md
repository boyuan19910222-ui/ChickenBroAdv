## 1. 数据层：槽位与装备结构重定义

- [x] 1.1 重构 `EquipmentData.js` 中 `EQUIPMENT_SLOTS` 为 16 槽位（新增 wrists/waist/back/neck/finger1/finger2/trinket1/trinket2，删除 ranged），每个槽位包含 id/label/icon/category/slotWeight
- [x] 1.2 新增装备 `category` 字段枚举常量（armor/weapon/shield/offhand/accessory），更新所有现有装备模板数据添加 category 字段
- [x] 1.3 新增武器 `weaponHand` 字段（one_hand/two_hand），为剑/斧/锤创建双手变体，将弓/枪/弩改为 two_hand，魔杖设为 one_hand
- [x] 1.4 重构 `GameData.js` 所有 9 个职业的 `weaponTypes` 从扁平数组改为 `{ oneHand: [], twoHand: [] }` 分组对象
- [x] 1.5 为所有现有装备模板添加 `armorValue` 字段（护甲类根据 baseCoeff × itemLevel × quality 计算）和 `damage: { min, max }` 字段（武器类根据公式计算）
- [x] 1.6 新增副手物品装备模板（书/水晶球/圣物等，category=offhand，纯属性无耐久）
- [x] 1.7 新增饰品/项链/戒指装备模板（category=accessory，无护甲值无耐久），添加 `unique` 字段支持
- [x] 1.8 新增手腕/腰带/披风装备模板（披风 armorType=cloth 用 cloth 系数，通用不限职业）
- [x] 1.9 校验所有装备模板的 stats 总和符合属性预算公式 `floor(itemLevel × slotWeight × qualityMultiplier)`，调整不符合的数据

## 2. 系统层：装备核心逻辑

- [x] 2.1 重构 `EquipmentSystem.canEquip()` 支持 16 槽位验证、weaponHand 分组校验（oneHand/twoHand 数组查找）、副手物品/盾牌的职业限制
- [x] 2.2 实现双持能力检查 `canDualWield(character)`: 战士/盗贼/猎人天生 true，萨满检查 dualWield 天赋，其他职业 false
- [x] 2.3 实现双手武器互斥逻辑：穿双手→自动卸 offHand 到背包；穿 offHand→如 mainHand 是双手则自动卸 mainHand 到背包；背包满则操作失败回滚
- [x] 2.4 实现装备唯一性检查：穿戴 `unique: true` 装备时检查所有已装备槽位是否已有同 id 装备
- [x] 2.5 实现副手 50% 伤害惩罚：`getOffHandDamage()` 返回 `floor(rolledDamage × 0.5)`
- [x] 2.6 实现护甲值汇总 `getTotalArmor(character)`: 累加所有已装备物品的 armorValue
- [x] 2.7 实现物理减伤公式 `getPhysicalReduction(totalArmor, attackerLevel)`: `totalArmor / (totalArmor + 400 × attackerLevel)`
- [x] 2.8 删除 `CharacterSystem.js` 中重复的 `equipItem()`/`unequipItem()`/`canEquipArmor()`/`canEquipWeapon()` 方法，统一由 EquipmentSystem 负责
- [x] 2.9 实现披风特殊处理：跳过职业护甲类型限制检查，任何职业都可装备

## 3. 系统层：战斗伤害集成

- [x] 3.1 修改 `CombatSystem.calculateDamage()` 集成武器 damage 范围（random(min,max) + 属性加成），替换现有纯属性公式
- [x] 3.2 修改 `CombatSystem` 物理伤害计算集成 `getPhysicalReduction()` 替换现有 stamina 减伤
- [x] 3.3 修改 `DungeonCombatSystem` 玩家普攻/技能伤害计算集成武器 damage 范围和护甲减伤

## 4. 天赋系统：萨满双持天赋

- [x] 4.1 在 `TalentData.js` 萨满增强天赋树新增 `dualWield` 天赋（tier 3, maxPoints 1, effect type unlock_ability, requires thunderingStrikes）
- [x] 4.2 修改天赋系统 `unlock_ability` 效果类型的处理逻辑，支持解锁双持能力

## 5. 存档迁移

- [x] 5.1 统一 `PlayerSchema.js` 的 `EQUIPMENT_SLOTS` 为 16 槽位数组，修改 `createDefaultPlayer()` 的默认 equipment 为 16 个 null 槽位
- [x] 5.2 修改 `PlayerSchema.js` 背包容量常量/校验从 20 改为 40
- [x] 5.3 在 `SaveMigration.js` 新增迁移版本：5 槽→16 槽映射（weapon→mainHand, armor→chest, helmet→head, boots→feet, accessory→trinket1）
- [x] 5.4 在 `SaveMigration.js` 新增迁移版本：9 槽→16 槽映射（保留已有槽位，ranged 装备移入背包，新槽位设 null）
- [x] 5.5 递增 `CURRENT_VERSION` 常量

## 6. UI 层：装备面板重构

- [x] 6.1 重构 `SystemPanel.vue` 装备面板为经典 WoW 布局：左列 6 护甲槽、右列 8 饰品/杂项槽、中间角色区域、底部 2 武器槽
- [x] 6.2 实现装备槽位交互：点击已装备槽位→卸下到背包；右键背包物品→自动装备到对应槽位（戒指/饰品优先空槽位）
- [x] 6.3 实现装备交换逻辑：目标槽位已有装备→旧装备回背包→新装备装上（原子操作）
- [x] 6.4 实现双手武器 offHand 锁定 UI：mainHand 是双手时 offHand 显示🔒图标，不可交互
- [x] 6.5 实现装备 tooltip：悬停显示名称(品质色)/类型/等级需求/物品等级/护甲值或伤害/属性/耐久/套装信息
- [x] 6.6 实现装备对比 tooltip：悬停背包装备时并列显示已穿戴装备，属性差异用绿色▲(提升)/红色▼(下降)标注
- [x] 6.7 实现品质颜色编码：所有装备项根据品质显示对应边框色（灰/绿/蓝/紫/橙）
- [x] 6.8 修改背包格子从 20 格扩展到 40 格，显示 "背包 (N/40)"
