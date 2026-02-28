# test-item-button Specification

## Purpose
测试获取物品功能 - 方便开发调试时快速获取消耗品/材料

## Requirements
### Requirement: Test item button generates random item
The test item button SHALL generate a random consumable/material item and add it to player's inventory.

#### Scenario: Button generates item
- **WHEN** user clicks "获取物品" button
- **AND** player inventory has space (< 40 items)
- **AND** a random consumable/material item SHALL be generated
- **AND** the item SHALL be added to player's inventory
- **AND** system SHALL log the obtained item name

#### Scenario: Button shows warning when inventory full
- **WHEN** user clicks "获取物品" button
- **AND** player inventory is full (>= 40 items)
- **THEN** system SHALL log "背包已满" warning message
