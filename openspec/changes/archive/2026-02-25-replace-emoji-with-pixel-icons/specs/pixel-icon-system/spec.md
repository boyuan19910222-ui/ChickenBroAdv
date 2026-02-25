## ADDED Requirements

### Requirement: Icon directory structure follows category convention
The project SHALL maintain a `public/icons/` directory with subdirectories organized by icon category. Class icons SHALL be stored in `public/icons/classes/` with filenames matching the classId in lowercase (e.g., `warrior.png`).

#### Scenario: Class icon files exist for all 9 classes
- **WHEN** the `public/icons/classes/` directory is listed
- **THEN** it contains exactly: `warrior.png`, `paladin.png`, `hunter.png`, `rogue.png`, `priest.png`, `shaman.png`, `mage.png`, `warlock.png`, `druid.png`

#### Scenario: Role icon directory is pre-created
- **WHEN** the `public/icons/roles/` directory is listed
- **THEN** the directory exists (may be empty until role icon assets are provided)

### Requirement: GameData classes use icon path instead of emoji
Each class definition in `GameData.classes` SHALL have an `icon` field containing the absolute path string to the class's pixel icon PNG. The `emoji` field SHALL be removed.

#### Scenario: Warrior class has icon path
- **WHEN** `GameData.classes.warrior` is inspected
- **THEN** it has `icon: '/icons/classes/warrior.png'` and no `emoji` field

#### Scenario: All 9 classes have icon paths
- **WHEN** all entries in `GameData.classes` are inspected
- **THEN** each has an `icon` field matching `/icons/classes/${classId}.png` and none have an `emoji` field

### Requirement: PixelIcon component renders pixel-art image
`PixelIcon.vue` SHALL render an `<img>` element with `image-rendering: pixelated` CSS, accepting `src` (required), `size` (default 24), and `fallback` (optional) props.

#### Scenario: Basic icon rendering
- **WHEN** `<PixelIcon src="/icons/classes/warrior.png" :size="32" />` is rendered
- **THEN** an `<img>` element is displayed at 32x32 pixels with `image-rendering: pixelated`

#### Scenario: Default size
- **WHEN** `<PixelIcon src="/icons/classes/mage.png" />` is rendered without size prop
- **THEN** the image renders at 24x24 pixels

#### Scenario: Load failure shows fallback text
- **WHEN** `<PixelIcon src="/icons/missing.png" fallback="?" />` is rendered and the image fails to load
- **THEN** the fallback text "?" is displayed in place of the image, styled as an inline block matching the specified size

#### Scenario: No fallback shows empty placeholder
- **WHEN** `<PixelIcon src="/icons/missing.png" />` is rendered without fallback prop and the image fails to load
- **THEN** an empty placeholder of the specified size is displayed

### Requirement: PixelIcon component is inline-compatible
PixelIcon SHALL render as `display: inline-block` with `vertical-align: middle` so it can be placed inline with text.

#### Scenario: Icon inline with text
- **WHEN** `<span><PixelIcon src="..." :size="16" /> Warrior</span>` is rendered
- **THEN** the icon and text are vertically aligned on the same line

### Requirement: CreateCharacterView renders class icons via PixelIcon
CreateCharacterView SHALL use `<PixelIcon>` to display class icons instead of emoji text in the class selection list and selected class display.

#### Scenario: Class list shows pixel icons
- **WHEN** the character creation screen displays the list of available classes
- **THEN** each class entry shows a PixelIcon with the class's `icon` path instead of an emoji character

### Requirement: CharacterPanel renders class icon via PixelIcon
CharacterPanel SHALL use `<PixelIcon>` to display the player's class icon instead of emoji text.

#### Scenario: Character panel shows pixel class icon
- **WHEN** the character panel is displayed for a warrior character
- **THEN** a PixelIcon with `/icons/classes/warrior.png` is rendered instead of the ⚔️ emoji

### Requirement: SystemPanel uses class icon from player data
SystemPanel SHALL retrieve the class icon from the player's `icon` field (or derive from classId) instead of using a hardcoded `classEmoji` mapping. The hardcoded `classEmoji` computed property SHALL be removed.

#### Scenario: System panel shows correct class icon
- **WHEN** the system panel displays character info for a paladin
- **THEN** a PixelIcon with `/icons/classes/paladin.png` is rendered, not the inconsistent ✝️ emoji

### Requirement: DungeonCombatView renders unit icons via PixelIcon
DungeonCombatView SHALL pass the unit's `icon` field to CombatantCard instead of `emoji`. For enemy units without pixel icons, the existing emoji SHALL be used as PixelIcon fallback.

#### Scenario: Player party member shows pixel class icon in dungeon
- **WHEN** a player's party member (warrior) is displayed in dungeon combat
- **THEN** the CombatantCard shows a PixelIcon with the warrior class icon

#### Scenario: Enemy without pixel icon falls back to emoji
- **WHEN** an enemy unit with `emoji: '🐺'` but no `icon` field is displayed
- **THEN** the CombatantCard shows the 🐺 emoji as fallback text

### Requirement: TurnOrderBar renders unit icons via PixelIcon
TurnOrderBar SHALL display PixelIcon for units that have an `icon` field, falling back to emoji text for units without one.

#### Scenario: Turn order shows mix of pixel icons and emoji
- **WHEN** the turn order bar contains a warrior player (has icon) and a wolf enemy (has emoji only)
- **THEN** the warrior entry shows a PixelIcon, the wolf entry shows emoji text

### Requirement: PartyFormationSystem uses icon instead of emoji
`PartyFormationSystem._getClassEmoji()` SHALL be replaced with `_getClassIcon(classId)` that returns the icon path from GameData. Default party slot configuration SHALL use `roleIcon` field with paths to `/icons/roles/{roleId}.png` instead of hardcoded emoji.

#### Scenario: AI party member gets correct class icon
- **WHEN** PartyFormationSystem creates an AI party member with class warrior
- **THEN** the member's `icon` field is set to `/icons/classes/warrior.png`

#### Scenario: Default party slot has role icon path
- **WHEN** the default party slots configuration is inspected
- **THEN** each slot has a `roleIcon` field (e.g., `/icons/roles/tank.png`) instead of hardcoded emoji

### Requirement: CombatView renders unit icons via PixelIcon
CombatView (wild combat) SHALL use PixelIcon for displaying player and enemy avatars, falling back to emoji for enemies without icon assets.

#### Scenario: Wild combat player shows pixel class icon
- **WHEN** the player character (mage) is displayed in wild combat
- **THEN** the player avatar shows a PixelIcon with `/icons/classes/mage.png`

### Requirement: ExplorationView and AreaSelectionModal preserve emoji for non-class icons
ExplorationView and AreaSelectionModal SHALL continue using emoji for area and monster icons until those pixel assets are provided in future phases. No changes to these components in this phase.

#### Scenario: Area icons remain as emoji
- **WHEN** ExplorationView displays area information
- **THEN** area emoji icons are rendered as text, unchanged from current behavior
