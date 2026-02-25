## ADDED Requirements

### Requirement: 血色修道院副本数据（大副本，4 翼）
系统 SHALL 定义血色修道院为 `multi-wing` 类型副本，包含 4 个独立翼：墓地、图书馆、军械库、大教堂。

#### Scenario: 副本结构
- **WHEN** 查看血色修道院
- **THEN** 系统 SHALL 显示为大副本，包含 4 个翼的二级选择
- **THEN** 每个翼 SHALL 为独立的副本数据文件

### Requirement: 墓地翼（Lv 28-38，1 BOSS）

#### Scenario: BOSS - 血色审讯官(Bloodmage Thalnos)
- **WHEN** 血色审讯官行动
- **THEN** 可使用技能：烈焰震击（fire DOT 3 回合）、暗影箭（shadow 单体）、灵魂汲取（lifesteal 吸取目标生命恢复自身）

### Requirement: 图书馆翼（Lv 33-40，2 BOSS）

#### Scenario: BOSS - 猎犬统领洛克希
- **WHEN** 洛克希行动
- **THEN** 可使用技能：召唤血色猎犬（summon 2 只低 HP 猎犬）、血性狂乱（buff 自身和猎犬增伤 2 回合）

#### Scenario: BOSS - 阿鲁安·杜安
- **WHEN** 杜安行动
- **THEN** 可使用技能：奥术爆炸（telegraph 1 回合 all_enemies arcane 高伤害）、沉默（debuff 使目标无法施法 1 回合）、法力护盾（shield 吸收伤害）

### Requirement: 军械库翼（Lv 36-42，1 BOSS）

#### Scenario: BOSS - 血色十字军指挥官赫洛德(Herod)
- **WHEN** 赫洛德行动
- **THEN** P1 可使用技能：旋风斩（telegraph 1 回合 all_enemies 高物理伤害）、冲锋（stun 1 回合 + 物理伤害）
- **WHEN** 赫洛德 HP 降至 30%
- **THEN** P2：狂暴 buff（增伤 40%）、旋风斩冷却缩短

### Requirement: 大教堂翼（Lv 38-44，3 BOSS）

#### Scenario: BOSS - 审讯员弗尔席恩
- **WHEN** 弗尔席恩行动
- **THEN** 可使用技能：诅咒（debuff 降低全属性 3 回合）、吸血之触（lifesteal）、恐惧（fear 单体 1 回合）

#### Scenario: 双 BOSS 战 - 莫格莱尼 + 怀特迈恩
- **WHEN** 进入莫格莱尼遭遇战
- **THEN** P1：莫格莱尼独战，使用十字军打击（holy 高伤单体）、圣光护盾（shield）
- **WHEN** 莫格莱尼 HP 降至 0
- **THEN** 莫格莱尼标记为 `isDown: true`（不从战场移除）
- **THEN** 怀特迈恩出场（slot 4-5），使用治疗术（heal 自身）、惩击（holy 单体）
- **THEN** 怀特迈恩 SHALL 使用复活术（telegraph 2 回合 resurrect 莫格莱尼满血）
- **WHEN** 复活术成功释放
- **THEN** P3：莫格莱尼满血复活 + 狂暴 buff（增伤 50%）、双 BOSS 同时行动
- **WHEN** 两个 BOSS 均被击败
- **THEN** 遭遇战胜利

#### Scenario: 怀特迈恩被击败阻止复活
- **WHEN** 怀特迈恩在复活术蓄力期间被击败
- **THEN** resurrect SHALL 不生效
- **THEN** 遭遇战胜利（莫格莱尼已倒下 + 怀特迈恩已击败）

### Requirement: 血色修道院经典掉落
4 翼合计 SHALL 配置 8-12 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关血色修道院各翼
- **THEN** 经典掉落池 SHALL 包含：血色十字军头盔、莫格莱尼的力量、正义圣袍、赫洛德的肩甲等标志性装备
