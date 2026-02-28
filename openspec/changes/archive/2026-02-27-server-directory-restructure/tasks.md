## 1. Setup - 创建目录结构

- [x] 1.1 创建新目录: `server/routes/`, `server/middleware/`, `server/services/`, `server/sockets/`, `server/utils/`
- [x] 1.2 移动 `server/middleware.js` 到 `server/middleware/index.js`
- [x] 1.3 移动 `server/db.js` 到 `server/utils/db.js`
- [x] 1.4 移动 `server/BroadcastEventBus.js` 到 `server/utils/BroadcastEventBus.js`
- [x] 1.5 移动 `server/rooms.js` 到 `server/services/RoomManager.js`
- [x] 1.6 移动 `server/chat.js` 到 `server/services/ChatService.js`
- [x] 1.7 移动 `server/BattleEngine.js` 到 `server/services/BattleEngine.js`
- [x] 1.8 移动 `server/WaveGenerator.js` 到 `server/services/WaveGenerator.js`
- [x] 1.9 更新所有 import 路径以反映新位置

## 2. Routes - 拆分路由模块

- [x] 2.1 创建 `server/routes/index.js` 路由聚合文件
- [x] 2.2 创建 `server/routes/client/index.js` 客户端路由聚合
- [x] 2.3 移动 `server/auth.js` 到 `server/routes/client/auth.js`
- [x] 2.4 移动 `server/characters.js` 到 `server/routes/client/characters.js`
- [x] 2.5 更新路由路径前缀为 `/api/v1/*`
- [x] 2.6 创建 `server/routes/admin/index.js` 管理后台路由（预留空结构）
- [x] 2.7 在 `server/index.js` 中挂载新路由

## 3. Middleware - 拆分中间件

- [x] 3.1 创建 `server/middleware/auth.js`，提取认证中间件
- [x] 3.2 创建 `server/middleware/errorHandler.js`，提取错误处理中间件
- [x] 3.3 更新 `server/middleware/index.js` 导出所有中间件

## 4. Sockets - 拆分 Socket 事件处理

- [x] 4.1 创建 `server/sockets/index.js` Socket 事件注册入口
- [x] 4.2 创建 `server/sockets/roomHandlers.js`，提取房间事件 (create, join, leave, start, list)
- [x] 4.3 创建 `server/sockets/battleHandlers.js`，提取战斗事件 (wave_progress, update, complete)
- [x] 4.4 创建 `server/sockets/chatHandlers.js`，提取聊天事件
- [x] 4.5 创建 `server/sockets/connectionHandler.js`，提取连接/断开/重连逻辑
- [x] 4.6 更新 `server/index.js` 使用新的 Socket 处理器

## 5. Entry - 精简入口文件

- [x] 5.1 重构 `server/index.js`，移除内联路由定义
- [x] 5.2 重构 `server/index.js`，移除内联 Socket 事件处理
- [x] 5.3 确保 `server/index.js` 只包含初始化和挂载逻辑
- [x] 5.4 添加注释说明各模块职责

## 6. Frontend - 前端适配

- [x] 6.1 定位前端 API 常量文件
- [x] 6.2 更新 API 路径前缀: `/api/auth` → `/api/v1/auth`
- [x] 6.3 更新 API 路径前缀: `/api/characters` → `/api/v1/characters`
- [x] 6.4 更新 API 路径前缀: `/api/me` → `/api/v1/me`
- [x] 6.5 验证 Socket.IO 事件名未变化

## 7. Verification - 验证和测试

- [x] 7.1 启动服务端，确认无启动错误
- [ ] 7.2 测试用户注册和登录 API
- [ ] 7.3 测试角色相关 API
- [ ] 7.4 测试 Socket.IO 连接和房间功能
- [ ] 7.5 测试多人战斗流程
- [ ] 7.6 确认数据库操作正常
