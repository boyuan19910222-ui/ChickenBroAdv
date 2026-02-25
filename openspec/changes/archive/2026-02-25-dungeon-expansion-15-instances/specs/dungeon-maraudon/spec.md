## ADDED Requirements

### Requirement: 玛拉顿副本数据
系统 SHALL 定义玛拉顿副本的完整配置，推荐等级 46-55，包含 5 个 BOSS。

#### Scenario: 副本基础信息
- **WHEN** 查看玛拉顿副本信息
- **THEN** 系统 SHALL 显示：名称"玛拉顿"、等级范围 46-55、emoji 🌊
- **THEN** 描述 SHALL 为"凄凉之地深处被腐化的元素圣地"

### Requirement: BOSS - 诺克赛恩
诺克赛恩 SHALL 为毒性分裂型 BOSS。

#### Scenario: 诺克赛恩技能
- **WHEN** 诺克赛恩行动
- **THEN** 可使用技能：毒性喷射（poison DOT all_enemies）、分裂（summon 2 个低 HP 毒性小怪）、毒云（nature all_enemies 伤害）

### Requirement: BOSS - 维利塔恩
维利塔恩 SHALL 为荆棘近战型 BOSS。

#### Scenario: 维利塔恩技能
- **WHEN** 维利塔恩行动
- **THEN** 可使用技能：穿刺（高物理单体）、荆棘护甲（buff 反弹物理伤害 3 回合）、鞭打（front_2 物理）

### Requirement: BOSS - 被诅咒的塞雷布拉斯
塞雷布拉斯 SHALL 为德鲁伊型 BOSS，使用自然法术和治疗。

#### Scenario: 塞雷布拉斯技能
- **WHEN** 塞雷布拉斯行动
- **THEN** 可使用技能：纠缠根须（root 单体 2 回合）、愤怒（nature 单体伤害）、治疗术（heal 自身，需被打断）

### Requirement: BOSS - 兰斯利德
兰斯利德 SHALL 为大地元素型 BOSS，使用 AOE 震击。

#### Scenario: 兰斯利德技能
- **WHEN** 兰斯利德行动
- **THEN** 可使用技能：大地震击（telegraph 1 回合 all_enemies stun 1 回合 + nature 高伤害）、石甲（buff 减伤 40% 2 回合）、巨石投掷（单体 nature 高伤害）

### Requirement: BOSS - 瑟莱德斯公主
瑟莱德斯 SHALL 为终极 BOSS，使用大地和岩石攻击，P2 有物理免疫阶段。

#### Scenario: 瑟莱德斯技能
- **WHEN** 瑟莱德斯行动
- **THEN** P1：灰尘之暴（all_enemies nature DOT）、巨石投掷（telegraph 1 回合 高伤单体）
- **WHEN** 瑟莱德斯 HP 降至 40%
- **THEN** P2：岩石之盾（physicalImmune buff 2 回合，只能用法术打）、大地震击（all_enemies nature）
- **THEN** P3（physicalImmune 结束后）：狂暴增伤 + actionsPerTurn +1

### Requirement: 玛拉顿经典掉落
副本 SHALL 配置 5-8 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关玛拉顿
- **THEN** 经典掉落池 SHALL 包含：石母之戒、瑟莱德斯之杖等标志性装备
