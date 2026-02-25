## ADDED Requirements

### Requirement: 影牙城堡副本数据
系统 SHALL 定义影牙城堡副本的完整配置，推荐等级 22-30，包含 5 个 BOSS。

#### Scenario: 副本基础信息
- **WHEN** 查看影牙城堡副本信息
- **THEN** 系统 SHALL 显示：名称"影牙城堡"、等级范围 22-30、emoji 🏰
- **THEN** 描述 SHALL 为"银松森林中被诅咒的城堡，充满亡灵和狼人"

### Requirement: BOSS - 拉文凯斯男爵
拉文凯斯 SHALL 为亡灵召唤型 BOSS。

#### Scenario: 拉文凯斯技能
- **WHEN** 拉文凯斯行动
- **THEN** 可使用技能：亡灵召唤（summon 骷髅小怪）、虚无箭（shadow 单体伤害）

### Requirement: BOSS - 指挥官斯普林瓦尔
斯普林瓦尔 SHALL 为圣光型 BOSS，使用护盾和反弹伤害。

#### Scenario: 斯普林瓦尔技能
- **WHEN** 斯普林瓦尔行动
- **THEN** 可使用技能：神圣之盾（shield 吸收伤害）、复仇之盾（buff 反弹物理伤害）、召唤灵魂（summon）

### Requirement: BOSS - 盲眼沃尔夫勋爵(Baron Ashbury)
沃尔夫 SHALL 为暗影型 BOSS，使用窒息和自愈。

#### Scenario: 沃尔夫技能
- **WHEN** 沃尔夫行动
- **THEN** 可使用技能：窒息之握（stun 1 回合 + shadow DOT）、黑暗愈合（heal 自身，需被打断）

### Requirement: BOSS - 沃尔登领主(Lord Walden)
沃尔登 SHALL 为双属性切换 BOSS：冰霜/毒药。

#### Scenario: 沃尔登阶段切换
- **WHEN** 沃尔登 HP 降至 50%
- **THEN** 系统 SHALL 从毒药阶段切换到冰霜阶段
- **THEN** P1 毒药：毒药混合（poison DOT）、毒雾（all_enemies debuff）
- **THEN** P2 冰霜：冰冻（root all_enemies 1 回合）、寒冰箭（frost 高伤）

### Requirement: BOSS - 大领主戈弗雷(Lord Godfrey)
戈弗雷 SHALL 为终极 BOSS，使用暗影弹幕和召唤。

#### Scenario: 戈弗雷技能
- **WHEN** 戈弗雷行动
- **THEN** 可使用技能：诅咒弹幕（random_3 shadow 伤害）、召唤食尸鬼（summon）、手枪射击（高物理单体）
- **THEN** P2（<30%HP）：狂暴增伤 + actionsPerTurn +1

### Requirement: 影牙城堡经典掉落
副本 SHALL 配置 5-8 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关影牙城堡
- **THEN** 经典掉落池 SHALL 包含：影牙之刃、黑夜之咬、幽灵斗篷等标志性装备
