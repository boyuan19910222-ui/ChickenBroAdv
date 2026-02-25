# Boss Damage Tuning Specification

定义 BOSS 伤害数值规范，确保坦克能抗住最终 BOSS 最多 4 次攻击（不开技能）。

## ADDED Requirements

### Requirement: Boss Base Damage Formula

BOSS 基础伤害 SHALL 使用以下公式：

```
baseDamage = bossLevel × 50
```

最终伤害 = baseDamage × difficultyMultiplier × (1 + levelScale)

其中：
- `difficultyMultiplier` = 1.0（普通）/ 1.2（困难）/ 1.5（英雄）
- `levelScale` = max(0, (bossLevel - 50) × 0.05)

#### Scenario: Level 60 boss damage
- **WHEN** 60 级普通难度 BOSS 攻击
- **THEN** 原始伤害 SHALL 为 4500（60 × 50 × 1.0 × 1.5）

#### Scenario: Level 50 boss damage
- **WHEN** 50 级普通难度 BOSS 攻击
- **THEN** 原始伤害 SHALL 为 2500（50 × 50 × 1.0 × 1.0）

#### Scenario: Hard mode boss damage
- **WHEN** 60 级困难难度 BOSS 攻击
- **THEN** 原始伤害 SHALL 为 5400（60 × 50 × 1.2 × 1.5）

### Requirement: Tank Survivability Against Boss

满级毕业装备坦克 SHALL 能抗住最终 BOSS 最多 4 次攻击（不开技能）。

#### Scenario: Tank survives 4 boss hits
- **WHEN** 8000 血量的坦克面对 60 级最终 BOSS
- **THEN** 4 次攻击后总伤害 SHALL 不超过 9000（允许有小幅浮动）

#### Scenario: Tank dies on 5th hit
- **WHEN** 8000 血量的坦克被 BOSS 攻击 5 次
- **THEN** 坦克 SHALL 死亡

### Requirement: Boss Damage Scaling by Dungeon Tier

不同副本层级的 BOSS 伤害 SHALL 按以下比例缩放：

| 副本层级 | 推荐等级 | 伤害系数 |
|----------|----------|----------|
| 低级副本 | 15-30 | 0.5 |
| 中级副本 | 30-45 | 0.75 |
| 高级副本 | 45-55 | 0.9 |
| 满级副本 | 55-60 | 1.0 |

#### Scenario: Deadmines boss damage
- **WHEN** 死亡矿井（20级）BOSS 攻击
- **THEN** 原始伤害 SHALL 约为 500（20 × 50 × 0.5）

#### Scenario: Stratholme boss damage
- **WHEN** 斯坦索姆（60级）BOSS 攻击
- **THEN** 原始伤害 SHALL 为 4500（标准满级 BOSS 伤害）

### Requirement: Boss Phase Damage Modifier

BOSS 多阶段战斗中，伤害 SHALL 按阶段调整：

| 阶段 | 血量阈值 | 伤害修正 |
|------|----------|----------|
| 阶段 1 | 100%-50% | 1.0x |
| 阶段 2 | 50%-25% | 1.2x |
| 阶段 3 | 25%-0% | 1.5x |

#### Scenario: Boss phase 2 damage
- **WHEN** BOSS 进入阶段 2（血量低于 50%）
- **THEN** 伤害 SHALL 增加 20%

#### Scenario: Boss phase 3 damage
- **WHEN** BOSS 进入阶段 3（血量低于 25%）
- **THEN** 伤害 SHALL 增加 50%

### Requirement: Trash Mob Damage

普通小怪伤害 SHALL 约为 BOSS 伤害的 30-50%。

#### Scenario: Trash mob damage ratio
- **WHEN** 60 级副本的小怪攻击
- **THEN** 伤害 SHALL 在 1350-2250 范围内（BOSS 伤害的 30-50%）

### Requirement: Boss Skill Damage

BOSS 技能伤害 SHALL 基于基础伤害计算：

| 技能类型 | 伤害系数 |
|----------|----------|
| 普通攻击 | 1.0x |
| 强力技能 | 1.5x |
| AOE 技能 | 0.7x（对每个目标）|
| DOT 技能 | 每跳 0.3x |

#### Scenario: Boss powerful skill
- **WHEN** BOSS 使用强力技能（如致死打击）
- **THEN** 伤害 SHALL 为基础伤害的 1.5 倍

#### Scenario: Boss AOE skill
- **WHEN** BOSS 使用 AOE 技能
- **THEN** 对每个目标的伤害 SHALL 为基础伤害的 70%
