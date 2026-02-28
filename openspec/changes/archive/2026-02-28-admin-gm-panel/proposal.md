## Why

当前游戏缺乏管理员（GM）管理面板，无法通过图形化界面管理用户、角色和职业配置。虽然后端已有预留的 `/admin` 路由，但缺少完整的管理功能实现。需要提供一套 Bootstrap 风格的 GM 管理界面，让管理员可以便捷地管理游戏数据。

## What Changes

### 后端变更

1. **用户表增加管理员标识字段**
   - `users` 表增加 `is_admin` 字段（TINYINT，默认 0）
   - 提供数据库迁移文件
   - 提供数据种子，将初始管理员账号标记为管理员

2. **管理员认证中间件**
   - 创建 `adminAuthMiddleware`，验证 JWT token 并检查用户是否为管理员
   - 非管理员请求返回 403 Forbidden

3. **管理员 API 路由扩展**
   - `GET /api/admin/users` - 获取用户列表（分页）
   - `GET /api/admin/users/:id` - 获取单个用户详情
   - `PUT /api/admin/users/:id` - 更新用户信息（包括 `is_admin` 字段）
   - `DELETE /api/admin/users/:id` - 删除用户
   - `GET /api/admin/characters` - 获取角色列表（分页，包含关联用户信息）
   - `GET /api/admin/characters/:id` - 获取单个角色详情
   - `PUT /api/admin/characters/:id` - 更新角色信息
   - `DELETE /api/admin/characters/:id` - 删除角色
   - `GET /api/admin/class-configs` - 获取职业配置列表
   - `POST /api/admin/class-configs` - 创建职业配置
   - `PUT /api/admin/class-configs/:id` - 更新职业配置
   - `DELETE /api/admin/class-configs/:id` - 删除职业配置
   - `POST /api/admin/class-configs/reload` - 热重载职业配置到内存

4. **登录响应增加管理员标识**
   - `POST /api/auth/login` 和 `POST /api/auth/register` 返回的 `user` 对象中包含 `is_admin` 字段

### 前端变更

1. **Vite 多入口配置**
   - 新增 `admin.html` 入口文件（独立于游戏主界面）
   - 新增 `src/admin/` 目录结构，包含独立的路由、组件、服务
   - 配置 Vite 多入口，保持现有前端项目架构不变

2. **管理员登录界面**
   - 使用现有账户体系登录（复用 `/api/auth/login`）
   - 登录成功后检查 `is_admin` 字段
   - 非管理员显示错误提示

3. **主游戏界面管理员入口**
   - 在主游戏界面添加"管理面板"按钮（仅当 `user.is_admin === true` 时显示）
   - 点击后跳转到 `/admin.html`

4. **GM 管理面板页面**（Bootstrap 风格）
   - **用户管理页面**：表格展示用户列表，支持搜索、分页、编辑（包括设置/取消管理员）、删除
   - **角色管理页面**：表格展示角色列表（包含所属用户信息），支持搜索、分页、编辑、删除
   - **职业配置管理页面**：表格展示职业配置，支持创建、编辑、删除、热重载配置

5. **Bootstrap 样式集成**
   - 安装 `bootstrap` 和 `@popperjs/core` 依赖
   - 导入 Bootstrap CSS/JS（仅在 GM 面板中使用）
   - 确保游戏主界面的像素风格不受影响

## Capabilities

### New Capabilities

- `admin-user-management`: 用户管理能力，包括查询、更新、删除用户，以及管理用户的管理员状态
- `admin-character-management`: 角色管理能力，包括查询、更新、删除角色数据
- `admin-class-config-management`: 职业配置管理能力，包括查询、创建、更新、删除职业配置，以及热重载配置
- `admin-auth-middleware`: 管理员认证中间件，验证请求者是否为管理员
- `admin-gm-panel-ui`: GM 管理面板 UI，使用 Bootstrap 风格，通过 Vite 多入口实现

### Modified Capabilities

- `player-schema`: 用户模型增加 `is_admin` 字段（需要更新数据库 schema）
- `class-config-table`: 可能需要调整职业配置的 API 端点，供 GM 面板使用（如增加热重载的 API 路由）

## Impact

### 后端影响
- 新增数据库迁移：`users` 表增加 `is_admin` 字段
- 新增管理员 API 路由（约 10+ 个端点）
- 修改现有登录接口返回格式（增加 `is_admin` 字段）
- 新增中间件和工具函数

### 前端影响
- 新增 Vite 多入口配置
- 新增 `src/admin/` 目录及相关文件
- 新增 `admin.html` 入口文件
- 修改 `vite.config.js` 配置
- 新增 Bootstrap 依赖

### 依赖影响
- 前端新增 `bootstrap`、`@popperjs/core` 依赖
- 不影响现有游戏客户端和服务器架构

### 安全影响
- 管理员操作需要严格验证
- 敏感操作（删除用户/角色）需要二次确认
- 所有管理员 API 需要通过认证中间件
