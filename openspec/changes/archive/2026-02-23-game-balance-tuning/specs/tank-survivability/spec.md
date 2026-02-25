# Tank Survivability Specification

定义坦克职业的生存能力数值规范，包括血量上限、护甲减伤、装备成长曲线。

## ADDED Requirements

### Requirement: Tank Health Calculation

坦克职业（战士、圣骑士、德鲁伊熊形态）的血量 SHALL 按照以下公式计算：

```
health = baseHealth + (stamina × staminaHealthCoeff) + (level × levelHealthBonus)
```

其中：
- `staminaHealthCoeff` = 20（每点耐力提供 20 点血量）
- `levelHealthBonus` = 50（每级额外提供 50 点血量）
- 坦克职业基础血量提升 50%

#### Scenario: Warrior health at level 60
- **WHEN** 战士达到 60 级，装备提供 200 耐力（含天赋加成）
- **THEN** 血量 SHALL 在 8000-10000 范围内

#### Scenario: Paladin health at level 60
- **WHEN** 圣骑士达到 60 级，装备提供 200 耐力（含天赋加成）
- **THEN** 血量 SHALL 在 8000-10000 范围内

#### Scenario: Druid bear form health at level 60
- **WHEN** 德鲁伊在熊形态下达到 60 级，装备提供 200 耐力
- **THEN** 血量 SHALL 在 8000-10000 范围内（含熊形态加成）

### Requirement: Armor Damage Reduction

护甲减伤 SHALL 使用以下公式：

```
reduction% = totalArmor / (totalArmor + 85 × attackerLevel + 400)
```

减伤上限为 75%。

#### Scenario: Plate armor reduction at level 60
- **WHEN** 满级坦克装备 8000 护甲
- **THEN** 面对 60 级攻击者时减伤率 SHALL 约为 59%

#### Scenario: Armor cap
- **WHEN** 护甲值超过减伤上限所需
- **THEN** 减伤率 SHALL 不超过 75%

### Requirement: Tank Equipment Stamina

毕业装备的耐力属性分配 SHALL 符合以下标准：

| 槽位 | 耐力范围 |
|------|----------|
| 胸甲/腿甲 | 25-35 |
| 头盔/护肩/手套/靴子 | 18-25 |
| 手腕/腰带/披风 | 12-18 |
| 项链/戒指/饰品 | 10-15 |

#### Scenario: Full tank gear stamina
- **WHEN** 坦克装备全套毕业装备（16 个槽位）
- **THEN** 总耐力 SHALL 在 200-250 范围内

### Requirement: Plate Armor Value

板甲装备护甲值 SHALL 使用以下系数：

```
armorValue = floor(armorCoeff × itemLevel × qualityMultiplier)
```

其中：
- `armorCoeff` = 8.0（从 5.0 提升）
- 盾牌 `armorCoeff` = 12.0（从 7.5 提升）

#### Scenario: Epic chest armor at level 60
- **WHEN** 60 级史诗品质板甲胸甲
- **THEN** 护甲值 SHALL 约为 768（8 × 60 × 1.6）

#### Scenario: Epic shield at level 60
- **WHEN** 60 级史诗品质盾牌
- **THEN** 护甲值 SHALL 约为 1152（12 × 60 × 1.6）

### Requirement: Non-Tank Health Scaling

非坦克职业的血量 SHALL 使用相同的计算公式，但装备耐力较低。

#### Scenario: Mage health at level 60
- **WHEN** 法师达到 60 级，装备提供 150 耐力
- **THEN** 血量 SHALL 在 5000-6500 范围内

#### Scenario: Rogue health at level 60
- **WHEN** 盗贼达到 60 级，装备提供 160 耐力
- **THEN** 血量 SHALL 在 5500-7000 范围内
