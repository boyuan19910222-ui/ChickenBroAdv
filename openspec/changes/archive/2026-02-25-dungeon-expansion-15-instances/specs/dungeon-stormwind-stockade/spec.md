## ADDED Requirements

### Requirement: 暴风城监狱副本数据
系统 SHALL 定义暴风城监狱副本的完整配置，推荐等级 24-32，包含 3 个 BOSS。

#### Scenario: 副本基础信息
- **WHEN** 查看暴风城监狱副本信息
- **THEN** 系统 SHALL 显示：名称"暴风城监狱"、等级范围 24-32、emoji ⛓️
- **THEN** 描述 SHALL 为"暴风城地下监狱，关押着迪菲亚兄弟会和危险罪犯"

### Requirement: BOSS - 巴吉尔·斯瑞德
巴吉尔 SHALL 为盗贼型 BOSS，使用毒药和烟雾。

#### Scenario: 巴吉尔技能
- **WHEN** 巴吉尔行动
- **THEN** 可使用技能：致残毒药（debuff 降低目标速度 2 回合）、烟雾弹（all_enemies debuff 降低命中 2 回合）、背刺（高物理单体）

### Requirement: BOSS - 德克斯特·沃德
德克斯特 SHALL 为恐惧型 BOSS。

#### Scenario: 德克斯特技能
- **WHEN** 德克斯特行动
- **THEN** 可使用技能：恐惧（fear 单体 1 回合）、恐惧嚎叫（all_enemies fear 1 回合，cooldown 5）、重击（物理单体）

### Requirement: BOSS - 卡姆·迪普顿
卡姆 SHALL 为防御型 BOSS，使用盾牌技能。

#### Scenario: 卡姆技能
- **WHEN** 卡姆行动
- **THEN** 可使用技能：盾牌猛击（stun 1 回合 + 物理伤害）、盾墙（buff 减伤 50% 持续 2 回合）、战斗怒吼（buff 增加自身伤害 3 回合）

### Requirement: 暴风城监狱经典掉落
副本 SHALL 配置 3-5 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关暴风城监狱
- **THEN** 经典掉落池 SHALL 包含相应等级的标志性蓝色装备
