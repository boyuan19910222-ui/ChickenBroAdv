## Context

野外战斗 `CombatView.vue`（575行）和副本战斗 `DungeonCombatView.vue`（1522行）各自内联实现了角色卡片 UI。经过详细对比分析，两边在数据字段（currentHp/maxHp, resource, buffs/debuffs）上已基本统一，但模板结构、浮动伤害数字逻辑、CSS 动画定义存在大量重复。

已有的共享组件 `EffectIcons.vue` 和 `SkillPanel.vue` 证明了组件抽取的可行性。

## Goals / Non-Goals

**Goals:**
- 抽取通用 `CombatantCard.vue`，统一角色卡片的渲染结构
- 抽取通用 `ResourceBar.vue`，统一各类资源条渲染
- 抽取 `useCombatFloats.js` composable，统一浮动伤害数字管理
- 消除两个视图中重复的 CSS 动画定义
- 保持两种战斗场景的视觉差异（通过 props 参数化）

**Non-Goals:**
- 不统一两个战斗系统的后端逻辑（CombatSystem / DungeonCombatSystem）
- 不统一事件总线的事件名称（combat:* / dungeon:* 保持各自命名空间）
- 不改变现有的战斗交互流程
- 不涉及 SkillPanel 或 EffectIcons 的改动（已经是共享组件）

## Decisions

### 1. 采用"大卡片组件 + 关键子组件抽取"路线

**选择**: `CombatantCard.vue` 封装完整卡片（头像 + 名字 + HP条 + 资源条 + 连击点 + Buff/Debuff），通过 props 控制差异。额外抽取 `ResourceBar.vue` 作为独立子组件。

**替代方案**: 拆成多个原子组件（UnitAvatar, ResourceBar, ComboPoints, FloatingNumbers）各视图自行组合。

**理由**: 卡片结构足够稳定且两边高度相似，过度拆分会增加组合复杂度。ResourceBar 是唯一明确的可复用单元（HP/法力/怒气/能量都是同一结构）。

### 2. 通过 variant prop 区分视觉风格

**选择**: CombatantCard 接受 `size="normal"|"compact"` 和 `side="player"|"enemy"` props，内部通过 CSS 变量控制尺寸和配色。

**理由**: 野外战斗的大卡片和副本战斗的紧凑卡片在信息密度上有合理差异，不应强行统一视觉。通过 CSS 变量隔离差异，结构代码保持统一。

### 3. 浮动数字统一为字典索引模型

**选择**: `useCombatFloats` composable 使用 `reactive({})` 按 unitId 索引管理所有浮动数字。野外战斗为 player/enemy 分配 id。

**替代方案**: 保持野外用双数组、副本用字典的各自模型。

**理由**: 字典模型是双数组的超集，统一后野外战斗也具备了多角色扩展能力。composable 封装后，两个视图只需调用同一套 API。

### 4. CSS 动画定义放在 CombatantCard 组件内

**选择**: `damageFloat`、`critDamageFloat`、`healFloat`、`hitShake`、`critHitShake` 等关键帧动画统一定义在 CombatantCard.vue 的 `<style>` 中。

**替代方案**: 抽到独立 CSS 文件。

**理由**: 动画与卡片组件强耦合，跟随组件更易维护。副本缺失的 `healFloat` 和 `critHitShake` 统一补全。

### 5. 交互状态通过 props 注入

**选择**: CombatantCard 接受 `selectable`、`selected`、`highlightClass`、`dead` 等 props，卡片只负责渲染对应 CSS class。高亮逻辑保留在各视图层。

**理由**: 副本战斗的高亮系统非常复杂（selected, current-turn, target-selectable, target-dimmed, acting 等 6+ 种状态），这些是战斗流程逻辑，不属于通用卡片职责。

## Risks / Trade-offs

- **[回归风险]** 大规模重构两个核心战斗视图 → 分步实施，先抽取组件再逐个替换，每步验证
- **[样式微调]** 统一后可能丢失两边各自的样式细节 → 通过 CSS 变量保留差异点，实施时对照截图验证
- **[事件兼容]** 浮动数字事件触发时机不能中断 → composable 只管数据层，事件监听保留在视图层
