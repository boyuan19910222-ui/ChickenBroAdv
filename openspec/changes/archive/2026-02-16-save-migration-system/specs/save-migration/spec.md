## ADDED Requirements

### Requirement: SaveMigration maintains ordered migration registry
SaveMigration SHALL maintain a `migrations` object where each key is an integer version number and each value is a function `(data) => data` that transforms save data from that version to the next.

#### Scenario: Migration registry structure
- **WHEN** the migrations object is inspected
- **THEN** it contains sequential integer keys starting from 1, each mapping to a migration function

### Requirement: SaveMigration exports CURRENT_VERSION constant
SaveMigration SHALL export a `CURRENT_VERSION` integer constant representing the latest save data version.

#### Scenario: Version matches migration count
- **WHEN** `CURRENT_VERSION` is checked
- **THEN** it equals the highest migration key + 1

### Requirement: SaveMigration provides migrate function
SaveMigration SHALL export a `migrate(saveData)` function that detects the save's version and sequentially applies all migrations needed to reach CURRENT_VERSION.

#### Scenario: Migrate from version 1 to current
- **WHEN** `migrate({ version: 1, data: oldData })` is called and CURRENT_VERSION is 2
- **THEN** `migrations[1](oldData)` is executed and the returned object has `version: 2`

#### Scenario: Already current version
- **WHEN** `migrate({ version: 2, data: currentData })` is called and CURRENT_VERSION is 2
- **THEN** data is returned unchanged, no migration functions are executed

#### Scenario: Missing version treated as version 1
- **WHEN** `migrate({ version: "1.0.0", data: legacyData })` is called (string version from old saves)
- **THEN** the version is treated as 1 and migrations are applied from version 1

#### Scenario: No version field treated as version 1
- **WHEN** `migrate({ data: veryOldData })` is called (no version field)
- **THEN** the version is treated as 1 and migrations are applied from version 1

### Requirement: Migration v1→v2 normalizes legacy player data
The migration from version 1 to version 2 SHALL use `PlayerSchema.ensurePlayerFields()` to fill all missing player fields, normalize equipment structure, unify `exp` field to `experience`, and generate missing `id` and `createdAt`.

#### Scenario: Old save missing multiple fields
- **WHEN** a v1 save with player data missing `id`, `className`, `experienceToNext`, `createdAt`, `statistics`, `talents` is migrated
- **THEN** all missing fields are populated with appropriate defaults

#### Scenario: exp field renamed to experience
- **WHEN** a v1 save has `player.exp = 150` but no `player.experience`
- **THEN** after migration, `player.experience` is 150 and `player.exp` is removed

#### Scenario: Empty equipment object normalized
- **WHEN** a v1 save has `player.equipment = {}`
- **THEN** after migration, `player.equipment` has all five named slots (weapon, armor, helmet, boots, accessory) set to null

### Requirement: SaveManager integrates migration on load
SaveManager.load() SHALL call `migrate()` on the parsed save data before returning it. The migrated version number SHALL be persisted back to localStorage.

#### Scenario: Load triggers migration
- **WHEN** `SaveManager.load(slot)` reads a v1 save from localStorage
- **THEN** `migrate()` is called, the migrated data is written back to localStorage with the new version, and the migrated data is returned

#### Scenario: Load of current version skips migration
- **WHEN** `SaveManager.load(slot)` reads a save already at CURRENT_VERSION
- **THEN** data is returned directly without modification or re-save

### Requirement: SaveManager creates backup before migration
SaveManager SHALL create a backup of the original save data at key `chickenBro_backup_{slot}` before applying any migration, to allow manual recovery if migration fails.

#### Scenario: Backup created before migration
- **WHEN** a v1 save is loaded and migration is needed
- **THEN** the original unparsed JSON string is stored at `chickenBro_backup_{slot}` before migration runs

#### Scenario: Backup not created when no migration needed
- **WHEN** a save at CURRENT_VERSION is loaded
- **THEN** no backup key is written

### Requirement: SaveManager.import triggers migration
SaveManager.import() SHALL parse the imported JSON and run `migrate()` before storing, ensuring imported saves from older versions are automatically upgraded.

#### Scenario: Import old version save
- **WHEN** `import(jsonString, slot)` is called with a v1 save JSON
- **THEN** the data is migrated to CURRENT_VERSION before being stored in localStorage

### Requirement: CharacterSystem.getCharacter removes legacy migration logic
After the migration pipeline is in place, CharacterSystem.getCharacter() SHALL remove the inline lazy-migration if-checks (resource, comboPoints, skills) since these are handled by the migration pipeline.

#### Scenario: getCharacter returns data without modification
- **WHEN** `getCharacter()` is called on a properly migrated save
- **THEN** the player data is returned as-is from stateManager without any field patching

### Requirement: CreateCharacterView uses CharacterSystem.createCharacter
CreateCharacterView SHALL call `CharacterSystem.createCharacter(name, classId)` (which internally uses PlayerSchema) instead of manually constructing playerData.

#### Scenario: Character creation through unified path
- **WHEN** user fills in name and selects a class in CreateCharacterView and clicks "开始冒险"
- **THEN** `CharacterSystem.createCharacter(name, classId)` is called and the returned complete player object is passed to `gameStore.startGame()`

### Requirement: GameEngine.migrateLoadedState is removed
GameEngine.migrateLoadedState() SHALL be removed since migration is now handled in SaveManager.load().

#### Scenario: Load game without manual migration call
- **WHEN** `GameEngine.loadGame(slot)` is called
- **THEN** `stateManager.restore()` receives already-migrated data from SaveManager, and no separate `migrateLoadedState()` call is needed
