## ADDED Requirements

### Requirement: Innate dual-wield ability
Warrior, rogue, and hunter classes SHALL have innate dual-wield ability without requiring any talent.

#### Scenario: Warrior can dual-wield
- **WHEN** a warrior character's dual-wield capability is checked
- **THEN** `canDualWield` returns true

#### Scenario: Rogue can dual-wield
- **WHEN** a rogue character's dual-wield capability is checked
- **THEN** `canDualWield` returns true

#### Scenario: Hunter can dual-wield
- **WHEN** a hunter character's dual-wield capability is checked
- **THEN** `canDualWield` returns true

### Requirement: Shaman dual-wield via talent
Shaman SHALL require the "双武器战斗" (Dual Wield) talent in the enhancement tree to dual-wield.

#### Scenario: Shaman without talent cannot dual-wield
- **WHEN** a shaman without the dualWield talent attempts to equip a weapon in offHand
- **THEN** the system rejects it

#### Scenario: Shaman with talent can dual-wield
- **WHEN** a shaman who has learned the dualWield talent attempts to equip a one-hand weapon in offHand
- **THEN** it is allowed

#### Scenario: Dual Wield talent definition
- **WHEN** shaman enhancement talent tree is inspected
- **THEN** it contains a talent with id `dualWield`, name `双武器战斗`, tier 3, maxPoints 1, effect type `unlock_ability` with ability `dual_wield`, requiring `thunderingStrikes`

### Requirement: Non-dual-wield classes
Paladin, priest, mage, warlock, and druid classes SHALL NOT be able to dual-wield weapons.

#### Scenario: Paladin cannot dual-wield
- **WHEN** a paladin attempts to equip a weapon in offHand
- **THEN** the system rejects it (shield is allowed, but not a second weapon)

#### Scenario: Mage cannot dual-wield
- **WHEN** a mage attempts to equip a dagger in offHand while holding a wand in mainHand
- **THEN** the system rejects it (offhand item is allowed, but not a weapon)

### Requirement: Off-hand weapon 50% damage penalty
When a character has a weapon equipped in the offHand slot, that weapon's damage SHALL be reduced by 50%.

#### Scenario: Off-hand damage calculation
- **WHEN** a character attacks with the offHand weapon that rolled damage 20
- **THEN** the actual off-hand damage is floor(20 × 0.5) = 10

#### Scenario: Main-hand weapon has no penalty
- **WHEN** a character attacks with the mainHand weapon that rolled damage 20
- **THEN** the actual main-hand damage is 20 (no penalty)

### Requirement: Two-hand weapon mutual exclusion with off-hand
Equipping a two-hand weapon SHALL automatically unequip any item in the offHand slot, moving it to the inventory.

#### Scenario: Equip two-hand weapon with shield equipped
- **WHEN** a character with a shield in offHand equips a two-hand staff
- **THEN** the shield is moved to inventory, and the staff occupies mainHand while offHand is locked/empty

#### Scenario: Equip two-hand weapon with off-hand weapon equipped
- **WHEN** a dual-wielding rogue with a dagger in offHand equips a two-hand... (rogues can't use two-hand, so: a warrior with a sword in offHand equips a two-hand axe)
- **THEN** the off-hand sword is moved to inventory, and the two-hand axe occupies mainHand while offHand is locked

#### Scenario: Equip off-hand while two-hand weapon equipped
- **WHEN** a character with a two-hand weapon in mainHand equips a shield in offHand
- **THEN** the two-hand weapon is moved to inventory, and the shield is placed in offHand

#### Scenario: Inventory full prevents equip
- **WHEN** a character with a two-hand weapon tries to equip a shield but inventory is full (40 items)
- **THEN** the operation fails with message "背包已满" and no equipment changes are made

### Requirement: Two-hand weapon locks off-hand slot
When a two-hand weapon is equipped in mainHand, the offHand slot SHALL be visually locked and not accept any equipment.

#### Scenario: Off-hand slot locked display
- **WHEN** a character has a two-hand weapon equipped
- **THEN** the offHand slot displays a locked state (e.g., lock icon or grayed out)

#### Scenario: Direct equip to locked off-hand rejected
- **WHEN** a character with a two-hand weapon tries to directly equip something to offHand
- **THEN** the mutual exclusion logic triggers (unequip mainHand first)
