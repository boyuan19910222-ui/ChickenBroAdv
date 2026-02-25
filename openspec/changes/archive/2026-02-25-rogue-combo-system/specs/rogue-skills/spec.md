## ADDED Requirements

### Requirement: 影袭技能数据

系统 SHALL 包含影袭（Shadow Strike）技能，配置如下：

| 属性 | 值 |
|------|-----|
| id | `shadowStrike` |
| name | 影袭 |
| description | 快速攻击敌人，产生1个连击点 |
| type | active |
| category | builder |
| targetType | enemy |
| resourceCost | { type: 'energy', value: 40 } |
| comboPointsGenerated | 1 |
| damage | { base: 20, scaling: 1.2, stat: 'agility' } |
| cooldown | 0 |

#### Scenario: 影袭造成伤害
- **WHEN** 盗贼使用影袭
- **AND** 敏捷为 20
- **THEN** 造成 20 + 20×1.2 = 44 点伤害

#### Scenario: 影袭消耗能量
- **WHEN** 盗贼能量为 100
- **AND** 使用影袭
- **THEN** 能量变为 60

#### Scenario: 影袭产生连击点
- **WHEN** 盗贼连击点为 0
- **AND** 使用影袭
- **THEN** 连击点变为 1

---

### Requirement: 剔骨技能数据

系统 SHALL 包含剔骨（Eviscerate）技能，配置如下：

| 属性 | 值 |
|------|-----|
| id | `eviscerate` |
| name | 剔骨 |
| description | 消耗连击点造成伤害，连击点越多伤害越高 |
| type | active |
| category | finisher |
| targetType | enemy |
| resourceCost | { type: 'energy', value: 35 } |
| requiresComboPoints | true |
| comboPointsDamage | 见下表 |
| cooldown | 0 |

**剔骨伤害表 (comboPointsDamage)**:

| 连击点 | base | scaling |
|--------|------|---------|
| 1 | 40 | 0.5 |
| 2 | 90 | 0.8 |
| 3 | 150 | 1.2 |
| 4 | 220 | 1.6 |
| 5 | 300 | 2.0 |

#### Scenario: 1点剔骨伤害计算
- **WHEN** 盗贼使用剔骨
- **AND** 当前 1 连击点
- **AND** 敏捷为 20
- **THEN** 造成 40 + 20×0.5 = 50 点伤害

#### Scenario: 5点剔骨伤害计算
- **WHEN** 盗贼使用剔骨
- **AND** 当前 5 连击点
- **AND** 敏捷为 20
- **THEN** 造成 300 + 20×2.0 = 340 点伤害

#### Scenario: 剔骨能量不足
- **WHEN** 盗贼能量为 30
- **AND** 尝试使用剔骨（需要 35）
- **THEN** 技能不生效
- **AND** 显示 "能量不足！需要 35，当前 30"

---

### Requirement: 盗贼职业技能列表

盗贼职业配置 SHALL 包含以下初始技能：
- `backstab`（背刺 - 实际实现中替代了 evade）
- `shadowStrike`（影袭）
- `eviscerate`（剔骨）

注：原规格包含 `evade`（闪避），实际实现替换为 `backstab`（背刺），后续可补回 evade。

#### Scenario: 新建盗贼拥有技能
- **WHEN** 创建盗贼角色
- **THEN** 角色拥有影袭、剔骨、闪避三个技能

---

### Requirement: 技能分类标识

技能数据 SHALL 包含 `category` 字段，标识技能类型。

| category | 含义 |
|----------|------|
| builder | 常规技，产生连击点 |
| finisher | 终结技，消耗连击点 |
| utility | 功能技，不涉及连击点 |

#### Scenario: Builder 技能标识
- **WHEN** 查看影袭技能数据
- **THEN** `category` 为 `builder`
- **AND** `comboPointsGenerated` 为 1

#### Scenario: Finisher 技能标识
- **WHEN** 查看剔骨技能数据
- **THEN** `category` 为 `finisher`
- **AND** `requiresComboPoints` 为 true
