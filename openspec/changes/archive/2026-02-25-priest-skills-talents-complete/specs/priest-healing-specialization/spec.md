# Spec: 牧师治疗专精系统

## 概述

牧师治疗专精系统包含神圣和戒律两系的治疗相关技能，提供强大的单体和群体治疗能力。

## 功能需求

### 需求: 戒律系防护治疗
戒律牧师通过护盾和减伤来保护队友。

#### 场景: 痛苦压制
- **当** 牧师对目标施放痛苦压制时
- **那么** 目标受到的伤害降低40%
- **并且** 持续3回合
- **并且** 需要戒律树T5天赋解锁

#### 场景: 能量灌注
- **当** 牧师对目标施放能量灌注时
- **那么** 目标的法术伤害和治疗提高20%
- **并且** 持续3回合
- **并且** 需要戒律树T4天赋解锁

### 需求: 神圣系核心治疗
神圣牧师拥有最强大的治疗能力。

#### 场景: 守护之魂
- **当** 牧师对目标施放守护之魂时
- **那么** 目标获得死亡保护效果
- **如果** 目标在持续期间死亡
- **那么** 立即恢复40%生命值
- **并且** 效果消失

#### 场景: 光明之泉
- **当** 牧师施放光明之泉时
- **那么** 在场上创建一个治疗图腾
- **并且** 队友可以与之互动获得治疗
- **并且** 图腾持续5回合

#### 场景: 愈合祷言
- **当** 牧师施放愈合祷言时
- **那么** 治疗目标并在其受到伤害后跳跃到下一个队友
- **并且** 最多跳跃3次
- **并且** 每次跳跃治疗量递减20%

### 需求: 群体驱散
牧师可以移除多个目标的负面效果。

#### 场景: 群体驱散
- **当** 牧师施放群体驱散时
- **那么** 移除所有队友的1个负面效果
- **并且** 有几率驱散敌人的增益效果

## 技能规格

### 痛苦压制 (painSuppression)
```yaml
id: painSuppression
name: 痛苦压制
emoji: 🛡️
category: ultimate
skillType: buff
damageType: null
targetType: ally
range: ranged
resourceCost:
  type: mana
  value: 35
actionPoints: 2
cooldown: 6
effects:
  - type: buff
    name: painSuppression
    stat: damageReduction
    value: 0.4
    duration: 3
conditions:
  requiresTalent: painSuppression
```

### 能量灌注 (powerInfusion)
```yaml
id: powerInfusion
name: 能量灌注
emoji: ⚡
category: core
skillType: buff
damageType: null
targetType: ally
range: ranged
resourceCost:
  type: mana
  value: 25
actionPoints: 2
cooldown: 5
effects:
  - type: buff
    name: powerInfusion
    stat: spellPower
    value: 0.2
    duration: 3
conditions:
  requiresTalent: powerInfusion
```

### 守护之魂 (guardianSpirit)
```yaml
id: guardianSpirit
name: 守护之魂
emoji: 👼
category: ultimate
skillType: buff
damageType: holy
targetType: ally
range: ranged
resourceCost:
  type: mana
  value: 40
actionPoints: 2
cooldown: 6
effects:
  - type: buff
    name: guardianSpirit
    stat: deathPrevention
    value: 0.4
    duration: 3
conditions:
  requiresTalent: guardianSpirit
```

### 光明之泉 (lightwell)
```yaml
id: lightwell
name: 光明之泉
emoji: ⛲
category: core
skillType: summon
damageType: null
targetType: self
range: ranged
resourceCost:
  type: mana
  value: 30
actionPoints: 2
cooldown: 5
effects:
  - type: summon
    name: lightwell
    summonType: totem
    charges: 5
    healAmount: 50
conditions:
  requiresTalent: lightwell
```

### 愈合祷言 (prayerOfMending)
```yaml
id: prayerOfMending
name: 愈合祷言
emoji: 🙏
category: core
skillType: heal
damageType: null
targetType: ally
range: ranged
resourceCost:
  type: mana
  value: 35
actionPoints: 2
cooldown: 4
effects:
  - type: hot
    name: prayerOfMending
    tickHeal: 45
    duration: 1
    jumpCount: 3
    jumpDecay: 0.2
```

### 群体驱散 (massDispel)
```yaml
id: massDispel
name: 群体驱散
emoji: ✨
category: utility
skillType: buff
damageType: null
targetType: all_allies
range: ranged
resourceCost:
  type: mana
  value: 50
actionPoints: 2
cooldown: 5
effects:
  - type: dispel
    count: 1
    targetType: all_allies
```

## 相关天赋

### 戒律树 T5 - painSuppression
```yaml
id: painSuppression
name: 痛苦压制
tier: 5
maxPoints: 1
effect:
  type: unlock_skill
  skill: painSuppression
requires: powerInfusion
```

### 神圣树 T5 - guardianSpirit
```yaml
id: guardianSpirit
name: 守护之魂
tier: 5
maxPoints: 1
effect:
  type: unlock_skill
  skill: guardianSpirit
requires: lightwell
```

## 技能数量统计

| 类别 | 技能 | 来源 |
|-----|------|-----|
| 戒律解锁 | innerFocus, powerInfusion, painSuppression | 天赋树 |
| 神圣解锁 | divineSpirit, lightwell, guardianSpirit | 天赋树 |
| 通用治疗 | prayerOfMending, massDispel, holyFire | 技能训练师 |
| **合计** | **9个新增技能** | - |

## 测试场景

### 单元测试
1. 每个治疗技能的治疗量计算正确
2. buff持续时间正确应用
3. 天赋解锁条件正确验证

### 集成测试
1. 守护之魂死亡保护正确触发
2. 愈合祷言正确跳跃到下一个目标
3. 光明之泉互动治疗正确执行

## 实现优先级

1. **P0**: powerInfusion, painSuppression, guardianSpirit - 核心天赋解锁技能
2. **P1**: lightwell, prayerOfMending - 核心治疗工具
3. **P2**: massDispel, holyFire - 辅助技能
