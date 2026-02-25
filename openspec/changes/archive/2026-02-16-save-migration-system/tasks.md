## 1. PlayerSchema 模块

- [x] 1.1 创建 `src/core/PlayerSchema.js`，定义 `PLAYER_FIELDS` 完整字段表（含类型和默认值/工厂函数），导出 `createDefaultPlayer(name, classId)` 工厂函数，基于 GameData 类配置生成完整角色数据
- [x] 1.2 在 PlayerSchema 中实现 `ensurePlayerFields(playerData)` 字段补全函数，遍历 PLAYER_FIELDS 补齐缺失字段（不覆盖已有值），包括 equipment 槽位规范化

## 2. SaveMigration 模块

- [x] 2.1 创建 `src/core/SaveMigration.js`，定义 `CURRENT_VERSION` 常量和 `migrations` 注册表，导出 `migrate(saveData)` 函数，支持从任意旧版本按顺序执行迁移链到最新版本
- [x] 2.2 实现 migration v1→v2：调用 `ensurePlayerFields()` 补全缺失字段，统一 `exp` → `experience` 字段名，规范化 equipment 结构，生成缺失的 `id` 和 `createdAt`

## 3. SaveManager 集成

- [x] 3.1 改造 `SaveManager.load()`：加载后调用 `migrate()`，迁移前备份原始数据到 `chickenBro_backup_{slot}`，迁移后将新版本数据回写 localStorage
- [x] 3.2 改造 `SaveManager.import()`：导入时先解析再调用 `migrate()`，确保导入的旧版本存档自动升级
- [x] 3.3 更新 `SaveManager` 的版本号机制：移除旧的 `this.version = '1.0.0'`，改为引用 `SaveMigration.CURRENT_VERSION`

## 4. 角色创建统一

- [x] 4.1 改造 `CharacterSystem.createCharacter()` 内部使用 `PlayerSchema.createDefaultPlayer()`，确保输出完整且一致的角色数据
- [x] 4.2 改造 `CreateCharacterView.vue`：删除手工拼装 playerData 逻辑，改为通过 gameStore 调用 `CharacterSystem.createCharacter(name, classId)`

## 5. 清理遗留代码

- [x] 5.1 移除 `CharacterSystem.getCharacter()` 中的散装懒迁移逻辑（resource 迁移、comboPoints 迁移、skills 迁移）及 `migratePlayerResource()` 方法
- [x] 5.2 移除 `GameEngine.migrateLoadedState()` 方法及 `loadGame()` 中对它的调用

## 6. 同步与验证

- [x] 6.1 将所有新增和修改的文件同步到 `vue-app/` 目录
