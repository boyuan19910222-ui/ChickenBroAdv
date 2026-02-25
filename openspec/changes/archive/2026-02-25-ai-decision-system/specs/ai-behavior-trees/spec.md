## ADDED Requirements

### Requirement: AI Decision System Entry Point
系统 SHALL 提供 `AIDecisionSystem.decideAction(unit, battleState)` 作为 AI 决策的统一入口，内部完成 context 构建 → 行为树选择 → tick 执行 → 返回动作。

#### Scenario: AI decides action
- **WHEN** 副本战斗中轮到 AI 队友行动，调用 `decideAction(allyUnit, battleState)`
- **THEN** 返回 `{ skillId, targetIds }` 描述要执行的技能和目标

#### Scenario: AI has no valid action
- **WHEN** AI 单位所有技能都在冷却或无合法目标
- **THEN** 返回 null 或默认普攻动作

### Requirement: Tree Selection by Role
AIDecisionSystem SHALL 根据单位的角色/类型选择对应的行为树。

#### Scenario: Dungeon ally tank
- **WHEN** 单位为 AI 队友且 role 为 `tank`
- **THEN** 使用 `dungeonAllyTank` 行为树

#### Scenario: Dungeon ally healer
- **WHEN** 单位为 AI 队友且 role 为 `healer`
- **THEN** 使用 `dungeonAllyHealer` 行为树

#### Scenario: Dungeon ally DPS
- **WHEN** 单位为 AI 队友且 role 为 `melee_dps` 或 `ranged_dps`
- **THEN** 使用 `dungeonAllyDps` 行为树

#### Scenario: Dungeon enemy
- **WHEN** 单位为副本敌方怪物（非 BOSS）
- **THEN** 使用 `dungeonEnemy` 行为树

#### Scenario: Boss
- **WHEN** 单位为 BOSS
- **THEN** 使用 `bossDefault` 行为树

#### Scenario: Overworld enemy
- **WHEN** 单位为野外怪物
- **THEN** 使用 `overworldEnemy` 行为树

### Requirement: Dungeon Ally Tank Tree
副本友方坦克行为树 SHALL 优先保命（HP < 30% 用生存技能），其次维持仇恨（嘲讽/高威胁技能），最后输出。

#### Scenario: Tank low HP
- **WHEN** 坦克 HP 低于 30%，有可用的生存技能（如盾墙）
- **THEN** 使用生存技能

#### Scenario: Tank maintains threat
- **WHEN** 坦克 HP 正常，有敌人未对坦克保持仇恨
- **THEN** 优先使用嘲讽或高威胁技能

### Requirement: Dungeon Ally Healer Tree
副本友方治疗行为树 SHALL 优先紧急治疗（队友 HP < 30%），其次群体治疗（多人受伤），最后单体维护治疗或输出。

#### Scenario: Emergency heal
- **WHEN** 有队友 HP 低于 30%
- **THEN** 对该队友使用最强单体治疗技能

#### Scenario: Group heal
- **WHEN** 3 名以上队友 HP 低于 70%
- **THEN** 使用群体治疗技能

### Requirement: Dungeon Ally DPS Tree
副本友方 DPS 行为树 SHALL 优先保命，其次执行输出循环（builder → finisher 或 核心技能 → 填充技能）。

#### Scenario: DPS rotation
- **WHEN** DPS 单位正常状态，有可用技能
- **THEN** 优先使用高伤害核心技能，冷却中则使用填充技能

#### Scenario: Rogue combo rotation
- **WHEN** 盗贼 AI 有 4+ 连击点，有可用的 finisher 技能
- **THEN** 使用 finisher 技能消耗连击点

### Requirement: Dungeon Enemy Tree
副本敌方行为树 SHALL 优先使用特殊技能（冷却就绪时），否则使用基础攻击，目标选择基于仇恨。

#### Scenario: Special skill ready
- **WHEN** 敌人有冷却就绪的特殊技能
- **THEN** 使用该特殊技能

#### Scenario: Fallback to basic attack
- **WHEN** 所有特殊技能都在冷却
- **THEN** 使用基础攻击技能

### Requirement: Boss Tree
BOSS 行为树 SHALL 支持多阶段、蓄力技能和狂暴机制。

#### Scenario: Phase transition
- **WHEN** BOSS HP 低于阶段切换阈值
- **THEN** 切换到下一阶段的技能集

#### Scenario: Telegraph skill
- **WHEN** BOSS 选择蓄力技能
- **THEN** 先进入蓄力状态，下一回合释放

### Requirement: Overworld Enemy Tree
野外敌方行为树 SHALL 根据怪物技能列表选择技能，目标为玩家。

#### Scenario: Overworld enemy uses skill
- **WHEN** 野外怪物有可用技能
- **THEN** 按优先级选择技能对玩家使用

#### Scenario: Overworld enemy fallback
- **WHEN** 所有技能冷却中
- **THEN** 使用基础攻击
