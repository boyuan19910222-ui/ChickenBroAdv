## ADDED Requirements

### Requirement: 死亡矿井副本数据
系统 SHALL 定义死亡矿井副本的完整配置，推荐等级 17-26，包含 5 个 BOSS。

#### Scenario: 副本基础信息
- **WHEN** 查看死亡矿井副本信息
- **THEN** 系统 SHALL 显示：名称"死亡矿井"、等级范围 17-26、emoji ⛏️
- **THEN** 描述 SHALL 为"迪菲亚兄弟会在西部荒野矿洞中的秘密基地"

### Requirement: BOSS - 采矿傀儡(Rhahk'Zor)
采矿傀儡 SHALL 为重型近战 BOSS。

#### Scenario: 采矿傀儡技能
- **WHEN** 采矿傀儡行动
- **THEN** 可使用技能：雷霆劈砍（front_2 物理伤害）、地面砸击（telegraph 1 回合蓄力 all_enemies 高伤害）

### Requirement: BOSS - 斯奈德(Sneed)
斯奈德 SHALL 为 2 阶段 BOSS：P1 伐木机形态，P2 斯奈德跳出。

#### Scenario: 斯奈德阶段转换
- **WHEN** 伐木机 HP 降至 0
- **THEN** 系统 SHALL 触发阶段转换：伐木机销毁，生成斯奈德本体（较低 HP，高伤害）
- **THEN** 斯奈德可使用：拆解（高伤单体物理）、丢弃零件（random_2 物理 + debuff）

### Requirement: BOSS - 基尔尼格(Gilnid)
基尔尼格 SHALL 为熔炉型 BOSS，使用 DOT 和召唤。

#### Scenario: 基尔尼格技能
- **WHEN** 基尔尼格行动
- **THEN** 可使用技能：熔铜浇灌（fire DOT 3 回合）、召唤傀儡（summon 1 个低 HP 小怪）

### Requirement: BOSS - 斯莫特先生(Mr. Smite)
斯莫特 SHALL 为 3 阶段切武器 BOSS，每个阶段使用不同技能组。

#### Scenario: 斯莫特三阶段
- **WHEN** 斯莫特 HP 降至 66%
- **THEN** 系统 SHALL 触发 P2：切换大锤（高伤慢速，震击 stun 1 回合）
- **WHEN** 斯莫特 HP 降至 33%
- **THEN** 系统 SHALL 触发 P3：切换双剑（快速连击，actionsPerTurn +1，旋风斩 all_enemies）

### Requirement: BOSS - 艾德温·范克里夫(Edwin VanCleef)
范克里夫 SHALL 为终极 BOSS，使用潜行/毒刃/召唤护卫。

#### Scenario: 范克里夫技能
- **WHEN** 范克里夫行动
- **THEN** P1 可使用：消失+偷袭（telegraph 1 回合 → 高暴击单体）、毒刃（nature DOT）
- **WHEN** 范克里夫 HP 降至 30%
- **THEN** P2 触发：召唤 2 个迪菲亚护卫（summon）、进入狂暴（伤害+40%）

### Requirement: 死亡矿井经典掉落
副本 SHALL 配置 5-8 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关死亡矿井
- **THEN** 经典掉落池 SHALL 包含：斯莫特的强力之锤、迪菲亚弯刀、范克里夫的斗篷等标志性装备
