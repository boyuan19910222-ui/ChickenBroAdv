## ADDED Requirements

### Requirement: Condition Registry
系统 SHALL 维护条件函数注册表，每个条件函数签名为 `(unit, context, params) => boolean`，通过字符串 key 注册和查找。

#### Scenario: Register and lookup condition
- **WHEN** 注册条件 `register('condition', 'selfHpBelow', fn)` 后查找 `lookup('condition', 'selfHpBelow')`
- **THEN** 返回注册的函数 fn

#### Scenario: Lookup missing key
- **WHEN** 查找未注册的 key
- **THEN** 抛出错误，包含未找到的 key 信息

### Requirement: Action Registry
系统 SHALL 维护动作函数注册表，每个动作函数签名为 `(unit, context, params) => { skillId, targetIds } | null`，通过字符串 key 注册和查找。

#### Scenario: Action returns skill decision
- **WHEN** 动作函数 `useAttackSkill` 被调用，context 中有可用的攻击技能和合法目标
- **THEN** 返回 `{ skillId: 'heroicStrike', targetIds: ['enemy_1'] }`

#### Scenario: Action returns null
- **WHEN** 动作函数被调用但没有合适的技能或目标
- **THEN** 返回 null，表示该动作不可执行

### Requirement: Scorer Registry
系统 SHALL 维护评分函数注册表，每个评分函数签名为 `(unit, context, params) => number`（返回 0~1 之间的分数），通过字符串 key 注册和查找。

#### Scenario: Scorer evaluates value
- **WHEN** 评分函数 `tauntValue` 被调用，上下文中有未被嘲讽的敌人攻击治疗
- **THEN** 返回较高分数（如 0.9）

#### Scenario: Scorer returns zero
- **WHEN** 评分函数评估认为该动作无价值
- **THEN** 返回 0

### Requirement: Unified Function Signature
所有注册的函数（条件/动作/评分）的前两个参数 SHALL 统一为 `(unit, context)`，第三个参数为可选的 `params` 对象。

#### Scenario: Condition with params
- **WHEN** 条件函数被调用，params 为 `{ threshold: 0.3 }`
- **THEN** 函数可通过 `params.threshold` 获取配置参数

#### Scenario: Action without params
- **WHEN** 动作函数被调用，无 params
- **THEN** 函数正常执行，params 为 undefined 或 `{}`
