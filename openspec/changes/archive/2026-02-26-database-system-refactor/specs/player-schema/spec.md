## ADDED Requirements

### Requirement: `game_state` 字段在 MySQL 中使用 MEDIUMTEXT 类型存储
`characters` 表的 `game_state` 字段在 ORM 模型中 SHALL 声明为 `DataTypes.TEXT('medium')`（MySQL `MEDIUMTEXT`），以支持最大 16MB 的 JSON 存档字符串，不得使用 `TEXT`（65535 字节上限）。

#### Scenario: 大型存档写入不被截断
- **WHEN** 向 `characters.game_state` 写入超过 65535 字节的序列化 JSON
- **THEN** 数据完整写入 MySQL，读取时与写入内容逐字节一致

### Requirement: ORM 模型序列化不修改 `game_state` 内容
Sequelize 模型在读写 `game_state` 字段时 SHALL 保持原始字符串格式，不自动解析为 JSON 对象，不做任何转换（`getter`/`setter` 不做处理），确保上层 `JSON.parse` / `JSON.stringify` 逻辑不受影响。

#### Scenario: 存档原始字符串往返一致
- **WHEN** 将 JSON 字符串写入 `game_state` 后立即读取
- **THEN** 读取到的值与写入值字符完全相同（无自动 parse 或 stringify）

### Requirement: 玩家字段对外 API 形状与 MySQL 列名映射保持一致
ORM 查询返回的玩家对象字段名 SHALL 与现有 API 响应中前端期望的字段名一致（`snake_case`），不通过 Sequelize `underscored` 或 `as` 别名引入新字段名。

#### Scenario: API 响应角色字段名不变
- **WHEN** `GET /api/characters/:id` 返回角色数据
- **THEN** 字段名为 `user_id`、`created_at`、`updated_at`、`last_played_at`（snake_case），与重构前一致
