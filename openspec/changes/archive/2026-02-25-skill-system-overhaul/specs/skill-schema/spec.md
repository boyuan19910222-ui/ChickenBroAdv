## ADDED Requirements

### Requirement: Unified Skill Data Structure
每个技能 SHALL 遵循统一的数据结构，包含以下字段：

**基础信息**：`id` (string), `name` (string), `description` (string), `emoji` (string), `icon` (string|null, 可选图片路径如 `'/icons/skills/warrior/heroic-strike.png'`), `unlockLevel` (number 1~50)

**分类**：`category` (enum), `skillType` (enum), `damageType` (enum|null), `targetType` (enum), `range` ('melee'|'ranged')

**消耗**：`resourceCost` ({ type, value }), `actionPoints` (number 1~3), `cooldown` (number ≥ 0)

**效果**：`damage` ({ base, scaling, stat }|null), `heal` ({ base, scaling, stat }|null), `effects` (array)

**特殊**：`comboPoints` (object|null), `generatesResource` (object|null), `conditions` (object|null)

#### Scenario: 玩家技能数据完整
- **WHEN** 定义一个玩家技能
- **THEN** 该技能 MUST 包含 id, name, description, emoji, unlockLevel, category, skillType, damageType, targetType, range, resourceCost, actionPoints, cooldown 字段
- **THEN** 该技能 MAY 包含 `icon` 字段（图片路径字符串），有 icon 时 UI 优先渲染图片，否则降级为 emoji
- **THEN** damage 或 heal 至少有一个非 null，或 effects 非空

#### Scenario: 敌人技能数据归一化
- **WHEN** 敌人技能的 damage 字段为 number 类型
- **THEN** 运行时 SHALL 自动包装为 `{ base: N, scaling: 0, stat: 'attack' }`

#### Scenario: 旧 effect 字段兼容
- **WHEN** 技能有 `effect` 字段但无 `effects` 字段
- **THEN** 运行时 SHALL 自动转换为 `effects: [effect]`

### Requirement: Category 枚举定义
category 字段 SHALL 使用以下枚举值之一：`filler`, `core`, `powerful`, `ultimate`, `utility`, `builder`, `finisher`

#### Scenario: filler 类型技能
- **WHEN** 技能 category 为 `filler`
- **THEN** 该技能 cooldown MUST 为 0，actionPoints MUST 为 1

#### Scenario: core 类型技能
- **WHEN** 技能 category 为 `core`
- **THEN** 该技能 cooldown MUST 为 0~2，actionPoints MUST 为 1~2

#### Scenario: powerful 类型技能
- **WHEN** 技能 category 为 `powerful`
- **THEN** 该技能 cooldown MUST 为 3~5，actionPoints MUST 为 2~3

#### Scenario: ultimate 类型技能
- **WHEN** 技能 category 为 `ultimate`
- **THEN** 该技能 cooldown MUST ≥ 6，actionPoints MUST 为 3

#### Scenario: utility 类型技能
- **WHEN** 技能 category 为 `utility`
- **THEN** 该技能 cooldown MUST 为 0~5，actionPoints MUST 为 1~2

### Requirement: SkillType 枚举定义
skillType 字段 SHALL 使用以下枚举值之一：`melee`, `ranged`, `spell`, `heal`, `buff`, `debuff`, `summon`

#### Scenario: 近战技能距离限制
- **WHEN** 技能 skillType 为 `melee`
- **THEN** 该技能 range MUST 为 `melee`
- **THEN** 副本中释放时 SHALL 校验攻击者与目标距离 ≤ meleeMaxDistance

#### Scenario: 远程/法术技能无距离限制
- **WHEN** 技能 skillType 为 `ranged` 或 `spell`
- **THEN** 该技能 range MUST 为 `ranged`
- **THEN** 释放时无距离限制

### Requirement: DamageType 枚举定义
damageType 字段 SHALL 使用以下枚举值之一或 null：`physical`, `fire`, `frost`, `nature`, `arcane`, `holy`, `shadow`

damageType 为纯标记用途，用于战斗日志和视觉显示，不影响伤害数值计算。

#### Scenario: 伤害类型显示
- **WHEN** 技能造成伤害且 damageType 不为 null
- **THEN** 战斗日志 SHALL 显示伤害类型标签（如"🔥火焰伤害"）

#### Scenario: 治疗/BUFF 技能无伤害类型
- **WHEN** 技能 skillType 为 `heal` 或 `buff`
- **THEN** damageType SHALL 为 null（除非同时造成伤害）

### Requirement: TargetType 枚举定义
targetType 字段 SHALL 使用以下枚举值之一：`enemy`, `self`, `ally`, `all_enemies`, `all_allies`, `front_2`, `front_3`, `random_3`

#### Scenario: 开放世界 targetType 降级
- **WHEN** 在开放世界 1v1 战斗中使用 AOE 技能（targetType 为 all_enemies/front_2/front_3/random_3）
- **THEN** 系统 SHALL 自动将目标降级为当前唯一敌人

#### Scenario: 副本 all_enemies 目标选择
- **WHEN** 在副本中使用 targetType 为 `all_enemies` 的技能
- **THEN** 系统 SHALL 对所有存活敌人施加技能效果

#### Scenario: 副本 front_2/front_3 目标选择
- **WHEN** 在副本中使用 targetType 为 `front_2` 或 `front_3` 的技能
- **THEN** 系统 SHALL 按 y 坐标排序，选取最近的 2 或 3 个存活敌人

#### Scenario: 副本 random_3 目标选择
- **WHEN** 在副本中使用 targetType 为 `random_3` 的技能
- **THEN** 系统 SHALL 从存活敌人中随机选取最多 3 个目标

### Requirement: 副本单体技能目标选择限制
在副本战斗中，单体技能（targetType 为 `enemy` 或 `ally`）的可选目标池 SHALL 根据 skillType 进行限制：

#### Scenario: 近战单体技能只能选择前排敌人
- **WHEN** 玩家在副本中使用 `skillType === 'melee'` && `targetType === 'enemy'` 的技能
- **THEN** 系统 SHALL 按 slot 升序排列所有存活敌人，仅允许选择前 2 个作为目标
- **THEN** 如果 slot 1 敌人已死亡，前 2 个为 slot 2 + slot 3（即始终取存活敌人中 slot 最小的 2 个）
- **THEN** UI SHALL 仅高亮可选的前排敌人，后排敌人灰化且不可点击
- **THEN** 点击不可选目标时 SHALL 显示提示"近战技能无法攻击后排目标"

受影响技能：heroicStrike, charge, mortalStrike, execute（战士）；shadowStrike, backstab, eviscerate, poisonBlade, kidneyShot（盗贼）；crusaderStrike, hammerOfJustice（圣骑士）；petAttack（猎人）

#### Scenario: 远程/法术单体技能可选任意敌方
- **WHEN** 玩家在副本中使用 `(skillType === 'ranged' || skillType === 'spell')` && `targetType === 'enemy'` 的技能
- **THEN** 系统 SHALL 允许选择任意存活敌人作为目标
- **THEN** UI SHALL 高亮所有存活敌人

#### Scenario: 治疗单体技能可选任意友方
- **WHEN** 玩家在副本中使用 `skillType === 'heal'` && `targetType === 'ally'` 的技能
- **THEN** 系统 SHALL 允许选择任意存活友方（包括自己）作为目标
- **THEN** UI SHALL 切换到"选择友方"模式，高亮所有存活友方角色，敌方不可点击
- **THEN** 友方角色 SHALL 可点击（与点击敌方交互方式一致）

受影响技能：heal, renew, greaterHeal（牧师）；holyLight, layOnHands（圣骑士）；healingWave（萨满）；rejuvenation, healingTouch, regrowth（德鲁伊）

#### Scenario: AI 队友遵循相同目标限制
- **WHEN** AI 队友在副本中自动选择技能目标
- **THEN** PositioningSystem.getValidTargets() SHALL 对近战单体技能应用相同的"前 2 个存活敌人"限制
- **THEN** AI 治疗技能可选任意存活友方

#### Scenario: 开放世界不受目标限制影响
- **WHEN** 在开放世界 1v1 战斗中
- **THEN** 单体技能目标选择限制不生效（仅 1 个敌人，无位置概念）

### Requirement: 特殊技能目标选择（后续处理）
以下技能的目标选择规则不在本次范围，后续单独定义：

- **taunt（嘲讽）**：`skillType === 'debuff'`，特殊近战类技能，需独立目标选择逻辑
- **blessingOfProtection（保护祝福）**：`skillType === 'buff'` && `targetType === 'ally'`，辅助类 buff，需独立目标选择逻辑

### Requirement: ResourceCost 与 AP 内置
每个技能 SHALL 在自身数据中定义 `resourceCost: { type, value }` 和 `actionPoints: N`。

#### Scenario: AP 优先从技能数据读取
- **WHEN** DungeonCombatSystem 需要获取技能的 AP 消耗
- **THEN** 系统 SHALL 优先读取 `skill.actionPoints`
- **THEN** 若不存在，回退读取 ActionPointSystem 的映射表

#### Scenario: 资源消耗扣除
- **WHEN** 释放技能时
- **THEN** 系统 SHALL 从释放者的对应资源池中扣除 `resourceCost.value`
- **THEN** 若资源不足，技能释放失败

### Requirement: UnlockLevel 等级解锁
每个技能 SHALL 有 `unlockLevel` 字段表示解锁等级。

#### Scenario: 技能可用性检查
- **WHEN** 玩家尝试使用某技能
- **THEN** 系统 SHALL 检查玩家等级 ≥ 技能 unlockLevel
- **THEN** 若等级不足，技能不可使用且在 UI 中显示锁定状态
