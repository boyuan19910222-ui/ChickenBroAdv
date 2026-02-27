## ADDED Requirements

### Requirement: 用户列表查询 API
系统 SHALL 提供 `GET /api/admin/users` API，支持分页查询所有用户列表。

#### Scenario: 查询第一页用户列表
- **WHEN** 管理员调用 `GET /api/admin/users?page=1&limit=20`
- **THEN** 返回用户列表，包含用户ID、名称、职业、等级、创建时间等信息
- **AND** 返回分页元数据（total、page、limit）

#### Scenario: 非管理员查询用户列表
- **WHEN** 非管理员调用 `GET /api/admin/users`
- **THEN** 返回 403 Forbidden 错误

### Requirement: 用户信息查询 API
系统 SHALL 提供 `GET /api/admin/users/:id` API，用于查询指定用户的详细信息。

#### Scenario: 查询用户详细信息
- **WHEN** 管理员调用 `GET /api/admin/users/123`
- **THEN** 返回该用户的完整信息，包括角色、等级、经验、装备、技能等

#### Scenario: 查询不存在的用户
- **WHEN** 管理员调用 `GET /api/admin/users/999999`
- **THEN** 返回 404 Not Found 错误

### Requirement: 用户角色修改 API
系统 SHALL 提供 `PATCH /api/admin/users/:id/class` API，用于修改用户的职业。

#### Scenario: 修改用户职业
- **WHEN** 管理员调用 `PATCH /api/admin/users/123/class`，body `{ classId: 'warrior' }`
- **THEN** 用户的职业被修改为 warrior
- **AND** 返回修改后的用户信息

### Requirement: 用户等级修改 API
系统 SHALL 提供 `PATCH /api/admin/users/:id/level` API，用于修改用户的等级。

#### Scenario: 修改用户等级
- **WHEN** 管理员调用 `PATCH /api/admin/users/123/level`，body `{ level: 50 }`
- **THEN** 用户的等级被修改为 50
- **AND** 返回修改后的用户信息

#### Scenario: 设置无效等级
- **WHEN** 管理员调用 `PATCH /api/admin/users/123/level`，body `{ level: -1 }`
- **THEN** 返回 400 Bad Request 错误

### Requirement: 用户经验值修改 API
系统 SHALL 提供 `PATCH /api/admin/users/:id/experience` API，用于修改用户的经验值。

#### Scenario: 修改用户经验值
- **WHEN** 管理员调用 `PATCH /api/admin/users/123/experience`，body `{ experience: 50000 }`
- **THEN** 用户的经验值被修改为 50000
- **AND** 返回修改后的用户信息

### Requirement: 用户删除 API
系统 SHALL 提供 `DELETE /api/admin/users/:id` API，用于删除指定用户。

#### Scenario: 删除用户
- **WHEN** 管理员调用 `DELETE /api/admin/users/123`
- **THEN** 用户被删除
- **AND** 返回 204 No Content
