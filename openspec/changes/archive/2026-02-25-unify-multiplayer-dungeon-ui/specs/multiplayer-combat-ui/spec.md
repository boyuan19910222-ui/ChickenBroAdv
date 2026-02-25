## ADDED Requirements

### Requirement: DungeonCombatView 多人模式检测

`DungeonCombatView` SHALL 通过 `multiplayerStore.isInBattle` 判断当前是否为多人模式。

#### Scenario: 多人模式标识
- **WHEN** `DungeonCombatView` 挂载
- **AND** `multiplayerStore.isInBattle === true`
- **THEN** `isMultiplayerMode` computed 为 `true`
- **AND** 进入多人模式UI状态

#### Scenario: 单人模式标识
- **WHEN** `DungeonCombatView` 挂载
- **AND** `multiplayerStore.isInBattle === false`
- **THEN** `isMultiplayerMode` computed 为 `false`
- **AND** UI行为与现有完全一致

---

### Requirement: 多人模式下隐藏手动操作UI

多人模式下 SHALL 隐藏所有需要玩家手动输入的UI组件。

#### Scenario: 隐藏技能面板
- **WHEN** `isMultiplayerMode === true`
- **THEN** `SkillPanel` 组件不渲染（`v-if` 为 false）

#### Scenario: 隐藏操作按钮
- **WHEN** `isMultiplayerMode === true`
- **THEN** 攻击、防御、结束回合、开始结算按钮均不渲染

#### Scenario: 隐藏目标选择
- **WHEN** `isMultiplayerMode === true`
- **THEN** `TargetConfirmDialog` 不渲染

#### Scenario: 隐藏自动战斗切换
- **WHEN** `isMultiplayerMode === true`
- **THEN** 自动战斗开关按钮不渲染（全程自动无需切换）

---

### Requirement: 多人模式下保留所有展示型UI

多人模式下 SHALL 保留所有展示型UI组件，与单人模式一致。

#### Scenario: 保留行动顺序条
- **WHEN** `isMultiplayerMode === true`
- **THEN** `TurnOrderBar` 正常渲染
- **AND** 显示所有角色的行动顺序

#### Scenario: 保留角色卡片
- **WHEN** `isMultiplayerMode === true`
- **THEN** `CombatantCard` 正常渲染
- **AND** 队伍成员和敌人的血条、Buff/Debuff、状态均正常显示

#### Scenario: 保留浮动战斗数字
- **WHEN** `isMultiplayerMode === true`
- **AND** 发生伤害/治疗事件
- **THEN** 浮动数字正常显示（伤害红色、暴击大字、治疗绿色）

#### Scenario: 保留Boss阶段UI
- **WHEN** `isMultiplayerMode === true`
- **AND** 当前为Boss战
- **THEN** Boss双槽位卡片、阶段指示器正常渲染

#### Scenario: 保留召唤面板
- **WHEN** `isMultiplayerMode === true`
- **AND** 队伍中有猎人/术士
- **THEN** `SummonPanel` 在需要时正常显示（AI自动选择召唤物）

#### Scenario: 保留战斗日志
- **WHEN** `isMultiplayerMode === true`
- **THEN** 战斗日志区域正常显示所有战斗事件

#### Scenario: 保留休息阶段UI
- **WHEN** `isMultiplayerMode === true`
- **AND** encounter 间进入休息阶段
- **THEN** 休息阶段界面正常显示
- **AND** 自动倒计时后继续（不等待点击）

---

### Requirement: 聊天侧栏集成

多人模式下 SHALL 在 `DungeonCombatView` 中显示聊天侧栏。

#### Scenario: 聊天面板显示
- **WHEN** `isMultiplayerMode === true`
- **THEN** 在战斗界面右侧或底部显示可折叠的聊天面板
- **AND** 默认折叠状态

#### Scenario: 聊天消息展示
- **WHEN** 聊天面板展开
- **THEN** 显示 `multiplayerStore.roomMessages` 中的消息
- **AND** 每条消息显示发送者昵称和内容

#### Scenario: 发送聊天消息
- **WHEN** 玩家在聊天输入框输入文字并提交
- **THEN** 调用 `multiplayerStore.sendMessage(content)`
- **AND** 消息发送到服务端并广播给房间内其他玩家

#### Scenario: 单人模式无聊天
- **WHEN** `isMultiplayerMode === false`
- **THEN** 聊天面板不渲染

---

### Requirement: 掉落弹窗集成

多人模式战斗结束后 SHALL 显示个人掉落弹窗。

#### Scenario: 胜利后显示掉落
- **WHEN** `isMultiplayerMode === true`
- **AND** 战斗胜利
- **AND** 客户端收到 `battle:loot` 事件
- **THEN** 弹出 `LootResultModal` 显示个人掉落物品

#### Scenario: 失败后不显示掉落
- **WHEN** `isMultiplayerMode === true`
- **AND** 战斗失败
- **THEN** 显示失败结果
- **AND** 不显示掉落弹窗

#### Scenario: 关闭掉落弹窗后返回
- **WHEN** 玩家关闭 `LootResultModal`
- **THEN** 返回集合石大厅/等待室
- **AND** 清理多人战斗状态

---

### Requirement: 多人模式战斗结束流程

多人模式下战斗结束 SHALL 走独立的清理流程。

#### Scenario: 胜利结束流程
- **WHEN** `isMultiplayerMode === true`
- **AND** `dungeon:complete` 事件触发且 `result === 'victory'`
- **THEN** 客户端向服务端发送 `battle:complete`
- **AND** 等待服务端 `battle:loot` 返回
- **AND** 显示掉落弹窗
- **AND** 不调用单人模式的 `completeDungeon()` 奖励逻辑
- **AND** 不调用 `engine.saveGame()`

#### Scenario: 失败结束流程
- **WHEN** `isMultiplayerMode === true`
- **AND** `dungeon:complete` 事件触发且 `result === 'defeat'`
- **THEN** 客户端向服务端发送 `battle:complete`
- **AND** 显示失败结果
- **AND** 提供"返回大厅"按钮

#### Scenario: 返回大厅
- **WHEN** 玩家点击"返回大厅"或关闭掉落弹窗
- **THEN** 清理 `DungeonCombatSystem` 状态
- **AND** 清理 `multiplayerStore` 战斗状态
- **AND** `gameStore.changeScene('exploration')` 返回主界面
