## ADDED Requirements

### Requirement: 职业专属技能配置
系统 SHALL 为每个职业配置专属技能列表，按天赋分支分类。

#### Scenario: 获取职业技能列表
- **WHEN** 访问职业的 skills 字段
- **THEN** 返回该职业可用的技能 ID 数组
- **AND** 技能按天赋分支和通用技能分类

#### Scenario: 验证技能归属
- **WHEN** 查询特定技能的归属职业
- **THEN** 系统返回该技能可用的职业列表

### Requirement: 技能数据结构
每个技能 SHALL 定义完整的属性配置。

#### Scenario: 技能基础属性
- **WHEN** 访问 GameData.skills 中的技能
- **THEN** 技能 MUST 包含 id、name、description、type、targetType 字段
- **AND** type 为 'active'（主动）或 'passive'（被动）
- **AND** targetType 为 'self'、'ally'、'enemy' 或 'area'

#### Scenario: 主动技能消耗
- **WHEN** 技能 type 为 'active'
- **THEN** 技能 MUST 定义 manaCost（或 rageCost/energyCost）和 cooldown

### Requirement: 战士专属技能
战士 SHALL 拥有物理战斗相关的专属技能。

#### Scenario: 战士核心技能
- **WHEN** 查看战士技能列表
- **THEN** 包含英勇打击、盾牌格挡、冲锋
- **AND** 包含顺劈斩、破甲攻击、嘲讽

#### Scenario: 战士怒气技能
- **WHEN** 战士使用技能
- **THEN** 技能消耗怒气（rage）而非法力
- **AND** 受击和攻击时生成怒气

### Requirement: 圣骑士专属技能
圣骑士 SHALL 拥有神圣魔法和近战相关的专属技能。

#### Scenario: 圣骑士核心技能
- **WHEN** 查看圣骑士技能列表
- **THEN** 包含圣光术、圣光闪现、神圣之盾
- **AND** 包含制裁之锤、奉献、圣印系列

#### Scenario: 圣印系统
- **WHEN** 圣骑士激活圣印
- **THEN** 获得持续的战斗增益效果
- **AND** 同时只能激活一个圣印

### Requirement: 猎人专属技能
猎人 SHALL 拥有远程射击和宠物相关的专属技能。

#### Scenario: 猎人核心技能
- **WHEN** 查看猎人技能列表
- **THEN** 包含瞄准射击、多重射击、奥术射击
- **AND** 包含宠物召唤、野兽之心、猎人印记

#### Scenario: 陷阱技能
- **WHEN** 猎人使用陷阱技能
- **THEN** 在地面放置陷阱
- **AND** 敌人触发时产生效果（冰冻/伤害/束缚）

### Requirement: 盗贼专属技能
盗贼 SHALL 拥有潜行和连击相关的专属技能。

#### Scenario: 盗贼核心技能
- **WHEN** 查看盗贼技能列表
- **THEN** 包含背刺、邪恶攻击、剔骨
- **AND** 包含潜行、消失、闷棍

#### Scenario: 连击点系统
- **WHEN** 盗贼使用连击技能
- **THEN** 在目标身上积累连击点（最多5点）
- **AND** 终结技威力随连击点增强

### Requirement: 牧师专属技能
牧师 SHALL 拥有神圣治疗和暗影魔法相关的专属技能。

#### Scenario: 牧师核心技能
- **WHEN** 查看牧师技能列表
- **THEN** 包含治疗术、快速治疗、恢复
- **AND** 包含真言术：盾、惩击、暗言术：痛

#### Scenario: 神圣与暗影双系
- **WHEN** 牧师选择技能
- **THEN** 可以使用神圣系治疗技能
- **AND** 可以使用暗影系伤害技能

### Requirement: 萨满祭司专属技能
萨满祭司 SHALL 拥有元素魔法和图腾相关的专属技能。

#### Scenario: 萨满核心技能
- **WHEN** 查看萨满祭司技能列表
- **THEN** 包含闪电箭、闪电链、地震术
- **AND** 包含治疗波、治疗链

#### Scenario: 图腾技能
- **WHEN** 萨满祭司使用图腾技能
- **THEN** 在地面放置图腾
- **AND** 图腾分为火焰、大地、水、风四系

### Requirement: 法师专属技能
法师 SHALL 拥有元素魔法和奥术相关的专属技能。

#### Scenario: 法师核心技能
- **WHEN** 查看法师技能列表
- **THEN** 包含火球术、寒冰箭、奥术飞弹
- **AND** 包含冰霜新星、闪现、变形术

#### Scenario: 传送门技能
- **WHEN** 法师学习传送门技能
- **THEN** 可以开启前往主城的传送门
- **AND** 传送门可供队友使用

### Requirement: 术士专属技能
术士 SHALL 拥有暗影魔法和恶魔相关的专属技能。

#### Scenario: 术士核心技能
- **WHEN** 查看术士技能列表
- **THEN** 包含暗影箭、献祭、腐蚀术
- **AND** 包含恐惧、生命分流、灵魂石

#### Scenario: 恶魔召唤技能
- **WHEN** 术士使用召唤恶魔技能
- **THEN** 召唤对应类型的恶魔助手
- **AND** 恶魔类型包含小鬼、虚空行者、魅魔、地狱猎犬

### Requirement: 德鲁伊专属技能
德鲁伊 SHALL 拥有变形和自然魔法相关的专属技能。

#### Scenario: 德鲁伊核心技能
- **WHEN** 查看德鲁伊技能列表
- **THEN** 包含月火术、愤怒、星火术
- **AND** 包含回春术、治疗之触、野性成长

#### Scenario: 变形技能
- **WHEN** 德鲁伊使用变形技能
- **THEN** 变换为指定动物形态（熊/豹/海豹/鸟）
- **AND** 不同形态拥有不同的技能栏

### Requirement: 技能等级解锁
技能 SHALL 根据角色等级逐步解锁。

#### Scenario: 检查技能解锁条件
- **WHEN** 角色尝试使用技能
- **THEN** 系统验证角色等级是否满足技能的 requiredLevel

#### Scenario: 技能等级提升
- **WHEN** 角色达到技能升级所需等级
- **THEN** 可以学习更高等级的技能版本
- **AND** 高等级技能伤害/效果更强
