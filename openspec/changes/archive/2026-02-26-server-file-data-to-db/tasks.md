## 1. 数据库迁移文件

- [x] 1.1 新建迁移文件 `server/migrations/20260226000001-create-chat-messages.js`，创建 `chat_messages` 表（id、user_id、nickname、content、type、room_id、timestamp、created_at），为 type 和 created_at 建立索引
- [x] 1.2 新建迁移文件 `server/migrations/20260226000002-create-class-configs.js`，创建 `class_configs` 表（id、class_id UNIQUE、name、base_stats JSON、growth_per_level JSON、base_skills JSON、resource_type、resource_max、created_at、updated_at）
- [x] 1.3 新建迁移文件 `server/migrations/20260226000003-create-rooms.js`，创建 `rooms` 表（id VARCHAR 36 主键、host_id、dungeon_id、dungeon_name、status ENUM、max_players、players JSON、created_at、battle_started_at、closed_at），为 status 建立索引
- [x] 1.4 新建迁移文件 `server/migrations/20260226000004-seed-class-configs.js`，将 9 个职业初始配置 UPSERT 至 `class_configs` 表（warrior、paladin、hunter、rogue、priest、shaman、mage、warlock、druid），实现 down() 回滚为 DELETE
- [x] 1.5 执行 `npx sequelize-cli db:migrate` 验证四个迁移均成功，无报错

## 2. Sequelize 模型

- [x] 2.1 新建 `server/models/ChatMessage.js`，字段与迁移文件一致，tableName='chat_messages'，timestamps=false
- [x] 2.2 新建 `server/models/ClassConfig.js`，字段与迁移文件一致，tableName='class_configs'，timestamps=false
- [x] 2.3 新建 `server/models/Room.js`，字段与迁移文件一致，tableName='rooms'，timestamps=false
- [x] 2.4 更新 `server/models/index.js`，导出 ChatMessage、ClassConfig、Room 三个新模型

## 3. db.js Statement Adapters

- [x] 3.1 在 `buildStatementAdapters()` 中新增 ChatMessage adapters：`insertChatMessage`（run）、`getLobbyHistory`（all，获取最近 N 条 type='lobby'）
- [x] 3.2 新增 ClassConfig adapters：`findAllClassConfigs`（all）、`upsertClassConfig`（run，供热刷新使用）
- [x] 3.3 新增 Room adapters：`insertRoom`（run）、`updateRoomPlayers`（run，更新 players 快照）、`updateRoomStatus`（run，更新 status + 对应时间戳）、`findWaitingRooms`（all，查询 status='waiting' 的房间）

## 4. 职业配置入库（class-config-table）

- [x] 4.1 在 `server/characters.js` 中添加模块级缓存变量 `_classConfigs`（初始为 null），及 `getClassConfig(classId)` 访问函数
- [x] 4.2 实现 `loadClassConfigs(stmts)` 异步函数：从 DB 加载全部职业配置，构建 classId→config 映射赋给 `_classConfigs`；表为空时抛出错误
- [x] 4.3 实现 `reloadClassConfigs(stmts)` 异步函数：重新加载后原子替换 `_classConfigs` 引用
- [x] 4.4 将 `createInitialGameState` 中直接引用 `CLASS_CONFIG[characterClass]` 改为调用 `getClassConfig(characterClass)`
- [x] 4.5 删除顶层 `CLASS_CONFIG` 常量对象（EXP_TABLE 保留）
- [x] 4.6 从 `server/characters.js` 导出 `loadClassConfigs` 和 `reloadClassConfigs`

## 5. 聊天持久化（chat-persistence）

- [x] 5.1 修改 `ChatManager` 构造函数，接受可选 `options.stmts` 参数，存为 `this._stmts`
- [x] 5.2 在 `handleSend` 大厅消息广播路径末尾，添加 write-behind：`this._stmts?.insertChatMessage.run(...)` 异步调用，catch 后仅 console.error
- [x] 5.3 在 `handleSend` 房间消息广播路径末尾，同样添加 write-behind，room_id 取自 `data.roomId`
- [x] 5.4 新增 `ChatManager.loadHistory(stmts)` 异步方法：调用 `stmts.getLobbyHistory.all(50)`，将结果逆序追加到 `this.lobbyMessages`（保持最旧→最新顺序）
- [x] 5.5 更新 `setupChat` 或在 `index.js` 启动时，将 `stmts` 传入 `ChatManager` 构造函数，并在 `app.listen` 前 `await chatManager.loadHistory(stmts)`

## 6. 房间状态持久化（room-state-persistence）

- [x] 6.1 修改 `RoomManager` 构造函数，接受可选 `options.stmts` 参数，存为 `this._stmts`
- [x] 6.2 在 `createRoom()` 成功后，添加 write-behind：`this._stmts?.insertRoom.run(...)` 异步写入房间元数据，catch 后仅 console.error
- [x] 6.3 在 `joinRoom()` 和 `leaveRoom()` 成功后，添加 write-behind：调用 `updateRoomPlayers` 更新 players 快照
- [x] 6.4 找到房间战斗启动触发点（`_onTimeout` 或 battle start 回调），添加 write-behind：调用 `updateRoomStatus(roomId, 'in_battle', { battle_started_at: new Date() })`
- [x] 6.5 在房间关闭路径（超时关闭、战斗结束关闭）添加 write-behind：调用 `updateRoomStatus(roomId, 'closed', { closed_at: new Date() })`
- [x] 6.6 新增 `RoomManager.recoverRooms(stmts)` 异步函数：从 DB 查询 waiting 房间，2 分钟内的恢复到内存并重启剩余 waitTimer，超期的更新 status 为 'closed'
- [x] 6.7 从 `server/rooms.js` 导出 `recoverRooms` 方法（或作为 RoomManager 实例方法）

## 7. 启动序列更新（index.js）

- [x] 7.1 在 `index.js` 中 import `loadClassConfigs` from `./characters.js`
- [x] 7.2 将 `ChatManager` 实例化改为传入 `{ stmts }`：`new ChatManager({ stmts })`
- [x] 7.3 将 `RoomManager` 实例化改为传入 `{ stmts, ... }`
- [x] 7.4 在 `httpServer.listen(...)` 前，顺序 await：`loadClassConfigs(stmts)` → `chatManager.loadHistory(stmts)` → `roomManager.recoverRooms(stmts)`
- [x] 7.5 为启动序列添加 try/catch，任一步骤失败时输出错误并 `process.exit(1)`

## 8. 验证与测试

- [ ] 8.1 运行现有单元测试（`npm test`），确认 ChatManager 和 RoomManager 无 stmts 时全部通过
- [ ] 8.2 为 `loadClassConfigs` 编写单元测试：mock stmts 返回 9 个职业数据，验证 `getClassConfig('warrior')` 返回正确 base_stats
- [ ] 8.3 为 `ChatManager` 写库路径编写单元测试：mock stmts.insertChatMessage，验证发送大厅消息时 run() 被调用；验证 DB 失败时广播仍成功
- [ ] 8.4 为 `RoomManager` 写库路径编写单元测试：mock stmts.insertRoom，验证 createRoom 后 run() 被调用；验证无 stmts 时不调用
- [ ] 8.5 为 `recoverRooms` 编写单元测试：mock stmts.findWaitingRooms 返回一条未过期房间和一条过期房间，验证前者入 Map、后者触发 updateRoomStatus('closed')
- [ ] 8.6 手动集成验证：启动服务，发送聊天消息后重启，确认历史消息恢复；创建房间后重启，确认房间恢复

