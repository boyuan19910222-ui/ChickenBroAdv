# 法师技能与天赋补全 - 任务列表

## 概述

本文档列出实现法师技能与天赋补全所需的所有任务。

---

## 任务列表

### Phase 1: OpenSpec 文档

- [x] 创建变更目录结构
- [x] 创建 proposal.md
- [x] 创建 design.md
- [x] 创建 spec 文件
  - [x] mage-arcane-power/spec.md
  - [x] mage-elemental-mastery/spec.md
- [x] 创建 tasks.md（本文档）

### Phase 2: GameData.js 技能添加

#### 核心技能
- [x] arcaneMissiles（奥术飞弹）
- [x] arcaneBlast（奥术冲击）
- [x] blink（闪烁）
- [x] conjureMana（制造法力宝石）

#### 奥术天赋解锁技能
- [x] arcanePower（奥术强化）- T3
- [x] presenceOfMind（瞬发思维）- T4
- [x] slow（减速）- T5 终极

#### 火焰天赋解锁技能
- [x] combustion（燃烧）- T3
- [x] dragonBreath（龙息术）- T4
- [x] livingBomb（活动炸弹）- T5 终极

#### 冰霜天赋解锁技能
- [x] iceBlock（寒冰屏障）- T3
- [x] iceBarrier（寒冰护盾）- T4
- [x] coldSnap（急速冷却）- T5 终极

### Phase 3: TalentData.js 天赋树扩展

#### 奥术树扩展
- [x] 添加 presenceOfMind 天赋（T4, unlock_skill）
- [x] arcanePower 保持 T3
- [x] slow 保持 T5 终极

#### 火焰树扩展
- [x] 添加 dragonBreath 天赋（T4, unlock_skill）
- [x] combustion 保持 T3
- [x] livingBomb 保持 T5 终极

#### 冰霜树扩展
- [x] 添加 iceBarrier 天赋（T4, unlock_skill）
- [x] iceBlock 保持 T3
- [x] coldSnap 保持 T5 终极

### Phase 4: 法师 skills 数组更新

- [x] 更新 GameData.classes.mage.skills 数组（从11个扩展到20个）

---

## 验证清单

### 数据完整性
- [x] 所有新技能的数据结构完整（20个技能定义）
- [x] 所有天赋树包含5层结构（每树8-9节点）
- [x] 天赋依赖关系正确设置

### 一致性检查
- [x] 天赋引用的技能ID与技能定义匹配
- [x] skills 数组包含所有新技能ID
- [x] 技能分类与其他职业保持一致

### 功能验证
- [x] 无语法错误
- [x] 无重复ID
- [x] 无循环依赖

---

**状态**: ✅ 已完成
**创建日期**: 2026-02-23
**最后更新**: 2026-02-25
