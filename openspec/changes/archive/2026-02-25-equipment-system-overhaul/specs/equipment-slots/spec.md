## ADDED Requirements

### Requirement: 16 equipment slots definition
The system SHALL define exactly 16 equipment slots with unique IDs, display names, icons, categories, and slot weights.

#### Scenario: All 16 slots are defined
- **WHEN** `EQUIPMENT_SLOTS` is inspected
- **THEN** it contains entries for: head, shoulders, chest, legs, hands, wrists, waist, feet, back, neck, finger1, finger2, trinket1, trinket2, mainHand, offHand

#### Scenario: Each slot has required properties
- **WHEN** any slot entry is inspected
- **THEN** it contains `id`, `label`, `icon`, `category`, and `slotWeight` properties

### Requirement: Slot categories
Each equipment slot SHALL belong to one of the following categories: `armor`, `accessory`, `weapon`.

#### Scenario: Armor category slots
- **WHEN** slots head, shoulders, chest, legs, hands, wrists, waist, feet, back are inspected
- **THEN** their category is `armor`

#### Scenario: Accessory category slots
- **WHEN** slots neck, finger1, finger2, trinket1, trinket2 are inspected
- **THEN** their category is `accessory`

#### Scenario: Weapon category slots
- **WHEN** slots mainHand, offHand are inspected
- **THEN** their category is `weapon`

### Requirement: Slot weights for stat budget
Each slot SHALL have a slotWeight that determines stat budget allocation.

#### Scenario: Large slots weight
- **WHEN** chest or legs slot is inspected
- **THEN** slotWeight is 1.0

#### Scenario: Medium slots weight
- **WHEN** head, shoulders, hands, or feet slot is inspected
- **THEN** slotWeight is 0.75

#### Scenario: Small slots weight
- **WHEN** wrists, waist, back, neck, finger1, finger2, trinket1, or trinket2 slot is inspected
- **THEN** slotWeight is 0.56

#### Scenario: Weapon slots weight
- **WHEN** mainHand slot is inspected
- **THEN** slotWeight is 0.75 (for single-hand weapons the stat budget uses this; two-hand weapons use 1.0)

#### Scenario: OffHand slot weight
- **WHEN** offHand slot is inspected
- **THEN** slotWeight is 0.56

### Requirement: Durability per slot type
Equipment slots SHALL have durability based on their category and type.

#### Scenario: Armor slots have durability
- **WHEN** equipment in head, shoulders, chest, legs, hands, wrists, waist, feet, or back slot is inspected
- **THEN** it has a `durability: { current, max }` field

#### Scenario: Accessory slots except trinkets have no durability
- **WHEN** equipment in neck, finger1, or finger2 slot is inspected
- **THEN** it has no `durability` field

#### Scenario: Trinkets have no durability
- **WHEN** equipment in trinket1 or trinket2 slot is inspected
- **THEN** it has no `durability` field

#### Scenario: Weapon slots have durability
- **WHEN** equipment in mainHand or offHand slot is a weapon or shield
- **THEN** it has a `durability: { current, max }` field

#### Scenario: Offhand items have no durability
- **WHEN** equipment in offHand slot has category `offhand` (副手物品)
- **THEN** it has no `durability` field

### Requirement: Ranged slot removed
The system SHALL NOT define a `ranged` slot. Bows, crossbows, and guns are two-hand weapons occupying mainHand + offHand.

#### Scenario: No ranged slot exists
- **WHEN** `EQUIPMENT_SLOTS` is inspected
- **THEN** it does not contain a `ranged` entry
