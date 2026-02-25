## Why

集合石（多人）模式和单人模式使用了**完全不同的两套战斗引擎和UI**，导致体验割裂：单人模式有完整的行动顺序条、技能面板、Boss阶段、宠物系统、仇恨系统、浮动数字等丰富交互；集合石模式却是简化的旁观者界面，仅有角色卡片和日志面板。用户期望集合石模式**完全继承**单人模式的UI和流程，仅将AI队友替换为组队角色，且全员由AI自动战斗。

## What Changes

- **废弃 `BattleEngine.js` 的战斗模拟逻辑**：不再在服务端运行简化版战斗模拟器，仅保留个人掉落计算
- **废弃 `BattleView.vue`**：不再使用简化版战斗视图，集合石模式复用 `DungeonCombatView.vue`
- **`DungeonCombatSystem` 支持多人模式**：新增"全自动AI托管"模式，所有角色（含真人玩家角色）由 `AIDecisionSystem` 控制，跳过玩家手动操作环节
- **`DungeonCombatView` 支持多人上下文**：在多人模式下隐藏手动操作UI（技能面板/目标选择），保留所有其他UI（行动顺序条、角色卡片、浮动数字、Boss阶段、宠物、休息阶段等），新增聊天侧栏
- **客户端本地运行战斗**：集合石模式下，服务端下发统一种子+队伍快照，各客户端本地运行 `DungeonCombatSystem`（确定性相同种子+全AI决策=相同结果）
- **服务端职责精简**：仅负责房间管理、种子+队伍数据下发、通关后独立掉落结算
- **掉落差异化**：单人模式通关奖励保持不变；集合石模式通关后每个真人玩家各自独立结算掉落，通过服务端计算后下发

## Capabilities

### New Capabilities
- `multiplayer-dungeon-adapter`: 多人副本适配层 — 负责将集合石房间数据（队伍快照、副本ID、种子）转换为 `DungeonCombatSystem` 所需的输入格式，启动本地战斗，并在战斗结束后与服务端通信完成掉落结算
- `auto-battle-mode`: 全自动战斗模式 — `DungeonCombatSystem` 的新运行模式，所有角色（含玩家角色）由 `AIDecisionSystem` 控制，自动推进全部encounter直到通关或失败，无需任何玩家手动输入
- `multiplayer-combat-ui`: 多人战斗UI适配 — `DungeonCombatView` 在多人模式下的UI调整：隐藏手动操作组件、集成聊天面板、接入 `LootResultModal` 掉落弹窗

### Modified Capabilities
- `battle-sync-system`: 战斗同步架构由"服务端权威模拟+事件流广播"改为"服务端下发种子+客户端本地模拟"，服务端不再运行战斗逻辑
- `personal-loot-system`: 掉落触发时机从"服务端战斗结束自动计算"改为"客户端上报通关结果后服务端验证并计算"

## Impact

**客户端文件：**
- `src/systems/DungeonCombatSystem.js` — 新增全自动模式入口和队伍注入接口
- `src/components/dungeon/DungeonCombatView.vue` — 条件渲染手动操作UI、集成聊天和掉落弹窗
- `src/stores/multiplayerStore.js` — 改造：不再接收战斗事件流，改为传递初始化数据给本地战斗系统
- `src/views/BattleView.vue` — 废弃（路由重定向到 DungeonCombatView）
- `src/views/WaitingRoomView.vue` — 修改路由跳转目标
- `src/router/index.js` — 更新 `/battle/:roomId` 路由

**服务端文件：**
- `server/BattleEngine.js` — 移除战斗模拟逻辑，仅保留掉落计算
- `server/BroadcastEventBus.js` — 可能废弃或精简
- `server/index.js` — 修改战斗启动流程（不再启动 BattleEngine 模拟，改为下发初始化数据）
- `server/rooms.js` — 适配新的战斗启动流程

**依赖关系：**
- `DungeonCombatSystem` 依赖 `GameEngine`（eventBus, stateManager）— 多人模式需要提供适配层或mock
- `AIDecisionSystem` — 已有，多人模式直接复用
- `PartyFormationSystem` — 已有，需适配接收服务端队伍快照
