## Why

当前游戏仅有 1 个副本（哀嚎洞穴简化版：1 波小怪 + 1 个 BOSS），且副本入口为硬编码直接进入。需要扩展到 15 个 WOW 经典旧世 5 人副本，覆盖 Lv13-60 全等级段，复刻经典 BOSS 机制和装备掉落，并提供副本选择弹窗 UI。这是游戏 PvE 内容的核心扩展，直接影响玩家中后期游戏体验。

## What Changes

- **副本选择 UI**：将"🏰 副本"按钮从硬编码直接进入改为弹窗选择界面，展示 15 个副本列表（含等级锁定/已通关状态、副本详情）
- **大副本二级选择**：血色修道院（4 翼）和黑石塔（上/下层）需提供二级选择界面
- **14 个新副本数据文件**：每个副本包含完整 BOSS（含多阶段机制、技能定义）、小怪波次（每 BOSS 间 2~3 波）、经典装备掉落
- **~75 个 BOSS 定义**：复刻 WOW 经典 BOSS 技能并转换为回合制风格（telegraph 蓄力、阶段转换、召唤、DOT/CC 等）
- **~100-120 件经典装备模板**：参考真实副本掉落列表的标志性装备，写入 EquipmentDatabase
- **15 个 DungeonLootConfig**：每个副本的掉落配置（bossCount、iLvlOffset、qualityWeights、exclusiveDrops）
- **新增 BOSS 效果类型**：`spellReflect`（法术反射）、`physicalImmune`/`magicImmune`（阶段免疫）、`resurrect`（复活已死亡 BOSS）、`charm`（精神控制队友变敌人 1 回合）
- **副本等级解锁机制**：玩家等级达到要求才能进入对应副本
- **哀嚎洞穴保留现有简化版**不做修改

### 15 个副本列表

| # | 副本 | 等级 | BOSS | 备注 |
|---|------|------|------|------|
| 1 | 怒焰裂谷 | 13-18 | 4 | |
| 2 | 死亡矿井 | 17-26 | 5 | |
| 3 | 哀嚎洞穴 | 17-24 | 现有 | 保留简化版 |
| 4 | 影牙城堡 | 22-30 | 5 | |
| 5 | 暴风城监狱 | 24-32 | 3 | |
| 6 | 诺莫瑞根 | 29-38 | 4 | |
| 7 | 剃刀沼泽 | 29-38 | 4 | |
| 8 | 血色修道院 | 28-44 | 4翼 | 大副本，含墓地(1)/图书馆(2)/军械库(1)/大教堂(3) |
| 9 | 祖尔法拉克 | 44-54 | 5 | |
| 10 | 玛拉顿 | 46-55 | 5 | |
| 11 | 阿塔哈卡神庙 | 50-56 | 5 | |
| 12 | 黑石塔 | 55-60 | 上下层 | 大副本，含下层(6)/上层(5) |
| 13 | 斯坦索姆 | 58-60 | 6 | 精简自10+ |
| 14 | 通灵学院 | 58-60 | 6 | |
| 15 | 厄运之槌 | 56-60 | 5 | 合并3翼精选 |

## Capabilities

### New Capabilities
- `dungeon-select-ui`: 副本选择弹窗组件，包含副本列表、等级锁定显示、副本详情面板、大副本二级翼/层选择
- `dungeon-data-schema`: 副本数据文件的标准化结构定义（encounters 序列、BOSS 配置、小怪波次、召唤物、辅助方法），所有新副本统一遵循
- `dungeon-ragefire-chasm`: 怒焰裂谷副本数据（4 BOSS + 小怪波次 + 经典掉落）
- `dungeon-deadmines`: 死亡矿井副本数据（5 BOSS + 小怪波次 + 经典掉落）
- `dungeon-shadowfang-keep`: 影牙城堡副本数据（5 BOSS + 小怪波次 + 经典掉落）
- `dungeon-stormwind-stockade`: 暴风城监狱副本数据（3 BOSS + 小怪波次 + 经典掉落）
- `dungeon-gnomeregan`: 诺莫瑞根副本数据（4 BOSS + 小怪波次 + 经典掉落）
- `dungeon-razorfen-kraul`: 剃刀沼泽副本数据（4 BOSS + 小怪波次 + 经典掉落）
- `dungeon-scarlet-monastery`: 血色修道院副本数据（4 翼：墓地 1 BOSS / 图书馆 2 BOSS / 军械库 1 BOSS / 大教堂 3 BOSS，含双 BOSS 战）
- `dungeon-zulfarrak`: 祖尔法拉克副本数据（5 BOSS + 小怪波次 + 经典掉落）
- `dungeon-maraudon`: 玛拉顿副本数据（5 BOSS + 小怪波次 + 经典掉落）
- `dungeon-sunken-temple`: 阿塔哈卡神庙副本数据（5 BOSS + 小怪波次 + 经典掉落）
- `dungeon-blackrock-spire`: 黑石塔副本数据（上层 5 BOSS + 下层 6 BOSS + 小怪波次 + 经典掉落）
- `dungeon-stratholme`: 斯坦索姆副本数据（6 BOSS 精简版 + 小怪波次 + 经典掉落）
- `dungeon-scholomance`: 通灵学院副本数据（6 BOSS + 小怪波次 + 经典掉落）
- `dungeon-dire-maul`: 厄运之槌副本数据（5 BOSS 合并 3 翼精选 + 小怪波次 + 经典掉落）
- `dungeon-classic-equipment`: 经典副本装备模板库（~100-120 件），每件包含固定属性/品质/装备槽/来源副本
- `boss-new-effects`: 新增 BOSS 效果类型：spellReflect（法术反射 buff）、physicalImmune/magicImmune（阶段性免疫）、resurrect（复活已死亡 BOSS 事件）、charm（精神控制）

### Modified Capabilities
- `loot-system`: DungeonLootConfig 需扩展 15 个副本的掉落配置，exclusiveDrops 引用经典装备模板
- `boss-phase-system`: 需支持双 BOSS 战（同场 2 个 BOSS 实体）、resurrect 阶段事件、武器切换阶段（斯莫特 3 阶段换武器）
- `effect-system`: 新增 spellReflect/physicalImmune/magicImmune/charm 效果类型

## Impact

- **新增文件**：~17 个副本数据 JS 文件（`src/data/dungeons/`）+ 1 个经典装备模板文件 + 1 个 DungeonSelectDialog Vue 组件
- **修改文件**：
  - `src/data/dungeons/WailingCaverns.js` — 不修改（保留现有）
  - `src/components/GameHeader.vue` — 副本按钮改为弹窗触发
  - `src/data/DungeonLootConfig.js`（或等效文件）— 添加 15 个副本掉落配置
  - `src/data/EquipmentDatabase.js`（或等效文件）— 添加经典装备模板
  - `src/stores/dungeonCombat.js`（或相关 store）— 支持从选择界面启动任意副本
  - BOSS 阶段系统 — 扩展双 BOSS 战和新事件类型
  - 效果系统 — 扩展新效果类型
- **数据规模**：~75 个 BOSS 定义 + ~150-225 波小怪 + ~100-120 件装备模板
- **分批实现**：
  - Batch 1: 副本选择 UI + 数据结构 + 低级副本（怒焰/死矿/影牙/监狱）
  - Batch 2: 中级副本 + 血色修道院 4 翼（诺莫/剃刀沼泽/血色/祖尔法拉克/玛拉顿）
  - Batch 3: 高级副本 + 经典装备（阿塔哈卡/黑石塔/斯坦索姆/通灵/厄运之槌）
