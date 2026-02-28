## Context

### 当前状态

当前游戏使用以下技术架构：

**后端架构**：
- Express.js 作为 HTTP 服务器
- MySQL 作为数据存储，使用 Sequelize ORM
- JWT 用于用户认证
- Socket.IO 用于实时通信
- 路由分层：`/api/v1/*`（客户端 API）和 `/admin/*`（管理 API，目前为空）

**前端架构**：
- Vue 3 + Vue Router
- Vite 构建工具
- 单入口应用（`index.html`）
- 像素风格 UI

**数据库模型**：
- `users` - 用户表（缺少 `is_admin` 字段）
- `characters` - 角色表
- `class_configs` - 职业配置表
- 其他辅助表（chat_messages、rooms、battle_records 等）

### 约束条件

1. **架构约束**：保持现有前后端架构不变，不引入新的框架或技术栈
2. **样式隔离**：GM 面板使用 Bootstrap 风格，不得影响游戏主界面的像素风格
3. **多入口要求**：使用 Vite 多入口配置，实现独立的管理面板入口
4. **复用现有系统**：复用现有的用户认证体系（JWT），不创建新的认证机制
5. **数据库迁移**：使用 Sequelize CLI 进行数据库迁移

### 利益相关者

- 游戏管理员：需要通过图形化界面管理用户、角色和职业配置
- 游戏玩家：不受影响，游戏体验保持不变
- 开发团队：需要维护 GM 面板的相关代码

## Goals / Non-Goals

### Goals

1. **完整的 GM 管理功能**：提供用户、角色、职业配置的增删改查功能
2. **独立的 GM 面板入口**：通过 Vite 多入口实现独立的管理界面，不影响游戏主界面
3. **安全的管理员认证**：所有管理 API 需要通过管理员权限验证
4. **Bootstrap 风格界面**：提供简洁、易用的管理界面
5. **热重载职业配置**：支持运行时更新职业配置，无需重启服务器

### Non-Goals

1. 不实现复杂的权限管理系统（RBAC），仅区分管理员和普通用户
2. 不实现操作日志记录（可作为后续功能）
3. 不修改游戏主界面的像素风格
4. 不引入新的数据库（继续使用 MySQL）
5. 不实现实时数据推送（如在线用户统计）

## Decisions

### 1. 数据库变更方式：使用 Sequelize CLI 迁移

**决策**：使用 Sequelize CLI 的迁移功能添加 `is_admin` 字段

**理由**：
- 项目已使用 Sequelize CLI 进行数据库管理
- 迁移提供版本控制和回滚能力
- 与现有 `migrations/` 目录结构一致

**替代方案考虑**：
- 手动 SQL 脚本：缺少版本控制，不利于团队协作
- 代码中自动创建字段：不利于数据库版本管理

---

### 2. 管理员认证中间件：基于 JWT + is_admin 检查

**决策**：创建 `adminAuthMiddleware`，从 JWT token 中提取 `is_admin` 字段进行验证

**理由**：
- 复用现有的 JWT 认证机制
- 无需引入新的认证方式
- JWT token 已包含用户信息，只需增加 `is_admin` 字段

**实现细节**：
```javascript
export function createAdminAuthMiddleware(jwtSecret) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: '未提供认证令牌' })
        }

        const token = authHeader.slice(7)
        try {
            const decoded = jwt.verify(token, jwtSecret)
            if (!decoded.is_admin) {
                return res.status(403).json({ error: 'FORBIDDEN', message: '需要管理员权限' })
            }
            req.user = decoded
            next()
        } catch (err) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: '认证令牌无效' })
        }
    }
}
```

**替代方案考虑**：
- 单独的 admin token：增加复杂度，需维护两套 token
- 基于 session 的认证：与现有无状态架构不符
- 角色权限库（如 RBAC）：对于简单 GM 面板过于复杂

---

### 3. 前端架构：Vite 多入口

**决策**：配置 Vite 支持多入口，新增 `admin.html` 和 `src/admin/` 目录

**理由**：
- 保持单仓库结构，便于代码共享
- 游戏主界面和 GM 面板完全隔离，互不影响
- 符合用户"不更改当前前端项目架构"的要求

**vite.config.js 配置示例**：
```javascript
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'admin.html')
            }
        }
    }
})
```

**目录结构**：
```
src/
├── main.js              # 游戏主入口
├── admin/
│   ├── main.js          # GM 面板入口
│   ├── App.vue          # GM 面板根组件
│   ├── router/          # GM 面板路由
│   ├── views/           # GM 面板页面
│   ├── components/      # GM 面板组件
│   └── services/        # GM 面板 API 服务
└── ...                 # 游戏主界面代码（不受影响）
```

**替代方案考虑**：
- 独立仓库：增加维护成本，无法共享代码
- 单页面内嵌管理界面：样式隔离困难，影响游戏主界面
- iframe 嵌入：存在跨域和安全问题

---

### 4. 样式方案：Bootstrap 仅在 GM 面板中使用

**决策**：仅在 `src/admin/main.js` 中导入 Bootstrap，游戏主界面不导入

**理由**：
- Bootstrap 提供完整的表格、表单、模态框等组件
- Bootstrap 样式与游戏像素风格完全隔离
- 不会影响游戏主界面的渲染

**实现方式**：
```javascript
// src/admin/main.js
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
```

**游戏主入口保持不变**：
```javascript
// src/main.js
// 不导入 Bootstrap，保持像素风格
```

**替代方案考虑**：
- 自定义管理界面样式：开发成本高，需要设计更多组件
- CSS-in-JS 解决方案：与项目现有样式方式不符
- Tailwind CSS：增加学习成本，Bootstrap 更适合快速开发

---

### 5. API 路由组织：按资源分组

**决策**：将管理员 API 按资源分组到独立的路由文件

**理由**：
- 代码组织清晰，易于维护
- 符合 RESTful API 设计原则
- 与现有 `routes/client/` 结构一致

**路由结构**：
```
server/routes/admin/
├── index.js                    # 管理路由聚合入口
├── users.js                    # 用户管理路由
├── characters.js               # 角色管理路由
└── class-configs.js            # 职业配置管理路由
```

**路由挂载**：
```javascript
// server/routes/admin/index.js
import { Router } from 'express'
import { createAdminAuthMiddleware } from '../../middleware/adminAuth.js'
import { createUserAdminRouter } from './users.js'
import { createCharacterAdminRouter } from './characters.js'
import { createClassConfigAdminRouter } from './class-configs.js'

export function createAdminRouter(stmts) {
    const router = Router()
    const authMiddleware = createAdminAuthMiddleware(config.jwtSecret)

    router.use(authMiddleware)  // 所有管理路由都需认证

    router.use('/users', createUserAdminRouter(stmts))
    router.use('/characters', createCharacterAdminRouter(stmts))
    router.use('/class-configs', createClassConfigAdminRouter(stmts))

    return router
}
```

**替代方案考虑**：
- 单文件包含所有管理路由：文件过大，不利于维护
- 按功能而非资源分组（如 CRUD 分组）：与 RESTful 原则不符

---

### 6. 分页实现：使用 LIMIT/OFFSET

**决策**：使用 SQL `LIMIT` 和 `OFFSET` 实现分页

**理由**：
- 简单直接，易于理解
- 适用于中小规模数据（用户/角色数量）
- 与现有查询方式一致

**查询示例**：
```javascript
// 分页查询用户
const users = await User.findAll({
    where: search ? {
        [Op.or]: [
            { username: { [Op.like]: `%${search}%` } },
            { nickname: { [Op.like]: `%${search}%` } }
        ]
    } : undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    order: [['created_at', 'DESC']]
})
```

**返回格式**：
```json
{
    "data": [...],
    "pagination": {
        "total": 100,
        "page": 1,
        "pageSize": 20,
        "totalPages": 5
    }
}
```

**替代方案考虑**：
- Cursor-based 分页：对于简单管理场景过于复杂
- 无限滚动：不适合表格展示

---

### 7. 热重载职业配置：原子替换缓存

**决策**：使用模块级缓存变量，重载时原子替换引用

**理由**：
- 线程安全（Node.js 单线程）
- 不影响正在进行的请求
- 重载失败不影响旧配置

**实现示例**：
```javascript
let classConfigsCache = null

export function reloadClassConfigs(stmts) {
    return stmts.getAllClassConfigs.all().then(configs => {
        const newCache = {}
        configs.forEach(config => {
            newCache[config.class_id] = config
        })
        classConfigsCache = newCache  // 原子替换
        return classConfigsCache
    })
}

export function getClassConfig(classId) {
    return classConfigsCache?.[classId]
}
```

**替代方案考虑**：
- 每次查询数据库：性能较差
- 发布/订阅模式：对于此场景过于复杂

---

### 8. 删除用户的级联处理：事务 + 外键约束

**决策**：使用 Sequelize 事务 + 外键 ON DELETE CASCADE

**理由**：
- 保证数据一致性
- 外键约束自动处理级联删除
- 事务确保操作原子性

**实现方式**：
```javascript
// 外键约束（已在 characters 表中定义）
characters.belongsTo(users, { foreignKey: 'user_id', onDelete: 'CASCADE' })

// 删除用户
await sequelize.transaction(async (t) => {
    await User.destroy({ where: { id }, transaction: t })
    // 级联删除 characters 表中的相关记录
})
```

**替代方案考虑**：
- 手动删除关联数据：容易遗漏，代码复杂
- 软删除：增加存储成本，不符合"删除"语义

---

## Risks / Trade-offs

### 风险 1：Bootstrap 样式与游戏主界面样式冲突

**描述**：虽然 GM 面板和游戏主界面是独立的 Vue 应用实例，但可能存在 CSS 全局样式冲突

**缓解措施**：
- Bootstrap 在 GM 面板入口中加载，游戏主界面不加载
- GM 面板使用独立的 DOM 节点（`#admin-app`）
- 考虑为 GM 面板添加命名空间前缀（如 CSS Modules）

---

### 风险 2：管理员 token 泄露导致权限提升

**描述**：如果管理员 token 被窃取，攻击者可以访问所有管理功能

**缓解措施**：
- token 设置合理的过期时间（如 24 小时）
- 建议管理员定期更换密码
- 未来可考虑添加操作日志审计
- 敏感操作（删除）需要二次确认

---

### 风险 3：热重载职业配置导致运行时错误

**描述**：重载后的配置格式不正确或缺失字段，可能导致新创建角色出错

**缓解措施**：
- 重载前验证配置格式
- 重载失败时保留旧配置，记录错误日志
- 提供 API 验证单个配置的完整性
- 建议在低峰期进行配置更新

---

### 风险 4：删除用户/角色导致数据丢失

**描述**：误删除操作可能导致重要数据丢失，且无法恢复

**缓解措施**：
- 前端显示二次确认对话框
- 明确提示"此操作不可撤销"
- 未来可考虑回收站功能
- 数据库定期备份

---

### 权衡 1：简单权限系统 vs RBAC

**决策**：采用简单的管理员/普通用户二分法

**权衡**：
- 优点：实现简单，易于理解，满足当前需求
- 缺点：无法细粒度控制权限（如只能查看不能删除）

**未来扩展**：如需要细粒度权限，可引入 RBAC 系统

---

### 权衡 2：分页方式：LIMIT/OFFSET vs Cursor

**决策**：采用 LIMIT/OFFSET

**权衡**：
- 优点：实现简单，支持跳页
- 缺点：深度分页性能较差（OFFSET 值大时）

**适用场景**：数据规模较小（用户/角色数量 < 10,000）

---

## Migration Plan

### 部署步骤

1. **后端部署**

   a. 数据库迁移
   ```bash
   npm run migrate:prod
   ```

   b. 设置初始管理员
   ```sql
   UPDATE users SET is_admin = 1 WHERE username = 'admin';
   ```

   c. 重启服务
   ```bash
   npm run server:prod
   ```

2. **前端部署**

   a. 安装依赖
   ```bash
   npm install bootstrap @popperjs/core
   ```

   b. 构建生产版本
   ```bash
   npm run build
   ```

   c. 部署构建产物（`dist/` 目录）

3. **验证**

   a. 使用管理员账号登录游戏主界面，确认"管理面板"按钮显示
   b. 点击按钮跳转到 GM 面板，确认可以正常登录
   c. 测试用户、角色、职业配置的 CRUD 功能
   d. 测试非管理员账号无法访问 GM 面板

### 回滚策略

1. **数据库回滚**
   ```bash
   npm run migrate:undo:prod
   ```

2. **前端回滚**
   - 切换回之前的代码版本
   - 重新构建部署

3. **服务回滚**
   - 停止新版本服务
   - 启动旧版本服务

---

## Open Questions

1. **初始管理员账号设置**：第一个管理员账号如何设置？
   - 建议：在部署时手动执行 SQL 更新指定用户为管理员
   - 或：在迁移文件中添加种子数据，设置默认管理员

2. **职业配置热重载频率**：是否需要限制热重载频率？
   - 建议：暂不限制，监控实际使用情况后再决定

3. **操作日志**：是否需要记录管理员的操作历史？
   - 当前：不实现（作为非目标）
   - 未来：可考虑添加操作日志审计功能

4. **多管理员协作**：多个管理员同时操作时，如何处理并发冲突？
   - 建议：暂不考虑，乐观更新即可
   - 未来：如需要，可引入乐观锁或版本号机制
