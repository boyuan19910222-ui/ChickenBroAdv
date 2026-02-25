## MODIFIED Requirements

### Requirement: Equipment schema uses named slots
The equipment field in PlayerSchema SHALL define sixteen named slots: head, shoulders, chest, legs, hands, wrists, waist, feet, back, neck, finger1, finger2, trinket1, trinket2, mainHand, offHand, each defaulting to null.

#### Scenario: Default equipment structure
- **WHEN** a new player is created via `createDefaultPlayer()`
- **THEN** `equipment` is `{ head: null, shoulders: null, chest: null, legs: null, hands: null, wrists: null, waist: null, feet: null, back: null, neck: null, finger1: null, finger2: null, trinket1: null, trinket2: null, mainHand: null, offHand: null }`

#### Scenario: Bare object equipment is normalized
- **WHEN** `ensurePlayerFields({ equipment: {} })` is called
- **THEN** `equipment` is normalized to have all sixteen named slots set to null

### Requirement: PlayerSchema defines all player fields with types and defaults
PlayerSchema SHALL export a `PLAYER_FIELDS` object that enumerates every field a player object can contain, along with its type and default value (or default value factory function for objects/arrays).

#### Scenario: Schema covers all known player fields
- **WHEN** `PLAYER_FIELDS` is inspected
- **THEN** it contains entries for: id, name, class, className, emoji, level, experience, experienceToNext, baseStats, stats, currentHp, maxHp, resource, currentMana, maxMana, skills, skillCooldowns, equipment, buffs, debuffs, statistics, gold, inventory, talents, comboPoints, createdAt, isPlayer

## ADDED Requirements

### Requirement: EQUIPMENT_SLOTS constant in PlayerSchema
PlayerSchema SHALL export an `EQUIPMENT_SLOTS` constant array listing all 16 valid slot IDs: `['head', 'shoulders', 'chest', 'legs', 'hands', 'wrists', 'waist', 'feet', 'back', 'neck', 'finger1', 'finger2', 'trinket1', 'trinket2', 'mainHand', 'offHand']`.

#### Scenario: EQUIPMENT_SLOTS array
- **WHEN** `EQUIPMENT_SLOTS` is inspected
- **THEN** it contains exactly 16 string entries matching all valid slot IDs

### Requirement: Inventory capacity increased to 40
The default inventory capacity SHALL be 40 slots.

#### Scenario: New player inventory
- **WHEN** a new player is created via `createDefaultPlayer()`
- **THEN** inventory is an empty array with maximum capacity check of 40

#### Scenario: Inventory full at 40
- **WHEN** a player has 40 items in inventory and tries to add another
- **THEN** the operation is rejected with "背包已满"
