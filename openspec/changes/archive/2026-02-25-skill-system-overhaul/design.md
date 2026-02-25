## Context

当前技能系统分散在多个文件中：
- `GameData.js` 定义 30 个技能，结构不统一（有的用 `manaCost`，有的用 `resourceCost`；缺少 `damageType`/`skillType`/`targetType`）
- `ActionPointSystem.js` 硬编码 AP 映射表（`actionPointCosts`），与 GameData 技能定义脱节
- `CombatSystem.js`（开放世界）只做基础伤害计算，不处理 DOT/HOT/buff/debuff
- `DungeonCombatSystem.js`（副本）有 `applySkillEffects` 但效果处理有限
- 玩家技能用 `{ base, scaling, stat }` 伤害结构，敌人技能用直接 `damage: 40`
- 9 大职业各 3~5 个技能，远低于目标的 6~8 个

约束：
- 保持开放世界 1v1 和副本多人两套战斗循环共存
- 不引入抗性/减伤系统（damageType 纯标记）
- 回合制副本每回合 3 AP 的核心节奏不变

## Goals / Non-Goals

**Goals:**
- 定义统一技能 Schema，所有技能（玩家/敌人）使用同一结构
- 实现 effects[] 多效果数组和回合结束 DOT/HOT 结算
- 扩充 9 职业到 6~8 技能/职业，每个技能有完整属性
- AP 消耗内置到技能数据，移除 ActionPointSystem 硬编码映射
- 开放世界 CombatSystem 补齐效果处理
- 敌人技能格式与玩家统一

**Non-Goals:**
- 不做抗性/减伤系统（damageType 仅做标记和日志显示）
- 不做天赋对技能的改造（天赋系统是独立变更）
- 不做技能特效动画（仅数据和逻辑层）
- 不做平衡性调优（先搭框架，数值后续迭代）
- 不做技能树/技能学习 UI

## Decisions

### D1: 统一 Schema 但保留敌人伤害简化

**选择**：玩家技能 `damage: { base, scaling, stat }`，敌人技能可用 `damage: { base: 40, scaling: 0, stat: 'attack' }` 或直接 `damage: 40`（运行时归一化）

**替代方案**：强制所有技能都用 `{ base, scaling, stat }` → 敌人不需要 scaling，多余的复杂度

**理由**：在 `resolveSkillDamage()` 函数中做归一化处理，如果 damage 是 number 则自动包装为 `{ base: N, scaling: 0, stat: 'attack' }`。这样数据层可以灵活，运行时统一。

### D2: effects[] 替代 effect 单字段

**选择**：新字段 `effects: []` 数组，旧 `effect` 字段在运行时兼容转换

**替代方案**：直接删除 `effect` → 需要一次性修改所有引用

**理由**：向下兼容。解析技能时如果发现 `effect` 且无 `effects`，自动包装为 `effects: [effect]`。

### D3: AP 消耗内置到技能数据

**选择**：技能数据中直接定义 `actionPoints: N`，ActionPointSystem 读取 `skill.actionPoints`

**替代方案**：保持 ActionPointSystem 外部映射 → 数据分散，维护困难

**理由**：单一数据源原则。ActionPointSystem 中的 `actionPointCosts` 映射表作为 fallback，优先读取技能自身的 `actionPoints`。

### D4: 回合结束结算 DOT/HOT

**选择**：DOT/HOT 在回合结束阶段统一结算

**替代方案 A**：回合开始结算 → 施放当回合立即生效，策略性强但对新手不友好
**替代方案 B**：各单位行动结束时各自结算 → 实现复杂，时序不可预测

**理由**：回合结束结算最直观：施放当回合不触发，下回合结束开始跳。所有 DOT/HOT 在同一时点结算，逻辑清晰。

### D5: 开放世界 targetType 降级

**选择**：开放世界 1v1 中，`all_enemies`/`front_2`/`front_3`/`random_3` 全部降级为单体敌人

**理由**：开放世界只有 1 个敌人，AOE targetType 自然退化为单体。不需要 if/else，直接取当前目标即可。

### D6: 文件组织

**选择**：
- 技能数据保留在 `GameData.js` 的 `skills` 对象中（原地扩充）
- 新增 `src/systems/EffectSystem.js` 处理 effects[] 的施加和结算
- `CombatSystem.js` 和 `DungeonCombatSystem.js` 调用 EffectSystem

**替代方案**：技能数据独立文件 `SkillData.js` → 增加一个导入层，但 GameData 已经很大

**理由**：GameData.js 是现有数据中心，拆分反而增加导入复杂度。效果逻辑独立为 EffectSystem.js 是合理的关注点分离。

### D7: 副本单体技能目标选择限制

**选择**：在副本战斗中，根据 skillType 限制单体技能的可选目标池：
- 近战单体（`skillType=melee` + `targetType=enemy`）→ 只能选前 2 个存活敌人（按 slot 升序）
- 远程/法术单体（`skillType=ranged/spell` + `targetType=enemy`）→ 可选任意存活敌人
- 治疗单体（`skillType=heal` + `targetType=ally`）→ 可选任意存活友方（含自己），UI 增加友方点选

**替代方案 A**：用 `range` 字段（melee/ranged）判断 → taunt 等 debuff 也会被限制，但 taunt 需单独处理
**替代方案 B**：不做限制，所有单体技能可选任意目标 → 近战无战术意义

**理由**：用 `skillType` 判断更明确，且 taunt/blessingOfProtection 等特殊技能已标记为后续单独处理。"前 2 个"取存活敌人 slot 最小的 2 个（非固定 slot 1/2），保证近战总有可打的目标。

### D8: 友方点选交互

**选择**：治疗单体技能激活后，友方角色可点击（交互方式与点击敌方一致），敌方不可点击

**替代方案 A**：弹出友方列表选择 → 额外 UI 组件，打断战斗节奏
**替代方案 B**：治疗自动施放给自己 → 失去策略性

**理由**：直接点击友方角色最直观，与敌方目标选择逻辑对称，用户零学习成本。

## Risks / Trade-offs

- **[数据量大]** 9 职业 × 7 技能 ≈ 63 个技能定义 + 副本敌人技能 → 迁移：分批实现，先做玩家技能再做敌人
- **[两套战斗系统]** CombatSystem 和 DungeonCombatSystem 需同步修改 → 迁移：抽取 EffectSystem 共享逻辑
- **[向下兼容]** 旧的 `effect`/`manaCost` 字段可能被其他代码引用 → 迁移：运行时兼容转换 + 逐步清理
- **[平衡性]** 大量新技能数值未经测试 → 迁移：先搭框架跑通，数值后续微调
