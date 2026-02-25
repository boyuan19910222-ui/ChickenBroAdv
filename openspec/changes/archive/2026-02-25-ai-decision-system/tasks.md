## 1. 基础设施 — 行为树引擎与注册表

- [x] 1.1 创建 `src/ai/BehaviorTree.js`：实现 selector / scored / sequence / condition / action 五种节点类型和 `tick(tree, unit, context)` 方法
- [x] 1.2 创建 `src/ai/AIRegistry.js`：实现条件/动作/评分三类函数的注册与查找

## 2. Context 构建

- [x] 2.1 创建 `src/ai/ContextBuilder.js`：实现三层 context 组装（self + battlefield + tactical），含 `normalizeSkill()` 格式归一化和 `availableSkills` 预处理

## 3. 统一技能执行器

- [x] 3.1 创建 `src/ai/SkillExecutor.js`：实现 `executeSkill(unit, skill, targets, battleContext)`，整合资源消耗、冷却管理、EffectSystem 伤害/治疗计算、效果施加、连击点、目标解析
- [x] 3.2 将 `DungeonCombatSystem` 中 AI 队友/敌人技能执行路径迁移到 SkillExecutor（玩家路径保留独立实现以支持行动点系统和 UI 交互）
- [x] 3.3 将 `CombatSystem.enemyTurn()` 中的执行逻辑迁移到 SkillExecutor（玩家 `playerUseSkill()` 保留独立实现以支持 1v1 专属 UI 和统计逻辑）

## 4. 条件/动作/评分函数

- [x] 4.1 创建 `src/ai/conditions.js`：实现通用条件函数（selfHpBelow、targetHpBelow、hasAvailableSkill、comboPointsAbove、allyHpBelow 等）
- [x] 4.2 创建 `src/ai/actions.js`：实现通用动作函数（useAttackSkill、useHealSkill、useSurvivalSkill、useTauntSkill、useBuilderSkill、useFinisherSkill、useAoeSkill 等）
- [x] 4.3 创建 `src/ai/scorers.js`：实现评分函数（damageValue、healValue、tauntValue、aoeValue、survivalValue 等）

## 5. 行为树定义

- [x] 5.1 创建 `src/ai/trees/dungeonAllyTank.js`：副本友方坦克（保命 → 仇恨维持 → 输出）
- [x] 5.2 创建 `src/ai/trees/dungeonAllyHealer.js`：副本友方治疗（紧急治疗 → 群体治疗 → 维护/输出）
- [x] 5.3 创建 `src/ai/trees/dungeonAllyDps.js`：副本友方 DPS（保命 → 输出循环，含盗贼连击点逻辑）
- [x] 5.4 创建 `src/ai/trees/dungeonEnemy.js`：副本敌方（特殊技能 → 基础攻击，基于仇恨选目标）
- [x] 5.5 创建 `src/ai/trees/bossDefault.js`：BOSS 默认（多阶段、蓄力、狂暴）
- [x] 5.6 创建 `src/ai/trees/overworldEnemy.js`：野外敌方（技能优先级选择 → 基础攻击）
- [x] 5.7 创建 `src/ai/trees/petDefault.js`：宠物默认行为

## 6. AI 决策系统入口

- [x] 6.1 创建 `src/ai/AIDecisionSystem.js`：实现 `decideAction(unit, battleState)`，按角色/类型选择行为树，调用 ContextBuilder + BehaviorTree.tick

## 7. 数据补齐

- [x] 7.1 修改 `PartyFormationSystem._createAIStats()`：补齐 AI 队友运行时字段（skillCooldowns、comboPoints、buffs、debuffs）
- [x] 7.2 为野外怪物在 `GameData.monsters` 中添加技能数据（森林兽人→兽人狂怒、哥布林→毒刃突刺、野狼→凶猛撕咬、骷髅→亡灵斩击、巨魔→巨魔重击+巨魔再生）
- [x] 7.3 实现 AI 队友资源恢复逻辑，与玩家同规则（已由 `regenerateResources()` 统一处理）

## 8. 战斗系统集成

- [x] 8.1 替换 `DungeonCombatSystem.processAIAllyTurn()`：改为调用 AIDecisionSystem + SkillExecutor，含行为树决策、技能执行、结果处理和降级攻击
- [x] 8.2 替换 `DungeonCombatSystem.handleEnemyTurn()` / `_executeEnemyAttack()`：普通敌人改为调用 AIDecisionSystem + SkillExecutor，BOSS 保留 BossPhaseSystem
- [x] 8.3 替换 `CombatSystem.enemyTurn()`：野外敌人改为调用 AIDecisionSystem + SkillExecutor，含技能选择和效果日志
- [x] 8.4 集成 BOSS 行为树到 `DungeonCombatSystem.processBossTurn()`：BossPhaseSystem 无技能时降级使用 bossDefault 行为树
