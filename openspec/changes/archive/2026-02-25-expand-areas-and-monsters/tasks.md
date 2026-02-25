## 1. 法师类技能定义

- [x] 1.1 在 GameData.js 的技能数据中添加 7 个法师类技能定义（fireball, frostBolt, shadowBolt, heal, curseOfWeakness, poisonCloud, lightningBolt），包含 id/name/emoji/description/type/scalingStat/scalingFactor/targetType/duration 等属性

## 2. 怪物属性公式与数据生成

- [x] 2.1 实现怪物属性公式函数（开发辅助用），基于等级计算 HP/Str/Agi/Int/Sta/Exp/Gold，再乘以 melee/caster 系数
- [x] 2.2 使用公式重新生成现有 4 区域 24 种怪物的属性值，添加 monsterType 字段，确保数值与公式一致
- [x] 2.3 生成 11 个新区域共约 116 种新怪物的完整数据（id/name/emoji/level/monsterType/hp/strength/agility/intellect/stamina/skills/exp/gold），按区域分区注释

## 3. 区域数据扩展

- [x] 3.1 为现有 4 个区域添加 unlockRequires 字段，补充怪物列表到 8-10 种（含新增法师类怪物）
- [x] 3.2 添加 11 个新区域定义（dunMorogh/duskwood/wetlands/badlands/searingGorge/hinterlands/felwood/winterspring/burningSteppes/blstedLands/silithus），每个包含完整字段和 8-10 种怪物引用
- [x] 3.3 配置区域分支解锁拓扑（unlockRequires 前置关系）

## 4. 验证与调整

- [x] 4.1 验证所有怪物 ID 在 monsters 对象中存在且被至少一个区域引用
- [x] 4.2 验证每个区域的怪物数量（8-10）和类型平衡（melee/caster 差距 ≤1）
- [x] 4.3 验证区域解锁拓扑无环路且从 elwynnForest 可达所有区域
- [x] 4.4 构建验证（vite build 通过）
