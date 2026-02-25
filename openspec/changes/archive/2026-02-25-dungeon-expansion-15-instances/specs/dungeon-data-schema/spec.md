## ADDED Requirements

### Requirement: 副本数据文件标准结构
每个副本数据文件 SHALL 导出一个遵循标准结构的对象，包含副本元数据、遭遇战列表、小怪波次配置、BOSS 配置和辅助方法。

#### Scenario: 标准副本导出结构
- **WHEN** 读取任意副本数据文件
- **THEN** 导出对象 SHALL 包含以下字段：
  - `id`: string — 副本唯一标识
  - `name`: string — 副本中文名称
  - `description`: string — 副本描述
  - `emoji`: string — 副本 emoji 图标
  - `levelRange`: { min, max } — 推荐等级范围
  - `difficulty`: string — 难度标识
  - `rewards`: { expBase, goldBase, lootTable } — 基础奖励
  - `encounters`: Array — 遭遇战序列

### Requirement: Encounters 遭遇战序列
副本 SHALL 定义线性推进的遭遇战序列，每个遭遇战为 trash（小怪波次）或 boss。

#### Scenario: 遭遇战序列结构
- **WHEN** 读取副本的 encounters 数组
- **THEN** 每个元素 SHALL 包含 `{ id, type, name }`
- **THEN** `type` SHALL 为 `'trash'` 或 `'boss'`
- **THEN** 遭遇战 SHALL 按从头到尾的线性顺序排列

#### Scenario: BOSS 间小怪波次
- **WHEN** 副本有多个 BOSS
- **THEN** 每两个 BOSS 之间 SHALL 有 2~3 波小怪遭遇战
- **THEN** 第一个 BOSS 之前也 SHALL 有 2~3 波小怪

### Requirement: 小怪波次配置
每个 trash 遭遇战 SHALL 定义 1~5 个敌人的配置。

#### Scenario: 小怪波次数据结构
- **WHEN** 读取某个 wave 配置
- **THEN** SHALL 包含 `{ id, name, description, enemies: [...] }`
- **THEN** 每个 enemy SHALL 包含 `{ id, name, type, slot, emoji, stats: {hp, damage, armor}, speed, loot: {exp}, skills: [...] }`

#### Scenario: 小怪技能结构
- **WHEN** 读取小怪的 skills 数组
- **THEN** 每个技能 SHALL 包含 `{ id, name, emoji, skillType, damageType, targetType, range, damage, cooldown, actionPoints, effects }`

### Requirement: BOSS 配置结构
每个 boss 遭遇战 SHALL 定义完整的 BOSS 配置，包含多阶段、技能组和狂暴机制。

#### Scenario: BOSS 数据结构
- **WHEN** 读取 BOSS 配置
- **THEN** SHALL 包含 `{ id, name, type: 'boss', slot, emoji, loot, baseStats, speed, phases, enrage, skills }`
- **THEN** `phases` SHALL 为阶段数组，每阶段包含 `{ id, name, hpThreshold, actionsPerTurn, damageModifier, skills, onEnter? }`
- **THEN** `skills` SHALL 为技能对象映射（key = skillId, value = 技能配置）

#### Scenario: BOSS 阶段转换事件类型
- **WHEN** BOSS 阶段定义了 `onEnter`
- **THEN** `onEnter.type` SHALL 为以下之一：`'summon'`、`'transform'`、`'buff'`、`'resurrect'`

### Requirement: 召唤物配置
副本 SHALL 定义 BOSS 可召唤的实体配置。

#### Scenario: 召唤物数据结构
- **WHEN** 读取召唤物配置
- **THEN** SHALL 包含 `{ id, name, type: 'add', emoji, stats: {hp, damage, armor}, speed, skills }`

### Requirement: 辅助方法
每个副本数据对象 SHALL 提供标准辅助方法。

#### Scenario: getEncounter 方法
- **WHEN** 调用 `dungeon.getEncounter(encounterId)`
- **THEN** SHALL 返回对应的遭遇战配置对象

#### Scenario: createBossInstance 方法
- **WHEN** 调用 `dungeon.createBossInstance(bossEncounterId)`
- **THEN** SHALL 返回可用于战斗系统的 BOSS 实例对象

#### Scenario: createTrashInstance 方法
- **WHEN** 调用 `dungeon.createTrashInstance(waveId)`
- **THEN** SHALL 返回小怪实例数组

#### Scenario: createSummonInstance 方法
- **WHEN** 调用 `dungeon.createSummonInstance(summonId, slot)`
- **THEN** SHALL 返回召唤物实例对象
