## ADDED Requirements

### Requirement: 完整的9大职业配置
系统 SHALL 在 GameData.classes 中提供完整的9个职业配置，包括战士、圣骑士、猎人、盗贼、牧师、萨满祭司、法师、术士、德鲁伊。

#### Scenario: 获取所有可用职业
- **WHEN** 系统加载职业数据
- **THEN** GameData.classes 包含9个职业的完整配置
- **AND** 每个职业具有唯一的 id 标识符

#### Scenario: 验证职业配置完整性
- **WHEN** 访问任意职业配置
- **THEN** 配置 MUST 包含 id、name、description、emoji、baseStats、growthPerLevel、skills 字段

### Requirement: 职业基础属性配置
每个职业 SHALL 定义基础属性值，反映其角色定位和特性。

#### Scenario: 坦克职业属性特征
- **WHEN** 查看战士或圣骑士的 baseStats
- **THEN** health 和 stamina 值高于其他职业
- **AND** strength 值处于中高水平

#### Scenario: 远程魔法职业属性特征
- **WHEN** 查看法师、术士或牧师的 baseStats
- **THEN** intellect 和 mana 值高于物理职业
- **AND** health 值相对较低

#### Scenario: 敏捷职业属性特征
- **WHEN** 查看猎人、盗贼或德鲁伊的 baseStats
- **THEN** agility 值高于其他职业

### Requirement: 职业等级成长配置
每个职业 SHALL 定义每级属性成长值，确保职业特性随等级强化。

#### Scenario: 属性成长计算
- **WHEN** 角色升级时
- **THEN** 系统使用 growthPerLevel 中的值增加对应属性
- **AND** 成长值反映职业定位（坦克成长更多生命，法系成长更多智力）

### Requirement: 职业角色定位标识
每个职业 SHALL 定义其可承担的角色定位（坦克/DPS/治疗）。

#### Scenario: 查看职业角色定位
- **WHEN** 访问职业的 role 字段
- **THEN** 返回该职业可承担的角色数组
- **AND** 战士和圣骑士包含 'tank' 角色
- **AND** 牧师包含 'healer' 角色
- **AND** 法师、术士、盗贼、猎人包含 'dps' 角色

#### Scenario: 混合职业多角色
- **WHEN** 访问萨满祭司或德鲁伊的 role 字段
- **THEN** 返回包含多个角色定位的数组
- **AND** 德鲁伊可以是 tank、dps 或 healer

### Requirement: 职业护甲类型限制
每个职业 SHALL 定义可穿戴的护甲类型列表。

#### Scenario: 板甲职业
- **WHEN** 访问战士或圣骑士的 armorTypes
- **THEN** 包含 ['cloth', 'leather', 'mail', 'plate']

#### Scenario: 锁甲职业
- **WHEN** 访问猎人或萨满祭司的 armorTypes
- **THEN** 包含 ['cloth', 'leather', 'mail']

#### Scenario: 皮甲职业
- **WHEN** 访问盗贼或德鲁伊的 armorTypes
- **THEN** 包含 ['cloth', 'leather']

#### Scenario: 布甲职业
- **WHEN** 访问法师、术士或牧师的 armorTypes
- **THEN** 仅包含 ['cloth']

### Requirement: 职业武器类型限制
每个职业 SHALL 定义可使用的武器类型列表。

#### Scenario: 战士武器类型
- **WHEN** 访问战士的 weaponTypes
- **THEN** 包含 sword、axe、mace、polearm、dagger、shield、bow、crossbow、gun

#### Scenario: 法系职业武器类型
- **WHEN** 访问法师的 weaponTypes
- **THEN** 包含 staff、wand、dagger、sword
- **AND** 不包含 axe、mace、polearm

#### Scenario: 盗贼武器类型
- **WHEN** 访问盗贼的 weaponTypes
- **THEN** 包含 dagger、sword、mace、fist
- **AND** 不包含 polearm、staff、shield

### Requirement: 职业资源类型定义
每个职业 SHALL 定义其使用的资源类型。

#### Scenario: 怒气资源职业
- **WHEN** 访问战士的 resourceType
- **THEN** 返回 'rage'

#### Scenario: 能量资源职业
- **WHEN** 访问盗贼的 resourceType
- **THEN** 返回 'energy'

#### Scenario: 法力资源职业
- **WHEN** 访问法师、术士、牧师、猎人、萨满祭司、圣骑士或德鲁伊的 resourceType
- **THEN** 返回 'mana'

### Requirement: 职业天赋树分支定义
每个职业 SHALL 定义其3个天赋树分支的标识符。

#### Scenario: 获取职业天赋分支
- **WHEN** 访问任意职业的 talentTrees 字段
- **THEN** 返回包含3个天赋树标识符的数组

#### Scenario: 战士天赋分支
- **WHEN** 访问战士的 talentTrees
- **THEN** 返回 ['arms', 'fury', 'protection']

#### Scenario: 德鲁伊天赋分支
- **WHEN** 访问德鲁伊的 talentTrees
- **THEN** 返回 ['balance', 'feral', 'restoration']

### Requirement: 职业特殊机制标识
具有特殊机制的职业 SHALL 通过 specialMechanic 字段标识。

#### Scenario: 猎人宠物机制
- **WHEN** 访问猎人的 specialMechanic
- **THEN** 返回 'pet'

#### Scenario: 术士恶魔机制
- **WHEN** 访问术士的 specialMechanic
- **THEN** 返回 'demon'

#### Scenario: 萨满图腾机制
- **WHEN** 访问萨满祭司的 specialMechanic
- **THEN** 返回 'totem'

#### Scenario: 德鲁伊变形机制
- **WHEN** 访问德鲁伊的 specialMechanic
- **THEN** 返回 'shapeshift'

#### Scenario: 无特殊机制职业
- **WHEN** 访问战士、圣骑士、盗贼、牧师或法师的 specialMechanic
- **THEN** 返回 null
