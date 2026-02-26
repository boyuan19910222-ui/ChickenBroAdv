## Context

### 现状

服务端数据层使用 `better-sqlite3`，本地 SQLite 文件（`./data/chickenBro.db`）存储三张表：`users`、`characters`、`battle_records`。所有 SQL 在 `server/db.js` 中手工拼写为预处理语句（prepared statements），对外暴露两个单例——`getDb()` 与 `getStatements()`，业务层（`server/index.js`、`auth.js` 等）直接调用 `stmts.<方法>.get/run/all()`。

测试侧（`tests/unit/server/auth.test.js`）通过直接 `createDatabase(':memory:')` + `prepareStatements(db)` 构造隔离实例。

### 约束

- **接口完全兼容**：调用方（业务路由、测试）使用 `stmts.<名称>` 方式调用，返回值结构不变。
- 现有代码为 ESM（`import/export`），ORM 选型需支持 Node.js ESM。
- 服务端为 Node.js，无 TypeScript，设计保持纯 JS 可用。

---

## Goals / Non-Goals

**Goals:**
- 将持久化后端从本地 SQLite 切换为线上 MySQL（连接池、环境变量配置、健康检查）。
- 引入 ORM 替代手写 SQL，实现模型定义、查询构建、事务的统一管理。
- 通过"语句兼容层"包装 ORM，使业务层调用接口保持不变（`stmts.<名称>.get/run/all/first`）。
- 建立 Schema 迁移机制，支持版本化迁移与回滚。
- 保持测试隔离能力（支持内存/临时 MySQL 实例注入）。

**Non-Goals:**
- 不修改任何业务路由或前端代码。
- 不引入 TypeScript；不做 ORM 模型的类型生成。
- 不修改现有 API 的请求/响应结构。
- 不评估或迁移到其他数据库引擎（PostgreSQL 等）。

---

## Decisions

### 1. ORM 选型：Sequelize

**选择**：使用 **Sequelize v6**（`sequelize` + `mysql2`）。

**理由**：
- 成熟度最高，MySQL 支持完善，拥有大量生产验证案例。
- 原生支持 CommonJS 与 ESM，与现有 Node.js ESM 项目兼容。
- 内置迁移工具（`sequelize-cli`），支持版本化 SQL 迁移文件，方便 Schema 演进与回滚。
- 与 Drizzle/Prisma 相比，不需要代码生成步骤，纯 JS 即可使用。

**备选排除原因**：
- Prisma：需要 `.prisma` schema 文件 + 代码生成，增加工具链复杂度，且 ESM 支持有历史坑。
- Drizzle：适合 TypeScript 项目，纯 JS 使用体验欠佳，生态较新。
- Knex：查询构建器，非 ORM，仍需手动定义结构，解决不了"手写 SQL"的核心问题。

---

### 2. 接口兼容：语句适配器（Statement Adapter）

**选择**：在 `server/db.js` 中保留 `getStatements()` 接口，内部实现替换为"语句适配器"——每个 `stmts.<名称>` 返回一个对象，实现 `.get()` / `.run()` / `.all()` / `.first()` 方法，内部调用 Sequelize 模型方法。

```
旧调用路径：
  stmts.findUserByUsername.get(username)
  → better-sqlite3 prepared statement

新调用路径：
  stmts.findUserByUsername.get(username)
  → StatementAdapter → Sequelize User.findOne({ where: { username } })
```

**理由**：零侵入业务层，迁移风险最低；测试只需替换 db 实例注入方式。

---

### 3. 模型与迁移分离

- `server/models/` — Sequelize 模型定义（`User.js`、`Character.js`、`BattleRecord.js`）
- `server/migrations/` — 版本化迁移文件（由 `sequelize-cli` 管理），独立于模型
- `server/db.js` — 保留对外接口（`getStatements`、`closeDb`），内部切换为 Sequelize 初始化

---

### 4. 连接配置：环境变量驱动

新增以下环境变量（`config.js` 扩展）：

| 变量 | 用途 | 默认值 |
|------|------|--------|
| `DB_HOST` | MySQL 主机 | `localhost` |
| `DB_PORT` | MySQL 端口 | `3306` |
| `DB_NAME` | 数据库名 | `chickenbroadv` |
| `DB_USER` | 用户名 | `root` |
| `DB_PASSWORD` | 密码 | 无默认值，必须设置 |
| `DB_POOL_MAX` | 连接池上限 | `10` |
| `DB_POOL_MIN` | 连接池下限 | `2` |

旧 `DB_PATH`（SQLite 文件路径）仅用于测试回退，生产环境由上述变量驱动。

---

### 5. 测试隔离策略

测试环境通过以下方式保持隔离：
- 单元测试：使用独立 MySQL 测试数据库（`DB_NAME=chickenbroadv_test`），每个测试套件前清空并重建表。
- 旧 `:memory:` 模式将不再支持（better-sqlite3 特性），迁移后以 `chickenbroadv_test` 替代。
- `createDatabase` / `prepareStatements` 导出保留，但内部切换为 Sequelize 实例初始化与适配器构建。

---

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 语句适配器语义差异（同步 vs 异步） | 高 — better-sqlite3 为同步，Sequelize 为 async | 全部适配器内部返回 Promise，调用方改用 `await stmts.xxx.get()` |
| MySQL 与 SQLite 类型差异（`INTEGER` vs `INT`，`TEXT` vs `VARCHAR`） | 中 — 迁移 SQL 需仔细核对 | 在迁移文件中显式声明类型，迁移后做数据一致性验证 |
| `game_state` 字段为大型 JSON 字符串 | 中 — MySQL 默认 TEXT 有 65535 字节限制 | 改用 `MEDIUMTEXT` / `LONGTEXT` 或 `JSON` 类型 |
| SQLite trigger（每用户最多5角色）失效 | 低 — MySQL 也支持 trigger，但迁移中可能遗漏 | 迁移脚本中显式重建同等效果的 trigger 或在应用层校验 |
| `auto_login` column 的 ALTER 迁移逻辑 | 低 — 原有手动 ALTER 逻辑需移入迁移文件 | 在第一个迁移文件中完整定义所有列，不依赖运行时 ALTER |
| 测试层 `:memory:` 模式失效 | 中 — 现有单元测试依赖 SQLite 内存数据库 | 提供 `createTestDb()` 辅助函数，内部连接测试 MySQL 并 sync |

**最大 trade-off**：调用方必须从同步 `.get()` 改为 `await .get()`，这是唯一不可避免的上层改动，但属于 JS 语言惯例，不影响接口契约语义。

---

## Migration Plan

### 阶段 0 — 准备（不动业务代码）
1. 申请/准备线上 MySQL 实例，配置 `DB_*` 环境变量。
2. 安装依赖：`npm install sequelize mysql2 sequelize-cli`。
3. 初始化 `sequelize-cli` 配置文件（`.sequelizerc`、`config/database.js`）。

### 阶段 1 — 模型与迁移文件
4. 在 `server/models/` 建立 Sequelize 模型（`User`、`Character`、`BattleRecord`），与现有表结构对齐。
5. 编写初始迁移文件，在 MySQL 中建立等价 schema（含 index、FK、trigger/应用层约束）。
6. 执行 `sequelize db:migrate` 验证迁移文件正确性。

### 阶段 2 — 语句适配器
7. 在 `server/db.js` 中新增 `buildStatementAdapters(sequelizeInstance)` 函数，返回与 `prepareStatements` 相同形状的对象。
8. 每个适配器方法内部调用对应 Sequelize 查询，返回 Promise。
9. 更新 `getStatements()` 内部调用 `buildStatementAdapters`。

### 阶段 3 — 调用方 async 改造
10. 对 `server/index.js`、`server/auth.js`、`server/characters.js` 等所有 `stmts.xxx.get/run/all()` 调用添加 `await`（路由回调已为 async，无需额外包装）。

### 阶段 4 — 测试层更新
11. 更新 `auth.test.js` 等单元测试，以 `chickenbroadv_test` 数据库替代 `:memory:`，每次测试前执行 `sync({ force: true })`。

### 阶段 5 — 数据迁移（存量数据）
12. 编写一次性数据迁移脚本，将本地 SQLite 文件导出为 SQL，导入至 MySQL。
13. 上线日执行迁移脚本，切换环境变量，重启服务。

### 回滚策略
- 切换前保留 SQLite 文件备份。
- 旧 `better-sqlite3` 依赖暂不删除，打一个 `git tag` 作为回滚点。
- 若上线后 30 分钟内出现严重问题，恢复环境变量指向旧 SQLite 路径并重启（需临时保留代码双路径）。

---

## Open Questions

1. **线上 MySQL 实例提供方**：阿里云 RDS / 腾讯云 TDSQL / 自建？影响网络延迟与 SSL 配置。
2. **`game_state` 字段大小上限**：单个角色存档 JSON 实际最大体积是多少？决定使用 `TEXT` / `MEDIUMTEXT` / `JSON`。
3. **测试 CI 环境**：CI/CD 中是否有 MySQL 服务可用（GitHub Actions MySQL service container）？影响测试隔离方案。
4. **存量 SQLite 数据迁移范围**：生产环境是否有需要迁移的真实用户数据，还是可以从零开始？
