## ADDED Requirements

### Requirement: AI 队伍职业随机化
系统 SHALL 从定位职业池中随机选取 AI 队友的职业，而非使用固定职业。

#### Scenario: 每个定位从池中随机选取
- **WHEN** 创建 AI 队伍
- **THEN** 坦克从坦克职业池中随机选取（战士防护、圣骑士防护、德鲁伊熊坦）
- **AND** 治疗从治疗职业池中随机选取（牧师神圣、圣骑士神圣、德鲁伊恢复、萨满恢复）
- **AND** 近战DPS从近战DPS池中随机选取
- **AND** 远程DPS从远程DPS池中随机选取

#### Scenario: AI 职业不与玩家重复
- **WHEN** 玩家职业为盗贼
- **THEN** AI 队友中不会出现另一个盗贼

### Requirement: AI 等级缩放
系统 SHALL 根据副本推荐等级动态生成 AI 队友的属性。

#### Scenario: AI 属性按等级生成
- **WHEN** 副本推荐最低等级为 18
- **THEN** AI 队友的 HP、攻击力、防御力等属性按 基础值 + growthPerLevel × (等级 - 1) 计算

#### Scenario: 不同职业有不同成长系数
- **WHEN** 生成战士和牧师 AI
- **THEN** 战士的 HP 和力量成长系数高于牧师
- **AND** 牧师的智力和精神成长系数高于战士

## MODIFIED Requirements

### Requirement: 职业定位映射
系统 SHALL 根据职业和天赋确定角色定位，支持从天赋点分配数据动态计算主天赋。

#### Scenario: 纯职业定位
- **WHEN** 确定角色定位且无天赋信息
- **THEN** 按职业默认定位分配：
  - 战士 → 坦克
  - 盗贼 → 近战DPS
  - 猎人 → 远程DPS
  - 术士 → 远程DPS
  - 牧师 → 治疗

#### Scenario: 混合职业定位（显式指定天赋）
- **WHEN** 玩家是圣骑士，显式指定了防护天赋
- **THEN** 定位为坦克

#### Scenario: 混合职业定位（从天赋点动态计算）
- **WHEN** 玩家是战士，未显式指定 primaryTalent
- **AND** 玩家天赋点分配为：武器系 25 点、防护系 5 点、狂暴系 0 点
- **THEN** 系统动态计算投入最多的天赋树为 "arms"
- **AND** 使用 warrior_arms 映射，定位为近战DPS

#### Scenario: 混合职业定位（无天赋数据）
- **WHEN** 玩家是圣骑士，未指定 primaryTalent 且无 talents 数据
- **THEN** 使用职业默认定位
