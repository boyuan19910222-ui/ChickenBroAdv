## ADDED Requirements

### Requirement: 提供管理员认证中间件
系统 SHALL 提供 `adminAuthMiddleware` 中间件函数，用于验证请求者是否为管理员。该中间件 SHALL：

1. 从请求头中提取 JWT token（`Authorization: Bearer <token>`）
2. 使用 `jwt.verify()` 验证 token 的有效性
3. 从 token 中提取用户信息（包含 is_admin 标识）
4. 检查用户的 `is_admin` 字段是否为 1
5. 将用户信息附加到 `req.user` 对象中

#### Scenario: 有效管理员 token 通过验证
- **WHEN** 管理员请求携带有效的 JWT token
- **AND** token 包含 `{ "id": 1, "is_admin": 1 }`
- **THEN** 中间件验证通过
- **AND** `req.user` 包含用户信息
- **AND** 请求继续传递到下一个中间件/路由处理器

#### Scenario: 非管理员 token 拒绝访问
- **WHEN** 普通用户请求携带有效的 JWT token
- **AND** token 包含 `{ "id": 2, "is_admin": 0 }`
- **THEN** 中间件返回 403 Forbidden
- **AND** 响应体包含错误信息 `{ "error": "FORBIDDEN", "message": "需要管理员权限" }`
- **AND** 请求不继续传递

#### Scenario: 无效 token 拒绝访问
- **WHEN** 请求携带无效或过期的 JWT token
- **THEN** 中间件返回 401 Unauthorized
- **AND** 响应体包含错误信息

#### Scenario: 缺少 token 拒绝访问
- **WHEN** 请求未携带 Authorization 头
- **THEN** 中间件返回 401 Unauthorized
- **AND** 响应体包含错误信息 `{ "error": "UNAUTHORIZED", "message": "未提供认证令牌" }`

#### Scenario: token 格式错误
- **WHEN** 请求的 Authorization 头格式不正确（如 `Authorization: invalid`）
- **THEN** 中间件返回 401 Unauthorized
- **AND** 响应体包含错误信息

### Requirement: 登录接口返回 is_admin 字段
`POST /api/auth/login` 和 `POST /api/auth/register` 端点返回的 `user` 对象 SHALL 包含 `is_admin` 字段，以便前端判断用户是否为管理员。

#### Scenario: 管理员登录返回 is_admin 为 1
- **WHEN** 管理员用户请求 `POST /api/auth/login`
- **THEN** 返回的 `user` 对象包含 `{ "id": 1, "username": "admin", "nickname": "管理员", "is_admin": 1 }`

#### Scenario: 普通用户登录返回 is_admin 为 0
- **WHEN** 普通用户请求 `POST /api/auth/login`
- **THEN** 返回的 `user` 对象包含 `{ "id": 2, "username": "player", "nickname": "玩家", "is_admin": 0 }`

#### Scenario: 新注册用户 is_admin 默认为 0
- **WHEN** 请求 `POST /api/auth/register` 创建新用户
- **THEN** 返回的 `user` 对象包含 `is_admin: 0`

### Requirement: 管理员 API 使用认证中间件
所有管理员 API 路由 SHALL 使用 `adminAuthMiddleware` 进行认证保护。

#### Scenario: 用户管理 API 受保护
- **WHEN** 访问 `GET /api/admin/users`、`PUT /api/admin/users/:id`、`DELETE /api/admin/users/:id` 等用户管理端点
- **THEN** 必须通过管理员认证中间件验证
- **AND** 非管理员请求返回 403 Forbidden

#### Scenario: 角色管理 API 受保护
- **WHEN** 访问 `GET /api/admin/characters`、`PUT /api/admin/characters/:id`、`DELETE /api/admin/characters/:id` 等角色管理端点
- **THEN** 必须通过管理员认证中间件验证
- **AND** 非管理员请求返回 403 Forbidden

#### Scenario: 职业配置管理 API 受保护
- **WHEN** 访问 `GET /api/admin/class-configs`、`POST /api/admin/class-configs`、`PUT /api/admin/class-configs/:id`、`DELETE /api/admin/class-configs/:id`、`POST /api/admin/class-configs/reload` 等职业配置管理端点
- **THEN** 必须通过管理员认证中间件验证
- **AND** 非管理员请求返回 403 Forbidden

### Requirement: 中间件将用户信息传递给后续处理器
`adminAuthMiddleware` 验证成功后，SHALL 将用户信息附加到 `req.user` 对象中，供后续路由处理器使用。

#### Scenario: 后续处理器可访问 req.user
- **WHEN** 管理员请求通过认证中间件
- **THEN** 后续路由处理器可通过 `req.user.id`、`req.user.username`、`req.user.is_admin` 访问用户信息
