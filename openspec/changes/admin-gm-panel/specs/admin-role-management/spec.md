## ADDED Requirements

### Requirement: user_roles 数据表定义管理员角色
系统 SHALL 创建 `user_roles` 数据表，包含 `user_id` (主键，关联 users 表) 和 `is_admin` (布尔值，标记管理员身份) 字段。

#### Scenario: 创建管理员记录
- **WHEN** 将一个用户标记为管理员
- **THEN** 在 `user_roles` 表中插入一条记录，`user_id` 为该用户ID，`is_admin` 为 true

#### Scenario: 查询管理员状态
- **WHEN** 查询用户的 `user_roles` 记录
- **THEN** 如果存在 `is_admin = true` 的记录，则该用户为管理员

### Requirement: 后端提供管理员身份验证 API
系统 SHALL 提供 `GET /api/admin/check` API，用于验证当前登录用户是否具有管理员权限。

#### Scenario: 管理员用户访问验证接口
- **WHEN** 管理员用户调用 `GET /api/admin/check`
- **THEN** 返回 `{ isAdmin: true }`

#### Scenario: 普通用户访问验证接口
- **WHEN** 普通用户调用 `GET /api/admin/check`
- **THEN** 返回 `{ isAdmin: false }`

#### Scenario: 未登录用户访问验证接口
- **WHEN** 未登录用户调用 `GET /api/admin/check`
- **THEN** 返回 `{ isAdmin: false }`

### Requirement: 所有 GM 操作必须验证管理员权限
系统 SHALL 在所有 GM 管理操作（用户数据修改、配置管理等）执行前，验证当前用户是否具有管理员权限。

#### Scenario: 非管理员尝试修改用户数据
- **WHEN** 非管理员用户调用用户数据修改 API
- **THEN** 返回 403 Forbidden 错误，不允许操作

#### Scenario: 管理员成功修改用户数据
- **WHEN** 管理员用户调用用户数据修改 API
- **THEN** 操作成功执行

### Requirement: 记录管理操作日志
系统 SHALL 记录所有 GM 管理操作到日志，包括操作人、操作时间、操作类型和受影响的数据。

#### Scenario: 记录用户信息修改
- **WHEN** 管理员修改用户等级
- **THEN** 日志记录操作人ID、时间戳、操作类型（UPDATE_USER）、用户ID和新旧值

#### Scenario: 记录配置变更
- **WHEN** 管理员修改 class_config
- **THEN** 日志记录操作人ID、时间戳、操作类型（UPDATE_CONFIG）、配置ID和新旧值
