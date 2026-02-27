## 1. 数据库层

- [x] 1.1 创建 `user_roles` 表迁移文件
- [x] 1.2 创建 `admin_logs` 表迁移文件
- [x] 1.3 创建 `UserRole` Sequelize 模型
- [x] 1.4 创建 `AdminLog` Sequelize 模型
- [x] 1.5 在 models/index.js 中注册新模型和关联关系

## 2. 后端数据访问层

- [x] 2.1 在 `db.js` 中添加 `isAdminUser` adapter
- [x] 2.2 在 `db.js` 中添加 `setUserAdmin` adapter
- [x] 2.3 在 `db.js` 中添加 `listAllUsers` adapter（支持分页）
- [x] 2.4 在 `db.js` 中添加 `getUserById` adapter（返回完整用户信息）
- [x] 2.5 在 `db.js` 中添加 `updateUserClass` adapter
- [x] 2.6 在 `db.js` 中添加 `updateUserLevel` adapter
- [x] 2.7 在 `db.js` 中添加 `updateUserExperience` adapter
- [x] 2.8 在 `db.js` 中添加 `deleteUser` adapter
- [x] 2.9 在 `db.js` 中添加 `listAllClassConfigs` adapter
- [x] 2.10 在 `db.js` 中添加 `getClassConfigById` adapter
- [x] 2.11 在 `db.js` 中添加 `createClassConfig` adapter
- [x] 2.12 在 `db.js` 中添加 `updateClassConfig` adapter
- [x] 2.13 在 `db.js` 中添加 `deleteClassConfig` adapter
- [x] 2.14 在 `db.js` 中添加 `logAdminOperation` adapter

## 3. 后端 API 路由

- [x] 3.1 创建权限验证中间件 `requireAdmin`
- [x] 3.2 创建 `admin.js` 路由文件
- [x] 3.3 实现 `GET /api/admin/check` 接口
- [x] 3.4 实现 `GET /api/admin/users` 接口（分页）
- [x] 3.5 实现 `GET /api/admin/users/:id` 接口
- [x] 3.6 实现 `PATCH /api/admin/users/:id/class` 接口
- [x] 3.7 实现 `PATCH /api/admin/users/:id/level` 接口
- [x] 3.8 实现 `PATCH /api/admin/users/:id/experience` 接口
- [x] 3.9 实现 `DELETE /api/admin/users/:id` 接口
- [x] 3.10 实现 `GET /api/admin/class-config` 接口
- [x] 3.11 实现 `GET /api/admin/class-config/:id` 接口
- [x] 3.12 实现 `POST /api/admin/class-config` 接口
- [x] 3.13 实现 `PUT /api/admin/class-config/:id` 接口
- [x] 3.14 实现 `DELETE /api/admin/class-config/:id` 接口
- [x] 3.15 在 `index.js` 中挂载 admin 路由

## 4. 前端路由和页面

- [x] 4.1 创建 `src/admin` 目录结构
- [x] 4.2 创建 `src/admin/index.html` 首页（功能入口）
- [x] 4.3 创建 `src/admin/users.html` 用户管理页面
- [x] 4.4 创建 `src/admin/class-config.html` 职业配置管理页面
- [x] 4.5 创建 `src/admin/js/admin.js` 管理面板入口 JS
- [x] 4.6 创建 `src/admin/js/users.js` 用户管理 JS
- [x] 4.7 创建 `src/admin/js/class-config.js` 职业配置管理 JS
- [x] 4.8 在主路由中添加 `/admin` 路由配置

## 5. 前端 UI 组件和交互

- [x] 5.1 引入 Bootstrap 5 CSS 和 CDN
- [x] 5.2 创建 Bootstrap 导航栏组件
- [x] 5.3 实现用户列表表格（带分页）
- [x] 5.4 实现职业配置表格
- [x] 5.5 创建用户详情模态框（Modal）
- [x] 5.6 创建职业配置编辑模态框
- [x] 5.7 创建删除确认模态框
- [x] 5.8 实现 GM 面板按钮（仅管理员可见）

## 6. 前端 API 调用

- [x] 6.1 创建 API 客户端调用函数
- [x] 6.2 实现 `checkAdminStatus` 函数
- [x] 6.3 实现用户列表获取函数
- [x] 6.4 实现用户详情获取函数
- [x] 6.5 实现用户职业更新函数
- [x] 6.6 实现用户等级更新函数
- [x] 6.7 实现用户经验更新函数
- [x] 6.8 实现用户删除函数
- [x] 6.9 实现职业配置列表获取函数
- [x] 6.10 实现职业配置详情获取函数
- [x] 6.11 实现职业配置创建函数
- [x] 6.12 实现职业配置更新函数
- [x] 6.13 实现职业配置删除函数

## 7. 测试

- [ ] 7.1 编写管理员权限验证单元测试
- [ ] 7.2 编写用户 API 集成测试
- [ ] 7.3 编写职业配置 API 集成测试
- [ ] 7.4 手动测试 GM 面板权限控制
- [ ] 7.5 手动测试用户管理功能
- [ ] 7.6 手动测试职业配置管理功能
- [ ] 7.7 测试敏感操作的二次确认
- [ ] 7.8 验证操作日志记录

## 8. 部署和文档

- [x] 8.1 运行数据库迁移
- [x] 8.2 手动设置第一个管理员账号
- [x] 8.3 更新 README.md 添加 GM 面板使用说明
- [x] 8.4 更新 ChangelogData.js 添加版本变更记录
