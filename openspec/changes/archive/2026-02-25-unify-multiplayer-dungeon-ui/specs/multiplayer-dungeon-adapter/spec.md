## ADDED Requirements

### Requirement: MultiplayerEngineAdapter 提供 DungeonCombatSystem 所需接口

多人模式下 SHALL 创建 `MultiplayerEngineAdapter` 对象，实现 `DungeonCombatSystem.init(engine)` 所需的 `engine` 接口。

#### Scenario: adapter 提供 eventBus
- **WHEN** `MultiplayerEngineAdapter` 被创建
- **THEN** `adapter.eventBus` 引用 `gameStore.eventBus`（真实的 EventBus 实例）
- **AND** 支持 `emit`、`on`、`off`、`once`、`clear` 方法

#### Scenario: adapter 提供 stateManager.get('player')
- **WHEN** `DungeonCombatSystem` 调用 `engine.stateManager.get('player')`
- **THEN** 返回当前用户在多人队伍中的角色快照数据
- **AND** 数据格式与单人模式的 player state 一致（包含 id、name、classId、level、stats、skills、equipment 等字段）

#### Scenario: adapter 的 stateManager.set 为空操作
- **WHEN** `DungeonCombatSystem` 调用 `engine.stateManager.set('player', data)`
- **THEN** 不执行任何持久化操作
- **AND** 不修改本地存档

#### Scenario: adapter 的 getSystem 返回 null
- **WHEN** `DungeonCombatSystem` 调用 `engine.getSystem('combat')`
- **THEN** 返回 `null`
- **AND** 不抛出错误

#### Scenario: adapter 的 saveGame 为空操作
- **WHEN** `DungeonCombatSystem` 调用 `engine.saveGame()`
- **THEN** 不执行任何操作
- **AND** 不修改本地存档

---

### Requirement: 多人副本启动流程

客户端 SHALL 通过 `MultiplayerDungeonAdapter` 将服务端下发的数据转换为本地战斗。

#### Scenario: 接收服务端初始化数据
- **WHEN** 客户端收到 `battle:init` Socket 事件
- **THEN** 事件数据包含 `seed`（Number）、`partySnapshots`（Array）、`dungeonId`（String）
- **AND** `partySnapshots` 中每个元素包含角色完整数据（id、name、classId、level、stats、skills、equipment、isAI、ownerId）

#### Scenario: 构建队伍并启动战斗
- **WHEN** `MultiplayerDungeonAdapter` 收到初始化数据
- **THEN** 调用 `PartyFormationSystem.createDungeonPartyFromSnapshots(partySnapshots, dungeonData)` 构建队伍
- **AND** 设置 `RandomProvider` 种子为服务端下发的 `seed`
- **AND** 创建 `MultiplayerEngineAdapter` 并注入 `DungeonCombatSystem`
- **AND** 设置 `DungeonCombatSystem.autoPlayMode = true`
- **AND** 调用 `DungeonCombatSystem.startDungeonMultiplayer(dungeonId, party)` 启动战斗

#### Scenario: 场景切换
- **WHEN** 多人战斗启动
- **THEN** 调用 `gameStore.changeScene('dungeon')` 切换到副本场景
- **AND** `DungeonCombatView` 被渲染

---

### Requirement: PartyFormationSystem 快照构建方法

`PartyFormationSystem` SHALL 新增 `createDungeonPartyFromSnapshots()` 静态方法。

#### Scenario: 从快照构建队伍
- **WHEN** 调用 `createDungeonPartyFromSnapshots(snapshots, dungeonData)`
- **THEN** 为每个快照创建战斗用角色对象
- **AND** 每个角色包含 `id`、`name`、`classId`、`level`、`currentHp`、`maxHp`、`stats`、`skills`、`equipment`、`isPlayer`、`isAI`、`role`（tank/healer/dps）
- **AND** 角色按 PartyFormation 规则分配槽位（前排/后排）

#### Scenario: 真人玩家角色标记
- **WHEN** 快照中 `isAI === false`
- **THEN** 生成的角色 `isPlayer` 设为 `true`
- **AND** `isAI` 设为 `false`

#### Scenario: AI补位角色标记
- **WHEN** 快照中 `isAI === true`
- **THEN** 生成的角色 `isPlayer` 设为 `false`
- **AND** `isAI` 设为 `true`

---

### Requirement: 战斗结束上报

战斗结束后客户端 SHALL 向服务端上报结果。

#### Scenario: 胜利上报
- **WHEN** `DungeonCombatSystem` 触发 `dungeon:complete` 事件且结果为胜利
- **THEN** 客户端通过 Socket 发送 `battle:complete` 事件
- **AND** 数据包含 `{ result: 'victory', dungeonId, seed }`

#### Scenario: 失败上报
- **WHEN** `DungeonCombatSystem` 触发 `dungeon:complete` 事件且结果为失败
- **THEN** 客户端通过 Socket 发送 `battle:complete` 事件
- **AND** 数据包含 `{ result: 'defeat', dungeonId, seed }`

#### Scenario: 上报后等待掉落
- **WHEN** 客户端发送 `battle:complete` 且 `result === 'victory'`
- **THEN** 等待服务端返回 `battle:loot` 事件
- **AND** 收到后显示 `LootResultModal`

---

### Requirement: 服务端战斗初始化改造

服务端 SHALL 在房间开始战斗时仅下发初始化数据，不运行战斗模拟。

#### Scenario: 下发初始化数据
- **WHEN** 房间触发开始战斗（满员/手动/超时）
- **THEN** 服务端收集所有玩家快照 + AI补位快照
- **AND** 生成随机种子 `seed = Date.now()`
- **AND** 向房间广播 `battle:init` 事件：`{ seed, partySnapshots, dungeonId }`
- **AND** 不启动 `BattleEngine` 战斗循环

#### Scenario: 接收战斗结果
- **WHEN** 服务端收到任意客户端的 `battle:complete` 事件
- **THEN** 以第一个收到的结果为准（后续忽略）
- **AND** 如果 `result === 'victory'`，为每个在线真人玩家独立计算掉落
- **AND** 通过 `battle:loot` 单独推送给各玩家
- **AND** 广播 `battle:finished_server` 通知所有客户端战斗已结算

#### Scenario: 房间状态更新
- **WHEN** 服务端完成战斗结算
- **THEN** 房间状态从 `in_battle` 变为 `finished`
- **AND** 广播 `room:updated` 事件
