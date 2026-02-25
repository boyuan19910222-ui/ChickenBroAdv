## ADDED Requirements

### Requirement: ClassMechanics 作为宠物/恶魔唯一数据源
PetCombatSystem SHALL 从 ClassMechanics 读取宠物（hunter）和恶魔（warlock）的配置数据来创建宠物实例。PetCombatSystem 中 SHALL NOT 存在硬编码的宠物属性数据（PET_CONFIG）。

#### Scenario: 猎人召唤默认宠物
- **WHEN** 猎人使用「召唤野兽」且未解锁野兽控制天赋 T4
- **THEN** 系统从 ClassMechanics.pet.defaultPet 读取狼的配置创建宠物实例

#### Scenario: 猎人召唤高级宠物
- **WHEN** 猎人使用「召唤野兽」且已解锁野兽控制天赋 T4 并选择了熊
- **THEN** 系统从 ClassMechanics.pet.advancedPets.bear 读取配置创建宠物实例

#### Scenario: 术士召唤恶魔
- **WHEN** 术士使用「召唤恶魔」并选择虚空行者
- **THEN** 系统从 ClassMechanics.demon.demonTypes.voidwalker 读取配置创建恶魔实例

### Requirement: 猎人基础技能不包含 petAttack
猎人的 skills 数组 SHALL 为 `['arcaneShot', 'serpentSting', 'huntersMark', 'summonPet']`，SHALL NOT 包含 petAttack。GameData.skills 中 SHALL NOT 存在 petAttack 技能定义。

#### Scenario: 猎人技能列表
- **WHEN** 创建猎人角色
- **THEN** 角色拥有 4 个基础技能：奥术射击、毒蛇钉刺、猎人印记、召唤野兽

### Requirement: 术士 summonDemon 基础技能
术士 SHALL 拥有 `summonDemon` 基础技能替代 `summonImp`。summonDemon 的属性：AP=2, mana=30, cooldown=0, skillType=summon, targetType=self。点击后 SHALL 弹出恶魔选择面板。

#### Scenario: 术士技能列表
- **WHEN** 创建术士角色
- **THEN** 角色拥有 7 个基础技能：暗影箭、腐蚀术、献祭、恐惧、生命吸取、痛苦诅咒、召唤恶魔

#### Scenario: 术士使用召唤恶魔
- **WHEN** 术士在战斗中使用「召唤恶魔」
- **THEN** 弹出恶魔选择面板，显示所有恶魔及其解锁状态

### Requirement: 术士恶魔按等级解锁
术士可召唤的恶魔 SHALL 按以下等级解锁：Lv1 小鬼、Lv4 虚空行者、Lv8 魅魔、Lv12 地狱猎犬、Lv16 地狱火。未达到等级的恶魔在选择面板中 SHALL 显示为锁定状态且不可选择。

#### Scenario: Lv1 术士召唤恶魔
- **WHEN** Lv1 术士使用「召唤恶魔」
- **THEN** 只有小鬼可选，其他 4 种恶魔显示锁定

#### Scenario: Lv8 术士召唤恶魔
- **WHEN** Lv8 术士使用「召唤恶魔」
- **THEN** 小鬼、虚空行者、魅魔可选，地狱猎犬和地狱火显示锁定

### Requirement: 宠物纯自动攻击
宠物/恶魔 SHALL 在每回合主人行动结束后自动攻击一次。攻击 SHALL 优先使用技能池中未冷却的最高优先级技能，若所有技能冷却中则执行普通攻击。

#### Scenario: 宠物有可用技能
- **WHEN** 宠物拥有技能 bite(优先级2, cd=0) 和 claw(优先级1, cd=0)
- **THEN** 宠物使用 bite（更高优先级），bite 进入冷却

#### Scenario: 宠物所有技能冷却中
- **WHEN** 宠物所有技能 currentCooldown > 0
- **THEN** 宠物执行普通攻击（使用 base damage）

#### Scenario: 技能冷却递减
- **WHEN** 一个回合结束
- **THEN** 宠物所有技能的 currentCooldown 减少 1（最低为 0）

### Requirement: 统一自动攻击路径
野外战斗（CombatSystem）和副本战斗（DungeonCombatSystem）SHALL 都通过 PetCombatSystem.performAutoAttack() 执行宠物自动攻击。CombatSystem 中 SHALL NOT 存在内联的宠物自动攻击逻辑。

#### Scenario: 野外战斗宠物自动攻击
- **WHEN** 野外战斗中玩家完成一次行动且宠物存活
- **THEN** 调用 PetCombatSystem.performAutoAttack() 执行宠物攻击

#### Scenario: 副本战斗宠物自动攻击
- **WHEN** 副本战斗中玩家方单位完成回合且拥有存活宠物
- **THEN** 调用 PetCombatSystem.performAutoAttack() 执行宠物攻击

### Requirement: 宠物死亡后需重新召唤
宠物/恶魔死亡后 SHALL 标记为 isAlive=false，玩家 SHALL 需要重新使用「召唤野兽」或「召唤恶魔」技能（消耗 AP 和 mana）来召唤新宠物。

#### Scenario: 宠物阵亡
- **WHEN** 宠物 HP 降至 0
- **THEN** 宠物标记为死亡，UI 显示灰化卡片 + "已阵亡"

#### Scenario: 重新召唤宠物
- **WHEN** 宠物已死亡，玩家使用「召唤野兽/恶魔」
- **THEN** 消耗 AP 和 mana，创建新的宠物实例替换死亡实例

#### Scenario: 地狱火持续时间到期
- **WHEN** 地狱火的 remainingTurns 降至 0
- **THEN** 地狱火视为死亡，需重新召唤

### Requirement: 召唤选择面板
猎人（有野兽控制天赋时）和术士使用召唤技能时 SHALL 弹出统一的召唤选择面板。面板 SHALL 显示每个宠物/恶魔的名称、emoji、定位描述和解锁状态。猎人无天赋时直接召唤狼不弹窗。

#### Scenario: 猎人无天赋直接召唤
- **WHEN** 猎人使用「召唤野兽」且未解锁野兽控制天赋 T4
- **THEN** 直接召唤狼，不弹出选择面板

#### Scenario: 猎人有天赋弹窗选择
- **WHEN** 猎人使用「召唤野兽」且已解锁野兽控制天赋 T4
- **THEN** 弹出选择面板，显示狼、熊、猪、鹰四个选项

#### Scenario: 术士弹窗选择
- **WHEN** 术士使用「召唤恶魔」
- **THEN** 弹出选择面板，显示 5 种恶魔，未解锁的显示锁定

### Requirement: 存档兼容迁移
加载旧存档时 SHALL 自动将 skills 数组中的 `summonImp` 替换为 `summonDemon`，将 `petAttack` 从猎人 skills 中移除。

#### Scenario: 旧存档包含 summonImp
- **WHEN** 加载的存档中术士 skills 包含 summonImp
- **THEN** 自动替换为 summonDemon

#### Scenario: 旧存档包含 petAttack
- **WHEN** 加载的存档中猎人 skills 包含 petAttack
- **THEN** 自动从 skills 中移除 petAttack
