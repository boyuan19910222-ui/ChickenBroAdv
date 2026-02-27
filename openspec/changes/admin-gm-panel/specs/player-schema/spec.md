## ADDED Requirements

### Requirement: PlayerSchema 支持 isAdmin 状态查询
PlayerSchema SHALL 支持通过用户ID查询该用户是否为管理员，关联 `user_roles` 表的 `is_admin` 字段。

#### Scenario: 查询管理员用户状态
- **WHEN** 调用 `isAdminUser(userId)` 查询管理员用户
- **THEN** 返回 true

#### Scenario: 查询普通用户状态
- **WHEN** 调用 `isAdminUser(userId)` 查询普通用户
- **THEN** 返回 false

## MODIFIED Requirements

### Requirement: PlayerSchema provides createDefaultPlayer factory
PlayerSchema SHALL export a `createDefaultPlayer(name, classId)` function that returns a complete player object with all fields populated according to class configuration from GameData.

#### Scenario: Create a warrior
- **WHEN** `createDefaultPlayer('TestChar', 'warrior')` is called
- **THEN** the returned object contains all PLAYER_FIELDS keys, with class-specific values (warrior baseStats, rage resource, warrior skills, warrior emoji/className)

#### Scenario: Create a rogue with combo points
- **WHEN** `createDefaultPlayer('Rogue', 'rogue')` is called
- **THEN** the returned object includes `comboPoints: { current: 0, max: 5 }` and `resource.type` is `'energy'`

#### Scenario: Create a rogue with valid starter skills
- **WHEN** a rogue character is created through the current character creation flow
- **THEN** starter skills include `shadowStrike`
- **AND** starter mapping does not depend on `sinisterStrike`

#### Scenario: Create a mage with mana
- **WHEN** `createDefaultPlayer('Mage', 'mage')` is called
- **THEN** the returned object includes `resource.type` as `'mana'` and mana-based resource values

#### Scenario: Invalid class throws error
- **WHEN** `createDefaultPlayer('Test', 'invalidClass')` is called
- **THEN** an error is thrown with message indicating unknown class
