## ADDED Requirements

### Requirement: 阿塔哈卡神庙副本数据
系统 SHALL 定义阿塔哈卡神庙（沉没的神庙）副本的完整配置，推荐等级 50-56，包含 5 个 BOSS。

#### Scenario: 副本基础信息
- **WHEN** 查看阿塔哈卡神庙副本信息
- **THEN** 系统 SHALL 显示：名称"阿塔哈卡神庙"、等级范围 50-56、emoji 🐍
- **THEN** 描述 SHALL 为"悲伤沼泽中沉没的古老巨魔神庙，充满龙类和哈卡的追随者"

### Requirement: BOSS - 阿塔莱守护者
阿塔莱守护者 SHALL 为近战重甲型 BOSS。

#### Scenario: 阿塔莱守护者技能
- **WHEN** 阿塔莱守护者行动
- **THEN** 可使用技能：地面震击（all_enemies 物理伤害）、横扫（front_2 物理）
- **THEN** P2（<40%HP）：狂暴增伤

### Requirement: BOSS - 梦游双龙
梦游双龙 SHALL 为双龙战：两只龙交替行动。

#### Scenario: 双龙战机制
- **WHEN** 进入双龙遭遇战
- **THEN** 两只龙 SHALL 分别占据 slot 1-2 和 slot 4-5
- **THEN** 可使用技能：酸液吐息（DOT front_3 nature）、翼击（debuff 降低护甲 2 回合）
- **THEN** 两龙 SHALL 交替行动（不同时行动，节省行动回合）

### Requirement: BOSS - 哈卡之影
哈卡之影 SHALL 为暗影吸血型 BOSS。

#### Scenario: 哈卡之影技能
- **WHEN** 哈卡之影行动
- **THEN** 可使用技能：暗影箭（all_enemies shadow）、生命汲取（lifesteal 吸取生命恢复自身）、腐蚀之血（shadow DOT 可叠加 stack，每层增加 tickDamage）

### Requirement: BOSS - 伊兰尼库斯之影
伊兰尼库斯 SHALL 为龙型 BOSS，使用睡眠和酸液。

#### Scenario: 伊兰尼库斯技能
- **WHEN** 伊兰尼库斯行动
- **THEN** 可使用技能：深度睡眠（stun 单体 2 回合）、酸液吐息（nature DOT front_3）
- **WHEN** 伊兰尼库斯 HP 降至 40%
- **THEN** P2 梦魇形态：shadow 伤害增加 + 召唤梦魇小怪（summon）

### Requirement: BOSS - 加玛拉
加玛拉 SHALL 为终极 BOSS，使用精神控制。

#### Scenario: 加玛拉技能
- **WHEN** 加玛拉行动
- **THEN** 可使用技能：精神控制（charm 1 回合，使 1 名队友变敌人攻击队友）、烈焰震击（fire DOT）、治疗术（heal 自身，需被打断）
- **THEN** 狂暴计时器 SHALL 为 18 回合

### Requirement: 阿塔哈卡神庙经典掉落
副本 SHALL 配置 5-8 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关阿塔哈卡神庙
- **THEN** 经典掉落池 SHALL 包含：哈卡的护符、龙梦之徽等标志性装备
