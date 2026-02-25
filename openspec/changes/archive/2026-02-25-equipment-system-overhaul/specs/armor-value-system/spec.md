## ADDED Requirements

### Requirement: Armor value calculation formula
Armor equipment SHALL have an `armorValue` field calculated as `floor(baseCoeff × itemLevel × qualityMultiplier)`.

#### Scenario: Plate armor value
- **WHEN** a plate chest armor with itemLevel 30 and quality rare is inspected
- **THEN** armorValue is floor(5.0 × 30 × 1.35) = 202

#### Scenario: Cloth armor value
- **WHEN** a cloth head armor with itemLevel 20 and quality uncommon is inspected
- **THEN** armorValue is floor(1.0 × 20 × 1.15) = 23

#### Scenario: Leather armor value
- **WHEN** a leather legs armor with itemLevel 25 and quality epic is inspected
- **THEN** armorValue is floor(2.0 × 25 × 1.6) = 80

### Requirement: Armor type base coefficients
The system SHALL use the following base coefficients for armor types: cloth=1.0, leather=2.0, mail=3.5, plate=5.0.

#### Scenario: Mail coefficient
- **WHEN** a mail armor with itemLevel 20 and quality common is created
- **THEN** armorValue is floor(3.5 × 20 × 1.0) = 70

### Requirement: Cloak armor uses cloth coefficient
Cloak (back slot) equipment SHALL always use the cloth base coefficient (1.0) regardless of any armorType field.

#### Scenario: Cloak armor value
- **WHEN** a back slot cloak with itemLevel 15 and quality rare is inspected
- **THEN** armorValue is floor(1.0 × 15 × 1.35) = 20

### Requirement: Cloak is universally equippable
Cloaks SHALL NOT have armor type restrictions — any class can equip any cloak.

#### Scenario: Mage equips cloak
- **WHEN** a mage (cloth only) attempts to equip a cloak
- **THEN** the equip succeeds regardless of the cloak's armorType

#### Scenario: Warrior equips same cloak
- **WHEN** a warrior attempts to equip the same cloak
- **THEN** the equip succeeds

### Requirement: Shield armor value uses enhanced plate coefficient
Shields SHALL use a coefficient of 7.5 (plate 5.0 × 1.5) for armor value calculation.

#### Scenario: Shield armor value
- **WHEN** a shield with itemLevel 30 and quality rare is inspected
- **THEN** armorValue is floor(7.5 × 30 × 1.35) = 303

### Requirement: Non-armor items have no armor value
Accessories (neck, finger, trinket), offhand items, and weapons SHALL NOT have an armorValue field.

#### Scenario: Ring has no armor value
- **WHEN** a ring in finger1 slot is inspected
- **THEN** it has no `armorValue` property

#### Scenario: Weapon has no armor value
- **WHEN** a sword weapon is inspected
- **THEN** it has no `armorValue` property

### Requirement: Physical damage reduction formula
The combat system SHALL calculate physical damage reduction using: `reduction% = totalArmor / (totalArmor + K × attackerLevel)` where K = 400.

#### Scenario: Damage reduction at level 10
- **WHEN** a character with totalArmor 200 is attacked by a level 10 enemy
- **THEN** physical damage reduction is 200 / (200 + 400 × 10) = 200/4200 ≈ 4.76%

#### Scenario: Damage reduction at high armor
- **WHEN** a character with totalArmor 2000 is attacked by a level 20 enemy
- **THEN** physical damage reduction is 2000 / (2000 + 400 × 20) = 2000/10000 = 20%

#### Scenario: Zero armor means no reduction
- **WHEN** a character with totalArmor 0 is attacked
- **THEN** physical damage reduction is 0%

### Requirement: Total armor aggregation
The system SHALL sum armorValue from all equipped items (armor slots + shield if equipped) to calculate totalArmor.

#### Scenario: Full armor set total
- **WHEN** a character has armor in head(50), shoulders(50), chest(100), legs(100), hands(50), wrists(30), waist(30), feet(50), back(15), and shield(150)
- **THEN** totalArmor is 625
