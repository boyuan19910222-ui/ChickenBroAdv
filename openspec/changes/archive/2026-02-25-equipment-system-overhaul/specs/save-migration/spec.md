## ADDED Requirements

### Requirement: Migration from 5-slot to 16-slot equipment
SaveMigration SHALL include a migration that converts old 5-slot equipment `{ weapon, armor, helmet, boots, accessory }` to new 16-slot structure.

#### Scenario: Old 5-slot equipment migration
- **WHEN** a save with equipment `{ weapon: <item>, armor: <item>, helmet: <item>, boots: <item>, accessory: <item> }` is migrated
- **THEN** equipment becomes `{ mainHand: <weapon item>, chest: <armor item>, head: <helmet item>, feet: <boots item>, trinket1: <accessory item>, shoulders: null, legs: null, hands: null, wrists: null, waist: null, back: null, neck: null, finger1: null, finger2: null, trinket2: null, offHand: null }`

#### Scenario: Old 5-slot with null values
- **WHEN** a save with equipment `{ weapon: null, armor: null, helmet: null, boots: null, accessory: null }` is migrated
- **THEN** all 16 slots are null

### Requirement: Migration from 9-slot to 16-slot equipment
SaveMigration SHALL include a migration that converts 9-slot equipment `{ head, shoulders, chest, hands, legs, feet, mainHand, offHand, ranged }` to new 16-slot structure.

#### Scenario: 9-slot equipment migration
- **WHEN** a save with 9-slot equipment including a ranged weapon is migrated
- **THEN** existing slots (head, shoulders, chest, hands, legs, feet, mainHand, offHand) are preserved, ranged item is moved to inventory (if ranged was equipped), and new slots (wrists, waist, back, neck, finger1, finger2, trinket1, trinket2) are set to null

#### Scenario: 9-slot with ranged weapon migration
- **WHEN** a save has `equipment.ranged = <bow item>` and inventory has space
- **THEN** the bow is added to inventory and equipment.ranged is removed; new 16-slot structure is created

#### Scenario: 9-slot with ranged weapon but full inventory
- **WHEN** a save has `equipment.ranged = <bow item>` but inventory is at 40 items
- **THEN** the bow is still moved to inventory (temporarily exceed cap for migration safety) and a log warning is emitted

### Requirement: Migration updates weaponTypes format in class data
SaveMigration SHALL handle any saved character data that references the old flat `weaponTypes` array format.

#### Scenario: Character class data migration
- **WHEN** a save is migrated and the character references class weapon types
- **THEN** the migration does not need to change character data (class definitions are in code, not in save data), but any cached/computed weapon types in the save are cleared for recalculation

### Requirement: Inventory capacity migration
SaveMigration SHALL ensure the inventory capacity is updated to 40 for migrated saves.

#### Scenario: Old save with 20-cap inventory
- **WHEN** a save from before the capacity change is migrated
- **THEN** the inventory array is preserved as-is (no items removed), and the new 40-cap is applied by code logic (cap is not stored in save, it's a code constant)

### Requirement: Migration version increment
SaveMigration SHALL increment CURRENT_VERSION for this migration.

#### Scenario: Version bump
- **WHEN** the new migration is added
- **THEN** CURRENT_VERSION is incremented by 1 from the previous value
