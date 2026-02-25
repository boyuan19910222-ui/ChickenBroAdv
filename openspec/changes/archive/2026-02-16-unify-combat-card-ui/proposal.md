## Why

野外战斗（CombatView）和副本战斗（DungeonCombatView）各自内联实现了角色卡片 UI，包括 HP/资源条、浮动伤害数字、受击抖动动画、CSS 关键帧动画等。这些逻辑高度重复，导致每次修改（如添加 DOT 伤害浮动数字）都需要在两处同步改动，维护成本高且容易遗漏。

## What Changes

- 抽取通用 `CombatantCard.vue` 组件，统一角色卡片的结构、HP/资源条渲染、Buff/Debuff 图标显示
- 抽取通用 `ResourceBar.vue` 组件，统一 HP 条、法力条、怒气条、能量条的渲染逻辑
- 抽取 `useCombatFloats` composable，统一浮动伤害数字的生成、管理和清理逻辑
- 重构 `CombatView.vue` 和 `DungeonCombatView.vue`，使用新的通用组件替换内联实现
- 统一 CSS 动画定义（damageFloat、critDamageFloat、healFloat、hitShake、critHitShake），消除重复
- 野外战斗的浮动数字索引模型从双数组改为按 unitId 字典，与副本统一

## Capabilities

### New Capabilities
- `combatant-card`: 通用角色卡片组件，支持 normal/compact 两种尺寸，支持玩家/敌方两种阵营样式，支持可选的交互状态（选中、高亮、死亡灰化等）
- `resource-bar`: 通用资源条组件，支持 HP/法力/怒气/能量等多种资源类型渲染
- `combat-floats`: 浮动伤害数字 composable，统一管理浮动数字的生成、动画和生命周期

### Modified Capabilities

## Impact

- `src/components/combat/CombatView.vue` — 模板和脚本大幅简化，改用通用组件
- `src/components/dungeon/DungeonCombatView.vue` — 模板和脚本大幅简化，改用通用组件
- `src/components/common/` — 新增 CombatantCard.vue、ResourceBar.vue
- `src/composables/` — 新增 useCombatFloats.js
- 两个视图中重复的 CSS 动画定义被移入通用组件/共享样式
- 需同步到 `vue-app/` 目录
