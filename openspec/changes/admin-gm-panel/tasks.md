## 1. 数据库与后端基础

- [x] 1.1 创建数据库迁移文件，为 users 表添加 is_admin 字段（TINYINT，默认 0）
- [x] 1.2 执行数据库迁移，验证 is_admin 字段创建成功
- [x] 1.3 更新 User Sequelize 模型，添加 is_admin 字段定义
- [x] 1.4 创建管理员认证中间件 `server/middleware/adminAuth.js`
- [x] 1.5 修改登录接口，在返回的 user 对象中包含 is_admin 字段
- [x] 1.6 修改注册接口，在返回的 user 对象中包含 is_admin 字段
- [x] 1.7 在迁移文件中添加种子数据，设置初始管理员账号（或部署后手动设置）

## 2. 管理员 API - 用户管理

- [x] 2.1 创建 `server/routes/admin/users.js` 用户管理路由文件
- [x] 2.2 实现 GET /api/admin/users - 获取用户列表（支持分页、搜索）
- [x] 2.3 实现 GET /api/admin/users/:id - 获取单个用户详情
- [x] 2.4 实现 PUT /api/admin/users/:id - 更新用户信息（nickname、is_admin、auto_login）
- [x] 2.5 实现 DELETE /api/admin/users/:id - 删除用户（级联删除关联角色）
- [x] 2.6 更新 `server/routes/admin/index.js`，挂载用户管理路由并应用认证中间件

## 3. 管理员 API - 角色管理

- [x] 3.1 创建 `server/routes/admin/characters.js` 角色管理路由文件
- [ ] 3.2 实现 GET /api/admin/characters - 获取角色列表（支持分页、搜索、关联用户信息）
- [ ] 3.3 实现 GET /api/admin/characters/:id - 获取单个角色详情（包含解析后的 game_state）
- [ ] 3.4 实现 PUT /api/admin/characters/:id - 更新角色信息（支持 game_state 增量更新）
- [ ] 3.5 实现 DELETE /api/admin/characters/:id - 删除角色
- [x] 3.6 更新 `server/routes/admin/index.js`，挂载角色管理路由

## 4. 管理员 API - 职业配置管理

- [x] 4.1 创建 `server/routes/admin/class-configs.js` 职业配置管理路由文件
- [ ] 4.2 实现 GET /api/admin/class-configs - 获取职业配置列表
- [ ] 4.3 实现 POST /api/admin/class-configs - 创建职业配置（包含字段验证）
- [ ] 4.4 实现 PUT /api/admin/class-configs/:id - 更新职业配置
- [ ] 4.5 实现 DELETE /api/admin/class-configs/:id - 删除职业配置
- [ ] 4.6 实现 POST /api/admin/class-configs/reload - 热重载职业配置到内存
- [x] 4.7 更新 `server/routes/admin/index.js`，挂载职业配置管理路由

## 5. 前端基础配置

- [x] 5.1 安装 bootstrap 和 @popperjs/core 依赖
- [x] 5.2 修改 vite.config.js，配置多入口（index 和 admin）
- [x] 5.3 创建 admin.html 入口文件
- [x] 5.4 创建 src/admin/ 目录结构（main.js、App.vue、router、views、components、services）

## 6. GM 面板入口与路由

- [x] 6.1 创建 src/admin/main.js，导入 Bootstrap CSS/JS，创建独立 Vue 应用
- [x] 6.2 创建 src/admin/App.vue，定义 GM 面板根组件和布局
- [x] 6.3 创建 src/admin/router/index.js，配置 GM 面板路由（登录页、用户管理、角色管理、职业配置）
- [ ] 6.4 创建 src/admin/router/guards.js，实现路由守卫（验证登录状态和管理员权限）

## 7. GM 面板登录功能

- [x] 7.1 创建 src/admin/views/Login.vue 登录页面组件
- [x] 7.2 创建 src/admin/services/auth.js，封装登录 API 调用
- [x] 7.3 实现登录表单，复用 /api/auth/login 接口
- [x] 7.4 实现登录成功后检查 is_admin 字段，非管理员显示错误提示
- [x] 7.5 实现登录状态持久化（localStorage 存储 token 和用户信息）
- [x] 7.6 实现登出功能，清除本地存储并跳转到登录页

## 8. GM 面板主页与导航

- [x] 8.1 创建 src/admin/views/Home.vue 主页组件
- [x] 8.2 实现顶部导航栏（包含用户信息和三个主要模块入口）
- [x] 8.3 实现登出按钮功能
- [x] 8.4 创建 src/admin/components/Navbar.vue 导航组件（可选）

## 9. 用户管理页面

- [x] 9.1 创建 src/admin/services/users.js，封装用户管理 API
- [x] 9.2 创建 src/admin/views/Users.vue 用户管理页面
- [x] 9.3 实现用户列表表格（使用 Bootstrap Table 组件）
- [x] 9.4 实现搜索功能（按用户名或昵称搜索）
- [x] 9.5 实现分页控件
- [x] 9.6 创建 src/admin/components/UserEditModal.vue 用户编辑模态框
- [x] 9.7 实现编辑用户功能（修改昵称、设置/取消管理员）
- [x] 9.8 实现删除用户功能（含二次确认对话框）

## 10. 角色管理页面

- [x] 10.1 创建 src/admin/services/characters.js，封装角色管理 API
- [x] 10.2 创建 src/admin/views/Characters.vue 角色管理页面
- [ ] 10.3 实现角色列表表格（包含所属用户信息）
- [ ] 10.4 实现搜索功能（按角色名或用户名搜索）
- [ ] 10.5 实现分页控件
- [ ] 10.6 创建 src/admin/components/CharacterDetailModal.vue 角色详情模态框
- [ ] 10.7 创建 src/admin/components/CharacterEditModal.vue 角色编辑模态框
- [ ] 10.8 实现编辑角色功能（修改角色名、等级、金币、基础属性等）
- [ ] 10.9 实现删除角色功能（含二次确认对话框）

## 11. 职业配置管理页面

- [x] 11.1 创建 src/admin/services/class-configs.js，封装职业配置管理 API
- [x] 11.2 创建 src/admin/views/ClassConfigs.vue 职业配置管理页面
- [ ] 11.3 实现职业配置列表表格
- [ ] 11.4 创建 src/admin/components/ClassConfigEditModal.vue 职业配置编辑模态框
- [ ] 11.5 实现创建职业配置功能（包含表单验证）
- [ ] 11.6 实现编辑职业配置功能
- [ ] 11.7 实现删除职业配置功能（含二次确认对话框）
- [ ] 11.8 实现热重载配置功能，显示成功提示（Bootstrap Alert）

## 12. 游戏主界面集成

- [x] 12.1 在游戏主界面登录状态存储中添加 is_admin 字段
- [x] 12.2 在游戏主界面添加"管理面板"按钮（条件渲染：仅管理员显示）
- [x] 12.3 实现按钮点击跳转到 /admin.html 的功能
- [x] 12.4 验证游戏主界面样式不受影响（保持像素风格）

## 13. 测试与验证

- [ ] 13.1 后端测试：使用管理员 token 访问所有管理 API，验证认证正确性
- [ ] 13.2 后端测试：使用普通用户 token 访问管理 API，验证返回 403
- [ ] 13.3 后端测试：测试分页、搜索、排序功能
- [ ] 13.4 后端测试：测试级联删除（删除用户后角色也被删除）
- [ ] 13.5 后端测试：测试职业配置热重载功能
- [ ] 13.6 前端测试：测试管理员登录流程
- [ ] 13.7 前端测试：测试非管理员登录被拒绝
- [ ] 13.8 前端测试：测试用户、角色、职业配置的完整 CRUD 流程
- [ ] 13.9 前端测试：验证删除操作的二次确认对话框
- [ ] 13.10 前端测试：验证游戏主界面"管理面板"按钮的显示逻辑
- [ ] 13.11 集成测试：验证游戏主界面跳转到 GM 面板的功能
- [ ] 13.12 集成测试：验证 Bootstrap 样式与游戏主界面样式不冲突

## 14. 部署准备

- [ ] 14.1 执行生产环境数据库迁移
- [ ] 14.2 设置初始管理员账号
- [ ] 14.3 构建生产版本前端代码
- [ ] 14.4 验证构建产物包含 index.html 和 admin.html
- [ ] 14.5 部署到生产环境
- [ ] 14.6 生产环境最终验证（所有功能正常）
