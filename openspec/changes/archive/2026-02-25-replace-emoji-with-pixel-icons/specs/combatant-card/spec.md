## MODIFIED Requirements

### Requirement: CombatantCard renders unit identity
CombatantCard SHALL display the unit's icon as a PixelIcon image (when `icon` field is present) or fall back to emoji text (when only `emoji` field is present). The unit's name SHALL be displayed below the icon. Avatar size and name font size SHALL adapt based on the `size` prop (`normal` for wild combat, `compact` for dungeon combat).

#### Scenario: Normal size card renders pixel icon
- **WHEN** CombatantCard is rendered with `size="normal"` and unit has an `icon` field
- **THEN** a PixelIcon displays at 42px, name displays at 8px font size

#### Scenario: Compact size card renders pixel icon
- **WHEN** CombatantCard is rendered with `size="compact"` and unit has an `icon` field
- **THEN** a PixelIcon displays at 22px inside a circular container, name displays at 6px font size

#### Scenario: Unit without icon falls back to emoji text
- **WHEN** CombatantCard is rendered with a unit that has `emoji: '🐺'` but no `icon` field
- **THEN** the emoji text '🐺' is displayed at the appropriate size for the current size mode

### Requirement: CombatantCard supports boss variant
CombatantCard SHALL accept an `isBoss` prop that renders the card at double width with enhanced visual styling.

#### Scenario: Boss card renders larger
- **WHEN** `isBoss` is true and `size="compact"`
- **THEN** card renders at approximately double the normal compact width with larger PixelIcon (or emoji fallback) and red glow effect
