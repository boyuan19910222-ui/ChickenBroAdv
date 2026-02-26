## Purpose

定义职业配置的数据库存储方案，将 `characters.js` 中的硬编码 `CLASS_CONFIG` 常量迁移至 `class_configs` 数据库表，支持运行时热加载，消除代码中的数据硬编码。

## Requirements

### Requirement: class_configs 表结构
`class_configs` 表 SHALL 包含以下字段：`id`（自增主键）、`class_id`（职业标识符，VARCHAR 32，唯一索引）、`name`（职业中文名，VARCHAR 32）、`base_stats`（JSON 字段）、`growth_per_level`（JSON 字段）、`base_skills`（JSON 数组字段）、`resource_type`（VARCHAR 16）、`resource_max`（INT）、`created_at`（DATETIME）、`updated_at`（DATETIME）。

#### Scenario: 表结构创建成功
- **WHEN** 执行包含 class_configs 的迁移文件
- **THEN** `class_configs` 表创建成功，class_id 具有唯一约束

### Requirement: 初始职业数据通过 seed 迁移写入
系统 SHALL 通过独立的 seed 迁移文件，将 9 个职业（warrior、paladin、hunter、rogue、priest、shaman、mage、warlock、druid）的配置作为初始数据写入 `class_configs` 表；seed 迁移 SHALL 幂等（先 DELETE 再 INSERT，或 UPSERT）。

#### Scenario: seed 迁移执行后 9 个职业均存在
- **WHEN** 对空数据库执行 seed 迁移
- **THEN** `class_configs` 表中存在恰好 9 条记录，每条 class_id 唯一

#### Scenario: seed 迁移重复执行不报错
- **WHEN** seed 迁移在已有数据的表上重复执行
- **THEN** 不抛出错误，数据保持一致

### Requirement: 服务启动时加载职业配置
系统 SHALL 提供 `loadClassConfigs(stmts)` 异步函数，在服务启动时（`app.listen` 之前）调用，将所有职业配置加载到模块级缓存变量；加载失败 SHALL 导致进程退出并输出错误信息。

#### Scenario: 正常加载后路由可用
- **WHEN** `loadClassConfigs(stmts)` 成功执行
- **THEN** 后续调用 `createInitialGameState(name, classId)` 使用数据库中的职业配置而非硬编码常量

#### Scenario: 数据库无职业数据时启动失败
- **WHEN** `class_configs` 表为空时调用 `loadClassConfigs(stmts)`
- **THEN** 函数抛出错误，进程输出明确提示并退出，不以空配置继续运行

### Requirement: 支持热加载职业配置
系统 SHALL 提供 `reloadClassConfigs(stmts)` 异步函数，调用后重新从数据库加载职业配置到内存缓存，无需重启进程；该函数 SHALL 线程安全（加载完成后原子替换缓存引用）。

#### Scenario: 热加载后新配置立即生效
- **WHEN** 数据库中某职业配置被修改后调用 `reloadClassConfigs(stmts)`
- **THEN** 下一次创建该职业角色时使用更新后的配置

### Requirement: 移除 characters.js 硬编码常量
`characters.js` 中的顶层 `CLASS_CONFIG` 对象常量 SHALL 被移除，由 `loadClassConfigs` 加载的模块缓存变量替代；`EXP_TABLE` 可保留为本地计算常量（经验值曲线不入库）。

#### Scenario: 职业配置来自数据库
- **WHEN** 客户端请求创建一个 warrior 角色
- **THEN** 服务端使用 `class_configs` 表中 class_id='warrior' 的 base_stats 初始化角色，不使用硬编码值
