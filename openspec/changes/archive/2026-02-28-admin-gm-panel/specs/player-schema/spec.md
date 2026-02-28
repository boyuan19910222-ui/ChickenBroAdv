## ADDED Requirements

### Requirement: User 模型包含 is_admin 字段
`User` Sequelize 模型 SHALL 包含 `is_admin` 字段（TINYINT，默认值为 0），用于标识用户是否为管理员。

#### Scenario: User 模型 is_admin 字段定义
- **WHEN** 检查 `server/models/User.js`
- **THEN** 模型包含 `is_admin` 字段定义
- **AND** 类型为 `DataTypes.TINYINT`
- **AND** `defaultValue` 为 0

#### Scenario: 新建用户 is_admin 默认为 0
- **WHEN** 通过 User 模型创建新用户（未指定 is_admin）
- **THEN** 新用户的 `is_admin` 字段值为 0

## MODIFIED Requirements

### Requirement: API 返回用户信息包含 is_admin 字段
登录和注册 API 返回的用户对象 SHALL 包含 `is_admin` 字段，以便前端判断用户是否为管理员。

#### Scenario: 登录 API 返回 is_admin
- **WHEN** 请求 `POST /api/auth/login` 登录成功
- **THEN** 返回的 `user` 对象包含 `is_admin` 字段
- **AND** 值为数据库中对应的 is_admin 值（0 或 1）

#### Scenario: 注册 API 返回 is_admin
- **WHEN** 请求 `POST /api/auth/register` 注册成功
- **THEN** 返回的 `user` 对象包含 `is_admin` 字段
- **AND** 值为 0（新注册用户默认不是管理员）
