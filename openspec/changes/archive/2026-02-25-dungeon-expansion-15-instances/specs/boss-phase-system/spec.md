## MODIFIED Requirements

### Requirement: BOSS血量阶段
系统应根据BOSS血量百分比触发阶段转换。

#### Scenario: 阶段1（满血阶段）
- **WHEN** BOSS血量在100%-70%之间（或自定义阈值）
- **THEN** BOSS处于阶段1
- **THEN** 使用阶段1技能组

#### Scenario: 支持双 BOSS 战
- **WHEN** 遭遇战配置包含多个 BOSS 实体
- **THEN** 系统 SHALL 支持同时管理多个 BOSS 的阶段状态
- **THEN** 每个 BOSS SHALL 独立跟踪 currentPhase、HP、行动次数

#### Scenario: BOSS isDown 机制
- **WHEN** BOSS HP 降至 0 且配置了 `supportIsDown: true`
- **THEN** 系统 SHALL 设置 `isDown: true` 而非移除该 BOSS
- **THEN** 倒下的 BOSS SHALL 不能行动、不能被攻击
- **THEN** 倒下的 BOSS SHALL 保留在战场上（显示倒地状态）

#### Scenario: resurrect 阶段事件
- **WHEN** 阶段转换的 `onEnter.type` 为 `'resurrect'`
- **THEN** 系统 SHALL 查找目标 BOSS 并将其 `isDown` 设为 false
- **THEN** 目标 BOSS 的 `currentHp` SHALL 设为 `maxHp * onEnter.hpPercent`
- **THEN** 如果 resurrect 配置了 telegraph，SHALL 先进入蓄力状态

#### Scenario: 武器切换阶段（斯莫特模式）
- **WHEN** BOSS 阶段转换且各阶段定义了不同的技能组
- **THEN** 系统 SHALL 切换 BOSS 的可用技能为新阶段的技能组
- **THEN** 阶段转换 SHALL 显示 onEnter.message

### Requirement: 阶段转换事件
系统应在阶段转换时触发特殊事件。

#### Scenario: 召唤援军
- **WHEN** BOSS阶段转换配置包含 `onEnter.type: 'summon'`
- **THEN** 在指定位置生成额外敌人

#### Scenario: 技能预告
- **WHEN** BOSS阶段转换配置包含大招
- **THEN** 显示即将释放的大招预告

#### Scenario: 变身/增强
- **WHEN** BOSS阶段转换配置包含 `onEnter.type: 'transform'` 或 `'buff'`
- **THEN** 应用对应的属性变化

#### Scenario: 复活事件
- **WHEN** BOSS 阶段转换配置包含 `onEnter.type: 'resurrect'`
- **THEN** 系统 SHALL 复活目标 BOSS（从 isDown 状态恢复）
