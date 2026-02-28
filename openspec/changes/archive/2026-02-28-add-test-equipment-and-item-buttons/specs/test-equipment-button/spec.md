## ADDED Requirements

### Requirement: Test equipment button generates random equipment
The test equipment button SHALL generate a random equipment item and add it to player's inventory.

#### Scenario: Button generates equipment
- **WHEN** user clicks "获取装备" button
- **THEN** a random equipment item SHALL be generated
- **AND** the item SHALL be added to player's inventory

#### Scenario: Button shows result in log
- **WHEN** equipment is successfully added to inventory
- **THEN** system SHALL log a message showing the obtained equipment name
