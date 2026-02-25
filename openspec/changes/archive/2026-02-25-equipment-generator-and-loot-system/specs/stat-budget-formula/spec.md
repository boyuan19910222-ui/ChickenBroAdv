## MODIFIED Requirements

### Requirement: Quality multiplier values
The system SHALL use the following quality multipliers: poor=0.8, common=1.0, uncommon=1.15, rare=1.35, epic=1.6, legendary=2.0. Quality `poor` is newly added with multiplier 0.8.

#### Scenario: Poor quality multiplier
- **WHEN** a poor quality item's stat budget is calculated
- **THEN** qualityMultiplier 0.8 is used (but stats are empty per equipment-generator spec)

#### Scenario: Common quality multiplier
- **WHEN** a common quality item's stat budget is calculated
- **THEN** qualityMultiplier 1.0 is used

#### Scenario: Legendary quality multiplier
- **WHEN** a legendary quality item's stat budget is calculated
- **THEN** qualityMultiplier 2.0 is used

## ADDED Requirements

### Requirement: QualityConfig includes poor tier
`QualityConfig` SHALL include a `poor` entry with name '粗糙', color '#9d9d9d', statScale 0.8. The existing `common` entry SHALL have its color changed to '#ffffff' (white) and name to '普通'.

#### Scenario: QualityConfig poor entry
- **WHEN** accessing QualityConfig.poor
- **THEN** it returns { name: '粗糙', color: '#9d9d9d', statScale: 0.8 }

#### Scenario: QualityConfig common is white
- **WHEN** accessing QualityConfig.common
- **THEN** color is '#ffffff' (not '#9d9d9d')

### Requirement: Quality ordering for comparisons
The system SHALL define a quality order array: `['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary']` for use in quality cap comparisons and upgrades.

#### Scenario: Poor is lower than common
- **WHEN** comparing poor and common quality
- **THEN** poor has a lower index (0) than common (1)

#### Scenario: Quality cap comparison
- **WHEN** a quality cap of 'rare' is applied and rolled quality is 'epic'
- **THEN** the system can determine epic > rare by index comparison and clamp to rare
