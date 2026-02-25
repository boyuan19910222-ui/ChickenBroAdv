## ADDED Requirements

### Requirement: 斯坦索姆副本数据
系统 SHALL 定义斯坦索姆副本的完整配置，推荐等级 58-60，包含 6 个 BOSS（精简自 10+）。

#### Scenario: 副本基础信息
- **WHEN** 查看斯坦索姆副本信息
- **THEN** 系统 SHALL 显示：名称"斯坦索姆"、等级范围 58-60、emoji 💀
- **THEN** 描述 SHALL 为"东瘟疫之地被天灾军团摧毁的城市废墟，充满亡灵和恐惧领主"

### Requirement: BOSS - 提米(Timmy the Cruel)
提米 SHALL 为狂暴近战型 BOSS。

#### Scenario: 提米技能
- **WHEN** 提米行动
- **THEN** 可使用技能：狂暴（enrage buff 增伤 50% 3 回合）、致命攻击（高物理单体）、恐惧嚎叫（fear all_enemies 1 回合）

### Requirement: BOSS - 弗拉斯·希亚比(Hearthsinger Forresten)
弗拉斯 SHALL 为蛊惑型 BOSS。

#### Scenario: 弗拉斯技能
- **WHEN** 弗拉斯行动
- **THEN** 可使用技能：蛊惑之歌（charm 单体 1 回合，使队友变敌人）、多重射击（random_3 物理）、催眠曲（stun 单体 2 回合）

### Requirement: BOSS - 奥里克斯(Magistrate Barthilas)
奥里克斯 SHALL 为火焰近战型 BOSS。

#### Scenario: 奥里克斯技能
- **WHEN** 奥里克斯行动
- **THEN** 可使用技能：龙息（fire front_3）、击飞（debuff 降低护甲）、冲锋（stun 1 回合 + 物理伤害）

### Requirement: BOSS - 女男爵安娜丝塔丽(Baroness Anastari)
安娜丝塔丽 SHALL 为暗影控制型 BOSS。

#### Scenario: 安娜丝塔丽技能
- **WHEN** 安娜丝塔丽行动
- **THEN** 可使用技能：精神控制（charm 1 回合）、暗影箭（shadow 单体高伤害）、沉默（debuff 使目标无法施法 1 回合）

### Requirement: BOSS - 奈鲁布恩坎(Nerub'enkan)
奈鲁布恩坎 SHALL 为蜘蛛型 BOSS。

#### Scenario: 奈鲁布恩坎技能
- **WHEN** 奈鲁布恩坎行动
- **THEN** 可使用技能：蛛网（root 单体 2 回合）、毒液（nature DOT）、召唤蜘蛛（summon 2 只低 HP 蜘蛛）

### Requirement: BOSS - 瑞文戴尔男爵(Baron Rivendare)
瑞文戴尔男爵 SHALL 为终极 BOSS，3 阶段 + 狂暴。

#### Scenario: 瑞文戴尔男爵技能
- **WHEN** 男爵行动
- **THEN** P1：死亡缠绕（shadow 伤害 + lifesteal 恢复自身）、暗影箭（shadow 单体）
- **WHEN** 男爵 HP 降至 60%
- **THEN** P2：召唤骷髅波（summon 3 只骷髅战士）、解锁 all_enemies 暗影箭
- **WHEN** 男爵 HP 降至 25%
- **THEN** P3：狂暴 damageModifier +50%、actionsPerTurn = 3
- **THEN** 狂暴计时器 SHALL 为 20 回合

### Requirement: 斯坦索姆经典掉落
副本 SHALL 配置 8-12 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关斯坦索姆
- **THEN** 经典掉落池 SHALL 包含：瑞文戴尔男爵的死亡战马缰绳（极稀有饰品）、正义之手、死灵之握等标志性装备
