## ADDED Requirements

### Requirement: 通灵学院副本数据
系统 SHALL 定义通灵学院副本的完整配置，推荐等级 58-60，包含 6 个 BOSS。

#### Scenario: 副本基础信息
- **WHEN** 查看通灵学院副本信息
- **THEN** 系统 SHALL 显示：名称"通灵学院"、等级范围 58-60、emoji 🎓
- **THEN** 描述 SHALL 为"西瘟疫之地凯尔达隆城堡中的亡灵学院，巫妖和死灵法师的教学圣地"

### Requirement: BOSS - 传令官基尔图诺斯(Kirtonos the Herald)
基尔图诺斯 SHALL 为吸血蝙蝠型 BOSS。

#### Scenario: 基尔图诺斯技能
- **WHEN** 基尔图诺斯行动
- **THEN** P1：吸血之咬（lifesteal）、暗影箭（shadow 单体）
- **WHEN** 基尔图诺斯 HP 降至 50%
- **THEN** P2 蝙蝠形态：speed buff + 伤害增加 30%

### Requirement: BOSS - 詹迪斯·巴罗夫(Jandice Barov)
詹迪斯 SHALL 为幻象型 BOSS，召唤分身。

#### Scenario: 詹迪斯幻象机制
- **WHEN** 詹迪斯行动且冷却就绪
- **THEN** 可使用幻象术：召唤 3 个分身（summon 低 HP 镜像），真身 HP 不变
- **THEN** 分身使用寒冰箭（frost 单体），被击杀后消失
- **THEN** 所有分身消失后，真身显现

#### Scenario: 詹迪斯基础技能
- **WHEN** 詹迪斯行动（非幻象回合）
- **THEN** 可使用技能：寒冰箭（frost 单体）、法术反射（spellReflect buff 2 回合）

### Requirement: BOSS - 拉特格尔(Rattlegore)
拉特格尔 SHALL 为骨甲重型 BOSS。

#### Scenario: 拉特格尔技能
- **WHEN** 拉特格尔行动
- **THEN** 可使用技能：战争践踏（all_enemies stun 1 回合）、致命打击（高物理单体）、骨甲（buff 减伤 30% 3 回合）

### Requirement: BOSS - 维克提斯(Vectus)
维克提斯 SHALL 为火焰型 BOSS。

#### Scenario: 维克提斯技能
- **WHEN** 维克提斯行动
- **THEN** 可使用技能：烈焰打击（fire 单体高伤害）、火焰护盾（buff 反弹 fire 伤害 3 回合）、火球术（fire front_2）

### Requirement: BOSS - 屠夫克拉斯提诺夫(Doctor Theolen Krastinov)
克拉斯提诺夫 SHALL 为高伤物理型 BOSS。

#### Scenario: 克拉斯提诺夫技能
- **WHEN** 克拉斯提诺夫行动
- **THEN** 可使用技能：屠夫刀（高物理单体）、背刺（物理高暴击单体）、恐惧（fear 单体 1 回合）

### Requirement: BOSS - 暗黑教师加丁(Darkmaster Gandling)
加丁 SHALL 为终极 BOSS，使用传送术和诅咒。

#### Scenario: 加丁技能
- **WHEN** 加丁行动
- **THEN** P1：暗影箭（shadow 单体）、诅咒（debuff 降低全属性 stack 可叠加）
- **THEN** 传送术：随机将 1 名队友 stun 2 回合 + 召唤 1 只骷髅在该队友位置
- **WHEN** 加丁 HP 降至 30%
- **THEN** P2：3 阶段狂暴 damageModifier +40%、传送术冷却缩短
- **THEN** 狂暴计时器 SHALL 为 20 回合

### Requirement: 通灵学院经典掉落
副本 SHALL 配置 8-12 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关通灵学院
- **THEN** 经典掉落池 SHALL 包含：加丁的黑暗法杖、屠夫的围裙、骨甲之盾等标志性装备
