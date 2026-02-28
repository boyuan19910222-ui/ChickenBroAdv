## Purpose

提供管理员 GM 面板前端界面，使用 Bootstrap 样式，独立于游戏主界面，包含用户管理、角色管理和职业配置管理功能。

## Requirements

### Requirement: Vite 多入口配置
系统 SHALL 配置 Vite 支持多入口，新增 `admin.html` 入口文件，独立于游戏主界面。主游戏入口保持为 `index.html`。

#### Scenario: Vite 配置多入口
- **WHEN** 查看 vite.config.js
- **THEN** 配置包含两个入口：`index` (index.html) 和 `admin` (admin.html)
- **AND** 两个入口共享相同的 Vite 配置和源码别名配置

#### Scenario: 独立构建 admin 入口
- **WHEN** 执行 `npm run build`
- **THEN** 输出目录包含 `index.html` 和 `admin.html`
- **AND** 两个入口的资源分离构建

### Requirement: GM 面板独立目录结构
系统 SHALL 创建 `src/admin/` 目录结构，包含 GM 面板独立的路由、组件、服务和存储。该目录 SHALL 与游戏主界面的代码隔离。

#### Scenario: admin 目录结构
- **WHEN** 查看 `src/admin/` 目录
- **THEN** 包含以下子目录：
  - `views/` - GM 面板页面组件
  - `components/` - GM 面板通用组件
  - `services/` - GM 面板 API 服务
  - `router/` - GM 面板路由配置
  - `stores/` - GM 面板状态管理（可选）

#### Scenario: admin 入口文件
- **WHEN** 查看 `src/admin/main.js`
- **THEN** 创建独立的 Vue 应用实例
- **AND** 使用独立的路由器实例
- **AND** 挂载到 `#admin-app` DOM 节点

### Requirement: GM 面板登录页面
GM 面板 SHALL 提供登录页面，使用现有账户体系登录（复用 `/api/auth/login`）。

#### Scenario: 登录页面表单
- **WHEN** 访问 GM 面板登录页面
- **THEN** 显示用户名和密码输入框
- **AND** 提供"登录"按钮
- **AND** 使用 Bootstrap 样式（而非像素风格）

#### Scenario: 登录成功后检查管理员权限
- **WHEN** 用户提交登录表单并成功登录
- **THEN** 检查返回的 `user.is_admin` 字段
- **AND** 如果 `is_admin === 1`，跳转到 GM 面板主页
- **AND** 如果 `is_admin === 0`，显示错误提示"您没有管理员权限"

#### Scenario: 非管理员登录失败
- **WHEN** 非管理员用户尝试登录 GM 面板
- **THEN** 登录接口返回成功，但前端显示错误提示
- **AND** 用户无法进入 GM 面板
- **AND** 建议返回游戏主界面

### Requirement: 主游戏界面管理员入口
主游戏界面 SHALL 添加"管理面板"按钮，仅当用户为管理员时显示。

#### Scenario: 管理员显示入口按钮
- **WHEN** 管理员用户（`is_admin === 1`）登录游戏主界面
- **THEN** 界面显示"管理面板"按钮
- **AND** 按钮点击后跳转到 `/admin.html`

#### Scenario: 普通用户不显示入口按钮
- **WHEN** 普通用户（`is_admin === 0`）登录游戏主界面
- **THEN** 界面不显示"管理面板"按钮

### Requirement: GM 面板主页
GM 面板 SHALL 提供主页，包含导航菜单和三个主要功能模块的入口：用户管理、角色管理、职业配置管理。

#### Scenario: 主页结构
- **WHEN** 访问 GM 面板主页（登录成功后）
- **THEN** 显示 Bootstrap 风格的导航栏
- **AND** 导航栏包含三个链接：用户管理、角色管理、职业配置
- **AND** 显示当前管理员用户信息
- **AND** 提供登出按钮

#### Scenario: 导航路由
- **WHEN** 点击导航栏的链接
- **THEN** 路由切换到对应的页面
- **AND** 不刷新页面（单页应用）

### Requirement: 用户管理页面
用户管理页面 SHALL 使用 Bootstrap 风格的表格展示用户列表，支持搜索、分页、编辑（包括设置/取消管理员）、删除。

#### Scenario: 用户列表表格
- **WHEN** 访问用户管理页面
- **THEN** 显示 Bootstrap 表格
- **AND** 表格列包括：ID、用户名、昵称、是否管理员、创建时间、最后登录、操作

#### Scenario: 搜索用户
- **WHEN** 在搜索框输入关键词
- **THEN** 表格筛选显示匹配的用户（用户名或昵称包含关键词）
- **AND** 实时更新（或点击搜索按钮后更新）

#### Scenario: 分页显示
- **WHEN** 用户数量超过每页显示数量
- **THEN** 显示分页控件（首页、上一页、下一页、尾页、页码）
- **AND** 点击分页控件切换页面

#### Scenario: 编辑用户
- **WHEN** 点击"编辑"按钮
- **THEN** 打开 Bootstrap 模态框（Modal）
- **AND** 显示用户表单（昵称、是否管理员）
- **AND** 提交后更新用户信息并刷新列表

#### Scenario: 设置用户为管理员
- **WHEN** 在编辑模态框中勾选"管理员"选项
- **THEN** 保存后用户的 `is_admin` 字段设置为 1
- **AND** 该用户下次登录可访问 GM 面板

#### Scenario: 取消用户管理员权限
- **WHEN** 在编辑模态框中取消勾选"管理员"选项
- **THEN** 保存后用户的 `is_admin` 字段设置为 0
- **AND** 该用户失去管理员权限

#### Scenario: 删除用户
- **WHEN** 点击"删除"按钮
- **THEN** 显示确认对话框（Bootstrap Modal 或 confirm）
- **AND** 确认后删除用户及其所有角色
- **AND** 刷新用户列表

### Requirement: 角色管理页面
角色管理页面 SHALL 使用 Bootstrap 风格的表格展示角色列表，包含所属用户信息，支持搜索、分页、编辑、删除。

#### Scenario: 角色列表表格
- **WHEN** 访问角色管理页面
- **THEN** 显示 Bootstrap 表格
- **AND** 表格列包括：角色 ID、角色名、职业、等级、金币、所属用户、创建时间、最后登录、操作

#### Scenario: 搜索角色
- **WHEN** 在搜索框输入关键词
- **THEN** 表格筛选显示匹配的角色（角色名或所属用户名包含关键词）

#### Scenario: 分页显示
- **WHEN** 角色数量超过每页显示数量
- **THEN** 显示分页控件

#### Scenario: 查看角色详情
- **WHEN** 点击"详情"按钮
- **THEN** 打开 Bootstrap 模态框
- **AND** 显示角色完整信息（包括解析后的 game_state：等级、经验、属性、装备、技能等）

#### Scenario: 编辑角色
- **WHEN** 点击"编辑"按钮
- **THEN** 打开 Bootstrap 模态框
- **AND** 显示角色表单（角色名、等级、金币、基础属性等）
- **AND** 提交后更新角色信息并刷新列表

#### Scenario: 删除角色
- **WHEN** 点击"删除"按钮
- **THEN** 显示确认对话框
- **AND** 确认后删除角色
- **AND** 刷新角色列表

### Requirement: 职业配置管理页面
职业配置管理页面 SHALL 使用 Bootstrap 风格的表格展示职业配置，支持创建、编辑、删除、热重载配置。

#### Scenario: 职业配置表格
- **WHEN** 访问职业配置管理页面
- **THEN** 显示 Bootstrap 表格
- **AND** 表格列包括：ID、职业 ID、职业名称、资源类型、资源上限、创建时间、更新时间、操作

#### Scenario: 创建职业配置
- **WHEN** 点击"新建职业"按钮
- **THEN** 打开 Bootstrap 模态框
- **AND** 显示职业配置表单（职业 ID、职业名称、基础属性、成长属性、基础技能、资源类型等）
- **AND** 提交后创建新职业并刷新列表

#### Scenario: 编辑职业配置
- **WHEN** 点击"编辑"按钮
- **THEN** 打开 Bootstrap 模态框
- **AND** 显示职业配置表单（预填充现有数据）
- **AND** 提交后更新职业配置并刷新列表

#### Scenario: 删除职业配置
- **WHEN** 点击"删除"按钮
- **THEN** 显示确认对话框
- **AND** 确认后删除职业配置
- **AND** 刷新职业配置列表

#### Scenario: 热重载职业配置
- **WHEN** 点击"热重载配置"按钮
- **THEN** 调用 `/api/admin/class-configs/reload` API
- **AND** 显示成功提示（Bootstrap Alert）
- **AND** 热重载后新职业配置立即生效

### Requirement: Bootstrap 样式集成
GM 面板 SHALL 使用 Bootstrap 样式，通过 npm 安装 `bootstrap` 和 `@popperjs/core` 依赖。样式 SHALL 仅在 GM 面板中使用，不影响游戏主界面的像素风格。

#### Scenario: 安装 Bootstrap 依赖
- **WHEN** 检查 package.json
- **THEN** 包含 `bootstrap` 和 `@popperjs/core` 依赖

#### Scenario: GM 面板导入 Bootstrap
- **WHEN** 查看 `src/admin/main.js` 或 `src/admin/App.vue`
- **THEN** 导入 Bootstrap CSS（`import 'bootstrap/dist/css/bootstrap.min.css'`）
- **AND** 导入 Bootstrap JS（`import 'bootstrap/dist/js/bootstrap.bundle.min.js'`）

#### Scenario: 游戏主界面不受影响
- **WHEN** 访问游戏主界面（`index.html`）
- **THEN** 不导入 Bootstrap 样式
- **AND** 保持原有的像素风格不变

### Requirement: 敏感操作需要二次确认
删除用户、删除角色、删除职业配置等敏感操作 SHALL 显示确认对话框，防止误操作。

#### Scenario: 删除用户需要确认
- **WHEN** 点击用户列表的"删除"按钮
- **THEN** 显示确认对话框："确认删除用户 XXX 及其所有角色？此操作不可撤销！"
- **AND** 仅在用户确认后执行删除

#### Scenario: 删除角色需要确认
- **WHEN** 点击角色列表的"删除"按钮
- **THEN** 显示确认对话框："确认删除角色 XXX？此操作不可撤销！"

#### Scenario: 删除职业配置需要确认
- **WHEN** 点击职业配置列表的"删除"按钮
- **THEN** 显示确认对话框："确认删除职业配置 XXX？此操作不可撤销！"
