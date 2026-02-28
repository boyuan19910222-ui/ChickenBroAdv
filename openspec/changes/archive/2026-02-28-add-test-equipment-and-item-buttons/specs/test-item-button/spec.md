## ADDED Requirements

### Requirement: Test item button generates random item
The test item button SHALL generate a random consumable/material item and add it to player's inventory.

#### Scenario: Button generates item
- **WHEN** user clicks "获取物品" button
- **THEN** a random consumable or material item SHALL be generated
- **AND** the item SHALL be added to player's inventory

#### Scenario: Button shows result in log
- **WHEN** item is successfully added to inventory
- **THEN** system SHALL log a message showing the obtained item name
