## ADDED Requirements

### Requirement: Ghost run text animation
The system SHALL display "跑尸中..." text with animated dots at the center of the death overlay.

#### Scenario: Text display during ghost run
- **WHEN** death overlay is active
- **THEN** system displays "跑尸中" text followed by animated dots in the center of screen

#### Scenario: Dot count animation cycle
- **WHEN** ghost run animation is active
- **THEN** dots SHALL animate from 1 to 5 dots, then back to 1 in continuous cycle

#### Scenario: Dot animation timing
- **WHEN** dot animation is running
- **THEN** dot count SHALL change every 500 milliseconds

### Requirement: Random duration timer
The system SHALL randomly determine ghost run duration between 5-10 seconds.

#### Scenario: Random duration generation
- **WHEN** ghost run starts
- **THEN** system SHALL generate random duration between 5000-10000 milliseconds

#### Scenario: Timer completion triggers end event
- **WHEN** random timer duration expires
- **THEN** system SHALL emit 'ghost-run:end' event

#### Scenario: Timer cleanup on completion
- **WHEN** ghost run timer completes
- **THEN** all animation intervals SHALL be cleared

### Requirement: Animation state management
The system SHALL properly manage animation state during ghost run lifecycle.

#### Scenario: Animation starts with ghost run
- **WHEN** 'ghost-run:start' event is received
- **THEN** dot animation SHALL begin immediately

#### Scenario: Animation stops with ghost run end
- **WHEN** 'ghost-run:end' event is emitted
- **THEN** dot animation SHALL stop immediately

#### Scenario: Protection against multiple timers
- **WHEN** ghost run is already active and new start event received
- **THEN** previous timer and animation SHALL be cancelled before starting new one