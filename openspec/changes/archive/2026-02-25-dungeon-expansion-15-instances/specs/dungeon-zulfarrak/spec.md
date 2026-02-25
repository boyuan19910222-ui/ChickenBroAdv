## ADDED Requirements

### Requirement: 祖尔法拉克副本数据
系统 SHALL 定义祖尔法拉克副本的完整配置，推荐等级 44-54，包含 5 个 BOSS。

#### Scenario: 副本基础信息
- **WHEN** 查看祖尔法拉克副本信息
- **THEN** 系统 SHALL 显示：名称"祖尔法拉克"、等级范围 44-54、emoji ⏳
- **THEN** 描述 SHALL 为"塔纳利斯沙漠中的古老巨魔神庙，充满沙漠怪物和法力使者"

### Requirement: BOSS - 安图苏尔
安图苏尔 SHALL 为自然召唤型 BOSS。

#### Scenario: 安图苏尔技能
- **WHEN** 安图苏尔行动
- **THEN** 可使用技能：召唤蝎子（summon 2 只低 HP 蝎子）、大地之击（stun 1 回合 + nature）、闪电链（front_3 nature）

### Requirement: BOSS - 魔女赞达拉尔
赞达拉尔 SHALL 为亡灵召唤型 BOSS。

#### Scenario: 赞达拉尔技能
- **WHEN** 赞达拉尔行动
- **THEN** 可使用技能：召唤骷髅（summon 波次，每 3 回合召唤 1 只）、暗影箭（shadow 单体）、治疗术（heal 自身，需被打断）

### Requirement: BOSS - 乌克兹·沙顶
乌克兹 SHALL 为狂暴战士型 BOSS。

#### Scenario: 乌克兹技能
- **WHEN** 乌克兹行动
- **THEN** 可使用技能：战斗怒吼（buff 增伤）、旋风斩（all_enemies 物理）
- **THEN** P2（<40%HP）：enrage 狂暴，damageModifier +60%

### Requirement: BOSS - 首席执行官(Chief Ukorz Sandscalp)
首席执行官 SHALL 为近战 BOSS，使用致死打击。

#### Scenario: 首席执行官技能
- **WHEN** 首席执行官行动
- **THEN** 可使用技能：旋风斩（all_enemies 物理）、致死打击（物理高伤 + debuff 治疗效果降低 50% 持续 3 回合）

### Requirement: BOSS - 加兹瑞拉
加兹瑞拉 SHALL 为终极水元素 BOSS，3 阶段。

#### Scenario: 加兹瑞拉技能
- **WHEN** 加兹瑞拉行动
- **THEN** P1：冰冻（root all_enemies 1 回合）、寒冰箭（front_3 frost）
- **THEN** P2（<60%HP）：寒冰风暴（telegraph 2 回合 all_enemies frost 高伤害）
- **THEN** P3（<30%HP）：狂暴 + 每回合自动 frost AOE

### Requirement: 祖尔法拉克经典掉落
副本 SHALL 配置 5-8 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关祖尔法拉克
- **THEN** 经典掉落池 SHALL 包含：苏尔之击、沙地风暴等标志性装备
