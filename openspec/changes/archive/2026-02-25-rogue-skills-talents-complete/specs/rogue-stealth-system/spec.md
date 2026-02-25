# Rogue Stealth System Specification

## ADDED Requirements

### Requirement: Stealth State Entry
The system SHALL allow rogues to enter stealth state, becoming invisible to enemies.

#### Scenario: Enter stealth out of combat
- **WHEN** rogue is not in combat and uses stealth skill
- **THEN** rogue enters stealth state
- **AND** rogue becomes invisible to enemies
- **AND** movement speed is reduced by 30%

#### Scenario: Stealth breaks on damage
- **WHEN** rogue in stealth takes damage
- **THEN** stealth state is broken immediately
- **AND** rogue becomes visible to all enemies

#### Scenario: Stealth breaks on action
- **WHEN** rogue in stealth performs a non-stealth skill action
- **THEN** stealth state is broken
- **AND** rogue becomes visible

### Requirement: Stealth Attack Bonus
The system SHALL provide attack bonuses when rogues attack from stealth.

#### Scenario: Stealth opener critical bonus
- **WHEN** rogue attacks from stealth state
- **THEN** the attack has +50% critical strike chance
- **AND** attack deals 20% bonus damage

#### Scenario: Stealth opener combo point
- **WHEN** rogue uses combo generator from stealth
- **THEN** the attack generates +1 additional combo point

### Requirement: Stealth-Only Skills
The system SHALL provide skills that can only be used while in stealth.

#### Scenario: Cheap Shot from stealth
- **WHEN** rogue uses cheap shot while in stealth
- **THEN** target is stunned for 4 seconds
- **AND** rogue gains 2 combo points
- **AND** stealth is broken

#### Scenario: Ambush from stealth
- **WHEN** rogue uses ambush while in stealth
- **THEN** target takes 150% weapon damage
- **AND** rogue gains 2 combo points
- **AND** stealth is broken

#### Scenario: Sap from stealth
- **WHEN** rogue uses sap while in stealth on humanoid target
- **THEN** target is incapacitated for 30 seconds
- **AND** damage breaks the effect
- **AND** stealth is NOT broken

### Requirement: Vanish Emergency Stealth
The system SHALL provide vanish skill to re-enter stealth during combat.

#### Scenario: Vanish in combat
- **WHEN** rogue uses vanish skill while in combat
- **THEN** rogue immediately enters stealth state
- **AND** all threat/aggro is cleared
- **AND** next attack has guaranteed critical strike

#### Scenario: Vanish cooldown
- **WHEN** rogue uses vanish
- **THEN** vanish goes on 5 turn cooldown

### Requirement: Stealth Detection
The system SHALL provide stealth detection mechanics for enemies.

#### Scenario: Higher level detection
- **WHEN** enemy is more than 5 levels above the rogue
- **THEN** enemy has increased chance to detect stealthed rogue

#### Scenario: Proximity detection
- **WHEN** stealthed rogue is within 2 tiles of an enemy
- **THEN** enemy has increased chance to detect rogue

#### Scenario: In combat detection
- **WHEN** rogue vanishes while enemies are actively targeting
- **THEN** enemies have reduced chance to immediately re-detect

### Requirement: Stealth Cooldown
The system SHALL manage stealth skill cooldown appropriately.

#### Scenario: Stealth cooldown after break
- **WHEN** stealth is broken by action or damage
- **THEN** stealth goes on 2 turn cooldown before re-use

#### Scenario: Stealth no cooldown on vanish
- **WHEN** stealth is entered via vanish
- **THEN** stealth skill cooldown is bypassed
