## ADDED Requirements

### Requirement: 剃刀沼泽副本数据
系统 SHALL 定义剃刀沼泽副本的完整配置，推荐等级 29-38，包含 4 个 BOSS。

#### Scenario: 副本基础信息
- **WHEN** 查看剃刀沼泽副本信息
- **THEN** 系统 SHALL 显示：名称"剃刀沼泽"、等级范围 29-38、emoji 🦇
- **THEN** 描述 SHALL 为"贫瘠之地南部的野猪人巢穴，被死灵法师和野蛮部落占据"

### Requirement: BOSS - 阿格姆
阿格姆 SHALL 为德鲁伊型 BOSS，使用荆棘和治疗。

#### Scenario: 阿格姆技能
- **WHEN** 阿格姆行动
- **THEN** 可使用技能：荆棘诅咒（debuff 反弹 DOT 3 回合）、治疗术（heal 自身，需被打断）、荆棘鞭打（nature 单体）

### Requirement: BOSS - 死亡预言者苏拉比
苏拉比 SHALL 为暗影法师型 BOSS。

#### Scenario: 苏拉比技能
- **WHEN** 苏拉比行动
- **THEN** 可使用技能：暗影箭（shadow 单体）、恐惧术（fear 1 回合）、治疗术（heal 自身，需被打断）

### Requirement: BOSS - 主宰拉莫斯
拉莫斯 SHALL 为近战战士型 BOSS。

#### Scenario: 拉莫斯技能
- **WHEN** 拉莫斯行动
- **THEN** 可使用技能：冲锋（stun 1 回合 + 物理伤害）、战斗怒吼（buff 全体敌方增伤）、致命攻击（高物理单体）

### Requirement: BOSS - 唤风者卡莉瑟
卡莉瑟 SHALL 为终极 BOSS，使用闪电和治疗。

#### Scenario: 卡莉瑟技能
- **WHEN** 卡莉瑟行动
- **THEN** 可使用技能：闪电链（front_3 nature）、治疗链（heal 自身和小怪）、纠缠根须（root all_enemies 1 回合）
- **THEN** P2（<30%HP）：狂暴 + 召唤荆棘藤（summon）

### Requirement: 剃刀沼泽经典掉落
副本 SHALL 配置 5-8 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关剃刀沼泽
- **THEN** 经典掉落池 SHALL 包含相应等级标志性装备
