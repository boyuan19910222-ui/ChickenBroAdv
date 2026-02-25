## 1. 数据配置

- [x] 1.1 在 GameData.js 中添加 shadowStrike 技能数据（category: builder, comboPointsGenerated: 1）
- [x] 1.2 在 GameData.js 中添加 eviscerate 技能数据（category: finisher, comboPointsDamage 阶梯表）
- [x] 1.3 更新 energy 资源配置，添加 generation.perTurn 和 generation.outOfCombat
- [x] 1.4 更新盗贼职业技能列表，包含 shadowStrike 和 eviscerate

## 2. 角色系统

- [x] 2.1 创建盗贼时初始化 comboPoints 对象（current: 0, max: 5）
- [x] 2.2 存档迁移：为缺少 comboPoints 的盗贼存档自动添加默认值

## 3. 战斗系统

- [x] 3.1 Builder 技能处理：技能使用后增加 comboPointsGenerated 数量连击点
- [x] 3.2 连击点上限检查：超过 max 时保持 max
- [x] 3.3 Finisher 技能前置检查：无连击点时禁止使用并提示
- [x] 3.4 Finisher 伤害计算：根据连击点数从 comboPointsDamage 表查找 base 和 scaling
- [x] 3.5 Finisher 使用后清空连击点
- [x] 3.6 能量回合恢复：玩家回合结束时 +perTurn，不超过上限
- [x] 3.7 战斗结束时清空连击点

## 4. UI 适配

- [x] 4.1 连击点条显示：盗贼角色显示 ●●●○○ 格式
- [x] 4.2 Finisher 技能按钮状态：无连击点时禁用并显示提示
- [x] 4.3 技能描述显示：Builder 显示 "+1连击"，Finisher 显示 "需要连击点"

## 5. 脱战能量恢复

- [x] 5.1 战斗结束后启动脱战恢复计时器（delay 秒后开始）
- [x] 5.2 脱战恢复：每秒 +rate 能量，恢复至满时停止
- [x] 5.3 进入战斗时停止脱战恢复
