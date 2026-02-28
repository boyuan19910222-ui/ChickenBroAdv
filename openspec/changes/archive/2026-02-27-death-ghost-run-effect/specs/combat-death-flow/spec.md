## ADDED Requirements

### Requirement: Ghost run phase insertion in death flow
The system SHALL insert a ghost run phase before applying death penalties when player dies.

#### Scenario: Death triggers ghost run instead of immediate penalty
- **WHEN** player HP reaches 0 in combat
- **THEN** system SHALL emit 'ghost-run:start' event before applying death penalties

#### Scenario: Death penalties applied after ghost run
- **WHEN** 'ghost-run:end' event is emitted
- **THEN** system SHALL continue with original death penalty logic

#### Scenario: Scene transition delayed until ghost run complete
- **WHEN** ghost run phase is active
- **THEN** scene transition to exploration SHALL be delayed until ghost run ends

### Requirement: Death flow state persistence
The system SHALL maintain combat state during ghost run phase to ensure consistent death processing.

#### Scenario: Combat state preserved during ghost run
- **WHEN** ghost run phase is active
- **THEN** enemy, combat log, and player state SHALL remain unchanged

#### Scenario: Death penalties calculated consistently
- **WHEN** ghost run ends and penalties are applied
- **THEN** penalties SHALL be calculated using the same logic as original death flow

#### Scenario: Player resurrection after ghost run
- **WHEN** ghost run completes and penalties are applied
- **THEN** player SHALL be resurrected with 20% HP as in original flow

### Requirement: Event-driven death flow coordination
The system SHALL use events to coordinate between combat system and ghost run components.

#### Scenario: Combat system emits start event on death
- **WHEN** player dies in combat (HP <= 0)
- **THEN** CombatSystem SHALL emit 'ghost-run:start' event

#### Scenario: Combat system resumes on end event
- **WHEN** CombatSystem receives 'ghost-run:end' event
- **THEN** original death processing SHALL resume immediately

#### Scenario: No duplicate death processing
- **WHEN** ghost run is active
- **THEN** combat system SHALL NOT apply death penalties until ghost run completes