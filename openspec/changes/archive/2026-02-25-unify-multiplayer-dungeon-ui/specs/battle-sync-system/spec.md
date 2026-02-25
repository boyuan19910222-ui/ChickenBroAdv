## MODIFIED Requirements

### Requirement: 权威服务器架构

战斗逻辑 SHALL 在客户端本地运行，服务端仅负责初始化数据下发和掉落结算。

#### Scenario: 客户端为战斗运行者
- **WHEN** 联机模式下发起副本战斗
- **THEN** 每个客户端本地创建并运行 `DungeonCombatSystem` 实例
- **AND** 使用服务端下发的统一种子确保确定性一致
- **AND** 服务端不运行任何战斗逻辑

#### Scenario: 服务端为数据中枢
- **WHEN** 联机模式下发起副本战斗
- **THEN** 服务端收集队伍快照、生成种子、下发 `battle:init` 事件
- **AND** 服务端等待客户端上报战斗结果
- **AND** 服务端根据结果计算掉落

---

### Requirement: 战斗生命周期

联机战斗 SHALL 遵循新的生命周期：服务端初始化 → 客户端本地战斗 → 客户端上报结果 → 服务端掉落结算。

#### Scenario: 战斗初始化
- **WHEN** 房间触发开始战斗
- **THEN** 服务端收集所有玩家快照 + AI 补位
- **AND** 生成种子 `seed = Date.now()`
- **AND** 广播 `battle:init` 事件：`{ seed, partySnapshots, dungeonId }`
- **AND** 不启动 BattleEngine 战斗循环

#### Scenario: 客户端本地战斗
- **WHEN** 客户端收到 `battle:init`
- **THEN** 本地创建 `DungeonCombatSystem` 实例
- **AND** 设置 `autoPlayMode = true`
- **AND** 使用服务端种子初始化 `RandomProvider`
- **AND** 自动执行完整战斗流程（所有encounter）

#### Scenario: 战斗结束上报
- **WHEN** 本地战斗完成
- **THEN** 客户端发送 `battle:complete` 事件给服务端
- **AND** 数据包含 `{ result, dungeonId, seed }`

#### Scenario: 服务端掉落结算
- **WHEN** 服务端收到 `battle:complete` 且 `result === 'victory'`
- **THEN** 为每个在线真人玩家独立计算掉落
- **AND** 通过 `battle:loot` 单独推送给各玩家

---

### Requirement: Socket.IO 事件协议（服务端 → 客户端）

服务端 SHALL 通过以下 Socket.IO 事件与客户端通信。

#### Scenario: battle:init 事件（替代原 battle:started）
- **WHEN** 战斗初始化完成
- **THEN** 向房间广播 `battle:init`
- **AND** 数据包含 `partySnapshots`（队伍快照数组）
- **AND** 数据包含 `dungeonId`（副本ID）
- **AND** 数据包含 `seed`（随机种子）

#### Scenario: battle:loot 事件（保持不变）
- **WHEN** 战斗胜利且掉落计算完成
- **THEN** 向每个在线玩家**单独**发送 `battle:loot`
- **AND** 数据包含 `items`（该玩家的个人掉落物品列表）

#### Scenario: battle:finished_server 事件
- **WHEN** 服务端完成掉落结算
- **THEN** 向房间广播 `battle:finished_server`
- **AND** 数据包含 `result`（'victory' 或 'defeat'）

#### Scenario: battle:playerDisconnected 事件（保持不变）
- **WHEN** 检测到玩家断线
- **THEN** 向房间广播 `battle:playerDisconnected`
- **AND** 数据包含 `userId` 和 `nickname`

---

### Requirement: Socket.IO 事件协议（客户端 → 服务端）

客户端 SHALL 通过以下事件向服务端上报状态。

#### Scenario: battle:complete 事件
- **WHEN** 客户端本地战斗结束
- **THEN** 发送 `battle:complete` 事件给服务端
- **AND** 数据包含 `{ result: 'victory'|'defeat', dungeonId, seed }`

---

### Requirement: 断线处理

玩家断线 SHALL NOT 影响其他客户端的本地战斗。

#### Scenario: 战斗中玩家断线
- **WHEN** 战斗进行中某玩家断开连接
- **THEN** 服务端标记该玩家 `isOnline = false`
- **AND** 广播 `battle:playerDisconnected`
- **AND** 其他客户端的本地战斗不受影响（该玩家的角色在所有客户端由AI控制，继续战斗）

#### Scenario: 断线玩家无掉落
- **WHEN** 服务端收到 `battle:complete` 且 `result === 'victory'`
- **AND** 某玩家 `isOnline === false`
- **THEN** 该玩家不计算掉落

---

### Requirement: 种子化随机数

所有客户端 SHALL 使用服务端下发的相同种子，确保战斗确定性一致。

#### Scenario: 种子分发
- **WHEN** 服务端生成 `battle:init` 数据
- **THEN** `seed` 字段传递给所有客户端

#### Scenario: 确定性保证
- **WHEN** 多个客户端使用相同 seed + 相同 partySnapshots + 相同 dungeonId
- **AND** 所有角色由 AI 自动决策（autoPlayMode = true）
- **THEN** 所有客户端的战斗过程和结果完全一致

---

### Requirement: 单机模式兼容

单机模式 SHALL 不受联机功能的任何影响。

#### Scenario: 单机模式行为不变
- **WHEN** 游戏模式为单人
- **THEN** 使用原有的 `startDungeon(dungeonId)` 入口
- **AND** `autoPlayMode` 保持 `false`
- **AND** 战斗逻辑在客户端本地运行
- **AND** 行为与本次变更前完全一致

---

## REMOVED Requirements

### Requirement: BroadcastEventBus
**Reason**: 战斗逻辑不再在服务端运行，无需通过 BroadcastEventBus 广播战斗事件
**Migration**: 服务端使用普通的 Socket.IO `io.to(roomId).emit()` 发送 `battle:init`、`battle:loot`、`battle:finished_server` 事件

### Requirement: DungeonCombatSystem 拆分
**Reason**: 战斗回到客户端运行，无需拆分为 Core/UI 层
**Migration**: 无需迁移，`DungeonCombatSystem` 保持当前结构

### Requirement: 客户端渲染模式
**Reason**: 客户端不再是纯渲染层，而是完整运行战斗逻辑
**Migration**: 客户端复用 `DungeonCombatView` 渲染本地运行的 `DungeonCombatSystem` 事件

### Requirement: 回合间延迟控制
**Reason**: 战斗在客户端本地运行，延迟由客户端自身控制（与单人模式一致），无需服务端控制延迟
**Migration**: 使用 `DungeonCombatSystem` 现有的行动间延迟机制
