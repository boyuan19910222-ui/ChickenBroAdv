## Why

游戏中所有图标（职业、战斗角色、怪物、区域、技能、buff 等）目前使用 Unicode emoji 字符渲染。Emoji 在不同平台/浏览器下显示不一致，且无法体现游戏的像素街机美术风格。需要将所有 emoji 替换为统一的像素风格 PNG 图标，提升视觉一致性和品质感。

本次变更**第一阶段**聚焦于：9 大职业图标的替换（图标素材已就绪）。后续阶段会逐步替换怪物、区域、技能、buff、装备等图标。

## What Changes

- 建立 `public/icons/` 静态资源目录结构，按类别组织像素图标文件
- 将 GameData.js 中职业定义的 `emoji` 字段替换为 `icon` 字段（图片路径）
- 创建通用 `PixelIcon.vue` 组件，统一管理图标渲染（尺寸、像素渲染模式、加载失败 fallback）
- 替换所有 Vue 组件中职业 emoji 的文本渲染为 `<PixelIcon>` 图片渲染
- 消除 SystemPanel.vue 和 PartyFormationSystem.js 中的硬编码 emoji 映射
- PartyFormationSystem.js 中的战斗角色（tank/melee_dps/ranged_dps/healer）使用独立的角色图标路径，与职业图标分离

## Capabilities

### New Capabilities
- `pixel-icon-system`: 像素图标基础设施 — 目录结构规范、PixelIcon 通用组件、全局 CSS 像素渲染规则、图标路径约定

### Modified Capabilities
- `combatant-card`: CombatantCard 组件从渲染 emoji 文本改为渲染 PixelIcon 图片
- `player-schema`: PlayerSchema 中 emoji 字段替换为 icon 字段（图片路径字符串）

## Impact

- **静态资源**: 新建 `public/icons/` 目录树，移入 9 个职业图标 PNG
- **数据层**: `GameData.js` 职业定义 emoji → icon, `PlayerSchema.js` 字段变更
- **组件层**: 所有渲染 `.emoji` 的 Vue 组件需改为 `<PixelIcon :src="xxx.icon">`
  - CreateCharacterView.vue, CharacterPanel.vue, SystemPanel.vue, CombatantCard.vue, DungeonCombatView.vue, TurnOrderBar.vue, TargetConfirmDialog.vue, CombatView.vue, ExplorationView.vue, AreaSelectionModal.vue
- **系统层**: PartyFormationSystem.js 的 emoji 映射改为 icon 路径
- **存档兼容**: 旧存档中 player.emoji 需要兼容处理（sanitize 时补充 icon）
