## MODIFIED Requirements

### Requirement: rooms 表结构
`rooms` 表 SHALL 包含以下字段：`id`（VARCHAR 36，UUID，主键）、`host_id`（INT UNSIGNED，关联 users.id）、`dungeon_id`（VARCHAR 128）、`dungeon_name`（VARCHAR 128）、`status`（ENUM 'waiting'|'in_battle'|'closed'，默认 'waiting'）、`max_players`（INT，默认 4）、`players`（JSON，存储玩家快照数组）、`battle_state`（JSON，可 NULL，存储战斗状态）、`rewards`（JSON，可 NULL，存储奖励清单）、`created_at`（DATETIME）、`battle_started_at`（DATETIME，可 NULL）、`closed_at`（DATETIME，可 NULL）。

#### Scenario: 表结构创建成功
- **WHEN** 执行包含 rooms 的迁移文件
- **THEN** `rooms` 表创建成功，status 字段有 ENUM 约束，包含 `battle_state` 和 `rewards` JSON 字段

### Requirement: 房间关闭时更新状态
系统 SHALL 在房间因超时、战斗结束或主动解散而关闭时，异步将 `rooms` 表对应记录的 status 更新为 'closed'，并记录 `closed_at` 时间戳；战斗结束时的奖励数据 SHALL 保留在 `rewards` 字段中，不删除。

#### Scenario: 超时关闭房间后状态变更
- **WHEN** waiting 房间的 2 分钟等待计时器超时
- **THEN** `rooms` 表中该房间的 status 变为 'closed'，closed_at 不为 NULL

#### Scenario: 战斗结束后房间关闭但奖励保留
- **WHEN** 房间战斗胜利，奖励已写入 `rewards` 字段，随后房间关闭
- **THEN** `rooms` 表中该房间的 status 变为 'closed'，`rewards` 字段包含完整的奖励数据

### Requirement: 服务启动时恢复 waiting 状态房间
系统 SHALL 在服务启动时，从 `rooms` 表查询所有 status='waiting' 且 created_at 在 2 分钟内的房间，将其恢复到 `RoomManager` 的内存 Map 中，并重新启动剩余时间的 waitTimer；超过 2 分钟的 waiting 房间 SHALL 被标记为 'closed'。

#### Scenario: 重启后 waiting 房间恢复到内存
- **WHEN** 服务重启时 `rooms` 表存在一条创建于 60 秒前 status='waiting' 的房间
- **THEN** 该房间被恢复到内存，waitTimer 以剩余 60 秒重新计时

#### Scenario: 过期 waiting 房间在重启时关闭
- **WHEN** 服务重启时 `rooms` 表存在一条创建于 3 分钟前 status='waiting' 的房间
- **THEN** 该房间 status 被更新为 'closed'，不恢复到内存

### Requirement: 战斗状态持久化
系统 SHALL 在 `in_battle` 状态的房间接收客户端 `battle:init`、`battle:update`、`battle:finished` 事件时，异步将战斗状态写入 `rooms.battle_state` JSON 字段；写库失败 SHALL 仅记录 console.error，不影响内存状态。

#### Scenario: 战斗开始时写入初始状态
- **WHEN** 客户端发送 `battle:init` 事件
- **THEN** `rooms.battle_state` 包含初始 seed 和 monster 配置

#### Scenario: 战斗进行中更新状态
- **WHEN** 客户端发送 `battle:update` 事件
- **THEN** `rooms.battle_state` 中的 `round`、`monsters`、`lastUpdated` 被更新

#### Scenario: 战斗结束时记录结果
- **WHEN** 客户端发送 `battle:finished` 事件
- **THEN** `rooms.battle_state` 中的 `result` 被更新为 'victory' 或 'defeat'

### Requirement: 断线重连时恢复战斗状态
系统 SHALL 在玩家断线重连到 `in_battle` 房间时，从数据库读取 `rooms.battle_state` 并通过 `battle:restore` 事件发送给重连玩家，确保重连玩家看到的怪物状态与在线玩家一致。

#### Scenario: 重连玩家收到战斗状态恢复
- **WHEN** 玩家断线后重连到 `in_battle` 房间
- **THEN** 系统发送 `battle:restore` 事件，payload 包含完整的 `battle_state` 数据
