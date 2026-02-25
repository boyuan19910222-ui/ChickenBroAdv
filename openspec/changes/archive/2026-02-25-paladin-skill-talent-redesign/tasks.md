## Task Group 1: 圣骑士基础技能重构 (GameData.js)

- [x] 1.1 精简圣骑士基础技能为 4 个：十字军打击、正义圣印、审判、圣光术
- [x] 1.2 新增正义圣印(sealOfJustice)技能定义（self-buff，3回合，攻击+8圣光伤害）
- [x] 1.3 新增审判(judgement)技能定义（消耗圣印，25mana，1AP，CD3）
- [x] 1.4 调整现有技能解锁等级（制裁之锤/奉献/保护祝福/神圣之盾/圣疗术移除 unlockLevel，改为天赋解锁）

## Task Group 2: 天赋解锁技能数据 (GameData.js)

- [x] 2.1 新增光明圣印(sealOfLight)技能：攻击吸血15%，审判+自身治疗
- [x] 2.2 新增命令圣印(sealOfCommand)技能：30%概率额外伤害，审判+眩晕
- [x] 2.3 新增神圣震击(holyShock)技能：可攻可治疗的双用技能
- [x] 2.4 新增十字军光环(crusaderAura)技能：全队攻击力+10% buff
- [x] 2.5 新增神圣愤怒(holyWrath)终极技能：群体嘲讽+反伤护盾
- [x] 2.6 新增惩戒之锤(hammerOfWrath)终极技能：远程斩杀，HP<30%翻倍

## Task Group 3: 天赋树重写 (TalentData.js)

- [x] 3.1 重写神圣(holy)天赋树：T1~T5 共 8 节点，解锁光明圣印/保护祝福/圣疗术
- [x] 3.2 重写防护(protection)天赋树：T1~T5 共 9 节点，解锁制裁之锤/奉献/神圣愤怒
- [x] 3.3 重写惩戒(retribution)天赋树：T1~T5 共 9 节点，解锁命令圣印/十字军光环/惩戒之锤

## Task Group 4: 职业机制注册

- [x] 4.1 更新 GameData.js 圣骑士 skills 数组和 specialMechanic
- [x] 4.2 在 ClassMechanics.js 新增圣印(seal)系统定义
