## 1. AI 队伍随机化与等级缩放

- [x] 1.1 新增 `ROLE_CLASS_POOL` 定位职业池配置，为坦克/治疗/近战DPS/远程DPS 各定位配置多个职业+天赋组合
- [x] 1.2 重构 `createDefaultParty()` 方法，从定位池中随机选取 AI 职业，避免与玩家职业重复
- [x] 1.3 新增 `_createAIStats()` 方法，基于 `growthPerLevel` 公式按副本等级动态生成 AI 属性

## 2. 天赋动态定位判定

- [x] 2.1 新增 `_calculatePrimaryTalent()` 方法，遍历 `player.talents` 计算投入最多的天赋树
- [x] 2.2 增强 `determineRole()` 方法，新增第三参数 `talents`，未设置 `primaryTalent` 时自动动态计算
- [x] 2.3 更新 `integratePlayer()` 和 `createDungeonParty()` 调用点，传入 `player.talents`

## 3. 遭遇战缩放机制

- [x] 3.1 新增 `_scaleEnemiesToDungeonMax()` 方法，按副本推荐上限缩放敌方 HP/攻击/防御（每级差 +4%）
- [x] 3.2 实现精英怪生成逻辑（25% 概率，HP×2.5、伤害×1.8、护甲×1.5、经验×2）
- [x] 3.3 实现波次补怪机制，保证每波至少 3 只敌人
- [x] 3.4 实现波次难度递增，后续波次逐步提升敌人数值

## 4. Bug 修复

- [x] 4.1 修复 `DungeonCombatSystem` 中 `ThreatSystem` 的 import 路径缺失问题，使仇恨系统真正生效
- [x] 4.2 修复治疗 AI 目标筛选 bug，排除已死亡单位和敌方单位
- [x] 4.3 修复 `ContextBuilder` 和 `SkillExecutor` 中的适配问题
