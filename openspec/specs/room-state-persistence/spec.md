## Purpose

定义多人副本房间状态的数据库持久化要求，确保服务重启后 waiting 状态的房间可恢复，房间生命周期各阶段状态变更均异步写入数据库。

## Requirements

### Requirement: rooms 表结构
`rooms` 表 SHALL 包含以下字段：`id`（VARCHAR 36，UUID，主键）、`host_id`（INT UNSIGNED，关联 users.id）、`dungeon_id`（VARCHAR 128）、`dungeon_name`（VARCHAR 128）、`status`（ENUM 'waiting'|'in_battle'|'closed'，默认 'waiting'）、`max_players`（INT，默认 4）、`players`（JSON，存储玩家快照数组）、`created_at`（DATETIME）、`battle_started_at`（DATETIME，可 NULL）、`closed_at`（DATETIME，可 NULL）。

#### Scenario: 表结构创建成功
- **WHEN** 执行包含 rooms 的迁移文件
- **THEN** `rooms` 表创建成功，status 字段有 ENUM 约束

### Requirement: 创建房间时写入数据库
系统 SHALL 在 `RoomManager.createRoom()` 成功后，将房间元数据异步写入 `rooms` 表，status 为 'waiting'；写库失败 SHALL 不回滚已创建的内存房间，仅记录 console.error。

#### Scenario: 房间创建后数据库中有记录
- **WHEN** 玩家成功创建一个多人副本房间
- **THEN** `rooms` 表中新增一条 status='waiting' 的记录，id 与内存房间 id 一致

### Requirement: 玩家加入/离开房间时更新 players 快照
系统 SHALL 在 `RoomManager.joinRoom()` 和 `RoomManager.leaveRoom()` 后，异步更新 `rooms` 表中对应记录的 `players` JSON 字段；写库失败 SHALL 仅记录 console.error，不影响内存状态。

#### Scenario: 玩家加入后 players 快照更新
- **WHEN** 第二个玩家成功加入房间
- **THEN** `rooms` 表中该房间的 players 字段包含两个玩家的快照信息

### Requirement: 战斗开始时更新房间状态
系统 SHALL 在房间战斗启动时，异步将 `rooms` 表中对应记录的 status 更新为 'in_battle'，并记录 `battle_started_at` 时间戳。

#### Scenario: 战斗开始后状态变更
- **WHEN** 房间满员或倒计时结束触发战斗开始
- **THEN** `rooms` 表中该房间的 status 变为 'in_battle'，battle_started_at 不为 NULL

### Requirement: 房间关闭时更新状态
系统 SHALL 在房间因超时、战斗结束或主动解散而关闭时，异步将 `rooms` 表对应记录的 status 更新为 'closed'，并记录 `closed_at` 时间戳。

#### Scenario: 超时关闭房间后状态变更
- **WHEN** waiting 房间的 2 分钟等待计时器超时
- **THEN** `rooms` 表中该房间的 status 变为 'closed'，closed_at 不为 NULL

### Requirement: 服务启动时恢复 waiting 状态房间
系统 SHALL 在服务启动时，从 `rooms` 表查询所有 status='waiting' 且 created_at 在 2 分钟内的房间，将其恢复到 `RoomManager` 的内存 Map 中，并重新启动剩余时间的 waitTimer；超过 2 分钟的 waiting 房间 SHALL 被标记为 'closed'。

#### Scenario: 重启后 waiting 房间恢复到内存
- **WHEN** 服务重启时 `rooms` 表存在一条创建于 60 秒前 status='waiting' 的房间
- **THEN** 该房间被恢复到内存，waitTimer 以剩余 60 秒重新计时

#### Scenario: 过期 waiting 房间在重启时关闭
- **WHEN** 服务重启时 `rooms` 表存在一条创建于 3 分钟前 status='waiting' 的房间
- **THEN** 该房间 status 被更新为 'closed'，不恢复到内存

### Requirement: RoomManager 依赖注入 stmts
`RoomManager` 的构造函数 SHALL 接受可选的 `stmts` 参数；未传入时退化为纯内存模式（与现有行为一致），所有写库操作被跳过，现有单元测试 SHALL 不破坏。

#### Scenario: 无 stmts 时退化为纯内存模式
- **WHEN** `new RoomManager()` 不传 stmts
- **THEN** 房间创建、加入、关闭等流程正常，不调用任何数据库操作

### Requirement: 战斗启动时写入 battle_state（含 waves）
系统 SHALL 在 `launchBattle()` 执行时，将 `{ seed, snapshots, waves, currentWaveIndex: 0 }` 作为 `battle_state` 异步持久化到 `rooms` 表对应记录；写库失败 SHALL 仅记录 console.error，不中止战斗。`waves` 字段为 `WaveGenerator.generateWaves()` 返回的 `Wave[]` 序列化 JSON。

#### Scenario: 战斗启动后 battle_state 含 waves
- **WHEN** 房间战斗正常启动
- **THEN** `rooms` 表中该记录的 `battle_state` JSON 字段包含 `waves` 数组（长度 > 0）且 `currentWaveIndex` 为 0

#### Scenario: 写库失败不阻断战斗
- **WHEN** `stmts.saveBattleState.run` 调用抛出异常
- **THEN** `battle:init` 仍正常广播给客户端，`activeBattles` 中存在该 roomId 的 engine

### Requirement: battle:wave_progress 持久化 currentWaveIndex
系统 SHALL 在收到客户端 `battle:wave_progress` 事件时，将 `engine.battleState.currentWaveIndex` 更新为上报的 `waveIndex`，并异步持久化更新后的完整 `battleState`（含 `waves`）到 `rooms` 表；SHALL NOT 因此事件而更改 `waves` 数组内容。

#### Scenario: 上报波次后 currentWaveIndex 更新
- **WHEN** 客户端发送 `battle:wave_progress` `{ waveIndex: 2, totalWaves: 5 }`
- **THEN** `engine.battleState.currentWaveIndex` 为 2，数据库持久化包含该值

#### Scenario: waves 数组不因上报而改变
- **WHEN** 客户端发送 `battle:wave_progress`
- **THEN** `engine.battleState.waves` 数组长度与内容与战斗启动时相同

### Requirement: battle:restore 携带 waves 和 currentWaveIndex
系统 SHALL 在断线重连流程中，将从数据库读取的 `battle_state`（含 `waves` 和 `currentWaveIndex`）完整包含在 `battle:restore` 事件 payload 的 `battleState` 字段中；客户端 SHALL 可据此恢复到正确波次。

#### Scenario: 重连时 battle:restore 含 waves
- **WHEN** 玩家断线后重新加入处于 in_battle 状态的房间
- **THEN** 服务端向该 socket emit `battle:restore`，payload 中 `battleState.waves` 为非空数组，`battleState.currentWaveIndex` 与断线前最后一次 `battle:wave_progress` 上报的值一致

#### Scenario: 旧格式 battle_state（无 waves）重连降级
- **WHEN** 数据库中 `battle_state` 不含 `waves` 字段（旧数据行）
- **THEN** `battle:restore` 仍正常发送，`battleState.waves` 为 undefined 或缺失；客户端 `MultiplayerDungeonAdapter` 降级走原有 seed 逻辑，战斗不崩溃
