# 奥术强化技能规格

## 概述

奥术强化是法师奥术天赋树第4层的核心技能，通过天赋解锁后可用。该技能提供强大的爆发伤害增益，是奥术法师的核心输出技能之一。

## 需求

### 需求: 奥术强化技能定义
系统 SHALL 在 GameData.skills 中定义奥术强化技能。

#### 场景: 技能基础属性
- **当** 访问 arcanePower 技能定义时
- **那么** 技能包含 id、name、emoji、description 字段
- **并且** id 为 'arcanePower'
- **并且** name 为 '奥术强化'
- **并且** description 说明技能效果

#### 场景: 技能类型属性
- **当** 访问 arcanePower 技能定义时
- **那么** skillType 为 'buff'
- **并且** damageType 为 null（无伤害类型）
- **并且** targetType 为 'self'（自身目标）
- **并且** range 为 'melee'

#### 场景: 技能消耗属性
- **当** 访问 arcanePower 技能定义时
- **那么** resourceCost 为 { type: 'mana', value: 40 }
- **并且** actionPoints 为 1
- **并且** cooldown 为 8 回合

### 需求: 奥术强化效果
系统 SHALL 定义奥术强化的增益效果。

#### 场景: 伤害增益效果
- **当** 奥术强化激活时
- **那么** 施法者获得 spellDamage +30% 增益
- **并且** 增益持续 5 回合

#### 场景: 法力消耗效果
- **当** 奥术强化激活时
- **那么** 施法者获得 manaCost +30% 增益
- **并且** 增益持续 5 回合

### 需求: 天赋解锁条件
系统 SHALL 定义奥术强化的天赋解锁条件。

#### 场景: 天赋要求
- **当** 玩家尝试使用奥术强化时
- **那么** 系统验证玩家是否已学习 arcanePower 天赋
- **并且** talentUnlock 为 true
- **并且** conditions.requiresTalent 为 'arcanePower'

### 需求: 解锁等级
系统 SHALL 定义奥术强化的解锁等级。

#### 场景: 等级要求
- **当** 查询奥术强化解锁等级时
- **那么** unlockLevel 为 40
- **并且** category 为 'ultimate'

## 数据结构

```javascript
arcanePower: {
    id: 'arcanePower',
    name: '奥术强化',
    emoji: '✨',
    description: '激活后，法术伤害提高30%，法力消耗提高30%，持续5回合',
    unlockLevel: 40,
    category: 'ultimate',
    talentUnlock: true,
    skillType: 'buff',
    damageType: null,
    targetType: 'self',
    range: 'melee',
    resourceCost: { type: 'mana', value: 40 },
    actionPoints: 1,
    cooldown: 8,
    damage: null,
    heal: null,
    effects: [
        { type: 'buff', name: 'arcanePower', stat: 'spellDamage', value: 0.3, duration: 5 },
        { type: 'buff', name: 'arcanePowerCost', stat: 'manaCost', value: 0.3, duration: 5 }
    ],
    comboPoints: null,
    generatesResource: null,
    conditions: { requiresTalent: 'arcanePower' }
}
```

## 验收标准

- [ ] GameData.skills 中存在 arcanePower 定义
- [ ] 技能数据结构完整且符合规范
- [ ] effects 数组包含两个增益效果
- [ ] talentUnlock 标记为 true
- [ ] conditions 定义了天赋要求

---

**作者**: CodeBuddy Code
**日期**: 2026-02-23
