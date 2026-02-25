# Rogue Poison System Specification

## ADDED Requirements

### Requirement: Poison Types
The system SHALL provide multiple poison types with different effects.

#### Scenario: Deadly Poison
- **WHEN** rogue applies deadly poison to weapons
- **THEN** attacks have 30% chance to apply deadly poison DOT
- **AND** deadly poison deals nature damage over 12 seconds
- **AND** deadly poison can stack up to 5 times

#### Scenario: Wound Poison
- **WHEN** rogue applies wound poison to weapons
- **THEN** attacks have 50% chance to apply wound poison
- **AND** wound poison reduces healing received by 25%
- **AND** wound poison lasts 8 seconds

#### Scenario: Numbing Poison
- **WHEN** rogue applies numbing poison to weapons
- **THEN** attacks have 20% chance to apply numbing poison
- **AND** numbing poison reduces attack speed by 15%
- **AND** numbing poison reduces casting speed by 30%
- **AND** numbing poison lasts 8 seconds

#### Scenario: Instant Poison
- **WHEN** rogue applies instant poison to weapons
- **THEN** attacks have 20% chance to deal instant nature damage
- **AND** instant poison damage scales with attack power

#### Scenario: Crippling Poison
- **WHEN** rogue applies crippling poison to weapons
- **THEN** attacks have 30% chance to slow target movement by 50%
- **AND** crippling poison lasts 10 seconds

### Requirement: Poison Application
The system SHALL allow rogues to apply poisons to their weapons.

#### Scenario: Apply poison to weapon
- **WHEN** rogue uses poison application skill
- **THEN** selected poison is applied to main hand weapon
- **AND** poison has unlimited duration or until changed

#### Scenario: Dual poison application
- **WHEN** rogue has dual wield specialization
- **THEN** rogue can apply different poisons to main hand and off hand

#### Scenario: Poison application cost
- **WHEN** rogue applies poison
- **THEN** action costs 0 action points
- **AND** can be done out of combat only

### Requirement: Poison Proc Mechanics
The system SHALL provide chance-based poison effect triggering.

#### Scenario: Poison proc on hit
- **WHEN** rogue lands a melee attack with poisoned weapon
- **THEN** poison has its designated proc chance to apply effect

#### Scenario: Poison proc on critical
- **WHEN** rogue lands a critical strike with poisoned weapon
- **THEN** poison proc chance is increased by 50% for that attack

#### Scenario: Poison application stacking
- **WHEN** poison proc applies to target already affected by same poison
- **THEN** DOT poisons refresh and stack duration
- **AND** stack-based poisons increase stack count up to cap

### Requirement: Poison Talents Enhancement
The system SHALL enhance poison effects through talents.

#### Scenario: Vile Poisons talent
- **WHEN** rogue has Vile Poisons talent
- **THEN** all poison damage is increased by talent percentage

#### Scenario: Improved Poisons talent
- **WHEN** rogue has Improved Poisons talent
- **THEN** poison proc chances are increased by talent percentage

#### Scenario: Poison specialization
- **WHEN** rogue invests heavily in Assassination tree
- **THEN** poison effects are further enhanced

### Requirement: Poison Blade Skill
The system SHALL provide a dedicated poison application skill.

#### Scenario: Poison Blade skill
- **WHEN** rogue uses Poison Blade skill
- **THEN** applies poison DOT to target immediately
- **AND** deals initial nature damage
- **AND** uses energy resource

#### Scenario: Poison Blade refresh
- **WHEN** rogue uses Poison Blade on target with existing poison
- **THEN** poison duration is refreshed
- **AND** no additional stacks are added

### Requirement: Poison Resistance
The system SHALL provide poison resistance mechanics for targets.

#### Scenario: Nature resistance reduces poison damage
- **WHEN** target has nature resistance
- **THEN** poison damage is reduced by resistance percentage

#### Scenario: Poison immunity
- **WHEN** target is immune to nature effects
- **THEN** poison cannot be applied

#### Scenario: Poison dispel
- **WHEN** poison effect is dispelled
- **THEN** all stacks of that poison are removed
- **AND** poison damage stops immediately
