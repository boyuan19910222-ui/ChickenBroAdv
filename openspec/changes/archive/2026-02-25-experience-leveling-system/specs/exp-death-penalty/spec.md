## ADDED Requirements

### Requirement: Death penalty deducts 30% current experience
When a player dies (wild combat defeat or dungeon wipe), the system SHALL deduct 30% of the player's current experience progress: `expLost = Math.floor(player.experience * 0.3)`.

#### Scenario: Wild combat death with experience
- **WHEN** a player with 1000/5000 experience dies in wild combat
- **THEN** `expLost` is 300, player experience becomes 700/5000

#### Scenario: Wild combat death with low experience
- **WHEN** a player with 50/5000 experience dies in wild combat
- **THEN** `expLost` is 15, player experience becomes 35/5000

### Requirement: Experience cannot go below zero on death
The death penalty SHALL NOT reduce experience below 0. Player level SHALL NOT decrease due to death.

#### Scenario: Death with zero experience
- **WHEN** a player with 0/5000 experience dies
- **THEN** experience remains 0, no penalty message is shown

#### Scenario: Very low experience death
- **WHEN** a player with 2/5000 experience dies
- **THEN** `expLost` is 0 (floor of 0.6), experience remains 2

### Requirement: Wild combat death applies experience penalty and HP recovery
CombatSystem SHALL on defeat: deduct 30% experience, revive player at 20% HP. The 10% gold penalty SHALL be removed and replaced by the experience penalty.

#### Scenario: Wild combat defeat sequence
- **WHEN** a player loses a wild combat encounter
- **THEN** 30% experience is deducted, player revives at 20% max HP, and a message shows `💀 战斗失败... 损失 {expLost} 经验值`

#### Scenario: Wild combat defeat no longer deducts gold
- **WHEN** a player loses a wild combat encounter
- **THEN** no gold is deducted (previous 10% gold penalty is removed)

### Requirement: Dungeon wipe applies experience penalty
DungeonCombatSystem SHALL on party wipe (encounter defeat): deduct 30% of the player's current experience, then return to exploration.

#### Scenario: Dungeon wipe penalty
- **WHEN** a party wipes in a dungeon and the player has 3000/10000 experience
- **THEN** 900 experience is deducted, player experience becomes 2100/10000, and party returns to exploration

### Requirement: Max level death penalty uses gold instead
When a level 60 player dies (experience is 0), the death penalty SHALL fall back to deducting 10% of current gold instead of experience.

#### Scenario: Level 60 wild death
- **WHEN** a level 60 player with 500 gold dies in wild combat
- **THEN** 50 gold is deducted, no experience penalty (experience is already 0)

#### Scenario: Level 60 dungeon wipe
- **WHEN** a level 60 player wipes in a dungeon with 1000 gold
- **THEN** 100 gold is deducted

### Requirement: Death penalty is logged
The system SHALL log death penalty in combat messages: `💀 损失 {amount} 经验值` for experience penalty, or `💸 损失 {amount} 金币` for max-level gold penalty.

#### Scenario: Experience penalty log
- **WHEN** a player dies and loses 300 experience
- **THEN** combat log shows `💀 损失 300 经验值`

#### Scenario: Gold penalty log at max level
- **WHEN** a level 60 player dies and loses 50 gold
- **THEN** combat log shows `💸 损失 50 金币`
