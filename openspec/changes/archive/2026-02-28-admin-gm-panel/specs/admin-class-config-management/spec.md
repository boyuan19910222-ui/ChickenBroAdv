## ADDED Requirements

### Requirement: 支持查询职业配置列表
系统 SHALL 提供 `GET /api/admin/class-configs` 端点，用于获取所有职业配置列表。返回数据 SHALL 包含所有职业的完整配置信息。

#### Scenario: 查询职业配置列表
- **WHEN** 请求 `GET /api/admin/class-configs`
- **THEN** 返回所有职业的配置列表
- **AND** 每个配置包含 id、class_id、name、base_stats、growth_per_level、base_skills、resource_type、resource_max、created_at、updated_at 字段

### Requirement: 支持创建职业配置
系统 SHALL 提供 `POST /api/admin/class-configs` 端点，允许管理员创建新的职业配置。必填字段包括 `class_id`（唯一）、`name`、`base_stats`、`growth_per_level`、`base_skills`、`resource_type`、`resource_max`。

#### Scenario: 创建新职业
- **WHEN** 请求 `POST /api/admin/class-configs` 携带完整的职业配置数据
- **THEN** 新职业被创建
- **AND** 返回创建的职业配置（包含生成的 id）
- **AND** created_at 和 updated_at 被自动设置

#### Scenario: 创建重复的 class_id
- **WHEN** 请求 `POST /api/admin/class-configs` 携带已存在的 class_id
- **THEN** 返回 409 Conflict
- **AND** 错误信息提示 class_id 已存在

#### Scenario: 缺少必填字段
- **WHEN** 请求 `POST /api/admin/class-configs` 携带不完整的数据（缺少 base_stats）
- **THEN** 返回 400 Bad Request
- **AND** 错误信息提示缺少必填字段

### Requirement: 支持更新职业配置
系统 SHALL 提供 `PUT /api/admin/class-configs/:id` 端点，允许管理员更新职业配置。所有字段均可更新，除 id 外。

#### Scenario: 更新职业名称
- **WHEN** 请求 `PUT /api/admin/class-configs/1` 携带 `{ "name": "新职业名" }`
- **THEN** 职业名称更新为 "新职业名"
- **AND** updated_at 自动更新
- **AND** 返回更新后的配置

#### Scenario: 更新职业基础属性
- **WHEN** 请求 `PUT /api/admin/class-configs/1` 携带 `{ "base_stats": { "attack": 200, "defense": 100 } }`
- **THEN** base_stats 更新为指定值
- **AND** updated_at 自动更新

#### Scenario: 更新职业基础技能
- **WHEN** 请求 `PUT /api/admin/class-configs/1` 携带 `{ "base_skills": ["skill_01", "skill_02"] }`
- **THEN** base_skills 更新为指定数组
- **AND** updated_at 自动更新

#### Scenario: 更新不存在的职业配置
- **WHEN** 请求 `PUT /api/admin/class-configs/999999`
- **THEN** 返回 404 Not Found

### Requirement: 支持删除职业配置
系统 SHALL 提供 `DELETE /api/admin/class-configs/:id` 端点，允许管理员删除职业配置。

#### Scenario: 删除职业配置
- **WHEN** 请求 `DELETE /api/admin/class-configs/1`
- **THEN** 职业配置被删除
- **AND** 返回 204 No Content

#### Scenario: 删除不存在的职业配置
- **WHEN** 请求 `DELETE /api/admin/class-configs/999999`
- **THEN** 返回 404 Not Found

### Requirement: 支持热重载职业配置
系统 SHALL 提供 `POST /api/admin/class-configs/reload` 端点，允许管理员触发职业配置的热重载，将数据库中的配置重新加载到内存缓存。

#### Scenario: 热重载职业配置
- **WHEN** 请求 `POST /api/admin/class-configs/reload`
- **THEN** 从数据库重新加载所有职业配置到内存
- **AND** 返回 200 OK，包含重载成功信息
- **AND** 后续创建的角色使用更新后的配置

#### Scenario: 热重载后新配置生效
- **WHEN** 数据库中 warrior 的 base_stats 被修改后调用热重载 API
- **THEN** 下一次创建 warrior 角色时使用更新后的 base_stats
- **AND** 已存在的 warrior 角色不受影响

### Requirement: 职业 API 需要管理员认证
所有职业配置管理 API SHALL 使用管理员认证中间件，非管理员请求返回 403 Forbidden。

#### Scenario: 非管理员访问职业配置列表
- **WHEN** 普通用户请求 `GET /api/admin/class-configs`
- **THEN** 返回 403 Forbidden

#### Scenario: 管理员访问职业配置列表
- **WHEN** 管理员请求 `GET /api/admin/class-configs`
- **THEN** 返回职业配置列表

### Requirement: 职业配置验证
创建或更新职业配置时，SHALL 验证字段格式和值的合法性。

#### Scenario: base_stats 必须为对象
- **WHEN** 请求 `POST /api/admin/class-configs` 携带 `{ "base_stats": "invalid" }`
- **THEN** 返回 400 Bad Request
- **AND** 错误信息提示 base_stats 必须为对象

#### Scenario: base_skills 必须为数组
- **WHEN** 请求 `POST /api/admin/class-configs` 携带 `{ "base_skills": "invalid" }`
- **THEN** 返回 400 Bad Request
- **AND** 错误信息提示 base_skills 必须为数组

#### Scenario: resource_type 必须为有效值
- **WHEN** 请求 `POST /api/admin/class-configs` 携带 `{ "resource_type": "invalid_type" }`
- **THEN** 返回 400 Bad Request
- **AND** 错误信息提示 resource_type 必须为有效值（如 rage、energy、mana 等）
