## 新增需求

### 需求: BOSS血量阶段
系统应根据BOSS血量百分比触发阶段转换。

#### 场景: 阶段1（满血阶段）
- **给定** BOSS血量在100%-70%之间
- **当** 战斗进行中时
- **那么** BOSS处于阶段1
- **并且** 使用阶段1技能组

#### 场景: 阶段2转换（70%血量）
- **给定** BOSS血量降至70%以下
- **当** 检测到血量阈值时
- **那么** 触发阶段2转换事件
- **并且** 播放阶段转换动画/对话
- **并且** 解锁阶段2新技能

#### 场景: 阶段3转换（40%血量）
- **给定** BOSS血量降至40%以下
- **当** 检测到血量阈值时
- **那么** 触发阶段3转换事件
- **并且** BOSS进入最终阶段

### 需求: BOSS多次行动
系统应根据BOSS阶段给予不同的行动次数。

#### 场景: 阶段1-2行动次数
- **给定** BOSS处于阶段1或阶段2
- **当** BOSS回合开始时
- **那么** BOSS获得2次行动机会

#### 场景: 阶段3行动次数
- **给定** BOSS处于阶段3
- **当** BOSS回合开始时
- **那么** BOSS获得3次行动机会

### 需求: 阶段特定技能
系统应在不同阶段解锁不同的BOSS技能。

#### 场景: 阶段解锁技能
- **给定** BOSS进入阶段2
- **当** 阶段转换完成时
- **那么** 阶段2专属技能变为可用
- **并且** 阶段1技能保持可用

#### 场景: 阶段强化
- **给定** BOSS进入阶段3
- **当** 阶段转换完成时
- **那么** BOSS获得属性强化（如伤害+30%）

### 需求: 阶段转换事件
系统应在阶段转换时触发特殊事件。

#### 场景: 召唤援军
- **给定** BOSS阶段转换配置包含"召唤"
- **当** 阶段转换触发时
- **那么** 在指定位置生成额外敌人

#### 场景: 技能预告
- **给定** BOSS阶段转换配置包含"大招"
- **当** 阶段转换触发时
- **那么** 显示即将释放的大招预告

### 需求: 狂暴计时器
系统应实现战斗时间限制的狂暴机制。

#### 场景: 狂暴计时
- **给定** 战斗开始
- **当** 战斗持续超过15回合时
- **那么** BOSS进入狂暴状态

#### 场景: 狂暴效果
- **给定** BOSS进入狂暴状态
- **当** 狂暴生效时
- **那么** BOSS伤害翻倍
- **并且** 每回合对全体玩家造成AOE伤害

#### 场景: 狂暴倒计时显示
- **给定** 战斗进行中
- **当** 玩家查看战斗界面时
- **那么** 显示距离狂暴的剩余回合数

### 需求: 技能预告系统
系统应在BOSS使用大招前显示预警。

#### 场景: 蓄力技能
- **给定** BOSS准备使用大招
- **当** BOSS行动时
- **那么** 显示"[BOSS名称]正在蓄力[技能名称]！"
- **并且** BOSS进入蓄力状态

#### 场景: 蓄力释放
- **给定** BOSS处于蓄力状态
- **当** 下一回合BOSS行动时
- **那么** 释放蓄力的大招
- **并且** 蓄力状态结束

---

## 数据结构

### BOSS阶段配置
```javascript
const BOSS_PHASE_CONFIG = {
  serpentis: {
    phases: [
      {
        id: 1,
        name: '普通阶段',
        hpThreshold: 1.0,     // 100%血量开始
        actionsPerTurn: 2,
        skills: ['venom_spit', 'tail_sweep'],
        damageModifier: 1.0,
      },
      {
        id: 2,
        name: '触手阶段',
        hpThreshold: 0.7,     // 70%血量触发
        actionsPerTurn: 2,
        skills: ['venom_spit', 'tail_sweep', 'entangle'],
        damageModifier: 1.0,
        onEnter: {
          type: 'summon',
          enemies: ['tendril_vine'],
          message: '瑟芬迪斯召唤了触手藤！',
        }
      },
      {
        id: 3,
        name: '狂暴蜕变',
        hpThreshold: 0.4,     // 40%血量触发
        actionsPerTurn: 3,
        skills: ['venom_spit', 'tail_sweep', 'entangle', 'toxic_burst'],
        damageModifier: 1.3,  // 伤害+30%
        onEnter: {
          type: 'buff',
          message: '瑟芬迪斯进入狂暴蜕变！',
        }
      }
    ],
    enrage: {
      triggerRound: 15,
      damageModifier: 2.0,
      aoePerRound: {
        damage: 50,
        type: 'poison',
      },
      message: '瑟芬迪斯狂暴了！',
    }
  }
};
```

### 技能预告配置
```javascript
const TELEGRAPH_SKILLS = {
  toxic_burst: {
    chargeRounds: 1,
    chargeMessage: '瑟芬迪斯正在准备【剧毒爆发】！',
    releaseMessage: '瑟芬迪斯释放了【剧毒爆发】！',
    warningIcon: '☠️',
  }
};
```

### BOSS状态
```javascript
const bossState = {
  bossId: 'serpentis',
  currentPhase: 1,
  currentHpPercent: 0.85,
  isEnraged: false,
  roundCount: 5,
  isCharging: false,
  chargingSkill: null,
  chargeRoundsRemaining: 0,
};
```
