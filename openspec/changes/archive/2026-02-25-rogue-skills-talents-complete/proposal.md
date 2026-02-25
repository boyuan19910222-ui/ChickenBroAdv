# Proposal: 盗贼技能与天赋完整补齐

## Why

盗贼职业当前技能和天赋实现不完整，主要问题包括：
1. 天赋树仅 4 层（其他完整职业为 5 层）
2. 天赋解锁技能（coldBlood、bladeFlurry、adrenalineRush、ghostlyStrike、preparation）在 TalentData.js 中标记了 `unlock_skill`，但在 GameData.js 中缺少对应的技能定义
3. 缺少部分核心技能（潜行、偷袭、伏击、闷棍、切割、毒药涂抹等）
4. 缺少盗贼职业特有的潜行机制和毒药系统的数据定义

现在需要补齐盗贼的完整技能体系和天赋树，使其与其他完整职业（战士、圣骑士、猎人、德鲁伊）保持一致的实现水平。

## What Changes

### 技能补充
- **新增基础技能**：潜行(stealth)、偷袭(cheapShot)、伏击(ambush)、闷棍(sap)、切割(sliceAndDice)、出血(hemorrhage)、投掷(thrown)
- **新增毒药技能**：致命毒药(deadlyPoison)、致伤毒药(woundPoison)、麻痹毒药(numbingPoison)
- **新增天赋解锁技能**：
  - 刺杀树：冷血(coldBlood)、毁伤(mutilate，T5 终极)
  - 战斗树：剑刃乱舞(bladeFlurry)、冲动(adrenalineRush)、杀戮盛筵(killingSpree，T5 终极)
  - 敏锐树：幽灵打击(ghostlyStrike)、预谋(preparation)、暗影之舞(shadowDance，T5 终极)

### 天赋树扩展
- 将三系天赋树从 4 层扩展到 5 层
- 为每系添加 T5 终极天赋：
  - 刺杀树：毁伤(mutilate)
  - 战斗树：杀戮盛筵(killingSpree)
  - 敏锐树：暗影之舞(shadowDance)
- 补充中间层级天赋

### 潜行系统
- 在 GameData.js 中添加潜行状态相关技能
- 在 ClassMechanics.js 中添加盗贼潜行机制定义

## Capabilities

### New Capabilities
- `rogue-stealth-system`: 盗贼潜行系统，包含潜行状态、潜行攻击加成、闷棍等控制技能
- `rogue-poison-system`: 盗贼毒药系统，包含毒药类型、涂抹机制、毒药效果

### Modified Capabilities
- `class-system/rogue`: 扩展盗贼职业规格，添加新技能和天赋层级的详细需求

## Impact

### 修改的文件
1. **`/src/data/GameData.js`**
   - 新增约 15-20 个盗贼技能定义
   - 更新盗贼职业的 skills 数组

2. **`/src/data/TalentData.js`**
   - 扩展盗贼三系天赋树至 5 层
   - 新增 T5 终极天赋
   - 补充 T3-T4 中间天赋

3. **`/src/data/ClassMechanics.js`**
   - 新增盗贼潜行机制定义
   - 新增毒药系统定义

### 影响的系统
- 战斗系统：需要处理潜行状态和潜行攻击逻辑
- 效果系统：需要处理毒药 DOT 和效果
- 天赋系统：需要处理新增天赋的效果
- UI 系统：技能面板需要显示新技能

### 非破坏性变更
- 所有新增内容为扩展性修改
- 不影响现有盗贼技能的功能
- 不影响其他职业的实现
