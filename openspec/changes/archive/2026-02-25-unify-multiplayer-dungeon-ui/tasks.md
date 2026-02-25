## 1. DungeonCombatSystem 全自动模式

- [x] 1.1 在 `DungeonCombatSystem` 构造函数中新增 `this.autoPlayMode = false` 属性
- [x] 1.2 修改 `handlePlayerTurn()` 方法：当 `autoPlayMode === true` 时，`isPlayer === true` 的角色走 `processAIAllyTurn()` 分支，不设置 `waitingForPlayerInput = true`，不触发 `dungeon:planningPhaseStart`
- [x] 1.3 修改 encounter 胜利后的休息阶段逻辑：当 `autoPlayMode === true` 时，自动延迟 2-3 秒后调用 `startNextEncounter()`，不等待玩家点击；同时修改 `enterPlanningPhase()` 跳过规划阶段
- [x] 1.4 新增 `startDungeonMultiplayer(dungeonId, party)` 方法：接受外部注入队伍，设置 `autoPlayMode = true`，直接使用传入 party 启动战斗（跳过 `stateManager.get('player')` 队伍构建）
- [x] 1.5 修改 `completeDungeon()` / `handleEncounterDefeat()` 方法：当 `autoPlayMode === true` 时，不调用 `stateManager.set('player', ...)` 和 `engine.saveGame()`，仅触发 `dungeon:complete` / `dungeon:defeat` 事件

## 2. MultiplayerEngineAdapter

- [x] 2.1 创建 `src/systems/MultiplayerEngineAdapter.js`：实现 `engine` 接口（eventBus 引用 gameStore.eventBus，stateManager.get/set 为适配实现，getSystem 返回 null，saveGame 为空操作）
- [x] 2.2 adapter 的 `stateManager.get('player')` 返回从服务端队伍快照中提取的当前用户角色数据

## 3. PartyFormationSystem 快照构建

- [x] 3.1 在 `PartyFormationSystem` 中新增 `createDungeonPartyFromSnapshots(snapshots, currentUserId)` 静态方法：将服务端快照数组转换为战斗用 party 数组，包含角色属性、技能、装备、槽位分配、isPlayer/isAI 标记

## 4. MultiplayerDungeonAdapter 适配层

- [x] 4.1 创建 `src/systems/MultiplayerDungeonAdapter.js`：负责接收 `battle:init` 数据，调用 PartyFormation 构建队伍，设置 RandomProvider 种子，创建 MultiplayerEngineAdapter，初始化并启动 DungeonCombatSystem
- [x] 4.2 实现战斗结束监听：监听 `dungeon:complete` 事件，通过 Socket 发送 `battle:complete` 上报服务端
- [x] 4.3 实现掉落接收：监听 `battle:loot` Socket 事件，存储到 multiplayerStore

## 5. DungeonCombatView 多人模式适配

- [x] 5.1 新增 `isMultiplayerMode` computed（基于 `multiplayerStore.isInBattle`）
- [x] 5.2 多人模式下隐藏手动操作 UI：技能面板（SkillPanel）、操作按钮（攻击/防御/结算）、目标选择（TargetConfirmDialog）、自动战斗切换按钮添加 `v-if="!isMultiplayerMode"` 条件
- [x] 5.3 多人模式下 `onMounted` 走多人启动流程：检测 `multiplayerStore.isInBattle`，调用 `MultiplayerDungeonAdapter` 启动战斗（替代单人模式的 `startDungeon()`）
- [x] 5.4 新增可折叠聊天侧栏组件（仅多人模式渲染）：显示 `multiplayerStore.roomMessages`，支持发送消息
- [x] 5.5 集成 `LootResultModal`：多人模式胜利后收到 `battle:loot` 时弹出掉落弹窗
- [x] 5.6 多人模式战斗结束处理：胜利→等待掉落→显示弹窗→返回大厅；失败→显示结果→提供返回按钮

## 6. 服务端改造

- [x] 6.1 修改 `server/index.js` 的 `launchBattle()` 函数：不再创建 `BattleEngine` 运行战斗循环，改为收集队伍快照+生成种子+广播 `battle:init` 事件
- [x] 6.2 新增 `battle:complete` Socket 事件监听：接收客户端上报的战斗结果，以第一个为准，胜利时执行掉落计算并推送 `battle:loot`
- [x] 6.3 `server/rooms.js`：`_startBattle()` 无需修改，已兼容新流程（仅负责房间状态+AI补位+触发回调）
- [x] 6.4 精简 `server/BattleEngine.js`：移除战斗模拟方法（`_runBattleLoop`、`_buildParty`、`_generateEnemies` 等），保留掉落计算（`generatePersonalLoot`、`_generateLootForPlayer` 等）

## 7. 路由与导航

- [x] 7.1 修改 `WaitingRoomView.vue`：收到 `room:battle_start` 后，不再 `router.push('/battle/:roomId')`，改为 `gameStore.changeScene('dungeon')` + `router.push('/game')`
- [x] 7.2 multiplayerStore 改造：新增 `battleInitData` 字段和 `battle:init` Socket 监听器；新增 `battle:finished_server` 监听器；精简旧版战斗事件流处理逻辑

## 8. 清理与废弃

- [x] 8.1 标记 `BattleView.vue` 为 deprecated（添加模板和脚本注释），`/battle/:roomId` 路由改为重定向到 `/game`
- [x] 8.2 标记 `BroadcastEventBus.js` 为 deprecated（添加文件顶部 JSDoc 注释）
