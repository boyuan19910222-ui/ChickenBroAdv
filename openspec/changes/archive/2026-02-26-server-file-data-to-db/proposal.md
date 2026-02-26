## Why

服务端当前有三类数据仅存于运行时内存：大厅/房间聊天记录、多人副本房间状态、以及职业基础配置（硬编码在 `characters.js`）。服务进程一旦重启，聊天历史全部丢失、正在等待的房间消失、玩家体验断裂；职业配置改动还需修改代码并重新部署，无法热更新。将这三类数据迁移至 MySQL 可消除上述脆弱性，并为后续多节点横向扩展打下基础。

## What Changes

- **新增 `chat_messages` 表**：持久化大厅和房间聊天消息，替代 `ChatManager` 中的纯内存数组
- **新增 `class_configs` 表**：将 `characters.js` 内硬编码的 9 个职业配置（baseStats、growthPerLevel、baseSkills、resourceType、resourceMax）写入数据库，服务启动时加载缓存
- **新增 `rooms` 表**：持久化多人副本房间元数据（id、hostId、dungeonId、status、players 快照、时间戳），服务重启后可恢复 `waiting` 状态的房间
- **新增 Sequelize 模型**：`ChatMessage`、`ClassConfig`、`Room`
- **新增数据库迁移文件**：为三张新表创建 migration
- **ChatManager 改造**：写入/读取消息改为异步 DB 操作，保留内存缓存作 read-through 层（最近 50 条）
- **RoomManager 改造**：createRoom/joinRoom/closeRoom 同步写库；服务启动时从 DB 恢复 waiting 房间
- **characters.js 改造**：CLASS_CONFIG 和 EXP_TABLE 由启动时从 DB 加载，不再硬编码

## Capabilities

### New Capabilities

- `chat-persistence`: 聊天消息的数据库持久化能力——大厅和房间消息写入 `chat_messages` 表，带分页读取 API
- `class-config-table`: 职业配置入库能力——9 个职业的属性、技能、资源配置存入 `class_configs` 表，支持热加载刷新
- `room-state-persistence`: 房间状态持久化能力——多人副本房间生命周期（created/waiting/in_battle/closed）写入 `rooms` 表，重启后可恢复 waiting 房间

### Modified Capabilities

- `mysql-online-persistence`: 新增三张表的 schema 定义，扩展现有迁移体系

## Impact

**服务端代码**
- `server/chat.js` — `ChatManager` 所有消息读写方法变为异步，依赖注入 stmts
- `server/rooms.js` — `RoomManager` 构造函数接收 stmts，createRoom/joinRoom/leaveRoom/closeRoom 调用 DB
- `server/characters.js` — 移除顶层 `CLASS_CONFIG` 常量，改为 `loadClassConfigs(stmts)` 异步初始化
- `server/index.js` — 启动时调用 class config 加载、rooms 恢复逻辑
- `server/db.js` — 新增 `ChatMessage`、`ClassConfig`、`Room` 的 statement adapters

**数据库**
- 新增迁移文件（`server/migrations/`）：`chat_messages`、`class_configs`、`rooms` 三张表
- 新增 Sequelize 模型：`server/models/ChatMessage.js`、`ClassConfig.js`、`Room.js`

**依赖**
- 无新增 npm 依赖，复用现有 Sequelize + MySQL2 栈

**风险**
- `ChatManager` 和 `RoomManager` 方法签名变更（同步→异步），所有调用点需加 `await`
- `CLASS_CONFIG` 变为异步加载，`createInitialGameState` 不能再同步调用，需在路由初始化前完成加载
