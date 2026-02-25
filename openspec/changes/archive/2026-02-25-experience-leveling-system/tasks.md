## 1. 经验曲线与等级上限

- [x] 1.1 扩展 GameData.expTable 为 60 级分段经验曲线（4 段线性公式，60 个条目）
- [x] 1.2 CharacterSystem 等级上限从 20 改为 60，levelUp 中 expTable fallback 移除（不再需要 `* 1.5`）
- [x] 1.3 满级处理：addExperience 对 60 级玩家直接 return，levelUp 后 experience=0 / experienceToNext=0

## 2. 经验浮动与等级差惩罚

- [x] 2.1 CombatSystem 战斗胜利时经验增加 ±10% 随机浮动
- [x] 2.2 新增等级差惩罚计算：levelDiff>=7 → 0, >=5 → 0.5, >=3 → 0.7, else 1.0
- [x] 2.3 CombatSystem 中整合浮动和惩罚（先浮动后惩罚），更新经验获取日志格式
- [x] 2.4 确保 QuestSystem 经验不受等级差惩罚

## 3. 死亡经验惩罚

- [x] 3.1 CombatSystem 野外战败：移除 10% 金币惩罚，改为扣 30% 当前经验（最低 0 不降级）
- [x] 3.2 DungeonCombatSystem 灭团：新增扣 30% 当前经验惩罚
- [x] 3.3 满级（60 级）死亡回退为扣 10% 金币
- [x] 3.4 死亡惩罚日志：经验惩罚显示 `💀 损失 X 经验值`，金币惩罚显示 `💸 损失 X 金币`

## 4. 副本经验奖励

- [x] 4.1 DungeonCombatSystem 每次 encounter 胜利后奖励击杀经验（累加每只敌人 loot.exp，含浮动和等级惩罚）
- [x] 4.2 副本通关奖励保留，与 encounter 经验叠加
- [x] 4.3 WailingCaverns 副本敌人数据添加 loot.exp 字段（小怪=同级野外怪，BOSS=3-5 倍）

## 5. 怪物数据扩充

- [x] 5.1 调整现有艾尔文森林怪物等级分布至 1-10 级，使用新 baseExp 公式重算经验和属性
- [x] 5.2 新增西部荒野 5 种怪物（Lv 10-20）
- [x] 5.3 新增荆棘谷 7 种怪物（Lv 20-45）
- [x] 5.4 新增东瘟疫之地 7 种怪物（Lv 45-60）
- [x] 5.5 更新 GameData.areas 各区域 monsters 引用列表

## 6. UI 与 Bug 修复

- [x] 6.1 修复 CharacterPanel.vue 中 `player.exp` → `player.experience` 字段名 Bug
- [x] 6.2 经验条满级时显示 "MAX" 而非 "0/0"
- [x] 6.3 大数字经验值格式化显示（如 12500 → "12.5K"）

## 7. 存档迁移

- [x] 7.1 SaveMigration 新增 migrations[3]（v3→v4）：根据玩家等级重新查 expTable 更新 experienceToNext
- [x] 7.2 CURRENT_VERSION 从 3 更新为 4
- [x] 7.3 验证旧存档加载后经验系统正常工作
