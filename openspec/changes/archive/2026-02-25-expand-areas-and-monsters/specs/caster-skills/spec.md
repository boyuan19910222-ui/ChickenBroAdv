## ADDED Requirements

### Requirement: Caster skill set
The system SHALL define the following caster-type monster skills, each usable by caster monsters in combat:

| Skill ID | Name | Type | Description |
|----------|------|------|-------------|
| fireball | 火球术 | damage | 单体火焰伤害，伤害 = caster.intellect × 1.8 |
| frostBolt | 寒冰箭 | damage+debuff | 单体冰霜伤害(intellect × 1.4) + 减速1回合 |
| shadowBolt | 暗影箭 | damage | 单体暗影伤害，伤害 = caster.intellect × 2.0 |
| heal | 治疗术 | heal | 恢复自身或友方 HP，恢复量 = caster.intellect × 2.5 |
| curseOfWeakness | 虚弱诅咒 | debuff | 降低目标攻击力 20%，持续 3 回合 |
| poisonCloud | 毒云 | aoe+dot | AOE 毒素伤害，每回合 intellect × 0.6，持续 3 回合 |
| lightningBolt | 闪电链 | aoe | 对主目标造成 intellect × 1.6 伤害，溅射相邻目标 50% 伤害 |

#### Scenario: Fireball deals intellect-scaled damage
- **WHEN** a caster monster with 50 intellect uses fireball on a target
- **THEN** the target SHALL receive 90 fire damage (50 × 1.8)

#### Scenario: FrostBolt applies slow debuff
- **WHEN** a caster monster uses frostBolt on a target
- **THEN** the target SHALL receive ice damage AND a 1-round slow debuff

#### Scenario: Heal restores friendly HP
- **WHEN** a caster monster with 40 intellect uses heal on a friendly unit at 50% HP
- **THEN** the friendly unit SHALL be healed for 100 HP (40 × 2.5)

#### Scenario: CurseOfWeakness reduces attack
- **WHEN** a caster monster applies curseOfWeakness to a target
- **THEN** the target's attack damage SHALL be reduced by 20% for 3 rounds

#### Scenario: PoisonCloud applies area DoT
- **WHEN** a caster monster with 60 intellect uses poisonCloud
- **THEN** all enemy units SHALL receive 36 poison damage per round (60 × 0.6) for 3 rounds

#### Scenario: LightningBolt splashes adjacent targets
- **WHEN** a caster monster uses lightningBolt targeting a unit
- **THEN** the primary target receives full damage AND adjacent units receive 50% of that damage

### Requirement: Skill assignment by monster type
Melee monsters SHALL be assigned physical combat skills (basicAttack + type-specific melee skills). Caster monsters SHALL be assigned 2-3 caster skills from the caster skill set in addition to basicAttack.

#### Scenario: Caster monster has caster skills
- **WHEN** a caster monster's skill list is examined
- **THEN** it SHALL contain `basicAttack` AND at least 2 skills from the caster skill set

#### Scenario: Melee monster has melee skills
- **WHEN** a melee monster's skill list is examined
- **THEN** it SHALL contain `basicAttack` AND at least 1 physical skill (e.g., orcRage, wolfBite, trollSmash)

### Requirement: Caster skill data structure
Each caster skill SHALL be defined in the game's skill data with the following properties: `id`, `name`, `emoji`, `description`, `type` (damage/heal/debuff/aoe), `scalingStat` ('intellect'), `scalingFactor` (number), `duration` (for debuffs/dots, in rounds), `targetType` ('single'/'aoe'/'self'/'ally').

#### Scenario: Skill data completeness
- **WHEN** any caster skill is loaded from game data
- **THEN** it SHALL have all required properties (id, name, emoji, description, type, scalingStat, scalingFactor, targetType)
