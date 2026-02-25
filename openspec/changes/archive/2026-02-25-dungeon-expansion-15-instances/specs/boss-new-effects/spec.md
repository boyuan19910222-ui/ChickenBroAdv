## ADDED Requirements

### Requirement: spellReflect 法术反射效果
系统 SHALL 支持 `spellReflect` 特殊 buff，使目标在持续期间反射法术伤害回施法者。

#### Scenario: 法术反射生效
- **WHEN** 目标拥有 `special: 'spellReflect'` 的 buff
- **WHEN** 该目标受到 `damageType` 不为 `'physical'` 的技能攻击
- **THEN** 系统 SHALL 将该伤害反射回施法者
- **THEN** 目标 SHALL 不受到该次伤害

#### Scenario: 物理攻击不被反射
- **WHEN** 目标拥有 spellReflect buff
- **WHEN** 该目标受到 `damageType: 'physical'` 的攻击
- **THEN** 伤害 SHALL 正常生效，不触发反射

#### Scenario: spellReflect 到期移除
- **WHEN** spellReflect buff 的 remainingDuration 降为 0
- **THEN** 系统 SHALL 移除该 buff

### Requirement: physicalImmune 物理免疫效果
系统 SHALL 支持 `physicalImmune` 特殊 buff，使目标免疫所有物理伤害。

#### Scenario: 物理免疫生效
- **WHEN** 目标拥有 `special: 'physicalImmune'` 的 buff
- **WHEN** 该目标受到 `damageType: 'physical'` 的攻击
- **THEN** 伤害 SHALL 被无效化（显示"免疫"）

#### Scenario: 法术伤害仍然生效
- **WHEN** 目标拥有 physicalImmune buff
- **WHEN** 该目标受到非物理伤害（fire/nature/shadow/frost/arcane）
- **THEN** 伤害 SHALL 正常生效

### Requirement: magicImmune 魔法免疫效果
系统 SHALL 支持 `magicImmune` 特殊 buff，使目标免疫所有非物理伤害。

#### Scenario: 魔法免疫生效
- **WHEN** 目标拥有 `special: 'magicImmune'` 的 buff
- **WHEN** 该目标受到非物理类型伤害
- **THEN** 伤害 SHALL 被无效化（显示"免疫"）

#### Scenario: 物理伤害仍然生效
- **WHEN** 目标拥有 magicImmune buff
- **WHEN** 该目标受到 `damageType: 'physical'` 的攻击
- **THEN** 伤害 SHALL 正常生效

### Requirement: charm 精神控制 CC 效果
系统 SHALL 支持 `ccType: 'charm'` 的 CC 效果，使被控目标暂时视为敌方。

#### Scenario: charm 使队友变敌人
- **WHEN** 玩家队伍成员被施加 `ccType: 'charm'` 效果
- **THEN** 被控成员 SHALL 在 duration 期间视为敌方单位
- **THEN** 被控成员 SHALL 使用普通攻击攻击随机队友

#### Scenario: charm 到期恢复
- **WHEN** charm 效果的 remainingDuration 降为 0
- **THEN** 被控成员 SHALL 恢复为友方单位
- **THEN** 被控成员 SHALL 恢复正常行动

### Requirement: resurrect 阶段事件
系统 SHALL 支持 `onEnter.type: 'resurrect'` 阶段转换事件，用于复活已倒下的 BOSS。

#### Scenario: resurrect 事件触发
- **WHEN** BOSS 阶段转换且 `onEnter.type` 为 `'resurrect'`
- **THEN** 系统 SHALL 查找 `onEnter.targetBossId` 对应的已倒下 BOSS
- **THEN** 将该 BOSS 的 `isDown` 设为 false
- **THEN** 将该 BOSS 的 `currentHp` 设为 `maxHp * onEnter.hpPercent`

#### Scenario: resurrect 可配合 telegraph
- **WHEN** resurrect 事件配置了 `telegraph.chargeRounds`
- **THEN** 系统 SHALL 先进入蓄力阶段
- **THEN** 蓄力期间显示 `onEnter.message`
- **THEN** 如果施法者在蓄力期间被击败，resurrect SHALL 不生效

### Requirement: isDown 倒下状态
系统 SHALL 支持 BOSS 的 `isDown` 状态标记，表示已倒下但未从战场移除。

#### Scenario: BOSS 标记为倒下
- **WHEN** 双 BOSS 战中某个 BOSS HP 降为 0
- **WHEN** 该 BOSS 的配置标记为支持 `isDown` 机制
- **THEN** 系统 SHALL 设置该 BOSS `isDown: true`
- **THEN** 该 BOSS SHALL 不从战场移除
- **THEN** 该 BOSS SHALL 不能行动、不能被攻击

#### Scenario: 倒下的 BOSS 被复活
- **WHEN** 倒下的 BOSS 通过 resurrect 事件复活
- **THEN** BOSS 的 `isDown` SHALL 设为 false
- **THEN** BOSS SHALL 恢复行动能力和可被攻击状态
