## Purpose

定义战斗状态（怪物、位置、血量等）的持久化和同步要求，确保所有玩家看到的战斗状态一致，支持断线重连后的状态恢复。

## Requirements

### Requirement: 战斗状态持久化到 battle_state 字段
系统 SHALL 将战斗状态（包括 seed、round、monsters、result、lastUpdated）持久化到 `rooms.battle_state` JSON 字段。

#### Scenario: 战斗开始时写入初始状态
- **WHEN** 客户端发送 `battle:init` 事件
- **THEN** 系统将初始 seed 和 monster 配置写入 `rooms.battle_state`

#### Scenario: 战斗进行中更新状态
- **WHEN** 客户端发送 `battle:update` 事件（包含当前 round 和 monster 状态）
- **THEN** 系统更新 `rooms.battle_state` 中的 `round`、`monsters` 和 `lastUpdated`

#### Scenario: 战斗结束时记录结果
- **WHEN** 客户端发送 `battle:finished` 事件
- **THEN** 系统更新 `rooms.battle_state` 中的 `result` 为 'victory' 或 'defeat'

### Requirement: battle_state 数据结构
`rooms.battle_state` JSON SHALL 包含以下字段：`seed`（number，随机种子）、`round`（number，当前回合数）、`result`（string|null，战斗结果）、`monsters`（array，怪物列表）、`lastUpdated`（string，ISO 8601 时间戳）。

#### Scenario: battle_state 结构验证
- **WHEN** 系统写入战斗状态
- **THEN** 数据结构符合以下格式：
```json
{
  "seed": 1234567890,
  "round": 12,
  "result": null,
  "monsters": [
    {
      "id": "mob_1",
      "templateId": "goblin",
      "hp": 150,
      "maxHp": 200,
      "position": { "x": 300, "y": 400 },
      "isBoss": false
    }
  ],
  "lastUpdated": "2026-02-26T12:00:00Z"
}
```

### Requirement: 战斗状态单调递进更新
系统 SHALL 仅接受 round 比当前 `battle_state.round` 更新的 `battle:update` 事件，防止旧状态覆盖新状态。

#### Scenario: 接受更新的 round
- **WHEN** 当前 `battle_state.round` 为 10，收到 `battle:update` 事件 round 为 11
- **THEN** 系统接受更新并写入数据库

#### Scenario: 拒绝过时的 round
- **WHEN** 当前 `battle_state.round` 为 15，收到 `battle:update` 事件 round 为 12
- **THEN** 系统拒绝该更新，不修改 `battle_state`

### Requirement: 断线重连时同步战斗状态
系统 SHALL 在玩家断线重连时（`joinRoom` 检测到玩家已存在且房间状态为 `in_battle`），从数据库读取 `battle_state` 并通过 `battle:restore` 事件发送给重连玩家。

#### Scenario: 重连玩家收到战斗状态恢复
- **WHEN** 玩家断线后重连，房间状态为 `in_battle`
- **THEN** 系统发送 `battle:restore` 事件，payload 包含 `battle_state` JSON 数据

#### Scenario: 重连到战斗已结束的房间
- **WHEN** 玩家重连时 `battle_state.result` 为 'victory'
- **THEN** 系统发送 `battle:restore` 事件，包含完整的 `battle_state` 和奖励信息

### Requirement: 重连玩家看到与在线玩家一致的状态
系统 SHALL 确保重连玩家从 `battle_state` 恢复的怪物状态（位置、血量、数量）与当前数据库中的状态完全一致。

#### Scenario: 重连后怪物状态一致
- **WHEN** 玩家 A 在线，玩家 B 断线，此时怪物血量为 50/200，玩家 B 重连
- **THEN** 玩家 B 收到的 `battle:restore` 事件中怪物血量为 50/200，与玩家 A 看到的状态一致

### Requirement: 战斗状态更新异步写入
系统 SHALL 使用 write-behind 模式异步更新 `battle_state`，写入失败 SHALL 不影响内存状态，仅记录 console.error。

#### Scenario: 更新失败不影响战斗
- **WHEN** `battle:update` 事件处理时数据库写入失败
- **THEN** 内存中的战斗状态继续正常更新，仅记录错误日志

### Requirement: 战斗状态仅 in_battle 房间有效
系统 SHALL 仅在房间状态为 `in_battle` 时处理 `battle:init`、`battle:update`、`battle:finished` 事件，`waiting` 或 `closed` 状态的房间 SHALL 拒绝这些事件。

#### Scenario: waiting 状态拒绝战斗事件
- **WHEN** 房间状态为 'waiting'，客户端发送 `battle:init` 事件
- **THEN** 系统返回错误，不处理该事件

#### Scenario: closed 状态拒绝战斗事件
- **WHEN** 房间状态为 'closed'，客户端发送 `battle:update` 事件
- **THEN** 系统返回错误，不处理该事件

### Requirement: 战斗状态同步 WebSocket 事件
系统 SHALL 定义并处理以下 WebSocket 事件：`battle:init`（客户端发起战斗初始化）、`battle:update`（客户端上报战斗状态更新）、`battle:finished`（客户端上报战斗结束）、`battle:restore`（服务端推送恢复的战斗状态）。

#### Scenario: battle:init 事件处理
- **WHEN** 客户端发送 `battle:init` 事件（包含 seed 和初始 monster 配置）
- **THEN** 系统将初始状态写入 `battle_state`，并广播 `battle:event` 给所有玩家

#### Scenario: battle:finished 事件处理
- **WHEN** 客户端发送 `battle:finished` 事件（包含 result）
- **THEN** 系统更新 `battle_state.result`，生成奖励，广播 `battle:finished` 事件

#### Scenario: battle:restore 事件推送
- **WHEN** 玩家重连到 `in_battle` 房间
- **THEN** 系统向该玩家发送 `battle:restore` 事件（仅该玩家接收）
