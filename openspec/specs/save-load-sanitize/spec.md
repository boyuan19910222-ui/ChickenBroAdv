## ADDED Requirements

### Requirement: GameEngine.loadGame sanitizes state to exploration with full resources
GameEngine.loadGame() SHALL, after restoring state from SaveManager, sanitize the game state so the player always enters the game in exploration mode with full health and resources.

#### Scenario: Loading a save made during wild combat
- **WHEN** a save with `game.scene = 'combat'` and `combat` containing enemy data is loaded
- **THEN** `game.scene` is set to `'exploration'`, `combat` is set to `null`, and player HP equals maxHp

#### Scenario: Loading a save made during dungeon combat
- **WHEN** a save with `game.scene = 'dungeon'` and `dungeonCombat` containing battlefield data is loaded
- **THEN** `game.scene` is set to `'exploration'`, `dungeonCombat` is set to `null`, and player HP equals maxHp

#### Scenario: Loading a save already in exploration
- **WHEN** a save with `game.scene = 'exploration'` and `player.currentHp < player.maxHp` is loaded
- **THEN** `game.scene` remains `'exploration'` and player HP is restored to maxHp

### Requirement: Sanitize restores player HP and mana to maximum
The sanitize logic SHALL set `player.currentHp = player.maxHp` and `player.currentMana = player.maxMana`.

#### Scenario: Player with half health and low mana
- **WHEN** a save with `player.currentHp = 50`, `player.maxHp = 200`, `player.currentMana = 10`, `player.maxMana = 100` is loaded
- **THEN** after sanitize, `player.currentHp = 200` and `player.currentMana = 100`

### Requirement: Sanitize resets resource by class type
The sanitize logic SHALL reset the player's resource system based on the resource type:
- `rage` → `resource.current = 0`
- `mana` → `resource.current = resource.max`
- `energy` → `resource.current = resource.max`

#### Scenario: Warrior with accumulated rage
- **WHEN** a warrior save with `player.resource = { type: 'rage', current: 65, max: 100 }` is loaded
- **THEN** after sanitize, `player.resource.current = 0`

#### Scenario: Mage with depleted mana resource
- **WHEN** a mage save with `player.resource = { type: 'mana', current: 12, max: 100 }` is loaded
- **THEN** after sanitize, `player.resource.current = 100`

#### Scenario: Rogue with partial energy
- **WHEN** a rogue save with `player.resource = { type: 'energy', current: 40, max: 100 }` is loaded
- **THEN** after sanitize, `player.resource.current = 100`

### Requirement: Sanitize clears buffs, debuffs, and skill cooldowns
The sanitize logic SHALL clear all temporary combat state: `player.buffs = []`, `player.debuffs = []`, and all entries in `player.skillCooldowns` set to `0`.

#### Scenario: Player with active buffs and cooldowns from combat
- **WHEN** a save with `player.buffs = [{ name: 'battleShout', duration: 3 }]`, `player.debuffs = [{ name: 'bleed', duration: 2 }]`, `player.skillCooldowns = { heroicStrike: 0, mortalStrike: 2, execute: 3 }` is loaded
- **THEN** after sanitize, `player.buffs = []`, `player.debuffs = []`, and `player.skillCooldowns = { heroicStrike: 0, mortalStrike: 0, execute: 0 }`

### Requirement: Sanitize resets combo points if present
The sanitize logic SHALL reset `player.comboPoints.current` to `0` if `player.comboPoints` exists.

#### Scenario: Rogue with accumulated combo points
- **WHEN** a save with `player.comboPoints = { current: 4, max: 5 }` is loaded
- **THEN** after sanitize, `player.comboPoints = { current: 0, max: 5 }`

### Requirement: Sanitize restores pet HP if pet exists
The sanitize logic SHALL restore `player.activePet.currentHp` to `player.activePet.maxHp` if `player.activePet` is not null and has `currentHp` and `maxHp` fields.

#### Scenario: Warlock with injured pet
- **WHEN** a save with `player.activePet = { name: 'Imp', currentHp: 20, maxHp: 80 }` is loaded
- **THEN** after sanitize, `player.activePet.currentHp = 80`

#### Scenario: Player without a pet
- **WHEN** a save with `player.activePet = null` is loaded
- **THEN** no pet-related sanitize is performed

### Requirement: Sanitize preserves character metadata
The sanitize logic SHALL NOT modify: `player.level`, `player.experience`, `player.experienceToNext`, `player.equipment`, `player.gold`, `player.inventory`, `player.skills`, `player.talents`, `player.statistics`, `player.activeQuests`, `player.completedQuests`, `player.name`, `player.class`, `player.id`, `player.createdAt`, `game.time`.

#### Scenario: Character progression data preserved after sanitize
- **WHEN** a save with `player.level = 30`, `player.experience = 5000`, `player.gold = 1500`, equipped items in `player.equipment`, and `player.statistics.monstersKilled = 200` is loaded
- **THEN** all these values remain unchanged after sanitize

### Requirement: Sanitize clears combat and dungeonCombat state
The sanitize logic SHALL set `combat` to `null` and `dungeonCombat` to `null` in the state.

#### Scenario: Save with active dungeon combat state
- **WHEN** a save with `dungeonCombat = { inCombat: true, battlefield: {...} }` is loaded
- **THEN** after sanitize, `dungeonCombat` is `null`

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
