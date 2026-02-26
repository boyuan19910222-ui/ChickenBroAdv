# 任务清单

## 1. 角色创建与基础技能修复

- [x] 1.1 修复盗贼初始技能配置错误（`sinisterStrike` → `shadowStrike`）
	- 提交：`400afda`、`847763b`
	- 文件：`server/characters.js`
- [x] 1.2 同步盗贼基础技能列表，纳入 `basicAttack`
	- 提交：`0ecb28a`
	- 文件：`src/data/GameData.js`

## 2. 盗贼战斗机制增强

- [x] 2.1 实现 `shadowStrike` 暴击额外连击点（1 → 2）
	- 提交：`aa65e5f`
	- 文件：`src/data/GameData.js`、`src/systems/CombatSystem.js`
- [x] 2.2 实现普通攻击暴击额外回能（`onAttackCrit: 5`）
	- 提交：`aa65e5f`
	- 文件：`src/data/GameData.js`、`src/systems/CombatSystem.js`
- [x] 2.3 调整潜行为 1 回合并补齐破潜行规则
	- 提交：`5cd3717`
	- 文件：`src/data/GameData.js`、`src/systems/EffectSystem.js`、`src/systems/DungeonCombatSystem.js`

## 3. 表现层与回归确认

- [x] 3.1 补齐战斗飘字技能名展示与暴击表现时长（2.4s）
	- 提交：`0ecb28a`、`aa65e5f`
	- 文件：`src/composables/useCombatFloats.js`、`src/components/common/CombatantCard.vue`
- [x] 3.2 回填 OpenSpec 规格，覆盖角色创建与战斗机制
- [x] 3.3 运行自动化测试并附测试结果
	- 执行：`npm run test -- tests/unit/server/snapshotValidation.test.js`
	- 结果：19/19 通过
	- 执行：`npm run test -- tests/unit/server/battleEngine.test.js tests/unit/server/snapshotValidation.test.js`
	- 结果：`snapshotValidation` 通过；`battleEngine` 12 项失败（现有接口不匹配：`startBattle` / `_buildParty` / `_generateEnemies` 缺失）
