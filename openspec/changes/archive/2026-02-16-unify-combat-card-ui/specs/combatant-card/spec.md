## ADDED Requirements

### Requirement: CombatantCard renders unit identity
CombatantCard SHALL display the unit's emoji avatar and name. Avatar size and name font size SHALL adapt based on the `size` prop (`normal` for wild combat, `compact` for dungeon combat).

#### Scenario: Normal size card renders large avatar
- **WHEN** CombatantCard is rendered with `size="normal"`
- **THEN** avatar emoji displays at 42px, name displays at 8px font size

#### Scenario: Compact size card renders small avatar
- **WHEN** CombatantCard is rendered with `size="compact"`
- **THEN** avatar emoji displays at 22px inside a circular container, name displays at 6px font size

### Requirement: CombatantCard renders HP bar via ResourceBar
CombatantCard SHALL render the unit's HP using the `ResourceBar` component, passing `current`, `max`, and `type="hp"`.

#### Scenario: HP bar reflects current health
- **WHEN** a unit has currentHp=50 and maxHp=100
- **THEN** the HP bar fills to 50%

### Requirement: CombatantCard renders resource bar when present
CombatantCard SHALL render a secondary ResourceBar when the unit has a `resource` object with `type`, `current`, and `max` fields.

#### Scenario: Mana bar displayed for caster
- **WHEN** unit has `resource: { type: 'mana', current: 30, max: 50 }`
- **THEN** a mana-styled resource bar is displayed below the HP bar

#### Scenario: No resource bar for units without resource
- **WHEN** unit has no `resource` field or `resource` is null
- **THEN** no secondary resource bar is rendered

### Requirement: CombatantCard renders combo points when present
CombatantCard SHALL render combo point indicators when the unit has `comboPoints` data.

#### Scenario: Combo points displayed for rogue
- **WHEN** unit has `comboPoints: { current: 3, max: 5 }`
- **THEN** 5 combo point indicators are shown, 3 filled and 2 empty

#### Scenario: Combo points hidden when absent
- **WHEN** unit has no `comboPoints` field
- **THEN** no combo point UI is rendered

### Requirement: CombatantCard integrates EffectIcons
CombatantCard SHALL render EffectIcons for buffs above the card and debuffs below the card, using the existing `EffectIcons.vue` component.

#### Scenario: Buffs and debuffs displayed
- **WHEN** unit has active buffs and debuffs
- **THEN** buff icons appear above the card, debuff icons appear below the card

### Requirement: CombatantCard supports side styling
CombatantCard SHALL accept a `side` prop (`player` or `enemy`) and apply corresponding color scheme (name color, background tint).

#### Scenario: Player side styling
- **WHEN** `side="player"`
- **THEN** card uses player color scheme (green tint in dungeon, gold name in wild)

#### Scenario: Enemy side styling
- **WHEN** `side="enemy"`
- **THEN** card uses enemy color scheme (red tint, red name)

### Requirement: CombatantCard supports interaction states
CombatantCard SHALL accept optional props for interaction states: `selectable`, `selected`, `dead`, `highlightClass`. These control CSS classes on the card container.

#### Scenario: Dead unit is grayed out
- **WHEN** `dead` prop is true
- **THEN** card renders with reduced opacity and grayscale filter

#### Scenario: Selected unit is highlighted
- **WHEN** `selected` prop is true
- **THEN** card renders with gold glow border and slight scale-up

#### Scenario: Non-interactive card ignores interaction props
- **WHEN** `selectable` is false or absent (wild combat)
- **THEN** card has no hover effects or click handlers

### Requirement: CombatantCard provides floating numbers slot
CombatantCard SHALL include a positioned container for floating damage/heal numbers, rendered via a named slot or direct integration with `useCombatFloats`.

#### Scenario: Floating numbers appear on card
- **WHEN** damage is dealt to the unit
- **THEN** a floating number animates upward from the card area

### Requirement: CombatantCard supports hit shake animation
CombatantCard SHALL accept a `shaking` prop that triggers a shake CSS animation on the card.

#### Scenario: Normal hit shake
- **WHEN** `shaking` is set to `'hit'`
- **THEN** card plays the hitShake animation (0.3s)

#### Scenario: Critical hit shake
- **WHEN** `shaking` is set to `'crit'`
- **THEN** card plays the critHitShake animation (0.6s with scale)

### Requirement: CombatantCard supports boss variant
CombatantCard SHALL accept an `isBoss` prop that renders the card at double width with enhanced visual styling.

#### Scenario: Boss card renders larger
- **WHEN** `isBoss` is true and `size="compact"`
- **THEN** card renders at approximately double the normal compact width with larger emoji and red glow effect
