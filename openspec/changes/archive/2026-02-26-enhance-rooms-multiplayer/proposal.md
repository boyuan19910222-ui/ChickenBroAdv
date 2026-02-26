## Why

多人副本房间存在两个关键 bug 影响游戏体验：(1) 副本结束后玩家无法获得奖励，导致多人副本收益缺失；(2) 玩家断线重连后，虽然 room ID 相同，但看到的怪物状态不一致，导致无法正常协作。这些问题需要通过扩展 rooms 表的持久化能力和实现奖励分发机制来解决。

## What Changes

- 扩展 `rooms` 表结构，增加 `battle_state` 字段（JSON）用于持久化战斗状态（怪物数据、位置、血量等）
- 扩展 `rooms` 表结构，增加 `rewards` 字段（JSON）用于存储副本完成后的奖励数据
- 实现战斗状态同步机制，确保所有玩家看到相同的怪物状态
- 实现副本奖励分发系统，战斗结束后将奖励分配给所有在线玩家
- 实现断线重连时的状态恢复逻辑，重连玩家从 `rooms` 表读取最新的战斗状态
- 更新 `room-state-persistence` spec，增加战斗状态持久化要求

## Capabilities

### New Capabilities
- `battle-rewards-distribution`: 定义多人副本战斗结束后的奖励计算、存储和分发机制
- `battle-state-synchronization`: 定义战斗状态（怪物、位置、血量等）的持久化和同步要求，确保所有玩家看到的战斗状态一致

### Modified Capabilities
- `room-state-persistence`: 扩展 rooms 表结构，增加 `battle_state` 和 `rewards` 字段；增加战斗状态持久化和恢复的 REQUIREMENTS

## Impact

- **Database**: 需要执行数据库迁移，为 `rooms` 表添加 `battle_state` (JSON) 和 `rewards` (JSON) 字段
- **Backend**: 修改 `RoomManager` 类，增加战斗状态同步和奖励分发逻辑
- **Reconnection**: 修改重连处理流程，从数据库恢复战斗状态而非重新生成
- **Existing Tests**: 部分单元测试需要更新以适应新的表结构
