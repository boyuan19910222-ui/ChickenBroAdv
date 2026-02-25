## MODIFIED Requirements

### Requirement: 仇恨目标选择
系统 SHALL 根据仇恨值决定敌人的攻击目标，仇恨系统 MUST 正确集成到副本战斗流程中。

#### Scenario: 攻击最高仇恨目标
- **WHEN** 敌人 X 的仇恨列表：玩家A(500)、玩家B(300)、玩家C(200)
- **THEN** 默认攻击玩家A（最高仇恨）

#### Scenario: 仇恨目标阵亡
- **WHEN** 最高仇恨目标玩家A阵亡
- **THEN** 攻击第二高仇恨的玩家B

#### Scenario: ThreatSystem 正确 import
- **WHEN** DungeonCombatSystem 初始化
- **THEN** ThreatSystem MUST 被正确导入并实例化
- **AND** 仇恨值变化 MUST 实际影响敌人目标选择决策

## ADDED Requirements

### Requirement: 治疗目标筛选
治疗 AI 在选择治疗目标时 SHALL 正确筛选有效目标。

#### Scenario: 排除已死亡单位
- **WHEN** 治疗 AI 选择治疗目标
- **THEN** 已死亡的队友 MUST 被排除在候选列表之外

#### Scenario: 排除敌方单位
- **WHEN** 治疗 AI 选择治疗目标
- **THEN** 敌方单位 MUST 被排除在候选列表之外

#### Scenario: 优先治疗血量最低者
- **WHEN** 治疗 AI 选择治疗目标且有多个受伤队友
- **THEN** 优先选择当前 HP 百分比最低的存活队友
