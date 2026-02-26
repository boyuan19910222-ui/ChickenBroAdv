## 1. 准备工作与依赖安装

- [x] 1.1 安装 `sequelize`、`mysql2`、`sequelize-cli` 到 `package.json`（`npm install sequelize mysql2 sequelize-cli`）
- [x] 1.2 在 `server/config.js` 中新增 `DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER`、`DB_PASSWORD`、`DB_POOL_MAX`、`DB_POOL_MIN` 环境变量读取，并验证 `DB_PASSWORD` 必填（缺失时启动抛出明确错误）
- [x] 1.3 创建 `.sequelizerc` 文件，指定 models 目录为 `server/models`、migrations 目录为 `server/migrations`、config 文件为 `server/config/database.cjs`
- [x] 1.4 创建 `server/config/database.cjs`，导出 sequelize-cli 所需的环境配置（development / test / production）

## 2. Sequelize 模型定义

- [x] 2.1 创建 `server/models/index.js`，初始化 Sequelize 实例（连接池配置来自 `config.js`），并导出 `sequelize` 实例与所有模型
- [x] 2.2 创建 `server/models/User.js`，定义 `users` 表模型，字段含：`id`、`username`（唯一）、`password_hash`、`nickname`、`created_at`、`last_login`、`oauth_provider`、`oauth_id`、`auto_login`，`timestamps: false`
- [x] 2.3 创建 `server/models/Character.js`，定义 `characters` 表模型，字段含：`id`、`user_id`、`name`、`class`、`level`、`game_state`（`DataTypes.TEXT('medium')`）、`created_at`、`updated_at`、`last_played_at`，设置外键关联 `User`，`timestamps: false`
- [x] 2.4 创建 `server/models/BattleRecord.js`，定义 `battle_records` 表模型，字段含：`id`、`user_id`、`dungeon_id`、`result`、`duration`、`created_at`，外键关联 `User`，`timestamps: false`
- [x] 2.5 验证三个模型均使用 `underscored: false`（保持 snake_case 字段名原样映射，不自动转换）

## 3. 数据库迁移文件

- [x] 3.1 创建初始迁移文件（`server/migrations/20260226000000-create-initial-schema.js`），在 MySQL 中建立 `users`、`characters`、`battle_records` 三张表，完整定义所有字段类型、`NOT NULL`、默认值、外键
- [x] 3.2 在迁移文件中为 `characters` 表添加 `idx_characters_user`（`user_id`）和 `idx_characters_last_played`（`user_id, last_played_at DESC`）索引
- [x] 3.3 在迁移文件中将 `characters.game_state` 定义为 `MEDIUMTEXT`（不使用 `TEXT`）
- [x] 3.4 在迁移文件 `up` 中通过 `CREATE TRIGGER` 或在应用层添加每用户最多 5 角色的约束（与 down 方向的 `DROP TRIGGER` 对应）
- [ ] 3.5 对测试数据库执行 `sequelize db:migrate`，验证三张表和索引均被正确创建
- [ ] 3.6 执行 `sequelize db:migrate:undo`，验证回滚成功，再次 `migrate` 确认幂等

## 4. 语句适配器层

- [x] 4.1 在 `server/db.js` 中新增 `buildStatementAdapters(sequelizeInstance)` 函数，返回与原 `prepareStatements()` 键名完全相同的对象
- [x] 4.2 实现 User 相关适配器：`insertUser`、`findUserByUsername`、`findUserById`、`updateLastLogin`、`updateAutoLogin`，每个实现 `.get()` / `.run()` / `.all()` 方法（返回 Promise）
- [x] 4.3 实现 Character 相关适配器：`insertCharacter`（含每用户 5 角色上限检查，违反时抛出含 `'Character limit reached'` 的错误）、`findCharactersByUserId`、`findCharacterById`、`findCharacterByIdAndUserId`、`updateCharacter`、`updateCharacterGameState`、`deleteCharacter`、`countCharactersByUserId`
- [x] 4.4 实现 BattleRecord 相关适配器：`insertBattleRecord`、`getBattleRecords`
- [x] 4.5 确保所有 `.run()` 返回对象包含 `changes` 字段（affected rows），与 `better-sqlite3` 接口语义兼容
- [x] 4.6 确保所有 `.get()` 在记录不存在时返回 `undefined`（不抛出异常）
- [x] 4.7 更新 `getStatements()` 内部调用 `buildStatementAdapters(sequelizeInstance)` 替代原 `prepareStatements(db)`
- [x] 4.8 新增 `checkDbHealth()` 导出函数，执行 `SELECT 1` 并返回 `{ ok: true }` 或 `{ ok: false, error }`

## 5. 调用方 async 改造

- [x] 5.1 审查 `server/index.js` 中所有 `stmts.xxx.get/run/all()` 调用，统一添加 `await`
- [x] 5.2 审查 `server/auth.js` 中所有 `stmts.xxx` 调用，统一添加 `await`
- [x] 5.3 审查 `server/characters.js` 中所有 `stmts.xxx` 调用，统一添加 `await`
- [x] 5.4 审查其他服务文件（`server/rooms.js`、`server/chat.js` 等）中是否有直接 DB 调用，逐一 await 改造

## 6. API 兼容性与错误处理

- [x] 6.1 在所有返回数据库结果的路由中，将 Sequelize 模型实例转为普通对象（`.get({ plain: true })` 或手动指定字段），确保响应中不含 `dataValues`、`_changed` 等 ORM 内部属性
- [x] 6.2 在全局错误处理中间件（`server/middleware.js`）中捕获 Sequelize 连接异常，返回 HTTP 503 而非暴露原始堆栈
- [ ] 6.3 验证登录、注册、角色 CRUD、存档读写接口的响应结构与重构前完全一致（字段名、类型、HTTP 状态码）

## 7. 测试层更新

- [x] 7.1 在测试环境配置中设置 `DB_NAME=chickenbroadv_test`，确保测试使用独立数据库
- [x] 7.2 更新 `tests/unit/server/auth.test.js`：将 `createDatabase(':memory:')` 改为连接测试 MySQL 实例，在 `beforeAll` 中执行 `sequelize.sync({ force: true })` 建表，在 `afterAll` 中关闭连接
- [x] 7.3 更新 `prepareStatements` 相关测试调用，改用 `buildStatementAdapters` 并添加 `await`
- [ ] 7.4 运行现有单元测试套件，确认全部通过

## 8. 存量数据迁移脚本

- [x] 8.1 编写一次性迁移脚本 `scripts/migrate-sqlite-to-mysql.js`，从本地 SQLite 文件读取 `users`、`characters`、`battle_records` 数据并写入 MySQL
- [x] 8.2 脚本支持 `--dry-run` 模式（仅打印将要插入的行数，不实际写入）
- [x] 8.3 脚本执行完毕后打印各表迁移行数摘要及耗时

## 9. 上线与部署验证

- [ ] 9.1 在服务器环境中设置所有 `DB_*` 环境变量（`DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER`、`DB_PASSWORD`）
- [ ] 9.2 运行 `sequelize db:migrate` 在生产 MySQL 上建表
- [ ] 9.3 执行存量数据迁移脚本（先 `--dry-run` 确认，再正式执行）
- [ ] 9.4 重启服务，调用 `/api/health`（或等效健康检查端点）验证 `checkDbHealth()` 返回 `{ ok: true }`
- [ ] 9.5 打 git tag（如 `pre-mysql-migration`）作为回滚基准点，完整保留旧 SQLite 文件备份
