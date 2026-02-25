## ADDED Requirements

### Requirement: Three-Layer Context Structure
ContextBuilder SHALL 输出包含三层的 context 对象：`self`（行动单位自身状态）、`battlefield`（战场单位信息）、`tactical`（预计算衍生信息）。

#### Scenario: Context layers present
- **WHEN** 调用 `ContextBuilder.build(unit, battleState)` 为任意战斗单位构建 context
- **THEN** 返回对象包含 `self`、`battlefield`、`tactical` 三个顶层字段

### Requirement: Self Layer
self 层 SHALL 包含行动单位的当前状态和预处理的可用技能列表 `availableSkills`。

#### Scenario: Self layer contents
- **WHEN** 为一个战士单位构建 context
- **THEN** self 层包含 `hp`、`maxHp`、`resource`（type/current/max）、`stats`、`buffs`、`debuffs`、`position`、`availableSkills`

#### Scenario: Available skills filtering
- **WHEN** 单位有 8 个技能，其中 2 个在冷却、1 个资源不足
- **THEN** `availableSkills` 包含 5 个技能，每个含 `id`、`name`、`resourceCost`、`cooldownReady`、`canAfford`、`validTargets`

### Requirement: Battlefield Layer
battlefield 层 SHALL 以行动单位视角提供 `allies` 和 `enemies` 数组，格式统一，不区分友方AI或敌方AI。

#### Scenario: Ally AI sees battlefield
- **WHEN** 为友方 AI 队友构建 context
- **THEN** `battlefield.allies` 包含其他队友和玩家，`battlefield.enemies` 包含所有敌方单位

#### Scenario: Enemy sees battlefield
- **WHEN** 为敌方单位构建 context
- **THEN** `battlefield.allies` 包含其他敌方单位，`battlefield.enemies` 包含玩家队伍

#### Scenario: Unit info in battlefield
- **WHEN** battlefield 中列出一个单位
- **THEN** 包含 `id`、`name`、`hp`、`maxHp`、`hpPercent`、`position`、`buffs`、`debuffs`、`isAlive`

### Requirement: Tactical Layer
tactical 层 SHALL 包含预计算的衍生战术信息，避免行为树重复计算。

#### Scenario: Tactical contents
- **WHEN** 构建 context
- **THEN** tactical 层包含 `teamSummary`（团队 HP 摘要、存活数）、`threatInfo`（仇恨相关）、`aoeValue`（群体技能价值评估）

#### Scenario: Team summary
- **WHEN** 5 人队伍中 2 人 HP 低于 50%
- **THEN** `tactical.teamSummary` 包含 `aliveCount: 5`、`lowHpCount: 2`、`avgHpPercent` 等

### Requirement: Skill Normalization
ContextBuilder SHALL 对敌人技能格式进行归一化。当技能的 `damage` 字段为数字时，自动包装为 `{ base: N, scaling: 0, stat: 'attack' }` 标准结构。

#### Scenario: Enemy skill normalization
- **WHEN** 敌人技能定义为 `{ id: 'melee_attack', damage: 15 }`
- **THEN** 归一化后 damage 为 `{ base: 15, scaling: 0, stat: 'attack' }`

#### Scenario: Player skill passthrough
- **WHEN** 玩家/AI队友技能 damage 已是对象格式 `{ base: 20, scaling: 1.5, stat: 'strength' }`
- **THEN** 保持不变

### Requirement: Unit Type Agnostic
ContextBuilder SHALL 不区分单位类型（玩家、AI 队友、敌方怪物），使用统一流程构建 context。

#### Scenario: Same process for all units
- **WHEN** 分别为玩家、AI 队友、敌方怪物构建 context
- **THEN** 三者输出的 context 结构完全一致，行为树无需知道单位类型
