## MODIFIED Requirements

### Requirement: 个人掉落模式标志

联机副本 SHALL 使用 `isPersonalLoot` 标志区分个人掉落模式与单机掉落模式。（保持不变）

#### Scenario: 联机副本启用个人掉落
- **WHEN** 副本以联机模式启动
- **THEN** 战斗上下文中 `isPersonalLoot` 为 `true`
- **AND** 副本结束时走个人掉落流程

#### Scenario: 单机副本保持原有逻辑
- **WHEN** 副本以单机模式启动
- **THEN** 战斗上下文中 `isPersonalLoot` 为 `false`
- **AND** 副本结束时走现有 `handleDungeonReward` 逻辑，行为不变

---

### Requirement: 服务端掉落分发流程

服务端 SHALL 在收到客户端战斗结果上报后执行个人掉落分发。

#### Scenario: 正常分发流程
- **WHEN** 服务端收到 `battle:complete` 事件且 `result === 'victory'`
- **THEN** 服务端执行以下流程：
  1. 获取房间内所有玩家列表
  2. 过滤出 `isOnline === true && isAI === false` 的玩家
  3. 对每个有资格的玩家调用 `LootSystem.rollDungeonReward(dungeonId, player)`
  4. 将掉落结果通过 `socket.emit('battle:loot', { playerId, items })` 单独发送

#### Scenario: 战斗失败不掉落
- **WHEN** 服务端收到 `battle:complete` 事件且 `result === 'defeat'`
- **THEN** 不执行任何掉落计算
- **AND** 不发送 `battle:loot` 事件

#### Scenario: 所有玩家都断线
- **WHEN** 服务端收到 `battle:complete`
- **AND** 所有真人玩家均已断线
- **THEN** 不执行任何掉落计算

#### Scenario: 部分玩家断线
- **WHEN** 4 人副本中 2 人在线、1 人断线、1 人 AI
- **THEN** 仅为 2 名在线玩家计算掉落
- **AND** 断线玩家和 AI 角色不产生掉落

---

## UNCHANGED Behaviors

### 在线玩家资格判定
个人掉落仅为 `isOnline === true && isAI === false` 的玩家计算（保持不变）。

### 独立掉落计算
每个有资格的玩家独立调用 `LootSystem.rollDungeonReward(dungeonId, player)`，各玩家掉落互不影响（保持不变）。

### 掉落结果单独推送
服务端通过 `battle:loot` 事件将掉落结果单独发送给对应玩家（保持不变）。

### 不修改 LootSystem 核心逻辑
`rollDungeonReward` 签名和内部实现不变（保持不变）。

### 掉落结算 UI
`LootResultModal` 显示逻辑不变，仅触发位置从 `BattleView` 迁移到 `DungeonCombatView`（保持不变）。

### 单机模式掉落
`handleWorldDrop` 和 `handleDungeonReward` 在单机模式下的行为完全不变（保持不变）。
