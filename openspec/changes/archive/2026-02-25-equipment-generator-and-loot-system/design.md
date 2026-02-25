## Context

当前装备系统有 60 个手写模板，掉落时精确拷贝——没有属性随机性。`slotWeight`、`qualityMultiplier`、`calcArmorValue`、`calcWeaponDamage` 等公式已在 `EquipmentData.js` 中定义但未被掉落流程使用。副本 `DungeonCombatSystem.js` 的遭遇战不触发 `combat:victory` 事件，通关奖励中装备掉落未实现。`MonsterEquipmentDrops` 当前为怪物→固定物品池映射，由 `rollEquipmentDrop()` 精确拷贝返回。

## Goals / Non-Goals

**Goals:**
- 新增 `poor`（灰色）品质，与 WoW 原版 6 级品质阶梯一致
- 实现程序化装备生成器 `generateEquipment()`，基于参数自动计算属性
- 实现统一掉落系统 `LootSystem`，覆盖野外战斗和副本通关
- 灰/白品质装备无属性，绿色起才分配属性
- 饰品类（neck/finger/trinket）品质下限为 uncommon
- 野外品质上限 rare，epic 仅副本产出，legendary 仅副本专属列表
- 等级差惩罚机制防止高级玩家刷低级区
- 副本仅通关奖励掉装备，数量 = 1 + floor(bossCount/2)
- 可扩展的区域/副本掉落配置结构

**Non-Goals:**
- 不实现附魔/宝石镶嵌系统
- 不实现玩家间交易
- 不实现装备分解/回收系统
- 不改变现有装备的穿戴/卸下 UI 流程
- 不实现"世界掉落"（全局超稀有掉落池）

## Decisions

### D1: 品质阶梯扩展策略

**选择**: 在 `QualityConfig` 头部插入 `poor` 条目，将现有 `common` 的颜色从 `#9d9d9d` 改为 `#ffffff`。

**替代方案**: 新建独立品质系统——增加了不必要的抽象层。

**理由**: 最小改动，QualityConfig 被全局引用，改颜色比改 key 安全。所有引用 `common` 的代码无需修改。

### D2: 装备生成器架构

**选择**: 在 `EquipmentData.js` 中新增 `generateEquipment(params)` 纯函数，不依赖任何系统实例。

**替代方案 A**: 放在 `EquipmentSystem.js` 中——但 EquipmentSystem 是实例化系统，生成器应该是纯数据层。
**替代方案 B**: 新建 `EquipmentGenerator.js`——增加文件但逻辑量不足以独立。

**理由**: 生成器本质是数据转换函数，与 EquipmentData 中已有的 `calcArmorValue`、`calcWeaponDamage` 同层。

### D3: 属性分配算法

**选择**: 槽位偏好池（`slotStatBias`）+ 加权随机选 2~3 属性 + ±15% 浮动。

**流程**:
1. `budget = floor(iLvl × slotWeight × qualityMult)`
2. 从 `slotStatBias[slot]` 按权重随机选 2~3 个属性
3. 按权重比例分配 budget
4. 每个属性 ±15% 浮动，min=1
5. 调整确保总和 = budget

**理由**: 保守浮动避免废品；槽位偏好保证"胸甲偏坦"、"武器偏攻"的 RPG 直觉。

### D4: 掉落系统架构

**选择**: 新建 `src/systems/LootSystem.js`，作为独立系统类，监听事件触发掉落。

**核心结构**:
- `AreaLootConfig`: 区域级默认掉落配置（dropChance, qualityWeights, iLvlOffset）
- `MonsterLootOverrides`: 怪物级覆写（可选）
- `DungeonLootConfig`: 副本通关奖励配置（bossCount, exclusiveDrops, qualityWeights）
- `rollWorldLoot(enemy, player)`: 野外掉落判定
- `rollDungeonReward(dungeonConfig, player)`: 副本通关奖励

**理由**: 掉落逻辑跨越战斗和副本两个系统，独立系统避免耦合。

### D5: 甲种智能匹配

**选择**: 80% 匹配玩家可穿最高甲种 / 20% 随机。

**实现**: `ClassArmorAffinity` 映射表，键为职业 ID，值为 `{ primary: 'plate', secondary: ['mail', 'leather'] }`。

### D6: 名称生成

**选择**: 预设名称池 + 结构化拼接兜底。

**实现**: `EquipmentNamePool` 按 `{armorType/weaponType}.{slot}` 组织名称数组。有池子的随机选，没有的 fallback 到 `{品质前缀} {材质}{槽位名}`。

### D7: 现有模板淘汰策略

**选择**: 保留套装件（valor/nightslayer/beaststalker）、传说（ashbringer）、史诗、有剧情意义的装备。普通绿色以下通用装备由生成器接管。

**实现**: `MonsterEquipmentDrops` 表逐步移除，由 `AreaLootConfig` 接管。保留的模板通过 `DungeonLootConfig.exclusiveDrops` 引用。

### D8: 副本掉落简化

**选择**: 副本中间遭遇战只给经验+金币，不掉装备。仅成功通关给装备奖励。

**理由**: 简化掉落体验，让通关奖励成为副本的核心激励。每次通关掉 `1 + floor(bossCount/2)` 件装备，品质集中在蓝+，有专属掉落惊喜。

## Risks / Trade-offs

- [风险] 属性浮动可能导致极端情况（所有点数集中在一个属性）→ 缓解：保证至少选 2 个属性，每个属性 min=1
- [风险] 名称池不够大导致重复感 → 缓解：先覆盖核心槽位，不够的 fallback 到拼接
- [风险] QualityConfig 改动影响现有存档中的装备显示 → 缓解：不改 key 只改 color，common 装备颜色从灰变白是视觉增强
- [风险] 淘汰模板后现有 MonsterEquipmentDrops 引用失效 → 缓解：分阶段淘汰，先让新系统并行运行
- [折中] 80/20 甲种匹配可能让玩家觉得"掉了不能穿的" → 可接受：可以卖钱，增加经济维度
