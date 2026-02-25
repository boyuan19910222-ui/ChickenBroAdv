## MODIFIED Requirements

### Requirement: Effect 数组结构
每个技能 SHALL 使用 `effects: []` 数组来定义技能附带的所有效果。一个技能可以有 0 个或多个效果。

每个效果对象 MUST 包含 `type` 字段，支持的 type 为：`dot`, `hot`, `buff`, `debuff`, `shield`, `cc`, `summon`。

#### Scenario: 多效果技能
- **WHEN** 技能定义了 `effects: [{ type: 'dot', ... }, { type: 'debuff', ... }]`
- **THEN** 释放技能时 SHALL 依次施加所有效果到对应目标

#### Scenario: 无效果技能
- **WHEN** 技能 `effects` 为空数组
- **THEN** 技能仅造成 damage/heal 的直接数值效果

### Requirement: Buff 效果支持 special 字段扩展
Buff 效果 SHALL 支持可选的 `special` 字段，用于定义特殊行为。

#### Scenario: spellReflect 特殊 buff
- **WHEN** buff 定义了 `special: 'spellReflect'`
- **WHEN** 拥有该 buff 的目标受到非物理伤害
- **THEN** 系统 SHALL 将伤害反射回施法者
- **THEN** 目标 SHALL 不受到该次伤害

#### Scenario: physicalImmune 特殊 buff
- **WHEN** buff 定义了 `special: 'physicalImmune'`
- **WHEN** 拥有该 buff 的目标受到 `damageType: 'physical'` 的攻击
- **THEN** 伤害 SHALL 被无效化（战斗日志显示"免疫"）

#### Scenario: magicImmune 特殊 buff
- **WHEN** buff 定义了 `special: 'magicImmune'`
- **WHEN** 拥有该 buff 的目标受到非物理伤害
- **THEN** 伤害 SHALL 被无效化（战斗日志显示"免疫"）

### Requirement: CC 效果支持 charm 类型
CC 效果 SHALL 支持 `ccType: 'charm'`，使被控目标暂时变为敌方。

#### Scenario: charm 使队友变敌人
- **WHEN** 玩家队伍成员被施加 `ccType: 'charm'` 效果
- **THEN** 被控成员 SHALL 在 duration 期间视为敌方单位
- **THEN** 被控成员 SHALL 使用普通攻击随机攻击队友

#### Scenario: charm 到期恢复
- **WHEN** charm 效果的 remainingDuration 降为 0
- **THEN** 被控成员 SHALL 恢复为友方单位

#### Scenario: charm 与已有 CC 的优先级
- **WHEN** 目标同时受到 charm 和 stun
- **THEN** stun SHALL 优先（stun 期间不行动，charm 不触发攻击队友行为）
