## MODIFIED Requirements

### Requirement: DungeonLootConfig structure
Each dungeon SHALL have a loot config containing: `dungeonId`, `bossCount`, `recommendedLevelMax`, `iLvlOffset` [min, max], `qualityWeights` (uncommon/rare/epic), and optional `exclusiveDrops` array.

#### Scenario: 15 个副本均有掉落配置
- **WHEN** 查看 DungeonLootConfig
- **THEN** SHALL 包含所有 15 个副本（含血色修道院 4 翼和黑石塔 2 层，共 19 条配置）的掉落设置

#### Scenario: 怒焰裂谷掉落配置
- **WHEN** 查看 ragefire_chasm 的掉落配置
- **THEN** bossCount=4, recommendedLevelMax=18, iLvlOffset=[2,5], qualityWeights={uncommon:50, rare:40, epic:10}
- **THEN** exclusiveDrops SHALL 包含 3-5 件经典装备模板引用

#### Scenario: 斯坦索姆掉落配置
- **WHEN** 查看 stratholme 的掉落配置
- **THEN** bossCount=6, recommendedLevelMax=60, iLvlOffset=[5,12], qualityWeights={uncommon:20, rare:50, epic:30}
- **THEN** exclusiveDrops SHALL 包含 8-12 件经典装备模板引用

#### Scenario: 血色修道院各翼独立配置
- **WHEN** 查看血色修道院的掉落配置
- **THEN** sm_graveyard/sm_library/sm_armory/sm_cathedral SHALL 各自有独立的 DungeonLootConfig
- **THEN** 每个翼的 bossCount/recommendedLevelMax/exclusiveDrops SHALL 与该翼的 BOSS 数和等级对应

#### Scenario: 副本掉落品质随等级提升
- **WHEN** 比较低级副本（怒焰裂谷 Lv18）和高级副本（斯坦索姆 Lv60）的 qualityWeights
- **THEN** 高级副本的 epic 权重 SHALL 明显高于低级副本
- **THEN** 高级副本的 iLvlOffset SHALL 大于低级副本
