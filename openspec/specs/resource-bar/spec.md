### Requirement: ResourceBar renders a filled progress bar
ResourceBar SHALL render a horizontal bar showing the ratio of `current` to `max` as a filled percentage.

#### Scenario: Half-filled bar
- **WHEN** `current=50` and `max=100`
- **THEN** bar fill is at 50% width

#### Scenario: Empty bar
- **WHEN** `current=0` and `max=100`
- **THEN** bar fill is at 0% width

#### Scenario: Full bar
- **WHEN** `current=100` and `max=100`
- **THEN** bar fill is at 100% width

### Requirement: ResourceBar applies type-specific colors
ResourceBar SHALL apply different color gradients based on the `type` prop: `hp`, `mana`, `energy`, `rage`.

#### Scenario: HP bar colors
- **WHEN** `type="hp"`
- **THEN** bar uses red gradient fill

#### Scenario: Mana bar colors
- **WHEN** `type="mana"`
- **THEN** bar uses blue gradient fill

#### Scenario: Energy bar colors
- **WHEN** `type="energy"`
- **THEN** bar uses yellow gradient fill

#### Scenario: Rage bar colors
- **WHEN** `type="rage"`
- **THEN** bar uses dark red gradient fill

### Requirement: ResourceBar supports value display modes
ResourceBar SHALL accept a `showValue` prop controlling how the numeric value is displayed: `'overlay'` (centered on bar), `'below'` (text below bar), or `'none'` (hidden).

#### Scenario: Overlay value display
- **WHEN** `showValue="overlay"` with `current=50, max=100`
- **THEN** text "50/100" appears centered over the bar

#### Scenario: Below value display
- **WHEN** `showValue="below"` with `current=50, max=100, type="hp"`
- **THEN** text "❤️ 50/100" appears below the bar

#### Scenario: No value display
- **WHEN** `showValue="none"`
- **THEN** no numeric value is displayed

### Requirement: ResourceBar supports size variants
ResourceBar SHALL accept a `size` prop (`normal` or `compact`) controlling bar height and font size.

#### Scenario: Normal size bar
- **WHEN** `size="normal"`
- **THEN** bar renders at standard height (8px for HP, 6px for resources)

#### Scenario: Compact size bar
- **WHEN** `size="compact"`
- **THEN** bar renders at compact height suitable for dungeon combat layout
