## Why

目前游戏缺乏管理员管理工具，所有玩家数据修改需要直接操作数据库，操作不便且存在安全风险。需要提供一个可视化的GM面板，让管理员可以通过界面管理游戏数据，提升运营效率和数据安全性。

## What Changes

- **新增数据库表**: `user_roles` 表，用于记录用户的管理员角色
- **新增前端界面**: GM管理面板，提供数据可视化管理功能
- **新增UI入口**: 管理员专属的GM面板按钮，点击可跳转到管理面板
- **数据管理功能**:
  - 用户列表展示（查看当前所有用户）
  - 用户信息编辑（角色、等级等属性）
  - `class_config` 表的增删改查（CRUD）操作

## Capabilities

### New Capabilities

- `admin-role-management`: 管理员角色管理能力，包括管理员身份验证、权限判断
- `gm-panel-ui`: GM管理面板前端界面，提供数据管理入口和可视化操作界面
- `user-data-management`: 用户数据管理能力，支持查询、修改用户角色、等级等信息
- `class-config-management`: 职业配置管理能力，支持 `class_config` 表的完整CRUD操作

### Modified Capabilities

- `player-schema`: 需要新增关联到 `user_roles` 表的外键关系，用于标识用户的管理员状态

## Impact

**数据库**:
- 新增 `user_roles` 表，包含 `user_id` 和 `is_admin` 字段
- 与现有 `users` 表建立外键关联

**后端**:
- 新增管理员身份验证API
- 新增用户数据管理API（查询、更新）
- 新增 `class_config` CRUD API
- 需要确保所有管理操作都有权限校验

**前端**:
- 新增GM面板按钮（仅对管理员可见）
- 新增GM管理面板页面
- 新增用户管理界面
- 新增 `class_config` 管理界面

**安全**:
- 所有GM操作需要管理员权限验证
- 敏感操作需要二次确认
- 记录管理操作日志
