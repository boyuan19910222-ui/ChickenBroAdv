## Purpose

定义多人副本战斗结束后的奖励计算、存储和分发机制，确保玩家在战斗胜利后能获得相应的战利品，并支持延迟领取。

## Requirements

### Requirement: rooms 表包含 rewards 字段
`rooms` 表 SHALL 包含 `rewards`（JSON，可 NULL）字段，用于存储每个在线真人玩家的奖励清单。

#### Scenario: 表结构创建成功
- **WHEN** 执行添加 rewards 字段的迁移文件
- **THEN** `rooms` 表中存在 `rewards` JSON 字段，默认值为 NULL

### Requirement: 战斗胜利时生成奖励
系统 SHALL 在收到客户端 `battle:finished` 事件且 result 为 'victory' 时，调用 `BattleEngine.generatePersonalLoot()` 为每个在线真人玩家生成奖励，并将结果写入 `rooms.rewards` JSON 字段。

#### Scenario: 战斗胜利后奖励写入数据库
- **WHEN** 房间战斗胜利，3 名在线真人玩家完成战斗
- **THEN** `rooms.rewards` 字段包含 3 个键值对（userId → 奖励列表），每个玩家的奖励列表包含至少 1 件装备

#### Scenario: 战斗失败时不生成奖励
- **WHEN** 房间战斗失败（result 为 'defeat'）
- **THEN** `rooms.rewards` 字段保持 NULL，不生成任何奖励

### Requirement: 奖励仅分配给在线真人玩家
系统 SHALL 仅向 `isOnline=true` 且 `isAI=false` 的玩家分配奖励，AI 玩家和离线玩家 SHALL 不获得任何奖励。

#### Scenario: 离线玩家不获得奖励
- **WHEN** 战斗开始时有 2 名在线玩家，战斗中途 1 名玩家离线
- **THEN** `rooms.rewards` 仅包含 1 名在线玩家的奖励

#### Scenario: AI 玩家不获得奖励
- **WHEN** 房间内有 2 名真人玩家和 2 名 AI 玩家完成战斗
- **THEN** `rooms.rewards` 仅包含 2 名真人玩家的奖励，AI 玩家无奖励记录

### Requirement: 奖励生成幂等性
系统 SHALL 在 `rooms.rewards` 已存在（非 NULL）时拒绝重复生成奖励，防止重复领取。

#### Scenario: 重复调用不生成额外奖励
- **WHEN** `rooms.rewards` 已包含奖励数据，客户端再次发送 `battle:finished` 事件
- **THEN** 系统忽略该事件，不修改 `rooms.rewards`，不重复生成奖励

### Requirement: 奖励推送给玩家
系统 SHALL 在奖励写入数据库成功后，通过 `battle:reward` 事件向每个玩家推送其个人的奖励清单。

#### Scenario: 玩家收到奖励推送
- **WHEN** 奖励生成完成并写入数据库
- **THEN** 每个在线真人玩家收到 `battle:reward` 事件，payload 包含该玩家的 `userId` 和奖励列表

### Requirement: 断线重连后仍可领取奖励
系统 SHALL 支持玩家在断线重连后查询并领取 `rooms.rewards` 中存储的奖励，奖励 SHALL 不因玩家离线而丢失。

#### Scenario: 重连后查询奖励
- **WHEN** 玩家战斗胜利后离线，10 分钟后重连并查询房间奖励
- **THEN** 系统返回该玩家之前的奖励清单，奖励数据完整且可领取

#### Scenario: 战斗后离线玩家重连时房间已关闭
- **WHEN** 玩家战斗胜利后离线，房间因超时标记为 'closed'，玩家 later 重连
- **THEN** 系统通过独立的 API 接口或历史记录返回该玩家的奖励清单

### Requirement: 奖励数据结构
`rooms.rewards` JSON SHALL 使用 `userId` 作为键，奖励物品数组作为值，每个物品 SHALL 包含 `instanceId`、`name`、`quality`、`type` 等必需字段。

#### Scenario: 奖励数据结构验证
- **WHEN** 系统生成奖励并写入 `rooms.rewards`
- **THEN** 数据结构符合以下格式：
```json
{
  "1": [
    {
      "instanceId": "eq_123",
      "name": "巨神兵",
      "quality": "legendary",
      "type": "equipment"
    }
  ]
}
```
