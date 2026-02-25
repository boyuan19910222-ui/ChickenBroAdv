## ADDED Requirements

### Requirement: Unique equipment flag
Equipment items MAY have a `unique: true` field indicating only one of that item can be equipped at a time.

#### Scenario: Default is non-unique
- **WHEN** an equipment item has no `unique` field or `unique: false`
- **THEN** it is treated as non-unique

#### Scenario: Unique item flag
- **WHEN** an equipment item has `unique: true`
- **THEN** the system enforces single-equip restriction

### Requirement: Unique item equip restriction
The system SHALL prevent equipping a `unique: true` item if another item with the same `id` is already equipped in any slot.

#### Scenario: Equip unique ring in empty slot
- **WHEN** a character with no rings equipped attempts to equip a unique ring in finger1
- **THEN** the equip succeeds

#### Scenario: Equip same unique ring in second slot
- **WHEN** a character with unique ring "ringOfPower" in finger1 attempts to equip another "ringOfPower" in finger2
- **THEN** the system rejects with message "此装备为唯一装备，无法同时装备两件"

#### Scenario: Equip different unique ring in second slot
- **WHEN** a character with unique ring "ringOfPower" in finger1 attempts to equip unique ring "ringOfWisdom" in finger2
- **THEN** the equip succeeds (different item IDs)

### Requirement: Non-unique items can be duplicated
Non-unique equipment items SHALL be equippable in multiple slots simultaneously.

#### Scenario: Two identical non-unique rings
- **WHEN** a character has non-unique ring "goldBand" in finger1 and attempts to equip another "goldBand" in finger2
- **THEN** the equip succeeds

#### Scenario: Two identical non-unique trinkets
- **WHEN** a character has non-unique trinket "luckCharm" in trinket1 and attempts to equip another "luckCharm" in trinket2
- **THEN** the equip succeeds
