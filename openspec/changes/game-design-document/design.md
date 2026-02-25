## 项目背景

《鸡哥大冒险》是一款网页端像素风格文字回合制冒险游戏，需要建立完整的技术架构来支持复杂的游戏系统。当前项目处于初始阶段，需要从零开始设计技术架构，确保能够支持9大职业系统、回合制战斗、装备系统等核心功能。

**约束条件**:
- 必须在网页端运行，使用标准Web技术
- 采用像素风格文字UI，配合简单动画效果增强游戏性
- 当前支持本地存档，架构预留服务端扩展能力
- 需要支持复杂的游戏逻辑和状态管理

**利益相关者**:
- 游戏开发者：需要清晰的架构指导
- 玩家：期望流畅的游戏体验、精彩的动画反馈和稳定的存档系统

## 目标与非目标

**目标:**
- 建立模块化的游戏系统架构，支持独立开发和测试
- 设计高效的数据存储和状态管理方案（本地优先，预留云端扩展）
- 创建可扩展的UI框架，支持像素风格界面和动画效果
- 建立统一的事件系统，实现系统间松耦合通信
- 提供完整的游戏数据模型和配置系统
- 实现轻量级动画系统，增强游戏视觉反馈和沉浸感
- 确保良好的性能和用户体验

**非目标:**
- 当前阶段不实现服务器端功能（但架构预留扩展接口）
- 当前不包含多人在线功能（未来可扩展）
- 不考虑移动端原生应用适配
- 不涉及复杂的3D图形渲染（保持像素风格2D动画）

## 技术决策

### 1. 技术栈选择

**决策**: 使用 Vue 3 + Vite + Pinia + Vue Router + CSS3

**理由**:
- 项目已从单文件 HTML (5000+ 行) 增长到需要模块化管理的规模，原生 JS 难以维持
- Vue 3 Composition API 提供响应式状态管理和组件化开发，显著提高代码可维护性
- Vite 提供极速的 HMR 开发体验和优化的生产构建（Tree-shaking、代码分割）
- Pinia 作为 Vue 官方状态管理方案，替代自制 StateManager 提供类型安全的全局状态
- Vue Router (Hash 模式) 管理游戏场景路由（主菜单/角色创建/游戏主界面）
- CSS3 Scoped Styles 支持像素风格设计，组件级样式隔离避免冲突
- ES Module 原生支持，游戏系统代码通过 `export/import` 模块化组织

**技术版本**:
- Vue: ^3.5.25
- Vite: ^7.3.1
- Pinia: ^3.0.4
- Vue Router: ^4.6.4

**演进历史**:
- 初始方案为 HTML5 + CSS3 + 原生 JavaScript (ES6+)，单文件架构
- 随着游戏系统复杂度增长（9大职业、副本战斗、装备系统等），单文件超过 5000 行
- 迁移至 Vue 3 + Vite 架构，将游戏逻辑（systems/）与 UI 层（components/）分离
- 通过 globals.js 兼容层保证游戏系统间的 window.XXX 引用在迁移过渡期正常工作

### 2. 架构模式

**决策**: Vue 3 组件化架构 + Pinia 状态管理 + 事件驱动游戏系统

**理由**:
- Vue SFC 组件化开发，UI 层与游戏逻辑层分离
- Pinia Store 集中管理游戏全局状态，通过 getters 提供响应式的系统访问
- 游戏系统层保留 ES Module + EventBus 事件驱动模式，确保系统间松耦合
- Vue Router 管理游戏场景（菜单 → 角色创建 → 游戏主界面），支持懒加载
- 兼容层 (globals.js) 支持游戏系统间的既有引用模式

**架构图**:
```
Vue 应用层 (vue-app/)
├── main.js                    (应用入口: createApp + Pinia + Router)
├── App.vue                    (根组件: router-view + 全局过渡)
├── router/index.js            (路由: menu / create / game)
└── stores/gameStore.js        (Pinia Store: 引擎实例 + 全局状态)

游戏引擎层 (core/)
├── GameEngine.js              (核心引擎: 系统注册/获取)
├── EventBus.js                (事件总线: on/off/emit/once)
├── StateManager.js            (状态管理: get/set/快照)
├── SaveManager.js             (存档管理: localStorage + 导入/导出)
└── globals.js                 (兼容层: ES Module → window.XXX 过渡)

游戏系统 (systems/)
├── CharacterSystem.js         (角色系统)
├── CombatSystem.js            (1v1 战斗系统)
├── DungeonCombatSystem.js     (副本战斗系统)
├── TurnOrderSystem.js         (回合顺序系统)
├── ActionPointSystem.js       (行动点系统)
├── PositioningSystem.js       (站位系统)
├── ThreatSystem.js            (仇恨系统)
├── BossPhaseSystem.js         (BOSS阶段系统)
├── PartyFormationSystem.js    (队伍阵型系统)
├── TalentSystem.js            (天赋系统)
├── PetCombatSystem.js         (宠物战斗系统)
├── EffectSystem.js            (效果系统: DOT/HOT/buff/debuff/shield/CC)
├── EquipmentSystem.js         (装备系统)
├── QuestSystem.js             (任务系统)
└── index.js                   (桶文件: 统一导出)

AI 决策系统 (ai/)
├── BehaviorTree.js            (行为树引擎: selector/scored/sequence/condition/action)
├── AIRegistry.js              (条件/动作/评分注册表)
├── ContextBuilder.js          (三层 context 组装)
├── SkillExecutor.js           (统一技能执行器)
├── AIDecisionSystem.js        (顶层调度入口)
├── conditions.js              (条件函数集)
├── actions.js                 (动作函数集)
├── scorers.js                 (评分函数集)
└── trees/                     (行为树定义)
    ├── dungeonAllyTank.js     (副本友方坦克)
    ├── dungeonAllyHealer.js   (副本友方治疗)
    ├── dungeonAllyDps.js      (副本友方 DPS)
    ├── dungeonEnemy.js        (副本普通敌人)
    ├── bossDefault.js         (BOSS 默认)
    ├── overworldEnemy.js      (野外敌人)
    └── petDefault.js          (宠物)

游戏数据 (data/)
├── GameData.js                (职业/技能/怪物/区域/资源系统配置)
├── ClassMechanics.js          (职业机制数据: 宠物/恶魔/图腾/变形等)
├── TalentData.js              (天赋树数据: 9职业各3分支)
├── EquipmentData.js           (装备数据)
├── QuestData.js               (任务数据)
└── dungeons/WailingCaverns.js (副本数据: 哀嚎洞穴)

Vue UI 组件层 (components/)
├── layout/                    (布局: GameHeader, SystemPanel)
├── character/                 (角色: CharacterPanel, 含宠物状态标记)
├── combat/                    (战斗: CombatView, 含宠物卡片)
├── dungeon/                   (副本: DungeonCombatView, TurnOrderBar, TargetConfirmDialog)
├── exploration/               (探索: ExplorationView)
├── common/                    (通用: MessageLog)
└── modals/                    (浮层: AreaSelectionModal, TalentModal)

页面视图 (views/)
├── MenuView.vue               (主菜单: 新游戏/加载/导入导出)
├── CreateCharacterView.vue    (角色创建: 9职业选择)
└── GameView.vue               (游戏主界面: 三栏布局)

样式 (styles/)
├── variables.css              (CSS 变量: 颜色/字体/间距)
├── base.css                   (基础重置和全局样式)
├── pixel-ui.css               (像素风格 UI 组件样式)
└── animations.css             (动画关键帧 + Vue 过渡类)
```

### 3. 数据存储方案

**决策**: LocalStorage + JSON序列化（直接实现，未抽象适配层）

**理由**:
- LocalStorage提供持久化存储，当前阶段无需服务器
- JSON格式便于调试和数据迁移
- SaveManager 直接操作 localStorage，key 格式为 `chickenBro_save_${slot}`
- 支持 3 个存档槽位 + 导入/导出功能
- 未来可引入 StorageAdapter 抽象层接入云端存储

**数据结构**:
```javascript
游戏存档 = {
  版本: "1.0.0",
  时间戳: Date,
  同步状态: "local" | "synced" | "pending",  // 预留云端同步
  玩家数据: PlayerData,
  游戏状态: GameStateData,
  系统数据: {
    角色: CharacterSystemData,
    任务: QuestSystemData,
    装备: EquipmentSystemData,
    // ... 其他系统数据
  }
}
```

**当前实现**: SaveManager 直接使用 localStorage，key 格式为 `chickenBro_save_${slot}`，支持 10 个存档槽位。GameEngine 和 gameStore 通过 `currentSlot` 追踪当前活跃槽位，新建角色时自动分配第一个空槽位。自动存档每 10 分钟执行一次，副本通关时额外触发一次自动存档。所有保存操作默认写入当前活跃槽位。

**未来扩展** (尚未实现):
```javascript
// 计划引入存储适配器接口，抽象存储后端
interface StorageAdapter {
  save(key: string, data: object): Promise<void>;
  load(key: string): Promise<object>;
  sync(): Promise<void>;  // 预留云端同步
}
// 当前: 直接 localStorage (SaveManager.js)
// 未来: LocalStorageAdapter / CloudStorageAdapter
```

### 4. 状态管理

**决策**: Pinia 集中式全局状态 + GameEngine 系统本地状态 + EventBus 事件通信

**理由**:
- Pinia Store (gameStore) 管理游戏全局状态：引擎实例、当前场景、玩家数据、日志
- 通过 Pinia getters 提供响应式的系统访问：`characterSystem`、`combatSystem`、`dungeonCombatSystem`
- GameEngine 内部的 StateManager 管理游戏逻辑状态（player、currentArea 等）
- EventBus 实现系统间事件通信（dungeon:combatUpdate、dungeon:playerAction 等）
- Vue 组件通过 onMounted/onUnmounted 生命周期订阅/取消订阅 EventBus 事件
- 支持状态快照和回滚功能（SaveManager 负责 localStorage 持久化）

### 5. UI架构

**决策**: Vue 3 单文件组件 (SFC) + Scoped CSS + Composition API

**理由**:
- Vue SFC 将模板、脚本、样式封装在单文件中，提高代码内聚性
- `<script setup>` 语法简化 Composition API 使用
- Scoped CSS 避免样式冲突，同时保持像素风格的精确控制
- CSS 变量系统 (variables.css) 统一主题管理（--primary-gold、--pixel-font 等）
- 组件层次清晰，按功能域组织（layout/character/combat/dungeon/modals）

**UI组件层次**:
```
页面视图 (Views - 路由级)
├── MenuView.vue               (主菜单)
├── CreateCharacterView.vue    (角色创建)
└── GameView.vue               (游戏主界面 - 三栏 Grid 布局)

布局组件 (Layout)
├── GameHeader.vue             (顶部导航栏: 区域/副本/天赋/保存/退出)
├── SystemPanel.vue            (右侧面板: 装备/背包/技能/掉落 Tab)
└── MessageLog.vue             (底部系统日志面板: 自动滚动)

功能组件 (Feature)
├── CharacterPanel.vue         (左侧角色面板: 头像/HP/资源/属性/宠物状态)
├── ExplorationView.vue        (探索界面: 区域显示/探索/休息)
├── CombatView.vue             (1v1 战斗界面, 含宠物卡片)
├── DungeonCombatView.vue      (副本战斗: 战场/行动按钮/技能面板内嵌)
├── TurnOrderBar.vue           (回合顺序条)
└── TargetConfirmDialog.vue    (目标确认弹窗)

模态框组件 (Modals)
├── AreaSelectionModal.vue     (区域选择)
└── TalentModal.vue            (天赋树 - 开发中)
```

### 6. 性能优化策略

**决策**: Vite 构建优化 + Vue 懒加载 + 批量 DOM 更新 + 动画性能优化

**理由**:
- Vite 自动 Tree-shaking 和代码分割（路由级懒加载: MenuView / CreateCharacterView / GameView）
- Vue 虚拟 DOM diff 自动减少不必要的 DOM 操作
- EventBus 事件驱动避免全局状态频繁更新
- 动画使用 CSS transform/opacity 触发 GPU 加速
- Pinia getters 缓存计算结果，避免重复计算

### 7. 动画系统设计

**决策**: 纯 CSS3 动画 + Vue `<transition>` / `<transition-group>` 组件

**理由**:
- CSS3 @keyframes 性能最佳，浏览器可自动 GPU 加速
- Vue 内置过渡组件管理动画生命周期，无需额外依赖
- 动画直接内联在组件 Scoped CSS 中，与组件逻辑紧密关联，易于维护
- 当前阶段不需要集中式动画管理器，组件级动画已满足需求

**实际动画实现**:
```
UI动画 (CSS3 Transitions/Animations)
├── 路由切换淡入/淡出         (App.vue: <transition name="fade">)
├── HP/资源条宽度过渡         (transition: width 0.3s ease)
├── 按钮悬停/点击反馈         (pixel-ui.css)
└── 日志自动滚动              (MessageLog.vue: scrollTop)

野外战斗动画 (CombatView.vue)
├── 浮动伤害数字上飘           (@keyframes damageFloat, 0.8s)
├── 暴击伤害放大闪烁           (@keyframes critDamageFloat, 1.2s, 橙色三层发光)
├── 治疗数字绿色上飘           (@keyframes healFloat, 0.8s)
├── 受击抖动                   (@keyframes hitShake, 0.3s)
└── 暴击受击强烈震动           (@keyframes critHitShake, 0.6s, 含缩放)

副本战斗动画 (DungeonCombatView.vue)
├── 目标选中脉冲               (@keyframes targetPulse)
├── 行动单位高亮               (@keyframes actingPulseGreen/DarkYellow)
├── 目标闪烁                   (@keyframes targetFlashRed/Green/DarkYellow)
├── 未就绪脉冲                 (@keyframes notReadyPulse)
├── 终结技就绪发光             (@keyframes executeReady)
├── AOE 溅射目标预览           (@keyframes splashPreviewPulse, 橙色 #ff8c00)
├── AOE 溅射目标战斗闪烁       (@keyframes targetFlashSplash, 橙色 #ff8c00)
└── AOE 主目标规划高亮         (@keyframes plannedPrimaryPulse, 红色 #ff4444)

探索界面动画
└── 休息恢复进度条             (CSS transition: width 0.05s linear)
```

**未来扩展** (尚未实现):
- 集中式 AnimationManager（动画队列管理、预设动画库）
- Canvas 像素级精灵动画和粒子特效
- Web Animations API 程序化控制

**性能考虑**:
- 动画全部使用 `transform` 和 `opacity` 触发 GPU 加速
- 浮动伤害数字通过定时器自动清理（800ms/1200ms），避免 DOM 堆积
- Vue `<transition-group>` 管理动画元素的进入/离开

### 8. AOE 技能目标系统设计

**决策**: 需选目标的 AOE 技能采用三阶段高亮 + 位置系统计算溅射范围

**适用范围**: 所有 `targetType: 'cleave_3'` 类型技能（如烈焰风暴），以及未来扩展的其他需选目标的 AOE 技能

**目标类型定义**:
```javascript
// 技能 targetType 枚举:
// 'enemy'       — 敌方单体（需选目标）
// 'ally'        — 友方单体（需选目标）
// 'self'        — 自身（无需选目标，直接释放）
// 'all_enemies' — 全体敌方（无需选目标，直接释放）
// 'all_allies'  — 全体友方（无需选目标，直接释放）
// 'front_2'     — 前排2个（无需选目标，直接释放）
// 'front_3'     — 前排3个（无需选目标，直接释放）
// 'random_3'    — 随机3个（无需选目标，直接释放）
// 'cleave_3'    — 选中目标 + 左右相邻单位（需选目标，共3个）
```

**cleave_3 实现架构**:

1. **位置计算** — `PositioningSystem.getAdjacentTargets(battlefield, side, targetId)`
   - 基于 `calculateLogicalPositions` 计算逻辑站位
   - 返回 `{ primary: 主目标, splash: [左右相邻存活单位] }`
   - 相邻判定: `Math.abs(logicalSlot差) === 1`

2. **目标解析** — `DungeonCombatSystem.resolveTargets` 和 `SkillExecutor.resolveTargets`
   - 玩家操控: 通过 `selectedTargetId` 确定主目标，由位置系统计算溅射
   - AI 操控: AI 先选主目标，再由位置系统扩展溅射
   - 返回数组: `[主目标, ...溅射目标]`，主目标始终在第一个

3. **三阶段 UI 高亮方案**:

   **阶段一: 目标选择（hover 预览）**
   - 鼠标**悬停**敌方单位时即时预览，通过 `hoverEnemyId` ref 跟踪
   - `cleavePreviewSplashIds` computed 动态计算溅射范围
   - `cleavePreviewPrimaryId` computed 标识当前预览的主目标
   - 主目标: 红色脉冲 `planned-primary-target` (`#ff4444`, `plannedPrimaryPulse`)
   - 溅射目标: 橙色脉冲 `target-splash-preview` (`#ff8c00`, `splashPreviewPulse`)
   - 鼠标移开后预览消失

   **阶段二: 确认弹窗**
   - 点击目标后弹出 `TargetConfirmDialog`
   - 弹窗显示 "🔥 波及: xxx、xxx" 文字提示溅射目标名称
   - `pendingSkillId` 在 cleave 类技能确认前**不清空**，保持溅射预览

   **阶段三: 规划完成（等待结算）**
   - `plannedSplashIds` ref 持续保存溅射目标 ID
   - `plannedPrimaryTargetId` ref 持续保存主目标 ID
   - 主目标: 红色脉冲 `planned-primary-target`
   - 溅射目标: 橙色脉冲 `target-splash-preview`
   - 在结算开始 / 新回合 / 规划阶段重置时清空

   **结算阶段（战斗执行中）**
   - 通过 `dungeon:unitTargeting` 事件传递 `splashTargetIds` 字段
   - 主目标: 红色闪烁 `target-highlight-red` (`targetFlashRed`)
   - 溅射目标: 橙色闪烁 `target-highlight-splash` (`targetFlashSplash`)

**颜色编码体系**:
```
主目标高亮:     #ff4444 (红色) — 被选中/受到最大影响
溅射目标高亮:   #ff8c00 (橙色) — 波及/间接受到影响
友方行动高亮:   #44ff88 (绿色) — 玩家方行动
敌方行动高亮:   #d4a017 (深黄) — 敌方行动
可选目标高亮:   #44ffaa (亮绿) — 目标可被选择
```

**扩展规范**: 未来新增 AOE 技能类型时，统一遵循此方案:
- 位置计算逻辑在 `PositioningSystem` 中实现对应方法
- 目标解析在 `resolveTargets` 中新增分支
- UI 高亮复用三阶段架构（hover → 确认 → 规划 → 结算）
- 主目标始终红色，溅射/波及目标始终橙色

## 风险与权衡

### 风险1: 复杂状态管理导致性能问题
**风险**: 游戏状态复杂（Pinia Store + GameEngine StateManager 双层状态），可能导致更新性能瓶颈
**缓解措施**: 
- Pinia 提供 getter 缓存和 $patch 批量更新
- EventBus 事件驱动避免全局状态频繁同步
- Vue 组件级细粒度响应式更新
- 关键路径性能监控

### 风险2: 浏览器兼容性问题
**风险**: Vue 3 要求现代浏览器支持 (Proxy API)
**缓解措施**:
- Vite 构建支持 browserslist 目标配置
- CSS 变量有良好的现代浏览器支持
- 动画 API 提供降级方案 (CSS fallback)

### 风险3: 存档数据丢失
**风险**: LocalStorage可能被清理或损坏
**缓解措施**:
- 实现多重备份机制
- 提供导入/导出功能（MenuView 已实现）
- 数据校验和修复机制
- 预留云端同步能力

### 风险4: 游戏系统与 Vue 层耦合
**风险**: 游戏系统 (systems/) 通过 globals.js 兼容层挂载到 window，未来可能产生内存泄漏或引用混乱
**缓解措施**:
- 逐步消除 window.XXX 依赖，全面转为 ES Module import
- Vue 组件通过 Pinia Store getters 访问系统实例
- EventBus 订阅在 onUnmounted 中正确清理

### 风险5: 动画性能影响游戏体验
**风险**: 过多或复杂的 CSS 动画可能导致卡顿
**缓解措施**:
- 当前全部使用 CSS3 动画，浏览器自动 GPU 加速
- Vue `<transition>` / `<transition-group>` 管理动画生命周期
- CSS transform/opacity 触发 GPU 合成层，不触发重排
- 浮动伤害数字通过定时器自动清理，避免 DOM 堆积
- 未来可引入动画分级选项（简单/标准/华丽）

### 风险6: 未来服务端迁移复杂度
**风险**: 架构变更导致迁移困难
**缓解措施**:
- SaveManager 当前直接使用 localStorage，未来可引入 StorageAdapter 抽象层
- 存档格式已预留同步状态字段 (`syncStatus: 'local'`)
- Pinia Store 可无缝接入 API 层

## 迁移计划

### 阶段0: 技术栈迁移 ✅ (已完成)
- 从单文件 index.html (5000+ 行) 迁移到 Vue 3 + Vite 架构
- 创建 vue-app/ 项目脚手架 (Vue 3 + Pinia + Vue Router)
- 将游戏系统代码从 window.XXX 全局模式转换为 ES Module
- 创建 Pinia gameStore 封装 GameEngine 实例
- 拆分 UI 为 15+ Vue SFC 组件
- 创建 globals.js 兼容层支持过渡期

### 阶段1: 核心架构搭建 ✅ (已完成)
- 实现游戏引擎核心框架 (GameEngine + EventBus + StateManager + SaveManager)
- 建立事件系统和状态管理
- 创建基础 UI 组件库 (pixel-panel, pixel-btn, bar-container 等)
- 搭建动画基础框架 (CSS animations + Vue transitions)

### 阶段2: 核心系统实现 ✅ (已完成)
- 实现角色系统 (9大职业) 和战斗系统 (1v1 + 副本)
- 建立副本战斗子系统 (TurnOrder + ActionPoint + Positioning + Threat + BossPhase + PetCombat)
- 实现 AI 决策系统 (行为树 + 评分混合架构，统一 SkillExecutor)
- 实现效果系统 (EffectSystem: DOT/HOT/buff/debuff/shield/CC)
- 创建角色创建界面、战斗界面、副本战斗界面
- 实现基础战斗 UI 动画 (HP条过渡、目标高亮脉冲)
- 实现职业资源系统 (怒气/能量/法力，含脱战衰减/恢复规则)
- 实现盗贼连击点系统
- 野外战斗浮动伤害数字 + 受击抖动 + 暴击强化动效
- 探索界面渐进式休息恢复 (8秒满血，怒气不受休息影响)
- 实现宠物战斗系统（附属单位、主人阵亡联动、状态面板）
- 实现 AOE 技能系统（cleave_3 烈焰风暴：三阶段高亮预览 + 位置系统溅射计算）

### 阶段3: 扩展系统实现 (进行中)
- 实现装备系统和技能系统完善
- 实现任务系统和天赋系统
- 建立制造系统和副本系统扩展
- 完善 UI 和用户体验
- 添加场景动画和反馈动画

### 阶段4: 优化和测试 (未开始)
- 性能优化和 bug 修复
- 完全消除 globals.js 兼容层，全面 ES Module 化
- 完整功能测试
- 动画性能调优和降级方案

### 阶段5: 服务端扩展 (未来规划)
- 实现云端存档同步
- 用户账号系统
- 数据迁移工具
- 多端同步支持

### 回滚策略
- 原始 index.html 单文件版本保留作为回退方案
- 每个阶段建立稳定版本标签
- 保持向后兼容的存档格式（localStorage key 不变）
- 提供版本降级工具
- 动画系统纯 CSS 实现，无外部依赖，可通过 CSS 类名切换禁用

## 待解决问题

1. **globals.js 兼容层清理**: 何时完全消除 window.XXX 全局引用？当前 11 个系统中仅 3 个（CharacterSystem、CombatSystem、DungeonCombatSystem）注册到引擎，其余通过 globals.js 挂载到 window
2. **国际化支持**: 是否需要在架构层面考虑多语言支持？(Vue I18n 可无缝集成)
3. **TypeScript 迁移**: 是否将 .js 文件逐步迁移到 .ts？Vite 原生支持 TypeScript
4. **测试策略**: 是否引入 Vitest 进行组件和系统单元测试？
5. **性能监控**: StateManager 每次 set() 做完整深拷贝历史，高频调用时可能有性能隐患
6. **属性系统精确化**: 当前属性计算使用简化公式（如 attackPower = max(str, agi) * 2），spec 中定义了更精确的 WoW 经典公式（力量→攻击强度的职业系数、敏捷→暴击/闪避等），需要决定是否实现完整版本
7. **服务端技术选型**: 未来云端同步采用什么技术方案？RESTful API / WebSocket / Firebase?
8. **离线/在线切换**: 网络状态变化时如何处理数据同步冲突？
9. **组件库选择**: 是否引入 UI 组件库（如 PrimeVue）替代手写 pixel-ui 样式？
