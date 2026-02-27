## Context

### 当前状态
```
server/
├── index.js              # 主入口，约600行，包含路由、Socket事件、业务逻辑
├── auth.js               # 认证路由
├── characters.js         # 角色路由
├── middleware.js         # 中间件
├── rooms.js              # 房间管理
├── chat.js               # 聊天功能
├── BattleEngine.js       # 战斗引擎
├── WaveGenerator.js      # 波次生成
├── BroadcastEventBus.js  # 事件广播
├── db.js                 # 数据库访问
├── config.js             # 配置
├── config/               # 配置目录
├── models/               # Sequelize 模型
├── migrations/           # 数据库迁移
└── data/                 # SQLite 数据文件
```

### 约束
- 使用 Express.js + Socket.IO
- 数据库已迁移到 MySQL (Sequelize ORM)
- 前端使用 Vue.js，API 调用需同步更新
- 保持 Socket.IO 事件名不变，避免前端大量改动

## Goals / Non-Goals

**Goals:**
- 建立清晰的目录结构，按职责分离模块
- 区分前端用户 API (`/api/v1/*`) 和后台管理 API (`/api/admin/*`)
- 将 `index.js` 拆分为可维护的小模块
- 保持现有功能和 Socket.IO 事件不变

**Non-Goals:**
- 不重构业务逻辑本身，只做目录和模块拆分
- 不实现后台管理功能（仅预留路由结构）
- 不改变数据库模型或迁移

## Decisions

### D1: 目录结构设计

**决定**: 采用按职责分层的目录结构

```
server/
├── index.js                    # 精简入口（初始化 + 模块挂载）
├── routes/
│   ├── index.js                # 路由聚合
│   ├── client/                 # 前端用户路由
│   │   ├── index.js            # /api/v1 聚合
│   │   ├── auth.js             # /api/v1/auth
│   │   └── characters.js       # /api/v1/characters
│   └── admin/                  # 后台管理路由（预留）
│       └── index.js            # /api/admin 聚合
├── middleware/
│   ├── index.js                # 中间件导出
│   ├── auth.js                 # 认证中间件
│   └── errorHandler.js         # 错误处理
├── services/
│   ├── RoomManager.js          # 房间管理服务
│   ├── ChatService.js          # 聊天服务
│   ├── BattleEngine.js         # 战斗引擎
│   └── WaveGenerator.js        # 波次生成
├── sockets/
│   ├── index.js                # Socket.IO 事件注册
│   ├── roomHandlers.js         # 房间相关事件
│   ├── battleHandlers.js       # 战斗相关事件
│   └── chatHandlers.js         # 聊天相关事件
├── models/                     # 保持不变
├── migrations/                 # 保持不变
├── config/                     # 保持不变
└── utils/
    ├── db.js                   # 数据库工具
    └── BroadcastEventBus.js    # 事件广播
```

**备选方案**:
1. 按功能模块分 (feature-based): `modules/auth/`, `modules/room/` - 拒绝，因为当前模块间耦合较高，拆分成本大
2. 保持扁平结构但重命名 - 拒绝，无法解决 index.js 臃肿问题

### D2: API 路径版本化

**决定**: 前端用户 API 使用 `/api/v1/*`，后台管理 API 使用 `/api/admin/*`

**理由**:
- 版本化便于未来 API 升级和向后兼容
- 分离 admin 路由为后续管理后台开发预留空间

**备选方案**:
- 保持 `/api/*` 不变 - 拒绝，缺乏版本控制，未来升级困难

### D3: Socket.IO 事件处理拆分

**决定**: 将 Socket 事件处理拆分到 `sockets/` 目录，按功能分类

**理由**:
- 当前 `index.js` 中 Socket 事件处理约 200 行，逻辑混杂
- 按功能分类便于维护和测试

**备选方案**:
- 保持在 `index.js` 中 - 拒绝，继续增加维护负担

### D4: Services 层设计

**决定**: 将业务逻辑类移到 `services/`，保持单例模式

**理由**:
- `RoomManager`, `ChatManager`, `BattleEngine` 等已经是服务类
- 统一放置便于依赖注入和测试

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 前端 API 路径改动导致调用失败 | 在前端统一使用 API 常量文件，一次性更新 |
| 拆分后 import 路径变化 | 使用 IDE 重构工具批量更新 |
| 拆分过程中引入 bug | 每个模块拆分后运行测试，增量提交 |
| 迁移期间代码不可用 | 在单独分支进行，完成后一次性合并 |

## Migration Plan

### 阶段 1: 创建目录结构（无功能变更）
1. 创建新目录: `routes/`, `middleware/`, `services/`, `sockets/`, `utils/`
2. 移动文件到新位置（保持导出不变）

### 阶段 2: 拆分路由
1. 创建 `routes/client/auth.js`，从 `index.js` 提取认证路由
2. 创建 `routes/client/characters.js`，提取角色路由
3. 添加 `/api/v1` 前缀

### 阶段 3: 拆分 Socket 处理
1. 创建 `sockets/roomHandlers.js`，提取房间事件
2. 创建 `sockets/battleHandlers.js`，提取战斗事件
3. 创建 `sockets/chatHandlers.js`，提取聊天事件

### 阶段 4: 精简入口文件
1. 重构 `index.js`，只保留初始化逻辑
2. 挂载路由和 Socket 处理器

### 阶段 5: 前端适配
1. 更新前端 API 常量文件
2. 端到端测试

### 回滚策略
- 每个 phase 单独提交，可独立回滚
- 保持 `git mv` 历史，便于追踪文件移动

## Open Questions

1. **admin 路由认证**: 后台管理 API 是否需要独立的认证机制（如 JWT + 角色）？
   - 建议: 暂时复用现有认证，后续独立实现

2. **API 版本策略**: 是否需要同时支持 `/api/*` 和 `/api/v1/*` 过渡期？
   - 建议: 不需要，直接切换，减少维护成本
