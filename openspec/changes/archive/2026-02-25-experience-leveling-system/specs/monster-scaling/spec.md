## ADDED Requirements

### Requirement: Monster data covers levels 1-60 across 4 areas
GameData.monsters SHALL contain at least 24 monster types covering levels 1 through 60, distributed across the 4 existing areas. Each monster SHALL have: name, level, hp, damage, defense, skills, loot (exp, gold range).

#### Scenario: Every area has monsters
- **WHEN** GameData.monsters is inspected
- **THEN** monsters exist for elwynnForest (Lv 1-10), westfall (Lv 10-20), stranglethorn (Lv 20-45), easternPlaguelands (Lv 45-60)

#### Scenario: No level gaps larger than 3
- **WHEN** all monster levels are collected and sorted
- **THEN** there is no gap larger than 3 levels between consecutive monster levels across the full 1-60 range

### Requirement: Monster baseExp follows level-based formula with variation
Each monster's loot.exp SHALL be approximately `10 + 3 * level + 0.05 * level²`, with ±30% manual variation between species in the same area to create strategic choice.

#### Scenario: Level 1 monster base experience
- **WHEN** a level 1 monster's loot.exp is checked
- **THEN** it is approximately 13 (10 + 3 + 0.05), adjusted ±30% for species variety (range: ~9-17)

#### Scenario: Level 30 monster base experience
- **WHEN** a level 30 monster's loot.exp is checked
- **THEN** it is approximately 145 (10 + 90 + 45), adjusted ±30% for species variety (range: ~100-190)

#### Scenario: Level 55 monster base experience
- **WHEN** a level 55 monster's loot.exp is checked
- **THEN** it is approximately 326 (10 + 165 + 151), adjusted ±30% for species variety (range: ~228-424)

### Requirement: Monster HP and damage scale with level
Monster HP SHALL scale approximately as `100 + 20 * level + 0.5 * level²`. Monster damage SHALL scale approximately as `8 + 2 * level + 0.1 * level²`. These are base formulas; individual monsters may deviate ±20%.

#### Scenario: Level 1 monster stats
- **WHEN** a level 1 monster's stats are checked
- **THEN** HP is approximately 120-150 and damage is approximately 10-15

#### Scenario: Level 50 monster stats
- **WHEN** a level 50 monster's stats are checked
- **THEN** HP is approximately 2350 (±20%) and damage is approximately 358 (±20%)

### Requirement: Elwynn Forest monsters (Lv 1-10)
Elwynn Forest SHALL contain at least 5 monster types at levels 1-10. Existing monsters (forestOrc, goblin, wolf, skeleton, troll) SHALL be updated to fit the 1-10 level range with recalculated stats and experience.

#### Scenario: Existing monsters retained with updated stats
- **WHEN** elwynnForest monsters are listed
- **THEN** forestOrc, goblin, wolf, skeleton, troll are present with levels distributed across 1-10

### Requirement: Westfall monsters (Lv 10-20)
GameData.monsters SHALL include at least 5 new monster types for Westfall at levels 10-20.

#### Scenario: Westfall has level-appropriate monsters
- **WHEN** westfall monsters are listed
- **THEN** at least 5 monsters exist with levels between 10 and 20

### Requirement: Stranglethorn monsters (Lv 20-45)
GameData.monsters SHALL include at least 7 monster types for Stranglethorn at levels 20-45, reflecting the wider level range.

#### Scenario: Stranglethorn covers wide level range
- **WHEN** stranglethorn monsters are listed
- **THEN** at least 7 monsters exist with levels distributed between 20 and 45

### Requirement: Eastern Plaguelands monsters (Lv 45-60)
GameData.monsters SHALL include at least 7 monster types for Eastern Plaguelands at levels 45-60.

#### Scenario: Eastern Plaguelands has endgame monsters
- **WHEN** easternPlaguelands monsters are listed
- **THEN** at least 7 monsters exist with levels between 45 and 60

### Requirement: Area monster references updated
GameData.areas SHALL reference the correct monster IDs for each area. The `monsters` array in each area SHALL only contain monsters appropriate for that area's level range.

#### Scenario: Area monster lists match level ranges
- **WHEN** each area's monster list is checked
- **THEN** all referenced monsters have levels within ±2 of the area's stated level range

### Requirement: Dungeon monsters have experience rewards
Dungeon encounter enemy definitions SHALL include loot.exp fields. Boss enemies SHALL have 3-5x the baseExp of same-level normal monsters.

#### Scenario: Wailing Caverns boss experience
- **WHEN** a Wailing Caverns boss (level ~18-20) loot.exp is checked
- **THEN** it is 3-5x higher than a same-level normal monster's baseExp

#### Scenario: Dungeon trash mob experience
- **WHEN** a Wailing Caverns normal enemy loot.exp is checked
- **THEN** it is approximately equal to a same-level open world monster's baseExp
