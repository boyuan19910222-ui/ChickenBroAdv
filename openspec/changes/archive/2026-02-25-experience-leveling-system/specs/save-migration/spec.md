## ADDED Requirements

### Requirement: Migration v3→v4 updates experience table mapping
The migration from version 3 to version 4 SHALL recalculate `player.experienceToNext` using the new 60-level expTable based on the player's current level.

#### Scenario: Level 10 player migration
- **WHEN** a v3 save with player at level 10 is migrated to v4
- **THEN** `player.experienceToNext` is updated to the new expTable[10] value (560)

#### Scenario: Level 20 player migration (was max under old table)
- **WHEN** a v3 save with player at level 20 is migrated to v4
- **THEN** `player.experienceToNext` is updated to the new expTable[20] value (1500)

#### Scenario: Player experience preserved
- **WHEN** a v3 save with player having experience=500 is migrated
- **THEN** `player.experience` remains 500 (progress not reset)

### Requirement: Migration v3→v4 preserves player level
The migration SHALL NOT change the player's current level. Only `experienceToNext` is recalculated.

#### Scenario: Level and experience unchanged
- **WHEN** a v3 save with player at level 15, experience 200 is migrated
- **THEN** level remains 15, experience remains 200, experienceToNext is recalculated

### Requirement: CURRENT_VERSION updated to 4
SaveMigration CURRENT_VERSION SHALL be updated from 3 to 4.

#### Scenario: Version constant
- **WHEN** `CURRENT_VERSION` is checked after this change
- **THEN** it equals 4

## MODIFIED Requirements

### Requirement: SaveMigration maintains ordered migration registry
SaveMigration SHALL maintain a `migrations` object where each key is an integer version number and each value is a function `(data) => data` that transforms save data from that version to the next.

#### Scenario: Migration registry structure
- **WHEN** the migrations object is inspected
- **THEN** it contains sequential integer keys 1, 2, and 3, each mapping to a migration function

#### Scenario: Migration v3 exists
- **WHEN** migrations[3] is inspected
- **THEN** it is a function that handles experience table remapping for the 60-level system
