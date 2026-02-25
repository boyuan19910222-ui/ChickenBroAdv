## ADDED Requirements

### Requirement: 三栏布局尺寸调整
GameView 的三栏 Grid 布局 SHALL 调整为更宽的面板尺寸：

| 元素 | 旧值 | 新值 |
|------|------|------|
| 左侧面板（CharacterPanel） | 240px | 280px |
| 右侧面板（SystemPanel） | 260px | 300px |

#### Scenario: 桌面端三栏布局
- **WHEN** 在宽度 ≥ 1024px 的屏幕上渲染 GameView
- **THEN** 左侧面板 280px，右侧面板 300px，中间自适应

#### Scenario: 中等屏幕
- **WHEN** 在宽度 768-1024px 的屏幕上渲染
- **THEN** 左侧面板缩至 240px，右侧面板缩至 260px

### Requirement: 面板内边距增大
所有 `.pixel-panel` 组件的内边距 SHALL 从当前 6-8px 增大到 12px。

#### Scenario: 面板内容间距
- **WHEN** 渲染任何 pixel-panel
- **THEN** 内边距为 12px，内容不紧贴边框

### Requirement: 组件间距增大
相邻组件之间的间距 SHALL 从 4-6px 增大到 8-12px。

#### Scenario: 面板内子组件间距
- **WHEN** 面板内存在多个子区块（如装备槽区域、属性列表）
- **THEN** 相邻区块间距至少 8px

### Requirement: 按钮尺寸增大
`.pixel-btn` 按钮 SHALL 增大到最小触摸友好尺寸：

| 属性 | 旧值 | 新值 |
|------|------|------|
| 最小高度 | ~24px | 36px |
| 内边距 | 4px 8px | 8px 16px |
| 字号 | 7px | 12px（使用 --fs-xs） |

#### Scenario: 按钮可点击区域
- **WHEN** 渲染任何 .pixel-btn
- **THEN** 按钮高度至少 36px，文字 12px，内容居中

### Requirement: 标题栏尺寸
`.header-bar` 和 `.panel-title` 类的标题区域 SHALL 使用 `--fs-md`（24px）字号。

#### Scenario: 面板标题渲染
- **WHEN** 渲染面板顶部标题（如"装备"、"背包"、"技能"、"天赋"）
- **THEN** 标题字号为 24px，与正文 12px 形成清晰的层级对比

### Requirement: 资源条高度
ResourceBar 组件的条形高度 SHALL 增大以匹配新的字号体系。

#### Scenario: HP/MP 条渲染
- **WHEN** 渲染生命值或法力值条
- **THEN** 条形高度足以容纳 12px 文字且留有适当上下间距
