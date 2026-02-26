## Context

### Current State

多人副本房间系统目前基于内存管理，`rooms` 表仅存储房间元数据（id、status、players 快照等）。战斗状态和奖励数据未持久化，导致以下问题：

1. **奖励缺失**: `BattleEngine.generatePersonalLoot()` 方法存在，但战斗结束后未调用，奖励未分配给玩家
2. **状态不同步**: 玩家断线重连时，虽然 room ID 相同，但看到的怪物状态不一致，因为客户端各自生成战斗状态
3. **`battle_state` 列未使用**: 虽然数据库已有 `battle_state` 列（通过迁移添加），但未实际写入和读取

### Constraints

- 客户端已实现 `DungeonCombatSystem`（autoPlayMode）进行战斗模拟，服务端不应重新实现回合制战斗循环
- 现有 `RoomManager` 已有依赖注入机制（`stmts` 参数）用于数据库操作，应继续沿用
- 奖励分发应只分配给**在线真人玩家**，AI 玩家和离线玩家不应获得奖励
- 断线重连应恢复与当前战斗进度一致的**完全相同的状态**（相同的怪物、位置、血量、seed）

## Goals / Non-Goals

### Goals

1. **战斗状态持久化**: 将战斗状态（怪物数据、seed、回合数、战斗结果）持久化到 `rooms.battle_state`
2. **奖励分发**: 战斗胜利后为每个在线真人玩家生成奖励并存储到 `rooms.rewards`
3. **重连状态同步**: 玩家断线重连时，从数据库读取 `battle_state` 并同步给客户端，确保所有玩家看到一致的状态
4. **最小化代码变更**: 扩展现有 `RoomManager` 和 `BattleEngine`，避免大规模重构

### Non-Goals

- **完整服务端战斗模拟**: 不在服务端重新实现回合制战斗逻辑，战斗模拟继续由客户端负责
- **离线玩家奖励**: 离线玩家断开期间获得的战利品不应累积，重连后仅获得当前可领取的奖励
- **回放功能**: 不支持战斗过程回放，仅支持状态快照恢复

## Decisions

### Decision 1: 战斗状态数据结构

**Choice**: 使用 JSON 存储战斗状态快照

`rooms.battle_state` JSON 结构：
```json
{
  "seed": 1234567890,
  "round": 12,
  "result": null,            // null (进行中) | "victory" (胜利) | "defeat" (失败)
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

**Rationale**:
- JSON 灵活，支持未来扩展（新增怪物属性、效果等）
- MySQL 的 JSON 类型支持索引和部分更新，性能可接受
- 客户端可直接使用，无需序列化转换

**Alternatives considered**:
- 关联表 `battle_monsters`: 结构更规范，但需要额外 JOIN 操作，增加复杂度
- Redis 缓存: 性能更好，但需要额外依赖，且与现有 MySQL 持久化架构不一致

---

### Decision 2: 奖励数据结构

**Choice**: 在 `rooms.rewards` 中存储每个玩家的奖励清单

`rooms.rewards` JSON 结构：
```json
{
  "1": [
    { "instanceId": "eq_123", "name": "巨神兵", "quality": "legendary", "type": "equipment" }
  ],
  "2": [
    { "instanceId": "eq_456", "name": "秘银护腕", "quality": "rare", "type": "equipment" }
  ]
}
```

Key → `userId`, Value → 该玩家的奖励列表

**Rationale**:
- 奖励生成后立即存储，防止服务重启丢失
- 支持延迟领取：玩家即使战斗后离线，下次登录仍可领取
- 简化查询逻辑：一次查询即可获取所有玩家的奖励

**Alternatives considered**:
- 关联表 `battle_rewards`: 更规范，但需要额外查询和 JOIN
- 发送后不存储: 简单，但玩家掉线后会丢失奖励

---

### Decision 3: 战斗状态同步机制

**Choice**: 客户端定期上报战斗状态，服务端持久化到数据库

**流程**:
1. 客户端战斗开始时，向服务端发送 `battle:init` 事件（包含初始 seed）
2. 服务端将初始状态写入 `rooms.battle_state`
3. 客户端每回合结束时，发送 `battle:update` 事件（包含当前 monster 状态、round）
4. 服务端更新 `rooms.battle_state`
5. 战斗结束时，客户端发送 `battle:finished` 事件（包含 result）
6. 服务端调用 `BattleEngine.generatePersonalLoot()` 生成奖励，写入 `rooms.rewards`
7. 服务端通过 `battle:reward` 事件向各玩家推送奖励

**Rationale**:
- 服务端作为"权威源"，确保所有玩家看到相同的状态
- 客户端自主模拟战斗，减少服务端计算压力
- 定期同步而非实时同步，减少网络开销

**Alternatives considered**:
- 服务端完全控制战斗: 需要重新实现完整战斗逻辑，工作量大
- 完全去中心化（P2P）: 无法防止作弊，且断线重连无法恢复

---

### Decision 4: 断线重连处理

**Choice**: 重连玩家从数据库读取 `battle_state` 并同步

**流程**:
1. 玩家重连时，`RoomManager.joinRoom()` 检测到玩家已存在
2. 如果房间状态为 `in_battle`，从数据库读取 `battle_state`
3. 将 `battle_state` 通过 `battle:restore` 事件发送给重连玩家
4. 客户端接收后，根据恢复的状态初始化战斗场景

**Rationale**:
- 确保重连玩家看到的怪物状态与在线玩家一致
- 数据库作为单点真理，避免状态不一致

**Alternatives considered**:
- 请求在线玩家同步状态: 增加在线玩家负担，且复杂度高
- 完全重新开始战斗: 用户体验差，之前的战斗进度丢失

---

### Decision 5: 数据库迁移策略

**Choice**: 新增迁移文件添加 `rewards` 列，复用已有的 `battle_state` 列

**迁移内容**:
```javascript
// 20260226000006-add-rewards-to-rooms.js
await queryInterface.addColumn('rooms', 'rewards', {
    type:         Sequelize.JSON,
    allowNull:    true,
    defaultValue: null,
    after:        'battle_state',
})
```

**Rationale**:
- `battle_state` 列已存在，无需添加
- `rewards` 列新增，用于存储奖励数据
- 迁移幂等，可重复执行

**Rollback 策略**:
- 执行 `sequelize db:migrate:undo` 回滚最后一次迁移
- 回滚前先确认无活跃战斗（或标记房间为 closed）

---

## Risks / Trade-offs

### Risk 1: 战斗状态同步延迟导致状态不一致

**Description**: 客户端上报的战斗状态可能因网络延迟到达时间不同，导致数据库中的状态不是最新

**Mitigation**:
- 客户端使用单调递增的 round number，服务端只接受比当前更新的状态
- 服务端更新 `battle_state` 时同时更新 `lastUpdated` 时间戳
- 客户端重连时优先使用最新 `lastUpdated` 的状态

---

### Risk 2: 奖励重复生成

**Description**: 如果客户端多次发送 `battle:finished` 事件，可能导致奖励重复生成

**Mitigation**:
- 在 `rooms.rewards` 非空时拒绝重复生成奖励
- 添加 `rewards_generated` 标志位（可选），明确记录奖励是否已生成

---

### Risk 3: 数据库写入失败导致状态丢失

**Description**: 战斗状态写入数据库失败，可能导致重连时无法恢复

**Mitigation**:
- 采用 write-behind 模式，写入失败不影响内存状态，仅记录日志
- 内存中保留最新状态，数据库写入异步重试
- 关键数据（奖励）写入成功后才广播给玩家

---

### Trade-off 1: JSON 列性能 vs 灵活性

**Description**: JSON 列查询和更新性能低于关系型设计，但提供了更高的灵活性

**Impact**: 可接受的，因为 `battle_state` 查询频率较低（仅在重连时），且 MySQL 8.0+ 对 JSON 支持良好

---

### Trade-off 2: 客户端自主战斗 vs 服务端权威

**Description**: 客户端自主模拟战斗减少服务端负担，但增加了作弊风险

**Impact**: 当前阶段可接受，如需严格防作弊，未来可引入服务端校验机制

---

## Migration Plan

### 部署步骤

1. **数据库迁移**
   ```bash
   sequelize db:migrate  # 执行添加 rewards 列的迁移
   ```

2. **代码部署**
   - 更新 `RoomManager.js`，添加 `battle_state` 和 `rewards` 的读写逻辑
   - 更新 `BattleEngine.js`，添加 `generatePersonalLoot()` 的调用时机
   - 更新 WebSocket 事件处理，添加 `battle:init`、`battle:update`、`battle:finished`、`battle:restore` 事件

3. **服务重启**
   - 重启服务，确保新的迁移生效

4. **验证**
   - 测试副本开始、进行中、结束的完整流程
   - 测试断线重连功能
   - 验证奖励分发

### Rollback 策略

1. **快速回滚**（代码层面）
   - 回滚到部署前的代码版本
   - 服务重启后回退到原有行为（无奖励、无状态同步）

2. **数据回滚**（数据库层面）
   ```bash
   sequelize db:migrate:undo  # 回滚添加 rewards 列的迁移
   ```

3. **回滚前确认**
   - 确认无活跃的 `in_battle` 房间
   - 将 `in_battle` 房间标记为 `closed`

---

## Open Questions

1. **Q**: 战斗状态更新频率是多少？每回合还是每 N 秒？
   - **A**: 初步定为每回合结束时更新，如性能有问题可考虑节流（如每 3-5 秒汇总更新）

2. **Q**: 离线玩家重连后，是否补发断线期间的奖励？
   - **A**: 不补发，仅领取当前可领取的奖励。离线期间如果战斗结束，奖励已存储在 `rooms.rewards` 中，重连后可领取。

3. **Q**: 如果房间战斗期间所有玩家都离线，房间何时关闭？
   - **A**: 可设置超时时间（如 10 分钟），超时后标记房间为 `closed`，`battle_state` 和 `rewards` 保留以供查询。
