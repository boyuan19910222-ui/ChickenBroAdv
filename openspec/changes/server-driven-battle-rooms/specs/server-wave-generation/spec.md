## ADDED Requirements

### Requirement: WaveGenerator 从副本注册表生成全部波次快照
`WaveGenerator.generateWaves(dungeonId)` SHALL 通过 `DungeonRegistry[dungeonId].dataModule()` 动态加载副本数据，遍历 `dungeon.encounters[]`，对每个 encounter id 读取对应的波次对象（如 `dungeon.wave_1`、`dungeon.boss_mograine`），返回 `Wave[]` 数组。每个 `Wave` 对象 SHALL 包含 `waveId`（string）、`type`（'trash'|'boss'）、`name`（string）以及 `enemies`（EnemySnapshot[]）；`EnemySnapshot` SHALL 至少保留 `id, name, type, slot, emoji, stats, speed, skills`。

#### Scenario: 已实现副本正常生成波次
- **WHEN** 调用 `WaveGenerator.generateWaves('ragefire_chasm')`
- **THEN** 返回数组长度等于该副本 `encounters` 数组长度，且每个元素均含非空 `enemies` 数组

#### Scenario: 未实现副本（dataModule 为 null）抛出明确错误
- **WHEN** `DungeonRegistry[dungeonId].dataModule` 为 `null` 或调用后模块无 `encounters`
- **THEN** `generateWaves` 抛出包含 dungeonId 信息的 Error，不返回部分结果

#### Scenario: 波次快照包含完整敌人数据
- **WHEN** 对 `wailing_caverns` 执行 `generateWaves`
- **THEN** 返回的每个 EnemySnapshot 均含 `stats.hp`、`stats.damage`、`stats.armor` 以及 `skills` 数组（可为空数组，但字段必须存在）

---

### Requirement: launchBattle 调用 WaveGenerator 并将 waves 写入 battleState
`launchBattle(room)` SHALL 在创建 `BattleEngine` 实例后，调用 `WaveGenerator.generateWaves(room.dungeonId)` 获取 `waves[]`，并将其存入 `engine.battleState.waves`；同时初始化 `engine.battleState.currentWaveIndex` 为 `0`。若 `generateWaves` 抛出错误，`launchBattle` SHALL emit `battle:error` 给房间并中止，不启动无效战斗。

#### Scenario: 战斗启动后 battleState 含 waves
- **WHEN** 房间战斗正常启动（dungeonId 有效）
- **THEN** `activeBattles.get(roomId).battleState.waves` 为长度大于 0 的数组，`currentWaveIndex` 为 0

#### Scenario: 无效副本 ID 触发 battle:error
- **WHEN** 房间 `dungeonId` 在 DungeonRegistry 中无 `dataModule`（或模块缺少 encounters）
- **THEN** `io.to(roomId).emit('battle:error', ...)` 被调用，`activeBattles` 中不存在该 roomId

---

### Requirement: battle:init 携带 waves 字段下发
服务端广播 `battle:init` 时，payload SHALL 包含 `waves: Wave[]` 字段（由 `engine.battleState.waves` 填充）；`seed` 字段 SHALL 保留（用于掉落计算）。

#### Scenario: battle:init payload 含 waves
- **WHEN** 战斗启动，服务端广播 `battle:init`
- **THEN** 事件 payload 中存在 `waves` 字段且为非空数组

---

### Requirement: 客户端 MultiplayerDungeonAdapter 优先使用服务端 waves
`MultiplayerDungeonAdapter.start(initData)` SHALL 检测 `initData.waves` 是否为非空数组；若是，则将 `waves` 传入 `DungeonCombatSystem.startDungeonMultiplayer()` 的 `options.waves`，跳过客户端基于 seed 的波次生成；若 `initData.waves` 缺失或为空，SHALL 降级为原有 seed 逻辑（向后兼容）。

#### Scenario: 收到含 waves 的 battle:init 时跳过本地生成
- **WHEN** `initData.waves` 为包含 3 个波次的数组
- **THEN** `DungeonCombatSystem.startDungeonMultiplayer` 的 options 中 `waves` 与 initData.waves 相同；`SeededRandom` 仍被初始化（用于掉落），但不用于生成波次敌人

#### Scenario: waves 缺失时降级到 seed 逻辑
- **WHEN** `initData.waves` 为 undefined 或空数组
- **THEN** `DungeonCombatSystem.startDungeonMultiplayer` 的 options 中不传 `waves`，战斗按原有行为启动

---

### Requirement: DungeonCombatSystem 支持外部 waves 注入
`DungeonCombatSystem.startDungeonMultiplayer(dungeonId, party, options)` SHALL 接受 `options.waves?: Wave[]`；当 `options.waves` 有效时，SHALL 直接使用注入的波次数据构建战斗遭遇，不调用内部 `generateEncounters()` 或等价的随机生成路径。

#### Scenario: 注入 waves 后跳过内部生成
- **WHEN** `options.waves` 包含 2 个波次
- **THEN** 战斗启动后第一波的敌人列表与 `options.waves[0].enemies` 完全一致

#### Scenario: 未注入 waves 时行为不变
- **WHEN** `options.waves` 为 undefined
- **THEN** 战斗按原有 seed 随机生成波次，行为与改动前相同
