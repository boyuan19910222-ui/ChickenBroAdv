## MODIFIED Requirements

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
