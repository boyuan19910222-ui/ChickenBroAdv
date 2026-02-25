# 任务清单

## 1. 资源系统配置

- [x] 1.1 在 GameData.js 中添加 resourceSystems 配置对象
- [x] 1.2 配置 rage 资源类型（显示名、颜色、产生规则、衰减规则）
- [x] 1.3 配置 mana 资源类型（保持现有行为）
- [x] 1.4 预留 energy 资源类型配置结构

## 2. 角色数据结构

- [x] 2.1 在 CharacterSystem.createCharacter() 中初始化 resource 对象
- [x] 2.2 根据职业 resourceType 设置正确的资源类型和初始值
- [x] 2.3 添加存档迁移逻辑（旧存档兼容）

## 3. 技能数据更新

- [x] 3.1 为战士技能添加 resourceCost 字段（heroicStrike、shieldBlock、charge）
- [x] 3.2 为现有法师技能添加 resourceCost 字段
- [x] 3.3 为现有其他职业技能添加 resourceCost 字段

## 4. 怒气产生逻辑

- [x] 4.1 在 CombatSystem 中添加 generateResource() 方法
- [x] 4.2 在 playerAttack() 中调用怒气产生（普攻 +8，暴击 ×1.5）
- [x] 4.3 在 enemyTurn() 玩家受击时调用怒气产生（+5）
- [x] 4.4 添加怒气上限检查（不超过 max）

## 5. 技能消耗逻辑

- [x] 5.1 修改 playerUseSkill() 使用 resourceCost 替代 manaCost
- [x] 5.2 添加资源类型匹配检查
- [x] 5.3 更新资源不足提示信息（根据资源类型显示）

## 6. 战斗初始化

- [x] 6.1 在 startCombat() 中停止脱战计时，保留当前资源值
- [x] 6.2 所有资源类型在连续战斗中保持当前值（怒气继承、法力继承）

## 7. 怒气衰减系统

- [x] 7.1 添加 outOfCombatTime 追踪脱战时间
- [x] 7.2 在 update() 中实现衰减逻辑（延迟 3 秒，每秒 -2）
- [x] 7.3 进入战斗时停止衰减

## 8. UI 适配

- [x] 8.1 修改资源条渲染逻辑，根据 resource.type 显示
- [x] 8.2 更新资源条颜色（怒气红色、法力蓝色）
- [x] 8.3 更新资源图标和名称显示
- [x] 8.4 更新技能按钮的资源消耗显示

## 9. 天赋系统接口

- [x] 9.1 在 TalentSystem 中添加 modifyResourceMax 效果处理
- [x] 9.2 预留天赋影响资源产生的接口
