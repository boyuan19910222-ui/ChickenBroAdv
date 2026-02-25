## ADDED Requirements

### Requirement: 经典装备模板库
系统 SHALL 在 `ClassicEquipment.js` 中定义 ~100-120 件经典副本装备模板，每件为固定属性的命名装备。

#### Scenario: 装备模板结构
- **WHEN** 读取经典装备模板
- **THEN** 每件装备 SHALL 包含：
  - `id`: string — 唯一标识（snake_case）
  - `name`: string — 中文装备名称
  - `emoji`: string — 装备 emoji
  - `slot`: string — 装备槽位（mainHand/offHand/head/chest/legs/feet/hands/waist/shoulder/back/wrist/finger/trinket）
  - `quality`: string — 品质（uncommon/rare/epic）
  - `itemLevel`: number — 物品等级
  - `stats`: object — 属性加成（strength/agility/intellect/stamina/spirit 等）
  - `source`: { dungeon: string, boss: string } — 来源副本和 BOSS

#### Scenario: 武器类装备含武器伤害
- **WHEN** 装备 slot 为 mainHand 或 offHand 且为武器
- **THEN** 装备 SHALL 额外包含 `weaponDamage: { min, max, speed, type, handed }`
- **THEN** `type` SHALL 为 sword/mace/axe/dagger/staff/wand/bow/gun 之一
- **THEN** `handed` SHALL 为 oneHand/twoHand/offHand 之一

### Requirement: 装备数量分配
每个副本 SHALL 按 BOSS 数量配置合理数量的经典装备模板。

#### Scenario: 短副本装备数量
- **WHEN** 副本 BOSS 数 ≤ 3
- **THEN** 该副本 SHALL 配置 3-5 件经典装备

#### Scenario: 中副本装备数量
- **WHEN** 副本 BOSS 数为 4-6
- **THEN** 该副本 SHALL 配置 5-8 件经典装备

#### Scenario: 长副本装备数量
- **WHEN** 副本 BOSS 数 > 6（含多翼/多层总计）
- **THEN** 该副本 SHALL 配置 8-12 件经典装备

### Requirement: 装备品质与副本等级匹配
经典装备的品质和物品等级 SHALL 与所在副本的推荐等级匹配。

#### Scenario: 低级副本装备品质
- **WHEN** 副本推荐等级 ≤ 30
- **THEN** 装备品质 SHALL 以 uncommon 和 rare 为主，极少 epic

#### Scenario: 中级副本装备品质
- **WHEN** 副本推荐等级在 30-50 之间
- **THEN** 装备品质 SHALL 以 rare 为主，少量 epic

#### Scenario: 高级副本装备品质
- **WHEN** 副本推荐等级 ≥ 50
- **THEN** 装备品质 SHALL 以 rare 和 epic 为主

#### Scenario: 装备物品等级计算
- **WHEN** 副本推荐等级最大值为 N
- **THEN** 装备的 itemLevel SHALL 在 N 到 N+10 范围内
