# test-tools-modal Specification

## Purpose
测试工具弹窗 - 方便开发调试的各种功能按钮集合

## Requirements
### Requirement: Test tools modal displays test buttons
The test tools modal SHALL contain buttons for testing functionality, displayed below the "测试工具" button.

#### Scenario: Modal opens below test tools button
- **WHEN** user clicks "测试工具" button in the header
- **THEN** a dropdown popup appears below the button

#### Scenario: Modal uses 2x2 grid layout
- **WHEN** test tools modal is displayed
- **THEN** buttons SHALL be arranged in a 2x2 grid

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

#### Scenario: Modal contains test equipment button
- **WHEN** test tools modal is displayed
- **THEN** it SHALL contain a "获取装备" button

#### Scenario: Modal contains test item button
- **WHEN** test tools modal is displayed
- **THEN** it SHALL contain a "获取物品" button

#### Scenario: Modal closes on mouse leave
- **WHEN** user moves mouse away from the modal
- **THEN** the modal closes

#### Scenario: Button click executes action but does not close modal
- **WHEN** user clicks any button in the modal
- **THEN** the button action executes
- **AND** the modal remains open until mouse leaves

#### Scenario: Button styling matches header buttons
- **WHEN** test tool buttons are displayed
- **THEN** they SHALL have the same styling as header buttons (2px border, no border-radius, gradient background)
