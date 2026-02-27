## ADDED Requirements

### Requirement: 职业配置查询 API
系统 SHALL 提供 `GET /api/admin/class-config` API，支持查询所有职业配置列表。

#### Scenario: 查询所有职业配置
- **WHEN** 管理员调用 `GET /api/admin/class-config`
- **THEN** 返回所有职业的配置信息，包括职业ID、名称、基础属性、技能列表等

### Requirement: 单个职业配置查询 API
系统 SHALL 提供 `GET /api/admin/class-config/:id` API，用于查询指定职业的详细配置。

#### Scenario: 查询职业配置详情
- **WHEN** 管理员调用 `GET /api/admin/class-config/warrior`
- **THEN** 返回 warrior 职业的完整配置信息

#### Scenario: 查询不存在的职业配置
- **WHEN** 管理员调用 `GET /api/admin/class-config/unknown`
- **THEN** 返回 404 Not Found 错误

### Requirement: 职业配置创建 API
系统 SHALL 提供 `POST /api/admin/class-config` API，用于创建新的职业配置。

#### Scenario: 创建新职业配置
- **WHEN** 管理员调用 `POST /api/admin/class-config`，body 包含职业ID、名称、基础属性等配置
- **THEN** 新职业配置被创建
- **AND** 返回创建的配置信息

#### Scenario: 创建重复职业ID
- **WHEN** 管理员调用 `POST /api/admin/class-config`，body 的职业ID已存在
- **THEN** 返回 409 Conflict 错误

### Requirement: 职业配置更新 API
系统 SHALL 提供 `PUT /api/admin/class-config/:id` API，用于更新指定职业的配置。

#### Scenario: 更新职业配置
- **WHEN** 管理员调用 `PUT /api/admin/class-config/warrior`，body 包含新的配置内容
- **THEN** warrior 职业配置被更新
- **AND** 返回更新后的配置信息

#### Scenario: 更新不存在的职业配置
- **WHEN** 管理员调用 `PUT /api/admin/class-config/unknown`，body 包含配置内容
- **THEN** 返回 404 Not Found 错误

### Requirement: 职业配置删除 API
系统 SHALL 提供 `DELETE /api/admin/class-config/:id` API，用于删除指定职业的配置。

#### Scenario: 删除职业配置
- **WHEN** 管理员调用 `DELETE /api/admin/class-config/warrior`
- **THEN** warrior 职业配置被删除
- **AND** 返回 204 No Content

#### Scenario: 删除不存在的职业配置
- **WHEN** 管理员调用 `DELETE /api/admin/class-config/unknown`
- **THEN** 返回 404 Not Found 错误
