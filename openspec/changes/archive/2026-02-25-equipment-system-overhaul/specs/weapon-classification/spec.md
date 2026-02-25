## ADDED Requirements

### Requirement: Weapon type enumeration
The system SHALL define the following weapon types: sword, axe, mace, dagger, fist, wand, polearm, staff, bow, crossbow, gun. Additionally shield and offhand are defined as non-weapon off-hand types.

#### Scenario: All weapon types defined
- **WHEN** weapon type constants are inspected
- **THEN** they include: sword, axe, mace, dagger, fist, wand, polearm, staff, bow, crossbow, gun, shield, offhand

### Requirement: Weapon hand classification
Each weapon SHALL have a `weaponHand` field indicating `one_hand` or `two_hand`.

#### Scenario: Dual-variant weapon types
- **WHEN** a sword, axe, or mace weapon is created
- **THEN** its `weaponHand` can be either `one_hand` or `two_hand`

#### Scenario: One-hand only types
- **WHEN** a dagger, fist, or wand weapon is created
- **THEN** its `weaponHand` MUST be `one_hand`

#### Scenario: Two-hand only types
- **WHEN** a polearm, staff, bow, crossbow, or gun weapon is created
- **THEN** its `weaponHand` MUST be `two_hand`

#### Scenario: Shield has no weaponHand
- **WHEN** a shield item is inspected
- **THEN** it has no `weaponHand` field (category is `shield`)

#### Scenario: Offhand item has no weaponHand
- **WHEN** an offhand item (book, crystal orb, etc.) is inspected
- **THEN** it has no `weaponHand` field (category is `offhand`)

### Requirement: Equipment category field
Every equipment item SHALL have a `category` field with value: `armor`, `weapon`, `shield`, `offhand`, or `accessory`.

#### Scenario: Armor equipment
- **WHEN** an item with slot head/shoulders/chest/legs/hands/wrists/waist/feet/back is inspected
- **THEN** its category is `armor`

#### Scenario: Weapon equipment
- **WHEN** an item with weaponType sword/axe/mace/dagger/fist/wand/polearm/staff/bow/crossbow/gun is inspected
- **THEN** its category is `weapon`

#### Scenario: Shield equipment
- **WHEN** an item with weaponType shield is inspected
- **THEN** its category is `shield`

#### Scenario: Offhand item
- **WHEN** a non-weapon non-shield item in offHand slot is inspected
- **THEN** its category is `offhand`

#### Scenario: Accessory equipment
- **WHEN** an item with slot neck/finger1/finger2/trinket1/trinket2 is inspected
- **THEN** its category is `accessory`

### Requirement: Class weapon type restrictions use grouped format
Each class definition SHALL define weapon proficiency as `weaponTypes: { oneHand: [...], twoHand: [...] }` instead of a flat array.

#### Scenario: Warrior weapon types
- **WHEN** warrior class weaponTypes is inspected
- **THEN** oneHand contains [sword, axe, mace, dagger, fist] and twoHand contains [sword, axe, mace, polearm, bow, crossbow, gun]

#### Scenario: Rogue weapon types (no two-hand)
- **WHEN** rogue class weaponTypes is inspected
- **THEN** oneHand contains [sword, mace, dagger, fist] and twoHand is empty []

#### Scenario: Priest weapon types
- **WHEN** priest class weaponTypes is inspected
- **THEN** oneHand contains [mace, dagger, wand] and twoHand contains [staff]

#### Scenario: Paladin weapon types
- **WHEN** paladin class weaponTypes is inspected
- **THEN** oneHand contains [sword, axe, mace] and twoHand contains [sword, axe, mace, polearm]

#### Scenario: Hunter weapon types
- **WHEN** hunter class weaponTypes is inspected
- **THEN** oneHand contains [sword, axe, dagger, fist] and twoHand contains [sword, axe, polearm, staff, bow, crossbow, gun]

#### Scenario: Shaman weapon types
- **WHEN** shaman class weaponTypes is inspected
- **THEN** oneHand contains [axe, mace, dagger, fist] and twoHand contains [axe, mace, staff]

#### Scenario: Mage weapon types
- **WHEN** mage class weaponTypes is inspected
- **THEN** oneHand contains [sword, dagger, wand] and twoHand contains [staff]

#### Scenario: Warlock weapon types
- **WHEN** warlock class weaponTypes is inspected
- **THEN** oneHand contains [sword, dagger, wand] and twoHand contains [staff]

#### Scenario: Druid weapon types
- **WHEN** druid class weaponTypes is inspected
- **THEN** oneHand contains [mace, dagger, fist] and twoHand contains [mace, staff]

### Requirement: Weapon type validation uses grouped check
The equipment system SHALL validate weapon equip eligibility by checking the weapon's `weaponHand` against the corresponding oneHand or twoHand array in the class definition.

#### Scenario: One-hand weapon validation
- **WHEN** a character attempts to equip a weapon with `weaponHand: 'one_hand'`
- **THEN** the system checks if `weapon.weaponType` is in `class.weaponTypes.oneHand`

#### Scenario: Two-hand weapon validation
- **WHEN** a character attempts to equip a weapon with `weaponHand: 'two_hand'`
- **THEN** the system checks if `weapon.weaponType` is in `class.weaponTypes.twoHand`

#### Scenario: Rogue cannot equip two-hand sword
- **WHEN** a rogue attempts to equip a two-hand sword
- **THEN** the system rejects it because rogue's twoHand array is empty

### Requirement: Wand is mainHand only
Wand weapons SHALL only be equippable in the mainHand slot, not offHand.

#### Scenario: Wand in mainHand
- **WHEN** a mage equips a wand
- **THEN** it is placed in mainHand slot

#### Scenario: Wand cannot go in offHand
- **WHEN** a character attempts to equip a wand in offHand
- **THEN** the system rejects it

### Requirement: Class off-hand restrictions
Classes SHALL have restrictions on what can go in the offHand slot.

#### Scenario: Shield users
- **WHEN** a warrior, paladin, or shaman attempts to equip a shield
- **THEN** it is allowed in offHand

#### Scenario: Offhand item users
- **WHEN** a priest, mage, warlock, or druid attempts to equip an offhand item (book, orb)
- **THEN** it is allowed in offHand

#### Scenario: Classes that can dual-wield equip weapons in offHand
- **WHEN** a warrior, rogue, or hunter (or shaman with talent) attempts to equip a one-hand weapon in offHand
- **THEN** it is allowed

#### Scenario: Non-dual-wield class cannot put weapon in offHand
- **WHEN** a paladin attempts to equip a one-hand sword in offHand
- **THEN** the system rejects it (paladin cannot dual-wield, only shield allowed in offHand)
