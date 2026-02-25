## MODIFIED Requirements

### Requirement: PlayerSchema defines all player fields with types and defaults
PlayerSchema SHALL export a `PLAYER_FIELDS` object that enumerates every field a player object can contain, along with its type and default value (or default value factory function for objects/arrays).

#### Scenario: Schema covers all known player fields
- **WHEN** `PLAYER_FIELDS` is inspected
- **THEN** it contains entries for: id, name, class, className, emoji, level, experience, experienceToNext, baseStats, stats, currentHp, maxHp, resource, currentMana, maxMana, skills, skillCooldowns, equipment, buffs, debuffs, statistics, gold, inventory, talents, comboPoints, createdAt, isPlayer

#### Scenario: Level field default and max
- **WHEN** a new player is created
- **THEN** `level` defaults to 1, and the system enforces a maximum of 60

#### Scenario: Experience fields for new player
- **WHEN** a new player is created
- **THEN** `experience` is 0 and `experienceToNext` equals `GameData.expTable[1]` (200)
