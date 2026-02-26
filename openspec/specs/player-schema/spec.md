## ADDED Requirements

### Requirement: PlayerSchema defines all player fields with types and defaults
PlayerSchema SHALL export a `PLAYER_FIELDS` object that enumerates every field a player object can contain, along with its type and default value (or default value factory function for objects/arrays).

#### Scenario: Schema covers all known player fields
- **WHEN** `PLAYER_FIELDS` is inspected
- **THEN** it contains entries for: id, name, class, className, emoji, level, experience, experienceToNext, baseStats, stats, currentHp, maxHp, resource, currentMana, maxMana, skills, skillCooldowns, equipment, buffs, debuffs, statistics, gold, inventory, talents, comboPoints, createdAt, isPlayer

### Requirement: PlayerSchema provides createDefaultPlayer factory
PlayerSchema SHALL export a `createDefaultPlayer(name, classId)` function that returns a complete player object with all fields populated according to class configuration from GameData.

#### Scenario: Create a warrior
- **WHEN** `createDefaultPlayer('TestChar', 'warrior')` is called
- **THEN** the returned object contains all PLAYER_FIELDS keys, with class-specific values (warrior baseStats, rage resource, warrior skills, warrior emoji/className)

#### Scenario: Create a rogue with combo points
- **WHEN** `createDefaultPlayer('Rogue', 'rogue')` is called
- **THEN** the returned object includes `comboPoints: { current: 0, max: 5 }` and `resource.type` is `'energy'`

#### Scenario: Create a rogue with valid starter skills
- **WHEN** a rogue character is created through the current character creation flow
- **THEN** starter skills include `shadowStrike`
- **AND** starter mapping does not depend on `sinisterStrike`

#### Scenario: Create a mage with mana
- **WHEN** `createDefaultPlayer('Mage', 'mage')` is called
- **THEN** the returned object includes `resource.type` as `'mana'` and mana-based resource values

#### Scenario: Invalid class throws error
- **WHEN** `createDefaultPlayer('Test', 'invalidClass')` is called
- **THEN** an error is thrown with message indicating unknown class

### Requirement: PlayerSchema provides field completion utility
PlayerSchema SHALL export an `ensurePlayerFields(playerData)` function that fills in any missing fields from PLAYER_FIELDS with their default values, without overwriting existing fields.

#### Scenario: Missing fields are filled
- **WHEN** `ensurePlayerFields({ name: 'Old', class: 'warrior', level: 5 })` is called
- **THEN** the returned object has all PLAYER_FIELDS keys; `name` is 'Old', `level` is 5, and missing fields like `statistics`, `talents`, `createdAt` are set to their defaults

#### Scenario: Existing fields are preserved
- **WHEN** `ensurePlayerFields({ name: 'Old', gold: 999 })` is called
- **THEN** `gold` remains 999 (not overwritten with default)

### Requirement: Equipment schema uses named slots
The equipment field in PlayerSchema SHALL define five named slots: weapon, armor, helmet, boots, accessory, each defaulting to null.

#### Scenario: Default equipment structure
- **WHEN** a new player is created via `createDefaultPlayer()`
- **THEN** `equipment` is `{ weapon: null, armor: null, helmet: null, boots: null, accessory: null }`

#### Scenario: Bare object equipment is normalized
- **WHEN** `ensurePlayerFields({ equipment: {} })` is called
- **THEN** `equipment` is normalized to `{ weapon: null, armor: null, helmet: null, boots: null, accessory: null }`

### Requirement: `game_state` 字段在 MySQL 中使用 MEDIUMTEXT 类型存储
`characters` 表的 `game_state` 字段在 ORM 模型中 SHALL 声明为 `DataTypes.TEXT('medium')`（MySQL `MEDIUMTEXT`），以支持最大 16MB 的 JSON 存档字符串，不得使用 `TEXT`（65535 字节上限）。

#### Scenario: 大型存档写入不被截断
- **WHEN** 向 `characters.game_state` 写入超过 65535 字节的序列化 JSON
- **THEN** 数据完整写入 MySQL，读取时与写入内容逐字节一致

### Requirement: ORM 模型序列化不修改 `game_state` 内容
Sequelize 模型在读写 `game_state` 字段时 SHALL 保持原始字符串格式，不自动解析为 JSON 对象，不做任何转换（`getter`/`setter` 不做处理），确保上层 `JSON.parse` / `JSON.stringify` 逻辑不受影响。

#### Scenario: 存档原始字符串往返一致
- **WHEN** 将 JSON 字符串写入 `game_state` 后立即读取
- **THEN** 读取到的值与写入值字符完全相同（无自动 parse 或 stringify）

### Requirement: 玩家字段对外 API 形状与 MySQL 列名映射保持一致
ORM 查询返回的玩家对象字段名 SHALL 与现有 API 响应中前端期望的字段名一致（`snake_case`），不通过 Sequelize `underscored` 或 `as` 别名引入新字段名。

#### Scenario: API 响应角色字段名不变
- **WHEN** `GET /api/characters/:id` 返回角色数据
- **THEN** 字段名为 `user_id`、`created_at`、`updated_at`、`last_played_at`（snake_case），与重构前一致
