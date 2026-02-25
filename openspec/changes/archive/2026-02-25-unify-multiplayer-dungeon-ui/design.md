## Context

当前集合石多人模式使用独立的 `BattleEngine.js`（772行简化模拟器）在服务端运行战斗，通过 `BroadcastEventBus` 广播事件流给客户端的 `BattleView.vue`（860行旁观者UI）渲染。而单人模式使用 `DungeonCombatSystem.js`（3664行完整引擎，含8个子系统）在客户端运行，由 `DungeonCombatView.vue`（2069行）渲染。

两套系统的体验完全割裂。用户要求集合石模式**完全继承**单人模式的UI和流程，所有角色由AI自动战斗，不支持手动操作。

关键约束：
- `DungeonCombatSystem` 依赖 `GameEngine`（eventBus ×70+处、stateManager ×14处、getSystem ×1处、saveGame ×1处）
- `DungeonCombatSystem` 通过 `init(engine)` 注入依赖，构造函数无参数
- 玩家控制判定基于 `member.isPlayer === true`（第887行）
- 已有 `isAutoBattle` 自动战斗逻辑在 `DungeonCombatView` 中（第885-1047行），但是**视图层**的自动化，非引擎层
- `DungeonCombatView` 不是路由级组件，是 `GameView.vue` 按 `gameStore.currentScene === 'dungeon'` 条件渲染的子组件
- 随机数已使用种子化的 `RandomProvider`（import 自 `core/RandomProvider.js`），不依赖 `engine.randomProvider`

## Goals / Non-Goals

**Goals:**
- 集合石模式复用 `DungeonCombatView` + `DungeonCombatSystem` 的完整UI和流程
- 集合石模式下所有角色（含真人玩家角色）由 `AIDecisionSystem` 自动决策，自动推进副本
- 各客户端本地运行战斗（相同种子+全AI=确定性一致）
- 服务端仅负责：房间管理、种子+队伍数据下发、通关掉落结算
- 单人模式完全不受影响
- 通关后每个真人玩家独立掉落（服务端计算）

**Non-Goals:**
- 不拆分 `DungeonCombatSystem` 为 Core/UI（原 battle-sync-system spec 中的拆分方案不再需要，因为战斗回到客户端运行）
- 不支持真人玩家手动操作（集合石模式全自动）
- 不实现断线重连恢复战斗进度（断线=AI接管+无掉落，保持现有策略）
- 不修改 `DungeonCombatSystem` 的核心战斗逻辑
- 不修改 `LootSystem` 核心函数

## Decisions

### 1. 战斗运行位置：客户端本地

**决策**: 集合石模式下战斗在每个客户端本地运行 `DungeonCombatSystem`，不在服务端运行。

**备选方案**:
- A) 客户端本地运行（选定）
- B) 服务端运行完整 `DungeonCombatSystem`（需要解耦3664行代码的 GameEngine 依赖，工作量巨大）
- C) 服务端运行+事件流广播（当前方案，体验割裂）

**理由**: 全自动AI + 种子随机数 = 确定性保证（所有客户端输入相同→输出相同）。无需解耦 `GameEngine` 依赖，`DungeonCombatSystem` 零修改运行在已有的 `GameEngine` 环境中。改动量最小，UI复用零成本。

### 2. GameEngine 适配：多人模式提供轻量 Adapter

**决策**: 多人模式下创建 `MultiplayerEngineAdapter`，提供 `DungeonCombatSystem` 所需的 `engine` 接口（eventBus、stateManager），内部使用真实的 `GameEngine` eventBus + 构造虚拟 player state。

**实现方式**:
- `eventBus`: 直接使用 `gameStore.eventBus`（已有，无需mock）
- `stateManager.get('player')`: 返回从服务端接收的队伍快照中"当前用户的角色"数据（转换为 player state 格式）
- `stateManager.set('player', ...)`: 多人模式下为空操作（不持久化到本地存档）
- `getSystem('combat')`: 返回 null（多人模式下不需要脱战恢复）
- `saveGame()`: 多人模式下为空操作

**理由**: `DungeonCombatSystem` 对 engine 的依赖有限（4个API），提供 adapter 比解耦3664行代码成本低得多。

### 3. 全自动模式：引擎层 `autoPlayMode` 标志

**决策**: 在 `DungeonCombatSystem` 中新增 `autoPlayMode` 属性。当 `autoPlayMode = true` 时，`handlePlayerTurn()` 对所有 `isPlayer === true` 的角色也走 `processAIAllyTurn()` 分支，跳过 `waitingForPlayerInput = true` 的设置。

**备选方案**:
- A) 引擎层 autoPlayMode（选定）
- B) 视图层 isAutoBattle 复用（已有，但依赖视图层的 `doAutoDungeonAction()` 逻辑，需要先等 `dungeon:planningPhaseStart` 事件→视图层AI计算→emit `dungeon:playerAction`→再 emit `dungeon:startExecution`，流程复杂且有不必要的视图层耦合）
- C) 将所有角色的 `isPlayer` 设为 `false`（会影响其他依赖 `isPlayer` 的逻辑如UI高亮、掉落判定等）

**理由**: 方案A最干净 — 在引擎层一行判断即可，无需修改视图层自动战斗逻辑，无需伪装角色属性。视图层的 `isAutoBattle` 保留用于单人模式的手动→自动切换。

### 4. 队伍构建：服务端快照 → 客户端 PartyFormation

**决策**: 服务端在房间开始时下发 `{ seed, partySnapshots[], dungeonId }`，客户端使用 `PartyFormationSystem.createDungeonPartyFromSnapshots(snapshots, dungeonData)` 新增方法，将快照转换为战斗用的 party 数组。

**数据流**:
1. 服务端 `rooms.js` 收集所有玩家的 `playerSnapshot`（加入房间时上传的角色数据）
2. 服务端 AI 补位（生成 AI 角色快照）
3. 服务端广播 `battle:init` 事件：`{ seed, partySnapshots, dungeonId }`
4. 客户端 `MultiplayerDungeonAdapter` 接收数据
5. 调用 `PartyFormationSystem.createDungeonPartyFromSnapshots()` 构建队伍
6. 设置 `RandomProvider` 种子
7. 调用 `DungeonCombatSystem.startDungeonMultiplayer(dungeonId, party)` 启动战斗

### 5. 掉落结算：客户端上报 → 服务端验证计算

**决策**: 战斗结束后客户端上报 `{ result: 'victory'|'defeat', seed, dungeonId }` 给服务端，服务端验证后独立计算每个在线真人玩家的掉落。

**验证逻辑**: 服务端可通过 seed 和 dungeonId 重新运行确定性战斗来验证结果（可选，初期可信任客户端上报）。

**理由**: 掉落涉及经济系统，必须由服务端控制，防止客户端伪造。

### 6. 路由与场景切换

**决策**: 废弃 `/battle/:roomId` 路由和 `BattleView.vue`。集合石战斗通过 `gameStore.changeScene('dungeon')` 切换到 `DungeonCombatView`（与单人模式相同路径），通过 `multiplayerStore.isInBattle` 区分模式。

**流程**:
1. `WaitingRoomView` 收到 `room:battle_start` → 设置 multiplayerStore 状态
2. `router.push('/game')` → `GameView` 渲染
3. `gameStore.changeScene('dungeon')` → 条件渲染 `DungeonCombatView`
4. `DungeonCombatView.onMounted` 检测 `multiplayerStore.isInBattle`，走多人模式启动流程

### 7. 聊天集成

**决策**: 在 `DungeonCombatView` 中新增可折叠的聊天侧栏，仅在多人模式下显示。复用现有 `multiplayerStore` 的聊天功能（`roomMessages`、`sendMessage`）。

### 8. 服务端精简

**决策**: 
- `BattleEngine.js` → 移除战斗模拟逻辑（`_runBattleLoop`、`_processRound` 等），保留 `_buildParty`（AI补位）和掉落计算（`_distributeLoot`）
- `BroadcastEventBus.js` → 保留，但仅用于广播非战斗事件（`battle:init`、`battle:loot`、`battle:finished_server`）
- `server/index.js` → `launchBattle()` 改为仅下发初始化数据，不启动战斗循环

## Risks / Trade-offs

### [风险] 多端确定性不一致
不同浏览器的浮点运算可能存在微小差异，导致战斗过程偏离。
→ **缓解**: 全AI自动+种子随机数已保证逻辑确定性；`RandomProvider` 使用整数算法（mulberry32），不依赖浮点精度；即使有微小偏离，各客户端独立运行不互相校验，不影响体验。

### [风险] 客户端作弊（伪造胜利上报）
客户端可修改上报结果为 victory 获取掉落。
→ **缓解**: 初期可信任（PvE游戏、小规模用户）；后续可在服务端通过相同种子重跑验证。

### [风险] DungeonCombatView 复杂度增加
多人模式增加聊天、掉落弹窗、模式判断等逻辑。
→ **缓解**: 通过 `isMultiplayerMode` computed 控制条件渲染，新增逻辑用独立 section 隔离。

### [Trade-off] 废弃 BattleView.vue 和 BattleEngine 战斗逻辑
这两个组件在 meeting-stone-multiplayer 变更中刚实现。
→ **接受**: 体验统一比代码复用更重要。保留文件但标记为 deprecated，后续清理。

## Open Questions

- 无（方案已与用户确认）
