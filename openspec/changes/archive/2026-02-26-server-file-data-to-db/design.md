## Context

当前服务端有三类数据仅驻留于运行时内存，不具备持久化：

1. **聊天记录**（`ChatManager`）：大厅消息存于 `lobbyMessages[]`，房间消息存于 `roomMessages Map`，服务重启后全部丢失，也无法在多进程间共享
2. **多人房间状态**（`RoomManager`）：房间信息存于 `rooms Map`，服务重启后 waiting 状态的房间消失，已连接的玩家找不回自己的房间
3. **职业配置**（`characters.js`）：9 个职业的 `CLASS_CONFIG` 和 `EXP_TABLE` 硬编码为 JS 常量，每次调整平衡性必须修改代码重新部署

数据库层已使用 MySQL + Sequelize（`server/models/`），现有 `users`、`characters`、`battle_records` 三张表，迁移基础设施完备（`server/migrations/`）。

---

## Goals / Non-Goals

**Goals:**
- 将聊天消息持久化到 `chat_messages` 表，服务重启后仍可读取最近历史
- 将职业配置写入 `class_configs` 表，运行时热加载，无需重新部署即可调整
- 将房间元数据写入 `rooms` 表，服务启动时恢复 `waiting` 状态的房间，避免玩家白等
- 保持现有 API 和 Socket.IO 事件协议不变，客户端零改动
- 新增三张表的 Sequelize 模型和数据库迁移文件

**Non-Goals:**
- 不解构 `game_state` JSON 大字段（范围较大，另立 change）
- 不实现多节点 Redis Pub/Sub（当前单节点足够，水平扩展下一阶段解决）
- 不为聊天消息提供搜索或全文索引
- 不持久化 `activeBattles`（战斗引擎是计算密集型临时状态，无需恢复）
- 不改变现有 `users`、`characters`、`battle_records` 表结构

---

## Decisions

### D1：ChatManager 采用 write-behind + read-through 内存缓存

**决定**：消息写入时同时存库（write-behind 异步，失败仅记录告警不阻断发送）；初始化时从 DB 加载最近 `maxLobbyMessages`（50）条到内存缓存，后续读取直接命中缓存。

**理由**：聊天消息是高频短时写操作，同步等待 DB 确认会引入延迟；内存缓存保证广播路径零延迟；50 条限制与现有行为一致。

**替代方案**：全量同步写库（等待确认），会增加消息发送 P99 延迟；纯 DB 轮询（去掉内存缓存），每次广播需查一次 DB，性能不可接受。

---

### D2：CLASS_CONFIG 启动时一次性加载，缓存于模块变量

**决定**：服务启动时调用 `loadClassConfigs(stmts)` 从 `class_configs` 表加载，结果缓存在 `characters.js` 的模块作用域变量 `_classConfigs`。支持 `reloadClassConfigs()` 接口用于热刷新（管理员 API 调用或测试用）。

**理由**：职业配置是读多写极少的静态参考数据，不需要每次请求都查库。启动加载模式与现有硬编码常量的使用方式一致，调用方只需等启动完成，无需改动路由逻辑。

**替代方案**：每次请求时 lazy-load 并加 TTL 缓存，复杂度更高且收益有限；保留硬编码常量 + DB 作备份，维护两份数据源容易失步。

---

### D3：初始 class_configs 数据通过 seed migration 写入

**决定**：新增一个独立的 seed 迁移文件（`20260226000001-seed-class-configs.js`），将当前 `CLASS_CONFIG` 常量的值作为初始数据 INSERT 到 `class_configs` 表。

**理由**：迁移文件天然具备版本控制和幂等性（Sequelize migrations），适合作为初始数据入口；避免在应用启动时做"如果不存在则插入"的逻辑，简化启动流。

**替代方案**：在 `index.js` 启动时 upsert，会在每次启动增加一次写操作；单独的 seed 脚本，与迁移体系割裂。

---

### D4：RoomManager 持久化房间元数据，不持久化实时战斗状态

**决定**：`rooms` 表存储房间生命周期元数据（id、hostId、dungeonId、status、players JSON 快照、createdAt、closedAt）。`in_battle` 及之后的战斗事件仍只在内存中；服务启动时仅恢复 `waiting` 状态房间（重置其 waitTimer）。

**理由**：战斗状态实时性强、数据量大（每个 tick 都在变），持久化成本高且恢复意义有限；`waiting` 房间数据量小、恢复价值高（玩家还可以连回来继续等待）。

**替代方案**：持久化完整战斗状态（过于复杂，战斗引擎不支持序列化恢复）；完全不持久化房间（维持现状，不解决重启问题）。

---

### D5：RoomManager 通过依赖注入接收 stmts

**决定**：`RoomManager` 构造函数接受可选的 `stmts` 参数（与 `ChatManager` 保持一致）。未传入时退化为纯内存模式，保证现有单元测试不破坏。

**理由**：与项目现有的 `createAuthRouter(stmts)`、`createCharactersRouter(stmts)` 模式完全一致，测试可注入 mock stmts。

---

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| `CLASS_CONFIG` 变为异步加载，`createInitialGameState` 在加载完成前被调用 | `index.js` 在 `app.listen` 前完成 `await loadClassConfigs(stmts)`，路由注册在加载后进行 |
| `ChatManager` 写库失败导致消息丢失但用户已看到广播 | write-behind 失败仅 console.error 告警，可接受（聊天消息非关键数据）；后续可接入告警系统 |
| `rooms` 表恢复逻辑恢复了一个已无玩家连接的房间 | 恢复后的房间继续倒计时，超时后自动关闭并标记 `closed`，与正常流程一致 |
| 新增三张表的迁移文件与已有迁移文件冲突 | 使用 `20260226000000+序号` 时间戳命名，确保在现有迁移之后执行 |
| `players` 快照字段存 JSON，玩家断线重连后快照可能过时 | `rooms` 表的 players 字段仅用于 UI 展示（人数、职业），不用于权威游戏状态，可接受 |

---

## Migration Plan

1. 执行新增的数据库迁移（`npx sequelize-cli db:migrate`）创建 `chat_messages`、`class_configs`、`rooms` 三张表
2. 执行 seed 迁移，将 9 个职业初始配置写入 `class_configs`
3. 部署新版服务端代码（`ChatManager`、`RoomManager`、`characters.js` 已更新）
4. 服务启动时自动调用 `loadClassConfigs()` 和 `recoverRooms()`

**回滚：**
- 代码回滚到上一版本即可（旧代码不依赖新表）
- 三张新表可保留或通过 `db:migrate:undo` 删除，不影响现有数据

---

## Open Questions

- `class_configs` 是否需要管理员编辑 REST API？（当前先做读取+seed，管理 API 另立 change）
- 聊天历史分页 API 是否对客户端暴露？（客户端当前无历史加载需求，暂不暴露）
- `rooms` 表是否需要归档（定期软删除 closed 状态超过 7 天的记录）？（数据量小，暂不清理）
