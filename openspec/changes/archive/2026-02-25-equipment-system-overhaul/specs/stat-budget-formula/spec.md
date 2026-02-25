## ADDED Requirements

### Requirement: Stat budget formula
Equipment stat points SHALL be calculated using: `totalStatPoints = floor(itemLevel × slotWeight × qualityMultiplier)`.

#### Scenario: Large slot rare item
- **WHEN** a chest armor (slotWeight 1.0) with itemLevel 20 and quality rare is created
- **THEN** totalStatPoints is floor(20 × 1.0 × 1.35) = 27

#### Scenario: Small slot uncommon item
- **WHEN** a waist armor (slotWeight 0.56) with itemLevel 20 and quality uncommon is created
- **THEN** totalStatPoints is floor(20 × 0.56 × 1.15) = 12

#### Scenario: Medium slot epic item
- **WHEN** head armor (slotWeight 0.75) with itemLevel 30 and quality epic is created
- **THEN** totalStatPoints is floor(30 × 0.75 × 1.6) = 36

### Requirement: Quality multiplier values
The system SHALL use the following quality multipliers: common=1.0, uncommon=1.15, rare=1.35, epic=1.6, legendary=2.0.

#### Scenario: Common quality multiplier
- **WHEN** a common quality item's stat budget is calculated
- **THEN** qualityMultiplier 1.0 is used

#### Scenario: Legendary quality multiplier
- **WHEN** a legendary quality item's stat budget is calculated
- **THEN** qualityMultiplier 2.0 is used

### Requirement: Same-tier stat sum consistency
All equipment with the same itemLevel, quality, and slotWeight SHALL have identical totalStatPoints (sum of all stat values).

#### Scenario: Two rare chest armors at itemLevel 25
- **WHEN** two different rare chest armors (both itemLevel 25, slotWeight 1.0) are compared
- **THEN** both have totalStatPoints = floor(25 × 1.0 × 1.35) = 33, even though individual stats may differ (e.g., one has STR+15/STA+18, another has INT+20/SPI+13)

#### Scenario: Different slots at same itemLevel differ in budget
- **WHEN** a rare chest (slotWeight 1.0) and a rare waist (slotWeight 0.56) both at itemLevel 25 are compared
- **THEN** chest has 33 points and waist has floor(25 × 0.56 × 1.35) = 18 points

### Requirement: Two-hand weapon stat budget uses 1.0 weight
Two-hand weapons SHALL use slotWeight 1.0 for stat budget calculation (equivalent to a large armor slot).

#### Scenario: Two-hand weapon stat budget
- **WHEN** a rare two-hand sword with itemLevel 30 is created
- **THEN** totalStatPoints is floor(30 × 1.0 × 1.35) = 40

### Requirement: One-hand weapon stat budget uses 0.75 weight
One-hand weapons SHALL use slotWeight 0.75 for stat budget calculation.

#### Scenario: One-hand weapon stat budget
- **WHEN** a rare one-hand dagger with itemLevel 30 is created
- **THEN** totalStatPoints is floor(30 × 0.75 × 1.35) = 30

### Requirement: Stat distribution validation
The sum of all values in an equipment's `stats` object SHALL equal its calculated totalStatPoints.

#### Scenario: Valid stat distribution
- **WHEN** a rare chest armor (itemLevel 20, totalStatPoints=27) has stats { strength: 12, stamina: 8, critChance: 7 }
- **THEN** 12 + 8 + 7 = 27, validation passes

#### Scenario: Invalid stat distribution detected
- **WHEN** an equipment's stats sum does not equal its calculated totalStatPoints
- **THEN** a validation warning is logged (for development/testing purposes)
