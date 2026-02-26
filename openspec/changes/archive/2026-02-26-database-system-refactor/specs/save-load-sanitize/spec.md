## ADDED Requirements

### Requirement: ORM 管道中存读档清洗逻辑执行时机不变
在引入 ORM 后，`GameEngine.loadGame()` 的数据清洗逻辑（sanitize）SHALL 发生在 ORM 从数据库读取 `game_state` 字符串、解析为对象之后、返回给游戏引擎之前，执行时序与重构前一致。

#### Scenario: 读取角色存档后清洗正常触发
- **WHEN** 通过 ORM 的 `Character.findByPk()` 读取存档，随后调用 `loadGame()`
- **THEN** sanitize 逻辑正常执行，`game.scene` 被重置，玩家 HP 被恢复，行为与 SQLite 版本一致

### Requirement: 存档写入 ORM 前已完成序列化
调用 ORM 的 `updateCharacterGameState` 适配器前，调用方 SHALL 已将 `game_state` 序列化为 JSON 字符串，ORM 层接收字符串类型参数，不做额外序列化处理。

#### Scenario: 写入时参数类型为字符串
- **WHEN** `stmts.updateCharacterGameState.run(jsonString, level, id)` 被调用
- **THEN** ORM 将 `jsonString` 原样写入 `game_state` 列，不进行 `JSON.stringify` 包装

### Requirement: ORM 读取存档错误时上层可捕获明确错误
若 ORM 读档操作失败（数据库连接断开、记录不存在），系统 SHALL 抛出包含明确错误信息的错误对象，不返回 `undefined` 或空对象，以便上层清洗逻辑及 `loadGame` 的错误处理路径正确响应。

#### Scenario: 读取不存在的角色 ID 时抛出错误
- **WHEN** `stmts.findCharacterByIdAndUserId.get(nonExistentId, userId)` 被调用
- **THEN** 返回 `undefined`（与旧版 `.get()` 语义一致），调用方可据此判断记录不存在
