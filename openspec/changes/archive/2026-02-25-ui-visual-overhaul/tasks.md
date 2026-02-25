## 1. 字体基础设施

- [x] 1.1 将字体文件从 `fonts/` 移到 `src/assets/fonts/`，创建 assets 目录结构
- [x] 1.2 在 `base.css` 中添加 `@font-face` 声明，引用 .otf 文件
- [x] 1.3 更新 `variables.css`：替换 `--pixel-font` 为方舟像素字体 font-family
- [x] 1.4 移除 `index.html` 中 Google Fonts CDN `<link>` 标签
- [x] 1.5 添加像素渲染优化：`-webkit-font-smoothing: none` / `text-rendering` 等
- [x] 1.6 在 `variables.css` 中定义字号变量体系（--fs-xs/sm/base/md/lg/xl）

## 2. 颜色变量体系

- [x] 2.1 更新 `variables.css`：面板背景色从暖棕改为 WoW 冷色调（--bg-primary/secondary/tertiary/surface）
- [x] 2.2 更新 `variables.css`：边框色更新（--border-primary/accent）
- [x] 2.3 添加 `variables.css`：9 个职业色 CSS 变量（--class-warrior 等）
- [x] 2.4 添加 `variables.css`：功能色变量（--color-hp/mana/energy/rage/exp/buff/debuff/damage/heal 等）
- [x] 2.5 添加 `variables.css`：文字色层级变量（--text-primary/secondary/muted/disabled）
- [x] 2.6 在 `GameData.js` 每个职业定义中添加 `color` 字段

## 3. 全局样式更新

- [x] 3.1 更新 `pixel-ui.css`：.pixel-panel 背景/边框引用新 CSS 变量
- [x] 3.2 更新 `pixel-ui.css`：.pixel-btn 尺寸增大（高度 36px、内边距 8px 16px、字号 12px）
- [x] 3.3 更新 `pixel-ui.css`：所有硬编码颜色替换为 CSS 变量
- [x] 3.4 更新 `base.css`：全局字号/字体/滚动条样式
- [x] 3.5 更新 `animations.css`：动画中颜色引用改为 CSS 变量

## 4. 布局与尺寸调整

- [x] 4.1 更新 `GameView.vue`：三栏宽度调整为 280px / 1fr / 300px
- [x] 4.2 更新 `GameHeader.vue`：字号和间距
- [x] 4.3 更新 `MessageLog.vue`：字号和间距

## 5. 组件样式更新（左侧面板）

- [x] 5.1 更新 `CharacterPanel.vue`：字号替换为 CSS 变量，硬编码颜色统一化，应用职业色

## 6. 组件样式更新（中间主区域）

- [x] 6.1 更新 `ExplorationView.vue`：字号、颜色统一化
- [x] 6.2 更新 `CombatView.vue`：字号、颜色统一化
- [x] 6.3 更新 `DungeonCombatView.vue`：字号、颜色统一化
- [x] 6.4 更新 `CombatantCard.vue`：字号、颜色统一化，玩家名应用职业色
- [x] 6.5 更新 `EffectIcons.vue`：字号、颜色统一化
- [x] 6.6 更新 `ResourceBar.vue`：字号、颜色统一化，高度增大
- [x] 6.7 更新 `SkillPanel.vue`：字号、颜色统一化
- [x] 6.8 更新 `TurnOrderBar.vue`：字号、颜色统一化
- [x] 6.9 更新 `TargetConfirmDialog.vue`：字号、颜色统一化

## 7. 组件样式更新（右侧面板 + 模态框）

- [x] 7.1 更新 `SystemPanel.vue`：字号、颜色统一化，装备槽/背包/技能 Tab 样式
- [x] 7.2 更新 `AreaSelectionModal.vue`：字号、颜色统一化
- [x] 7.3 更新 `TalentModal.vue`：字号、颜色统一化

## 8. 视图页面样式更新

- [x] 8.1 更新 `MenuView.vue`：字号、颜色统一化
- [x] 8.2 更新 `CreateCharacterView.vue`：字号、颜色统一化，职业卡片应用职业色

## 9. 验证

- [x] 9.1 执行 vite build 确认零错误
- [ ] 9.2 目视检查所有页面渲染效果（菜单→创建角色→游戏主界面→战斗→副本）
