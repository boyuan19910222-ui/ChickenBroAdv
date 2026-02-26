## Why

当前多人副本的战斗数据（波次敌人组合、HP 数值、战斗随机序列）完全由各客户端基于 seed 自行生成，断线重连后客户端的随机数序列已偏移，导致重连玩家看到的波次与其他队员不一致，房间战斗状态实际上无法真正同步。服务端接管所有战斗数据生成是消除这类"幽灵状态"的根本手段。

## What Changes

- **BREAKING** 服务端不再仅下发 `seed`，改为在每波战斗开始前主动推送完整的敌人快照列表（`battle:wave_data`）
- **BREAKING** 客户端 `MultiplayerDungeonAdapter` 不再使用 `SeededRandom` 自行生成波次，改为等待服务端推送的波次数据
- 新增 `server/WaveGenerator.js`：服务端统一生成各波次敌人列表，结果写入 `battle_state.waves[]`
- 服务端 `BattleEngine` 扩展：负责记录当前波次索引及所有波次快照，作为 `battle_state` 的组成部分持久化
- 断线重连时，`battle:restore` 事件附带当前波次及后续波次数据，客户端可无缝恢复战场
- `battle:wave_progress` 事件改为服务端驱动推送（`battle:wave_start`），客户端不再主动上报波次进度

## Capabilities

### New Capabilities
- `server-wave-generation`: 服务端在战斗启动时为副本生成全部波次的敌人快照，每波推送 `battle:wave_start` 给房间内所有玩家；波次数据写入 `battle_state` 并持久化，用于断线恢复

### Modified Capabilities
- `room-state-persistence`: `battle_state` JSON 字段需新增 `waves` 数组（服务端生成的波次快照）和 `currentWaveIndex` 字段；断线重连时 `battle:restore` 事件结构随之变化

## Impact

- **server/BattleEngine.js** — 新增波次生成调度逻辑（或委托给 `WaveGenerator`）
- **server/WaveGenerator.js** — 新文件，从现有 dungeon 数据（`WailingCaverns.js`、`RagefireChasm.js`）提取敌人配置并生成各波次快照
- **server/index.js** — `battle:wave_progress` socket 事件废弃，改为服务端主动 emit `battle:wave_start`
- **src/systems/MultiplayerDungeonAdapter.js** — 移除 `SeededRandom` 波次生成逻辑，改为监听 `battle:wave_start` 事件
- **src/data/dungeons/WailingCaverns.js、RagefireChasm.js** — 波次配置需可在 Node.js 环境下导入（若使用 ES module 须服务端兼容）
- **数据库** — `rooms.battle_state` 字段结构变更（向后不兼容，需迁移脚本）
- **API 兼容性** — `battle:init`、`battle:restore`、`battle:wave_*` 事件协议均变更（参见 `api-compatibility-contract` spec）
