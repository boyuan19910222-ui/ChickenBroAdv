## ADDED Requirements

### Requirement: Formula-based attribute generation
The system SHALL compute monster base attributes from level using deterministic formulas, then apply type multipliers (melee/caster) to produce final attribute values.

#### Scenario: Melee monster attribute calculation
- **WHEN** a melee monster of level 30 is generated
- **THEN** base HP = floor(80 + 30×50 + 30²×0.3) = floor(80+1500+270) = 1850, final HP = floor(1850 × 1.0) = 1850
- **AND** base Str = floor(8 + 30×2.2) = 74, final Str = floor(74 × 1.0) = 74
- **AND** base Int = floor(3 + 30×0.8) = 27, final Int = floor(27 × 0.3) = 8

#### Scenario: Caster monster attribute calculation
- **WHEN** a caster monster of level 30 is generated
- **THEN** final HP = floor(1850 × 0.7) = 1295
- **AND** final Str = floor(74 × 0.4) = 29
- **AND** final Int = floor(27 × 1.3) = 35

### Requirement: Formula parameter definitions
The system SHALL use the following base formulas (level = lv):

| Attribute | Formula |
|-----------|---------|
| HP | 80 + lv × 50 + lv² × 0.3 |
| Strength | 8 + lv × 2.2 |
| Agility | 4 + lv × 1.2 |
| Intellect | 3 + lv × 0.8 |
| Stamina | 6 + lv × 1.8 |
| Experience | 10 + lv × 6 |
| Gold min | 3 + lv × 1.5 |
| Gold max | 8 + lv × 4 |

#### Scenario: Level 1 base values
- **WHEN** a level 1 monster's base attributes are calculated
- **THEN** HP = floor(80+50+0.3) = 130, Str = floor(10.2) = 10, Agi = floor(5.2) = 5, Int = floor(3.8) = 3, Sta = floor(7.8) = 7, Exp = 16, Gold = {min:4, max:12}

#### Scenario: Level 60 base values
- **WHEN** a level 60 monster's base attributes are calculated
- **THEN** HP = floor(80+3000+1080) = 4160, Str = floor(140) = 140, Exp = 370, Gold = {min:93, max:248}

### Requirement: Type multiplier definitions
The system SHALL apply the following multipliers based on monsterType:

| Attribute | melee | caster |
|-----------|-------|--------|
| HP | 1.0 | 0.7 |
| Strength | 1.0 | 0.4 |
| Agility | 0.6 | 0.5 |
| Intellect | 0.3 | 1.3 |
| Stamina | 1.0 | 0.7 |

Experience and gold are NOT affected by type multipliers.

#### Scenario: Type multiplier application
- **WHEN** a melee and caster monster of the same level are compared
- **THEN** the melee monster SHALL have higher HP, Strength, and Stamina
- **AND** the caster monster SHALL have higher Intellect

### Requirement: Monster data structure includes monsterType field
Each monster entry in `GameData.monsters` SHALL include a `monsterType` field with value `'melee'` or `'caster'`.

#### Scenario: Monster data has type field
- **WHEN** any monster is loaded from GameData
- **THEN** it SHALL have a `monsterType` property set to either `'melee'` or `'caster'`

### Requirement: Pre-computed static data
Monster attributes SHALL be pre-computed and stored as static values in `GameData.monsters`. The formula is a development-time tool, NOT a runtime computation.

#### Scenario: Monster attributes are static
- **WHEN** the game loads monster data
- **THEN** all attribute values (hp, strength, agility, intellect, stamina, exp, gold) are directly available as numeric properties without runtime calculation
