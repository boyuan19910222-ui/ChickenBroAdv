## ADDED Requirements

### Requirement: 厄运之槌副本数据
系统 SHALL 定义厄运之槌副本的完整配置，推荐等级 56-60，包含 5 个 BOSS（合并 3 翼精选）。

#### Scenario: 副本基础信息
- **WHEN** 查看厄运之槌副本信息
- **THEN** 系统 SHALL 显示：名称"厄运之槌"、等级范围 56-60、emoji 🌿
- **THEN** 描述 SHALL 为"菲拉斯的古老暗夜精灵废墟，被恶魔和食人魔占据"

### Requirement: BOSS - 萨琳·刺蔓(Tendris Warpwood)
萨琳 SHALL 为树人型 BOSS，使用纠缠和召唤。

#### Scenario: 萨琳技能
- **WHEN** 萨琳行动
- **THEN** 可使用技能：纠缠根须（root all_enemies 1 回合）、树人召唤（summon 2 只树人小怪）、荆棘反弹（buff 反弹物理伤害 3 回合）

### Requirement: BOSS - 伊利亚纳·拉文特里(Illyanna Ravenoak)
伊利亚纳 SHALL 为猎人型 BOSS，带宠物。

#### Scenario: 伊利亚纳技能
- **WHEN** 伊利亚纳行动
- **THEN** 可使用技能：多重射击（random_3 物理）、宠物熊召唤（summon 1 只高 HP 熊）、快速射击（buff 增加自身 actionsPerTurn 1 回合）

### Requirement: BOSS - 托塞德林王子(Prince Tortheldrin)
托塞德林 SHALL 为剑士型 BOSS，使用旋风斩和反击。

#### Scenario: 托塞德林技能
- **WHEN** 托塞德林行动
- **THEN** 可使用技能：旋风斩（all_enemies 物理）、反击风暴（buff 反弹物理伤害 2 回合）、击碎护甲（debuff 降低护甲 3 回合）

### Requirement: BOSS - 戈多克大王(King Gordok)
戈多克大王 SHALL 为食人魔王型 BOSS。

#### Scenario: 戈多克大王技能
- **WHEN** 戈多克大王行动
- **THEN** 可使用技能：致死打击（物理高伤 + 治疗降低 debuff）、战斗怒吼（buff 增加全体敌方增伤）、旋风斩（all_enemies 物理）
- **THEN** P2（<30%HP）：狂暴增伤 + actionsPerTurn +1

### Requirement: BOSS - 伊莫塔尔(Immol'thar)
伊莫塔尔 SHALL 为终极 BOSS，虚空恶魔型，3 阶段 + 狂暴。

#### Scenario: 伊莫塔尔技能
- **WHEN** 伊莫塔尔行动
- **THEN** P1：虚空箭（shadow 单体高伤害）、恐惧（fear 单体 1 回合）
- **WHEN** 伊莫塔尔 HP 降至 60%
- **THEN** P2：虚空传送门（summon 2 只虚空小怪，每 4 回合再召唤）、毒眼（telegraph 1 回合 DOT all_enemies shadow）
- **WHEN** 伊莫塔尔 HP 降至 25%
- **THEN** P3：狂暴 damageModifier +50%、actionsPerTurn = 3
- **THEN** 狂暴计时器 SHALL 为 20 回合

### Requirement: 厄运之槌经典掉落
副本 SHALL 配置 5-8 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关厄运之槌
- **THEN** 经典掉落池 SHALL 包含：伊莫塔尔之核、王子之刃、大王的头颅等标志性装备
