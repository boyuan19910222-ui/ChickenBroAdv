## ADDED Requirements

### Requirement: Effect 数组结构
每个技能 SHALL 使用 `effects: []` 数组来定义技能附带的所有效果。一个技能可以有 0 个或多个效果。

每个效果对象 MUST 包含 `type` 字段，支持的 type 为：`dot`, `hot`, `buff`, `debuff`, `shield`, `cc`, `summon`。

#### Scenario: 多效果技能
- **WHEN** 技能定义了 `effects: [{ type: 'dot', ... }, { type: 'debuff', ... }]`
- **THEN** 释放技能时 SHALL 依次施加所有效果到对应目标

#### Scenario: 无效果技能
- **WHEN** 技能 `effects` 为空数组
- **THEN** 技能仅造成 damage/heal 的直接数值效果

### Requirement: DOT 效果定义与结算
DOT (Damage Over Time) 效果 SHALL 在目标身上施加持续伤害。

DOT 效果对象格式：`{ type: 'dot', name: string, damageType: string, tickDamage: number, duration: number }`

#### Scenario: DOT 施加
- **WHEN** 技能释放成功且 effects 中包含 type='dot' 的效果
- **THEN** 系统 SHALL 在目标的 debuffs 列表中添加该 DOT 效果
- **THEN** DOT 的 remainingDuration 初始化为 duration 值

#### Scenario: DOT 回合结束结算
- **WHEN** 回合结束阶段
- **THEN** 系统 SHALL 遍历所有单位的 debuffs 列表
- **THEN** 对每个 type='dot' 的 debuff，造成 tickDamage 伤害
- **THEN** remainingDuration 减 1
- **THEN** 若 remainingDuration 降为 0，移除该 DOT

#### Scenario: DOT 施放当回合不触发
- **WHEN** DOT 在某回合被施加到目标
- **THEN** 该 DOT 在本回合结束时不结算（第一次 tick 在下回合结束）

#### Scenario: 同名 DOT 刷新
- **WHEN** 对已有同名 DOT 的目标再次施加同名 DOT
- **THEN** 系统 SHALL 刷新 remainingDuration 为新的 duration 值（不叠加）

### Requirement: HOT 效果定义与结算
HOT (Heal Over Time) 效果 SHALL 在目标身上施加持续治疗。

HOT 效果对象格式：`{ type: 'hot', name: string, tickHeal: number, duration: number }`

#### Scenario: HOT 施加
- **WHEN** 技能释放成功且 effects 中包含 type='hot' 的效果
- **THEN** 系统 SHALL 在目标的 buffs 列表中添加该 HOT 效果
- **THEN** HOT 的 remainingDuration 初始化为 duration 值

#### Scenario: HOT 回合结束结算
- **WHEN** 回合结束阶段
- **THEN** 系统 SHALL 遍历所有单位的 buffs 列表
- **THEN** 对每个 type='hot' 的 buff，恢复 tickHeal 生命值
- **THEN** remainingDuration 减 1
- **THEN** 若 remainingDuration 降为 0，移除该 HOT

#### Scenario: HOT 施放当回合不触发
- **WHEN** HOT 在某回合被施加到目标
- **THEN** 该 HOT 在本回合结束时不结算（第一次 tick 在下回合结束）

### Requirement: Buff 效果定义与结算
Buff 效果 SHALL 在目标身上施加正面增益。

Buff 效果对象格式：`{ type: 'buff', name: string, stat: string|null, value: number, duration: number }`

#### Scenario: Buff 施加
- **WHEN** 技能释放成功且 effects 中包含 type='buff' 的效果
- **THEN** 系统 SHALL 在目标的 buffs 列表中添加该 buff
- **THEN** 若 buff 有 stat 字段，SHALL 将 stat 对应属性增加 value（百分比或绝对值）

#### Scenario: Buff 持续时间递减
- **WHEN** 回合结束阶段
- **THEN** 所有 buff 的 remainingDuration 减 1
- **THEN** 若 remainingDuration 降为 0，移除该 buff 并撤销 stat 加成

#### Scenario: 持久 Buff
- **WHEN** buff 的 duration 设为 99 或 -1
- **THEN** 该 buff 视为持久效果，不因回合递减而移除

### Requirement: Debuff 效果定义与结算
Debuff 效果 SHALL 在目标身上施加负面减益。

Debuff 效果对象格式：`{ type: 'debuff', name: string, stat: string|null, value: number, duration: number }`

#### Scenario: Debuff 施加
- **WHEN** 技能释放成功且 effects 中包含 type='debuff' 的效果
- **THEN** 系统 SHALL 在目标的 debuffs 列表中添加该 debuff

#### Scenario: Debuff 持续时间递减
- **WHEN** 回合结束阶段
- **THEN** 所有 debuff 的 remainingDuration 减 1
- **THEN** 若 remainingDuration 降为 0，移除该 debuff 并撤销 stat 减益

### Requirement: Shield 效果
Shield 效果 SHALL 在目标身上创建伤害吸收盾。

Shield 效果对象格式：`{ type: 'shield', name: string, absorbAmount: number, duration: number }`

#### Scenario: Shield 吸收伤害
- **WHEN** 拥有 shield 效果的单位受到伤害
- **THEN** 系统 SHALL 优先从 shield 的 absorbAmount 中扣除伤害
- **THEN** 若 absorbAmount 降为 0，移除该 shield
- **THEN** 若伤害超出 absorbAmount，剩余伤害正常扣血

#### Scenario: Shield 到期移除
- **WHEN** 回合结束阶段
- **THEN** shield 的 remainingDuration 减 1
- **THEN** 若 remainingDuration 降为 0，移除该 shield（即使还有剩余吸收量）

### Requirement: CC 效果
CC (Crowd Control) 效果 SHALL 限制目标的行动能力。

CC 效果对象格式：`{ type: 'cc', ccType: 'stun'|'fear'|'root'|'slow', duration: number }`

#### Scenario: Stun 眩晕
- **WHEN** 目标被施加 ccType='stun' 的效果
- **THEN** 目标在 duration 回合内不能行动（跳过行动阶段）

#### Scenario: Fear 恐惧
- **WHEN** 目标被施加 ccType='fear' 的效果
- **THEN** 目标在 duration 回合内行动随机化（随机攻击或不行动）

#### Scenario: CC 持续时间递减
- **WHEN** 回合结束阶段
- **THEN** CC 效果的 remainingDuration 减 1
- **THEN** 若 remainingDuration 降为 0，移除该 CC 效果

### Requirement: Summon 效果
Summon 效果 SHALL 召唤一个可行动的实体。

Summon 效果对象格式：`{ type: 'summon', summonId: string, duration: number }`

#### Scenario: 召唤物创建
- **WHEN** 技能释放成功且 effects 中包含 type='summon' 的效果
- **THEN** 系统 SHALL 创建一个 summonId 对应的实体加入战场
- **THEN** 召唤物在 duration 回合后消失（duration=-1 为永久）

### Requirement: 回合结束统一结算流程
每回合结束时 SHALL 按以下顺序结算所有效果：

1. DOT 结算（遍历所有单位 debuffs 中 type='dot' 的效果）
2. HOT 结算（遍历所有单位 buffs 中 type='hot' 的效果）
3. Buff/Debuff/Shield/CC duration 递减和到期移除
4. 资源自然恢复/衰减
5. 检查战斗结束条件

#### Scenario: 完整回合结束流程
- **WHEN** 所有单位完成本回合行动
- **THEN** 系统 SHALL 按上述 1~5 步骤顺序执行回合结束结算

#### Scenario: DOT 致死判定
- **WHEN** DOT 结算造成的伤害使目标 HP ≤ 0
- **THEN** 目标 SHALL 标记为死亡
- **THEN** 后续 HOT 结算跳过已死亡单位

### Requirement: 开放世界效果处理
开放世界 CombatSystem SHALL 支持与副本相同的效果处理逻辑。

#### Scenario: 开放世界 DOT 结算
- **WHEN** 开放世界战斗中玩家或敌人身上有 DOT 效果
- **THEN** 每个战斗回合结束时 SHALL 结算 DOT 伤害

#### Scenario: 开放世界 buff/debuff 持续
- **WHEN** 开放世界战斗中施加了 buff/debuff
- **THEN** buff/debuff SHALL 在战斗回合结束时递减 duration 并到期移除
