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
