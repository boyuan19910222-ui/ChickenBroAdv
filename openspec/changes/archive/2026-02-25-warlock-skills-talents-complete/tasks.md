# 实现任务清单

## 任务概览

| ID | 任务 | 优先级 | 状态 |
|----|------|--------|------|
| T1 | 添加术士新技能到 GameData.js | P0 | ✅ 已完成 |
| T2 | 扩展 TalentData.js 术士天赋树至5层 | P0 | ✅ 已完成 |
| T3 | 更新 GameData.js 术士 skills 数组 | P1 | ✅ 已完成 |
| T4 | 验证技能与天赋解锁关联 | P2 | ✅ 已完成 |

---

## T1: 添加术士新技能到 GameData.js

### 需添加的技能列表

#### 痛苦系天赋解锁技能
- [x] `siphonLife` (生命虹吸) - T3解锁
- [x] `unstableAffliction` (痛苦无常) - T4解锁
- [x] `amplifyCurse` (放大诅咒) - T3解锁

#### 恶魔学识系天赋解锁技能
- [x] `darkPact` (黑暗契约) - T4解锁
- [x] `felDomination` (恶魔支配) - T2解锁
- [x] `soulLink` (灵魂链接) - T3解锁

#### 毁灭系天赋解锁技能
- [x] `conflagrate` (燃尽) - T4解锁
- [x] `shadowburn` (暗影灼烧) - T3解锁
- [x] `backlash` (反冲) - T3解锁

#### T5终极天赋
- [x] `haunt` (鬼影缠身) - 痛苦T5
- [x] `metamorphosis` (恶魔变形) - 恶魔学识T5
- [x] `chaosBolt` (混乱之箭) - 毁灭T5

#### 其他核心技能
- [x] `curseOfWeakness` (虚弱诅咒)
- [x] `curseOfElements` (元素诅咒)
- [x] `demonArmor` (恶魔护甲)
- [x] `soulFire` (灵魂之火)
- [x] `rainOfFire` (火焰之雨)

---

## T2: 扩展 TalentData.js 术士天赋树至5层

### 痛苦树 (Affliction)
- [x] T3: siphonLife (unlock_skill) + amplifyCurse (unlock_skill, 新增) + nightfall
- [x] T4: unstableAffliction (unlock_skill, 新增) + malediction
- [x] T5: haunt (unlock_skill, 终极)

### 恶魔学识树 (Demonology)
- [x] T2: felDomination (unlock_skill, 新增) + demonicEmbrace + masterDemonologist
- [x] T3: soulLink (unlock_skill) + demonicKnowledge
- [x] T4: darkPact (unlock_skill, 新增) + demonicTactics
- [x] T5: metamorphosis (unlock_skill, 终极)

### 毁灭树 (Destruction)
- [x] T3: ruin + shadowburn (unlock_skill, 新增) + backlash (改为 unlock_skill)
- [x] T4: conflagrate (unlock_skill)
- [x] T5: chaosBolt (unlock_skill, 终极)

---

## T3: 更新 GameData.js 术士 skills 数组

- [x] 从11个扩展到24个，包含所有基础、核心、天赋解锁技能

---

## T4: 验证技能与天赋解锁关联

### 验证项
- [x] 痛苦树T3 → amplifyCurse（修复 requiresTalent: 'amplify' → 'amplifyCurse'）
- [x] 痛苦树T3 → siphonLife
- [x] 痛苦树T4 → unstableAffliction
- [x] 痛苦树T5 → haunt
- [x] 恶魔学识T2 → felDomination
- [x] 恶魔学识T3 → soulLink
- [x] 恶魔学识T4 → darkPact
- [x] 恶魔学识T5 → metamorphosis
- [x] 毁灭树T3 → shadowburn
- [x] 毁灭树T3 → backlash
- [x] 毁灭树T4 → conflagrate
- [x] 毁灭树T5 → chaosBolt

---

**状态**: ✅ 已完成
**创建日期**: 2026-02-23
**最后更新**: 2026-02-25
