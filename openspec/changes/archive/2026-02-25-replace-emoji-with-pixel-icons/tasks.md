## 1. 静态资源目录与文件准备

- [x] 1.1 创建 `public/icons/classes/` 和 `public/icons/roles/` 目录结构
- [x] 1.2 将 `icons/class_icons/ClassIcon_*_pixel256.png` 重命名并复制到 `public/icons/classes/{classId}.png`（9 个文件）
- [x] 1.3 删除原始 `icons/` 目录（已迁移到 public/）

## 2. PixelIcon 通用组件

- [x] 2.1 创建 `src/components/common/PixelIcon.vue`：props(src, size=24, fallback)、image-rendering:pixelated、加载失败 fallback、inline-block 布局

## 3. 数据层变更

- [x] 3.1 GameData.js：9 个职业定义中 `emoji` 字段替换为 `icon: '/icons/classes/${classId}.png'`
- [x] 3.2 PlayerSchema.js：PLAYER_FIELDS 中 `emoji` 替换为 `icon`；createDefaultPlayer 设置 icon；ensurePlayerFields 自动从 class 派生 icon 并清除旧 emoji
- [x] 3.3 GameEngine.js：_sanitizeLoadedState 中增加 icon 字段兼容检查（无 icon 时从 class 派生）

## 4. Vue 组件 emoji → PixelIcon 替换

- [x] 4.1 CreateCharacterView.vue：职业选择列表和已选职业展示从 emoji 文本改为 PixelIcon
- [x] 4.2 CharacterPanel.vue：角色面板职业图标从 emoji 改为 PixelIcon
- [x] 4.3 SystemPanel.vue：删除硬编码 classEmoji computed，改用 player.icon 的 PixelIcon 渲染
- [x] 4.4 CombatantCard.vue：unit 头像从 emoji 文本改为 PixelIcon（有 icon 字段时）或 emoji fallback（无 icon 时）
- [x] 4.5 CombatView.vue：野外战斗玩家/敌人头像从 emoji 改为 PixelIcon（敌人 fallback emoji）
- [x] 4.6 DungeonCombatView.vue：副本战斗中队友/敌人头像从 emoji 改为 PixelIcon（敌人 fallback emoji）
- [x] 4.7 TurnOrderBar.vue：行动顺序条中的 emoji 改为 PixelIcon（带 fallback）
- [x] 4.8 TargetConfirmDialog.vue：目标确认弹窗中的 emoji 改为 PixelIcon（带 fallback）

## 5. 系统层 emoji 映射清理

- [x] 5.1 PartyFormationSystem.js：`_getClassEmoji()` 改为 `_getClassIcon(classId)` 从 GameData 获取 icon 路径；默认队伍配置 emoji → roleIcon
- [x] 5.2 清理所有文件中残留的 `.emoji` 引用，确保无遗漏

## 6. 验证

- [x] 6.1 vite build 通过，无编译错误
