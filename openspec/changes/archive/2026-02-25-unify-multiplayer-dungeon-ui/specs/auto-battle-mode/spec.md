## ADDED Requirements

### Requirement: DungeonCombatSystem 全自动模式

`DungeonCombatSystem` SHALL 支持 `autoPlayMode` 属性，启用后所有角色由 AI 自动决策。

#### Scenario: autoPlayMode 默认关闭
- **WHEN** `DungeonCombatSystem` 实例被创建
- **THEN** `autoPlayMode` 默认为 `false`
- **AND** 战斗行为与现有逻辑完全一致

#### Scenario: autoPlayMode 启用时跳过玩家输入等待
- **WHEN** `autoPlayMode === true`
- **AND** 轮到 `isPlayer === true` 的角色行动
- **THEN** 不设置 `waitingForPlayerInput = true`
- **AND** 直接调用 `processAIAllyTurn(member)` 进行AI决策
- **AND** 不触发 `dungeon:planningPhaseStart` 事件

#### Scenario: autoPlayMode 启用时自动推进 encounter
- **WHEN** `autoPlayMode === true`
- **AND** 当前 encounter 胜利
- **THEN** 自动进入休息阶段
- **AND** 休息阶段自动完成（不等待玩家点击"继续"）
- **AND** 自动开始下一个 encounter

#### Scenario: autoPlayMode 启用时自动完成副本
- **WHEN** `autoPlayMode === true`
- **AND** 所有 encounter 清除完毕
- **THEN** 自动触发 `dungeon:complete` 事件
- **AND** `result` 为 `'victory'`

#### Scenario: autoPlayMode 启用时失败处理
- **WHEN** `autoPlayMode === true`
- **AND** 所有队伍成员死亡
- **THEN** 自动触发 `dungeon:complete` 事件
- **AND** `result` 为 `'defeat'`

---

### Requirement: startDungeonMultiplayer 入口方法

`DungeonCombatSystem` SHALL 新增 `startDungeonMultiplayer(dungeonId, party)` 方法，支持外部注入队伍。

#### Scenario: 使用外部队伍启动
- **WHEN** 调用 `startDungeonMultiplayer(dungeonId, party)`
- **THEN** 不从 `stateManager.get('player')` 构建队伍
- **AND** 直接使用传入的 `party` 数组作为战斗队伍
- **AND** 自动设置 `autoPlayMode = true`
- **AND** 开始第一个 encounter

#### Scenario: 副本数据加载
- **WHEN** 调用 `startDungeonMultiplayer(dungeonId, party)`
- **THEN** 副本数据加载逻辑与 `startDungeon(dungeonId)` 相同
- **AND** 优先从 `DungeonData` 查找，未找到则通过 `DungeonRegistry` 加载

---

### Requirement: autoPlayMode 与单人模式互不干扰

单人模式的战斗流程 SHALL 不受 `autoPlayMode` 影响。

#### Scenario: 单人模式 autoPlayMode 始终为 false
- **WHEN** 通过 `startDungeon(dungeonId)` 启动单人副本
- **THEN** `autoPlayMode` 保持 `false`
- **AND** 玩家角色回合等待手动输入（`waitingForPlayerInput = true`）
- **AND** 已有的视图层 `isAutoBattle` 逻辑不受影响

#### Scenario: 单人模式 AI 队友不受 autoPlayMode 影响
- **WHEN** `autoPlayMode === false`
- **AND** 轮到 AI 队友行动（`isPlayer === false`）
- **THEN** 行为与现有逻辑完全一致
- **AND** 由 `processAIAllyTurn()` 处理

---

### Requirement: 自动战斗节奏控制

全自动模式下 SHALL 保持合理的战斗节奏，使玩家能观看战斗过程。

#### Scenario: 行动间延迟
- **WHEN** `autoPlayMode === true`
- **AND** 一个角色完成行动
- **THEN** 等待 300-500ms 后再处理下一个角色的行动
- **AND** 延迟时间与单人模式的 AI 行动延迟一致

#### Scenario: encounter 间休息延迟
- **WHEN** `autoPlayMode === true`
- **AND** encounter 胜利进入休息阶段
- **THEN** 显示休息阶段UI 2-3 秒
- **AND** 自动开始下一个 encounter

#### Scenario: 战斗结束延迟
- **WHEN** `autoPlayMode === true`
- **AND** 副本通关或失败
- **THEN** 显示结果 1-2 秒后触发 `dungeon:complete` 事件
