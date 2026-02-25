## Context

当前游戏只有 1 个副本（哀嚎洞穴），副本入口为 `GameHeader.vue` 中硬编码的按钮直接调用 `startDungeon('wailing_caverns')`。副本数据存放在 `src/data/dungeons/WailingCaverns.js`，导出包含 encounters 列表、小怪波次、BOSS 配置（含多阶段/技能/狂暴/召唤物）和辅助方法。战斗由 `DungeonCombatSystem.js` 驱动，BOSS 阶段由 `BossPhaseSystem` 管理。装备掉落通过 `LootSystem` + `DungeonLootConfig` 生成。

目标是扩展到 15 个 WOW 经典旧世 5 人副本（含 2 个"大副本"的二级选择），复刻 ~75 个 BOSS、~150-225 波小怪、~100-120 件经典装备，并提供副本选择弹窗 UI。

## Goals / Non-Goals

**Goals:**
- 提供完整的副本选择弹窗 UI，支持等级锁定、已通关状态、副本详情
- 大副本（血色修道院/黑石塔）支持翼/层的二级选择
- 15 个副本覆盖 Lv13-60 全等级段，等级曲线均匀
- 每个 BOSS 复刻 WOW 经典机制并转换为回合制风格
- 每个副本配置经典装备掉落列表
- 支持分 3 批实现，每批独立可运行
- 新增必要的效果类型以支持经典 BOSS 机制

**Non-Goals:**
- 不修改哀嚎洞穴现有简化版
- 不实现团队副本（10/20/40 人）
- 不实现副本难度模式（英雄模式）
- 不实现副本 CD/锁定机制
- 不实现副本内可选 BOSS 路线（所有遭遇线性推进）
- 不修改现有战斗系统核心逻辑

## Decisions

### D1: 副本数据文件组织

**决策**：每个副本（或翼/层）一个独立 JS 文件，放在 `src/data/dungeons/` 目录下。大副本的翼/层也各自独立文件。

**理由**：
- 每个副本数据量 200-500 行，独立文件便于维护
- 支持按需 import，避免加载全部副本数据
- 与现有 `WailingCaverns.js` 保持一致的模式
- 新增一个 `DungeonRegistry.js` 作为所有副本的注册表/索引

**替代方案**：
- 全部放一个大文件 → 太大（预计 5000+ 行），维护困难
- 按等级段分文件 → 不够直观，副本可能跨等级段

**文件结构**：
```
src/data/dungeons/
├── DungeonRegistry.js          # 副本注册表（ID→元数据映射）
├── WailingCaverns.js           # 现有，不修改
├── RagefireChasm.js            # 怒焰裂谷
├── Deadmines.js                # 死亡矿井
├── ShadowfangKeep.js           # 影牙城堡
├── StormwindStockade.js        # 暴风城监狱
├── Gnomeregan.js               # 诺莫瑞根
├── RazorfenKraul.js            # 剃刀沼泽
├── ScarletMonastery_GY.js      # 血色修道院-墓地
├── ScarletMonastery_Lib.js     # 血色修道院-图书馆
├── ScarletMonastery_Arm.js     # 血色修道院-军械库
├── ScarletMonastery_Cath.js    # 血色修道院-大教堂
├── ZulFarrak.js                # 祖尔法拉克
├── Maraudon.js                 # 玛拉顿
├── SunkenTemple.js             # 阿塔哈卡神庙
├── BlackrockSpire_Lower.js     # 黑石塔下层
├── BlackrockSpire_Upper.js     # 黑石塔上层
├── Stratholme.js               # 斯坦索姆
├── Scholomance.js              # 通灵学院
├── DireMaul.js                 # 厄运之槌
├── ClassicEquipment.js         # 经典装备模板库
└── DungeonLootConfigs.js       # 所有副本掉落配置
```

### D2: DungeonRegistry 设计

**决策**：创建 `DungeonRegistry.js` 作为副本元数据索引，包含每个副本的基础信息（不含战斗数据），副本选择 UI 直接读取此文件。

**数据结构**：
```javascript
export const DungeonRegistry = {
  ragefire_chasm: {
    id: 'ragefire_chasm',
    name: '怒焰裂谷',
    emoji: '🔥',
    description: '奥格瑞玛下方的火焰洞穴...',
    levelRange: { min: 13, max: 18 },
    unlockLevel: 13,
    bossCount: 4,
    estimatedTime: '10分钟',
    type: 'standard',           // 'standard' | 'multi-wing'
    dataModule: () => import('./RagefireChasm.js'),
  },
  scarlet_monastery: {
    id: 'scarlet_monastery',
    name: '血色修道院',
    emoji: '✝️',
    description: '血色十字军的要塞...',
    levelRange: { min: 28, max: 44 },
    unlockLevel: 28,
    type: 'multi-wing',
    wings: [
      { id: 'sm_graveyard', name: '墓地', emoji: '☠️', levelRange: {min:28,max:38}, bossCount: 1, dataModule: () => import('./ScarletMonastery_GY.js') },
      { id: 'sm_library', name: '图书馆', emoji: '📚', levelRange: {min:33,max:40}, bossCount: 2, dataModule: () => import('./ScarletMonastery_Lib.js') },
      { id: 'sm_armory', name: '军械库', emoji: '🗡️', levelRange: {min:36,max:42}, bossCount: 1, dataModule: () => import('./ScarletMonastery_Arm.js') },
      { id: 'sm_cathedral', name: '大教堂', emoji: '⛪', levelRange: {min:38,max:44}, bossCount: 3, dataModule: () => import('./ScarletMonastery_Cath.js') },
    ],
  },
  // ... 同理 blackrock_spire 也是 multi-wing
};
```

**理由**：
- 懒加载 `dataModule` 避免首屏加载 17 个副本的完整数据
- `type: 'multi-wing'` 让 UI 自动展示二级选择
- 与现有 `DungeonData` 对象兼容

### D3: 副本选择弹窗 UI 组件

**决策**：新建 `DungeonSelectDialog.vue` 组件，由 `GameHeader.vue` 的副本按钮触发。

**UI 层次**：
```
Level 1: 副本列表（15 个入口）
  ├── standard 类型 → 直接显示 [进入副本] 按钮
  └── multi-wing 类型 → 展开翼/层列表
        └── 每个翼/层 → [进入副本] 按钮

无筛选功能，按等级排序固定展示。
```

**副本状态**：
- 🔒 锁定（玩家等级不足）
- ✅ 已通关
- ⚔️ 可进入（已解锁，未通关）

**替代方案**：
- 用路由页面替代弹窗 → 当前游戏为单页面架构，弹窗更自然
- 用侧边栏 → 信息展示空间不够

### D4: BOSS 机制回合制转换模式

**决策**：定义一套标准的 WOW 实时机制→回合制的映射模式，所有 BOSS 统一遵循。

| WOW 实时机制 | 回合制等价物 | 数据字段 |
|-------------|-------------|---------|
| 站位躲避 | telegraph 蓄力 N 回合 | `telegraph: { chargeRounds, chargeMessage }` |
| DOT（腐蚀/燃烧） | dot effect | `effects: [{ type: 'dot', tickDamage, duration }]` |
| 增伤阶段（软狂暴） | phases[].damageModifier | 已有 |
| 小怪召唤 | onEnter.summon | 已有 |
| 群体恐惧/冰冻 | all_enemies + CC | `targetType: 'all_enemies', effects: [{ type: 'cc' }]` |
| BOSS 自愈 | targetType: self + heal | 需要打断否则回满 |
| 护甲削弱 | debuff: armor | `effects: [{ type: 'debuff', stat: 'armor' }]` |
| AOE 伤害 | targetType: all_enemies/front_3/cleave_3 | 已有 |
| 狂暴计时器 | enrage.triggerRound | 已有 |
| **法术反射** | spellReflect buff | **新增** |
| **物理/魔法免疫** | physicalImmune/magicImmune buff | **新增** |
| **复活 BOSS** | resurrect 阶段事件 | **新增** |
| **精神控制** | charm CC（1 回合队友变敌人） | **新增** |
| **武器切换** | 阶段转换换技能组 | 用现有 phases 实现 |

### D5: 新增效果类型设计

**决策**：在现有 effect-system 基础上新增 4 种效果类型。

**spellReflect**（法术反射）：
```javascript
{ type: 'buff', name: 'spellReflect', duration: 2, special: 'spellReflect' }
// 战斗系统检查：如果目标有 spellReflect buff 且受到法术伤害，将伤害反射回施法者
```

**physicalImmune / magicImmune**（免疫）：
```javascript
{ type: 'buff', name: 'physicalImmune', duration: 2, special: 'physicalImmune' }
// 战斗系统检查：如果目标有 physicalImmune buff，物理伤害无效化（显示"免疫"）
```

**charm**（精神控制）：
```javascript
{ type: 'cc', ccType: 'charm', duration: 1 }
// 战斗系统检查：被 charm 的单位在 duration 期间视为敌方，可能攻击队友
```

**resurrect**（复活事件）：
```javascript
// 作为 onEnter 事件而非 effect
onEnter: {
  type: 'resurrect',
  targetBossId: 'mograine',
  hpPercent: 1.0,           // 满血复活
  message: '怀特迈恩开始施放复活术...',
  telegraph: { chargeRounds: 2 }  // 可被打断
}
```

**理由**：
- 用现有 buff 的 `special` 字段扩展 spellReflect/immune，最小改动
- charm 作为新的 ccType，复用 CC 系统
- resurrect 作为阶段事件而非效果，更符合"一次性触发"的语义

### D6: 双 BOSS 战设计（SM 大教堂）

**决策**：SM 大教堂的莫格莱尼+怀特迈恩采用"阶段式双 BOSS"设计。

**战斗流程**：
```
P1: 莫格莱尼独战（slot 2-3，BOSS 占 2 格）
    怀特迈恩不在场
    
P2 触发: 莫格莱尼 HP→0
    莫格莱尼标记为"已倒下"（不从战场移除，显示倒地 emoji）
    怀特迈恩出场（slot 4-5）
    怀特迈恩行动：攻击+治疗术+telegraph 复活术（2 回合蓄力）

P2 结果:
  - 如果复活术成功释放 → P3
  - 如果怀特迈恩被击败 → 战斗胜利

P3: 莫格莱尼满血复活 + 狂暴 buff
    双 BOSS 同时行动
    两人都被击败 → 战斗胜利
```

**技术实现**：
- 莫格莱尼和怀特迈恩定义为同一个 encounter 的两个 BOSS 实体
- P1 只有莫格莱尼在 enemies 中
- P2 的 `onEnter` 设置莫格莱尼 `isDown: true`（不死亡不移除），召唤怀特迈恩
- resurrect 事件将莫格莱尼 `isDown: false`、`currentHp = maxHp`

### D7: 经典装备模板系统

**决策**：创建 `ClassicEquipment.js` 存放固定模板装备，每件有固定属性/品质/装备槽/来源。副本 `exclusiveDrops` 引用这些模板 ID。

**装备模板结构**：
```javascript
export const ClassicEquipmentTemplates = {
  smites_mighty_hammer: {
    id: 'smites_mighty_hammer',
    name: '斯莫特的强力之锤',
    emoji: '🔨',
    slot: 'mainHand',
    quality: 'rare',
    itemLevel: 24,
    stats: { strength: 8, stamina: 5 },
    weaponDamage: { min: 28, max: 52, speed: 2.8, type: 'mace', handed: 'twoHand' },
    source: { dungeon: 'deadmines', boss: 'mr_smite' },
  },
  // ...
};
```

**装备数量规划**：
- 短副本（≤3 BOSS）：3-5 件
- 中副本（4-6 BOSS）：5-8 件
- 长副本（7+ BOSS / 多翼多层）：8-12 件
- 总计约 100-120 件

### D8: 分批实现策略

**决策**：全部规划一次完成，分 3 批实现。每批独立可运行。

| 批次 | 副本 | 依赖 |
|------|------|------|
| Batch 1 | 副本选择 UI + DungeonRegistry + 怒焰裂谷 + 死亡矿井 + 影牙城堡 + 暴风城监狱 | 无 |
| Batch 2 | 诺莫瑞根 + 剃刀沼泽 + 血色修道院(4翼) + 祖尔法拉克 + 玛拉顿 | Batch 1 |
| Batch 3 | 阿塔哈卡神庙 + 黑石塔(2层) + 斯坦索姆 + 通灵学院 + 厄运之槌 + 新效果类型 + 经典装备完善 | Batch 1 |

**批次间接口**：DungeonRegistry 在 Batch 1 中预注册所有 15 个副本的元数据，后续批次只需添加数据文件。未实现的副本在 UI 中显示"开发中"。

## Risks / Trade-offs

**[数据量巨大]** → 每个副本数据文件 200-500 行，总计 ~7000 行新数据
- 缓解：按副本独立文件，动态 import 按需加载
- 缓解：使用辅助函数减少重复（如 `createTrashWave()` 工厂函数）

**[BOSS 技能平衡]** → 75 个 BOSS 的技能数值可能不平衡
- 缓解：使用等级公式推算 BOSS 基础属性，确保随等级合理增长
- 缓解：后续通过玩测调整数值

**[新效果类型的战斗系统兼容]** → spellReflect/charm/immune 需要修改战斗核心逻辑
- 缓解：用现有 buff/cc 的 `special`/`ccType` 扩展点，最小化核心改动
- 缓解：新效果类型仅影响伤害计算和行动决策两个环节

**[双 BOSS 战复杂度]** → 莫格莱尼+怀特迈恩的 resurrect 机制是新增的阶段事件类型
- 缓解：仅 SM 大教堂一场使用，限制影响面
- 缓解：通过 `isDown` 标记而非真正死亡，复用现有实体管理

**[大副本二级 UI]** → 血色修道院 4 翼和黑石塔 2 层需要额外的 UI 层级
- 缓解：在弹窗内展开/折叠，不需要新页面
