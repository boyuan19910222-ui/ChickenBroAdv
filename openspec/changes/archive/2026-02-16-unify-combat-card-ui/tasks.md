## 1. 基础组件创建

- [x] 1.1 创建 `src/components/common/ResourceBar.vue`，实现通用资源条组件（支持 hp/mana/energy/rage 类型、overlay/below/none 值显示模式、normal/compact 尺寸）
- [x] 1.2 创建 `src/composables/useCombatFloats.js`，实现浮动伤害数字 composable（spawnFloatingNumber、getFloatingNumbers、triggerShake、isShaking、cleanup），包含统一的 CSS 动画关键帧定义

## 2. 通用卡片组件

- [x] 2.1 创建 `src/components/common/CombatantCard.vue`，集成 ResourceBar、EffectIcons、useCombatFloats，支持 size/side/variant props，实现头像、名字、HP条、资源条、连击点、浮动数字、抖动动画的统一渲染
- [x] 2.2 实现 CombatantCard 的交互状态 props（selectable、selected、dead、highlightClass、isBoss），以及对应的 CSS class 绑定

## 3. 视图层重构

- [x] 3.1 重构 `CombatView.vue`（野外战斗），用 CombatantCard + useCombatFloats 替换内联的卡片模板和浮动数字逻辑，删除重复的 CSS 动画定义
- [x] 3.2 重构 `DungeonCombatView.vue`（副本战斗），用 CombatantCard + useCombatFloats 替换内联的卡片模板和浮动数字逻辑，删除重复的 CSS 动画定义

## 4. 同步与验证

- [x] 4.1 将所有新增和修改的文件同步到 `vue-app/` 目录
