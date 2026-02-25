# Design: 牧师技能和天赋完整实现

## 技术设计

### 1. 技能ID命名规范

```
camelCase 格式
- 基础技能: 单词组合 (smite, heal, renew)
- 天赋解锁: 功能性命名 (innerFocus, shadowform)
- 终极天赋: 效果描述 (painSuppression, guardianSpirit)
```

### 2. 技能数据结构

每个技能遵循统一的数据结构：

```javascript
skillName: {
    id: 'skillName',           // 技能唯一标识
    name: '技能名称',           // 显示名称
    emoji: '✨',               // 表情符号
    description: '技能描述',    // 详细说明
    unlockLevel: 1,            // 解锁等级，null表示仅天赋解锁
    category: 'filler|core|utility|powerful|ultimate',
    talentUnlock: true,        // 是否需要天赋解锁（可选）
    skillType: 'spell|heal|buff|debuff',
    damageType: 'holy|shadow|arcane|null',
    targetType: 'enemy|ally|self|all_allies|all_enemies',
    range: 'ranged|melee',
    resourceCost: { type: 'mana', value: 30 },
    actionPoints: 2,           // 行动点消耗
    cooldown: 3,               // 冷却回合
    damage: null,              // 伤害配置
    heal: null,                // 治疗配置
    effects: [],               // 效果数组
    comboPoints: null,         // 连击点配置（牧师不使用）
    generatesResource: null,   // 资源生成
    conditions: null           // 使用条件
}
```

### 3. 天赋树扩展策略

#### 戒律树 (Discipline) - 5层结构

| 层级 | 天赋数量 | 天赋ID |
|-----|---------|--------|
| T1 | 2个 | unbreakableWill, wandSpecialization |
| T2 | 2个 | improvedPowerWordShield, innerFocus(解锁) |
| T3 | 2个 | meditation, mentalAgility |
| T4 | 1个 | powerInfusion(解锁) |
| T5 | 1个 | painSuppression(解锁-终极) |

#### 神圣树 (Holy) - 5层结构

| 层级 | 天赋数量 | 天赋ID |
|-----|---------|--------|
| T1 | 2个 | healingFocus, improvedRenew |
| T2 | 2个 | holySpecialization, divineSpirit(解锁) |
| T3 | 2个 | spiritualHealing, holyReach |
| T4 | 1个 | lightwell(解锁) |
| T5 | 1个 | guardianSpirit(解锁-终极) |

#### 暗影树 (Shadow) - 5层结构

| 层级 | 天赋数量 | 天赋ID |
|-----|---------|--------|
| T1 | 2个 | spiritTap, shadowAffinity |
| T2 | 2个 | improvedShadowWordPain, shadowFocus |
| T3 | 1个 | vampiricEmbrace(解锁) |
| T4 | 1个 | shadowform(解锁) |
| T5 | 1个 | dispersion(解锁-终极) |

### 4. 技能效果类型

#### Buff效果
```javascript
{ type: 'buff', name: 'buffName', stat: 'statName', value: 0.15, duration: 3 }
```

#### HOT (持续治疗)
```javascript
{ type: 'hot', name: 'hotName', tickHeal: 15, duration: 4 }
```

#### DOT (持续伤害)
```javascript
{ type: 'dot', name: 'dotName', damageType: 'shadow', tickDamage: 12, duration: 5 }
```

#### 护盾
```javascript
{ type: 'shield', name: 'shieldName', absorbAmount: 50, duration: 3 }
```

#### 驱散
```javascript
{ type: 'dispel', count: 1 }
```

### 5. 技能实现详情

#### 5.1 innerFocus (心灵专注)
```javascript
innerFocus: {
    id: 'innerFocus', name: '心灵专注', emoji: '🧘',
    description: '使下一个法术的法力消耗降低100%，暴击几率提高25%',
    unlockLevel: null, category: 'utility', talentUnlock: true,
    skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
    resourceCost: { type: 'mana', value: 0 }, actionPoints: 1, cooldown: 5,
    damage: null, heal: null,
    effects: [
        { type: 'buff', name: 'innerFocus', stat: 'manaCost', value: -1.0, duration: 1 },
        { type: 'buff', name: 'innerFocusCrit', stat: 'spellCrit', value: 0.25, duration: 1 }
    ],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'innerFocus' }
}
```

#### 5.2 shadowform (暗影形态)
```javascript
shadowform: {
    id: 'shadowform', name: '暗影形态', emoji: '🌑',
    description: '进入暗影形态，暗影伤害提高15%，无法使用神圣法术',
    unlockLevel: null, category: 'ultimate', talentUnlock: true,
    skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
    resourceCost: { type: 'mana', value: 60 }, actionPoints: 2, cooldown: 5,
    damage: null, heal: null,
    effects: [
        { type: 'buff', name: 'shadowform', stat: 'shadowDamage', value: 0.15, duration: 99 },
        { type: 'restriction', restrictSkills: ['smite', 'holyFire', 'heal', 'greaterHeal'] }
    ],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'shadowform' }
}
```

#### 5.3 guardianSpirit (守护之魂)
```javascript
guardianSpirit: {
    id: 'guardianSpirit', name: '守护之魂', emoji: '👼',
    description: '召唤守护之魂保护目标，如果目标死亡则立即恢复40%生命值，持续3回合',
    unlockLevel: null, category: 'ultimate', talentUnlock: true,
    skillType: 'buff', damageType: 'holy', targetType: 'ally', range: 'ranged',
    resourceCost: { type: 'mana', value: 40 }, actionPoints: 2, cooldown: 6,
    damage: null, heal: null,
    effects: [
        { type: 'buff', name: 'guardianSpirit', stat: 'deathPrevention', value: 0.4, duration: 3 }
    ],
    comboPoints: null, generatesResource: null,
    conditions: { requiresTalent: 'guardianSpirit' }
}
```

### 6. 文件修改清单

#### GameData.js 修改点
1. 在 `prayerOfHealing` 后添加新的牧师技能定义
2. 更新 `classes.priest.skills` 数组

#### TalentData.js 修改点
1. 扩展 `priest.discipline` 天赋树添加T5
2. 扩展 `priest.holy` 天赋树添加T5和中间天赋
3. 扩展 `priest.shadow` 天赋树添加T5

### 7. 依赖关系

```
天赋树结构 → 技能定义 → 职业skills数组
     ↓           ↓            ↓
  解锁条件    效果实现     可用性验证
```

### 8. 测试验证

1. **技能可用性**: 确保所有新增技能ID与天赋解锁引用一致
2. **效果完整性**: 每个技能的effects数组配置正确
3. **平衡性**: 技能数值与同级其他职业相当
4. **天赋树连贯**: T5天赋有正确的requires依赖链
