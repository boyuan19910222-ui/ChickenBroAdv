## ADDED Requirements

### Requirement: 职业护甲类型验证
装备系统 SHALL 验证角色是否可以穿戴特定类型的护甲。

#### Scenario: 验证护甲类型
- **WHEN** 角色尝试装备护甲时
- **THEN** 系统调用 canEquipArmor(character, armor) 验证
- **AND** 检查护甲类型是否在角色职业的 armorTypes 列表中

#### Scenario: 允许装备护甲
- **WHEN** 护甲类型在职业允许列表中
- **THEN** 装备成功
- **AND** 角色属性更新

#### Scenario: 拒绝装备护甲
- **WHEN** 护甲类型不在职业允许列表中
- **THEN** 显示错误提示"你的职业无法穿戴此护甲"
- **AND** 装备操作取消

#### Scenario: 板甲职业验证
- **WHEN** 战士或圣骑士尝试装备板甲
- **THEN** 验证通过

#### Scenario: 布甲职业验证
- **WHEN** 法师尝试装备锁甲
- **THEN** 验证失败并显示错误提示

### Requirement: 职业武器类型验证
装备系统 SHALL 验证角色是否可以使用特定类型的武器。

#### Scenario: 验证武器类型
- **WHEN** 角色尝试装备武器时
- **THEN** 系统调用 canEquipWeapon(character, weapon) 验证
- **AND** 检查武器类型是否在角色职业的 weaponTypes 列表中

#### Scenario: 允许装备武器
- **WHEN** 武器类型在职业允许列表中
- **THEN** 装备成功
- **AND** 角色攻击力等属性更新

#### Scenario: 拒绝装备武器
- **WHEN** 武器类型不在职业允许列表中
- **THEN** 显示错误提示"你的职业无法使用此武器"
- **AND** 装备操作取消

#### Scenario: 法师武器验证
- **WHEN** 法师尝试装备斧头
- **THEN** 验证失败并显示错误提示

#### Scenario: 战士武器验证
- **WHEN** 战士尝试装备任意近战武器
- **THEN** 验证通过

### Requirement: 装备界面职业限制提示
装备界面 SHALL 显示职业装备限制信息。

#### Scenario: 显示不可装备提示
- **WHEN** 玩家查看无法装备的物品
- **THEN** 物品显示灰色或带有警告标识
- **AND** 悬停时显示"需要：可穿戴[护甲/武器]类型的职业"

#### Scenario: 显示可装备提示
- **WHEN** 玩家查看可装备的物品
- **THEN** 物品正常显示
- **AND** 可以直接点击装备

### Requirement: 装备类型定义
系统 SHALL 定义完整的护甲和武器类型枚举。

#### Scenario: 护甲类型枚举
- **WHEN** 访问护甲类型定义
- **THEN** 包含 cloth（布甲）、leather（皮甲）、mail（锁甲）、plate（板甲）

#### Scenario: 武器类型枚举
- **WHEN** 访问武器类型定义
- **THEN** 包含 sword（剑）、axe（斧）、mace（锤）、dagger（匕首）、staff（法杖）、polearm（长柄）、wand（魔杖）、bow（弓）、gun（枪械）、crossbow（弩）、fist（拳套）、shield（盾牌）

### Requirement: 装备数据扩展
装备数据 SHALL 包含类型字段供验证使用。

#### Scenario: 护甲数据结构
- **WHEN** 访问护甲装备数据
- **THEN** 装备 MUST 包含 armorType 字段
- **AND** armorType 值为 cloth/leather/mail/plate 之一

#### Scenario: 武器数据结构
- **WHEN** 访问武器装备数据
- **THEN** 装备 MUST 包含 weaponType 字段
- **AND** weaponType 值为定义的武器类型之一
