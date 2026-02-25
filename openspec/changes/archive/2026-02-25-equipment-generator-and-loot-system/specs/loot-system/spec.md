## ADDED Requirements

### Requirement: LootSystem provides world loot rolling
The system SHALL export a `LootSystem` class (or module) with a `rollWorldLoot(enemy, player)` method that determines equipment drops from open-world combat based on area configuration, level penalty, and quality cap.

#### Scenario: Normal drop from Eastern Plaguelands
- **WHEN** a Lv50 player kills a Lv48 monster in Eastern Plaguelands (dropChance=0.33)
- **THEN** there is a 33% chance of receiving 1 equipment item with quality distributed per area weights (poor:30, common:25, uncommon:30, rare:15)

#### Scenario: No drop on failed roll
- **WHEN** a player kills a monster and the random roll exceeds dropChance
- **THEN** an empty array is returned (no equipment drop)

### Requirement: World loot quality cap is rare
Equipment dropped from open-world combat SHALL NOT exceed `rare` (blue) quality. Even if quality weights include higher tiers, the system SHALL clamp to rare.

#### Scenario: World drop cannot be epic
- **WHEN** rolling world loot and the weighted random selects epic quality
- **THEN** the quality is clamped to rare

#### Scenario: World drop can be rare
- **WHEN** rolling world loot with area weights that include rare
- **THEN** rare quality drops are possible

### Requirement: Level difference penalty reduces loot quality and chance
The system SHALL apply penalties when playerLevel - monsterLevel exceeds thresholds:
- diff > 5: quality cap locked to `common` (white)
- diff > 10: dropChance multiplied by 0.5
- diff > 15: no equipment drops (dropChance = 0)

#### Scenario: 6 level difference caps at common
- **WHEN** a Lv30 player kills a Lv24 monster (diff=6, >5)
- **THEN** equipment quality is capped at common (only poor or common can drop)

#### Scenario: 12 level difference halves drop chance
- **WHEN** a Lv42 player kills a Lv30 monster (diff=12, >10)
- **THEN** dropChance is halved AND quality is capped at common

#### Scenario: 16 level difference prevents drops
- **WHEN** a Lv50 player kills a Lv34 monster (diff=16, >15)
- **THEN** no equipment drops (returns empty array)

#### Scenario: 5 level difference has no penalty
- **WHEN** a Lv30 player kills a Lv25 monster (diff=5, not >5)
- **THEN** normal drop rules apply with no penalty

### Requirement: Area-level loot configuration
Each game area SHALL have a default loot profile containing: `dropChance`, `iLvlOffset` [min, max], `qualityWeights` (poor, common, uncommon, rare only), and `maxDrops`. The system SHALL use `AreaLootConfig` keyed by area ID.

#### Scenario: Elwynn Forest area config
- **WHEN** looking up loot config for elwynnForest area
- **THEN** config contains dropChance=0.25, iLvlOffset=[-1,2], qualityWeights with poor+common+uncommon+rare only, maxDrops=1

#### Scenario: Higher level area has better rates
- **WHEN** comparing easternPlaguelands (Lv45-60) to elwynnForest (Lv1-10)
- **THEN** easternPlaguelands has higher dropChance and higher uncommon/rare weights

### Requirement: Monster-level loot override
Individual monsters MAY override area defaults via `MonsterLootOverrides`. Override fields are merged with area defaults (override takes precedence per field).

#### Scenario: Plague wyrm has better drops than area default
- **WHEN** plaguewyrm has a loot override with dropChance=0.45
- **THEN** plaguewyrm uses 0.45 instead of area default 0.33, but inherits other fields from area config

### Requirement: Armor type smart matching
When generating loot, the system SHALL match armor type to player class with 80% probability for the player's preferred armor type, and 20% probability for a random armor type.

#### Scenario: Warrior gets plate 80% of time
- **WHEN** generating armor loot for a warrior player over many rolls
- **THEN** approximately 80% of armor pieces are plate type

#### Scenario: 20% chance of non-preferred armor
- **WHEN** generating armor loot for a mage player
- **THEN** approximately 20% of armor pieces are NOT cloth

### Requirement: Dungeon rewards only on successful completion
The system SHALL only grant equipment rewards upon successful dungeon completion. Mid-dungeon encounters SHALL NOT drop equipment (they still give experience and gold).

#### Scenario: Mid-dungeon encounter gives no equipment
- **WHEN** a player wins a dungeon encounter (not the final boss)
- **THEN** no equipment is dropped (experience and gold still awarded)

#### Scenario: Successful dungeon completion gives equipment
- **WHEN** a player successfully completes a dungeon
- **THEN** equipment rewards are generated per DungeonLootConfig

### Requirement: Dungeon reward count based on boss count
Dungeon completion reward equipment count SHALL be `1 + floor(bossCount / 2)`.

#### Scenario: 2-boss dungeon drops 2 items
- **WHEN** completing a dungeon with bossCount=2
- **THEN** totalDrops = 1 + floor(2/2) = 2 equipment items

#### Scenario: 4-boss dungeon drops 3 items
- **WHEN** completing a dungeon with bossCount=4
- **THEN** totalDrops = 1 + floor(4/2) = 3 equipment items

#### Scenario: 6-boss dungeon drops 4 items
- **WHEN** completing a dungeon with bossCount=6
- **THEN** totalDrops = 1 + floor(6/2) = 4 equipment items

### Requirement: Dungeon exclusive drops
Dungeons MAY define an `exclusiveDrops` list of `{ templateId, chance }`. During reward generation, exclusive drops are rolled first. At least 1 slot SHALL be reserved for the generator (exclusive drops capped at totalDrops - 1).

#### Scenario: Exclusive drop succeeds
- **WHEN** completing Wailing Caverns and staffOfDominance roll (chance=0.15) succeeds
- **THEN** staffOfDominance is included in rewards, and remaining slots use generateEquipment()

#### Scenario: Exclusive drops capped
- **WHEN** a 2-boss dungeon (totalDrops=2) has 3 exclusive drops all succeeding
- **THEN** only 1 exclusive drop is included (cap = totalDrops-1 = 1), 1 slot goes to generator

#### Scenario: No exclusive drops succeed
- **WHEN** completing a dungeon and all exclusive drop rolls fail
- **THEN** all totalDrops slots use generateEquipment()

### Requirement: Dungeon quality includes epic
Dungeon completion rewards SHALL allow `epic` quality in their quality weights. Legendary SHALL NOT appear in quality weights (only via exclusiveDrops templates).

#### Scenario: Dungeon can drop epic
- **WHEN** rolling quality for a dungeon reward with weights { uncommon:35, rare:50, epic:15 }
- **THEN** there is a 15% chance of epic quality

#### Scenario: Dungeon generator cannot produce legendary
- **WHEN** generating dungeon reward equipment
- **THEN** the generator is called with quality capped at epic; legendary is impossible via this path

### Requirement: DungeonLootConfig structure
Each dungeon SHALL have a loot config containing: `dungeonId`, `bossCount`, `recommendedLevelMax`, `iLvlOffset` [min, max], `qualityWeights` (uncommon/rare/epic), and optional `exclusiveDrops` array.

#### Scenario: Wailing Caverns config
- **WHEN** looking up loot config for wailingCaverns
- **THEN** config contains bossCount=2, recommendedLevelMax=24, iLvlOffset=[3,8], qualityWeights with uncommon+rare+epic, exclusiveDrops with staffOfDominance and crownOfDestruction

#### Scenario: Config is extensible for new dungeons
- **WHEN** adding a new dungeon to DungeonLootConfig
- **THEN** only need to add a new entry with the standard fields; no code changes required

### Requirement: iLvl calculation for drops
World loot iLvl SHALL be `monsterLevel + random(iLvlOffset[0], iLvlOffset[1])`. Dungeon reward iLvl SHALL be `recommendedLevelMax + random(iLvlOffset[0], iLvlOffset[1])`.

#### Scenario: World loot iLvl from Lv48 monster
- **WHEN** dropping loot from a Lv48 monster with iLvlOffset=[-1, 3]
- **THEN** iLvl is between 47 and 51

#### Scenario: Dungeon reward iLvl
- **WHEN** generating reward for wailingCaverns (recommendedLevelMax=24, iLvlOffset=[3,8])
- **THEN** iLvl is between 27 and 32
