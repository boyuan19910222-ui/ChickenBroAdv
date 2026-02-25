# Spec: 暗影形态系统

## 概述

暗影形态是暗影牧师的核心技能，允许牧师进入暗影形态以大幅提升暗影伤害输出。

## 功能需求

### 需求: 暗影形态转换
牧师可以进入暗影形态，获得暗影伤害增益。

#### 场景: 施放暗影形态
- **当** 牧师施放暗影形态技能时
- **那么** 牧师获得暗影形态buff
- **并且** 暗影伤害提高15%
- **并且** 持续时间直到取消或更换形态

#### 场景: 神圣法术限制
- **当** 牧师处于暗影形态时
- **那么** 无法使用神圣系法术
- **并且** 尝试使用时显示"无法在暗影形态下使用"提示

### 需求: 天赋解锁
暗影形态需要通过暗影天赋树解锁。

#### 场景: 天赋解锁条件
- **当** 玩家在暗影天赋树投入足够点数
- **并且** 学习shadowform天赋
- **那么** 可以使用暗影形态技能

#### 场景: 未解锁时使用
- **当** 玩家未学习shadowform天赋
- **并且** 尝试使用暗影形态
- **那么** 显示"需要天赋解锁"提示

## 技能规格

```yaml
id: shadowform
name: 暗影形态
emoji: 🌑
category: ultimate
skillType: buff
damageType: null
targetType: self
range: melee
resourceCost:
  type: mana
  value: 60
actionPoints: 2
cooldown: 5
effects:
  - type: buff
    name: shadowform
    stat: shadowDamage
    value: 0.15
    duration: 99
  - type: restriction
    restrictSkills:
      - smite
      - holyFire
      - heal
      - greaterHeal
      - prayerOfHealing
conditions:
  requiresTalent: shadowform
```

## 相关天赋

### 暗影树 T4 - shadowform
```yaml
id: shadowform
name: 暗影形态
tier: 4
maxPoints: 1
effect:
  type: unlock_skill
  skill: shadowform
description: 解锁暗影形态
requires: vampiricEmbrace
```

## 相关技能

### 吸血鬼之拥 (vampiricEmbrace)
- T3解锁的前置技能
- 伤害转化为治疗的buff

### 消散 (dispersion)
- T5终极技能
- 暗影形态下的生存技能

## 测试场景

### 单元测试
1. 验证技能ID与天赋引用一致
2. 验证buff效果数值正确
3. 验证神圣法术被正确限制

### 集成测试
1. 天赋解锁后技能出现在技能栏
2. 施放后正确获得buff
3. 尝试使用神圣法术被正确阻止

## 实现优先级

1. **P0**: 技能定义和基础buff效果
2. **P1**: 神圣法术限制机制
3. **P2**: 视觉效果和形态切换动画
