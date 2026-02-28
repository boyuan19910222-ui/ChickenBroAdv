## Context

当前游戏头部有一个"测试升级"按钮，位于 `GameHeader.vue` 中。需要重构为"测试工具"弹窗，并增加"测试死亡"按钮。

### 当前实现
- `GameHeader.vue`: 包含直接暴露的 `debug-levelup` 按钮
- `GameView.vue`: 处理 `debugLevelUp()` 函数

### 约束
- 保持现有 UI 风格（像素风格弹窗）
- "测试死亡"按钮仅在战斗状态可用
- 不修改现有的 `CharacterSystem.takeDamage()` 逻辑

## Goals / Non-Goals

**Goals:**
- 将"测试升级"按钮移入弹窗
- 新增"测试死亡"按钮，仅战斗可用
- 点击后触发正常死亡流程（跑尸效果）

**Non-Goals:**
- 不增加调试复活功能
- 不修改现有战斗逻辑
- 不添加自动化测试

## Decisions

### 1. 弹窗实现方式
- **决定**: 在 GameView.vue 中内联实现弹窗
- **理由**: 弹窗逻辑简单，无需单独组件，减少文件数量

### 2. 战斗状态判断
- **决定**: 使用 `gameStore.currentScene === 'combat' || gameStore.currentScene === 'dungeon'`
- **理由**: 与现有 `isInCombat` / `isInDungeon` getter 保持一致

### 3. 死亡触发方式
- **决定**: 调用 `characterSystem.takeDamage(player.maxHp)`
- **理由**: 复用现有伤害逻辑，自动触发 `character:death` 事件和跑尸效果

## Risks / Trade-offs

- [低风险] 弹窗位置可能遮挡其他 UI → 测试时调整
