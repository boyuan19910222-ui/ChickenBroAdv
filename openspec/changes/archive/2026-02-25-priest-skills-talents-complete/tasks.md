# Tasks: 牧师技能和天赋完整实现

## 任务清单

### Phase 1: 数据准备 ✓
- [x] 分析现有牧师技能数量和天赋树结构
- [x] 确认需要新增的技能和天赋数量
- [x] 创建 OpenSpec 变更文档

### Phase 2: GameData.js 技能实现 ✓

#### 2.1 天赋解锁技能 (6个) ✓
- [x] innerFocus (心灵专注) - 戒律树T2
- [x] powerInfusion (能量灌注) - 戒律树T4
- [x] divineSpirit (神圣之灵) - 神圣树T2
- [x] lightwell (光明之泉) - 神圣树T4
- [x] vampiricEmbrace (吸血鬼之拥) - 暗影树T3
- [x] shadowform (暗影形态) - 暗影树T4

#### 2.2 T5终极天赋 (3个) ✓
- [x] painSuppression (痛苦压制) - 戒律树T5
- [x] guardianSpirit (守护之魂) - 神圣树T5
- [x] dispersion (消散) - 暗影树T5

#### 2.3 其他核心技能 (3个) ✓
- [x] holyFire (神圣之火)
- [x] prayerOfMending (愈合祷言)
- [x] massDispel (群体驱散)

### Phase 3: TalentData.js 天赋树扩展 ✓

#### 3.1 戒律树扩展 ✓
- [x] 添加T3中间天赋 mentalAgility
- [x] 添加T5终极天赋 painSuppression
- [x] 确保依赖链正确

#### 3.2 神圣树扩展 ✓
- [x] 添加T3中间天赋 holyReach
- [x] 添加T5终极天赋 guardianSpirit
- [x] 确保依赖链正确

#### 3.3 暗影树扩展 ✓
- [x] 添加T5终极天赋 dispersion
- [x] 确保依赖链正确

### Phase 4: 职业配置更新 ✓
- [x] 更新 classes.priest.skills 数组

### Phase 5: 验证 ✓
- [x] 验证技能ID与天赋引用一致
- [x] 验证天赋树依赖链完整
- [x] 验证技能数量达到预期

## 实现顺序

```
GameData.js 技能定义 ✓
        ↓
TalentData.js 天赋树扩展 ✓
        ↓
classes.priest.skills 更新 ✓
        ↓
最终验证 ✓
```

## 文件修改摘要

| 文件 | 修改内容 | 实际行数 |
|-----|---------|---------|
| GameData.js | 新增12个技能定义 | +198行 |
| TalentData.js | 扩展3个天赋树 | +9行 |

## 验收标准

1. [x] 牧师技能总数 = 20个 (原8个 + 新增12个)
2. [x] 三系天赋树均有5层
3. [x] 所有天赋解锁技能有对应技能定义
4. [x] 技能ID与天赋引用100%匹配

## 实现完成日期

2026-02-23
