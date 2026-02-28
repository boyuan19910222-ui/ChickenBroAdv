## ADDED Requirements

### Requirement: 提供职业配置热重载 API
系统 SHALL 提供 `POST /api/admin/class-configs/reload` 端点，允许管理员触发职业配置的热重载，将数据库中的配置重新加载到内存缓存。

#### Scenario: 调用热重载 API
- **WHEN** 请求 `POST /api/admin/class-configs/reload`
- **THEN** 调用 `reloadClassConfigs(stmts)` 函数
- **AND** 返回 200 OK，包含重载成功信息

#### Scenario: 热重载后新配置生效
- **WHEN** 数据库中 warrior 的 base_stats 被修改后调用热重载 API
- **THEN** 下一次创建 warrior 角色时使用更新后的配置

#### Scenario: 热重载 API 需要管理员认证
- **WHEN** 非管理员请求 `POST /api/admin/class-configs/reload`
- **THEN** 返回 403 Forbidden

### Requirement: 提供职业配置管理 API
系统 SHALL 提供职业配置的增删改查 API，供 GM 面板使用。

#### Scenario: 查询职业配置列表
- **WHEN** 请求 `GET /api/admin/class-configs`
- **THEN** 返回所有职业配置
- **AND** 需要管理员认证

#### Scenario: 创建职业配置
- **WHEN** 请求 `POST /api/admin/class-configs` 携带职业配置数据
- **THEN** 创建新的职业配置
- **AND** 需要管理员认证

#### Scenario: 更新职业配置
- **WHEN** 请求 `PUT /api/admin/class-configs/:id` 携带更新数据
- **THEN** 更新指定的职业配置
- **AND** 需要管理员认证

#### Scenario: 删除职业配置
- **WHEN** 请求 `DELETE /api/admin/class-configs/:id`
- **THEN** 删除指定的职业配置
- **AND** 需要管理员认证

## MODIFIED Requirements

无需求变更，仅新增 API 端点。
