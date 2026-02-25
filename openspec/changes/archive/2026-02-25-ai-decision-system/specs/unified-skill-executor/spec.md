## ADDED Requirements

### Requirement: Unified Execution Path
系统 SHALL 提供 `SkillExecutor.executeSkill(unit, skill, targets, battleContext)` 作为所有单位（玩家、AI 队友、敌方怪物）的统一技能执行入口。

#### Scenario: Player uses skill via executor
- **WHEN** 玩家手动选择技能后调用 executeSkill
- **THEN** 执行资源消耗 → 冷却设置 → 伤害/治疗计算 → 效果施加的完整流程

#### Scenario: AI ally uses skill via executor
- **WHEN** AI 队友行为树决策后调用 executeSkill
- **THEN** 走与玩家相同的执行路径，消耗资源、设置冷却、触发效果

#### Scenario: Enemy uses skill via executor
- **WHEN** 敌方单位使用技能，技能已经过 normalizeSkill 归一化
- **THEN** 走与玩家相同的执行路径

### Requirement: Resource Consumption
executeSkill SHALL 在技能执行前检查并消耗单位资源（怒气/法力/能量）。

#### Scenario: Sufficient resource
- **WHEN** 战士有 30 怒气，使用英勇打击（消耗 15 怒气）
- **THEN** 技能执行成功，战士怒气变为 15

#### Scenario: Insufficient resource
- **WHEN** 单位资源不足以施放技能
- **THEN** 技能执行失败，返回失败结果，不产生任何效果

### Requirement: Cooldown Management
executeSkill SHALL 在技能执行后设置冷却，并在每回合开始时递减所有技能冷却。

#### Scenario: Set cooldown after use
- **WHEN** 使用冷却为 3 回合的技能
- **THEN** 该技能进入 3 回合冷却，在冷却期间不可再次使用

#### Scenario: Cooldown decrement
- **WHEN** 新回合开始
- **THEN** 所有处于冷却中的技能冷却回合数减 1

### Requirement: Damage and Healing Calculation
executeSkill SHALL 通过 EffectSystem 解析技能伤害和治疗，使用 `{ base, scaling, stat }` 公式计算。

#### Scenario: Physical damage skill
- **WHEN** 执行伤害技能 `{ damage: { base: 20, scaling: 1.5, stat: 'strength' } }`，单位 strength 为 30
- **THEN** 基础伤害为 `20 + 1.5 * 30 = 65`，再经过护甲/暴击等修正

#### Scenario: Healing skill
- **WHEN** 执行治疗技能 `{ heal: { base: 30, scaling: 1.2, stat: 'intellect' } }`
- **THEN** 治疗量通过相同公式计算并应用到目标

### Requirement: Effect Application
executeSkill SHALL 施加技能定义中的所有效果（DOT/HOT/CC/buff/debuff/shield/lifesteal）。

#### Scenario: Skill with DOT effect
- **WHEN** 执行含 DOT 效果的技能
- **THEN** 目标被施加 DOT，后续回合持续受到伤害

#### Scenario: Skill with multiple effects
- **WHEN** 技能定义包含伤害 + stun 效果
- **THEN** 目标同时受到伤害和被眩晕

### Requirement: Target Resolution
executeSkill SHALL 根据技能的 `targetType` 解析实际受影响的目标列表。

#### Scenario: Single target
- **WHEN** targetType 为 `enemy`，传入单个目标 ID
- **THEN** 技能只影响该目标

#### Scenario: AOE target
- **WHEN** targetType 为 `all_enemies`
- **THEN** 技能影响所有存活的敌方单位

#### Scenario: Front position target
- **WHEN** targetType 为 `front_2`
- **THEN** 技能只能作用于前排 2 个位置的存活敌方单位

### Requirement: Combo Points Integration
executeSkill SHALL 支持连击点系统：builder 类技能产生连击点，finisher 类技能消耗连击点。

#### Scenario: Builder generates combo points
- **WHEN** 盗贼使用 builder 类技能
- **THEN** 盗贼获得技能定义中指定数量的连击点

#### Scenario: Finisher consumes combo points
- **WHEN** 盗贼使用 finisher 类技能，当前有 4 连击点
- **THEN** 消耗所有连击点，技能伤害根据连击点数量增强
