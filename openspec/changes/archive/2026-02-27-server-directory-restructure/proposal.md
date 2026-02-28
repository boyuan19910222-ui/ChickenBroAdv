## Why

当前服务端目录结构较为混乱，所有文件平铺在 `server/` 目录下，缺乏清晰的模块划分。路由定义、中间件、业务逻辑混杂在 `index.js` 中（近600行），难以维护和扩展。同时，前端用户 API 和后台管理 API 没有明确区分，不便于后续添加管理后台功能。

## What Changes

### 目录结构重组
- 将 `server/` 目录按职责划分为清晰的子目录：
  - `routes/` - 路由定义，区分 `client/`（前端用户）和 `admin/`（后台管理）
  - `middleware/` - 中间件（认证、错误处理等）
  - `models/` - 数据模型（已有，保持）
  - `migrations/` - 数据库迁移（已有，保持）
  - `services/` - 业务逻辑服务层
  - `utils/` - 工具函数
  - `config/` - 配置文件（已有，保持）
  - `sockets/` - Socket.IO 事件处理

### 路由分层
- **BREAKING** API 路径调整：
  - 前端用户接口: `/api/v1/*` (如 `/api/v1/auth`, `/api/v1/characters`)
  - 后台管理接口: `/api/admin/*` (如 `/api/admin/users`, `/api/admin/rooms`)

### 入口文件精简
- 将 `index.js` 中的路由、Socket 事件处理逻辑拆分到独立模块
- 主入口文件只负责应用初始化和模块挂载

## Capabilities

### New Capabilities

- `server-directory-structure`: 服务端目录结构规范，定义各模块的职责边界和目录组织方式
- `api-route-layering`: API 路由分层，区分前端用户路由和后台管理路由

### Modified Capabilities

无。此次变更为纯重构，不改变现有 API 行为（仅调整路径前缀）。

## Impact

### 受影响代码
- `server/index.js` - 拆分为多个模块
- `server/auth.js` - 移动到 `routes/client/auth.js`
- `server/characters.js` - 移动到 `routes/client/characters.js`
- `server/middleware.js` - 移动到 `middleware/` 目录
- `server/rooms.js`, `server/chat.js`, `server/BattleEngine.js` - 移动到 `services/` 目录
- `server/WaveGenerator.js`, `server/BroadcastEventBus.js` - 移动到 `services/` 或 `utils/`

### 前端影响
- 需要更新 API 请求路径（添加 `/v1` 前缀）
- Socket.IO 事件名保持不变

### 依赖
- 无新增外部依赖
- 需要更新 `package.json` 中的入口文件路径（如有）
