## ADDED Requirements

### Requirement: 大厅消息写入数据库
系统 SHALL 在每条大厅聊天消息广播成功后，异步将其写入 `chat_messages` 表（type='lobby'）；写库失败 SHALL 仅记录 console.error，不阻断消息广播。

#### Scenario: 大厅消息成功持久化
- **WHEN** 用户发送一条大厅聊天消息
- **THEN** 消息广播给所有在线玩家，且 `chat_messages` 表中新增一条 type='lobby' 记录

#### Scenario: 写库失败不影响广播
- **WHEN** 数据库不可用时用户发送大厅消息
- **THEN** 消息仍正常广播，服务端输出 console.error，不向客户端返回错误

### Requirement: 房间消息写入数据库
系统 SHALL 在每条房间聊天消息广播成功后，异步将其写入 `chat_messages` 表（type='room'），并记录关联的 `room_id`；写库失败 SHALL 仅记录 console.error，不阻断消息广播。

#### Scenario: 房间消息成功持久化
- **WHEN** 房间内玩家发送一条房间消息
- **THEN** 消息广播给房间内所有玩家，且 `chat_messages` 表中新增一条 type='room' 且 room_id 正确的记录

### Requirement: 服务启动时从数据库预加载大厅历史
系统 SHALL 在服务启动时，从 `chat_messages` 表中加载最近 50 条 type='lobby' 的消息到 `ChatManager` 的内存缓存，且按 timestamp 升序排列。

#### Scenario: 启动后历史消息可读
- **WHEN** 服务重启后新玩家连接大厅
- **THEN** 客户端能收到重启前最多 50 条大厅历史消息

#### Scenario: 数据库无历史时正常启动
- **WHEN** `chat_messages` 表为空时服务启动
- **THEN** 内存缓存为空数组，服务正常运行

### Requirement: chat_messages 表结构
`chat_messages` 表 SHALL 包含以下字段：`id`（自增主键）、`user_id`（用户 ID）、`nickname`（发送时的昵称快照，VARCHAR 64）、`content`（消息内容，VARCHAR 200）、`type`（'lobby' 或 'room'，VARCHAR 16）、`room_id`（可为 NULL，VARCHAR 64）、`timestamp`（BIGINT，毫秒时间戳）、`created_at`（DATETIME）。

#### Scenario: 大厅消息 room_id 为 NULL
- **WHEN** 插入一条 type='lobby' 的消息记录
- **THEN** 该记录的 room_id 字段值为 NULL

#### Scenario: 房间消息 room_id 不为 NULL
- **WHEN** 插入一条 type='room' 的消息记录
- **THEN** 该记录的 room_id 字段值为对应房间的 ID 字符串

### Requirement: ChatManager 依赖注入 stmts
`ChatManager` 的构造函数 SHALL 接受可选的 `stmts` 参数；未传入时退化为纯内存模式，所有写库操作被跳过，现有单元测试 SHALL 不破坏。

#### Scenario: 无 stmts 时退化为纯内存模式
- **WHEN** `new ChatManager()` 不传 stmts
- **THEN** 消息发送、广播流程正常，不调用任何数据库操作
