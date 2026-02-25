## ADDED Requirements

### Requirement: 职业特殊机制框架
系统 SHALL 提供可扩展的职业特殊机制框架，支持宠物、恶魔、图腾、变形四种机制。

#### Scenario: 加载职业机制
- **WHEN** 角色选择具有特殊机制的职业
- **THEN** 系统自动加载对应的机制模块
- **AND** 机制通过 ClassMechanics[specialMechanic] 访问

#### Scenario: 无特殊机制职业
- **WHEN** 角色选择无特殊机制的职业
- **THEN** 不加载任何额外机制模块

### Requirement: 猎人宠物系统
猎人 SHALL 拥有完整的宠物驯养和管理系统。

#### Scenario: 驯养野兽
- **WHEN** 猎人对可驯养的野兽使用驯服技能
- **THEN** 开始驯服过程（持续20秒）
- **AND** 驯服成功后野兽成为猎人的宠物

#### Scenario: 宠物管理
- **WHEN** 猎人查看宠物管理界面
- **THEN** 显示已驯养的宠物列表
- **AND** 可以选择当前出战的宠物

#### Scenario: 宠物战斗
- **WHEN** 猎人进入战斗
- **THEN** 当前宠物自动参与战斗
- **AND** 宠物有独立的生命值和技能

#### Scenario: 宠物类型配置
- **WHEN** 访问宠物系统配置
- **THEN** 包含可驯养野兽类型列表
- **AND** 每种类型定义基础属性和特殊能力

### Requirement: 术士恶魔召唤系统
术士 SHALL 拥有完整的恶魔召唤和控制系统。

#### Scenario: 召唤恶魔
- **WHEN** 术士使用恶魔召唤技能
- **THEN** 消耗灵魂碎片召唤指定类型的恶魔
- **AND** 同一时间只能有一个恶魔存在

#### Scenario: 恶魔类型
- **WHEN** 术士学习召唤技能
- **THEN** 可以召唤小鬼（远程伤害）、虚空行者（坦克）、魅魔（控制）、地狱猎犬（反法术）

#### Scenario: 恶魔控制
- **WHEN** 恶魔被召唤后
- **THEN** 术士可以控制恶魔的攻击目标
- **AND** 恶魔有独立的技能可供使用

#### Scenario: 灵魂碎片机制
- **WHEN** 术士击杀敌人时使用吸取灵魂
- **THEN** 获得灵魂碎片物品
- **AND** 灵魂碎片用于召唤恶魔和复活技能

### Requirement: 萨满图腾系统
萨满祭司 SHALL 拥有完整的图腾放置和管理系统。

#### Scenario: 放置图腾
- **WHEN** 萨满祭司使用图腾技能
- **THEN** 在脚下放置对应类型的图腾
- **AND** 图腾持续一定时间后消失

#### Scenario: 图腾类型分类
- **WHEN** 访问图腾系统配置
- **THEN** 图腾分为四系：火焰、大地、水、风
- **AND** 每系同时只能放置一个图腾

#### Scenario: 火焰图腾
- **WHEN** 萨满祭司放置火焰图腾
- **THEN** 图腾产生伤害或增益效果
- **AND** 包含灼热图腾、火焰新星图腾等

#### Scenario: 大地图腾
- **WHEN** 萨满祭司放置大地图腾
- **THEN** 图腾产生防御或控制效果
- **AND** 包含石肤图腾、地缚图腾等

#### Scenario: 水之图腾
- **WHEN** 萨满祭司放置水之图腾
- **THEN** 图腾产生治疗或法力效果
- **AND** 包含治疗之泉图腾、法力之泉图腾等

#### Scenario: 风之图腾
- **WHEN** 萨满祭司放置风之图腾
- **THEN** 图腾产生增益或辅助效果
- **AND** 包含风怒图腾、风之优雅图腾等

#### Scenario: 图腾生命值
- **WHEN** 敌人攻击图腾
- **THEN** 图腾有独立的生命值
- **AND** 生命值归零时图腾被摧毁

### Requirement: 德鲁伊变形系统
德鲁伊 SHALL 拥有完整的动物变形系统。

#### Scenario: 变形为熊形态
- **WHEN** 德鲁伊使用熊形态技能
- **THEN** 变形为熊
- **AND** 生命值大幅提升，获得坦克相关技能

#### Scenario: 变形为猎豹形态
- **WHEN** 德鲁伊使用猎豹形态技能
- **THEN** 变形为豹子
- **AND** 获得潜行能力和连击系统，技能类似盗贼

#### Scenario: 变形为海豹形态
- **WHEN** 德鲁伊使用水栖形态技能
- **THEN** 变形为海豹
- **AND** 可以在水下呼吸和快速游泳

#### Scenario: 变形为飞行形态
- **WHEN** 德鲁伊使用飞行形态技能（如可用）
- **THEN** 变形为鸟类
- **AND** 获得飞行能力

#### Scenario: 取消变形
- **WHEN** 德鲁伊在变形状态下使用取消变形技能
- **THEN** 恢复人形态
- **AND** 恢复人形态技能栏

#### Scenario: 形态技能栏切换
- **WHEN** 德鲁伊切换形态
- **THEN** 技能栏自动切换为对应形态的技能
- **AND** 不同形态使用不同的资源（熊用怒气，豹用能量，人形用法力）

### Requirement: 特殊机制数据配置
系统 SHALL 提供特殊机制的数据配置结构。

#### Scenario: 宠物数据配置
- **WHEN** 访问 ClassMechanics.pet
- **THEN** 返回包含 petTypes（宠物类型）、abilities（宠物技能）的配置

#### Scenario: 恶魔数据配置
- **WHEN** 访问 ClassMechanics.demon
- **THEN** 返回包含 demonTypes（恶魔类型）、summonCosts（召唤消耗）的配置

#### Scenario: 图腾数据配置
- **WHEN** 访问 ClassMechanics.totem
- **THEN** 返回包含 totemTypes（图腾类型）按四系分类的配置

#### Scenario: 变形数据配置
- **WHEN** 访问 ClassMechanics.shapeshift
- **THEN** 返回包含 forms（变形形态）及各形态技能的配置
