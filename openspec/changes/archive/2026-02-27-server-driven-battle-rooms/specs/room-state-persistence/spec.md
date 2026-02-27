## MODIFIED Requirements

### Requirement: 战斗启动时写入 battle_state（含 waves）
系统 SHALL 在 `launchBattle()` 执行时，将 `{ seed, snapshots, waves, currentWaveIndex: 0 }` 作为 `battle_state` 异步持久化到 `rooms` 表对应记录；写库失败 SHALL 仅记录 console.error，不中止战斗。`waves` 字段为 `WaveGenerator.generateWaves()` 返回的 `Wave[]` 序列化 JSON。

#### Scenario: 战斗启动后 battle_state 含 waves
- **WHEN** 房间战斗正常启动
- **THEN** `rooms` 表中该记录的 `battle_state` JSON 字段包含 `waves` 数组（长度 > 0）且 `currentWaveIndex` 为 0

#### Scenario: 写库失败不阻断战斗
- **WHEN** `stmts.saveBattleState.run` 调用抛出异常
- **THEN** `battle:init` 仍正常广播给客户端，`activeBattles` 中存在该 roomId 的 engine

---

### Requirement: battle:wave_progress 持久化 currentWaveIndex
系统 SHALL 在收到客户端 `battle:wave_progress` 事件时，将 `engine.battleState.currentWaveIndex` 更新为上报的 `waveIndex`，并异步持久化更新后的完整 `battleState`（含 `waves`）到 `rooms` 表；SHALL NOT 因此事件而更改 `waves` 数组内容。

#### Scenario: 上报波次后 currentWaveIndex 更新
- **WHEN** 客户端发送 `battle:wave_progress` `{ waveIndex: 2, totalWaves: 5 }`
- **THEN** `engine.battleState.currentWaveIndex` 为 2，数据库持久化包含该值

#### Scenario: waves 数组不因上报而改变
- **WHEN** 客户端发送 `battle:wave_progress`
- **THEN** `engine.battleState.waves` 数组长度与内容与战斗启动时相同

---

## ADDED Requirements

### Requirement: battle:restore 携带 waves 和 currentWaveIndex
系统 SHALL 在断线重连流程中，将从数据库读取的 `battle_state`（含 `waves` 和 `currentWaveIndex`）完整包含在 `battle:restore` 事件 payload 的 `battleState` 字段中；客户端 SHALL 可据此恢复到正确波次。

#### Scenario: 重连时 battle:restore 含 waves
- **WHEN** 玩家断线后重新加入处于 in_battle 状态的房间
- **THEN** 服务端向该 socket emit `battle:restore`，payload 中 `battleState.waves` 为非空数组，`battleState.currentWaveIndex` 与断线前最后一次 `battle:wave_progress` 上报的值一致

#### Scenario: 旧格式 battle_state（无 waves）重连降级
- **WHEN** 数据库中 `battle_state` 不含 `waves` 字段（旧数据行）
- **THEN** `battle:restore` 仍正常发送，`battleState.waves` 为 undefined 或缺失；客户端 `MultiplayerDungeonAdapter` 降级走原有 seed 逻辑，战斗不崩溃
