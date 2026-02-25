## MODIFIED Requirements

### Requirement: 能量战斗中恢复

能量类型资源 SHALL 在战斗中每回合结束时自动恢复。

**原行为**: 能量无战斗中恢复机制
**新行为**: 玩家回合结束时恢复 `generation.perTurn` 点能量

配置更新：
```javascript
resourceSystems.energy.generation = {
    perTurn: 15,        // 每回合恢复量
    // ...其他配置
}
```

#### Scenario: 回合结束恢复能量
- **WHEN** 盗贼回合结束
- **AND** 当前能量为 60
- **THEN** 能量变为 75（+15）

#### Scenario: 能量恢复上限检查
- **WHEN** 盗贼回合结束
- **AND** 当前能量为 95
- **AND** 最大能量为 100
- **THEN** 能量变为 100（不超过上限）

#### Scenario: 第一回合无预先恢复
- **WHEN** 战斗开始
- **AND** 盗贼初始能量为 100
- **THEN** 第一回合可用能量为 100
- **AND** 第一回合结束后能量为 100 - 消耗 + 15

---

### Requirement: 能量脱战恢复

能量类型资源 SHALL 在战斗外缓慢恢复至满值。

**原行为**: 能量无脱战恢复机制
**新行为**: 脱战后按 `generation.outOfCombat.rate` 速率恢复

配置更新：
```javascript
resourceSystems.energy.generation = {
    perTurn: 15,
    outOfCombat: {
        enabled: true,
        rate: 20,       // 每秒恢复量
        delay: 1        // 脱战后延迟秒数
    }
}
```

#### Scenario: 脱战后开始恢复
- **WHEN** 战斗结束
- **AND** 当前能量为 40
- **THEN** 1 秒后开始恢复
- **AND** 每秒恢复 20 点能量

#### Scenario: 能量恢复至满停止
- **WHEN** 能量恢复至 100（满）
- **THEN** 停止恢复

#### Scenario: 进入战斗停止脱战恢复
- **WHEN** 能量正在脱战恢复中
- **AND** 进入新战斗
- **THEN** 停止脱战恢复
- **AND** 保留当前能量值

---

### Requirement: 能量初始状态

能量类型资源 SHALL 在战斗开始时保持当前值。

**原行为**: 保持不变
**新行为**: 无变化（确认行为）

#### Scenario: 战斗开始保留能量
- **WHEN** 盗贼当前能量为 80
- **AND** 开始新战斗
- **THEN** 战斗中初始能量为 80
