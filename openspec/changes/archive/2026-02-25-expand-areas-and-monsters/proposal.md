## Why

当前游戏仅有 4 个开放区域（艾尔文森林、西部荒野、荆棘谷、东瘟疫之地）和 24 种怪物，内容量不足以支撑 1-60 级的完整升级体验。大量等级段缺少对应区域，玩家在 10-20 级和 20-45 级之间选择单一，缺乏探索感。此外，所有怪物均为近战战士类型，缺少法师类敌人导致战斗策略单调。

## What Changes

- **新增 11 个开放区域**（总计 15 个），覆盖 Lv 1-60 全等级段，基于 WOW 经典旧世经典区域设计
- **新增约 116 种怪物**（总计约 140 种），每个区域 8-10 种，包含战士类和法师类两种类型
- **引入怪物属性公式系统**：基于等级自动计算基础属性（HP/力量/敏捷/智力/耐力/经验/金币），再叠加战士/法师类型系数
- **新增法师类怪物技能**：fireball、frostBolt、shadowBolt、heal、curseOfWeakness、poisonCloud、lightningBolt 等
- **区域解锁改为分支结构**：支持多条升级路线并行探索，而非线性解锁
- **新增 `monsterType` 字段**（`melee` / `caster`），用于区分怪物战斗 AI 行为

## Capabilities

### New Capabilities
- `monster-formula`: 怪物属性公式系统，基于等级和类型（melee/caster）自动生成基础属性值
- `caster-skills`: 法师类怪物专属技能集，包含远程法术攻击、debuff、治疗等技能
- `area-branch-unlock`: 区域分支解锁系统，支持多条路线并行探索

### Modified Capabilities
- (无现有 spec 需要修改——区域和怪物数据当前没有独立 spec)

## Impact

- **`src/data/GameData.js`**：大规模扩展 `areas` 和 `monsters` 数据（预计新增 800-1000 行）
- **怪物数据结构**：新增 `monsterType: 'melee' | 'caster'` 字段
- **区域数据结构**：新增 `unlockRequires` 字段支持分支解锁（替代当前的 `unlockLevel` 线性方式）
- **战斗 AI 系统**：法师类怪物需要不同的行为逻辑（优先使用法术技能）
- **技能数据**：新增 7+ 法师类技能定义
