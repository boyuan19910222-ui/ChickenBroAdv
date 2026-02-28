## ADDED Requirements

### Requirement: Death overlay visual effect
The system SHALL display a full-screen grayscale overlay when a player dies in combat.

#### Scenario: Player dies in combat
- **WHEN** player HP reaches 0 during combat
- **THEN** system displays a full-screen overlay with CSS grayscale filter effect

#### Scenario: Overlay covers entire game interface
- **WHEN** death overlay is active
- **THEN** overlay SHALL cover the entire viewport with highest z-index priority

### Requirement: Interaction blocking during death state
The system SHALL prevent all user interactions while the death overlay is active.

#### Scenario: UI interaction blocked during death
- **WHEN** death overlay is displayed
- **THEN** all clicks, keyboard inputs, and UI interactions SHALL be blocked

#### Scenario: Mouse events prevention
- **WHEN** user attempts to click any UI element during death state
- **THEN** clicks SHALL be intercepted and prevented from reaching target elements

### Requirement: Death overlay lifecycle management
The system SHALL manage the death overlay display and removal lifecycle through events.

#### Scenario: Overlay activation via event
- **WHEN** system emits 'ghost-run:start' event
- **THEN** death overlay SHALL immediately become visible

#### Scenario: Overlay deactivation via event
- **WHEN** system emits 'ghost-run:end' event
- **THEN** death overlay SHALL immediately be hidden

#### Scenario: Cleanup on overlay removal
- **WHEN** death overlay is hidden
- **THEN** all visual effects and interaction blocks SHALL be removed