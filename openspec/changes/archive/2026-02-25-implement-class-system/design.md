## Context

当前项目《鸡哥大冒险》是一款基于魔兽世界60级经典版本的像素风格网页游戏。现有代码已实现5个职业（战士、法师、盗贼、牧师、猎人），使用 `GameData.js` 存储职业配置，`CharacterSystem.js` 管理角色逻辑。

现有职业配置结构包含：`id`、`name`、`description`、`emoji`、`baseStats`、`growthPerLevel`、`skills`。需要扩展此结构以支持完整的9职业系统和新增功能。

## Goals / Non-Goals

**Goals:**
- 添加缺失的4个职业（圣骑士、萨满祭司、术士、德鲁伊）到 `GameData.js`
- 为所有9个职业添加装备类型限制（护甲类型、武器类型）
- 实现天赋系统数据结构
- 为每个职业配置专属技能和天赋树
- 实现职业特殊机制的数据结构（宠物、恶魔、图腾、变形）
- 更新角色创建界面支持9职业选择

**Non-Goals:**
- 不实现完整的副本和团队系统
- 不实现 PvP 战斗系统
- 不实现职业熟练度系统（后续迭代）
- 不实现完整的装备掉落系统

## Decisions

### 决策 1: 职业数据结构扩展

**选择**: 扩展现有 `classes` 对象，添加新字段

```javascript
classes: {
    warrior: {
        // 现有字段保持不变
        id, name, description, emoji, baseStats, growthPerLevel, skills,
        
        // 新增字段
        role: ['tank', 'dps'],           // 职业角色定位
        armorTypes: ['cloth', 'leather', 'mail', 'plate'],  // 可穿戴护甲
        weaponTypes: ['sword', 'axe', 'mace', 'polearm', 'shield'],  // 可使用武器
        resourceType: 'rage',             // 资源类型 (mana/rage/energy/combo)
        talentTrees: ['arms', 'fury', 'protection'],  // 天赋树分支
        specialMechanic: null             // 特殊机制标识
    }
}
```

**理由**: 保持向后兼容，现有代码无需修改即可继续使用基础字段。

**替代方案**: 创建独立的 `ClassExtensions.js` 文件 - 但会增加数据分散和维护复杂度。

### 决策 2: 天赋系统数据结构

**选择**: 在 `GameData` 中新增 `talents` 对象

```javascript
talents: {
    warrior: {
        arms: {
            name: '武器',
            description: '专注于双手武器的输出',
            talents: [
                { id: 'improved_heroic_strike', name: '强化英勇打击', tier: 1, maxPoints: 5 }
            ]
        },
        fury: { /* ... */ },
        protection: { /* ... */ }
    }
}
```

**理由**: 与职业配置分离，便于独立管理和扩展天赋内容。

**替代方案**: 内嵌到 `classes` 对象中 - 但会使职业配置过于臃肿。

### 决策 3: 职业特殊机制实现

**选择**: 使用策略模式，通过 `specialMechanic` 标识符映射到具体实现

```javascript
// GameData.js
classes: {
    hunter: { specialMechanic: 'pet' },
    warlock: { specialMechanic: 'demon' },
    shaman: { specialMechanic: 'totem' },
    druid: { specialMechanic: 'shapeshift' }
}

// 新增 ClassMechanics.js
const ClassMechanics = {
    pet: { /* 宠物系统配置 */ },
    demon: { /* 恶魔召唤配置 */ },
    totem: { /* 图腾系统配置 */ },
    shapeshift: { /* 变形系统配置 */ }
}
```

**理由**: 解耦职业定义和机制实现，便于独立开发和测试。

**替代方案**: 硬编码到各职业类中 - 但缺乏灵活性和可扩展性。

### 决策 4: 装备验证机制

**选择**: 在 `CharacterSystem.js` 中添加装备验证方法

```javascript
canEquipArmor(character, armorType) {
    const classData = GameData.classes[character.class];
    return classData.armorTypes.includes(armorType);
}

canEquipWeapon(character, weaponType) {
    const classData = GameData.classes[character.class];
    return classData.weaponTypes.includes(weaponType);
}
```

**理由**: 集中管理角色相关逻辑，保持职责单一。

**替代方案**: 创建独立的 `EquipmentValidator.js` - 但对当前项目规模来说过度设计。

### 决策 5: 资源系统设计

**选择**: 为不同职业使用统一的资源接口，但配置不同的资源类型

| 职业 | 资源类型 | 初始值 | 回复机制 |
|------|----------|--------|----------|
| 战士 | 怒气 (Rage) | 0 | 受击/攻击时生成 |
| 盗贼 | 能量 (Energy) | 100 | 每秒自动回复 |
| 其他 | 法力 (Mana) | 按智力计算 | 战斗外快速回复 |

**理由**: 保持不同职业的游戏体验差异化。

## Risks / Trade-offs

### 风险 1: 数据量膨胀
**风险**: 9个职业 × 3个天赋树 × 多个天赋 = 大量配置数据
**缓解**: 使用懒加载，按需加载天赋数据；考虑将天赋数据拆分为独立 JSON 文件

### 风险 2: 职业平衡问题
**风险**: 新增职业可能与现有系统平衡性不佳
**缓解**: 参考设计文档中的属性数值，保持与现有职业相似的数值区间

### 风险 3: 特殊机制复杂度
**风险**: 宠物/恶魔/图腾/变形系统增加战斗逻辑复杂度
**缓解**: 第一阶段仅实现数据结构和基础框架，具体战斗逻辑在后续迭代中完善

### 风险 4: 向后兼容
**风险**: 修改职业结构可能影响现有存档
**缓解**: 新增字段使用合理默认值，现有存档可无缝升级

## 文件变更计划

| 文件 | 变更类型 | 描述 |
|------|----------|------|
| `src/data/GameData.js` | 修改 | 添加4个职业，扩展所有职业配置 |
| `src/data/TalentData.js` | 新增 | 天赋系统配置数据（9职业×3天赋树，每树4层7天赋） |
| `src/data/ClassMechanics.js` | 新增 | 职业特殊机制配置（宠物/恶魔/图腾/变形） |
| `src/systems/CharacterSystem.js` | 修改 | 添加 canEquipArmor/canEquipWeapon 验证方法 |
| `src/systems/TalentSystem.js` | 新增 | 天赋点分配和重置逻辑（10级起每级1点，最高51点） |
| `src/views/CreateCharacterView.vue` | 修改 | 支持9职业选择界面（含属性预览、角色定位标签） |

## 实现偏差记录

### 1. 角色创建界面路径
**规格**: `src/ui/CharacterCreation.js`
**实际**: `src/views/CreateCharacterView.vue`（Vue SFC 组件）

### 2. 天赋树预览
**规格**: tasks 7.6 要求"添加职业天赋分支预览"
**实际**: CreateCharacterView.vue 未显示天赋树预览，选中职业仅展示属性条形图+资源类型+角色定位标签

### 3. 连击点自动初始化
**规格外功能**: CreateCharacterView.vue 中对 `energy` 资源类型的职业（盗贼）自动初始化 `comboPoints: { current: 0, max: 5 }`，此功能与 rogue-combo-system 变更关联
