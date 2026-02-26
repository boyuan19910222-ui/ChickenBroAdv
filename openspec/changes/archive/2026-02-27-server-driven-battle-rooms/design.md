## Context

当前多人战斗流程：`launchBattle()` 生成一个时间戳 `seed`，通过 `battle:init` 下发给所有客户端，每个客户端使用同一 `seed` 初始化 `SeededRandom`，在本地独立跑 `DungeonCombatSystem.startDungeonMultiplayer()` 生成波次敌人列表。

问题根因：客户端在战斗中大量消耗 RNG 状态（伤害计算、buff 判定等），断线后再次收到 `battle:init` 重放同一 `seed`，但随机序列已无法对齐当前波次，导致重连玩家"看到的怪"与队友不一致。

已有基础设施：
- `DungeonRegistry` 已在服务端（`server/index.js`, `server/rooms.js`）正常导入，可访问 `dataModule()` 动态加载副本数据
- `BattleEngine` 已从 `src/data/EquipmentData.js` 导入，证明服务端可消费 `src/` 下的纯数据模块
- `battle_state` 已持久化到数据库，断线重连时直接从 DB 恢复
- `activeBattles` Map 在内存中保有 `engine.battleState`，包含 `seed` 和 `snapshots`

---

## Goals / Non-Goals

**Goals:**
- 服务端在 `launchBattle()` 时一次性生成全部波次的敌人快照，写入 `engine.battleState.waves[]`
- `battle:init` 携带 `waves[]` 下发；客户端 `MultiplayerDungeonAdapter` 直接使用，不再用 seed 生成波次
- 断线重连时 `battle:restore` 中包含完整 `waves[]`，客户端可跳转到 `currentWaveIndex` 并复现正确的波次
- 废弃客户端 `battle:wave_progress` 上报波次发现权；改为服务端被动记录（客户端仍可上报，仅作持久化用，不再当"波次来源"）

**Non-Goals:**
- 不在服务端执行战斗回合计算（HP、伤害、状态机仍在客户端）
- 不修改掉落计算逻辑（seed 继续用于 `generatePersonalLoot`）
- 不修改单人副本流程
- 不为波次引入服务端定时推送（无心跳、无 tick，客户端战斗速度不变）

---

## Decisions

### 决策 1：统一波次生成入口 — `server/WaveGenerator.js`

从 `launchBattle()` 中抽取一个独立的 `WaveGenerator.generateWaves(dungeonId)` 函数：
1. `await DungeonRegistry[dungeonId].dataModule()` 加载副本模块（Node.js 支持动态 `import()`）
2. 遍历 `dungeon.encounters[]`，对每个 encounter id 取对应的波次对象（如 `dungeon.wave_1`、`dungeon.boss_mograine`）
3. 序列化 `waveConfig.enemies` 为轻量快照（保留 `id, name, type, slot, emoji, stats, speed, skills`）
4. 返回 `Wave[]`：`[{ waveId, type, name, enemies: EnemySnapshot[] }]`

**备选方案**：在 `launchBattle()` 内联生成  
**放弃原因**：内联会让 `launchBattle()` 继续膨胀；独立模块便于单元测试和将来新增波次修改逻辑（如难度缩放）

**备选方案**：懒生成（每波开始时服务端 emit `battle:wave_start`）  
**放弃原因**：需要服务端感知战斗进度（维护 timer 或等待客户端回调），引入不必要的时序依赖；一次性生成后下发更简单，payload 增量可接受（估算单副本 ~10–40KB）

---

### 决策 2：`battle:init` 协议扩展（保持向后兼容）

在 `battle:init` payload 中新增 `waves` 字段，`seed` 保留（用于掉落计算）：

```
// Before
{ dungeonId, seed, snapshots, roomId }

// After
{ dungeonId, seed, snapshots, roomId, waves: Wave[] }
```

客户端检测：若 `waves` 存在则使用服务端数据，否则降级走原 seed 逻辑（用于旧版客户端/测试环境兼容）

---

### 决策 3：`DungeonCombatSystem` 接受外部波次注入

`startDungeonMultiplayer(dungeonId, party, options)` 的 `options` 新增 `waves?: Wave[]`。
当 `waves` 有效时，`DungeonCombatSystem` 跳过内部 `generateEncounters()` 调用，直接使用注入的波次数据构建战斗状态。

**备选方案**：新建 `ServerDrivenDungeonSystem` 替换现有类  
**放弃原因**：过度工程，现有 `DungeonCombatSystem` 的 autoPlayMode 逻辑不需要变更，只需波次来源可切换

---

### 决策 4：`battle:restore` 直接复用已持久化的 `battle_state.waves`

`engine.battleState` 写入 DB 时已包含 `waves`，断线重连走原有 `battle:restore` 流程即可，无需新增事件。客户端 `MultiplayerDungeonAdapter` 在收到 `battle:restore` 后直接取 `battleState.waves` + `battleState.currentWaveIndex` 恢复战场。

---

### 决策 5：`battle:wave_progress` 降级为仅持久化

不废弃该事件，但其语义由"客户端报波次来源"改为"客户端确认波次完成，服务端更新持久化"。服务端不再广播 `battle:wave_updated`（或保留但标记为 informational）。

---

## Risks / Trade-offs

| 风险 | 缓解方案 |
|------|----------|
| 副本 `dataModule()` 在 Node.js 环境使用了浏览器专属 API（如 `window`） | `WaveGenerator` 静态分析各副本文件；当前副本为纯数据 JS，已知可服务端运行（`BattleEngine` 已引用 `EquipmentData.js`）；测试阶段用 `vitest` 跑服务端导入验证 |
| `battle:init` payload 增大约 10–40 KB | 对局域网/公网游戏可接受；若需要优化，可在 v2 压缩或分批推送；当前优先正确性 |
| 部署期间存在 in-flight 战斗（旧 `battle_state` 无 `waves`） | 客户端检测 `waves` 字段：若缺失则降级走原 seed 逻辑，战斗继续但不具备防重连保证（可接受，战斗完成后自然消失） |
| `DungeonCombatSystem.generateEncounters()` 内部状态与外部注入不一致 | 注入路径完全绕过 `generateEncounters()`，不存在双写；需补充集成测试验证跳过路径 |

---

## Migration Plan

1. **服务端先上**：部署含 `WaveGenerator` 和新 `battle:init.waves` 的服务端；旧客户端若已连接收到含 `waves` 的 init，会因无识别字段而忽略，战斗仍走旧 seed 逻辑（无害降级）
2. **客户端随后上**：部署更新后的 `MultiplayerDungeonAdapter`；新客户端收到含 `waves` 的 init，走新逻辑
3. **`battle_state` DB 结构**：无需显式迁移，`battle_state` 为 JSON 列，直接存入新结构；旧行无 `waves` 字段由客户端降级逻辑处理
4. **回滚**：服务端回滚只需去掉 `waves` 字段；客户端降级逻辑已覆盖，无需同步回滚

---

## Open Questions

- `DungeonCombatSystem.generateEncounters()` 在 `startDungeonMultiplayer` 中是同步还是异步调用？需要确认注入路径的 await 链是否影响启动时序
- `waves` 中是否需要携带 BOSS 专属技能数据（体积较大）？或按现有 `EnemySnapshot` 精简后足够客户端渲染？
- 单元测试：`WaveGenerator` 是否需要覆盖所有已实现副本？建议至少覆盖 `ragefire_chasm`、`wailing_caverns`（有随机变体），其余可用快照测试
