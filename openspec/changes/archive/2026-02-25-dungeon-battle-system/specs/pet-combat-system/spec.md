## 新增需求

### 需求: 宠物作为附属单位
系统应将宠物实现为不占据战场格子的附属单位。

#### 场景: 宠物不占位置
- **给定** 猎人在位置3
- **当** 猎人的宠物在场时
- **那么** 宠物不占据任何战场位置
- **并且** 宠物视觉上显示在猎人附近

#### 场景: 宠物跟随主人
- **给定** 宠物的主人存活
- **当** 显示宠物位置时
- **那么** 宠物始终显示在主人位置旁边

### 需求: 宠物攻击目标
系统应让宠物跟随主人的攻击目标。

#### 场景: 跟随主人目标
- **给定** 猎人选择攻击敌人X
- **当** 宠物进行攻击时
- **那么** 宠物也攻击敌人X

#### 场景: 主人目标阵亡
- **给定** 主人当前目标阵亡
- **当** 宠物需要选择目标时
- **那么** 宠物攻击主人的新目标
- **或者** 如果主人无目标，攻击最近的敌人

### 需求: 宠物混合行动
系统应实现宠物的技能触发和自动攻击混合行动模式。

#### 场景: 技能触发攻击
- **给定** 主人使用"命令宠物攻击"技能
- **当** 技能释放时
- **那么** 宠物立即执行一次强化攻击

#### 场景: 自动攻击
- **给定** 主人回合结束
- **当** 宠物存活时
- **那么** 宠物自动执行一次普通攻击
- **并且** 不消耗主人的行动点

#### 场景: 宠物特殊技能
- **给定** 宠物有特殊技能（如撕咬、撕裂）
- **当** 满足触发条件时
- **那么** 宠物有概率使用特殊技能替代普通攻击

### 需求: 宠物独立HP
系统应为宠物实现独立的生命值系统。

#### 场景: 宠物血量
- **给定** 宠物被召唤
- **当** 初始化宠物时
- **那么** 宠物有独立的最大HP
- **并且** 宠物有独立的当前HP

#### 场景: 宠物受伤
- **给定** 敌人攻击宠物
- **当** 计算伤害时
- **那么** 伤害从宠物HP扣除
- **并且** 不影响主人HP

#### 场景: 宠物阵亡
- **给定** 宠物HP降至0
- **当** 宠物阵亡时
- **那么** 宠物无法继续攻击
- **并且** 宠物可被复活技能复活

#### 场景: 主人阵亡导致宠物阵亡
- **给定** 宠物的主人HP降至0
- **当** 主人阵亡时
- **那么** 宠物同时阵亡（HP归零、isAlive置为false）
- **并且** 宠物清除当前攻击目标
- **并且** 日志输出"💀 {宠物emoji} {宠物名} 随主人一同倒下了！"
- **备注** 此规则适用于所有导致主人阵亡的路径（直接伤害、AI技能同步、DOT致死）

#### 场景: 宠物复活
- **给定** 宠物已阵亡
- **当** 主人使用复活宠物技能时
- **那么** 宠物以部分HP复活
- **并且** 宠物恢复攻击能力

### 需求: MVP统一宠物机制
系统应在MVP阶段对猎人和术士使用相同的宠物机制。

#### 场景: 猎人宠物
- **给定** 猎人职业
- **当** 战斗开始时
- **那么** 猎人自动拥有野兽宠物
- **并且** 使用通用宠物机制

#### 场景: 术士宠物
- **给定** 术士职业
- **当** 战斗开始时
- **那么** 术士自动拥有恶魔宠物
- **并且** 使用通用宠物机制（与猎人相同）

---

## 数据结构

### 宠物配置
```javascript
const PET_CONFIG = {
  hunter_pet: {
    name: '野兽',
    baseHp: 150,
    hpPerLevel: 15,
    baseDamage: 20,
    damagePerLevel: 2,
    attackType: 'physical',
    specialSkills: [
      { id: 'bite', name: '撕咬', chance: 0.2, damageMultiplier: 1.5 },
      { id: 'claw', name: '爪击', chance: 0.15, effect: 'bleed' },
    ],
  },
  warlock_pet: {
    name: '恶魔',
    baseHp: 120,
    hpPerLevel: 12,
    baseDamage: 25,
    damagePerLevel: 2.5,
    attackType: 'shadow',
    specialSkills: [
      { id: 'firebolt', name: '火焰弹', chance: 0.25, damageMultiplier: 1.3 },
      { id: 'consume', name: '吞噬', chance: 0.1, effect: 'lifesteal' },
    ],
  },
};
```

### 宠物状态
```javascript
const petState = {
  petId: 'hunter_pet_1',
  ownerId: 'player_hunter',
  name: '猎人的宠物',
  type: 'hunter_pet',
  
  maxHp: 180,
  currentHp: 180,
  isAlive: true,
  
  damage: 28,
  attackType: 'physical',
  
  // 跟随主人的目标
  currentTarget: null,
};
```

### 宠物行动事件
```javascript
const petActionEvent = {
  type: 'pet_action',
  petId: 'hunter_pet_1',
  actionType: 'auto_attack',    // 'auto_attack' | 'skill_trigger' | 'special_skill'
  targetId: 'enemy_serpentis',
  skillUsed: null,              // 特殊技能ID
  damage: 28,
  effects: [],
};
```

### 主人宠物关联
```javascript
const ownerPetMapping = {
  'player_hunter': {
    hasPet: true,
    petId: 'hunter_pet_1',
    petType: 'hunter_pet',
  },
  'ai_warlock': {
    hasPet: true,
    petId: 'warlock_pet_1', 
    petType: 'warlock_pet',
  },
};
```
