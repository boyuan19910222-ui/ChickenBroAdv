# 法师技能与天赋补全设计文档

## 设计目标

1. 补全法师技能系统，使其技能数量与其他完整职业相当
2. 扩展法师天赋树至5层，添加终极天赋技能
3. 确保所有天赋引用的技能都有实际定义
4. 保持与现有技能系统的数据结构一致性

## 技能数据结构设计

### 标准技能结构

```javascript
{
    id: 'skillId',           // 技能唯一标识
    name: '技能名称',         // 显示名称
    emoji: '🎯',             // 表情图标
    description: '技能描述', // 详细说明
    unlockLevel: 1,          // 解锁等级
    category: 'core',        // 分类: core, filler, powerful, utility, ultimate
    skillType: 'spell',      // 类型: spell, buff, heal, summon
    damageType: 'fire',      // 伤害类型: fire, frost, arcane, holy, shadow, physical
    targetType: 'enemy',     // 目标类型: enemy, all_enemies, self, ally, cleave_3
    range: 'ranged',         // 范围: melee, ranged
    resourceCost: { type: 'mana', value: 20 },  // 资源消耗
    actionPoints: 2,         // 行动点消耗
    cooldown: 0,             // 冷却回合数
    damage: { base: 30, scaling: 2.0, stat: 'intellect' },  // 伤害公式
    heal: null,              // 治疗公式
    effects: [],             // 附加效果
    comboPoints: null,       // 连击点相关
    generatesResource: null, // 资源生成
    conditions: null         // 使用条件
}
```

### 天赋解锁技能标记

天赋解锁的技能需要添加 `talentUnlock: true` 和 `conditions.requiresTalent` 字段：

```javascript
{
    id: 'arcanePower',
    talentUnlock: true,
    conditions: { requiresTalent: 'arcanePower' }
}
```

## 新增技能详细设计

### 1. 奥术系技能

#### arcaneMissiles（奥术飞弹）- 核心技能
```javascript
arcaneMissiles: {
    id: 'arcaneMissiles', name: '奥术飞弹', emoji: '💜',
    description: '发射5枚奥术飞弹，每枚造成奥术伤害',
    unlockLevel: 6, category: 'core',
    skillType: 'spell', damageType: 'arcane', targetType: 'enemy', range: 'ranged',
    resourceCost: { type: 'mana', value: 25 }, actionPoints: 2, cooldown: 0,
    damage: { base: 8, scaling: 0.5, stat: 'intellect', hits: 5 },
    heal: null, effects: [],
    comboPoints: null, generatesResource: null, conditions: null
}
```

#### arcaneBlast（奥术冲击）- 核心技能
```javascript
arcaneBlast: {
    id: 'arcaneBlast', name: '奥术冲击', emoji: '💫',
    description: '造成奥术伤害，每次使用叠加增伤效果，最高叠加4层',
    unlockLevel: 12, category: 'core',
    skillType: 'spell', damageType: 'arcane', targetType: 'enemy', range: 'ranged',
    resourceCost: { type: 'mana', value: 28 }, actionPoints: 2, cooldown: 0,
    damage: { base: 35, scaling: 2.2, stat: 'intellect' },
    heal: null,
    effects: [{ type: 'stacking_buff', name: 'arcaneBlastStack', stat: 'damage', value: 0.15, maxStacks: 4 }],
    comboPoints: null, generatesResource: null, conditions: null
}
```

#### arcanePower（奥术强化）- T4天赋解锁
```javascript
arcanePower: {
    id: 'arcanePower', name: '奥术强化', emoji: '✨',
    description: '激活后，法术伤害提高30%，法力消耗提高30%，持续5回合',
    unlockLevel: 40, category: 'ultimate', talentUnlock: true,
    skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
    resourceCost: { type: 'mana', value: 40 }, actionPoints: 1, cooldown: 8,
    damage: null, heal: null,
    effects: [
        { type: 'buff', name: 'arcanePower', stat: 'spellDamage', value: 0.3, duration: 5 },
        { type: 'buff', name: 'arcanePowerCost', stat: 'manaCost', value: 0.3, duration: 5 }
    ],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'arcanePower' }
}
```

#### presenceOfMind（瞬发思维）- T3天赋解锁
```javascript
presenceOfMind: {
    id: 'presenceOfMind', name: '瞬发思维', emoji: '🧠',
    description: '下一个法术变为瞬发（不消耗行动点）',
    unlockLevel: 30, category: 'ultimate', talentUnlock: true,
    skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
    resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 6,
    damage: null, heal: null,
    effects: [{ type: 'buff', name: 'presenceOfMind', stat: 'instantCast', value: 1, duration: 2 }],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'presenceOfMind' }
}
```

#### slow（减速）- T5终极天赋
```javascript
slow: {
    id: 'slow', name: '减速', emoji: '🐌',
    description: '降低目标攻击速度、施法速度和移动速度50%，持续5回合',
    unlockLevel: 50, category: 'ultimate', talentUnlock: true,
    skillType: 'spell', damageType: 'arcane', targetType: 'enemy', range: 'ranged',
    resourceCost: { type: 'mana', value: 35 }, actionPoints: 1, cooldown: 5,
    damage: null, heal: null,
    effects: [
        { type: 'debuff', name: 'slowAttack', stat: 'attackSpeed', value: 0.5, duration: 5 },
        { type: 'debuff', name: 'slowCast', stat: 'castSpeed', value: 0.5, duration: 5 },
        { type: 'debuff', name: 'slowMove', stat: 'moveSpeed', value: 0.5, duration: 5 }
    ],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'slow' }
}
```

### 2. 火焰系技能

#### combustion（燃烧）- T4天赋解锁
```javascript
combustion: {
    id: 'combustion', name: '燃烧', emoji: '🔥',
    description: '激活后获得100%暴击率，持续3回合',
    unlockLevel: 40, category: 'ultimate', talentUnlock: true,
    skillType: 'buff', damageType: 'fire', targetType: 'self', range: 'melee',
    resourceCost: { type: 'mana', value: 45 }, actionPoints: 1, cooldown: 8,
    damage: null, heal: null,
    effects: [{ type: 'buff', name: 'combustion', stat: 'critChance', value: 1.0, duration: 3 }],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'combustion' }
}
```

#### dragonBreath（龙息术）- T3天赋解锁
```javascript
dragonBreath: {
    id: 'dragonBreath', name: '龙息术', emoji: '🐉',
    description: '锥形火焰喷射，对前排敌人造成火焰伤害并迷惑2回合',
    unlockLevel: 35, category: 'ultimate', talentUnlock: true,
    skillType: 'spell', damageType: 'fire', targetType: 'front_row', range: 'melee',
    resourceCost: { type: 'mana', value: 40 }, actionPoints: 2, cooldown: 4,
    damage: { base: 40, scaling: 2.5, stat: 'intellect' },
    heal: null,
    effects: [{ type: 'cc', ccType: 'disorient', duration: 2 }],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'dragonBreath' }
}
```

#### livingBomb（活动炸弹）- T5终极天赋
```javascript
livingBomb: {
    id: 'livingBomb', name: '活动炸弹', emoji: '💣',
    description: '将目标变为活体炸弹，4回合后爆炸对目标和周围敌人造成火焰伤害',
    unlockLevel: 50, category: 'ultimate', talentUnlock: true,
    skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
    resourceCost: { type: 'mana', value: 55 }, actionPoints: 2, cooldown: 5,
    damage: null, heal: null,
    effects: [
        { type: 'dot', name: 'livingBombTick', damageType: 'fire', tickDamage: 20, duration: 4 },
        { type: 'delayed_aoe', name: 'livingBombExplosion', damageType: 'fire', damage: 80, radius: 'cleave_3', delay: 4 }
    ],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'livingBomb' }
}
```

### 3. 冰霜系技能

#### iceBlock（寒冰屏障）- T3天赋解锁
```javascript
iceBlock: {
    id: 'iceBlock', name: '寒冰屏障', emoji: '🧊',
    description: '进入冰块状态，免疫所有伤害但无法行动，持续3回合',
    unlockLevel: 30, category: 'ultimate', talentUnlock: true,
    skillType: 'buff', damageType: 'frost', targetType: 'self', range: 'melee',
    resourceCost: { type: 'mana', value: 30 }, actionPoints: 1, cooldown: 8,
    damage: null, heal: null,
    effects: [
        { type: 'buff', name: 'iceBlock', stat: 'immune', value: 1, duration: 3 },
        { type: 'cc', ccType: 'selfStun', duration: 3 }
    ],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'iceBlock' }
}
```

#### iceBarrier（寒冰护盾）- T4天赋解锁
```javascript
iceBarrier: {
    id: 'iceBarrier', name: '寒冰护盾', emoji: '🛡️',
    description: '创建冰盾吸收伤害，护盾破碎时对周围敌人造成冰霜伤害',
    unlockLevel: 40, category: 'ultimate', talentUnlock: true,
    skillType: 'buff', damageType: 'frost', targetType: 'self', range: 'melee',
    resourceCost: { type: 'mana', value: 45 }, actionPoints: 1, cooldown: 5,
    damage: null, heal: null,
    effects: [
        { type: 'shield', name: 'iceBarrier', value: 200, scaling: 2.0, stat: 'intellect' },
        { type: 'on_break', effect: 'iceBarrierExplosion', damage: 50, radius: 'all_enemies' }
    ],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'iceBarrier' }
}
```

#### coldSnap（急速冷却）- T5终极天赋
```javascript
coldSnap: {
    id: 'coldSnap', name: '急速冷却', emoji: '❄️',
    description: '立即重置所有冰霜系技能的冷却时间',
    unlockLevel: 50, category: 'ultimate', talentUnlock: true,
    skillType: 'utility', damageType: 'frost', targetType: 'self', range: 'melee',
    resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 10,
    damage: null, heal: null,
    effects: [{ type: 'reset_cooldown', school: 'frost' }],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'coldSnap' }
}
```

### 4. 通用辅助技能

#### blink（闪烁）
```javascript
blink: {
    id: 'blink', name: '闪烁', emoji: '⚡',
    description: '瞬移并解除所有控制效果',
    unlockLevel: 20, category: 'utility',
    skillType: 'utility', damageType: 'arcane', targetType: 'self', range: 'melee',
    resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 4,
    damage: null, heal: null,
    effects: [{ type: 'dispel', dispelType: 'cc' }],
    comboPoints: null, generatesResource: null, conditions: null
}
```

#### conjureMana（制造法力宝石）
```javascript
conjureMana: {
    id: 'conjureMana', name: '制造法力宝石', emoji: '💎',
    description: '创造一个法力宝石，使用后恢复30%法力值',
    unlockLevel: 25, category: 'utility',
    skillType: 'summon', damageType: null, targetType: 'self', range: 'melee',
    resourceCost: { type: 'mana', value: 10 }, actionPoints: 1, cooldown: 10,
    damage: null, heal: null,
    effects: [{ type: 'create_item', item: 'manaGem', charges: 1, effect: 'restoreMana', value: 0.3 }],
    comboPoints: null, generatesResource: null, conditions: null
}
```

## 天赋树扩展设计

### 天赋树层级结构规范

每系天赋树应包含：
- **T1层**：2-3个基础被动天赋（0点解锁）
- **T2层**：2个天赋，包含1个解锁技能（5点解锁）
- **T3层**：2个天赋，包含1个解锁技能（10点解锁）
- **T4层**：2个天赋，包含1个解锁技能（15点解锁）
- **T5层**：1个终极技能天赋（20点解锁）

### 奥术树扩展设计

```
T1 (0点):
  - 奥术微妙 [5点]: 奥术法术仇恨降低20%/点
  - 奥术集中 [5点]: 施法后2%几率/点下法术无消耗
  - 奥术智慧强化 [3点]: 奥术智慧效果提高

T2 (5点):
  - 强化奥术飞弹 [5点]: 奥术飞弹伤害提高4%/点
  - 奥术心智 [5点]: 智力提高2%/点

T3 (10点):
  - 奥术冥想 [3点]: 施法时恢复5%法力/点
  - 瞬发思维 [1点]: 解锁瞬发思维技能

T4 (15点):
  - 法力护盾强化 [3点]: 法力护盾效果提高
  - 奥术强化 [1点]: 解锁奥术强化技能

T5 (20点):
  - 减速 [1点]: 解锁减速技能（终极天赋）
```

### 火焰树扩展设计

```
T1 (0点):
  - 强化火球术 [5点]: 火球术施法时间减少0.1秒/点
  - 点燃 [5点]: 火焰暴击后8%额外DOT伤害/点

T2 (5点):
  - 火焰投掷 [2点]: 火焰法术射程增加3码/点
  - 强化烈焰风暴 [3点]: 烈焰风暴冷却减少0.5秒/点

T3 (10点):
  - 临界质量 [3点]: 火焰法术暴击率提高2%/点
  - 龙息术 [1点]: 解锁龙息术技能

T4 (15点):
  - 炎爆术强化 [3点]: 炎爆术伤害提高
  - 燃烧 [1点]: 解锁燃烧技能

T5 (20点):
  - 活动炸弹 [1点]: 解锁活动炸弹技能（终极天赋）
```

### 冰霜树扩展设计

```
T1 (0点):
  - 强化寒冰箭 [5点]: 寒冰箭施法时间减少0.1秒/点
  - 冻伤 [3点]: 冰霜法术5%几率冻结目标/点

T2 (5点):
  - 强化冰霜新星 [2点]: 冰霜新星冷却减少2秒/点
  - 碎裂 [5点]: 对冻结目标暴击率提高10%/点

T3 (10点):
  - 寒冰屏障 [1点]: 解锁寒冰屏障技能
  - 极寒冰霜 [3点]: 冰霜法术伤害提高

T4 (15点):
  - 寒冰护盾 [1点]: 解锁寒冰护盾技能
  - 碎冰 [3点]: 对冻结目标伤害提高

T5 (20点):
  - 急速冷却 [1点]: 解锁急速冷却技能（终极天赋）
```

## 法师 skills 数组更新

```javascript
skills: [
    // 基础技能
    'flamestrike', 'fireball', 'frostbolt', 'arcaneIntellect',
    'frostNova', 'pyroblast', 'blizzard',
    // 新增核心技能
    'arcaneMissiles', 'arcaneBlast', 'blink', 'conjureMana',
    // 天赋解锁技能
    'arcanePower', 'presenceOfMind', 'slow',
    'combustion', 'dragonBreath', 'livingBomb',
    'iceBlock', 'iceBarrier', 'coldSnap'
]
```

## 实现计划

1. **Phase 1**: 添加核心技能（arcaneMissiles, arcaneBlast, blink, conjureMana）
2. **Phase 2**: 添加天赋解锁技能（12个技能）
3. **Phase 3**: 扩展三系天赋树至5层
4. **Phase 4**: 更新法师 skills 数组

## 测试要点

- 验证所有新增技能的数据结构完整性
- 验证天赋树层级依赖关系正确
- 验证天赋解锁技能的条件设置
- 验证 skills 数组包含所有技能ID
