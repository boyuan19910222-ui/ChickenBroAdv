## Purpose

定义圣骑士的圣印(Seal)+审判(Judgement)核心机制，包括圣印激活/覆盖/消耗逻辑和 3 种圣印效果。

## Requirements

### REQ-1: 圣印激活与管理
- 圣印为 self-buff 技能，消耗 15 mana，1 AP，无冷却
- 同一时间只能有 1 个圣印激活，新圣印覆盖旧圣印
- 圣印持续 3 回合
- 圣印激活期间，施法者所有物理/圣光攻击附带圣印的 onHit 效果

### REQ-2: 三种圣印
| 圣印 | 解锁方式 | onHit 效果 | 审判效果 |
|------|----------|-----------|---------|
| 正义圣印(sealOfJustice) | 基础Lv1 | 攻击附加 8 圣光伤害 | 高额圣光伤害(35+1.5×STR) |
| 光明圣印(sealOfLight) | 神圣T2天赋 | 攻击吸血 15% | 伤害+自身治疗(30+1.2×INT) |
| 命令圣印(sealOfCommand) | 惩戒T2天赋 | 30%几率附加 70% 额外圣光伤害 | 伤害+眩晕 1 回合 |

### REQ-3: 审判(Judgement)技能
- 25 mana, 1 AP, 冷却 3 回合
- 消耗当前激活的圣印 buff
- 有圣印时：造成审判基础伤害 + 触发对应圣印的审判效果
- 无圣印时：仅造成基础伤害（减半），无特殊效果

### REQ-4: ClassMechanics 注册
- specialMechanic 类型: 'seal'
- 定义每种圣印的 id、name、onHit、onJudge 属性
- 战斗系统通过 'seal' effect type 识别处理

## Constraints
- 圣印数据格式需与现有 specialMechanic（pet/demon/totem/shapeshift）保持架构一致
- 圣印 buff 需使用现有的 effects 系统表示
