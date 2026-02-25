## Why

副本战斗系统（`dungeon-battle-system`）框架搭建完成后，在实际游戏体验中暴露了多个数值平衡、机制缺陷和 bug 问题：AI 队友职业固定单一、敌人等级不随副本缩放、波次间无难度递增、仇恨系统实际未生效（import 缺失导致死代码）、治疗 AI 目标筛选错误、混合职业玩家定位判定失效（战士投武器系天赋却被分配为坦克）。这些问题严重影响副本战斗的策略深度和游戏体验，需要系统性修复和增强。

## What Changes

- **AI 队伍随机化**：新增 `ROLE_CLASS_POOL` 职业池，每个定位（坦克/治疗/近战DPS/远程DPS）可从多个职业+天赋组合中随机选取，每次进副本 AI 队友不再固定
- **AI 等级缩放**：AI 队友属性根据副本推荐等级动态生成，使用 `growthPerLevel` 成长公式，不再使用固定数值
- **敌人等级缩放**：新增 `_scaleEnemiesToDungeonMax()` 方法，按副本推荐上限缩放敌方 HP/攻击/防御（每级差 +4%）
- **波次补怪机制**：小怪战保证每波至少 3 只敌人，不足时从怪物池补充
- **精英怪生成**：25% 概率触发精英怪（HP×2.5、伤害×1.8、护甲×1.5、经验×2）
- **波次难度递增**：后续波次逐步提升敌人数值，增加挑战感
- **仇恨驱动目标选择**：修复 ThreatSystem import 缺失 bug，使仇恨系统真正参与敌人目标选择决策
- **治疗目标筛选修复**：修复治疗 AI 选择目标时的筛选逻辑 bug
- **天赋动态定位判定**：`determineRole` 新增从 `player.talents` 天赋点分配数据动态计算主天赋的能力，解决混合职业（战士/圣骑士/德鲁伊/萨满/牧师）定位判定不准的问题

## Capabilities

### New Capabilities
- `encounter-scaling`: 副本遭遇战缩放系统，涵盖敌人等级缩放、精英怪生成、波次补怪和难度递增机制

### Modified Capabilities
- `party-formation-system`: 新增 AI 队伍随机化（ROLE_CLASS_POOL 职业池）、AI 等级缩放（growthPerLevel）、天赋点动态定位判定（_calculatePrimaryTalent）
- `threat-system`: 修复 ThreatSystem import 缺失导致仇恨系统未实际生效的 bug，使仇恨值真正驱动敌人目标选择

## Impact

- **修改文件**：
  - `src/systems/PartyFormationSystem.js` — 新增 ROLE_CLASS_POOL、_calculatePrimaryTalent、createDefaultParty 重构、determineRole 增强
  - `src/systems/DungeonCombatSystem.js` — 新增 _scaleEnemiesToDungeonMax、精英怪生成、波次补怪、波次难度递增、修复 ThreatSystem import
  - `src/game/ContextBuilder.js` — 适配新的战斗上下文结构
  - `src/game/SkillExecutor.js` — 治疗目标筛选 bug 修复
  - `src/game/actions.js` — 适配改动
- **影响范围**：所有副本战斗流程（队伍编成、遭遇战生成、AI 决策、仇恨目标选择）
- **向后兼容**：所有改动向后兼容，不破坏已有存档数据
