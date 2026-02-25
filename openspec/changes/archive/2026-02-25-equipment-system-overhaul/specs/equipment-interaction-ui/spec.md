## ADDED Requirements

### Requirement: Classic WoW-style equipment panel layout
The equipment panel SHALL display 16 slots in a classic WoW layout: left column for armor (head→shoulders→chest→hands→legs→feet), right column for accessories (neck→back→wrists→waist→finger1→finger2→trinket1→trinket2), center area for character model, bottom for weapons (mainHand + offHand).

#### Scenario: Panel displays all 16 slots
- **WHEN** the equipment panel is opened
- **THEN** all 16 equipment slots are visible with their icons and labels

#### Scenario: Equipped items shown in slots
- **WHEN** a character has items equipped
- **THEN** each occupied slot displays the item's emoji, name, and quality color border

#### Scenario: Empty slots show placeholder
- **WHEN** a slot has no equipment
- **THEN** the slot displays its default icon and label in a dimmed state

### Requirement: Equipment equip interaction
The system SHALL allow players to equip items from inventory by clicking an inventory item and selecting the target slot, or by right-clicking to auto-equip.

#### Scenario: Right-click auto-equip from inventory
- **WHEN** a player right-clicks an equippable item in inventory
- **THEN** the item is equipped in the appropriate slot (auto-detected by item's slot field)

#### Scenario: Auto-equip with occupied slot
- **WHEN** a player right-clicks an equippable item and the target slot already has an item
- **THEN** the equipped item is moved to inventory and the new item is equipped (swap)

#### Scenario: Auto-equip ring/trinket finds empty slot first
- **WHEN** a player right-clicks a ring and finger1 is occupied but finger2 is empty
- **THEN** the ring is equipped in finger2

#### Scenario: Auto-equip ring/trinket both occupied
- **WHEN** a player right-clicks a ring and both finger1 and finger2 are occupied
- **THEN** the ring swaps with finger1 (first slot)

### Requirement: Equipment unequip interaction
The system SHALL allow players to unequip items by clicking an equipped item slot.

#### Scenario: Unequip to inventory
- **WHEN** a player clicks an equipped item slot
- **THEN** the item is moved from the slot to inventory

#### Scenario: Unequip with full inventory
- **WHEN** a player tries to unequip an item but inventory is full (40 items)
- **THEN** the operation fails with message "背包已满"

### Requirement: Equipment tooltip display
Hovering over any equipment item (in slot or inventory) SHALL display a tooltip with item details.

#### Scenario: Armor tooltip
- **WHEN** a player hovers over an armor item
- **THEN** tooltip shows: name (quality color), armor type, required level, item level, armor value, stats, durability, set info (if applicable)

#### Scenario: Weapon tooltip
- **WHEN** a player hovers over a weapon item
- **THEN** tooltip shows: name (quality color), weapon type + hand (e.g., "双手剑"), required level, item level, damage range (min-max), stats, durability

#### Scenario: Accessory tooltip
- **WHEN** a player hovers over an accessory item
- **THEN** tooltip shows: name (quality color), slot type, required level, item level, stats

### Requirement: Equipment comparison tooltip
When hovering over an inventory item, the system SHALL show a comparison with the currently equipped item in the same slot.

#### Scenario: Stat increase shown in green
- **WHEN** an inventory chest armor has +18 strength and the equipped chest has +12 strength
- **THEN** the comparison shows "力量: +18 ▲+6" in green

#### Scenario: Stat decrease shown in red
- **WHEN** an inventory chest armor has +2 critChance and the equipped chest has +7 critChance
- **THEN** the comparison shows "暴击: +2 ▼-5" in red

#### Scenario: New stat shown in green
- **WHEN** an inventory item has a stat that the equipped item does not have
- **THEN** the comparison shows the stat with ▲ in green

#### Scenario: Armor value comparison
- **WHEN** an inventory armor has armorValue 320 and equipped armor has armorValue 203
- **THEN** the comparison shows "护甲: 320 ▲+117" in green

#### Scenario: No comparison for empty slot
- **WHEN** hovering over an inventory item for a slot that has no equipped item
- **THEN** only the item's own tooltip is shown, no comparison

### Requirement: Two-hand weapon lock visual
When a two-hand weapon is equipped, the offHand slot SHALL display a visual lock indicator.

#### Scenario: Locked offHand display
- **WHEN** a two-hand weapon is in mainHand
- **THEN** offHand slot shows a lock icon (🔒) and cannot be interacted with directly

### Requirement: Inventory capacity display
The inventory panel SHALL display current item count and maximum capacity.

#### Scenario: Inventory count display
- **WHEN** player has 15 items in inventory
- **THEN** the panel header shows "背包 (15/40)"

### Requirement: Quality color coding on items
All equipment items in inventory and equipment slots SHALL have their border or background tinted according to quality.

#### Scenario: Quality colors
- **WHEN** items of different qualities are displayed
- **THEN** common items have gray (#9d9d9d) border, uncommon green (#1eff00), rare blue (#0070dd), epic purple (#a335ee), legendary orange (#ff8000)
