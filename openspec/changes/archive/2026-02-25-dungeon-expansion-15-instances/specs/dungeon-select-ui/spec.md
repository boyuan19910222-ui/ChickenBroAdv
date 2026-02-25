## ADDED Requirements

### Requirement: 副本选择弹窗组件
系统 SHALL 提供 `DungeonSelectDialog.vue` 弹窗组件，由 GameHeader 的副本按钮触发显示。

#### Scenario: 点击副本按钮打开弹窗
- **WHEN** 玩家点击 GameHeader 中的"🏰 副本"按钮
- **THEN** 系统 SHALL 显示副本选择弹窗
- **THEN** 弹窗 SHALL 展示所有 15 个副本入口的列表

#### Scenario: 关闭弹窗
- **WHEN** 玩家点击弹窗的关闭按钮或弹窗外区域
- **THEN** 弹窗 SHALL 关闭并返回主界面

### Requirement: 副本列表按等级排序展示
弹窗 SHALL 按副本推荐等级从低到高固定排序展示所有副本。不提供筛选功能。

#### Scenario: 列表排序
- **WHEN** 弹窗打开显示副本列表
- **THEN** 副本 SHALL 按 `unlockLevel` 从小到大排列
- **THEN** 每个副本条目 SHALL 显示：emoji、名称、等级范围、状态图标

### Requirement: 副本等级锁定
玩家等级不足时 SHALL 锁定对应副本，不可进入。

#### Scenario: 等级不足锁定
- **WHEN** 玩家等级 < 副本的 `unlockLevel`
- **THEN** 副本条目 SHALL 显示 🔒 锁定图标
- **THEN** 副本条目 SHALL 显示"需 Lv{unlockLevel}"
- **THEN** 点击该副本 SHALL 不触发任何操作（或显示提示）

#### Scenario: 等级足够解锁
- **WHEN** 玩家等级 >= 副本的 `unlockLevel`
- **THEN** 副本条目 SHALL 显示为可选状态

### Requirement: 副本通关状态显示
已通关的副本 SHALL 显示 ✅ 标记。

#### Scenario: 已通关副本
- **WHEN** 玩家已成功通关某个副本
- **THEN** 该副本条目 SHALL 显示 ✅ 已通关标记

#### Scenario: 未通关但已解锁
- **WHEN** 玩家等级足够但未通关某副本
- **THEN** 该副本条目 SHALL 显示 ⚔️ 可进入状态

### Requirement: 副本详情面板
选择副本后 SHALL 在弹窗内显示详情信息。

#### Scenario: 查看副本详情
- **WHEN** 玩家点击某个已解锁的副本条目
- **THEN** 弹窗 SHALL 显示副本详情面板
- **THEN** 详情 SHALL 包含：副本名称、描述、等级范围、BOSS 数量、预计时间、经典掉落预览
- **THEN** 详情面板 SHALL 包含 [⚔️ 进入副本] 按钮

#### Scenario: 点击进入副本
- **WHEN** 玩家在详情面板点击"进入副本"按钮
- **THEN** 系统 SHALL 关闭弹窗并启动该副本战斗（调用 `startDungeon(dungeonId)`）

### Requirement: 大副本二级选择
`multi-wing` 类型的副本（血色修道院、黑石塔）SHALL 显示翼/层的二级选择列表。

#### Scenario: 血色修道院展开翼列表
- **WHEN** 玩家点击血色修道院
- **THEN** 系统 SHALL 展开显示 4 个翼：墓地、图书馆、军械库、大教堂
- **THEN** 每个翼 SHALL 独立显示等级范围、BOSS 数量、状态

#### Scenario: 黑石塔展开层列表
- **WHEN** 玩家点击黑石塔
- **THEN** 系统 SHALL 展开显示 2 个层：下层、上层
- **THEN** 每个层 SHALL 独立显示等级范围、BOSS 数量、状态

#### Scenario: 选择翼/层进入
- **WHEN** 玩家点击某个翼/层的条目并查看详情
- **THEN** 系统 SHALL 以该翼/层为单位进入副本（调用 `startDungeon(wingId)`）

### Requirement: 副本数据尚未实现时的占位显示
未实现的副本 SHALL 在 UI 中显示"开发中"状态，不可进入。

#### Scenario: 未实现副本显示
- **WHEN** 副本注册表中的副本 `dataModule` 为 null 或未定义
- **THEN** 该副本条目 SHALL 显示"🚧 开发中"标记
- **THEN** 点击该副本 SHALL 不触发进入操作
