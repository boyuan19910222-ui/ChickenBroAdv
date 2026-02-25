### Requirement: useCombatFloats manages floating numbers by unit ID
The `useCombatFloats` composable SHALL provide a `spawnFloatingNumber(unitId, damage, isCrit, isHeal)` function that creates floating number entries indexed by unit ID.

#### Scenario: Spawn damage number
- **WHEN** `spawnFloatingNumber('enemy-1', 25, false, false)` is called
- **THEN** a floating number entry `{ key, text: '-25', isCrit: false, isHeal: false }` is added to the dictionary under key `'enemy-1'`

#### Scenario: Spawn heal number
- **WHEN** `spawnFloatingNumber('player-1', 15, false, true)` is called
- **THEN** a floating number entry `{ key, text: '+15', isCrit: false, isHeal: true }` is added under key `'player-1'`

#### Scenario: Spawn critical damage number
- **WHEN** `spawnFloatingNumber('enemy-1', 50, true, false)` is called
- **THEN** a floating number entry with `isCrit: true` is added under key `'enemy-1'`

### Requirement: useCombatFloats auto-removes entries after animation
The composable SHALL automatically remove floating number entries after the animation duration (800ms for normal, 1200ms for critical).

#### Scenario: Normal number auto-removed
- **WHEN** a non-critical floating number is spawned
- **THEN** it is removed from the dictionary after 800ms

#### Scenario: Critical number auto-removed
- **WHEN** a critical floating number is spawned
- **THEN** it is removed from the dictionary after 1200ms

### Requirement: useCombatFloats provides getter for unit's numbers
The composable SHALL provide a `getFloatingNumbers(unitId)` function returning the current array of floating numbers for a specific unit.

#### Scenario: Get floating numbers for unit
- **WHEN** `getFloatingNumbers('enemy-1')` is called and two numbers exist for that unit
- **THEN** an array of 2 floating number entries is returned

#### Scenario: Get floating numbers for unit with none
- **WHEN** `getFloatingNumbers('player-2')` is called and no numbers exist
- **THEN** an empty array is returned

### Requirement: useCombatFloats manages shake state
The composable SHALL provide `triggerShake(unitId, isCrit)` and `isShaking(unitId)` functions to manage hit shake animation state per unit.

#### Scenario: Trigger normal shake
- **WHEN** `triggerShake('enemy-1', false)` is called
- **THEN** `isShaking('enemy-1')` returns `'hit'` for 300ms, then returns `false`

#### Scenario: Trigger critical shake
- **WHEN** `triggerShake('enemy-1', true)` is called
- **THEN** `isShaking('enemy-1')` returns `'crit'` for 600ms, then returns `false`

### Requirement: useCombatFloats provides cleanup
The composable SHALL provide a `cleanup()` function that clears all floating numbers and shake states, suitable for calling on component unmount.

#### Scenario: Cleanup removes all state
- **WHEN** `cleanup()` is called
- **THEN** all floating numbers and shake states are cleared

### Requirement: CSS animations are defined consistently
The composable or associated styles SHALL define the following CSS keyframe animations: `damageFloat` (0.8s), `critDamageFloat` (1.2s), `healFloat` (0.8s), `hitShake` (0.3s), `critHitShake` (0.6s).

#### Scenario: All animation keyframes available
- **WHEN** a component uses `useCombatFloats`
- **THEN** all five CSS keyframe animations are available for floating number and shake rendering
