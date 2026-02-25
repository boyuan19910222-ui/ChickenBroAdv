# Tasks: 萨满祭司技能与天赋完善

## 任务列表

### 任务1: 添加天赋解锁技能到GameData.js
- [x] 添加元素系天赋解锁技能
  - [x] elementalMastery (元素掌握) - T3
  - [x] lavaBurst (熔岩爆裂) - T4
  - [x] thunderstorm (雷暴) - T5终极
- [x] 添加增强系天赋解锁技能
  - [x] stormstrike (风暴打击) - T3
  - [x] shamanisticRage (萨满之怒) - T4
  - [x] feralSpirit (野性之魂) - T5终极
- [x] 添加恢复系天赋解锁技能
  - [x] naturesSwiftnessShaman (自然迅捷) - T3
  - [x] manaTideTotem (法力之潮图腾) - T4
  - [x] earthShield (大地之盾) - T4
  - [x] riptide (激流) - T5终极

### 任务2: 添加基础技能到GameData.js
- [x] earthShock (大地震击)
- [x] frostShock (冰霜震击)
- [x] purge (净化)
- [x] searingTotem (灼热图腾)
- [x] chainHeal (治疗链)
- [x] heroism (英雄主义)

### 任务3: 更新萨满职业skills数组
- [x] 将所有新技能添加到classes.shaman.skills数组（从11个扩展到20个）

### 任务4: 扩展元素系天赋树至5层
- [x] T3: elementalMastery (unlock_skill) + reverberation
- [x] T4: lavaBurst (unlock_skill, 新增) + lightningOverload
- [x] T5: thunderstorm (unlock_skill, 终极)

### 任务5: 扩展增强系天赋树至5层
- [x] T3: stormstrike (unlock_skill) + dualWield
- [x] T4: shamanisticRage (unlock_skill, 新增) + weaponMastery
- [x] T5: feralSpirit (unlock_skill, 终极)

### 任务6: 扩展恢复系天赋树至5层
- [x] T3: naturesSwiftness (unlock_skill, 新增) + restorativeTotems + healingGrace
- [x] T4: manaTideTotem (unlock_skill) + earthShield (unlock_skill, 新增)
- [x] T5: riptide (unlock_skill, 终极)

## 验证清单

- [x] 所有unlock_skill类型天赋有对应技能定义
- [x] 技能conditions.requiresTalent正确指向天赋id
- [x] 天赋requires字段正确设置前置关系
- [x] 技能数据结构与其他职业保持一致
- [x] 三系天赋树均为5层结构

---

**状态**: ✅ 已完成
**创建日期**: 2026-02-23
**最后更新**: 2026-02-25
