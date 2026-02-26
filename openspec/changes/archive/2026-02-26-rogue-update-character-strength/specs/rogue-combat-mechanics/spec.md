## ADDED Requirements

### Requirement: Rogue shadowStrike critical generates extra combo points
Rogue `shadowStrike` SHALL generate extra combo points on critical hits.

#### Scenario: Non-critical shadowStrike
- **WHEN** rogue uses `shadowStrike` and the hit is not critical
- **THEN** combo point gain is `+1`

#### Scenario: Critical shadowStrike
- **WHEN** rogue uses `shadowStrike` and the hit is critical
- **THEN** combo point gain is `+2`

### Requirement: Energy system supports attack critical bonus generation
The energy resource system SHALL support additional energy gain when normal attack crits.

#### Scenario: Attack critical triggers extra energy
- **WHEN** a unit with energy resource lands a critical normal attack
- **THEN** resource generation includes `onAttackCrit`
- **AND** configured rogue value is `+5`

### Requirement: Stealth has one-turn lifecycle with explicit break rules
Stealth SHALL be a short-duration state with deterministic expiration and break behavior in both solo and dungeon combat.

#### Scenario: Stealth duration is one turn
- **WHEN** rogue casts `stealth`
- **THEN** stealth duration is `1` turn

#### Scenario: Stealthed targets cannot be selected by enemies
- **WHEN** enemy AI resolves target selection
- **THEN** stealthed units are excluded from valid target candidates

#### Scenario: Taking damage breaks stealth
- **WHEN** a stealthed unit receives damage
- **THEN** stealth state is removed immediately

#### Scenario: Stealth expiration cleans up linked slow buff
- **WHEN** stealth expires at end-of-turn processing
- **THEN** linked `stealthSpeed` buff is cleaned up to avoid stale state
