# Tasks: 盗贼技能与天赋完整补齐

## 1. 基础技能补齐

- [x] 1.1 添加潜行技能(stealth)到 GameData.js
- [x] 1.2 添加偷袭技能(cheapShot)到 GameData.js - 潜行限定，眩晕+2连击点
- [x] 1.3 添加伏击技能(ambush)到 GameData.js - 潜行限定，高额伤害+2连击点
- [x] 1.4 添加闷棍技能(sap)到 GameData.js - 潜行限定，控制技能
- [x] 1.5 添加切割技能(sliceAndDice)到 GameData.js - 终结技，攻速提升
- [x] 1.6 添加出血技能(hemorrhage)到 GameData.js - 生成技，流血效果
- [x] 1.7 添加刀扇技能(fanOfKnives)到 GameData.js - AOE攻击

## 2. 天赋解锁技能补齐

- [x] 2.1 添加冷血技能(coldBlood)到 GameData.js - 刺杀树T4，下次攻击必暴
- [x] 2.2 添加剑刃乱舞技能(bladeFlurry)到 GameData.js - 战斗树T3，AOE攻击
- [x] 2.3 添加冲动技能(adrenalineRush)到 GameData.js - 战斗树T4，能量恢复加速
- [x] 2.4 添加幽灵打击技能(ghostlyStrike)到 GameData.js - 敏锐树T3，高闪避攻击
- [x] 2.5 添加预谋技能(preparation)到 GameData.js - 敏锐树T4，重置技能CD

## 3. T5 终极天赋技能补齐

- [x] 3.1 添加毁伤技能(mutilate)到 GameData.js - 刺杀树T5终极
- [x] 3.2 添加杀戮盛筵技能(killingSpree)到 GameData.js - 战斗树T5终极
- [x] 3.3 添加暗影之舞技能(shadowDance)到 GameData.js - 敏锐树T5终极

## 4. 毒药系统技能

- [x] 4.1 添加致命毒药技能(deadlyPoison)到 GameData.js - DOT毒药
- [x] 4.2 添加致伤毒药技能(woundPoison)到 GameData.js - 减疗毒药
- [x] 4.3 添加麻痹毒药技能(numbingPoison)到 GameData.js - 减速毒药

## 5. 天赋树扩展

- [x] 5.1 扩展刺杀天赋树至5层，添加中间层级天赋和T5终极天赋(mutilate)
- [x] 5.2 扩展战斗天赋树至5层，添加中间层级天赋和T5终极天赋(killingSpree)
- [x] 5.3 扩展敏锐天赋树至5层，添加中间层级天赋和T5终极天赋(shadowDance)

## 6. 特殊机制定义

- [x] 6.1 在 ClassMechanics.js 中添加 stealth 潜行系统定义
- [x] 6.2 在 ClassMechanics.js 中添加 poison 毒药系统定义

## 7. 数据整合

- [x] 7.1 更新盗贼职业的 skills 数组，包含所有新技能
- [x] 7.2 验证所有技能 ID 与天赋引用一致
- [x] 7.3 验证天赋解锁技能的条件字段正确设置
