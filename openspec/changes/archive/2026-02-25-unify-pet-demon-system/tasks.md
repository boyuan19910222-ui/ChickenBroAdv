## 1. 数据层变更

- [x] 1.1 GameData.js: 删除 petAttack 技能定义，猎人 skills 改为 4 个基础技能
- [x] 1.2 GameData.js: 删除 summonImp 技能定义，新增 summonDemon 技能（AP=2, mana=30, cooldown=0）
- [x] 1.3 GameData.js: 术士 skills 数组将 summonImp 替换为 summonDemon
- [x] 1.4 ClassMechanics.js: 术士恶魔增加 unlockLevel 字段（小鬼 1/虚空行者 4/魅魔 8/地狱猎犬 12/地狱火 16）
- [x] 1.5 ActionPointSystem.js: 删除 petAttack AP 配置，删除 summonImp，新增 summonDemon=2
- [x] 1.6 TalentData.js: 术士天赋树适配（强化小鬼等节点引用检查）

## 2. PetCombatSystem 核心重构

- [x] 2.1 删除硬编码的 PET_CONFIG 和 CLASS_PET_TYPE，新增从 ClassMechanics 读取配置创建 petInstance 的方法
- [x] 2.2 统一 petInstance 结构（含 abilities 数组、cooldown、isTimeLimited、remainingTurns 等）
- [x] 2.3 重写 performAutoAttack：实现技能池优先级选择逻辑（优先级排序 → 冷却检查 → 普攻兜底）
- [x] 2.4 新增技能冷却递减方法（每回合结束调用）
- [x] 2.5 处理地狱火限时逻辑（remainingTurns 递减，到期视为死亡）

## 3. 战斗系统集成

- [x] 3.1 CombatSystem.js: 删除内联 _petAutoAttack()，改为委托 PetCombatSystem.performAutoAttack()
- [x] 3.2 CombatSystem.js: 更新 _handleSummon() 使用新的 PetCombatSystem 创建方法
- [x] 3.3 DungeonCombatSystem.js: 更新 _handlePetSummon() 使用新的创建方法
- [x] 3.4 DungeonCombatSystem.js: 确认自动攻击路径已对齐新的 performAutoAttack
- [x] 3.5 EffectSystem.js: 适配 summonDemon 的召唤效果

## 4. 召唤选择面板 UI

- [x] 4.1 实现召唤选择弹窗组件（展示宠物/恶魔列表、解锁状态、定位描述）
- [x] 4.2 CombatView.vue: 集成召唤面板，处理猎人无天赋直接召唤 vs 有天赋弹窗
- [x] 4.3 DungeonCombatView.vue: 集成召唤面板

## 5. UI 适配与存档迁移

- [x] 5.1 CombatView.vue / DungeonCombatView.vue: 移除 petAttack 技能按钮相关逻辑
- [x] 5.2 TalentModal.vue / EffectIcons.vue: 更新 emoji 映射和效果名称（summonDemon）
- [x] 5.3 存档迁移：加载旧存档时 summonImp→summonDemon、移除 petAttack
