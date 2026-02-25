# Game Balance Tuning Proposal

## Why

当前游戏数值平衡存在两个核心问题：
1. **坦克职业血量未达标**：满级毕业装备的坦克职业血量未达到预期范围（8000-10000），无法满足高难度副本的生存需求
2. **副本怪物数值失衡**：BOSS伤害与坦克生存能力不匹配，缺乏清晰的"坦克能抗住4次攻击"的设计目标

## What Changes

### 数值调整
- **BREAKING** 调整坦克职业（战士/圣骑士/德鲁伊熊形态）基础血量成长系数
- **BREAKING** 调整耐力属性对血量的贡献公式
- **BREAKING** 调整副本怪物（特别是BOSS）的伤害数值
- **BREAKING** 调整副本怪物血量以保持合理战斗时长
- 调整毕业装备的耐力属性分配
- 调整护甲减伤公式确保坦克职业的减伤优势

### 新增设计目标
- 坦克满级毕业血量：8000-10000
- 坦克不开技能可抗住最终BOSS最多4次攻击
- 副本战斗保持挑战性但不出现秒杀

## Capabilities

### New Capabilities
- `tank-survivability`: 坦克职业生存能力数值规范，定义血量上限、减伤机制、装备成长曲线
- `boss-damage-tuning`: BOSS伤害数值规范，定义BOSS攻击力与坦克血量的比例关系

### Modified Capabilities
- `player-schema`: 修改玩家属性计算公式，调整耐力-血量转换系数
- 现有副本怪物数据需要更新伤害数值

## Impact

### 受影响文件
- `src/data/GameData.js` - 职业基础属性和成长系数
- `src/data/MonsterData.js` - 怪物伤害公式
- `src/data/EquipmentData.js` - 装备耐力属性
- `src/data/dungeons/*.js` - 各副本BOSS数据
- `src/core/PlayerSchema.js` - 属性计算逻辑

### 依赖系统
- 战斗系统（CombatSystem.js）
- 副本战斗系统（DungeonCombatSystem.js）
- 装备系统（EquipmentSystem.js）
