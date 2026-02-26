## Purpose

定义 MySQL 在线持久化层的连接配置、连接池管理、健康检查、优雅关闭及 Schema 版本化迁移要求，确保生产环境下数据库连接的可靠性与可运维性。

## Requirements

### Requirement: MySQL 连接通过环境变量配置
系统 SHALL 从环境变量（`DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER`、`DB_PASSWORD`、`DB_POOL_MAX`、`DB_POOL_MIN`）读取 MySQL 连接参数，不允许在代码中硬编码连接字符串。

#### Scenario: 环境变量完整时正常连接
- **WHEN** 所有 `DB_*` 环境变量均已设置
- **THEN** 应用启动后能成功连接 MySQL，日志不报错

#### Scenario: `DB_PASSWORD` 缺失时启动失败并给出明确错误
- **WHEN** `DB_PASSWORD` 未设置
- **THEN** 应用启动时抛出配置错误，错误信息中指明缺少 `DB_PASSWORD`

### Requirement: 连接池管理
系统 SHALL 使用连接池（上限由 `DB_POOL_MAX` 控制，下限由 `DB_POOL_MIN` 控制），避免每次请求新建/销毁连接。

#### Scenario: 并发请求复用连接
- **WHEN** 同时发起 5 个数据库读请求
- **THEN** 实际 TCP 连接数不超过 `DB_POOL_MAX` 值

#### Scenario: 空闲时连接数维持下限
- **WHEN** 服务空闲超过 30 秒
- **THEN** 活跃连接数不低于 `DB_POOL_MIN`

### Requirement: 健康检查接口
系统 SHALL 提供 `checkDbHealth()` 函数，执行轻量查询（如 `SELECT 1`）并返回连接是否可用。

#### Scenario: 数据库正常时返回 `{ ok: true }`
- **WHEN** MySQL 实例可达且连接正常
- **THEN** `checkDbHealth()` 返回 `{ ok: true }`

#### Scenario: 数据库不可达时返回 `{ ok: false, error }`
- **WHEN** MySQL 实例不可达或认证失败
- **THEN** `checkDbHealth()` 返回 `{ ok: false, error: <错误信息> }`，不抛出未捕获异常

### Requirement: 优雅关闭
系统 SHALL 提供 `closeDb()` 函数，关闭连接池中所有连接，应用进程退出时调用。

#### Scenario: 正常关闭
- **WHEN** `closeDb()` 被调用
- **THEN** 所有连接池连接被释放，后续查询抛出"连接已关闭"错误而非静默挂起

### Requirement: Schema 版本化迁移
系统 SHALL 使用 `sequelize-cli` 管理迁移文件，支持 `db:migrate`（前进）与 `db:migrate:undo`（回滚）。

#### Scenario: 首次迁移建表成功
- **WHEN** 对空数据库执行 `sequelize db:migrate`
- **THEN** `users`、`characters`、`battle_records`、`chat_messages`、`class_configs`、`rooms` 六张表及索引均被创建

#### Scenario: 重复执行迁移幂等
- **WHEN** `sequelize db:migrate` 在已迁移数据库上重复执行
- **THEN** 不报错，不重复建表

#### Scenario: 回滚最后一次迁移
- **WHEN** 执行 `sequelize db:migrate:undo`
- **THEN** 最后一次迁移被撤销，数据库回到上一个版本状态
