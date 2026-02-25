## MODIFIED Requirements

### Requirement: AI Ally Runtime Fields
AI 队友创建时 SHALL 补齐以下运行时字段，确保与玩家角色结构一致：
- `skillCooldowns`: 初始化为 `{}`
- `comboPoints`: 盗贼职业初始化为 `0`
- `buffs`: 初始化为 `[]`
- `debuffs`: 初始化为 `[]`

#### Scenario: AI warrior creation
- **WHEN** 创建 AI 战士队友
- **THEN** 包含 `skillCooldowns: {}`、`buffs: []`、`debuffs: []`

#### Scenario: AI rogue creation
- **WHEN** 创建 AI 盗贼队友
- **THEN** 包含 `comboPoints: 0`、`skillCooldowns: {}`、`buffs: []`、`debuffs: []`

### Requirement: AI Ally Resource Recovery
AI 队友的资源恢复 SHALL 与玩家走同一套规则：
- 战士：受击回怒
- 盗贼：每回合恢复能量
- 法系（牧师/术士/法师）：每回合自然恢复法力
- 猎人：每回合恢复集中值

#### Scenario: AI rogue energy recovery
- **WHEN** AI 盗贼队友回合开始
- **THEN** 按照与玩家盗贼相同的规则恢复能量

#### Scenario: AI priest mana recovery
- **WHEN** AI 牧师队友回合开始
- **THEN** 按照与玩家牧师相同的规则恢复法力
