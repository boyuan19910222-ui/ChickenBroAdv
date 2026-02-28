## Purpose

提供管理员角色管理 API，允许管理员查询、编辑和删除玩家角色，包括支持 game_state 的增量更新。

## Requirements

### Requirement: 支持查询角色列表（分页）
系统 SHALL 提供 `GET /api/admin/characters` 端点，支持分页查询角色列表。查询参数包括 `page`（页码，默认 1）、`pageSize`（每页数量，默认 20）、`search`（搜索关键词，匹配角色名或用户名）、`userId`（按用户 ID 筛选）。返回数据 SHALL 包含关联的用户信息。

#### Scenario: 查询角色列表
- **WHEN** 请求 `GET /api/admin/characters?page=1&pageSize=20`
- **THEN** 返回角色列表，包含分页信息
- **AND** 每个角色对象包含角色基本信息和关联的用户信息（username、nickname、is_admin）

#### Scenario: 按关键词搜索角色
- **WHEN** 请求 `GET /api/admin/characters?search=test`
- **THEN** 返回角色名或所属用户名包含 "test" 的角色列表

#### Scenario: 按用户 ID 筛选角色
- **WHEN** 请求 `GET /api/admin/characters?userId=1`
- **THEN** 返回属于用户 ID 为 1 的所有角色

### Requirement: 支持查询单个角色详情
系统 SHALL 提供 `GET /api/admin/characters/:id` 端点，用于获取单个角色的详细信息。返回数据 SHALL 包含完整游戏状态（game_state）的解析后对象。

#### Scenario: 查询角色详情
- **WHEN** 请求 `GET /api/admin/characters/1`
- **THEN** 返回该角色的完整信息
- **AND** 包含解析后的 game_state 对象（如等级、经验、装备、技能等）
- **AND** 包含关联的用户信息

#### Scenario: 查询不存在的角色
- **WHEN** 请求 `GET /api/admin/characters/999999`
- **THEN** 返回 404 Not Found

### Requirement: 支持更新角色信息
系统 SHALL 提供 `PUT /api/admin/characters/:id` 端点，允许管理员更新角色信息。可更新的字段包括 `name`（角色名）、`level`（等级）、`gold`（金币）、以及 game_state 中的可编辑字段（如 baseStats、stats、equipment、inventory 等）。

#### Scenario: 更新角色名称
- **WHEN** 请求 `PUT /api/admin/characters/1` 携带 `{ "name": "新角色名" }`
- **THEN** 角色名更新为 "新角色名"
- **AND** 返回更新后的角色信息

#### Scenario: 更新角色等级
- **WHEN** 请求 `PUT /api/admin/characters/1` 携带 `{ "level": 50 }`
- **THEN** 角色等级更新为 50
- **AND** game_state 中的 level 同步更新

#### Scenario: 更新角色金币
- **WHEN** 请求 `PUT /api/admin/characters/1` 携带 `{ "gold": 99999 }`
- **THEN** 角色金币更新为 99999
- **AND** game_state 中的 gold 同步更新

#### Scenario: 更新角色基础属性
- **WHEN** 请求 `PUT /api/admin/characters/1` 携带 `{ "baseStats": { "attack": 100, "defense": 50 } }`
- **THEN** game_state 中的 baseStats 更新为指定值
- **AND** 其他字段保持不变

#### Scenario: 更新角色装备
- **WHEN** 请求 `PUT /api/admin/characters/1` 携带 `{ "equipment": { "weapon": { "id": "sword_01", "name": "新手剑" } } }`
- **THEN** game_state 中的 equipment 更新为指定值
- **AND** 未指定的装备槽位保持原值

#### Scenario: 更新不存在的角色
- **WHEN** 请求 `PUT /api/admin/characters/999999`
- **THEN** 返回 404 Not Found

### Requirement: 支持删除角色
系统 SHALL 提供 `DELETE /api/admin/characters/:id` 端点，允许管理员删除角色。

#### Scenario: 删除角色
- **WHEN** 请求 `DELETE /api/admin/characters/1`
- **THEN** 角色被删除
- **AND** 返回 204 No Content

#### Scenario: 删除不存在的角色
- **WHEN** 请求 `DELETE /api/admin/characters/999999`
- **THEN** 返回 404 Not Found

### Requirement: 角色 API 需要管理员认证
所有角色管理 API SHALL 使用管理员认证中间件，非管理员请求返回 403 Forbidden。

#### Scenario: 非管理员访问角色列表
- **WHEN** 普通用户请求 `GET /api/admin/characters`
- **THEN** 返回 403 Forbidden

#### Scenario: 管理员访问角色列表
- **WHEN** 管理员请求 `GET /api/admin/characters`
- **THEN** 返回角色列表

### Requirement: 支持 game_state 字段的增量更新
更新角色时，SHALL 支持只更新 game_state 中的部分字段，未指定的字段保持不变。

#### Scenario: 只更新 game_state 中的部分字段
- **WHEN** 请求 `PUT /api/admin/characters/1` 携带 `{ "game_state": { "level": 10 } }`
- **THEN** game_state 中的 level 更新为 10
- **AND** game_state 中的其他字段（如 gold、equipment 等）保持不变
