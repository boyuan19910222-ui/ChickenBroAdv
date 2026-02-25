## 新增需求

### 需求: 哀嚎洞穴副本信息
系统应定义哀嚎洞穴副本的基础配置。

#### 场景: 副本信息
- **给定** 玩家查看哀嚎洞穴
- **当** 显示副本信息时
- **那么** 显示：
  - 名称：哀嚎洞穴
  - 推荐等级：1-3级
  - 难度：普通
  - 描述：贫瘠之地深处的洞穴，被变异的德鲁伊和毒蛇占据

### 需求: 第一波小怪
系统应定义哀嚎洞穴第一波遭遇的小怪配置。

#### 场景: 小怪配置
- **给定** 玩家进入战斗
- **当** 第一波开始时
- **那么** 生成敌人：
  - 位置1：狂热者（中等速度，近战）
  - 位置2：毒蛇（快速，毒伤害）
  - 位置3：蝙蝠（极快，弱攻击）
  - 位置4：蝙蝠（极快，弱攻击）
  - 位置5：迅猛龙（中速，高伤害，附带减甲debuff）

### 需求: 瑟芬迪斯BOSS
系统应定义瑟芬迪斯BOSS的完整配置。

#### 场景: BOSS基础属性
- **给定** 玩家到达BOSS战
- **当** BOSS生成时
- **那么** 瑟芬迪斯属性：
  - HP：800
  - 速度：60
  - 位置：敌方位置2
  - 攻击类型：自然/毒

#### 场景: 阶段1技能
- **给定** BOSS血量100%-70%
- **当** BOSS行动时
- **那么** 可使用技能：
  - 毒液喷射：远程攻击，造成毒伤害
  - 尾巴横扫：近战AOE，攻击前2个逻辑位置

#### 场景: 阶段2技能和事件
- **给定** BOSS血量降至70%
- **当** 阶段转换时
- **那么** 显示："瑟芬迪斯召唤了触手藤！"
- **并且** 在位置3生成触手藤敌人
- **并且** 解锁新技能：缠绕（控制1名玩家1回合）

#### 场景: 阶段3技能和强化
- **给定** BOSS血量降至40%
- **当** 阶段转换时
- **那么** 显示："瑟芬迪斯进入狂暴蜕变！"
- **并且** BOSS伤害+30%
- **并且** 每回合行动次数变为3
- **并且** 解锁新技能：剧毒爆发（全体AOE，需蓄力1回合）

### 需求: 触手藤敌人
系统应定义阶段2召唤的触手藤配置。

#### 场景: 触手藤属性
- **给定** 阶段2触发召唤
- **当** 触手藤生成时
- **那么** 属性：
  - HP：200
  - 速度：30（慢）
  - 攻击：缠绕（单体控制）

---

## 数据结构

### 副本基础配置
```javascript
const WAILING_CAVERNS = {
  id: 'wailing_caverns',
  name: '哀嚎洞穴',
  description: '贫瘠之地深处的洞穴，被变异的德鲁伊和毒蛇占据。',
  levelRange: { min: 1, max: 3 },
  difficulty: 'normal',
  
  encounters: [
    { id: 'wave_1', type: 'trash', name: '洞穴入口' },
    { id: 'boss_serpentis', type: 'boss', name: '瑟芬迪斯' },
  ],
};
```

### 第一波小怪配置
```javascript
const WAVE_1_CONFIG = {
  id: 'wave_1',
  enemies: [
    {
      id: 'cultist_1',
      name: '狂热者',
      type: 'cultist',
      slot: 1,
      hp: 120,
      speed: 55,
      damage: 15,
      skills: ['melee_attack', 'frenzy'],
    },
    {
      id: 'snake_1',
      name: '毒蛇',
      type: 'snake',
      slot: 2,
      hp: 80,
      speed: 80,
      damage: 12,
      skills: ['poison_bite'],
    },
    {
      id: 'bat_1',
      name: '蝙蝠',
      type: 'bat',
      slot: 3,
      hp: 50,
      speed: 90,
      damage: 8,
      skills: ['screech'],
    },
    {
      id: 'bat_2',
      name: '蝙蝠',
      type: 'bat',
      slot: 4,
      hp: 50,
      speed: 90,
      damage: 8,
      skills: ['screech'],
    },
    {
      id: 'raptor_1',
      name: '迅猛龙',
      type: 'raptor',
      slot: 5,
      hp: 100,
      speed: 75,
      damage: 18,
      skills: ['claw_strike', 'pounce'],
    },
  ],
};
```

### 瑟芬迪斯BOSS配置
```javascript
const BOSS_SERPENTIS = {
  id: 'serpentis',
  name: '变异的瑟芬迪斯',
  type: 'boss',
  slot: 2,
  
  baseStats: {
    hp: 800,
    speed: 60,
    damage: 35,
    armor: 20,
  },
  
  phases: [
    {
      id: 1,
      name: '毒蛇之怒',
      hpThreshold: 1.0,
      actionsPerTurn: 2,
      damageModifier: 1.0,
      skills: ['venom_spit', 'tail_sweep'],
    },
    {
      id: 2,
      name: '触手召唤',
      hpThreshold: 0.7,
      actionsPerTurn: 2,
      damageModifier: 1.0,
      skills: ['venom_spit', 'tail_sweep', 'entangle'],
      onEnter: {
        type: 'summon',
        summonId: 'tendril_vine',
        slot: 3,
        message: '瑟芬迪斯召唤了触手藤！',
      },
    },
    {
      id: 3,
      name: '狂暴蜕变',
      hpThreshold: 0.4,
      actionsPerTurn: 3,
      damageModifier: 1.3,
      skills: ['venom_spit', 'tail_sweep', 'entangle', 'toxic_burst'],
      onEnter: {
        type: 'transform',
        message: '瑟芬迪斯进入狂暴蜕变！',
      },
    },
  ],
  
  enrage: {
    triggerRound: 15,
    damageModifier: 2.0,
    aoePerRound: {
      damage: 50,
      type: 'poison',
      message: '剧毒弥漫整个洞穴！',
    },
    message: '瑟芬迪斯狂暴了！',
  },
};
```

### BOSS技能配置
```javascript
const SERPENTIS_SKILLS = {
  venom_spit: {
    id: 'venom_spit',
    name: '毒液喷射',
    description: '向目标喷射毒液，造成自然伤害并附加中毒效果',
    targetType: 'single',
    range: 'ranged',
    damage: 40,
    damageType: 'nature',
    effect: {
      type: 'dot',
      id: 'poison',
      damage: 10,
      duration: 3,
    },
  },
  
  tail_sweep: {
    id: 'tail_sweep',
    name: '尾巴横扫',
    description: '用尾巴横扫前排敌人',
    targetType: 'front_2',     // 攻击逻辑位置前2
    range: 'melee',
    damage: 30,
    damageType: 'physical',
  },
  
  entangle: {
    id: 'entangle',
    name: '缠绕',
    description: '用藤蔓缠绕一名敌人，使其无法行动',
    targetType: 'single',
    range: 'ranged',
    damage: 0,
    effect: {
      type: 'cc',
      id: 'stun',
      duration: 1,
    },
  },
  
  toxic_burst: {
    id: 'toxic_burst',
    name: '剧毒爆发',
    description: '释放剧毒气体，对所有敌人造成大量伤害',
    targetType: 'all_enemies',
    range: 'ranged',
    damage: 60,
    damageType: 'nature',
    telegraph: {
      chargeRounds: 1,
      chargeMessage: '瑟芬迪斯正在准备【剧毒爆发】！',
      warningIcon: '☠️',
    },
  },
};
```

### 触手藤配置
```javascript
const TENDRIL_VINE = {
  id: 'tendril_vine',
  name: '触手藤',
  type: 'add',
  
  stats: {
    hp: 200,
    speed: 30,
    damage: 20,
    armor: 5,
  },
  
  skills: ['vine_whip', 'constrict'],
};

const TENDRIL_SKILLS = {
  vine_whip: {
    id: 'vine_whip',
    name: '藤鞭',
    targetType: 'single',
    damage: 20,
    damageType: 'nature',
  },
  constrict: {
    id: 'constrict',
    name: '收缩',
    targetType: 'single',
    damage: 15,
    effect: {
      type: 'debuff',
      id: 'slow',
      duration: 2,
    },
  },
};
```
