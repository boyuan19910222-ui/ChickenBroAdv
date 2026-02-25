## Why

盗贼职业目前只有基础的能量系统，缺少其核心机制——连击点系统。没有连击点，盗贼技能无法区分"常规技"和"终结技"，玩法深度不足，与战士怒气系统、法师法力系统相比缺乏职业特色。

## What Changes

- **新增连击点系统**：盗贼专属的次级资源，通过常规技积累，由终结技消耗
- **技能分类机制**：技能分为 Builder（产生连击点）和 Finisher（消耗连击点）
- **阶梯式伤害缩放**：终结技伤害根据连击点数量阶梯式增长
- **能量回合恢复**：战斗中每回合自动恢复 15 点能量
- **能量脱战恢复**：战斗外缓慢恢复至满能量
- **新增测试技能**：影袭（Builder）、剔骨（Finisher）
- **UI 适配**：连击点显示为 ●●●○○ 形式

## Capabilities

### New Capabilities

- `combo-point-system`: 连击点核心机制，包括数据结构、产生/消耗逻辑、上限管理
- `rogue-skills`: 盗贼技能数据，包括影袭（Builder）和剔骨（Finisher）的配置

### Modified Capabilities

- `resource-system`: 扩展能量资源的恢复机制（战斗中回合恢复、战斗外脱战恢复）

## Impact

- **数据层** (`src/data/GameData.js`): 
  - 更新 `resourceSystems.energy` 配置
  - 添加新技能数据
  - 更新盗贼职业技能列表
- **角色系统** (`src/systems/CharacterSystem.js`): 
  - 盗贼角色初始化时添加 `comboPoints` 对象
  - 存档迁移逻辑
- **战斗系统** (`src/systems/CombatSystem.js`): 
  - 技能使用时处理连击点产生/消耗
  - 终结技伤害计算（查表）
  - 能量回合恢复逻辑
- **UI 层** (`index.html`): 
  - 连击点条显示
  - 终结技按钮状态管理
