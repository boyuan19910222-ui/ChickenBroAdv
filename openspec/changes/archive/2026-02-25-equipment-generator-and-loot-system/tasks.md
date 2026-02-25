## 1. QualityConfig 扩展与品质约束

- [x] 1.1 在 EquipmentData.js 的 QualityConfig 中新增 `poor` 条目（name:'粗糙', color:'#9d9d9d', statScale:0.8），将 `common` 的 color 改为 '#ffffff'、name 改为 '普通'
- [x] 1.2 新增 QUALITY_ORDER 数组 `['poor','common','uncommon','rare','epic','legendary']` 及 `clampQuality(quality, cap)` 工具函数
- [x] 1.3 定义 ACCESSORY_SLOTS 集合（neck, finger1, finger2, trinket1, trinket2）和品质下限 uncommon 约束常量

## 2. 装备生成器核心

- [x] 2.1 在 EquipmentData.js 中新增 `slotStatBias` 槽位属性偏好池（每个槽位的属性权重映射）
- [x] 2.2 新增 `EquipmentNamePool` 预设名称池（按 armorType/weaponType × slot 组织）+ 品质前缀映射 + 结构化拼接兜底函数 `generateEquipmentName()`
- [x] 2.3 实现 `generateEquipment(params)` 主函数：品质约束校验 → armorValue/damage 计算 → stat budget 分配（含 ±15% 浮动）→ 名称生成 → durability/sellPrice → 返回完整装备对象

## 3. 掉落配置数据

- [x] 3.1 新增 `AreaLootConfig` 区域级掉落配置（4 个区域：elwynnForest, westfall, stranglethorn, easternPlaguelands）含 dropChance, iLvlOffset, qualityWeights, maxDrops
- [x] 3.2 新增 `MonsterLootOverrides` 特殊怪物掉落覆写（如瘟疫巨龙、死亡骑士等强怪）
- [x] 3.3 新增 `DungeonLootConfig` 副本通关奖励配置（哀嚎洞穴：bossCount, recommendedLevelMax, iLvlOffset, qualityWeights, exclusiveDrops）
- [x] 3.4 新增 `ClassArmorAffinity` 职业甲种亲和表（每个职业的 primary 甲种 + secondary 列表）

## 4. LootSystem 掉落系统

- [x] 4.1 创建 `src/systems/LootSystem.js`，实现 `rollWorldLoot(enemy, player, areaId)` 方法：等级差惩罚 → dropChance 判定 → 品质上限(rare) → 甲种匹配 → generateEquipment
- [x] 4.2 实现 `rollDungeonReward(dungeonId, player)` 方法：计算 totalDrops → 专属掉落判定 → 生成器补齐剩余 → 返回装备列表
- [x] 4.3 实现等级差惩罚函数 `applyLevelPenalty(playerLevel, monsterLevel)` 返回 { dropChanceMultiplier, qualityCap }

## 5. 系统集成

- [x] 5.1 修改 CombatSystem.js 的 `handleCombatDrop`，替换 `rollEquipmentDrop` 为 `LootSystem.rollWorldLoot`，传入怪物区域 ID
- [x] 5.2 修改 DungeonCombatSystem.js，副本通关时调用 `LootSystem.rollDungeonReward`，遭遇战中移除装备掉落逻辑（仅保留经验+金币）
- [x] 5.3 确保 GameData.js 中的怪物数据包含 areaId 字段（或通过 zone 映射推算），以便 LootSystem 查找区域配置
