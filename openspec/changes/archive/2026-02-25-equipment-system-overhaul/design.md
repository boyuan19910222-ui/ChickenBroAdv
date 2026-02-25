## Context

当前项目 ChickenBro 是一款魔兽世界题材的文字 RPG 游戏，使用 Vue 3 + Vite 构建。装备系统存在双轨不一致问题：

- `PlayerSchema.js` (vue-app/) 定义 5 个旧槽位: `weapon, armor, helmet, boots, accessory`
- `EquipmentData.js` (src/) 定义 9 个新槽位: `head, shoulders, chest, hands, legs, feet, mainHand, offHand, ranged`
- `SystemPanel.vue` UI 使用 9 槽位渲染，但只读无交互
- `CharacterSystem.js` 和 `EquipmentSystem.js` 存在重复的装备逻辑

现有数据库有 40+ 件装备模板、4 个套装、7 种怪物掉落表。战斗系统为回合制副本战斗（DungeonCombatSystem）和野外单人战斗（CombatSystem）。

## Goals / Non-Goals

**Goals:**
- 统一为 16 槽位装备系统，消除双轨不一致
- 实现完整的武器单手/双手分类体系
- 实现双持系统（天生/天赋解锁，副手 50% 惩罚）
- 引入护甲值和武器伤害值独立计算
- 建立属性预算公式，保证同等级装备的平衡性
- 提供经典 WoW 风格的装备 UI 交互（穿脱/对比）
- 为后续掉落系统和装备动态生成预留接口

**Non-Goals:**
- 装备掉落系统增强（动态生成、智能掉落）— 后续单独 change
- 饰品特殊效果（使用效果/触发效果）— 后续单独设计
- 装备强化/附魔系统 — 后续单独 change
- 词缀/随机属性系统 — 后续单独 change
- 装备交易/拍卖系统 — 不在规划中

## Decisions

### 1. 16 槽位定义

**决策**: 采用 WoW 经典 16 槽位布局，删除独立 ranged 槽位。

| 槽位 ID | 名称 | 类别 | 有护甲值 | 有耐久 | 槽位权重 |
|---------|------|------|---------|--------|---------|
| head | 头部 | armor | ✅ | ✅ | 0.75 |
| shoulders | 肩部 | armor | ✅ | ✅ | 0.75 |
| chest | 胸甲 | armor | ✅ | ✅ | 1.0 |
| legs | 腿甲 | armor | ✅ | ✅ | 1.0 |
| hands | 手部 | armor | ✅ | ✅ | 0.75 |
| wrists | 手腕 | armor | ✅ | ✅ | 0.56 |
| waist | 腰带 | armor | ✅ | ✅ | 0.56 |
| feet | 靴子 | armor | ✅ | ✅ | 0.75 |
| back | 披风 | armor | ✅ (cloth系数) | ✅ | 0.56 |
| neck | 项链 | accessory | ❌ | ❌ | 0.56 |
| finger1 | 戒指1 | accessory | ❌ | ❌ | 0.56 |
| finger2 | 戒指2 | accessory | ❌ | ❌ | 0.56 |
| trinket1 | 饰品1 | accessory | ❌ | ❌ | 0.56 |
| trinket2 | 饰品2 | accessory | ❌ | ❌ | 0.56 |
| mainHand | 主手 | weapon | ❌ | ✅ | 0.75(单手)/1.0(双手) |
| offHand | 副手 | weapon/shield/offhand | 盾牌有 | ✅(盾牌/武器) | 0.56 |

**理由**: 相比现有 9 槽位，16 槽位提供更丰富的装备搭配可能性，与 WoW 经典一致让熟悉的玩家有亲切感。删除独立 ranged 是因为弓/枪/弩统一为双手武器。

### 2. 武器分类体系（方案 A: 分组数组）

**决策**: 职业武器能力使用分组对象 `weaponTypes: { oneHand: [], twoHand: [] }` 而非单数组。

```javascript
// GameData.js 职业定义示例
warrior: {
  weaponTypes: {
    oneHand: ['sword', 'axe', 'mace', 'dagger', 'fist'],
    twoHand: ['sword', 'axe', 'mace', 'polearm', 'bow', 'crossbow', 'gun']
  }
}
```

**替代方案**: 方案 B 使用复合 key（`sword_1h`, `sword_2h`），但语义不如分组清晰，校验逻辑更复杂。

**武器类型完整分类**:

| weaponType | 可用 weaponHand | 说明 |
|-----------|----------------|------|
| sword | one_hand, two_hand | 单/双手剑 |
| axe | one_hand, two_hand | 单/双手斧 |
| mace | one_hand, two_hand | 单/双手锤 |
| dagger | one_hand | 仅单手 |
| fist | one_hand | 仅单手 |
| wand | one_hand | 仅单手（主手限定） |
| polearm | two_hand | 仅双手 |
| staff | two_hand | 仅双手 |
| bow | two_hand | 仅双手 |
| crossbow | two_hand | 仅双手 |
| gun | two_hand | 仅双手 |
| shield | — | 副手专用，非武器 |
| offhand | — | 副手物品，纯属性 |

**职业武器能力矩阵**:

| 职业 | 单手 | 双手 | 副手 | 双持 |
|------|------|------|------|------|
| 战士 | sword/axe/mace/dagger/fist | sword/axe/mace/polearm/bow/crossbow/gun | shield | ✅天生 |
| 圣骑士 | sword/axe/mace | sword/axe/mace/polearm | shield | ❌ |
| 猎人 | sword/axe/dagger/fist | sword/axe/polearm/staff/bow/crossbow/gun | — | ✅天生 |
| 盗贼 | sword/mace/dagger/fist | — | — | ✅天生 |
| 牧师 | mace/dagger/wand | staff | offhand物品 | ❌ |
| 萨满 | axe/mace/dagger/fist | axe/mace/staff | shield | 🔒天赋 |
| 法师 | sword/dagger/wand | staff | offhand物品 | ❌ |
| 术士 | sword/dagger/wand | staff | offhand物品 | ❌ |
| 德鲁伊 | mace/dagger/fist | mace/staff | offhand物品 | ❌ |

### 3. 装备数据结构中新增 category 字段

**决策**: 每件装备新增 `category` 字段，取值为 `armor` / `weapon` / `shield` / `offhand` / `accessory`。

**理由**: `slot` 字段标识位置（哪个槽），`category` 标识类型（什么东西），二者解耦。盾牌和副手物品的 slot 都是 offHand，但 category 不同，处理逻辑不同。

### 4. 属性预算公式

**决策**: `totalStatPoints = floor(itemLevel × slotWeight × qualityMultiplier)`

品质缩放:
| 品质 | qualityMultiplier |
|------|------------------|
| common | 1.0 |
| uncommon | 1.15 |
| rare | 1.35 |
| epic | 1.6 |
| legendary | 2.0 |

**约束**: 同 itemLevel + 同 quality + 同 slotWeight 的装备，属性总点数（stats 所有值之和）必须一致。不同槽位权重的装备天然有不同的属性预算（胸甲 > 腰带）。

### 5. 护甲值计算

**决策**: `armorValue = floor(baseCoeff × itemLevel × qualityMultiplier)`

| 护甲类型 | baseCoeff |
|---------|-----------|
| cloth | 1.0 |
| leather | 2.0 |
| mail | 3.5 |
| plate | 5.0 |

**特殊处理**:
- 披风: 固定 cloth 系数 (1.0)，通用不限职业
- 盾牌: 固定 plate 系数 × 1.5 = 7.5
- 副手物品/饰品/项链/戒指: 无护甲值

**物理减伤公式**: `reduction% = totalArmor / (totalArmor + K × attackerLevel)`，K = 400

### 6. 武器伤害值

**决策**: 使用 `{ min, max }` 范围，无武器速度概念（回合制不需要）。

```
baseDPS = itemLevel × qualityMultiplier × weaponWeight
min = floor(baseDPS × 0.75)
max = floor(baseDPS × 1.25)

weaponWeight:
  双手武器: 1.0
  单手武器: 0.65
```

每次攻击: `actualDamage = random(min, max) + 属性加成`
副手惩罚: `offHandDamage = floor(rolledDamage × 0.5)`

### 7. 双持系统

**决策**: 战士/盗贼/猎人天生双持，萨满通过增强天赋树"双武器战斗"天赋解锁。

萨满增强天赋新增:
```javascript
{ id: 'dualWield', name: '双武器战斗', tier: 3, maxPoints: 1,
  effect: { type: 'unlock_ability', ability: 'dual_wield' },
  description: '允许在副手装备单手武器', requires: 'thunderingStrikes' }
```

双持检查: `canDualWield(character) = 天生能力 || 已学天赋`

### 8. 双手武器互斥逻辑

**决策**: 穿脱操作为原子操作，自动处理互斥，失败回滚。

```
穿双手武器 → offHand 有装备 → 检查背包空间 → 卸 offHand 到背包 → 穿 mainHand
穿 offHand → mainHand 是双手 → 检查背包空间 → 卸 mainHand 到背包 → 穿 offHand
背包满 → 操作失败，提示"背包已满"，不做任何改变
```

### 9. 装备唯一性

**决策**: 装备数据增加 `unique: boolean` 字段（默认 false）。`unique: true` 的装备在穿戴时检查所有已装备槽位，如已有同 id 装备则阻止。

适用于: 两个戒指槽、两个饰品槽。非唯一装备可以两个槽装同一件。

### 10. UI 布局 — 经典 WoW 风格

```
左列 (护甲, 从上到下):        中间:          右列 (饰品/其他):
  头部                       角色模型         项链
  肩部                      (ASCII/Emoji)    披风
  胸甲                                        手腕
  手部                                        腰带
  腿甲                                        戒指1
  靴子                                        戒指2
                                              饰品1
底部 (武器):                                  饰品2
  主手    副手
```

装备对比 tooltip: 悬停背包/掉落装备时，并列显示当前已装备物品，属性差异用绿色(▲提升)/红色(▼下降)标注。

### 11. 消除双轨: 统一到 EquipmentSystem

**决策**: `CharacterSystem.js` 中的 `equipItem()`/`unequipItem()`/`canEquipArmor()`/`canEquipWeapon()` 全部删除，统一由 `EquipmentSystem.js` 负责。`CharacterSystem` 只负责属性重算。

**理由**: 消除重复逻辑，单一职责。

### 12. 背包扩容

**决策**: 背包上限从 20 扩至 40。PlayerSchema 中 `inventory` 数组容量校验改为 40。

## Risks / Trade-offs

| 风险 | 影响 | 缓解 |
|------|------|------|
| **BREAKING** 旧存档不兼容新 16 槽位结构 | 玩家丢失已装备物品 | SaveMigration 新增版本，将旧槽位装备映射到新槽位（weapon→mainHand, armor→chest, helmet→head, boots→feet, accessory→trinket1）；9 槽位的直接映射对应字段 |
| 属性预算公式可能导致部分现有装备数值偏差 | 现有 40+ 装备可能不符合新公式 | 用脚本批量校验并调整现有装备数据；或保持现有装备 stats 不变，仅对新装备执行预算约束 |
| UI 重构工作量大（从只读 9 格到交互式 16 格） | 开发周期较长 | 分步实施：先数据层+系统层，再 UI |
| 双手武器互斥 + 背包满的边界情况多 | 可能出现装备丢失 bug | 穿脱操作统一为原子事务，先检查再执行，失败完全回滚 |
| 战斗系统伤害计算改变（集成武器伤害+护甲减伤） | 战斗平衡可能需要重新调整 | K 常数和基础系数可配置，方便后续调参 |
