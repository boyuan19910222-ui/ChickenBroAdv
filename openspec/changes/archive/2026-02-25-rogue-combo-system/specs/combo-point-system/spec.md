## ADDED Requirements

### Requirement: 连击点数据结构

盗贼角色 SHALL 拥有 `comboPoints` 对象，包含以下字段：
- `current`: 当前连击点数（整数，0-max）
- `max`: 连击点上限（默认 5，可被天赋提升）

#### Scenario: 新建盗贼角色
- **WHEN** 创建盗贼职业角色
- **THEN** 角色拥有 `comboPoints` 对象
- **AND** `current` 初始值为 0
- **AND** `max` 初始值为 5

#### Scenario: 存档迁移
- **WHEN** 加载缺少 `comboPoints` 字段的盗贼存档
- **THEN** 系统自动添加 `comboPoints` 对象
- **AND** `current` 设为 0
- **AND** `max` 设为 5

---

### Requirement: 连击点产生

使用 Builder 类技能命中目标后 SHALL 产生连击点。

#### Scenario: 常规技产生连击点
- **WHEN** 盗贼使用 category 为 `builder` 的技能
- **AND** 技能命中目标
- **THEN** 玩家获得技能定义的 `comboPointsGenerated` 数量连击点
- **AND** 显示日志 "获得 X 连击点"

#### Scenario: 连击点上限检查
- **WHEN** 盗贼当前连击点为 5（满）
- **AND** 使用 Builder 技能
- **THEN** 连击点保持 5，不再增加
- **AND** 不显示额外提示（正常战斗流程）

---

### Requirement: 连击点消耗

使用 Finisher 类技能 SHALL 消耗全部连击点。

#### Scenario: 终结技消耗连击点
- **WHEN** 盗贼使用 category 为 `finisher` 的技能
- **AND** 当前有 3 连击点
- **THEN** 技能生效
- **AND** 连击点变为 0
- **AND** 显示日志 "消耗 3 连击点"

#### Scenario: 无连击点无法使用终结技
- **WHEN** 盗贼当前连击点为 0
- **AND** 尝试使用 Finisher 技能
- **THEN** 技能不生效
- **AND** 显示提示 "需要连击点！"

---

### Requirement: 阶梯式终结技伤害

Finisher 技能伤害 SHALL 根据消耗的连击点数从技能的 `comboPointsDamage` 表中查找。

#### Scenario: 1连击点剔骨
- **WHEN** 盗贼使用剔骨
- **AND** 当前有 1 连击点
- **THEN** 造成 1 级伤害（base: 40, scaling: 0.5）

#### Scenario: 3连击点剔骨
- **WHEN** 盗贼使用剔骨
- **AND** 当前有 3 连击点
- **THEN** 造成 3 级伤害（base: 150, scaling: 1.2）

#### Scenario: 5连击点剔骨
- **WHEN** 盗贼使用剔骨
- **AND** 当前有 5 连击点
- **THEN** 造成 5 级伤害（base: 300, scaling: 2.0）

---

### Requirement: 连击点战斗重置

战斗结束时连击点 SHALL 清零。

#### Scenario: 战斗胜利清空连击点
- **WHEN** 盗贼战斗胜利
- **AND** 当前有 3 连击点
- **THEN** 连击点变为 0

#### Scenario: 战斗逃跑清空连击点
- **WHEN** 盗贼选择逃跑
- **AND** 当前有 2 连击点
- **THEN** 连击点变为 0

---

### Requirement: 连击点 UI 显示

连击点 SHALL 在 UI 中以星号形式显示。

#### Scenario: 显示当前连击点
- **WHEN** 盗贼当前有 3 连击点，上限 5
- **THEN** UI 显示 "⭐⭐⭐☆☆"
- **AND** 连击点区域使用 `.combo-display` 样式

#### Scenario: 非盗贼不显示连击点
- **WHEN** 玩家职业不是盗贼
- **THEN** UI 不显示连击点条
