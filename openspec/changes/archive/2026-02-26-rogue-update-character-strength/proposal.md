# 盗贼角色强度与机制更新（已实现回填）

## 背景

根据 `yuanchl@ddyx.onaliyun.com` 的实际提交记录，盗贼相关改动已覆盖角色初始化、连击点生成、能量恢复与潜行机制。当前需要把已落地实现同步回 OpenSpec，确保代码与规格一致。

## 已实现变更

- 修复盗贼创建时初始技能错误：初始技能从 `sinisterStrike` 更正为 `shadowStrike`（`400afda`、`847763b`、`aa65e5f` 关联链路）
- 盗贼基础技能集合纳入 `basicAttack`，统一普通攻击触发逻辑（`0ecb28a`）
- 盗贼 `shadowStrike` 在暴击时连击点由 1 提升为 2（`critGenerates: 2`，`aa65e5f`）
- 能量体系新增“普通攻击暴击额外回能 +5”（`onAttackCrit: 5`，`aa65e5f`）
- 潜行机制从长时持续改为 1 回合，并补齐潜行过期/受击破潜行/敌方选目标排除潜行单位等战斗行为（`5cd3717`）

## 影响范围

- 服务端角色创建：`server/characters.js`
- 职业与技能数据：`src/data/GameData.js`
- 单人/副本战斗逻辑：`src/systems/CombatSystem.js`、`src/systems/DungeonCombatSystem.js`、`src/systems/EffectSystem.js`
- 战斗反馈展示：`src/composables/useCombatFloats.js`、`src/components/common/CombatantCard.vue`

## 非目标

- 不引入新的盗贼职业分支或天赋树重构
- 不调整所有职业统一成长公式（本次聚焦盗贼相关实现对齐）
