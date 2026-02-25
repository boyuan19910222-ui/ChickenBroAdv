## ADDED Requirements

### Requirement: 天赋数据结构
系统 SHALL 在 GameData.talents 或独立的 TalentData 中提供完整的天赋配置，按职业和天赋树分支组织。

#### Scenario: 获取职业天赋数据
- **WHEN** 访问天赋数据中的特定职业
- **THEN** 返回该职业的3个天赋树配置
- **AND** 每个天赋树包含 name、description 和 talents 数组

#### Scenario: 验证天赋树结构
- **WHEN** 访问任意天赋树配置
- **THEN** 配置 MUST 包含 name（天赋树名称）、description（描述）、talents（天赋列表）

### Requirement: 天赋节点配置
每个天赋节点 SHALL 包含完整的属性定义。

#### Scenario: 天赋节点基础属性
- **WHEN** 访问任意天赋节点
- **THEN** 节点 MUST 包含 id、name、description、tier、maxPoints 字段
- **AND** tier 表示天赋所在层级（1-7）
- **AND** maxPoints 表示最大可投入点数（通常为1、2、3或5）

#### Scenario: 天赋节点效果
- **WHEN** 天赋节点有效果定义
- **THEN** 节点包含 effect 对象描述天赋效果
- **AND** effect 包含 type（效果类型）和 value（效果数值）

### Requirement: 天赋层级解锁规则
天赋系统 SHALL 定义层级解锁的点数要求。

#### Scenario: 计算层级解锁条件
- **WHEN** 玩家尝试学习特定层级的天赋
- **THEN** 系统验证该天赋树已投入足够点数
- **AND** 第N层天赋需要在该树投入至少 (N-1)*5 点

#### Scenario: 第一层天赋
- **WHEN** 玩家尝试学习第1层天赋
- **THEN** 无需前置点数要求

### Requirement: 天赋前置依赖
部分天赋 SHALL 定义前置天赋要求。

#### Scenario: 验证前置天赋
- **WHEN** 天赋节点定义了 requires 字段
- **THEN** 玩家 MUST 先学满指定的前置天赋
- **AND** requires 包含前置天赋的 id

#### Scenario: 无前置天赋
- **WHEN** 天赋节点未定义 requires 字段
- **THEN** 仅需满足层级解锁条件即可学习

### Requirement: 天赋点获取规则
系统 SHALL 定义天赋点的获取机制。

#### Scenario: 升级获得天赋点
- **WHEN** 角色达到10级及以上
- **THEN** 每升一级获得1点天赋点

#### Scenario: 计算可用天赋点
- **WHEN** 查询角色可用天赋点
- **THEN** 返回 max(0, 角色等级 - 9)

#### Scenario: 最大天赋点数
- **WHEN** 角色达到60级
- **THEN** 总共拥有51点天赋点

### Requirement: 天赋分配状态记录
系统 SHALL 记录角色的天赋分配状态。

#### Scenario: 存储天赋分配
- **WHEN** 角色分配天赋点
- **THEN** 系统在角色数据中记录每个天赋的已投入点数
- **AND** 记录格式为 { talentId: investedPoints }

#### Scenario: 读取天赋分配
- **WHEN** 加载角色数据
- **THEN** 可以恢复角色的完整天赋分配状态

### Requirement: 天赋重置功能
系统 SHALL 支持天赋点重置。

#### Scenario: 重置单个天赋树
- **WHEN** 玩家请求重置特定天赋树
- **THEN** 该天赋树所有点数归还
- **AND** 其他天赋树不受影响

#### Scenario: 重置所有天赋
- **WHEN** 玩家请求重置所有天赋
- **THEN** 所有天赋树点数归还
- **AND** 可用天赋点恢复到 max(0, 等级 - 9)

### Requirement: 战士天赋树配置
战士 SHALL 拥有武器、狂暴、防护三个天赋树。

#### Scenario: 武器天赋树
- **WHEN** 访问战士的 arms 天赋树
- **THEN** 包含提升武器伤害和战斗技巧的天赋
- **AND** 最终天赋为"死亡之愿"或类似高级技能

#### Scenario: 狂暴天赋树
- **WHEN** 访问战士的 fury 天赋树
- **THEN** 包含提升暴击和攻击速度的天赋

#### Scenario: 防护天赋树
- **WHEN** 访问战士的 protection 天赋树
- **THEN** 包含提升防御和仇恨生成的天赋

### Requirement: 法师天赋树配置
法师 SHALL 拥有奥术、火焰、冰霜三个天赋树。

#### Scenario: 奥术天赋树
- **WHEN** 访问法师的 arcane 天赋树
- **THEN** 包含提升奥术伤害和法力效率的天赋

#### Scenario: 火焰天赋树
- **WHEN** 访问法师的 fire 天赋树
- **THEN** 包含提升火焰伤害和暴击的天赋

#### Scenario: 冰霜天赋树
- **WHEN** 访问法师的 frost 天赋树
- **THEN** 包含提升冰霜伤害和控制能力的天赋

### Requirement: 德鲁伊天赋树配置
德鲁伊 SHALL 拥有平衡、野性、恢复三个天赋树。

#### Scenario: 平衡天赋树
- **WHEN** 访问德鲁伊的 balance 天赋树
- **THEN** 包含提升自然和奥术法术伤害的天赋

#### Scenario: 野性天赋树
- **WHEN** 访问德鲁伊的 feral 天赋树
- **THEN** 包含提升变形形态战斗能力的天赋

#### Scenario: 恢复天赋树
- **WHEN** 访问德鲁伊的 restoration 天赋树
- **THEN** 包含提升治疗能力的天赋
