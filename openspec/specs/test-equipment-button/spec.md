# test-equipment-button Specification

## Purpose
测试获取装备功能 - 方便开发调试时快速获取装备

## Requirements
### Requirement: Test equipment button generates random equipment
The test equipment button SHALL generate a random equipment item and add it to player's inventory.

#### Scenario: Button generates equipment
- **WHEN** user clicks "获取装备" button
- **AND** player inventory has space (< 40 items)
- **THEN** a random equipment item SHALL be generated
- **AND** the item SHALL be added to player's inventory
- **AND** system SHALL log the obtained equipment name

#### Scenario: Button shows warning when inventory full
- **WHEN** user clicks "获取装备" button
- **AND** player inventory is full (>= 40 items)
- **THEN** system SHALL log "背包已满" warning message
