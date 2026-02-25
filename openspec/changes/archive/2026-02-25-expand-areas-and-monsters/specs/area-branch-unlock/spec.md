## ADDED Requirements

### Requirement: Area unlock supports prerequisites
Each area SHALL support an optional `unlockRequires` field containing an array of area IDs that must be explored before this area becomes accessible. The unlock condition is: player level >= `unlockLevel` AND all areas in `unlockRequires` have been explored.

#### Scenario: Area with no prerequisites
- **WHEN** an area has `unlockRequires: []` or no `unlockRequires` field
- **THEN** the area SHALL unlock when player reaches `unlockLevel`

#### Scenario: Area with single prerequisite
- **WHEN** an area has `unlockRequires: ['elwynnForest']` and `unlockLevel: 10`
- **THEN** the area SHALL unlock only when player is level >= 10 AND has explored 'elwynnForest'

#### Scenario: Area with multiple prerequisites
- **WHEN** an area has `unlockRequires: ['westfall', 'duskwood']`
- **THEN** the area SHALL unlock only when ALL listed prerequisite areas have been explored AND the level requirement is met

### Requirement: Branch topology with 15 areas
The system SHALL define exactly 15 open-world areas covering Lv 1-60, arranged in a branching topology:

| # | Area ID | Name | Emoji | Level Range | Environment | Unlock Level | Prerequisites |
|---|---------|------|-------|-------------|-------------|-------------|---------------|
| 1 | elwynnForest | 艾尔文森林 | 🌲 | 1-10 | forest | 1 | [] |
| 2 | dunMorogh | 丹莫罗 | ❄️ | 6-15 | snow | 5 | [elwynnForest] |
| 3 | westfall | 西部荒野 | 🌾 | 10-20 | plains | 10 | [elwynnForest] |
| 4 | duskwood | 暮色森林 | 🌑 | 15-25 | darkforest | 14 | [westfall] |
| 5 | wetlands | 湿地 | 🐊 | 18-28 | swamp | 17 | [dunMorogh] |
| 6 | stranglethorn | 荆棘谷 | 🌿 | 22-35 | jungle | 20 | [duskwood, wetlands] |
| 7 | badlands | 荒芜之地 | 🏜️ | 28-38 | desert | 26 | [stranglethorn] |
| 8 | searingGorge | 灼热峡谷 | 🌋 | 32-42 | volcanic | 30 | [badlands] |
| 9 | hinterlands | 辛特兰 | ⛰️ | 36-46 | highland | 34 | [badlands] |
| 10 | felwood | 费伍德森林 | 🍄 | 40-50 | corrupt | 38 | [hinterlands] |
| 11 | easternPlaguelands | 东瘟疫之地 | ☠️ | 45-55 | plague | 43 | [felwood, stranglethorn] |
| 12 | winterspring | 冬泉谷 | 🐻‍❄️ | 48-58 | frost | 46 | [easternPlaguelands] |
| 13 | burningSteppes | 燃烧平原 | 🔥 | 50-58 | war | 48 | [searingGorge, easternPlaguelands] |
| 14 | blstedLands | 诅咒之地 | 💀 | 52-60 | demonic | 50 | [easternPlaguelands] |
| 15 | silithus | 希利苏斯 | 🐉 | 55-60 | silithid | 53 | [winterspring, blstedLands] |

#### Scenario: Starting area has no prerequisites
- **WHEN** a new player begins the game
- **THEN** 艾尔文森林 (elwynnForest) SHALL be accessible immediately at level 1

#### Scenario: Branch split at elwynnForest
- **WHEN** a player has explored elwynnForest and reaches level 10
- **THEN** both 丹莫罗 (dunMorogh, needs lv5) and 西部荒野 (westfall, needs lv10) SHALL be available

#### Scenario: Convergence at stranglethorn
- **WHEN** a player has explored both duskwood and wetlands and is level >= 20
- **THEN** 荆棘谷 (stranglethorn) SHALL become unlocked

#### Scenario: End-game convergence at silithus
- **WHEN** a player has explored both winterspring and blstedLands and is level >= 53
- **THEN** 希利苏斯 (silithus) SHALL become the final unlockable area

### Requirement: Each area has 8-10 monsters with mixed types
Every area SHALL reference 8-10 monsters in its `monsters` array, with approximately 50% melee type and 50% caster type (±1 monster tolerance).

#### Scenario: Area monster count within range
- **WHEN** any area's monster list is examined
- **THEN** the list SHALL contain between 8 and 10 monster IDs (inclusive)

#### Scenario: Area has balanced monster types
- **WHEN** the monsters referenced by any area are examined
- **THEN** the count of melee monsters and caster monsters SHALL differ by at most 1

### Requirement: Monster levels match area level range
All monsters referenced by an area SHALL have levels within or close to (±2) the area's `levelRange.min` to `levelRange.max`.

#### Scenario: Monster level within area range
- **WHEN** a monster is referenced by an area with levelRange {min: 10, max: 20}
- **THEN** the monster's level SHALL be between 8 and 22 (area range ±2)

### Requirement: Area data structure extensions
Each area object SHALL include the following fields (extending existing structure):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique area identifier |
| name | string | yes | Display name |
| emoji | string | yes | Area icon |
| levelRange | {min, max} | yes | Level range |
| environment | string | yes | Environment type |
| description | string | yes | Flavor text |
| unlockLevel | number | yes | Minimum level to access |
| unlockRequires | string[] | yes | Prerequisite area IDs (empty array for no prerequisites) |
| monsters | string[] | yes | Monster IDs (8-10 entries) |
| rewards | {expBonus, goldBonus} | yes | Reward multipliers |
| events | string[] | yes | Dynamic event types |

#### Scenario: New area has all required fields
- **WHEN** any area is loaded from GameData
- **THEN** it SHALL have all required fields including the new `unlockRequires` field
