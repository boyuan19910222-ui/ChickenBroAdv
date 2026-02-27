## ADDED Requirements

### Requirement: GM 面板按钮仅对管理员可见
系统 SHALL 在前端主界面显示 GM 面板按钮，但该按钮仅对管理员用户可见。

#### Scenario: 管理员登录后显示 GM 面板按钮
- **WHEN** 管理员用户登录
- **THEN** 主界面显示 GM 面板按钮

#### Scenario: 普通用户登录后不显示 GM 面板按钮
- **WHEN** 普通用户登录
- **THEN** 主界面不显示 GM 面板按钮

### Requirement: 点击 GM 面板按钮跳转到管理界面
系统 SHALL 在用户点击 GM 面板按钮时，导航到 GM 管理面板页面。

#### Scenario: 点击按钮跳转
- **WHEN** 用户点击 GM 面板按钮
- **THEN** 前端路由导航到 `/admin` 页面

### Requirement: GM 管理面板提供数据管理入口
系统 SHALL 在 GM 管理面板提供以下管理功能入口：用户管理、角色配置管理。
/admin路由我想使用bootstrap风格 不要用像素风格

#### Scenario: 显示管理功能入口
- **WHEN** 管理员进入 `/admin` 页面
- **THEN** 显示"用户管理"和"职业配置管理"选项卡或按钮

#### Scenario: 点击用户管理入口
- **WHEN** 管理员点击"用户管理"
- **THEN** 导航到 `/admin/users` 页面

#### Scenario: 点击职业配置管理入口
- **WHEN** 管理员点击"职业配置管理"
- **THEN** 导航到 `/admin/class-config` 页面

### Requirement: 敏感操作需要二次确认
系统 SHALL 在执行危险操作（如删除用户、删除配置）前，要求管理员进行二次确认。

#### Scenario: 删除用户前弹出确认对话框
- **WHEN** 管理员点击删除用户按钮
- **THEN** 弹出确认对话框，询问是否确认删除
- **AND** 仅在用户点击确认后执行删除操作
