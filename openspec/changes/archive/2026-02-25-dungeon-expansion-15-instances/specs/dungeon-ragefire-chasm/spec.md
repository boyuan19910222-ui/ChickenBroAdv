## ADDED Requirements

### Requirement: 怒焰裂谷副本数据
系统 SHALL 定义怒焰裂谷副本的完整配置，推荐等级 13-18，包含 4 个 BOSS。

#### Scenario: 副本基础信息
- **WHEN** 查看怒焰裂谷副本信息
- **THEN** 系统 SHALL 显示：名称"怒焰裂谷"、等级范围 13-18、emoji 🔥
- **THEN** 描述 SHALL 为"奥格瑞玛地下的火焰洞穴，被邪恶的暗影议会成员和恶魔占据"

### Requirement: 怒焰裂谷遭遇战序列
副本 SHALL 定义线性遭遇战序列：每个 BOSS 前 2~3 波小怪。

#### Scenario: 完整遭遇战列表
- **WHEN** 读取副本 encounters
- **THEN** SHALL 包含约 8-12 波小怪 + 4 个 BOSS 遭遇战

### Requirement: BOSS - 奥格芬格
奥格芬格 SHALL 为近战型 BOSS，使用战斗怒吼增强自身。

#### Scenario: 奥格芬格技能
- **WHEN** 奥格芬格行动
- **THEN** 可使用技能：重击（高物理单体）、战斗怒吼（自 buff 增加伤害 2 回合）

### Requirement: BOSS - 塔拉加曼
塔拉加曼 SHALL 为火焰型 BOSS，使用 AOE 火焰攻击。

#### Scenario: 塔拉加曼技能
- **WHEN** 塔拉加曼行动
- **THEN** 可使用技能：火焰打击（all_enemies 火焰伤害）、火焰新星（front_3 火焰伤害 + DOT）

### Requirement: BOSS - 杰格罗什
杰格罗什 SHALL 为暗影法师型 BOSS，使用 DOT 和诅咒。

#### Scenario: 杰格罗什技能
- **WHEN** 杰格罗什行动
- **THEN** 可使用技能：献祭（fire DOT 3 回合）、虚弱诅咒（debuff 降低目标伤害 3 回合）、暗影箭（shadow 单体伤害）

### Requirement: BOSS - 巴扎兰
巴扎兰 SHALL 为恶魔猎手型 BOSS，使用毒药和近战连击。

#### Scenario: 巴扎兰技能
- **WHEN** 巴扎兰行动
- **THEN** 可使用技能：正弦切割（物理单体高伤害）、毒药涂层（nature DOT 3 回合）
- **THEN** 巴扎兰 SHALL 有 2 阶段：P1 正常，P2（<40%HP）狂暴增伤 30%

### Requirement: 怒焰裂谷经典掉落
副本 SHALL 配置 3-5 件经典装备模板作为 exclusiveDrops。

#### Scenario: 经典掉落列表
- **WHEN** 通关怒焰裂谷
- **THEN** 经典掉落池 SHALL 包含标志性装备（如毁灭者之刃等低级蓝装）
