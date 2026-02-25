# 燃烧与急速冷却技能规格

## 概述

本文档定义法师火焰系和冰霜系的核心天赋解锁技能规格。

---

## 燃烧 (Combustion)

### 需求: 燃烧技能定义
系统 SHALL 在 GameData.skills 中定义燃烧技能。

#### 场景: 技能基础属性
- **当** 访问 combustion 技能定义时
- **那么** id 为 'combustion'
- **并且** name 为 '燃烧'
- **并且** skillType 为 'buff'
- **并且** targetType 为 'self'

#### 场景: 燃烧效果
- **当** 燃烧激活时
- **那么** 施法者获得 100% 暴击率增益
- **并且** 增益持续 3 回合

#### 场景: 天赋解锁
- **当** 玩家尝试使用燃烧时
- **那么** 需要已学习 combustion 天赋
- **并且** conditions.requiresTalent 为 'combustion'

### 数据结构

```javascript
combustion: {
    id: 'combustion',
    name: '燃烧',
    emoji: '🔥',
    description: '激活后获得100%暴击率，持续3回合',
    unlockLevel: 40,
    category: 'ultimate',
    talentUnlock: true,
    skillType: 'buff',
    damageType: 'fire',
    targetType: 'self',
    range: 'melee',
    resourceCost: { type: 'mana', value: 45 },
    actionPoints: 1,
    cooldown: 8,
    damage: null,
    heal: null,
    effects: [
        { type: 'buff', name: 'combustion', stat: 'critChance', value: 1.0, duration: 3 }
    ],
    comboPoints: null,
    generatesResource: null,
    conditions: { requiresTalent: 'combustion' }
}
```

---

## 急速冷却 (Cold Snap)

### 需求: 急速冷却技能定义
系统 SHALL 在 GameData.skills 中定义急速冷却技能。

#### 场景: 技能基础属性
- **当** 访问 coldSnap 技能定义时
- **那么** id 为 'coldSnap'
- **并且** name 为 '急速冷却'
- **并且** skillType 为 'utility'
- **并且** targetType 为 'self'

#### 场景: 急速冷却效果
- **当** 急速冷却使用时
- **那么** 所有冰霜系技能冷却时间重置
- **并且** effects 包含 { type: 'reset_cooldown', school: 'frost' }

#### 场景: 天赋解锁
- **当** 玩家尝试使用急速冷却时
- **那么** 需要已学习 coldSnap 天赋（T5终极天赋）

### 数据结构

```javascript
coldSnap: {
    id: 'coldSnap',
    name: '急速冷却',
    emoji: '❄️',
    description: '立即重置所有冰霜系技能的冷却时间',
    unlockLevel: 50,
    category: 'ultimate',
    talentUnlock: true,
    skillType: 'utility',
    damageType: 'frost',
    targetType: 'self',
    range: 'melee',
    resourceCost: { type: 'mana', value: 20 },
    actionPoints: 1,
    cooldown: 10,
    damage: null,
    heal: null,
    effects: [
        { type: 'reset_cooldown', school: 'frost' }
    ],
    comboPoints: null,
    generatesResource: null,
    conditions: { requiresTalent: 'coldSnap' }
}
```

---

## 其他天赋解锁技能

### 寒冰屏障 (Ice Block)

```javascript
iceBlock: {
    id: 'iceBlock',
    name: '寒冰屏障',
    emoji: '🧊',
    description: '进入冰块状态，免疫所有伤害但无法行动，持续3回合',
    unlockLevel: 30,
    category: 'ultimate',
    talentUnlock: true,
    skillType: 'buff',
    damageType: 'frost',
    targetType: 'self',
    range: 'melee',
    resourceCost: { type: 'mana', value: 30 },
    actionPoints: 1,
    cooldown: 8,
    damage: null,
    heal: null,
    effects: [
        { type: 'buff', name: 'iceBlock', stat: 'immune', value: 1, duration: 3 },
        { type: 'cc', ccType: 'selfStun', duration: 3 }
    ],
    comboPoints: null,
    generatesResource: null,
    conditions: { requiresTalent: 'iceBlock' }
}
```

### 寒冰护盾 (Ice Barrier)

```javascript
iceBarrier: {
    id: 'iceBarrier',
    name: '寒冰护盾',
    emoji: '🛡️',
    description: '创建冰盾吸收伤害，护盾破碎时对周围敌人造成冰霜伤害',
    unlockLevel: 40,
    category: 'ultimate',
    talentUnlock: true,
    skillType: 'buff',
    damageType: 'frost',
    targetType: 'self',
    range: 'melee',
    resourceCost: { type: 'mana', value: 45 },
    actionPoints: 1,
    cooldown: 5,
    damage: null,
    heal: null,
    effects: [
        { type: 'shield', name: 'iceBarrier', value: 200, scaling: 2.0, stat: 'intellect' }
    ],
    comboPoints: null,
    generatesResource: null,
    conditions: { requiresTalent: 'iceBarrier' }
}
```

### 龙息术 (Dragon Breath)

```javascript
dragonBreath: {
    id: 'dragonBreath',
    name: '龙息术',
    emoji: '🐉',
    description: '锥形火焰喷射，对前排敌人造成火焰伤害并迷惑2回合',
    unlockLevel: 35,
    category: 'ultimate',
    talentUnlock: true,
    skillType: 'spell',
    damageType: 'fire',
    targetType: 'front_row',
    range: 'melee',
    resourceCost: { type: 'mana', value: 40 },
    actionPoints: 2,
    cooldown: 4,
    damage: { base: 40, scaling: 2.5, stat: 'intellect' },
    heal: null,
    effects: [
        { type: 'cc', ccType: 'disorient', duration: 2 }
    ],
    comboPoints: null,
    generatesResource: null,
    conditions: { requiresTalent: 'dragonBreath' }
}
```

### 活动炸弹 (Living Bomb)

```javascript
livingBomb: {
    id: 'livingBomb',
    name: '活动炸弹',
    emoji: '💣',
    description: '将目标变为活体炸弹，4回合后爆炸对目标和周围敌人造成火焰伤害',
    unlockLevel: 50,
    category: 'ultimate',
    talentUnlock: true,
    skillType: 'spell',
    damageType: 'fire',
    targetType: 'enemy',
    range: 'ranged',
    resourceCost: { type: 'mana', value: 55 },
    actionPoints: 2,
    cooldown: 5,
    damage: null,
    heal: null,
    effects: [
        { type: 'dot', name: 'livingBombTick', damageType: 'fire', tickDamage: 20, duration: 4 },
        { type: 'delayed_aoe', name: 'livingBombExplosion', damageType: 'fire', damage: 80, radius: 'cleave_3', delay: 4 }
    ],
    comboPoints: null,
    generatesResource: null,
    conditions: { requiresTalent: 'livingBomb' }
}
```

---

## 验收标准

- [ ] 所有技能在 GameData.skills 中正确定义
- [ ] 天赋解锁技能标记 talentUnlock: true
- [ ] 每个技能的 conditions.requiresTalent 与对应天赋ID匹配
- [ ] 技能效果（effects）定义完整

---

**作者**: CodeBuddy Code
**日期**: 2026-02-23
