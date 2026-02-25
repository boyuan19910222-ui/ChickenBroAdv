## ADDED Requirements

### Requirement: Dropdown displays current selection
组件 SHALL 在触发器区域显示当前选中项的内容（emoji + label + sublabel）。未选择时 SHALL 显示 placeholder 文本。

#### Scenario: Show selected item
- **WHEN** modelValue 匹配某个 option 的 value
- **THEN** 触发器显示该 option 的 emoji、label、sublabel

#### Scenario: Show placeholder when empty
- **WHEN** modelValue 为空或不匹配任何 option
- **THEN** 触发器显示 placeholder 文本

### Requirement: Dropdown toggle
用户点击触发器时 SHALL 切换下拉列表的展开/收起状态。

#### Scenario: Open dropdown
- **WHEN** 下拉列表收起，用户点击触发器
- **THEN** 下拉列表展开显示所有选项

#### Scenario: Close dropdown
- **WHEN** 下拉列表展开，用户点击触发器
- **THEN** 下拉列表收起

### Requirement: Option selection
用户点击选项时 SHALL 更新 modelValue 并关闭下拉列表。

#### Scenario: Select an option
- **WHEN** 用户点击某个选项
- **THEN** 组件 emit update:modelValue 事件，值为该选项的 value
- **THEN** 下拉列表收起

### Requirement: Click outside closes dropdown
点击组件外部区域时 SHALL 自动关闭展开的下拉列表。

#### Scenario: Close on outside click
- **WHEN** 下拉列表展开，用户点击组件外部任意位置
- **THEN** 下拉列表收起

### Requirement: Disabled state
disabled 为 true 时 SHALL 禁止展开下拉列表，触发器样式 SHALL 呈现禁用状态。

#### Scenario: Prevent interaction when disabled
- **WHEN** disabled 为 true，用户点击触发器
- **THEN** 下拉列表不展开

### Requirement: Pixel UI style
组件样式 SHALL 与游戏主题一致：深蓝背景、金色边框、像素字体。

#### Scenario: Consistent styling
- **WHEN** 组件渲染
- **THEN** 使用项目 CSS 变量（--bg-tertiary, --border-primary, --primary-gold, --pixel-font）
- **THEN** 选中项有视觉高亮（金色边框或背景）
