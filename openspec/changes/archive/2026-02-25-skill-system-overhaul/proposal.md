## Why

当前技能系统是半成品骨架：30个技能定义缺少统一的 damageType/skillType/targetType，玩家技能与敌人技能结构不同，开放世界 CombatSystem 不处理 DOT/HOT/buff，副本 AP 映射表与 GameData 技能定义脱节，没有等级解锁机制。需要建立一个完整、统一的技能框架来支撑 9 大职业的差异化玩法。

## What Changes

- **统一技能 Schema**：所有技能（玩家/敌人）遵循统一结构，包含 id, name, emoji, unlockLevel, category, skillType, damageType, targetType, range, resourceCost, actionPoints, cooldown, damage, heal, effects[], comboPoints, generatesResource, conditions
- **技能分级体系**：引入 category（filler/core/powerful/ultimate/utility/builder/finisher），filler 无 CD，powerful/ultimate 长 CD，AP 消耗 1~3 与 category 挂钩
- **7 种伤害类型**：physical, fire, frost, nature, arcane, holy, shadow（纯标记，不做抗性减伤）
- **目标类型系统**：enemy, self, ally, all_enemies, all_allies, front_2, front_3, random_3
- **effects[] 数组**：从单个 effect 升级为多效果数组，支持 dot, hot, buff, debuff, shield, cc, summon
- **DOT/HOT 回合结束结算**：回合结束时遍历所有单位的 DOT/HOT 效果，逐 tick 结算，duration 递减，到 0 移除
- **等级解锁**：每个技能有 unlockLevel，从 1 级到 50 级逐步解锁
- **9 大职业技能扩充至 6~8 个/职业**：战士 8 个、盗贼 7 个、法师 7 个、牧师 8 个、猎人 7 个、圣骑士 7 个、萨满 7 个、术士 7 个、德鲁伊 8 个
- **AP 消耗内置**：actionPoints 直接定义在技能数据中，废弃 ActionPointSystem 中的外部映射表
- **开放世界 CombatSystem 统一修复**：补齐 DOT/HOT/buff/debuff 处理，与副本系统对齐
- **敌人技能格式统一**：敌人技能使用相同的 skillType/damageType/targetType/effects[] 结构

## Capabilities

### New Capabilities
- `skill-schema`: 统一技能数据结构定义（Schema），包含所有字段规范、分类体系、伤害类型枚举、目标类型枚举
- `class-skills`: 9 大职业完整技能数据表，包含每个技能的完整属性、解锁等级、AP 消耗、效果定义
- `effect-system`: 效果系统框架，包括 DOT/HOT/buff/debuff/shield/cc/summon 的结算逻辑和回合结束处理流程

### Modified Capabilities
<!-- 当前 openspec/specs/ 为空，无已有 spec 需要修改 -->

## Impact

- **GameData.js**: skills 对象全量重写，classes 中的 skills 引用更新
- **CombatSystem.js**: 开放世界战斗引擎重构，补齐效果处理
- **DungeonCombatSystem.js**: 副本战斗引擎适配新技能 Schema，集成效果系统
- **ActionPointSystem.js**: 移除硬编码 AP 映射表，改为从技能数据读取 actionPoints
- **WailingCaverns.js**: 副本敌人技能格式统一
- **CombatView.vue / DungeonCombatView.vue**: UI 适配效果显示（DOT/HOT 图标、buff/debuff 列表）
