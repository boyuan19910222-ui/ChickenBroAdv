## Why

圣骑士当前有 7 个基础技能，远超战士的 4 个，导致天赋"解锁技能"的成长感薄弱。同时缺少圣骑士标志性的圣印(Seal)+审判(Judgement)机制，职业辨识度不足。需要参照战士的 4 基础+9 天赋解锁=13 总技能模式，对圣骑士技能和天赋进行全面重设计。

## What Changes

- **精简基础技能**: 从 7 个减少为 4 个（十字军打击、正义圣印、审判、圣光术），其余 5 个技能移入天赋树解锁
- **新增圣印/审判机制**: 圣印作为 self-buff（持续 3 回合，攻击附加效果），审判消耗圣印爆发。3 个圣印分别对应 3 棵天赋树
- **重写三棵天赋树**: 每棵树 T1~T5 共 8~9 节点，其中 3 个解锁技能（T2/T3~T4/T5），总计 9 个天赋解锁技能
- **新增 specialMechanic: 'seal'**: 在 ClassMechanics.js 中注册圣印系统
- **新增 4 个全新技能**: 光明圣印、命令圣印、神圣愤怒(holyWrath)、惩戒之锤(hammerOfWrath)
- **调整已有技能解锁方式**: 制裁之锤/奉献/保护祝福/神圣之盾/圣疗术从基础改为天赋解锁
- **新增审判(judgement)技能**: 消耗当前圣印造成高额伤害+触发圣印特殊效果
- **新增十字军光环(crusaderAura)技能**: 惩戒树 T4 解锁，全队攻击力 buff
- **新增神圣震击(holyShock)技能**: 神圣树 T4 解锁，攻击/治疗双用

## Capabilities

### New Capabilities
- `seal-system`: 圣骑士圣印+审判机制——圣印激活/覆盖/消耗逻辑、3 种圣印效果、审判触发效果

### Modified Capabilities
- (无已有 spec 需要修改)

## Impact

- `src/data/GameData.js` — 技能定义大幅修改，圣骑士职业 skills 数组变更，新增 specialMechanic
- `src/data/TalentData.js` — 圣骑士三棵天赋树完全重写
- `src/data/ClassMechanics.js` — 新增圣印系统定义
- 战斗系统需后续适配圣印 effect type（本次变更仅做数据层，战斗逻辑适配为后续变更）
