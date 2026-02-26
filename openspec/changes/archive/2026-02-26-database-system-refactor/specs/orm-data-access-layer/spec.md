## ADDED Requirements

### Requirement: Sequelize 模型与现有表结构完全对应
系统 SHALL 为 `users`、`characters`、`battle_records` 三张表分别定义 Sequelize 模型，字段名、类型、约束与现有 SQLite 表定义一致（`game_state` 字段使用 `MEDIUMTEXT` 或 `DataTypes.TEXT('medium')`）。

#### Scenario: User 模型字段完整
- **WHEN** 检查 `User` Sequelize 模型定义
- **THEN** 包含字段：`id`、`username`（唯一）、`password_hash`、`nickname`、`created_at`、`last_login`、`oauth_provider`、`oauth_id`、`auto_login`

#### Scenario: Character 模型外键关联
- **WHEN** 创建 `Character` 模型实例时 `user_id` 不存在于 `users` 表
- **THEN** 数据库拒绝插入并返回外键约束错误

#### Scenario: `game_state` 支持大型 JSON 字符串
- **WHEN** 向 `characters.game_state` 写入 100KB 以上的 JSON 字符串
- **THEN** 数据能完整写入且读取时无截断

### Requirement: 语句适配器层提供与 `prepareStatements` 形状一致的对象
系统 SHALL 提供 `buildStatementAdapters(sequelizeInstance)` 函数，返回与旧版 `prepareStatements(db)` 形状完全一致的对象（相同的键名集合）。每个适配器实现 `.get(...args)`、`.run(...args)`、`.all(...args)` 方法，返回 Promise。

#### Scenario: 适配器键名覆盖率
- **WHEN** 比较 `buildStatementAdapters()` 返回对象的键集合与原 `prepareStatements()` 返回对象的键集合
- **THEN** 两个集合完全相同，无遗漏

#### Scenario: `findUserByUsername.get(username)` 返回与旧版相同形状
- **WHEN** `await stmts.findUserByUsername.get('testUser')` 被调用
- **THEN** 返回 `{ id, username, password_hash, nickname, created_at, last_login, auto_login, ... }` 对象或 `undefined`（用户不存在时），与旧版 SQLite 行为一致

#### Scenario: `.run()` 返回包含 `changes` 字段的对象
- **WHEN** `await stmts.updateLastLogin.run(userId)` 被调用
- **THEN** 返回对象包含 `changes` 字段（表示受影响行数），与旧版 `db.prepare().run()` 接口兼容

#### Scenario: `.all()` 返回数组
- **WHEN** `await stmts.findCharactersByUserId.all(userId)` 被调用
- **THEN** 返回数组（可为空数组），每个元素为对应行的字段对象

### Requirement: 每用户最多 5 个角色约束在应用层强制执行
系统 SHALL 在 `insertCharacter` 适配器中，插入前检查该用户角色数量，如已达 5 个则抛出与旧版 SQLite trigger 相同语义的错误（错误消息含 `'Character limit reached'`）。

#### Scenario: 创建第 6 个角色被拒绝
- **WHEN** 同一用户已有 5 个角色，尝试插入第 6 个
- **THEN** 抛出错误，错误消息包含 `'Character limit reached'`，数据库中角色数量不变

### Requirement: 事务支持
系统 SHALL 通过 Sequelize 托管事务（`sequelize.transaction()`）支持需要原子性的多步写操作，适配器组合操作在同一事务中执行。

#### Scenario: 事务失败时回滚
- **WHEN** 一个事务中的第二步操作失败
- **THEN** 第一步操作的数据被回滚，数据库保持一致性
