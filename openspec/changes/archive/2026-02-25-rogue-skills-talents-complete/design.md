# Design: 盗贼技能与天赋完整补齐

## Context

### 背景
盗贼是魔兽世界中经典的近战DPS职业，以潜行、连击点和毒药系统为特色。当前实现中，盗贼的技能数量（7个）和天赋树层数（4层）与其他完整职业（战士13技能/5层、圣骑士13技能/5层、猎人12技能/5层、德鲁伊29技能/5层）存在显著差距。

### 当前状态
- **技能定义**：GameData.js 中有 7 个盗贼技能（shadowStrike, eviscerate, backstab, poisonBlade, kidneyShot, evade, vanish）
- **天赋定义**：TalentData.js 中有三系天赋树，但仅 4 层，且标记的 `unlock_skill` 类型天赋缺少对应的技能定义
- **特殊机制**：ClassMechanics.js 中没有盗贼特有的潜行或毒药系统定义

### 约束
- 必须保持与现有技能/天赋数据结构一致
- 不能破坏现有盗贼技能的功能
- 需要与其他职业的实现风格保持一致

## Goals / Non-Goals

**Goals:**
1. 补齐盗贼天赋解锁技能的实际定义
2. 将天赋树从 4 层扩展到 5 层，添加终极天赋
3. 添加潜行系统相关技能和机制定义
4. 添加毒药系统的数据定义
5. 补充盗贼核心技能（切割、出血、偷袭、伏击、闷棍等）

**Non-Goals:**
- 不实现潜行和毒药系统的运行时逻辑（这是战斗系统的工作）
- 不修改其他职业的数据
- 不修改 UI 层的显示逻辑
- 不实现网络同步或存档相关功能

## Decisions

### 决策 1: 技能数据结构扩展

**选择**: 在现有技能结构中添加 `conditions.stealthRequired` 和 `effects.poisonType` 字段

**理由**: 
- 复用现有结构，减少修改范围
- 与德鲁伊的 `conditions.requiresForm` 模式一致
- 战斗系统可以通过条件检查自动处理

**替代方案**:
- 创建独立的 stealthSkills 对象 → 增加数据访问复杂度
- 在 ClassMechanics.js 中硬编码技能列表 → 维护困难

### 决策 2: 天赋解锁技能的 ID 命名规范

**选择**: 使用驼峰命名法（camelCase），与其他技能保持一致

**命名映射**:
| 天赋 ID | 技能 ID | 技能名称 |
|---------|---------|----------|
| coldBlood | coldBlood | 冷血 |
| bladeFlurry | bladeFlurry | 剑刃乱舞 |
| adrenalineRush | adrenalineRush | 冲动 |
| ghostlyStrike | ghostlyStrike | 幽灵打击 |
| preparation | preparation | 预谋 |
| mutilate (T5) | mutilate | 毁伤 |
| killingSpree (T5) | killingSpree | 杀戮盛筵 |
| shadowDance (T5) | shadowDance | 暗影之舞 |

**理由**: 保持代码风格一致性，便于搜索和维护

### 决策 3: 潜行系统数据位置

**选择**: 在 ClassMechanics.js 中添加 `stealth` 对象，在 GameData.js 中添加潜行技能

**ClassMechanics.js 结构**:
```javascript
stealth: {
    id: 'stealth',
    name: '潜行系统',
    description: '盗贼独有的隐身和潜行攻击机制',
    stealthState: {
        visibilityReduction: 1.0,
        movementSpeedPenalty: 0.3,
        detectionRange: 2,
        bonuses: {
            critChance: 0.5,
            comboPointBonus: 1
        }
    },
    stealthOnlySkills: ['cheapShot', 'ambush', 'sap', 'pickpocket']
}
```

**理由**: 
- 与德鲁伊的 `shapeshift`、猎人的 `pet`、萨满的 `totem` 结构一致
- 将系统配置与技能数据分离

### 决策 4: 毒药系统数据位置

**选择**: 在 ClassMechanics.js 中添加 `poison` 对象

**ClassMechanics.js 结构**:
```javascript
poison: {
    id: 'poison',
    name: '毒药系统',
    description: '盗贼可以涂抹毒药增强武器攻击',
    poisonTypes: {
        deadlyPoison: { procChance: 0.3, type: 'dot', damage: 15, duration: 4, maxStacks: 5 },
        woundPoison: { procChance: 0.5, type: 'debuff', effect: 'healingReduction', value: 0.25, duration: 4 },
        numbingPoison: { procChance: 0.2, type: 'debuff', effect: 'castSlow', value: 0.3, duration: 4 },
        instantPoison: { procChance: 0.2, type: 'instant', damage: 20 },
        cripplingPoison: { procChance: 0.3, type: 'debuff', effect: 'slow', value: 0.5, duration: 5 }
    },
    dualWield: {
        mainHand: true,
        offHand: true
    }
}
```

**理由**: 
- 毒药是盗贼特有的武器增益系统
- 便于天赋系统引用毒药类型
- 战斗系统可以统一处理毒药触发

### 决策 5: 天赋树扩展策略

**选择**: 采用"向下扩展"策略，保持现有天赋不变，在 T5 添加终极天赋

**刺杀树 T5**: 毁伤
- 效果：同时使用两把武器攻击，造成武器伤害并产生2个连击点，如果目标中毒则额外产生1个

**战斗树 T5**: 杀戮盛筵
- 效果：在5个目标间穿梭攻击，每个目标造成武器伤害，期间免疫控制

**敏锐树 T5**: 暗影之舞
- 效果：进入暗影之舞状态，持续期间所有潜行技能可不进入潜行直接使用

**理由**: 
- 与战士、圣骑士、猎人、德鲁伊的终极天赋模式一致
- 终极天赋提供显著的战斗风格变化

## Risks / Trade-offs

### 风险 1: 战斗系统兼容性
**风险**: 新增的潜行条件和毒药效果可能需要战斗系统支持
**缓解**: 
- 数据定义独立于运行时逻辑
- 战斗系统可以逐步实现支持
- 当前阶段仅完成数据层

### 风险 2: 技能数量激增
**风险**: 一次性添加 15+ 个技能可能导致数据文件膨胀
**缓解**: 
- 使用清晰的注释分区组织代码
- 遵循现有文件结构
- 技能定义经过充分验证

### 风险 3: 天赋效果复杂度
**风险**: 部分天赋效果（如毁伤的中毒检测、杀戮盛筵的穿梭攻击）实现复杂
**缓解**: 
- 设计文档仅定义数据结构
- 复杂逻辑留待战斗系统实现
- 提供清晰的效果类型标记

## Migration Plan

本变更为纯数据层扩展，无需迁移：
1. 在 GameData.js 的盗贼技能区块末尾添加新技能
2. 更新盗贼职业的 skills 数组
3. 在 TalentData.js 中扩展三系天赋树
4. 在 ClassMechanics.js 中添加 stealth 和 poison 对象

### 回滚策略
如需回滚：
1. 删除新增的技能定义
2. 恢复 skills 数组到原始状态
3. 将天赋树缩减回 4 层
4. 删除 ClassMechanics.js 中的 stealth 和 poison 对象

## Open Questions

1. **毒药应用机制**: 是否需要专门的"涂抹毒药"技能，还是作为被动武器增益？
   - 当前设计：作为 ClassMechanics 中的配置，由 UI 或自动系统触发

2. **潜行状态显示**: UI 如何显示潜行状态？
   - 不在本设计范围内，由 UI 层决定

3. **连击点 UI**: 新技能如何与连击点显示配合？
   - 使用现有的 comboPoints 数据结构，无需修改
