## MODIFIED Requirements

### Requirement: SaveManager integrates migration on load
SaveManager.load() SHALL call `migrate()` on the parsed save data before returning it. The migrated version number SHALL be persisted back to localStorage.

#### Scenario: Load triggers migration
- **WHEN** `SaveManager.load(slot)` reads a v1 save from localStorage
- **THEN** `migrate()` is called, the migrated data is written back to localStorage with the new version, and the migrated data is returned

#### Scenario: Load of current version skips migration
- **WHEN** `SaveManager.load(slot)` reads a save already at CURRENT_VERSION
- **THEN** data is returned directly without modification or re-save

## ADDED Requirements

### Requirement: Auto-save interval is 5 minutes
GameEngine SHALL start auto-save with an interval of 300,000 milliseconds (5 minutes).

#### Scenario: Auto-save triggers every 5 minutes
- **WHEN** `GameEngine.start()` calls `saveManager.startAutoSave()`
- **THEN** the interval parameter is `300000`

### Requirement: GameEngine registers beforeunload emergency save
GameEngine.start() SHALL register a `window.beforeunload` event listener that performs an emergency save of the current state to the active slot. GameEngine.stop() SHALL remove this listener.

#### Scenario: Browser tab closed during gameplay
- **WHEN** the user closes the browser tab while the game is running
- **THEN** the `beforeunload` handler calls `saveManager.save()` with the current state snapshot and active slot number

#### Scenario: Engine stopped removes listener
- **WHEN** `GameEngine.stop()` is called
- **THEN** the `beforeunload` event listener is removed and no emergency save is attempted on future unload events

#### Scenario: No active slot skips emergency save
- **WHEN** the `beforeunload` event fires but `currentSlot` is null or undefined
- **THEN** no save is attempted to avoid corrupting data
