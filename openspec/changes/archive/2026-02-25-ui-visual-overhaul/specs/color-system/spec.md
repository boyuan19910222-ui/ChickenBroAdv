## ADDED Requirements

### Requirement: WoW 原版冷色调面板配色
系统 SHALL 将面板背景色从当前暖棕色调改为 WoW 原版深蓝黑冷色调，定义以下 CSS 变量：

| 变量 | 值 | 用途 |
|------|-----|------|
| `--bg-primary` | #0D1B2A | 面板主背景 |
| `--bg-secondary` | #1B2838 | 面板次背景 |
| `--bg-tertiary` | #243447 | 悬停/选中态 |
| `--bg-surface` | #152232 | 输入框/列表底色 |
| `--border-primary` | #3D5A80 | 普通边框 |
| `--border-accent` | #C9A227 | 金色强调边框 |

金色系（`--primary-gold`, `--secondary-gold`, `--dark-gold`, `--accent-gold`）保持不变。

#### Scenario: 面板背景色
- **WHEN** 渲染任何 `.pixel-panel` 组件
- **THEN** 背景色使用 `--bg-primary` 或 `--bg-secondary` 的深蓝黑渐变

#### Scenario: 金色装饰保持
- **WHEN** 渲染面板边框、标题栏高光、按钮强调态
- **THEN** 金色系颜色与旧版一致

### Requirement: WoW 职业颜色系统
系统 SHALL 定义 9 个 WoW 官方职业颜色 CSS 变量：

| 变量 | 值 | 职业 |
|------|-----|------|
| `--class-warrior` | #C79C6E | 战士 |
| `--class-paladin` | #F58CBA | 圣骑士 |
| `--class-hunter` | #ABD473 | 猎人 |
| `--class-rogue` | #FFF569 | 盗贼 |
| `--class-priest` | #FFFFFF | 牧师 |
| `--class-shaman` | #0070DE | 萨满 |
| `--class-mage` | #69CCF0 | 法师 |
| `--class-warlock` | #9482C9 | 术士 |
| `--class-druid` | #FF7D0A | 德鲁伊 |

同时在 `GameData.js` 每个职业定义中添加 `color` 字段。

#### Scenario: 角色面板显示职业色
- **WHEN** 渲染 CharacterPanel 中的角色名或职业标识
- **THEN** 文字颜色为该角色职业对应的 WoW 职业色

#### Scenario: 战斗卡片显示职业色
- **WHEN** 渲染 CombatantCard 中玩家角色的名字
- **THEN** 名字颜色为对应职业色

#### Scenario: 创建角色时职业卡片边框色
- **WHEN** 在 CreateCharacterView 中选择某个职业
- **THEN** 被选中职业的卡片边框使用该职业色

### Requirement: 功能色体系
系统 SHALL 定义统一的功能色 CSS 变量：

| 变量 | 值 | 用途 |
|------|-----|------|
| `--color-hp` | #FF4444 | 生命值 |
| `--color-mana` | #3F48CC | 法力值 |
| `--color-energy` | #FFFF00 | 能量 |
| `--color-rage` | #FF4444 | 怒气 |
| `--color-exp` | #FFD700 | 经验值 |
| `--color-friendly` | #00FF00 | 友方 |
| `--color-hostile` | #FF0000 | 敌方 |
| `--color-neutral` | #FFFF00 | 中立 |
| `--color-interactive` | #FFD700 | 可交互 |
| `--color-buff` | #4ade80 | 增益效果 |
| `--color-debuff` | #f87171 | 减益效果 |
| `--color-damage` | #ff4444 | 伤害数值 |
| `--color-heal` | #44ff44 | 治疗数值 |

#### Scenario: 资源条颜色
- **WHEN** 渲染 ResourceBar 组件
- **THEN** HP 条使用 `--color-hp`，MP 条使用 `--color-mana`，能量条使用 `--color-energy`

#### Scenario: 战斗数值颜色
- **WHEN** 显示伤害浮动数字
- **THEN** 伤害使用 `--color-damage`，治疗使用 `--color-heal`

### Requirement: 文字色层级
系统 SHALL 定义文字色层级 CSS 变量：

| 变量 | 值 | 用途 |
|------|-----|------|
| `--text-primary` | #F5F5DC | 主文字（米白） |
| `--text-secondary` | #8a8a6a | 次要文字（暗金灰） |
| `--text-muted` | #5a5a4a | 弱化文字 |
| `--text-disabled` | #3a3a2a | 禁用文字 |

#### Scenario: 正文与次要文字区分
- **WHEN** 同一面板中存在主要信息和次要说明
- **THEN** 主要信息使用 `--text-primary`，次要说明使用 `--text-secondary`

### Requirement: 硬编码颜色统一化
所有 .vue 组件中硬编码的颜色值 SHALL 替换为对应的 CSS 变量引用。

#### Scenario: 组件样式使用 CSS 变量
- **WHEN** 任何组件的 `<style>` 中需要引用颜色
- **THEN** 使用 `var(--xxx)` 格式引用 CSS 变量，不直接写十六进制色值

#### Scenario: 品质颜色例外
- **WHEN** 组件需要显示装备品质颜色
- **THEN** 可以从 `QualityConfig` JS 对象获取颜色值动态绑定（因品质色由数据驱动，不适合 CSS 变量）
