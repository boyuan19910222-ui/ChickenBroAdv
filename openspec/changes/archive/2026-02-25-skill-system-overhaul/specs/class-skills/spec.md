## ADDED Requirements

### Requirement: 战士技能组（8个）
战士 SHALL 拥有以下 8 个技能，资源类型为 rage（怒气）：

| id | name | category | skillType | damageType | targetType | AP | CD | rage | unlockLevel |
|---|---|---|---|---|---|---|---|---|---|
| heroicStrike | 英勇打击 | filler | melee | physical | enemy | 1 | 0 | 15 | 1 |
| charge | 冲锋 | core | melee | physical | enemy | 2 | 3 | 0(+15) | 1 |
| shieldBlock | 盾牌格挡 | utility | buff | null | self | 1 | 2 | 10 | 4 |
| mortalStrike | 致死打击 | core | melee | physical | enemy | 2 | 2 | 25 | 8 |
| thunderClap | 雷霆一击 | core | melee | physical | front_2 | 2 | 3 | 20 | 14 |
| taunt | 嘲讽 | utility | debuff | null | enemy | 1 | 3 | 5 | 20 |
| execute | 斩杀 | powerful | melee | physical | enemy | 2 | 3 | 30 | 30 |
| shieldWall | 盾墙 | ultimate | buff | null | self | 3 | 8 | 40 | 40 |

charge 产生 15 怒气 (generatesResource)。execute 有条件 targetBelowHp: 0.2（目标 <20% HP 伤害翻倍）。mortalStrike 附带 debuff: 治疗效果-50% 2回合。thunderClap 附带 debuff: 减速 2 回合。shieldBlock 附带 buff: 减伤50% 1回合。shieldWall 附带 buff: 减伤75% 2回合。taunt 附带 debuff: 强制攻击自己 2回合。

#### Scenario: 战士初始技能
- **WHEN** 创建 1 级战士
- **THEN** 该角色 SHALL 拥有 heroicStrike 和 charge

#### Scenario: 战士技能逐级解锁
- **WHEN** 战士升到 8 级
- **THEN** 该角色 SHALL 解锁 mortalStrike

### Requirement: 盗贼技能组（7个）
盗贼 SHALL 拥有以下 7 个技能，资源类型为 energy（能量），附加 comboPoints 机制：

| id | name | category | skillType | damageType | targetType | AP | CD | energy | unlockLevel |
|---|---|---|---|---|---|---|---|---|---|
| shadowStrike | 影袭 | builder | melee | physical | enemy | 1 | 0 | 40 | 1 |
| backstab | 背刺 | builder | melee | physical | enemy | 2 | 0 | 60 | 4 |
| eviscerate | 剔骨 | finisher | melee | physical | enemy | 2 | 0 | 35 | 1 |
| poisonBlade | 毒刃 | utility | melee | nature | enemy | 1 | 2 | 35 | 8 |
| kidneyShot | 肾击 | finisher | melee | physical | enemy | 2 | 4 | 25 | 14 |
| evade | 闪避 | utility | buff | null | self | 1 | 4 | 25 | 20 |
| vanish | 消失 | powerful | buff | null | self | 2 | 5 | 30 | 30 |

shadowStrike 和 backstab 产生 1 连击点 (comboPoints.generates: 1)。eviscerate 消耗连击点 (comboPoints.requires: true)，伤害随连击点阶梯增长。kidneyShot 消耗连击点，眩晕 1~3 回合随连击点增长。poisonBlade 附带 DOT: 自然毒素 3 回合。evade 附带 buff: 闪避+50% 2回合。vanish 附带 buff: 脱离仇恨+下次暴击。

#### Scenario: 盗贼初始技能
- **WHEN** 创建 1 级盗贼
- **THEN** 该角色 SHALL 拥有 shadowStrike 和 eviscerate

#### Scenario: 连击点积攒
- **WHEN** 盗贼使用 shadowStrike
- **THEN** 连击点 SHALL 增加 1

### Requirement: 法师技能组（7个）
法师 SHALL 拥有以下 7 个技能，资源类型为 mana（法力）：

| id | name | category | skillType | damageType | targetType | AP | CD | mana | unlockLevel |
|---|---|---|---|---|---|---|---|---|---|
| fireBlast | 火焰冲击 | filler | spell | fire | enemy | 1 | 0 | 12 | 1 |
| fireball | 火球术 | core | spell | fire | enemy | 2 | 0 | 20 | 1 |
| frostbolt | 寒冰箭 | core | spell | frost | enemy | 2 | 0 | 22 | 4 |
| frostNova | 冰霜新星 | utility | spell | frost | all_enemies | 2 | 3 | 35 | 14 |
| arcaneIntellect | 奥术智慧 | utility | buff | null | self | 1 | 5 | 30 | 8 |
| pyroblast | 炎爆术 | powerful | spell | fire | enemy | 3 | 4 | 50 | 20 |
| blizzard | 暴风雪 | powerful | spell | frost | all_enemies | 3 | 4 | 55 | 30 |

frostbolt 附带 debuff: 减速 2 回合。frostNova 附带 cc: freeze 冻结 1 回合。arcaneIntellect 附带 buff: 智力+10% 99回合（持久）。pyroblast 附带 DOT: 火焰 3 回合。blizzard 附带 debuff: 减速 3 回合。

#### Scenario: 法师初始技能
- **WHEN** 创建 1 级法师
- **THEN** 该角色 SHALL 拥有 fireBlast 和 fireball

#### Scenario: 法师 AOE 技能
- **WHEN** 法师在副本中使用 blizzard
- **THEN** SHALL 对所有存活敌人造成冰霜伤害并施加减速

### Requirement: 牧师技能组（8个）
牧师 SHALL 拥有以下 8 个技能，资源类型为 mana（法力）：

| id | name | category | skillType | damageType | targetType | AP | CD | mana | unlockLevel |
|---|---|---|---|---|---|---|---|---|---|
| smite | 惩击 | filler | spell | holy | enemy | 1 | 0 | 15 | 1 |
| heal | 治疗术 | core | heal | null | ally | 2 | 0 | 25 | 1 |
| renew | 恢复 | utility | heal | null | ally | 1 | 0 | 20 | 4 |
| shield | 真言术：盾 | core | buff | null | ally | 2 | 3 | 30 | 8 |
| dispelMagic | 驱散魔法 | utility | buff | null | ally | 1 | 2 | 18 | 14 |
| shadowWordPain | 暗言术：痛 | utility | spell | shadow | enemy | 1 | 0 | 18 | 20 |
| greaterHeal | 强效治疗 | powerful | heal | null | ally | 3 | 3 | 50 | 30 |
| prayerOfHealing | 治疗祷言 | ultimate | heal | null | all_allies | 3 | 5 | 60 | 40 |

renew 附带 HOT: 每回合治疗 4 回合。shield 附带 shield: 吸收 50 伤害 3 回合。dispelMagic 移除目标 1 个 debuff。shadowWordPain 附带 DOT: 暗影伤害 5 回合。prayerOfHealing 群体治疗全队。

#### Scenario: 牧师初始技能
- **WHEN** 创建 1 级牧师
- **THEN** 该角色 SHALL 拥有 smite 和 heal

#### Scenario: 牧师 HOT 效果
- **WHEN** 牧师对队友使用 renew
- **THEN** 目标 SHALL 获得持续 4 回合的 HOT 效果

### Requirement: 猎人技能组（7个）
猎人 SHALL 拥有以下 7 个技能，资源类型为 mana（法力）：

| id | name | category | skillType | damageType | targetType | AP | CD | mana | unlockLevel |
|---|---|---|---|---|---|---|---|---|---|
| arcaneShot | 奥术射击 | filler | ranged | arcane | enemy | 1 | 0 | 12 | 1 |
| aimedShot | 瞄准射击 | core | ranged | physical | enemy | 2 | 2 | 20 | 1 |
| multiShot | 多重射击 | core | ranged | physical | random_3 | 2 | 2 | 25 | 14 |
| serpentSting | 毒蛇钉刺 | utility | ranged | nature | enemy | 1 | 0 | 15 | 8 |
| disengage | 脱离战斗 | utility | buff | null | self | 1 | 4 | 15 | 20 |
| rapidFire | 急速射击 | powerful | buff | null | self | 3 | 5 | 40 | 30 |
| petAttack | 宠物攻击 | filler | melee | physical | enemy | 1 | 0 | 0 | 4 |

serpentSting 附带 DOT: 自然伤害 4 回合。disengage 附带 buff: 闪避 100% 1 回合。rapidFire 附带 buff: 下 2 次攻击伤害+50%。petAttack 消耗 0 法力（宠物行动）。

#### Scenario: 猎人初始技能
- **WHEN** 创建 1 级猎人
- **THEN** 该角色 SHALL 拥有 arcaneShot 和 aimedShot

#### Scenario: 猎人 AOE 技能
- **WHEN** 猎人在副本中使用 multiShot
- **THEN** SHALL 从存活敌人中随机选取最多 3 个目标造成伤害

### Requirement: 圣骑士技能组（7个）
圣骑士 SHALL 拥有以下 7 个技能，资源类型为 mana（法力）：

| id | name | category | skillType | damageType | targetType | AP | CD | mana | unlockLevel |
|---|---|---|---|---|---|---|---|---|---|
| crusaderStrike | 十字军打击 | filler | melee | holy | enemy | 1 | 0 | 12 | 1 |
| holyLight | 圣光术 | core | heal | null | ally | 2 | 0 | 35 | 1 |
| hammerOfJustice | 制裁之锤 | core | melee | holy | enemy | 2 | 4 | 30 | 4 |
| consecration | 奉献 | core | spell | holy | all_enemies | 2 | 3 | 40 | 8 |
| blessingOfProtection | 保护祝福 | utility | buff | null | ally | 2 | 5 | 35 | 14 |
| divineShield | 神圣之盾 | ultimate | buff | null | self | 3 | 8 | 50 | 30 |
| layOnHands | 圣疗术 | ultimate | heal | null | ally | 3 | 10 | 60 | 40 |

hammerOfJustice 附带 cc: stun 眩晕 2 回合。consecration 附带 DOT: 神圣伤害 all_enemies 4 回合。blessingOfProtection 附带 buff: 减伤30% 3回合。divineShield 附带 buff: 免疫所有伤害 2 回合。layOnHands 瞬间回满目标生命值。

#### Scenario: 圣骑士初始技能
- **WHEN** 创建 1 级圣骑士
- **THEN** 该角色 SHALL 拥有 crusaderStrike 和 holyLight

#### Scenario: 圣骑士坦克技能
- **WHEN** 圣骑士使用 consecration
- **THEN** SHALL 对所有存活敌人施加 DOT 效果

### Requirement: 萨满技能组（7个）
萨满 SHALL 拥有以下 7 个技能，资源类型为 mana（法力）：

| id | name | category | skillType | damageType | targetType | AP | CD | mana | unlockLevel |
|---|---|---|---|---|---|---|---|---|---|
| lightningBolt | 闪电箭 | filler | spell | nature | enemy | 1 | 0 | 15 | 1 |
| flameShock | 烈焰震击 | core | spell | fire | enemy | 1 | 2 | 20 | 1 |
| earthShock | 大地震击 | core | spell | nature | enemy | 1 | 2 | 20 | 8 |
| healingWave | 治疗波 | core | heal | null | ally | 2 | 0 | 30 | 4 |
| searingTotem | 灼热图腾 | utility | summon | fire | enemy | 1 | 3 | 20 | 14 |
| chainLightning | 闪电链 | powerful | spell | nature | front_3 | 3 | 4 | 45 | 20 |
| chainHeal | 治疗链 | powerful | heal | null | all_allies | 3 | 4 | 50 | 30 |

flameShock 附带 DOT: 火焰伤害 4 回合。earthShock 附带 debuff: 打断施法。searingTotem 附带 summon: 灼热图腾每回合火伤 5 回合。chainLightning 对前排 3 个敌人造成链式伤害。chainHeal 群体治疗全队。

#### Scenario: 萨满初始技能
- **WHEN** 创建 1 级萨满
- **THEN** 该角色 SHALL 拥有 lightningBolt 和 flameShock

#### Scenario: 萨满 AP=1 填充循环
- **WHEN** 萨满在一个回合中有 3 AP
- **THEN** 可以使用 lightningBolt(1) + flameShock(1) + earthShock(1) 三个低 AP 技能

### Requirement: 术士技能组（7个）
术士 SHALL 拥有以下 7 个技能，资源类型为 mana（法力）：

| id | name | category | skillType | damageType | targetType | AP | CD | mana | unlockLevel |
|---|---|---|---|---|---|---|---|---|---|
| shadowBolt | 暗影箭 | filler | spell | shadow | enemy | 1 | 0 | 15 | 1 |
| corruption | 腐蚀术 | core | spell | shadow | enemy | 1 | 0 | 18 | 1 |
| immolate | 献祭 | core | spell | fire | enemy | 1 | 0 | 20 | 4 |
| fear | 恐惧 | utility | debuff | null | enemy | 2 | 5 | 30 | 8 |
| drainLife | 吸取生命 | core | spell | shadow | enemy | 2 | 2 | 25 | 14 |
| curseOfAgony | 痛苦诅咒 | utility | debuff | shadow | enemy | 1 | 0 | 15 | 20 |
| summonImp | 召唤小鬼 | ultimate | summon | null | self | 3 | 10 | 50 | 30 |

corruption 附带 DOT: 暗影伤害 6 回合。immolate 附带直接火伤+DOT: 火焰伤害 5 回合。fear 附带 cc: fear 恐惧 2 回合。drainLife 造成暗影伤害且自身恢复 50% 伤害值的生命。curseOfAgony 附带 DOT: 递增暗影伤害 5 回合。summonImp 附带 summon: 召唤小鬼（持久）。

#### Scenario: 术士初始技能
- **WHEN** 创建 1 级术士
- **THEN** 该角色 SHALL 拥有 shadowBolt 和 corruption

#### Scenario: 术士 DOT 叠加
- **WHEN** 术士同时挂上 corruption + immolate + curseOfAgony
- **THEN** 回合结束时 SHALL 三个 DOT 各自独立结算伤害

### Requirement: 德鲁伊技能组（8个）
德鲁伊 SHALL 拥有以下 8 个技能，资源类型为 mana（法力）：

| id | name | category | skillType | damageType | targetType | AP | CD | mana | unlockLevel |
|---|---|---|---|---|---|---|---|---|---|
| wrath | 愤怒 | filler | spell | nature | enemy | 1 | 0 | 18 | 1 |
| moonfire | 月火术 | core | spell | arcane | enemy | 1 | 0 | 20 | 1 |
| rejuvenation | 回春术 | core | heal | null | ally | 1 | 0 | 25 | 4 |
| healingTouch | 愈合 | core | heal | null | ally | 2 | 2 | 40 | 8 |
| regrowth | 愈合之触 | core | heal | null | ally | 2 | 2 | 35 | 14 |
| starfire | 星火术 | powerful | spell | arcane | enemy | 2 | 3 | 35 | 20 |
| bearForm | 熊形态 | utility | buff | null | self | 2 | 5 | 35 | 30 |
| wildGrowth | 野性成长 | ultimate | heal | null | all_allies | 3 | 6 | 55 | 40 |

moonfire 附带 DOT: 奥术伤害 4 回合。rejuvenation 附带 HOT: 持续治疗 5 回合。regrowth 附带直接治疗+HOT: 持续治疗 3 回合。bearForm 附带 buff: 护甲+50% 持久（99回合）。wildGrowth 附带 all_allies HOT: 群体持续治疗 4 回合。

#### Scenario: 德鲁伊初始技能
- **WHEN** 创建 1 级德鲁伊
- **THEN** 该角色 SHALL 拥有 wrath 和 moonfire

#### Scenario: 德鲁伊万金油节奏
- **WHEN** 德鲁伊在一个回合中有 3 AP
- **THEN** 可以使用 moonfire(1) + rejuvenation(1) + wrath(1) 同时输出和治疗
