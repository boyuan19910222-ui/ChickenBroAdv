## ADDED Requirements

### Requirement: Combat experience has individual variation
CombatSystem SHALL apply a ±10% random variation to the base experience reward for each monster kill. Formula: `Math.floor(baseExp * (1 + (Math.random() * 0.2 - 0.1)))`.

#### Scenario: Same monster type gives varying experience
- **WHEN** a player kills a Forest Orc (baseExp=30) multiple times
- **THEN** each kill awards between 27 and 33 experience (30 ± 10%)

#### Scenario: Experience is always at least 1 if base is positive
- **WHEN** a monster has baseExp > 0 and variation would round to 0
- **THEN** at least 1 experience is awarded (before other multipliers)

### Requirement: Level difference penalty reduces monster experience
CombatSystem SHALL apply an experience penalty multiplier based on the difference between player level and monster level:
- `playerLevel - monsterLevel >= 7`: multiplier = 0 (no experience)
- `playerLevel - monsterLevel >= 5`: multiplier = 0.5
- `playerLevel - monsterLevel >= 3`: multiplier = 0.7
- Otherwise: multiplier = 1.0

The penalty is applied AFTER the ±10% individual variation.

#### Scenario: Player 3 levels above monster
- **WHEN** a level 10 player kills a level 7 monster (baseExp=50)
- **THEN** experience is `floor(50 * variation * 0.7)`, approximately 31-38

#### Scenario: Player 5 levels above monster
- **WHEN** a level 15 player kills a level 10 monster (baseExp=80)
- **THEN** experience is `floor(80 * variation * 0.5)`, approximately 36-44

#### Scenario: Player 7 or more levels above monster
- **WHEN** a level 20 player kills a level 13 or lower monster
- **THEN** experience awarded is 0

#### Scenario: Player equal or below monster level
- **WHEN** a level 5 player kills a level 5 or higher monster
- **THEN** no penalty is applied, multiplier is 1.0

#### Scenario: Player 2 levels above monster (no penalty)
- **WHEN** a level 10 player kills a level 8 monster
- **THEN** no penalty is applied, multiplier is 1.0

### Requirement: Quest experience is exempt from level penalty
QuestSystem experience rewards SHALL NOT be subject to the level difference penalty. Quest experience is always awarded in full.

#### Scenario: High level player completes low level quest
- **WHEN** a level 50 player completes a level 10 quest with 200 exp reward
- **THEN** the full 200 experience is awarded

### Requirement: Dungeon encounter victory awards experience
DungeonCombatSystem SHALL emit `exp:gain` after each encounter victory (not just dungeon completion). The experience SHALL be the sum of all defeated enemies' loot.exp in that encounter, subject to ±10% variation and level difference penalty per enemy.

#### Scenario: Dungeon encounter with 3 enemies
- **WHEN** a party defeats an encounter with 3 enemies (baseExp: 40, 40, 60)
- **THEN** total experience is the sum of each enemy's exp after individual variation and level penalty

#### Scenario: Dungeon boss encounter
- **WHEN** a party defeats a boss encounter (boss baseExp: 300)
- **THEN** the boss experience (with variation and level penalty) is awarded immediately

#### Scenario: Dungeon completion bonus remains
- **WHEN** the final encounter of a dungeon is completed
- **THEN** both the encounter experience AND the dungeon completion reward (rewards.expBase) are awarded

### Requirement: Experience gain is logged in combat messages
CombatSystem and DungeonCombatSystem SHALL log experience gains in combat messages with format `⭐ +{amount} 经验值` for normal gains, and `⭐ +{amount} 经验值 (等级惩罚)` when level penalty was applied.

#### Scenario: Normal experience gain message
- **WHEN** a player gains 45 experience from killing a monster
- **THEN** combat log shows `⭐ +45 经验值`

#### Scenario: Penalized experience gain message
- **WHEN** a player gains 28 experience after level penalty from a monster
- **THEN** combat log shows `⭐ +28 经验值 (等级惩罚)`

#### Scenario: Zero experience due to level penalty
- **WHEN** a player kills a monster 7+ levels below and gets 0 experience
- **THEN** combat log shows `⭐ 经验值太低，未获得经验`
