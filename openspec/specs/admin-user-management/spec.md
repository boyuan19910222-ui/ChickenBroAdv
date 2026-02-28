## Purpose

提供管理员用户管理 API，允许管理员查询、编辑和删除用户，包括设置/取消管理员权限。

## Requirements

### Requirement: 用户表包含管理员标识字段
`users` 表 SHALL 包含 `is_admin` 字段（TINYINT，默认值为 0），用于标识用户是否为管理员。该字段 SHALL 通过数据库迁移添加。

#### Scenario: is_admin 字段存在且默认为 0
- **WHEN** 查询 `users` 表结构
- **THEN** `is_admin` 字段存在，类型为 TINYINT，默认值为 0

#### Scenario: 现有用户的 is_admin 均为 0
- **WHEN** 执行添加 `is_admin` 字段的迁移后
- **THEN** 所有现有用户的 `is_admin` 值均为 0

### Requirement: 支持查询用户列表（分页）
系统 SHALL 提供 `GET /api/admin/users` 端点，支持分页查询用户列表。查询参数包括 `page`（页码，默认 1）、`pageSize`（每页数量，默认 20）、`search`（搜索关键词，匹配 username 或 nickname）。

#### Scenario: 查询用户列表
- **WHEN** 请求 `GET /api/admin/users?page=1&pageSize=20`
- **THEN** 返回用户列表，包含分页信息（total、page、pageSize）
- **AND** 每个用户对象包含 id、username、nickname、is_admin、created_at、last_login 字段

#### Scenario: 按关键词搜索用户
- **WHEN** 请求 `GET /api/admin/users?search=test`
- **THEN** 返回 username 或 nickname 包含 "test" 的用户列表

#### Scenario: 分页参数处理
- **WHEN** 请求 `GET /api/admin/users?page=2&pageSize=10`
- **THEN** 返回第 2 页的数据，每页 10 条记录
- **AND** total 为用户总数

### Requirement: 支持查询单个用户详情
系统 SHALL 提供 `GET /api/admin/users/:id` 端点，用于获取单个用户的详细信息。

#### Scenario: 查询用户详情
- **WHEN** 请求 `GET /api/admin/users/1`
- **THEN** 返回该用户的完整信息，包括所有字段

#### Scenario: 查询不存在的用户
- **WHEN** 请求 `GET /api/admin/users/999999`
- **THEN** 返回 404 Not Found

### Requirement: 支持更新用户信息
系统 SHALL 提供 `PUT /api/admin/users/:id` 端点，允许管理员更新用户信息。可更新的字段包括 `nickname`、`is_admin`、`auto_login`。

#### Scenario: 更新用户昵称
- **WHEN** 请求 `PUT /api/admin/users/1` 携带 `{ "nickname": "新昵称" }`
- **THEN** 用户昵称更新为 "新昵称"
- **AND** 返回更新后的用户信息

#### Scenario: 设置用户为管理员
- **WHEN** 请求 `PUT /api/admin/users/1` 携带 `{ "is_admin": 1 }`
- **THEN** 用户的 `is_admin` 字段更新为 1
- **AND** 该用户登录后可获得管理员权限

#### Scenario: 取消用户管理员权限
- **WHEN** 请求 `PUT /api/admin/users/1` 携带 `{ "is_admin": 0 }`
- **THEN** 用户的 `is_admin` 字段更新为 0
- **AND** 该用户失去管理员权限

#### Scenario: 更新不存在的用户
- **WHEN** 请求 `PUT /api/admin/users/999999`
- **THEN** 返回 404 Not Found

### Requirement: 支持删除用户
系统 SHALL 提供 `DELETE /api/admin/users/:id` 端点，允许管理员删除用户。删除用户时 SHALL 同时删除该用户的所有角色数据。

#### Scenario: 删除用户
- **WHEN** 请求 `DELETE /api/admin/users/1`
- **THEN** 用户被删除
- **AND** 该用户的所有角色也被删除
- **AND** 返回 204 No Content

#### Scenario: 删除不存在的用户
- **WHEN** 请求 `DELETE /api/admin/users/999999`
- **THEN** 返回 404 Not Found

### Requirement: 用户 API 需要管理员认证
所有用户管理 API SHALL 使用管理员认证中间件，非管理员请求返回 403 Forbidden。

#### Scenario: 非管理员访问用户列表
- **WHEN** 普通用户请求 `GET /api/admin/users`
- **THEN** 返回 403 Forbidden

#### Scenario: 管理员访问用户列表
- **WHEN** 管理员请求 `GET /api/admin/users`
- **THEN** 返回用户列表
