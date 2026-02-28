# test-tools-modal Specification

## Purpose
TBD - created by archiving change add-test-tools-and-death-button. Update Purpose after archive.
## Requirements
### Requirement: Test tools modal displays test buttons
The test tools modal SHALL contain buttons for testing functionality, displayed below the "测试工具" button.

#### Scenario: Modal opens below test tools button
- **WHEN** user clicks "测试工具" button in the header
- **THEN** a dropdown popup appears below the button

#### Scenario: Modal contains test upgrade button
- **WHEN** test tools modal is displayed
- **THEN** it SHALL contain a "测试升级" button with icon above text that triggers level up

#### Scenario: Modal contains test death button
- **WHEN** test tools modal is displayed
- **THEN** it SHALL contain a "测试死亡" button with icon above text
- **AND** the button is displayed regardless of combat state

#### Scenario: Test death button disabled outside combat
- **WHEN** player is not in combat (exploration scene)
- **AND** test death button is clicked
- **THEN** nothing should happen (button is disabled)
- **AND** tooltip shows "战斗中可用"

#### Scenario: Test death button enabled in combat
- **WHEN** player is in combat (combat or dungeon scene)
- **AND** test death button is clicked
- **THEN** player HP is reduced to 0, triggering death sequence

#### Scenario: Modal closes on mouse leave
- **WHEN** user moves mouse away from the modal
- **THEN** the modal closes

#### Scenario: Buttons close modal after action
- **WHEN** user clicks any button in the modal
- **THEN** the button action executes
- **AND** the modal closes

