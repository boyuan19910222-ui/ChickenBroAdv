## MODIFIED Requirements

### Requirement: PlayerSchema defines all player fields with types and defaults
PlayerSchema SHALL export a `PLAYER_FIELDS` object that enumerates every field a player object can contain, along with its type and default value (or default value factory function for objects/arrays). The `emoji` field SHALL be replaced with an `icon` field (string type, default derived from class).

#### Scenario: Schema covers all known player fields
- **WHEN** `PLAYER_FIELDS` is inspected
- **THEN** it contains an `icon` entry (string type) and does NOT contain an `emoji` entry

#### Scenario: Schema includes icon field
- **WHEN** `PLAYER_FIELDS.icon` is inspected
- **THEN** it has type `string` with a default value of `''`

### Requirement: PlayerSchema provides createDefaultPlayer factory
PlayerSchema SHALL export a `createDefaultPlayer(name, classId)` function that returns a complete player object with all fields populated according to class configuration from GameData. The `icon` field SHALL be set to the class's icon path from GameData.

#### Scenario: Create a warrior with icon
- **WHEN** `createDefaultPlayer('TestChar', 'warrior')` is called
- **THEN** the returned object contains `icon: '/icons/classes/warrior.png'` and does NOT contain an `emoji` field

#### Scenario: Create a rogue with icon and combo points
- **WHEN** `createDefaultPlayer('Rogue', 'rogue')` is called
- **THEN** the returned object includes `icon: '/icons/classes/rogue.png'`, `comboPoints: { current: 0, max: 5 }`, and `resource.type` is `'energy'`

### Requirement: PlayerSchema provides field completion utility
PlayerSchema SHALL export an `ensurePlayerFields(playerData)` function that fills in any missing fields from PLAYER_FIELDS with their default values, without overwriting existing fields. If a player has a `class` field but no `icon` field, the icon SHALL be auto-derived as `/icons/classes/${playerData.class}.png`. If a player has a legacy `emoji` field, it SHALL be removed.

#### Scenario: Missing icon field auto-derived from class
- **WHEN** `ensurePlayerFields({ name: 'Old', class: 'warrior', level: 5, emoji: '⚔️' })` is called
- **THEN** the returned object has `icon: '/icons/classes/warrior.png'` and does NOT have an `emoji` field

#### Scenario: Existing icon field is preserved
- **WHEN** `ensurePlayerFields({ name: 'New', class: 'mage', icon: '/icons/classes/mage.png' })` is called
- **THEN** `icon` remains `/icons/classes/mage.png'` (not overwritten)
