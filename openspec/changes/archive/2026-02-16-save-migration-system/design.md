## Context

当前 ChickenBro 的存档系统使用 `localStorage` + JSON 序列化，存档版本号 `"1.0.0"` 从未变化。加载旧存档时依赖 `CharacterSystem.getCharacter()` 中的散装 if 检测来补缺失字段（resource、comboPoints、skills），但仅覆盖 player 对象，且容易遗漏。角色创建有两份代码——`CreateCharacterView.vue` 实际使用（手工拼装 playerData），`CharacterSystem.createCharacter()` 更完善但从未被调用——两者字段不一致（金币、equipment 结构、字段命名）。

## Goals / Non-Goals

**Goals:**
- 建立版本化存档迁移管道，旧存档加载时自动升级到最新版本
- 定义权威 PlayerSchema 作为角色数据结构的唯一真相来源
- 统一角色创建入口，消除双份代码不一致问题
- 追溯修复所有已知的旧存档缺失字段
- 迁移过程可追踪、可调试（日志）

**Non-Goals:**
- 不做云端存档同步（当前只用 localStorage）
- 不做数据/配置分离重构（派生数据如 stats 运行时重算——这是后续优化方向）
- 不做存档加密或压缩
- 不做多角色系统改造
- 不重构 StateManager 的数据结构（只改 player 相关）

## Decisions

### Decision 1: 整数版本号

存档版本号使用整数递增（1, 2, 3...），而非语义化版本。

**理由**: 迁移是线性有序的，整数比较简单可靠。语义化版本适合 API 兼容性表达，存档迁移只需要"先后顺序"。

**替代方案**: 语义化版本 `"1.0.0"` → 解析复杂，迁移链排序不直观。

### Decision 2: PlayerSchema 作为独立模块

创建 `src/core/PlayerSchema.js`，导出 `createDefaultPlayer(name, classId)` 函数和 `PLAYER_FIELDS` 字段定义。

**理由**: Schema 是角色创建和存档迁移的共同依赖，放在 core/ 层级合适。不用 JSON Schema 等重量方案——直接用 JS 对象 + 函数即可，轻量且易维护。

**替代方案**: 在 CharacterSystem 内维护 → 职责不清，CharacterSystem 应该是业务逻辑，不是数据定义。

### Decision 3: SaveMigration 独立模块 + 迁移注册表

创建 `src/core/SaveMigration.js`，内部维护 `migrations` 对象（key 为版本号，value 为迁移函数）。导出 `migrate(saveData)` 函数。

**理由**: 独立模块便于测试和维护。每次需要存档结构变更时，只需在 migrations 对象中新增一个条目。

**替代方案**: 在 SaveManager 中内联 → 职责过重，SaveManager 应专注于 IO。

### Decision 4: 迁移在 SaveManager.load() 中自动触发

迁移逻辑嵌入 `SaveManager.load()` 返回前执行，而非在 GameEngine.loadGame() 中。

**理由**: 确保任何加载路径（手动加载、自动加载、导入）都经过迁移。如果放在 GameEngine 层，import() 路径会绕过迁移。

**替代方案**: 保持在 GameEngine.migrateLoadedState() → 导入存档不经过迁移，有遗漏风险。

### Decision 5: CreateCharacterView 调用 CharacterSystem.createCharacter()

View 层只负责 UI 交互，角色数据构建交给 CharacterSystem，内部使用 PlayerSchema。

**理由**: 单一职责。View 不应该知道角色数据的具体结构。

### Decision 6: 初始迁移版本规划

当前所有存档统一视为 version=1（无版本号或 `"1.0.0"` 的旧存档）。首次迁移 (1→2) 负责补齐所有已知缺失字段：id、className、equipment 槽位、experienceToNext、createdAt、statistics、resource、comboPoints、exp→experience 字段名统一。

**理由**: 将散装迁移逻辑一次性收归迁移管道，后续每次变更只需递增版本。

## Risks / Trade-offs

- **[Risk] 旧存档字段遗漏** → 迁移函数 1→2 会对照 PlayerSchema 做完整字段补全（`for...in` 遍历 Schema 字段，缺失的补默认值），而非逐个字段硬编码
- **[Risk] 迁移函数 bug 导致数据损坏** → 迁移前自动备份原始存档到 `chickenBro_backup_{slot}`，迁移失败时可回滚
- **[Risk] localStorage 容量** → 备份会翻倍占用空间，但单个存档通常 <50KB，10 槽 + 10 备份 <1MB，远低于 5MB 限制
- **[Trade-off] 不做 data/config 分离** → 技能列表等配置数据仍然存在存档中。后续可单独做此优化，当前变更聚焦迁移管道基础设施
