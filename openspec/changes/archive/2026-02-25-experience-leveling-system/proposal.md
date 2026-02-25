## Why

当前等级上限为 20 级，经验值表仅 20 条，怪物仅 5 种（1-3 级），死亡惩罚仅扣金币，无法支撑完整的 1-60 级挂机升级体验。需要建立完整的经验值升级体系，目标：玩家从 1 级偶尔操作挂机升到 60 级约需 24 小时。

## What Changes

- 等级上限从 20 提升至 60，扩展 expTable 采用分段经验曲线（新手期/稳定期/深水区/冲刺期）
- 新增经验浮动机制：同种怪物 ±10%，不同种类怪物基础经验 ±30%
- 新增等级差经验惩罚：低 3 级 -30%，低 5 级 -50%，低 7 级及以上不给经验
- **BREAKING** 死亡惩罚改为扣除当前等级经验进度的 30%（替代原先扣 10% 金币），经验最低扣至 0 不降级
- 副本增加小怪/BOSS 击杀经验（原先仅通关奖励）
- 60 级满级后停止获取经验，死亡改为扣金币
- 任务经验不受等级差惩罚
- 扩充怪物数据覆盖 1-60 级（20-30 种怪物）
- 扩充区域怪物等级范围配置
- 修复 CharacterPanel 中 `player.exp` → `player.experience` 字段名 Bug
- 存档迁移：20 级体系旧存档兼容 60 级新体系

## Capabilities

### New Capabilities
- `exp-curve`: 分段经验曲线系统（expTable 60 级、分 4 段设计、升级属性成长）
- `exp-combat-rewards`: 战斗经验奖励计算（经验浮动 ±10%/±30%、等级差惩罚、副本小怪/BOSS 经验）
- `exp-death-penalty`: 死亡经验惩罚（野外/副本统一扣 30% 当前经验、不降级保护、满级扣金币）
- `monster-scaling`: 怪物数据扩充（20-30 种怪物覆盖 1-60 级、各区域等级分布）

### Modified Capabilities
- `player-schema`: 新增满级标记、经验惩罚相关字段；等级上限从 20 改为 60
- `save-migration`: 新增 v3 迁移版本，处理 20 级→60 级体系升级、expTable 重映射

## Impact

- `src/systems/CharacterSystem.js` — 等级上限、升级逻辑、满级处理
- `src/systems/CombatSystem.js` — 经验浮动、等级差惩罚、死亡经验扣除
- `src/systems/DungeonCombatSystem.js` — 小怪/BOSS 击杀经验、灭团经验惩罚
- `src/data/GameData.js` — expTable 扩展至 60 级、怪物数据扩充、区域等级范围
- `src/core/PlayerSchema.js` — 等级上限、schema 字段
- `src/components/character/CharacterPanel.vue` — 修复 exp→experience Bug
- `src/data/dungeons/WailingCaverns.js` — 小怪/BOSS 经验奖励字段
- 存档迁移系统 — 新增 v2→v3 迁移
