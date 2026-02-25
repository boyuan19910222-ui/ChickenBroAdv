## ADDED Requirements

### Requirement: Node Types
行为树引擎 SHALL 支持以下节点类型：
- `selector`: 固定优先级选择器，按顺序执行子节点，第一个返回 SUCCESS 的子节点即为结果
- `scored`: 评分选择器，执行所有子节点的评分函数，选择得分最高的子节点执行
- `sequence`: 序列节点，按顺序执行所有子节点，任一 FAILURE 则整体 FAILURE
- `condition`: 条件节点，通过注册表 key 调用条件函数，返回 boolean
- `action`: 动作节点，通过注册表 key 调用动作函数，返回要执行的技能动作

#### Scenario: Selector picks first success
- **WHEN** selector 节点有 3 个子节点，第 1 个返回 FAILURE，第 2 个返回 SUCCESS
- **THEN** selector 返回第 2 个子节点的结果，第 3 个子节点不执行

#### Scenario: Scored selector picks highest score
- **WHEN** scored 节点有 3 个子节点，评分分别为 0.3、0.8、0.5
- **THEN** scored 执行评分为 0.8 的子节点

#### Scenario: Sequence stops on failure
- **WHEN** sequence 有 condition + action 两个子节点，condition 返回 false
- **THEN** sequence 返回 FAILURE，action 不执行

### Requirement: Tree Definition Format
行为树 SHALL 使用 JS 对象字面量声明，每个节点包含 `type` 字段和类型相关的其他字段。

#### Scenario: Node with registry key
- **WHEN** 节点定义为 `{ type: 'condition', key: 'selfHpBelow', params: { threshold: 0.3 } }`
- **THEN** 引擎通过 key `selfHpBelow` 从注册表查找条件函数，传入 params 执行

#### Scenario: Node with scorer
- **WHEN** action 节点定义包含 `scorer` 字段
- **THEN** 在 scored 父节点中，引擎调用 scorer 对应的评分函数获取分数

### Requirement: Tick Execution
行为树引擎 SHALL 提供 `tick(tree, unit, context)` 方法，从根节点开始递归执行，返回决策结果（要执行的技能动作或 null）。

#### Scenario: Normal tick
- **WHEN** 调用 `tick(tree, unit, context)` 且树中有可执行的动作
- **THEN** 返回 `{ skillId, targetIds }` 描述要执行的技能

#### Scenario: No valid action
- **WHEN** 调用 `tick(tree, unit, context)` 但所有条件都不满足
- **THEN** 返回 null，表示该单位本回合无有效动作

### Requirement: Tick Result
tick 的返回值 SHALL 为 `{ status, action }` 格式。status 为 `SUCCESS`/`FAILURE`/`RUNNING`。action 在 status 为 SUCCESS 时包含 `{ skillId, targetIds }`。

#### Scenario: Success with action
- **WHEN** 行为树找到可执行的技能动作
- **THEN** 返回 `{ status: 'SUCCESS', action: { skillId: 'heroicStrike', targetIds: ['enemy_1'] } }`

#### Scenario: Failure no action
- **WHEN** 行为树所有分支都失败
- **THEN** 返回 `{ status: 'FAILURE', action: null }`
