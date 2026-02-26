# 任务清单

## 阶段1：服务端 — WaveGenerator 模块

### 1.1 新建 WaveGenerator

- [ ] **T1.1.1** 创建 `server/WaveGenerator.js`
  - 导出 `generateWaves(dungeonId)` 函数
  - 通过 `await DungeonRegistry[dungeonId].dataModule()` 动态加载副本模块
  - 取 `module.default` 或首个具有 `encounters` 字段的导出值作为 dungeonData
  - 若 `DungeonRegistry[dungeonId]` 不存在或 `dataModule` 为 null，抛出含 dungeonId 信息的 Error
  - 若加载后 `dungeonData.encounters` 为空或不存在，抛出含 dungeonId 信息的 Error
  - 遍历 `dungeonData.encounters[]`，对每个 encounter 调用 `dungeonData.getEncounter(encounter.id)` 获取完整数据
  - 返回 `Wave[]`：`[{ waveId: encounter.id, type: encounter.type, name: encounter.name, enemies: EnemySnapshot[] }]`
  - `EnemySnapshot` 保留字段：`id, name, type, slot, emoji, stats, speed, skills`（精简掉 `loot` 等非战斗字段）

---

## 阶段2：服务端 — launchBattle 集成

### 2.1 launchBattle 调用 WaveGenerator

- [ ] **T2.1.1** 在 `server/index.js` 顶部导入 `WaveGenerator`
  - `import { generateWaves } from './WaveGenerator.js'`

- [ ] **T2.1.2** 在 `launchBattle()` 中调用 `generateWaves(room.dungeonId)`
  - 位置：创建 `BattleEngine` 实例后，广播 `battle:init` 前
  - 使用 `try/catch`：若 `generateWaves` 抛出错误，emit `battle:error` 给房间并提前 return（不启动无效战斗）
  - 成功时将 `waves` 存入 `engine.battleState.waves`，同时初始化 `engine.battleState.currentWaveIndex = 0`

- [ ] **T2.1.3** 更新 `battle:init` 广播 payload，新增 `waves` 字段
  - `io.to(room.id).emit('battle:init', { dungeonId, seed, snapshots, roomId, waves })`

- [ ] **T2.1.4** 更新 `stmts.saveBattleState.run(...)` 调用，传入含 `waves` 的完整 battleState
  - `stmts.saveBattleState.run(room.id, { seed, snapshots: partySnapshots, waves, currentWaveIndex: 0 })`（`room.id` 即 `roomId`，与 `battle:init` payload 中的 `roomId` 字段值相同）

---

## 阶段3：服务端 — 断线重连路由

### 3.1 battle:restore 包含 waves

- [ ] **T3.1.1** 更新 `battle:restore`（从数据库读取的分支，`server/rooms.js` 中的 `getBattleState` 路径）
  - 确保 `battleState.waves` 和 `battleState.currentWaveIndex` 原样透传到 `battle:restore` payload
  - 若旧数据行 `battleState` 中无 `waves` 字段，不补充默认值（客户端降级处理）

- [ ] **T3.1.2** 更新内存重连分支（`engine && engine.battleState` 分支，`server/index.js` 中的 `battle:init` resend）
  - `battle:init` resend payload 中加入 `waves: engine.battleState.waves`（若存在）

---

## 阶段4：服务端 — battle:wave_progress 持久化

### 4.1 wave_progress 持久化验证

- [ ] **T4.1.1** 检查 `battle:wave_progress` 处理器
  - 确认 `saveBattleState` 调用传入的 `engine.battleState` 中已包含 `waves`（因 T2.1.4 已写入，此处无需额外更改，仅确认逻辑正确）
  - 确认仅更新 `currentWaveIndex` 和 `totalWaves`，不修改 `waves` 数组内容

---

## 阶段5：客户端 — MultiplayerDungeonAdapter

### 5.1 优先使用服务端 waves

- [ ] **T5.1.1** 修改 `src/systems/MultiplayerDungeonAdapter.js` 的 `start(initData)` 方法
  - 解构时新增 `waves`：`const { dungeonId, seed, snapshots, roomId, waves } = initData`
  - 在调用 `dungeonCombatSystem.startDungeonMultiplayer(...)` 前检测 `waves`：
    - 若 `Array.isArray(waves) && waves.length > 0`，则在 options 中携带 `waves`
    - 否则不传 `waves`（降级走原有 seed 逻辑）
  - `SeededRandom` 仍正常初始化（用于掉落计算），不受 waves 注入影响

- [ ] **T5.1.2** 修改 `startDungeonMultiplayer` 调用处，传入 `waves` option
  - `await this.dungeonCombatSystem.startDungeonMultiplayer(dungeonId, party, { startEncounterIndex, waves })`

---

## 阶段6：客户端 — DungeonCombatSystem 波次注入

### 6.1 接受外部 waves

- [ ] **T6.1.1** 修改 `src/systems/DungeonCombatSystem.js` 的 `startDungeonMultiplayer(dungeonId, party, options)` 方法
  - 从 `options` 中读取 `waves`：`const { startEncounterIndex = 0, waves } = options`
  - 若 `Array.isArray(waves) && waves.length > 0`，将其存储到实例属性 `this._injectedWaves = waves`
  - 否则 `this._injectedWaves = null`（不影响已有 seed 随机路径）

- [ ] **T6.1.2** 修改 `startNextEncounter()` 方法，优先使用注入的波次数据
  - 若 `this._injectedWaves` 存在且 `this._injectedWaves[this.encounterIndex]` 有效：
    - 取 `const wave = this._injectedWaves[this.encounterIndex]`
    - 直接以 `wave.enemies` 作为本次遭遇战的敌人列表，跳过 `getEncounter` / `createTrashInstance` 路径
    - 遭遇战类型（boss/trash）直接使用 `wave.type`（注入波次已包含该字段，无需再从 `this.currentDungeon.encounters` 读取），以保持过渡动画逻辑不变
  - 否则维持原有行为（向后兼容）

---

## 阶段7：测试

### 7.1 WaveGenerator 单元测试

- [ ] **T7.1.1** 在 `tests/unit/server/` 下新建 `WaveGenerator.test.js`
  - 测试：`generateWaves('ragefire_chasm')` 返回数组，长度等于 `encounters` 数组长度
  - 测试：每个 Wave 元素包含 `waveId, type, name, enemies`，且 `enemies.length > 0`
  - 测试：`enemies[0]` 包含所有必需字段：`id, name, type, slot, emoji, stats, speed, skills`（`skills` 可为空数组）
  - 测试：`enemies[0].stats` 含 `hp, damage, armor` 字段
  - 测试：`generateWaves('wailing_caverns')` 同样正常返回（验证多副本兼容）
  - 测试：`generateWaves('nonexistent_dungeon')` 抛出含 dungeonId 的 Error
  - 测试：`enemies` 中不含 `loot` 字段（精简字段验证）

### 7.2 launchBattle 集成测试

- [ ] **T7.2.1** 在现有服务端测试或新建测试文件中为 `launchBattle` 补充测试
  - 测试：战斗启动后 `activeBattles.get(roomId).battleState.waves` 为非空数组
  - 测试：`battle:init` emit payload 包含 `waves` 字段
  - 测试：dungeonId 无 `dataModule` 时 emit `battle:error`，`activeBattles` 无该 roomId 条目

### 7.3 MultiplayerDungeonAdapter 单元测试

- [ ] **T7.3.1** 为 `MultiplayerDungeonAdapter.start()` 补充测试（在 `tests/unit/` 下）
  - 测试：`initData.waves` 为有效数组时，`startDungeonMultiplayer` options 携带 `waves`
  - 测试：`initData.waves` 为 undefined 时，`startDungeonMultiplayer` options 不含 `waves`
  - 测试：两种情况下 `SeededRandom` 均被正确初始化

### 7.4 DungeonCombatSystem 波次注入测试

- [ ] **T7.4.1** 在 `tests/unit/` 下补充 `DungeonCombatSystem` 波次注入测试
  - 测试：`options.waves` 有效时，`startNextEncounter` 使用注入的 `enemies`，不调用 `createTrashInstance`
  - 测试：`options.waves` 为 undefined 时，走原有 `createTrashInstance` 路径，行为不变
