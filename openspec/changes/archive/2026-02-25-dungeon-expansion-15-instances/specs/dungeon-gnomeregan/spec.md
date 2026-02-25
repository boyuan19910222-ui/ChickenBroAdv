## ADDED Requirements

### Requirement: 诺莫瑞根副本数据
系统 SHALL 定义诺莫瑞根副本的完整配置，推荐等级 29-38，包含 4 个 BOSS。

#### Scenario: 副本基础信息
- **WHEN** 查看诺莫瑞根副本信息
- **THEN** 系统 SHALL 显示：名称"诺莫瑞根"、等级范围 29-38、emoji ⚙️
- **THEN** 描述 SHALL 为"被辐射污染的侏儒地下城市，充满变异生物和疯狂机械"

### Requirement: BOSS - 粘稠辐射者
粘稠辐射者 SHALL 为自然 AOE 型 BOSS。

#### Scenario: 粘稠辐射者技能
- **WHEN** 粘稠辐射者行动
- **THEN** 可使用技能：辐射（nature DOT all_enemies 2 回合）、黏液（debuff 降低速度 2 回合）

### Requirement: BOSS - 群体翻转者(Grubbis)
格拉比斯 SHALL 为召唤型 BOSS。

#### Scenario: 格拉比斯技能
- **WHEN** 格拉比斯行动
- **THEN** 可使用技能：召唤矿工小怪（summon）、炸弹投掷（telegraph 1 回合 front_3 高伤害）

### Requirement: BOSS - 电刑器6000
电刑器 SHALL 为闪电型 BOSS，P2 超载。

#### Scenario: 电刑器技能
- **WHEN** 电刑器行动
- **THEN** P1 可使用技能：闪电链（front_3 nature 伤害）、电击（stun 1 回合 + nature 伤害）
- **WHEN** 电刑器 HP 降至 40%
- **THEN** P2 超载：damageModifier 翻倍，actionsPerTurn +1

### Requirement: BOSS - 麦克尼尔·瑟玛普拉格
瑟玛普拉格 SHALL 为终极 BOSS，使用炸弹阵和召唤机器人。

#### Scenario: 瑟玛普拉格技能
- **WHEN** 瑟玛普拉格行动
- **THEN** 可使用技能：炸弹阵（telegraph 1 回合 all_enemies 高伤害）、召唤炸弹机器人（summon，2 回合后自爆 AOE）
- **THEN** 狂暴计时器 SHALL 为 15 回合

### Requirement: 诺莫瑞根经典掉落
副本 SHALL 配置 5-8 件经典装备。

#### Scenario: 经典掉落列表
- **WHEN** 通关诺莫瑞根
- **THEN** 经典掉落池 SHALL 包含相应等级标志性装备
