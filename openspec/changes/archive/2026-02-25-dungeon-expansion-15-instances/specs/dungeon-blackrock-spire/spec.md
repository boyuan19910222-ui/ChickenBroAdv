## ADDED Requirements

### Requirement: 黑石塔副本数据（大副本，上下层）
系统 SHALL 定义黑石塔为 `multi-wing` 类型副本，包含下层和上层两个独立战斗线路。

#### Scenario: 副本结构
- **WHEN** 查看黑石塔
- **THEN** 系统 SHALL 显示为大副本，emoji 🏔️，包含下层和上层的二级选择

### Requirement: 黑石塔下层（Lv 55-60，6 BOSS）

#### Scenario: BOSS - 高阶领主欧莫克
- **WHEN** 欧莫克行动
- **THEN** 可使用技能：震击波（front_3 stun 1 回合）、击飞（debuff 降低护甲 2 回合）
- **THEN** P2（<30%HP）：狂暴增伤

#### Scenario: BOSS - 暗影猎手沃许
- **WHEN** 沃许行动
- **THEN** 可使用技能：妖术（fear 单体 1 回合）、暗影箭（shadow 单体）、治疗术（heal 自身，需被打断）

#### Scenario: BOSS - 军阀沃恩(War Master Voone)
- **WHEN** 沃恩行动
- **THEN** 可使用技能：旋风斩（all_enemies 物理）、致死打击（物理 + 治疗降低 debuff）、冲锋（stun 1 回合）

#### Scenario: BOSS - 军需官兹格雷斯(Quartermaster Zigris)
- **WHEN** 兹格雷斯行动
- **THEN** 可使用技能：多重射击（random_3 物理）、毒蛇钉刺（nature DOT）、陷阱（telegraph 1 回合 stun 1 回合单体）

#### Scenario: BOSS - 嗜血者哈雷肯+吉兹鲁尔(Halycon+Gizrul)
- **WHEN** 进入嗜血者遭遇战
- **THEN** 两只野兽同时在场：嗜血者（buff 加速连击）、吉兹鲁尔（撕咬 DOT）
- **THEN** 任一被击败后另一只狂暴

#### Scenario: BOSS - 酋长维姆萨拉克(Overlord Wyrmthalak)
- **WHEN** 维姆萨拉克行动
- **THEN** P1：冲锋（stun）、击碎护甲（debuff）
- **THEN** P2（<60%HP）：召唤龙人护卫（summon 2 只）
- **THEN** P3（<25%HP）：狂暴 damageModifier +50%、actionsPerTurn +1

### Requirement: 黑石塔上层（Lv 58-60，5 BOSS）

#### Scenario: BOSS - 焰卫者(Pyroguard Emberseer)
- **WHEN** 焰卫者行动
- **THEN** 可使用技能：火焰新星（all_enemies fire）、火焰护盾（buff 反弹 fire 伤害）
- **THEN** P2（<40%HP）：烈焰释放（telegraph 2 回合 all_enemies fire 巨额伤害）

#### Scenario: BOSS - 索拉卡·火冠
- **WHEN** 索拉卡行动
- **THEN** 可使用技能：召唤火鹰（summon 2 只）、火焰打击（cleave_3 fire）

#### Scenario: BOSS - 比斯巨兽(The Beast)
- **WHEN** 比斯行动
- **THEN** 可使用技能：烈焰吐息（front_3 fire）、恐惧嚎叫（fear all_enemies 1 回合）、吞噬（telegraph 1 回合 stun + DOT 单体高伤害）

#### Scenario: BOSS - 雷德·黑手+盖斯(Rend+Gyth)
- **WHEN** 进入雷德遭遇战
- **THEN** P1 骑龙盖斯：龙息（fire front_3）、翼击（debuff）
- **WHEN** 盖斯被击败
- **THEN** P2 雷德跳下：旋风斩（all_enemies 物理）、致死打击（治疗降低 debuff）、狂暴

#### Scenario: BOSS - 达基萨斯将军(General Drakkisath)
- **WHEN** 达基萨斯行动
- **THEN** P1：烈焰之击（fire 高伤单体）、击碎护甲（debuff）
- **THEN** P2（<60%HP）：召唤龙人护卫（summon 2 只）
- **THEN** P3（<25%HP）：3 阶段狂暴 damageModifier +60%

### Requirement: 黑石塔经典掉落
上下层合计 SHALL 配置 10-12 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关黑石塔各层
- **THEN** 经典掉落池 SHALL 包含：达基萨斯的战斧、比斯巨兽之皮、黑手护腕等标志性装备
