## ADDED Requirements

### Requirement: Weapon damage range field
Every weapon (category `weapon`) SHALL have a `damage: { min, max }` field representing the damage range per attack.

#### Scenario: Weapon has damage range
- **WHEN** a sword weapon is inspected
- **THEN** it contains `damage: { min: <number>, max: <number> }` where min < max

#### Scenario: Shield has no damage
- **WHEN** a shield item is inspected
- **THEN** it has no `damage` field

#### Scenario: Offhand item has no damage
- **WHEN** an offhand item (book/orb) is inspected
- **THEN** it has no `damage` field

### Requirement: Weapon damage calculation formula
Weapon damage range SHALL be calculated as: `baseDPS = itemLevel × qualityMultiplier × weaponWeight`, `min = floor(baseDPS × 0.75)`, `max = floor(baseDPS × 1.25)`.

#### Scenario: Two-hand weapon damage
- **WHEN** a two-hand sword with itemLevel 30 and quality rare is created
- **THEN** baseDPS = 30 × 1.35 × 1.0 = 40.5, min = floor(30.375) = 30, max = floor(50.625) = 50

#### Scenario: One-hand weapon damage
- **WHEN** a one-hand axe with itemLevel 30 and quality rare is created
- **THEN** baseDPS = 30 × 1.35 × 0.65 = 26.325, min = floor(19.74) = 19, max = floor(32.91) = 32

#### Scenario: Legendary weapon damage
- **WHEN** a legendary two-hand sword with itemLevel 40 is created
- **THEN** baseDPS = 40 × 2.0 × 1.0 = 80, min = floor(60) = 60, max = floor(100) = 100

### Requirement: Weapon weight coefficients
The system SHALL use weaponWeight 1.0 for two-hand weapons and 0.65 for one-hand weapons.

#### Scenario: Two-hand weapon weight
- **WHEN** a weapon with `weaponHand: 'two_hand'` damage is calculated
- **THEN** weaponWeight 1.0 is used

#### Scenario: One-hand weapon weight
- **WHEN** a weapon with `weaponHand: 'one_hand'` damage is calculated
- **THEN** weaponWeight 0.65 is used

### Requirement: Attack damage uses random roll in range
When a character attacks with a weapon, the base weapon damage SHALL be a random integer between damage.min and damage.max (inclusive).

#### Scenario: Random damage roll
- **WHEN** a character attacks with a weapon having damage { min: 15, max: 28 }
- **THEN** the rolled weapon damage is a random integer in [15, 28]

### Requirement: Attack damage includes stat bonus
The final attack damage SHALL combine the weapon's random roll with the character's attribute bonus.

#### Scenario: Physical attack with weapon
- **WHEN** a character with strength-based bonus of 12 attacks with a weapon that rolls 20
- **THEN** base damage before reduction is 20 + 12 = 32
