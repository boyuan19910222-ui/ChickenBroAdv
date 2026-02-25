## Why

当前 AI 队友在副本战斗中使用硬编码伤害公式，不走技能系统、不消耗资源、没有冷却，与玩家体验严重不一致。野外怪物只有普攻，缺乏战斗深度。需要一套统一的 AI 决策系统，让所有战斗单位（友方 AI、敌方怪物、BOSS、宠物）通过同一套架构做决策和执行技能，并为后续挂机模式（玩家自动战斗）提供基础。

## What Changes

- 新增行为树引擎（Selector/Sequence/Condition/Action 节点 + 评分 Selector）
- 新增条件/动作/评分注册表，行为树通过字符串 key 引用
- 新增 ContextBuilder 模块，为 AI 决策组装三层 context（self/battlefield/tactical）
- 新增统一技能执行器 `executeSkill()`，玩家、AI 队友、敌方怪物共用同一执行路径（资源消耗 → 冷却 → 伤害计算 → 效果施加）
- 新增多棵行为树定义：副本敌方 AI、副本友方 AI（按职业角色区分）、野外敌方 AI、BOSS AI、宠物 AI
- **BREAKING**: 替换 `DungeonCombatSystem` 中 AI 队友的硬编码行动逻辑（`aiTankAction`/`aiHealerAction`/`aiMeleeDpsAction`/`aiRangedDpsAction`）
- **BREAKING**: 替换 `DungeonCombatSystem` 中敌方技能选择逻辑（`_selectEnemySkill`/`_executeEnemyAttack`）
- **BREAKING**: 替换 `CombatSystem` 中敌方普攻逻辑（`enemyTurn`）
- 补齐 AI 队友运行时字段（`skillCooldowns`、盗贼 `comboPoints`），资源恢复与玩家同规则
- 为野外怪物在 `GameData.monsters` 中添加技能数据
- 敌人技能格式归一化（`damage: number` → `{ base, scaling, stat }` 标准结构）

## Capabilities

### New Capabilities
- `behavior-tree-engine`: 行为树引擎，支持 selector（固定优先级）、scored（评分选择）、sequence、condition、action 五种节点类型
- `ai-registry`: 条件/动作/评分函数注册表，统一签名 `(unit, context, params) => result`，行为树通过字符串 key 引用
- `context-builder`: AI 决策 context 组装器，三层结构（self 含 availableSkills / battlefield 含 allies+enemies / tactical 含预计算衍生信息），技能格式归一化
- `unified-skill-executor`: 统一技能执行器，所有单位共用的 executeSkill() 路径，整合资源消耗、冷却管理、伤害计算、效果施加
- `ai-behavior-trees`: 各角色行为树定义集合（dungeon-enemy / dungeon-ally-tank / dungeon-ally-healer / dungeon-ally-dps / overworld-enemy / boss / pet）

### Modified Capabilities
- `player-schema`: AI 队友创建时补齐 `skillCooldowns`、`comboPoints` 等运行时字段，资源恢复与玩家同规则

## Impact

- `src/systems/DungeonCombatSystem.js` — 移除硬编码 AI 行动方法，改为调用 AI 决策系统
- `src/systems/CombatSystem.js` — 野外敌人改用 AI 决策 + 统一执行器
- `src/systems/PartyFormationSystem.js` — AI 队友创建时补齐运行时字段
- `src/data/GameData.js` — 野外怪物添加技能数据
- `src/data/dungeons/WailingCaverns.js` — 敌人技能可能需要格式调整
- 新增 `src/ai/` 目录：`BehaviorTree.js`、`conditions.js`、`actions.js`、`scorers.js`、`ContextBuilder.js`、`SkillExecutor.js`、`AIDecisionSystem.js`、`trees/` 子目录
