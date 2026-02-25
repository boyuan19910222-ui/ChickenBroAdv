## ADDED Requirements

### Requirement: ExpTable contains 60 level entries using segmented curve
GameData.expTable SHALL contain exactly 60 entries (index 1-59 for levels 1→2 through 59→60, index 0 unused), calculated using 4-segment linear formulas:
- Segment 1 (Lv 1-19): `expToNext = 200 + 40 * (L - 1)`
- Segment 2 (Lv 20-39): `expToNext = 1500 + 200 * (L - 20)`
- Segment 3 (Lv 40-54): `expToNext = 7000 + 700 * (L - 40)`
- Segment 4 (Lv 55-59): `expToNext = 18000 + 1200 * (L - 55)`

#### Scenario: Level 1 to 2 experience requirement
- **WHEN** expTable[1] is checked
- **THEN** it equals 200

#### Scenario: Level 10 to 11 experience requirement
- **WHEN** expTable[10] is checked
- **THEN** it equals 200 + 40 * 9 = 560

#### Scenario: Level 20 to 21 experience requirement (segment boundary)
- **WHEN** expTable[20] is checked
- **THEN** it equals 1500 (segment 2 base)

#### Scenario: Level 40 to 41 experience requirement (segment boundary)
- **WHEN** expTable[40] is checked
- **THEN** it equals 7000 (segment 3 base)

#### Scenario: Level 55 to 56 experience requirement (segment boundary)
- **WHEN** expTable[55] is checked
- **THEN** it equals 18000 (segment 4 base)

#### Scenario: Level 59 to 60 experience requirement
- **WHEN** expTable[59] is checked
- **THEN** it equals 18000 + 1200 * 4 = 22800

#### Scenario: ExpTable has exactly 60 entries
- **WHEN** expTable.length is checked
- **THEN** it equals 60

### Requirement: Level cap is 60
CharacterSystem SHALL enforce a maximum level of 60. The `addExperience` method's while-loop condition SHALL check `player.level < 60`.

#### Scenario: Player at level 59 can level up to 60
- **WHEN** a level 59 player gains enough experience to level up
- **THEN** player levels up to 60, experience overflow is discarded, and `player.experience` is set to 0

#### Scenario: Player at level 60 cannot gain experience
- **WHEN** `addExperience(amount)` is called on a level 60 player
- **THEN** the method returns immediately without modifying `player.experience`

### Requirement: Max level player has zero experience display
When a player reaches level 60, `player.experienceToNext` SHALL be set to 0, and `player.experience` SHALL be 0.

#### Scenario: Level 60 experience fields
- **WHEN** a player reaches level 60
- **THEN** `player.experience` is 0 and `player.experienceToNext` is 0

### Requirement: Level up restores full HP and resource
CharacterSystem.levelUp() SHALL restore player to full HP and full mana/resource upon leveling up (existing behavior preserved).

#### Scenario: Warrior levels up
- **WHEN** a warrior levels up
- **THEN** `currentHp` equals `maxHp` and mana-type resources are restored

### Requirement: Level up emits event with new level
CharacterSystem SHALL emit `character:levelUp` event with `{ level, stats }` after each level up (existing behavior preserved).

#### Scenario: Level up event
- **WHEN** a player levels up from 30 to 31
- **THEN** `character:levelUp` event is emitted with `{ level: 31, stats: <updated stats> }`

### Requirement: Talent points scale to level 60
TalentSystem SHALL award talent points starting at level 10, one per level, up to a maximum of 51 points at level 60. Formula: `Math.max(0, Math.min(level - 9, 51))`.

#### Scenario: Level 60 talent points
- **WHEN** a level 60 character's available talent points are calculated
- **THEN** the maximum is 51 points (60 - 9 = 51)
