## Purpose

确保数据库系统重构后，所有现有 HTTP 接口的请求参数结构、响应体结构与 HTTP 状态码语义维持向前兼容，ORM 内部实现细节不泄漏给客户端。

## Requirements

### Requirement: 所有现有 HTTP 接口请求参数结构不变
数据库重构后，所有现有 API 端点 SHALL 继续接受与重构前相同的请求参数（路径参数、查询参数、请求体字段），不新增必填字段，不删除任何字段。

#### Scenario: 登录接口参数兼容
- **WHEN** `POST /api/auth/login` 接收 `{ username, password }` 请求体
- **THEN** 返回与重构前结构相同的响应（含 `token`、`user` 字段），HTTP 状态码不变

#### Scenario: 角色列表接口参数兼容
- **WHEN** `GET /api/characters` 携带有效 JWT 请求
- **THEN** 返回角色数组，每个对象字段集合与重构前相同

### Requirement: 所有现有 HTTP 接口响应体结构不变
数据库重构后，所有现有 API 端点 SHALL 返回与重构前字段名、类型、嵌套结构完全一致的响应体，不新增未声明字段，不删除任何字段。

#### Scenario: 角色详情字段覆盖率
- **WHEN** `GET /api/characters/:id` 返回角色数据
- **THEN** 包含字段：`id`、`user_id`、`name`、`class`、`level`、`game_state`、`created_at`、`updated_at`、`last_played_at`，无多余字段泄漏 ORM 内部属性（如 `_changed`、`dataValues`）

#### Scenario: 错误响应结构兼容
- **WHEN** 业务逻辑错误发生（如角色不存在、权限不足）
- **THEN** HTTP 状态码（404/401/403）与错误消息格式与重构前一致

### Requirement: 现有接口 HTTP 状态码语义不变
数据库重构后，所有接口 SHALL 维持与重构前相同的 HTTP 状态码映射（成功码与各类错误码），数据库层异常不得导致 500 错误暴露给客户端（应被捕获并转换为业务错误）。

#### Scenario: 未认证请求返回 401
- **WHEN** 请求不含 JWT 或 JWT 无效
- **THEN** 返回 HTTP 401，与重构前行为一致

#### Scenario: 数据库连接失败时返回 503
- **WHEN** MySQL 不可达导致查询失败
- **THEN** API 返回 HTTP 503（服务不可用），不暴露原始数据库错误堆栈给客户端

### Requirement: ORM 内部属性不泄漏到 API 响应
系统 SHALL 在路由响应前将 Sequelize 模型实例转换为普通对象（`.toJSON()` 或指定字段序列化），确保响应中不含 ORM 添加的内部属性（如 `dataValues`、`_options`、`isNewRecord`）。

#### Scenario: 角色接口响应无 ORM 内部字段
- **WHEN** `GET /api/characters` 返回角色列表
- **THEN** 每个角色对象不含 `dataValues`、`_changed`、`isNewRecord` 等 Sequelize 内部字段
