## Why

当前装备系统的 60 个手写模板是精确拷贝，没有随机性——同一把剑打 10 次完全一样。`slotWeight` 和 stat budget 公式已设计但未启用，stats 全部硬编码。副本通关不掉装备，BOSS 掉落表形同虚设。需要一个程序化装备生成器 + 统一掉落系统来解决这些问题。

## What Changes

- 新增 `poor`（灰色）品质等级，将现有 `common` 改为白色，与 WoW 原版品质阶梯一致
- 灰色/白色品质装备无属性加成，仅有护甲值/武器伤害；绿色及以上才分配属性
- 戒指/项链/饰品品质下限为 uncommon（绿色），不存在灰/白品质
- 新增程序化装备生成器 `generateEquipment()`，基于 itemLevel、品质、槽位自动计算属性（含 ±15% 浮动）
- 新增装备名称生成系统：预设名称池 + 结构化拼接兜底
- 新增统一掉落系统 `LootSystem`，含区域级掉落配置 + 怪物级覆写
- 野外掉落品质上限为蓝色（rare），紫色（epic）仅副本产出
- 新增等级差惩罚机制：玩家等级比怪物高 >5/10/15 级时分别降品质/降概率/不掉装备
- 副本改为仅通关奖励掉装备，中间遭遇战不掉装备
- 通关奖励装备数量 = 1 + floor(BOSS数量 / 2)
- 副本支持专属掉落列表（exclusiveDrops）
- 传说装备仅从副本专属掉落列表产出，不走生成器
- 淘汰低级通用模板，保留套装件/传说/有剧情意义的装备作为固定模板
- 80% 甲种匹配玩家职业可穿最高甲种 / 20% 随机

## Capabilities

### New Capabilities
- `equipment-generator`: 程序化装备生成器，基于 itemLevel/品质/槽位自动生成完整装备对象（属性分配、护甲值、武器伤害、名称、耐久、售价）
- `loot-system`: 统一掉落系统，含区域掉落配置、副本通关奖励、等级差惩罚、品质上限约束、专属掉落列表、甲种智能匹配

### Modified Capabilities
- `stat-budget-formula`: 品质阶梯扩展（新增 poor），statScale 调整，灰/白品质不分配属性的规则

## Impact

- `src/data/EquipmentData.js` — QualityConfig 扩展、新增 LootConfig 数据、淘汰部分模板
- `src/systems/EquipmentSystem.js` — 集成装备生成器
- `src/systems/CombatSystem.js` — 野外掉落改用 LootSystem
- `src/systems/DungeonCombatSystem.js` — 副本通关奖励集成
- `src/data/dungeons/` — 副本配置新增掉落相关字段
- `src/data/GameData.js` — 怪物/区域数据可能需要补充 zone 标识
- 存档兼容性：现有装备对象结构不变，新增字段向后兼容
