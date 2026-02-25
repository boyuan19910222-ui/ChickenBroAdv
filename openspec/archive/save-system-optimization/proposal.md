## Why

当前存档系统存在三个问题：1) 自动存档间隔为 10 分钟，过长导致意外关闭浏览器时丢失较多进度；2) 加载存档时会恢复保存时的精确状态（包括战斗中、残血等），导致体验不连贯；3) 没有 `beforeunload` 保护，浏览器意外关闭时无法紧急存档。优化后，玩家每次进入游戏都以干净的满状态从野外开始，同时通过更短的自动存档间隔和紧急存档机制减少进度丢失。

## What Changes

- 自动存档间隔从 10 分钟缩短为 5 分钟
- 新增 `beforeunload` 事件监听，浏览器关闭/刷新时执行紧急存档
- 加载存档时执行状态清洗（sanitize）：
  - 场景强制设为 `exploration`（野外探索）
  - HP/Mana/资源回满（按职业区分：战士怒气归零、其余职业资源回满）
  - 清除战斗状态（`combat` → null, `dungeonCombat` → null）
  - 清除所有 buff/debuff
  - 重置技能冷却
  - 宠物 HP 回满（如有）
- 保留所有角色元数据：等级、经验、装备、金币、背包、任务、天赋、统计

## Capabilities

### New Capabilities
- `save-load-sanitize`: 加载存档时的状态清洗逻辑，确保总是以满状态从野外探索进入游戏

### Modified Capabilities
- `save-migration`: 新增 beforeunload 紧急存档、自动存档间隔调整（SaveManager 层面变更）

## Impact

- `src/core/GameEngine.js` — 自动存档间隔参数、loadGame() 增加 sanitize 逻辑、beforeunload 注册/注销
- `src/core/SaveManager.js` — 可能需要新增紧急存档方法（同步写入）
- `src/systems/CombatSystem.js` — _restoreCombatState() 在新逻辑下不会触发（combat 已被清除），无需修改但需确认兼容
- `src/systems/DungeonCombatSystem.js` — 同上，副本战斗状态加载后被清除
