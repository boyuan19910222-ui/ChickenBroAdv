## MODIFIED Requirements

### Requirement: PlayerSchema provides createDefaultPlayer factory
PlayerSchema and server-side character creation paths SHALL initialize rogue characters with a consistent, usable starter skill set and rogue resource fields.

#### Scenario: New rogue has combo points and energy resource
- **WHEN** `createDefaultPlayer('Rogue', 'rogue')` is called
- **THEN** the returned object includes `comboPoints: { current: 0, max: 5 }`
- **AND** `resource.type` is `'energy'`

#### Scenario: Rogue starter skills include shadow strike path
- **WHEN** a rogue character is created through the server character API
- **THEN** starter skills include `shadowStrike`
- **AND** do not rely on `sinisterStrike` as rogue starter mapping

### Requirement: PlayerSchema provides field completion utility
PlayerSchema SHALL preserve explicit existing rogue values while filling missing fields with schema defaults.

#### Scenario: Missing rogue fields are backfilled
- **WHEN** `ensurePlayerFields(playerData)` processes a rogue with missing fields such as `comboPoints`, `skills`, or `resource`
- **THEN** missing fields are filled from schema defaults

#### Scenario: Existing explicit values are preserved
- **WHEN** `ensurePlayerFields(playerData)` processes a rogue player with explicit values already present
- **THEN** explicit values are preserved and not overwritten by defaults
