## 新增需求

### 需求: 默认队伍模板
系统应提供副本的默认AI队伍配置。

#### 场景: 默认队伍组成
- **给定** 玩家进入副本
- **当** 初始化队伍时
- **那么** 默认队伍包含：
  - 位置1：坦克（战士）
  - 位置2：近战DPS（盗贼）
  - 位置3：远程DPS（猎人）
  - 位置4：远程DPS（术士）
  - 位置5：治疗（牧师）

### 需求: 动态玩家替换
系统应根据玩家职业动态替换对应的AI角色。

#### 场景: 玩家替换同职业AI
- **给定** 玩家职业为盗贼
- **当** 组建队伍时
- **那么** 玩家替换位置2的AI盗贼
- **并且** 玩家控制位置2

#### 场景: 玩家职业不在默认队伍
- **给定** 玩家职业为法师（默认队伍无法师）
- **当** 组建队伍时
- **那么** 玩家替换位置3或4的远程DPS
- **并且** 根据定位选择替换位置

### 需求: 职业定位映射
系统应根据职业和天赋确定角色定位。

#### 场景: 纯职业定位
- **给定** 职业有固定定位
- **当** 确定角色定位时
- **那么** 按职业默认定位分配：
  - 战士 → 坦克
  - 盗贼 → 近战DPS
  - 猎人 → 远程DPS
  - 术士 → 远程DPS
  - 牧师 → 治疗

#### 场景: 混合职业定位（有天赋）
- **给定** 玩家是圣骑士，选择了防护天赋
- **当** 确定角色定位时
- **那么** 定位为坦克
- **并且** 分配到位置1

#### 场景: 混合职业定位（无天赋）
- **给定** 玩家是圣骑士，未选择天赋
- **当** 确定角色定位时
- **那么** 使用职业默认定位（圣骑士默认为近战DPS或坦克）

### 需求: 定位到站位映射
系统应根据角色定位自动分配战场站位。

#### 场景: 定位站位规则
- **给定** 角色定位确定
- **当** 分配站位时
- **那么** 按规则分配：
  - 坦克 → 位置1
  - 近战DPS → 位置2
  - 远程DPS → 位置3或4
  - 治疗 → 位置5

#### 场景: 多个同定位角色
- **给定** 队伍有2个远程DPS
- **当** 分配站位时
- **那么** 第一个远程DPS分配位置3
- **并且** 第二个远程DPS分配位置4

---

## 数据结构

### 默认队伍模板
```javascript
const DEFAULT_PARTY_TEMPLATE = [
  { slot: 1, role: 'tank', defaultClass: 'warrior', name: 'AI坦克' },
  { slot: 2, role: 'melee_dps', defaultClass: 'rogue', name: 'AI近战' },
  { slot: 3, role: 'ranged_dps', defaultClass: 'hunter', name: 'AI猎人' },
  { slot: 4, role: 'ranged_dps', defaultClass: 'warlock', name: 'AI术士' },
  { slot: 5, role: 'healer', defaultClass: 'priest', name: 'AI治疗' },
];
```

### 职业定位映射
```javascript
const CLASS_DEFAULT_ROLE = {
  warrior: 'tank',
  paladin: 'tank',        // 默认坦克，可变
  rogue: 'melee_dps',
  hunter: 'ranged_dps',
  mage: 'ranged_dps',
  warlock: 'ranged_dps',
  priest: 'healer',
  shaman: 'healer',       // 默认治疗，可变
  druid: 'healer',        // 默认治疗，可变
};
```

### 天赋定位覆盖
```javascript
const TALENT_ROLE_OVERRIDE = {
  // 圣骑士
  paladin_holy: 'healer',
  paladin_protection: 'tank',
  paladin_retribution: 'melee_dps',
  
  // 德鲁伊
  druid_balance: 'ranged_dps',
  druid_feral: 'melee_dps',  // 或tank
  druid_restoration: 'healer',
  
  // 萨满
  shaman_elemental: 'ranged_dps',
  shaman_enhancement: 'melee_dps',
  shaman_restoration: 'healer',
  
  // 战士
  warrior_arms: 'melee_dps',
  warrior_fury: 'melee_dps',
  warrior_protection: 'tank',
  
  // 牧师
  priest_discipline: 'healer',
  priest_holy: 'healer',
  priest_shadow: 'ranged_dps',
};
```

### 定位站位映射
```javascript
const ROLE_TO_SLOT = {
  tank: [1],
  melee_dps: [2],
  ranged_dps: [3, 4],
  healer: [5],
};
```

### 队伍状态
```javascript
const partyState = {
  members: [
    { slot: 1, unitId: 'ai_warrior', isPlayer: false, role: 'tank' },
    { slot: 2, unitId: 'player_rogue', isPlayer: true, role: 'melee_dps' },
    { slot: 3, unitId: 'ai_hunter', isPlayer: false, role: 'ranged_dps' },
    { slot: 4, unitId: 'ai_warlock', isPlayer: false, role: 'ranged_dps' },
    { slot: 5, unitId: 'ai_priest', isPlayer: false, role: 'healer' },
  ],
  playerSlot: 2,
};
```
