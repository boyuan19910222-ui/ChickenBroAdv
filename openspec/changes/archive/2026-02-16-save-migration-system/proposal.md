## Why

当前游戏的存档系统缺乏版本化迁移能力。每次新增字段、修改数据结构或修复 bug 后，旧存档无法自动适配，必须新建角色才能生效。角色创建逻辑分散在 `CreateCharacterView.vue`（实际使用）和 `CharacterSystem.createCharacter()`（未接入）两处，字段不一致（金币、equipment 结构、字段命名 exp vs experience 等），导致数据 Schema 无权威来源。游戏上线后，这些问题会直接影响玩家体验——玩家不可能因为一次更新就删档重来。

## What Changes

- 定义权威的 `PlayerSchema`，作为角色数据结构的唯一来源（所有字段、类型、默认值）
- 统一角色创建入口：`CreateCharacterView` 调用 `CharacterSystem.createCharacter()`，删除 View 中手工拼装的 playerData 逻辑
- 建立版本化存档迁移管道（`SaveMigration` 模块）：存档携带整数版本号，加载时按顺序执行迁移函数链
- 改造 `SaveManager`：加载存档后自动触发迁移，迁移完成后自动保存一次以持久化结果
- 追溯修复现有旧存档的已知缺失字段（resource、comboPoints、equipment 槽位、className、id、experienceToNext、createdAt 等）
- 移除 `CharacterSystem.getCharacter()` 中散装的懒迁移 if 逻辑，统一收归迁移管道

## Capabilities

### New Capabilities
- `player-schema`: 权威的玩家角色数据 Schema 定义，包含完整字段列表、类型约束和默认值生成规则
- `save-migration`: 版本化存档迁移管道，支持有序迁移链、版本号追踪、自动迁移触发和迁移日志

### Modified Capabilities
（无现有 spec 需要修改）

## Impact

- `src/core/SaveManager.js` — 加载流程增加迁移步骤，版本号从 "1.0.0" 字符串改为整数递增
- `src/systems/CharacterSystem.js` — `createCharacter()` 基于 PlayerSchema 生成数据；`getCharacter()` 移除散装迁移逻辑
- `src/views/CreateCharacterView.vue` — 删除手工拼装 playerData，改为调用 CharacterSystem
- `src/core/GameEngine.js` — `loadGame()` 流程集成迁移管道
- `src/stores/gameStore.js` — `startGame()` 适配新的创建流程
- 新增文件：`src/core/PlayerSchema.js`、`src/core/SaveMigration.js`
- `vue-app/` 目录需同步所有修改文件
