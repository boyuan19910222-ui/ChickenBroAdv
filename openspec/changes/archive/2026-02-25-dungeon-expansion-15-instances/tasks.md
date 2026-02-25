## 1. 基础架构与副本选择 UI

- [x] 1.1 创建 `DungeonRegistry.js` 副本注册表，预注册所有 15 个副本的元数据（id/name/emoji/description/levelRange/unlockLevel/bossCount/type），未实现的副本 dataModule 设为 null
- [x] 1.2 创建 `DungeonSelectDialog.vue` 副本选择弹窗组件，包含副本列表、等级锁定/已通关/开发中状态显示、副本详情面板、大副本二级翼/层选择
- [x] 1.3 修改 `GameHeader.vue` 副本按钮，从硬编码直接进入改为触发 DungeonSelectDialog 弹窗
- [x] 1.4 修改 dungeonCombat store，支持从选择界面启动任意副本（通过 DungeonRegistry 的 dataModule 动态加载副本数据）

## 2. Batch 1 — 低级副本（Lv 13-32）

- [x] 2.1 创建 `RagefireChasm.js` 怒焰裂谷副本数据（4 BOSS: 奥格芬格/塔拉加曼/杰格罗什/巴扎兰 + 8-12 波小怪）
- [x] 2.2 创建 `Deadmines.js` 死亡矿井副本数据（5 BOSS: 采矿傀儡/斯奈德[2阶段]/基尔尼格/斯莫特[3阶段换武器]/范克里夫 + 小怪波次）
- [x] 2.3 创建 `ShadowfangKeep.js` 影牙城堡副本数据（5 BOSS: 拉文凯斯/斯普林瓦尔/沃尔夫/沃尔登[双属性切换]/戈弗雷 + 小怪波次）
- [x] 2.4 创建 `StormwindStockade.js` 暴风城监狱副本数据（3 BOSS: 巴吉尔/德克斯特/卡姆 + 小怪波次）
- [x] 2.5 Batch 1 经典装备：在 `ClassicEquipment.js` 中添加怒焰/死矿/影牙/监狱的 ~20 件经典装备模板
- [x] 2.6 Batch 1 掉落配置：在 `DungeonLootConfigs.js` 中添加 4 个副本的 DungeonLootConfig

## 3. Batch 2 — 中级副本（Lv 29-55）

- [x] 3.1 创建 `Gnomeregan.js` 诺莫瑞根副本数据（4 BOSS: 粘稠辐射者/格拉比斯/电刑器6000[P2超载]/瑟玛普拉格 + 小怪波次）
- [x] 3.2 创建 `RazorfenKraul.js` 剃刀沼泽副本数据（4 BOSS: 阿格姆/苏拉比/拉莫斯/卡莉瑟 + 小怪波次）
- [x] 3.3 创建 `ScarletMonastery_GY.js` 血色修道院墓地翼（1 BOSS: 血色审讯官 + 小怪波次）
- [x] 3.4 创建 `ScarletMonastery_Lib.js` 血色修道院图书馆翼（2 BOSS: 洛克希/杜安 + 小怪波次）
- [x] 3.5 创建 `ScarletMonastery_Arm.js` 血色修道院军械库翼（1 BOSS: 赫洛德[旋风斩] + 小怪波次）
- [x] 3.6 创建 `ScarletMonastery_Cath.js` 血色修道院大教堂翼（3 BOSS: 弗尔席恩 + 莫格莱尼&怀特迈恩[双BOSS战/resurrect]）+ 小怪波次
- [x] 3.7 创建 `ZulFarrak.js` 祖尔法拉克副本数据（5 BOSS: 安图苏尔/赞达拉尔/乌克兹/首席执行官/加兹瑞拉[3阶段] + 小怪波次）
- [x] 3.8 创建 `Maraudon.js` 玛拉顿副本数据（5 BOSS: 诺克赛恩/维利塔恩/塞雷布拉斯/兰斯利德/瑟莱德斯[physicalImmune] + 小怪波次）
- [x] 3.9 Batch 2 经典装备：添加诺莫/剃刀/血色/祖尔/玛拉顿的 ~40 件经典装备模板
- [x] 3.10 Batch 2 掉落配置：添加 8 个副本翼的 DungeonLootConfig

## 4. Batch 3 — 高级副本（Lv 50-60）

- [x] 4.1 创建 `SunkenTemple.js` 阿塔哈卡神庙副本数据（5 BOSS: 阿塔莱守护者/梦游双龙/哈卡之影/伊兰尼库斯/加玛拉[charm] + 小怪波次）
- [x] 4.2 创建 `BlackrockSpire_Lower.js` 黑石塔下层（6 BOSS: 欧莫克/沃许/沃恩/兹格雷斯/嗜血双兽/维姆萨拉克 + 小怪波次）
- [x] 4.3 创建 `BlackrockSpire_Upper.js` 黑石塔上层（5 BOSS: 焰卫者/索拉卡/比斯巨兽/雷德+盖斯[双阶段]/达基萨斯 + 小怪波次）
- [x] 4.4 创建 `Stratholme.js` 斯坦索姆副本数据（6 BOSS: 提米/弗拉斯[charm]/奥里克斯/安娜丝塔丽[charm]/奈鲁布恩坎/瑞文戴尔男爵[3阶段] + 小怪波次）
- [x] 4.5 创建 `Scholomance.js` 通灵学院副本数据（6 BOSS: 基尔图诺斯/詹迪斯[幻象+spellReflect]/拉特格尔/维克提斯/克拉斯提诺夫/加丁[传送术] + 小怪波次）
- [x] 4.6 创建 `DireMaul.js` 厄运之槌副本数据（5 BOSS: 萨琳/伊利亚纳/托塞德林/戈多克大王/伊莫塔尔[3阶段] + 小怪波次）
- [x] 4.7 Batch 3 经典装备：添加阿塔哈卡/黑石塔/斯坦索姆/通灵/厄运的 ~50 件经典装备模板
- [x] 4.8 Batch 3 掉落配置：添加 8 个副本/层的 DungeonLootConfig

## 5. 新效果类型实现

- [x] 5.1 在战斗系统中实现 `spellReflect` 特殊 buff（法术伤害反射回施法者）
- [x] 5.2 在战斗系统中实现 `physicalImmune` / `magicImmune` 特殊 buff（对应伤害类型无效化显示"免疫"）
- [x] 5.3 在战斗系统中实现 `ccType: 'charm'` CC 效果（被控队友攻击队友，到期恢复）
- [x] 5.4 在 BossPhaseSystem 中实现 `resurrect` 阶段事件（复活 isDown 的 BOSS）和 `isDown` 倒下状态机制
- [x] 5.5 在 BossPhaseSystem 中实现双 BOSS 战支持（同场多个 BOSS 实体，独立阶段跟踪）

## 6. 验证与整合

- [x] 6.1 验证所有副本数据文件可正常导入且结构符合 dungeon-data-schema
- [x] 6.2 验证 DungeonRegistry 中所有 15 个副本的 dataModule 懒加载正常工作
- [x] 6.3 验证副本选择弹窗 UI 的等级锁定/已通关/开发中状态显示正确
- [x] 6.4 构建验证（vite build 通过）
