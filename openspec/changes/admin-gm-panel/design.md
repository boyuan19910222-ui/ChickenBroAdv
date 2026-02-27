## Context

当前游戏使用 MySQL + Sequelize ORM 作为数据持久化层，用户数据存储在 `users` 和 `characters` 表中。玩家职业配置存储在 `class_configs` 表中。目前所有数据修改需要直接操作数据库，缺乏可视化管理界面，存在安全风险且操作不便。

技术栈：
- 后端：Node.js + Express + Sequelize ORM
- 前端：JavaScript + 路由系统（现有像素风格UI框架）
- 数据库：MySQL

现有约束：
- 遵循现有的 statement adapter 模式进行数据库操作
- 所有 API 使用现有认证机制（JWT/OAuth）
- 管理面板 `/admin` 路由使用 Bootstrap 风格（非像素风格）

## Goals / Non-Goals

**Goals:**
- 提供安全的 GM 管理面板，支持用户数据和职业配置的可视化管理
- 实现管理员角色系统，支持权限验证
- 记录所有管理操作日志，确保可追溯性
- 前端管理界面使用 Bootstrap 风格，保持与游戏主界面风格区分

**Non-Goals:**
- 不涉及游戏核心玩法数据的实时编辑（战斗中的数据）
- 不提供批量操作功能（仅单条记录操作）
- 不涉及权限细分（仅有管理员/非管理员两级）

## Decisions

### 1. 数据库模型设计

**决策：** 新增 `user_roles` 表，使用外键关联 `users` 表

**模型定义：**
```javascript
{
  id: { type: INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: INTEGER.UNSIGNED, allowNull: false, unique: true, references: User.id },
  is_admin: { type: TINYINT(1), allowNull: false, defaultValue: 0 },
  created_at: { type: DATE, defaultValue: NOW }
}
```

**理由：**
- 外键关联确保数据完整性，防止孤立记录
- `user_id` 设为 unique，每个用户只有一条角色记录
- 使用 `TINYINT(1)` 存储布尔值，与现有 User 表的 `auto_login` 字段类型一致

**备选方案（未采纳）：**
- 在 `users` 表添加 `is_admin` 字段：需要修改现有表结构，影响范围大
- 使用独立的权限系统：过度设计，当前需求仅需两级权限

### 2. 权限验证中间件

**决策：** 创建统一的 `requireAdmin` 中间件，在所有 GM API 路由前验证

```javascript
async function requireAdmin(req, res, next) {
  const userId = req.user?.id
  const isAdmin = await isAdminUser(userId)
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}
```

**理由：**
- 中间件模式确保权限检查逻辑统一，避免重复代码
- 符合 Express 最佳实践
- 便于后续扩展（如添加日志记录）

### 3. API 路由设计

**决策：** 所有 GM API 路径统一前缀 `/api/admin/*`

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/admin/check` | GET | 验证当前用户是否为管理员 |
| `/api/admin/users` | GET | 分页查询用户列表 |
| `/api/admin/users/:id` | GET | 查询用户详情 |
| `/api/admin/users/:id/class` | PATCH | 修改用户职业 |
| `/api/admin/users/:id/level` | PATCH | 修改用户等级 |
| `/api/admin/users/:id/experience` | PATCH | 修改用户经验 |
| `/api/admin/users/:id` | DELETE | 删除用户 |
| `/api/admin/class-config` | GET | 查询所有职业配置 |
| `/api/admin/class-config/:id` | GET | 查询单个职业配置 |
| `/api/admin/class-config` | POST | 创建职业配置 |
| `/api/admin/class-config/:id` | PUT | 更新职业配置 |
| `/api/admin/class-config/:id` | DELETE | 删除职业配置 |

**理由：**
- 路径前缀统一，便于权限控制
- RESTful 风格与现有 API 保持一致
- 使用 PATCH 而非 PUT 进行部分更新，语义更准确

### 4. 前端路由和UI设计

**决策：** 使用独立的路由系统处理管理面板，UI 采用 Bootstrap 5

**路由结构：**
```
/admin          # GM 面板首页，显示功能入口
/admin/users    # 用户管理页面
/admin/class-config  # 职业配置管理页面
```

**UI 设计要点：**
- 使用 Bootstrap 5 组件（Table, Modal, Form, Nav）
- 与游戏主界面风格区分，使用现代扁平化设计
- 敏感操作（删除）使用 Bootstrap Modal 二次确认

**理由：**
- Bootstrap 提供成熟的管理后台组件，开发效率高
- 现代设计风格与游戏像素风格区分开，避免混淆
- Bootstrap Modal 原生支持二次确认交互

**备选方案（未采纳）：**
- 使用现有像素风格UI：不符合用户明确要求
- 自定义管理面板UI：开发成本高，Bootstrap 已提供完整方案

### 5. 操作日志记录

**决策：** 创建 `admin_logs` 表记录所有 GM 操作，使用统一的日志记录函数

```javascript
async function logAdminOperation(userId, operationType, targetId, oldValue, newValue) {
  await AdminLog.create({
    admin_user_id: userId,
    operation_type: operationType, // UPDATE_USER, UPDATE_CONFIG, DELETE_USER, etc.
    target_id: targetId,
    old_value: oldValue ? JSON.stringify(oldValue) : null,
    new_value: newValue ? JSON.stringify(newValue) : null,
    created_at: new Date()
  })
}
```

**理由：**
- 集中记录便于查询和审计
- JSON 格式存储新旧值，支持复杂结构的完整记录
- 独立表设计不影响现有性能

### 6. statement adapter 扩展

**决策：** 在 `db.js` 中新增管理员相关的 statement adapter

```javascript
{
  isAdminUser: { async get(userId) { ... } },
  setUserAdmin: { async run(userId, isAdmin) { ... } },
  listAllUsers: { async all(page, limit) { ... } },
  // ... 其他适配器
}
```

**理由：**
- 保持与现有代码风格一致
- 便于单元测试（可 mock adapter）
- 不破坏现有调用方式

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| [安全性] 管理员权限泄露可能导致数据篡改 | 1. 所有 GM API 强制权限验证中间件<br>2. 操作日志完整记录，可追溯<br>3. 建议后续添加二次认证 |
| [数据完整性] 删除职业配置可能导致已有玩家角色异常 | 1. 删除前检查是否有角色使用该职业<br>2. 抛出明确错误提示<br>3. 或标记为删除而非物理删除（软删除） |
| [性能] 查询所有用户列表可能返回大量数据 | 1. 强制分页（默认 limit=20）<br>2. 仅返回必要字段（id, name, class, level, created_at）<br>3. 添加索引优化查询 |
| [兼容性] Bootstrap 与现有路由系统集成 | 1. 使用独立路由前缀 `/admin`，不影响现有路由<br>2. 条件加载 Bootstrap CSS/JS，仅管理面板引入 |
| [用户体验] GM 面板与游戏风格差异较大 | 1. 明确标识管理区域入口<br>2. 使用一致的配色方案适配品牌色<br>3. 提供返回游戏按钮 |

## Migration Plan

### 部署步骤

1. **数据库迁移**
   ```bash
   # 创建 user_roles 表和 admin_logs 表
   npm run migrate
   ```

2. **后端部署**
   - 部署新的 API 路由
   - 部署权限验证中间件
   - 更新 db.js 添加新的 statement adapters

3. **前端部署**
   - 部署管理面板路由
   - 引入 Bootstrap 5 CSS/JS（仅管理页面加载）

4. **初始化管理员**
   ```bash
   # 手动在数据库设置第一个管理员
   INSERT INTO user_roles (user_id, is_admin) VALUES (1, 1);
   ```

### 回滚策略

1. 回退代码：Git revert 到部署前的 commit
2. 数据库回滚：`npm run migrate:undo` 删除新增表
3. 如涉及用户数据修改，需人工检查日志恢复

## Open Questions

1. [待定] 是否需要操作日志的查询界面？（当前设计仅记录，不提供查询功能）
2. [待定] 是否需要支持批量操作（如批量修改多个用户等级）？
3. [待定] 管理员账号数量限制？是否允许多个管理员？
