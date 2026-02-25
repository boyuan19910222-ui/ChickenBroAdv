# Design: 萨满祭司技能与天赋完善

## 技术设计

### 1. 技能数据结构

所有新增技能遵循现有GameData.js中的技能数据结构：

```javascript
skillId: {
    id: 'skillId',
    name: '技能名称',
    emoji: '⚡',
    description: '技能描述',
    unlockLevel: 40,
    category: 'ultimate', // filler, core, utility, powerful, ultimate
    talentUnlock: true,    // 标记为天赋解锁技能
    skillType: 'spell',    // spell, melee, heal, summon, buff
    damageType: 'nature',  // physical, fire, nature, frost, holy, shadow, arcane
    targetType: 'enemy',   // enemy, ally, all_enemies, all_allies, self
    range: 'ranged',       // melee, ranged
    resourceCost: { type: 'mana', value: 20 },
    actionPoints: 2,
    cooldown: 6,
    damage: { base: 60, scaling: 2.0, stat: 'intellect' },
    heal: null,
    effects: [],
    comboPoints: null,
    generatesResource: null,
    conditions: { requiresTalent: 'talentId' }
}
```

### 2. 新增技能详细设计

#### 2.1 元素系技能

**elementalMastery (元素掌握)** - T4解锁
```javascript
{
    id: 'elementalMastery', name: '元素掌握', emoji: '🌀',
    description: '激活后，下一个法术必定暴击',
    unlockLevel: 40, category: 'ultimate', talentUnlock: true,
    skillType: 'buff', damageType: null, targetType: 'self', range: 'self',
    resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 10,
    damage: null, heal: null,
    effects: [{ type: 'buff', name: 'elementalMastery', effect: 'guaranteedCrit', duration: 1 }],
    conditions: { requiresTalent: 'elementalMastery' }
}
```

**lavaBurst (熔岩爆裂)** - T5解锁
```javascript
{
    id: 'lavaBurst', name: '熔岩爆裂', emoji: '🌋',
    description: '对目标造成火焰伤害，若目标有烈焰震击则必定暴击',
    unlockLevel: 50, category: 'ultimate', talentUnlock: true,
    skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
    resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 4,
    damage: { base: 45, scaling: 2.2, stat: 'intellect' },
    effects: [{ type: 'conditionalCrit', condition: 'flameShock' }],
    conditions: { requiresTalent: 'lavaBurst' }
}
```

**thunderstorm (雷暴)** - T5终极
```javascript
{
    id: 'thunderstorm', name: '雷暴', emoji: '⛈️',
    description: '对所有敌人造成自然伤害并击退，恢复自身法力',
    unlockLevel: 50, category: 'ultimate', talentUnlock: true,
    skillType: 'spell', damageType: 'nature', targetType: 'all_enemies', range: 'ranged',
    resourceCost: { type: 'mana', value: 0 }, actionPoints: 3, cooldown: 12,
    damage: { base: 30, scaling: 1.5, stat: 'intellect' },
    effects: [
        { type: 'knockback', duration: 1 },
        { type: 'restoreResource', resource: 'mana', value: 20, scaling: 0.1, stat: 'intellect' }
    ],
    conditions: { requiresTalent: 'thunderstorm' }
}
```

#### 2.2 增强系技能

**stormstrike (风暴打击)** - T4解锁
```javascript
{
    id: 'stormstrike', name: '风暴打击', emoji: '⛈️',
    description: '双武器攻击，造成武器伤害并使目标受到的自然伤害提高20%',
    unlockLevel: 40, category: 'ultimate', talentUnlock: true,
    skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
    resourceCost: { type: 'mana', value: 20 }, actionPoints: 2, cooldown: 6,
    damage: { base: 60, scaling: 2.0, stat: 'agility' },
    effects: [
        { type: 'dualWieldAttack', mainHand: 1.0, offHand: 1.0 },
        { type: 'debuff', name: 'stormstrike', stat: 'natureDamageTaken', value: 0.2, duration: 2 }
    ],
    conditions: { requiresTalent: 'stormstrike' }
}
```

**shamanisticRage (萨满之怒)** - T5解锁
```javascript
{
    id: 'shamanisticRage', name: '萨满之怒', emoji: '😤',
    description: '降低受到的伤害30%，每回合恢复法力',
    unlockLevel: 50, category: 'ultimate', talentUnlock: true,
    skillType: 'buff', damageType: null, targetType: 'self', range: 'self',
    resourceCost: { type: 'mana', value: 0 }, actionPoints: 1, cooldown: 8,
    effects: [
        { type: 'buff', name: 'shamanisticRage', effect: 'damageReduction', value: 0.3, duration: 4 },
        { type: 'buff', name: 'shamanisticRage', effect: 'manaRegen', value: 15, duration: 4 }
    ],
    conditions: { requiresTalent: 'shamanisticRage' }
}
```

**feralSpirit (野性之魂)** - T5终极
```javascript
{
    id: 'feralSpirit', name: '野性之魂', emoji: '🐺',
    description: '召唤两只幽灵狼协助战斗',
    unlockLevel: 50, category: 'ultimate', talentUnlock: true,
    skillType: 'summon', damageType: 'nature', targetType: 'self', range: 'self',
    resourceCost: { type: 'mana', value: 40 }, actionPoints: 3, cooldown: 15,
    effects: [{ type: 'summon', entity: 'spiritWolf', count: 2, duration: 6 }],
    conditions: { requiresTalent: 'feralSpirit' }
}
```

#### 2.3 恢复系技能

**naturesSwiftnessShaman (自然迅捷)** - T3解锁
```javascript
{
    id: 'naturesSwiftnessShaman', name: '自然迅捷', emoji: '🌿',
    description: '激活后，下一个治疗法术变为瞬发',
    unlockLevel: 30, category: 'ultimate', talentUnlock: true,
    skillType: 'buff', damageType: null, targetType: 'self', range: 'self',
    resourceCost: { type: 'mana', value: 10 }, actionPoints: 0, cooldown: 8,
    effects: [{ type: 'buff', name: 'naturesSwiftness', effect: 'instantCast', school: 'heal', duration: 1 }],
    conditions: { requiresTalent: 'naturesSwiftness' }
}
```

**manaTideTotem (法力之潮图腾)** - T4解锁
```javascript
{
    id: 'manaTideTotem', name: '法力之潮图腾', emoji: '💧',
    description: '放置图腾，每回合为全体队友恢复法力',
    unlockLevel: 40, category: 'ultimate', talentUnlock: true,
    skillType: 'summon', damageType: null, targetType: 'all_allies', range: 'ranged',
    resourceCost: { type: 'mana', value: 30 }, actionPoints: 2, cooldown: 10,
    effects: [{ type: 'totem', name: 'manaTide', effect: 'manaRegen', value: 20, duration: 4 }],
    conditions: { requiresTalent: 'manaTideTotem' }
}
```

**earthShield (大地之盾)** - T5解锁
```javascript
{
    id: 'earthShield', name: '大地之盾', emoji: '🛡️',
    description: '为目标附加护盾，受击时有几率触发治疗',
    unlockLevel: 50, category: 'ultimate', talentUnlock: true,
    skillType: 'buff', damageType: null, targetType: 'ally', range: 'ranged',
    resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 6,
    effects: [{ type: 'shield', name: 'earthShield', charges: 6, healOnHit: { base: 20, scaling: 1.0, stat: 'intellect' }, duration: 10 }],
    conditions: { requiresTalent: 'earthShield' }
}
```

**riptide (激流)** - T5终极
```javascript
{
    id: 'riptide', name: '激流', emoji: '🌊',
    description: '立即治疗目标并附加持续治疗效果',
    unlockLevel: 50, category: 'ultimate', talentUnlock: true,
    skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
    resourceCost: { type: 'mana', value: 40 }, actionPoints: 2, cooldown: 5,
    heal: { base: 30, scaling: 1.2, stat: 'intellect' },
    effects: [
        { type: 'hot', name: 'riptide', tickHeal: 15, duration: 4 },
        { type: 'buff', name: 'riptide', effect: 'chainHealBonus', value: 0.25, duration: 4 }
    ],
    conditions: { requiresTalent: 'riptide' }
}
```

#### 2.4 补充基础技能

**frostShock (冰霜震击)**
```javascript
{
    id: 'frostShock', name: '冰霜震击', emoji: '❄️',
    description: '造成冰霜伤害并降低目标移动速度',
    unlockLevel: 20, category: 'core',
    skillType: 'spell', damageType: 'frost', targetType: 'enemy', range: 'ranged',
    resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 3,
    damage: { base: 18, scaling: 1.0, stat: 'intellect' },
    effects: [{ type: 'debuff', name: 'frostShock', stat: 'speed', value: -0.5, duration: 2 }]
}
```

**purge (净化)**
```javascript
{
    id: 'purge', name: '净化', emoji: '✨',
    description: '驱散目标身上的1个增益效果',
    unlockLevel: 12, category: 'utility',
    skillType: 'spell', damageType: 'nature', targetType: 'enemy', range: 'ranged',
    resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 4,
    effects: [{ type: 'dispel', targetType: 'buff', count: 1 }]
}
```

**heroism (英雄主义)**
```javascript
{
    id: 'heroism', name: '英雄主义', emoji: '🦸',
    description: '提升全体队友攻击和施法速度40%',
    unlockLevel: 35, category: 'powerful',
    skillType: 'buff', damageType: null, targetType: 'all_allies', range: 'ranged',
    resourceCost: { type: 'mana', value: 60 }, actionPoints: 3, cooldown: 20,
    effects: [{ type: 'buff', name: 'heroism', stat: 'haste', value: 0.4, duration: 5 }]
}
```

### 3. 天赋树扩展设计

参考战士、圣骑士等职业的5层天赋结构，为萨满三系天赋树添加第5层：

**元素系天赋树扩展**
- T5: `lavaBurst` → `thunderstorm` (终极天赋路径)

**增强系天赋树扩展**
- T5: `shamanisticRage` → `feralSpirit` (终极天赋路径)

**恢复系天赋树扩展**
- T5: `earthShield` → `riptide` (终极天赋路径)

### 4. 技能数组更新

更新GameData.js中萨满职业的skills数组：

```javascript
skills: [
    // 基础技能
    'lightningBolt', 'flameShock', 'healingWave', 'earthShock',
    'frostShock', 'purge', 'searingTotem',
    // 中级技能
    'chainLightning', 'chainHeal', 'heroism',
    // 天赋解锁技能
    'elementalMastery', 'lavaBurst', 'thunderstorm',
    'stormstrike', 'shamanisticRage', 'feralSpirit',
    'naturesSwiftnessShaman', 'manaTideTotem', 'earthShield', 'riptide'
]
```

## 实现顺序

1. 在GameData.js中添加所有新技能定义
2. 更新萨满职业的skills数组
3. 在TalentData.js中扩展三系天赋树至5层
4. 验证天赋解锁与技能定义的一致性
