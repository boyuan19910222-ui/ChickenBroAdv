/**
 * 天赋系统数据配置 - 9大职业天赋树
 */
export const TalentData = {
    // 战士天赋树 — 5层精简版
    warrior: {
        arms: {
            id: 'arms',
            name: '武器',
            description: '双手武器大师，横扫千军的AOE持续输出',
            icon: '⚔️',
            talents: [
                // 第1层 (0点解锁)
                { id: 'twoHandSpec', name: '双手武器专精', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'strength', bonus: 0.03, condition: 'twoHand' }, description: '装备双手武器时物理伤害提高{bonus*100}%' },
                { id: 'improvedHeroicStrike', name: '强化英勇打击', tier: 1, maxPoints: 5, effect: { type: 'skill_enhance', skill: 'heroicStrike', bonus: 0.05 }, description: '英勇打击伤害提高{bonus*100}%' },
                { id: 'improvedRend', name: '强化撕裂', tier: 1, maxPoints: 3, effect: { type: 'dot_enhance', bonus: 0.15 }, description: '撕裂持续伤害提高{bonus*100}%' },
                // 第2层 (5点解锁)
                { id: 'cleave', name: '横扫', tier: 2, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'cleave' }, description: '解锁横扫：激活后3回合内所有技能额外溅射1个目标', requires: 'twoHandSpec' },
                { id: 'mightyChop', name: '猛力劈砍', tier: 2, maxPoints: 2, effect: { type: 'resource_bonus', bonus: 2, condition: 'twoHand' }, description: '装备双手武器时所有怒气获取额外+{bonus}' },
                // 第3层 (10点解锁)
                { id: 'impale', name: '贯穿', tier: 3, maxPoints: 2, effect: { type: 'crit_bonus', bonus: 0.1 }, description: '暴击伤害加成提高{bonus*100}%' },
                { id: 'deepWounds', name: '深度创伤', tier: 3, maxPoints: 3, effect: { type: 'crit_bleed', bonus: 0.2 }, description: '暴击时{bonus*100}%几率造成额外流血伤害', requires: 'improvedRend' },
                // 第4层 (15点解锁)
                { id: 'improvedCleave', name: '横扫强化', tier: 4, maxPoints: 5, effect: { type: 'skill_enhance', skill: 'cleave', bonus: 0.08 }, description: '横扫伤害提高{bonus*100}%' },
                // 第5层 (20点解锁) — 终极天赋
                { id: 'mortalStrike', name: '致死打击', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'mortalStrike' }, description: '解锁致死打击：高伤害攻击+降低目标治疗效果50%', requires: 'improvedCleave' }
            ]
        },
        fury: {
            id: 'fury',
            name: '狂暴',
            description: '双持利刃暴击如雨，嗜血爆发的战斗狂人',
            icon: '💥',
            talents: [
                // 第1层 (0点解锁)
                { id: 'cruelty', name: '残忍', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'critChance', bonus: 0.01 }, description: '暴击几率提高{bonus*100}%' },
                { id: 'unbridledWrath', name: '无羁怒火', tier: 1, maxPoints: 5, effect: { type: 'resource_gen', bonus: 0.1 }, description: '攻击时有{bonus*100}%几率额外获得1点怒气' },
                // 第2层 (5点解锁)
                { id: 'dualWieldSpec', name: '双武器专精', tier: 2, maxPoints: 5, effect: { type: 'dual_wield', bonus: 0.05 }, description: '副手武器伤害提高{bonus*100}%', requires: 'cruelty' },
                { id: 'improvedBattleShout', name: '强化战斗怒吼', tier: 2, maxPoints: 3, effect: { type: 'buff_enhance', bonus: 0.1 }, description: '战斗怒吼效果提高{bonus*100}%' },
                // 第3层 (10点解锁)
                { id: 'enrage', name: '狂怒', tier: 3, maxPoints: 3, effect: { type: 'on_crit', stat: 'damage', bonus: 0.05, duration: 2 }, description: '暴击后伤害提高{bonus*100}%，持续2回合' },
                { id: 'bloodCraze', name: '嗜杀', tier: 3, maxPoints: 5, effect: { type: 'on_crit', stat: 'resource', bonus: 2 }, description: '暴击后额外获得{bonus}点怒气' },
                // 第4层 (15点解锁)
                { id: 'execute', name: '斩杀', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'execute' }, description: '解锁斩杀：对低于20%HP的目标造成巨额伤害', requires: 'enrage' },
                // 第5层 (20点解锁) — 终极天赋
                { id: 'bloodthirst', name: '嗜血', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'bloodthirst' }, description: '解锁嗜血：基于力量的瞬发攻击+自我治疗', requires: 'execute' }
            ]
        },
        protection: {
            id: 'protection',
            name: '防护',
            description: '钢铁壁垒，盾牌铁壁守护团队的第一道防线',
            icon: '🛡️',
            talents: [
                // 第1层 (0点解锁)
                { id: 'shieldSpec', name: '盾牌专精', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'damageReduction', bonus: 0.02, condition: 'shield' }, description: '持盾时受到伤害降低{bonus*100}%' },
                { id: 'anticipation', name: '预知', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'armor', bonus: 0.03 }, description: '护甲值提高{bonus*100}%' },
                // 第2层 (5点解锁)
                { id: 'shieldBlock', name: '盾牌格挡', tier: 2, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'shieldBlock' }, description: '解锁盾牌格挡：减伤50%持续2回合', requires: 'shieldSpec' },
                { id: 'toughness', name: '强韧', tier: 2, maxPoints: 5, effect: { type: 'stat', stat: 'stamina', bonus: 0.02 }, description: '耐力提高{bonus*100}%' },
                // 第3层 (10点解锁)
                { id: 'taunt', name: '嘲讽', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'taunt' }, description: '解锁嘲讽：强制敌人攻击自己2回合', requires: 'shieldBlock' },
                { id: 'revenge', name: '复仇', tier: 3, maxPoints: 3, effect: { type: 'on_hit', stat: 'damage', bonus: 0.1, duration: 1 }, description: '被击中后下次攻击伤害提高{bonus*100}%' },
                // 第4层 (15点解锁)
                { id: 'toughAsNails', name: '坚不可摧', tier: 4, maxPoints: 3, effect: { type: 'stat', stat: 'damageReduction', bonus: 0.02 }, description: '受到所有伤害降低{bonus*100}%' },
                // 第5层 (20点解锁) — 终极天赋
                { id: 'shieldWall', name: '盾墙', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'shieldWall' }, description: '解锁盾墙：减伤75%持续2回合', requires: 'toughAsNails' }
            ]
        }
    },

    // 圣骑士天赋树 — 精简版
    paladin: {
        holy: {
            id: 'holy',
            name: '神圣',
            description: '神圣的治疗之力，救死扶伤',
            icon: '✨',
            talents: [
                // T1: 2 个被动
                { id: 'divineIntellect', name: '神圣智慧', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'intellect', bonus: 0.02 }, description: '智力提高{bonus*100}%' },
                { id: 'healingLight', name: '治疗之光', tier: 1, maxPoints: 3, effect: { type: 'skill_enhance', skill: 'holyLight', stat: 'heal', bonus: 0.04 }, description: '圣光术治疗效果提高{bonus*100}%' },
                // T2: 1 被动 + 1 解锁技能
                { id: 'spiritualFocus', name: '精神集中', tier: 2, maxPoints: 5, effect: { type: 'pushback_resist', bonus: 0.14 }, description: '治疗法术被打断几率降低{bonus*100}%' },
                { id: 'sealOfLightTalent', name: '光明圣印', tier: 2, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'sealOfLight' }, description: '解锁光明圣印：攻击吸血15%，审判回复生命' },
                // T3: 2 个被动
                { id: 'illumination', name: '照明', tier: 3, maxPoints: 5, effect: { type: 'mana_refund', bonus: 0.2 }, description: '治疗暴击时返还{bonus*100}%法力', requires: 'spiritualFocus' },
                { id: 'holyPower', name: '神圣力量', tier: 3, maxPoints: 5, effect: { type: 'holy_enhance', bonus: 0.02 }, description: '所有圣光伤害和治疗效果提高{bonus*100}%' },
                // T4: 1 被动
                { id: 'purifyingPower', name: '净化之力', tier: 4, maxPoints: 3, effect: { type: 'heal_enhance', bonus: 0.03 }, description: '治疗法术效果提高{bonus*100}%', requires: 'illumination' },
                // T5: 终极技能
                { id: 'layOnHandsTalent', name: '圣疗术', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'layOnHands' }, description: '解锁圣疗术：瞬间回满目标生命值', requires: 'purifyingPower' }
            ]
        },
        protection: {
            id: 'protection',
            name: '防护',
            description: '神圣的防御者，守护同伴',
            icon: '🛡️',
            talents: [
                // T1: 2 个被动
                { id: 'redoubt', name: '盾牌壁垒', tier: 1, maxPoints: 5, effect: { type: 'on_hit', stat: 'blockChance', bonus: 0.06 }, description: '被击中后格挡几率提高{bonus*100}%' },
                { id: 'toughness', name: '强韧', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'armor', bonus: 0.02 }, description: '护甲值提高{bonus*100}%' },
                // T2: 1 被动 + 1 解锁技能
                { id: 'improvedRighteousFury', name: '强化正义之怒', tier: 2, maxPoints: 3, effect: { type: 'threat', bonus: 0.16 }, description: '仇恨生成提高{bonus*100}%' },
                { id: 'consecrationTalent', name: '奉献', tier: 2, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'consecration' }, description: '解锁奉献：对所有敌人造成圣光DOT' },
                // T3: 2 个被动
                { id: 'holyResilience', name: '神圣韧性', tier: 3, maxPoints: 3, effect: { type: 'on_hit_proc', procChance: 0.06, effect: 'stun_immune', duration: 1 }, description: '受伤时{bonus*100}%几率免疫眩晕1回合', requires: 'consecrationTalent' },
                { id: 'sacredDuty', name: '神圣职责', tier: 3, maxPoints: 5, effect: { type: 'stat', stat: 'stamina', bonus: 0.02 }, description: '耐力提高{bonus*100}%' },
                // T4: 1 解锁技能
                { id: 'divineShieldTalent', name: '神圣之盾', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'divineShield' }, description: '解锁神圣之盾：免疫所有伤害2回合', requires: 'holyResilience' },
                // T5: 终极被动
                { id: 'unbreakable', name: '坚不可摧', tier: 5, maxPoints: 5, effect: { type: 'stat', stat: 'damageReduction', bonus: 0.02 }, description: '受到伤害降低{bonus*100}%', requires: 'divineShieldTalent' }
            ]
        },
        retribution: {
            id: 'retribution',
            name: '惩戒',
            description: '神圣的审判者，以正义之名制裁敌人',
            icon: '⚡',
            talents: [
                // T1: 2 个被动
                { id: 'benediction', name: '祝福', tier: 1, maxPoints: 5, effect: { type: 'mana_reduce', bonus: 0.02 }, description: '圣印和审判法力消耗降低{bonus*100}%' },
                { id: 'conviction', name: '信念', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'critChance', bonus: 0.01 }, description: '暴击几率提高{bonus*100}%' },
                // T2: 1 被动 + 1 解锁技能
                { id: 'improvedJudgement', name: '强化审判', tier: 2, maxPoints: 2, effect: { type: 'cooldown_reduce', skill: 'judgement', bonus: 1 }, description: '审判冷却时间减少{bonus}回合' },
                { id: 'sealOfCommandTalent', name: '命令圣印', tier: 2, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'sealOfCommand' }, description: '解锁命令圣印：攻击30%几率额外圣光伤害' },
                // T3: 2 个被动
                { id: 'vengeance', name: '复仇', tier: 3, maxPoints: 5, effect: { type: 'crit_bonus', bonus: 0.03 }, description: '暴击后物理和圣光伤害提高{bonus*100}%', requires: 'sealOfCommandTalent' },
                { id: 'holyWrit', name: '圣光之怒', tier: 3, maxPoints: 3, effect: { type: 'skill_enhance', skill: 'judgement', stat: 'critChance', bonus: 0.10 }, description: '审判的暴击几率提高{bonus*100}%' },
                // T4: 1 被动
                { id: 'twoHandSpecialization', name: '双手专精', tier: 4, maxPoints: 5, effect: { type: 'weapon_spec', weaponType: 'twoHand', bonus: 0.02 }, description: '双手武器伤害提高{bonus*100}%', requires: 'vengeance' },
                // T5: 终极技能
                { id: 'hammerOfWrathTalent', name: '惩戒之锤', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'hammerOfWrath' }, description: '解锁惩戒之锤：远程斩杀，低血量翻倍伤害', requires: 'twoHandSpecialization' }
            ]
        }
    },

    // 猎人天赋树 — 精简版
    hunter: {
        beastMastery: {
            id: 'beastMastery',
            name: '野兽控制',
            description: '与野兽心灵相通，强化宠物能力',
            icon: '🐾',
            talents: [
                // T1: 2 个被动
                { id: 'enduranceTraining', name: '耐力训练', tier: 1, maxPoints: 5, effect: { type: 'pet_stat', stat: 'health', bonus: 0.03 }, description: '宠物生命值提高{bonus*100}%' },
                { id: 'focusedFire', name: '专注射击', tier: 1, maxPoints: 5, effect: { type: 'damage_with_pet', bonus: 0.02 }, description: '宠物存活时自身伤害提高{bonus*100}%' },
                // T2: 1 被动 + 1 解锁技能
                { id: 'unleashFury', name: '释放愤怒', tier: 2, maxPoints: 5, effect: { type: 'pet_stat', stat: 'damage', bonus: 0.04 }, description: '宠物伤害提高{bonus*100}%' },
                { id: 'killCommandTalent', name: '杀戮命令', tier: 2, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'killCommand' }, description: '解锁杀戮命令：命令宠物凶猛一击，造成高额伤害' },
                // T3: 2 个被动
                { id: 'ferocity', name: '凶暴', tier: 3, maxPoints: 5, effect: { type: 'pet_stat', stat: 'critChance', bonus: 0.02 }, description: '宠物暴击几率提高{bonus*100}%', requires: 'killCommandTalent' },
                { id: 'animalHandler', name: '驯兽师', tier: 3, maxPoints: 3, effect: { type: 'pet_stat', stat: 'allStats', bonus: 0.05 }, description: '宠物全属性提高{bonus*100}%' },
                // T4: 1 被动
                { id: 'ferociousInspiration', name: '凶猛激励', tier: 4, maxPoints: 3, effect: { type: 'party_buff_on_pet_crit', stat: 'damage', bonus: 0.01 }, description: '宠物暴击时全队伤害提高{bonus*100}%', requires: 'ferocity' },
                // T5: 终极技能
                { id: 'intimidationTalent', name: '恐吓', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'intimidation' }, description: '解锁恐吓：命令宠物眩晕目标2回合', requires: 'ferociousInspiration' }
            ]
        },
        marksmanship: {
            id: 'marksmanship',
            name: '射击',
            description: '精准致命的远程射击专家',
            icon: '🎯',
            talents: [
                // T1: 2 个被动
                { id: 'lethalShots', name: '致命射击', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'critChance', bonus: 0.01 }, description: '远程暴击几率提高{bonus*100}%' },
                { id: 'efficiency', name: '效率', tier: 1, maxPoints: 5, effect: { type: 'mana_reduce', bonus: 0.02 }, description: '射击技能法力消耗降低{bonus*100}%' },
                // T2: 1 被动 + 1 解锁技能
                { id: 'improvedHuntersMark', name: '强化猎人印记', tier: 2, maxPoints: 3, effect: { type: 'skill_enhance', skill: 'huntersMark', stat: 'duration', bonus: 1 }, description: '猎人印记持续时间延长{bonus}回合' },
                { id: 'aimedShotTalent', name: '瞄准射击', tier: 2, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'aimedShot' }, description: '解锁瞄准射击：高伤害精准远程射击' },
                // T3: 2 个被动
                { id: 'mortalShots', name: '致伤射击', tier: 3, maxPoints: 5, effect: { type: 'crit_bonus', bonus: 0.06 }, description: '远程暴击伤害提高{bonus*100}%', requires: 'aimedShotTalent' },
                { id: 'carefulAim', name: '精准瞄准', tier: 3, maxPoints: 3, effect: { type: 'stat', stat: 'rangedAttack', bonus: 0.05 }, description: '远程攻击力提高{bonus*100}%' },
                // T4: 1 解锁技能
                { id: 'multiShotTalent', name: '多重射击', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'multiShot' }, description: '解锁多重射击：射击最多3个随机目标', requires: 'mortalShots' },
                // T5: 终极被动
                { id: 'rangedWeaponSpec', name: '远程武器专精', tier: 5, maxPoints: 5, effect: { type: 'weapon_spec', weaponType: 'ranged', bonus: 0.02 }, description: '远程武器伤害提高{bonus*100}%', requires: 'multiShotTalent' }
            ]
        },
        survival: {
            id: 'survival',
            name: '生存',
            description: '野外生存专家，陷阱与近战反击',
            icon: '🏕️',
            talents: [
                // T1: 2 个被动
                { id: 'deflection', name: '偏斜', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'dodgeChance', bonus: 0.01 }, description: '闪避几率提高{bonus*100}%' },
                { id: 'survivalist', name: '求生专家', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'health', bonus: 0.02 }, description: '生命值提高{bonus*100}%' },
                // T2: 1 被动 + 1 解锁技能
                { id: 'trapMastery', name: '陷阱专精', tier: 2, maxPoints: 3, effect: { type: 'trap_enhance', bonus: 0.10 }, description: '陷阱伤害和效果提高{bonus*100}%' },
                { id: 'explosiveTrapTalent', name: '爆炸陷阱', tier: 2, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'explosiveTrap' }, description: '解锁爆炸陷阱：对所有敌人造成火焰伤害' },
                // T3: 2 个被动
                { id: 'savageStrikes', name: '野蛮打击', tier: 3, maxPoints: 5, effect: { type: 'melee_crit', bonus: 0.02 }, description: '近战攻击暴击几率提高{bonus*100}%', requires: 'explosiveTrapTalent' },
                { id: 'surefooted', name: '脚步稳健', tier: 3, maxPoints: 3, effect: { type: 'resist', resistType: 'movement', bonus: 0.05 }, description: '减速和定身抵抗提高{bonus*100}%' },
                // T4: 1 被动
                { id: 'killerInstinct', name: '杀手本能', tier: 4, maxPoints: 3, effect: { type: 'stat', stat: 'critChance', bonus: 0.01 }, description: '所有暴击几率提高{bonus*100}%', requires: 'savageStrikes' },
                // T5: 终极技能
                { id: 'mongooseBiteTalent', name: '猫鼬撕咬', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'mongooseBite' }, description: '解锁猫鼬撕咬：近战反击+闪避下次攻击', requires: 'killerInstinct' }
            ]
        }
    },

    // 盗贼天赋树 — 精简版
    rogue: {
        assassination: {
            id: 'assassination',
            name: '刺杀',
            description: '毒药和暗杀专家，一击致命',
            icon: '☠️',
            talents: [
                // T1 层
                { id: 'improvedEviscerate', name: '强化剔骨', tier: 1, maxPoints: 3, effect: { type: 'skill_enhance', skill: 'eviscerate', bonus: 0.05 }, description: '剔骨伤害提高{bonus*100}%' },
                { id: 'malice', name: '恶意', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'critChance', bonus: 0.01 }, description: '暴击几率提高{bonus*100}%' },
                // T2 层
                { id: 'ruthlessness', name: '无情', tier: 2, maxPoints: 3, effect: { type: 'combo_refund', bonus: 0.2 }, description: '终结技后有{bonus*100}%几率获得连击点', requires: 'malice' },
                { id: 'lethality', name: '致命', tier: 2, maxPoints: 5, effect: { type: 'crit_bonus', bonus: 0.06 }, description: '背刺和伏击暴击伤害提高{bonus*100}%' },
                // T3 层
                { id: 'vilePoisons', name: '恶毒毒药', tier: 3, maxPoints: 5, effect: { type: 'poison_enhance', bonus: 0.04 }, description: '毒药伤害提高{bonus*100}%', requires: 'ruthlessness' },
                { id: 'improvedPoisons', name: '强化毒药', tier: 3, maxPoints: 5, effect: { type: 'poison_chance', bonus: 0.02 }, description: '毒药触发几率提高{bonus*100}%' },
                // T4 层
                { id: 'deadlyPoison', name: '致命毒药', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'deadlyPoison' }, description: '解锁致命毒药技能', requires: 'vilePoisons' },
                { id: 'sealFate', name: '封印命运', tier: 4, maxPoints: 5, effect: { type: 'combo_on_crit', bonus: 0.2 }, description: '暴击时有{bonus*100}%几率额外获得1个连击点' },
                // T5 层 - 终极天赋
                { id: 'mutilate', name: '毁伤', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'mutilate' }, description: '解锁毁伤终极技能', requires: 'deadlyPoison' }
            ]
        },
        combat: {
            id: 'combat',
            name: '战斗',
            description: '正面战斗专家，持续输出能力',
            icon: '⚔️',
            talents: [
                // T1 层
                { id: 'improvedSinisterStrike', name: '强化影袭', tier: 1, maxPoints: 2, effect: { type: 'energy_reduce', skill: 'shadowStrike', bonus: 3 }, description: '影袭能量消耗减少{bonus}点' },
                { id: 'lightningReflexes', name: '闪电反射', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'dodge', bonus: 0.01 }, description: '闪避几率提高{bonus*100}%' },
                // T2 层
                { id: 'precision', name: '精准', tier: 2, maxPoints: 5, effect: { type: 'stat', stat: 'hit', bonus: 0.01 }, description: '命中率提高{bonus*100}%', requires: 'improvedSinisterStrike' },
                { id: 'dualWieldSpec', name: '双武器专精', tier: 2, maxPoints: 5, effect: { type: 'dual_wield', bonus: 0.02 }, description: '副手武器伤害提高{bonus*100}%' },
                // T3 层
                { id: 'bladeFlurry', name: '剑刃乱舞', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'bladeFlurry' }, description: '解锁剑刃乱舞', requires: 'precision' },
                { id: 'aggression', name: '侵略', tier: 3, maxPoints: 3, effect: { type: 'damage_bonus', skills: ['shadowStrike', 'eviscerate'], bonus: 0.02 }, description: '影袭和剔骨伤害提高{bonus*100}%' },
                // T4 层
                { id: 'vitality', name: '活力', tier: 4, maxPoints: 5, effect: { type: 'stat', stat: 'stamina', bonus: 0.02 }, description: '耐力提高{bonus*100}%', requires: 'bladeFlurry' },
                // T5 层 - 终极天赋
                { id: 'killingSpree', name: '杀戮盛筵', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'killingSpree' }, description: '解锁杀戮盛筵终极技能', requires: 'vitality' }
            ]
        },
        subtlety: {
            id: 'subtlety',
            name: '敏锐',
            description: '暗影中的刺客，控制和潜行专家',
            icon: '🌙',
            talents: [
                // T1 层
                { id: 'masterOfDeception', name: '欺骗大师', tier: 1, maxPoints: 5, effect: { type: 'stealth_level', bonus: 1 }, description: '潜行等级提高{bonus}级' },
                { id: 'opportunity', name: '机遇', tier: 1, maxPoints: 5, effect: { type: 'skill_enhance', skills: ['ambush'], bonus: 0.04 }, description: '伏击伤害提高{bonus*100}%' },
                // T2 层
                { id: 'initiative', name: '先发制人', tier: 2, maxPoints: 3, effect: { type: 'stealth_combo', bonus: 0.33 }, description: '潜行开场时有{bonus*100}%几率获得额外连击点', requires: 'masterOfDeception' },
                { id: 'elusiveness', name: '灵活', tier: 2, maxPoints: 2, effect: { type: 'cooldown_reduce', skills: ['vanish', 'evade'], bonus: 45 }, description: '消失和闪避冷却时间减少{bonus}秒' },
                // T3 层
                { id: 'vanish', name: '消失', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'vanish' }, description: '解锁消失技能', requires: 'initiative' },
                { id: 'sleightOfHand', name: '手法', tier: 3, maxPoints: 2, effect: { type: 'threat_reduction', bonus: 0.15 }, description: '威胁值降低{bonus*100}%' },
                // T4 层
                { id: 'heightenedSenses', name: '敏锐感官', tier: 4, maxPoints: 3, effect: { type: 'stealth_detection_reduction', bonus: 0.1 }, description: '被敌人发现几率降低{bonus*100}%', requires: 'vanish' },
                // T5 层 - 终极天赋
                { id: 'shadowDance', name: '暗影之舞', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'shadowDance' }, description: '解锁暗影之舞终极技能', requires: 'heightenedSenses' }
            ]
        }
    },

    // 牧师天赋树 — 精简版
    priest: {
        discipline: {
            id: 'discipline',
            name: '戒律',
            description: '防护和辅助专精，增强护盾和法力',
            icon: '📿',
            talents: [
                // T1: 2个被动
                { id: 'unbreakableWill', name: '不屈意志', tier: 1, maxPoints: 5, effect: { type: 'resist', resist: 'stun', bonus: 0.03 }, description: '晕眩抗性提高{bonus*100}%' },
                { id: 'wandSpecialization', name: '魔杖专精', tier: 1, maxPoints: 5, effect: { type: 'wand_enhance', bonus: 0.05 }, description: '魔杖伤害提高{bonus*100}%' },
                // T2: 1被动 + 1解锁技能
                { id: 'improvedPowerWordShield', name: '强化真言术：盾', tier: 2, maxPoints: 3, effect: { type: 'skill_enhance', skill: 'shield', bonus: 0.05 }, description: '护盾吸收量提高{bonus*100}%' },
                { id: 'innerFocus', name: '心灵专注', tier: 2, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'innerFocus' }, description: '解锁心灵专注' },
                // T3: 2个被动
                { id: 'meditation', name: '冥想', tier: 3, maxPoints: 5, effect: { type: 'mana_regen', bonus: 0.03 }, description: '施法时继续恢复{bonus*100}%法力', requires: 'innerFocus' },
                { id: 'mentalAgility', name: '精神敏捷', tier: 3, maxPoints: 5, effect: { type: 'instant_mana_reduce', bonus: 0.02 }, description: '瞬发法术法力消耗降低{bonus*100}%' },
                // T4: 1被动
                { id: 'mentalStrength', name: '精神力量', tier: 4, maxPoints: 5, effect: { type: 'stat', stat: 'intellect', bonus: 0.02 }, description: '智力提高{bonus*100}%', requires: 'meditation' },
                // T5: 终极技能
                { id: 'painSuppression', name: '痛苦压制', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'painSuppression' }, description: '解锁痛苦压制：为目标减伤40%持续3回合', requires: 'mentalStrength' }
            ]
        },
        holy: {
            id: 'holy',
            name: '神圣',
            description: '神圣治疗专精，强大的治疗能力',
            icon: '✨',
            talents: [
                // T1: 2个被动
                { id: 'healingFocus', name: '治疗专注', tier: 1, maxPoints: 2, effect: { type: 'pushback_resist', bonus: 0.35 }, description: '治疗法术被打断几率降低{bonus*100}%' },
                { id: 'improvedHeal', name: '强化治疗', tier: 1, maxPoints: 3, effect: { type: 'skill_enhance', skill: 'heal', bonus: 0.05 }, description: '治疗效果提高{bonus*100}%' },
                // T2: 1被动 + 1解锁技能
                { id: 'holySpecialization', name: '神圣专精', tier: 2, maxPoints: 5, effect: { type: 'holy_crit', bonus: 0.01 }, description: '神圣法术暴击几率提高{bonus*100}%' },
                { id: 'lightwell', name: '光明之泉', tier: 2, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'lightwell' }, description: '解锁光明之泉' },
                // T3: 2个被动
                { id: 'spiritualHealing', name: '灵性治疗', tier: 3, maxPoints: 5, effect: { type: 'heal_enhance', bonus: 0.02 }, description: '治疗法术效果提高{bonus*100}%', requires: 'lightwell' },
                { id: 'holyReach', name: '神圣之触', tier: 3, maxPoints: 3, effect: { type: 'heal_range', bonus: 0.1 }, description: '治疗法术范围提高{bonus*100}%' },
                // T4: 1被动
                { id: 'spiritOfRedemption', name: '救赎之魂', tier: 4, maxPoints: 3, effect: { type: 'heal_enhance_all', bonus: 0.02 }, description: '所有治疗效果提高{bonus*100}%', requires: 'spiritualHealing' },
                // T5: 终极技能
                { id: 'guardianSpirit', name: '守护之魂', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'guardianSpirit' }, description: '解锁守护之魂：保护目标死亡时恢复40%生命', requires: 'spiritOfRedemption' }
            ]
        },
        shadow: {
            id: 'shadow',
            name: '暗影',
            description: '暗影魔法专精，持续伤害和控制',
            icon: '🌑',
            talents: [
                // T1: 2个被动
                { id: 'spiritTap', name: '灵魂分流', tier: 1, maxPoints: 5, effect: { type: 'on_kill', stat: 'spirit', bonus: 0.2 }, description: '击杀敌人后精神提高{bonus*100}%' },
                { id: 'shadowAffinity', name: '暗影亲和', tier: 1, maxPoints: 3, effect: { type: 'threat_reduce', bonus: 0.08 }, description: '暗影法术仇恨降低{bonus*100}%' },
                // T2: 2个被动
                { id: 'improvedShadowWordPain', name: '强化暗言术：痛', tier: 2, maxPoints: 2, effect: { type: 'dot_enhance', skill: 'shadowWordPain', bonus: 0.03 }, description: '暗言术：痛持续时间延长{bonus}秒' },
                { id: 'shadowFocus', name: '暗影集中', tier: 2, maxPoints: 5, effect: { type: 'hit_enhance', bonus: 0.02 }, description: '暗影法术命中率提高{bonus*100}%' },
                // T3: 1解锁技能
                { id: 'shadowform', name: '暗影形态', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'shadowform' }, description: '解锁暗影形态', requires: 'shadowFocus' },
                { id: 'darkness', name: '黑暗', tier: 3, maxPoints: 5, effect: { type: 'damage_enhance', damageType: 'shadow', bonus: 0.02 }, description: '暗影伤害提高{bonus*100}%' },
                // T4: 1被动
                { id: 'shadowPower', name: '暗影之力', tier: 4, maxPoints: 5, effect: { type: 'crit_bonus', bonus: 0.1 }, description: '暗影法术暴击伤害提高{bonus*100}%', requires: 'shadowform' },
                // T5: 终极技能
                { id: 'dispersion', name: '消散', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'dispersion' }, description: '解锁消散：减伤90%并恢复法力持续2回合', requires: 'shadowPower' }
            ]
        }
    },

    // 萨满祭司天赋树 — 精简版
    shaman: {
        elemental: {
            id: 'elemental',
            name: '元素',
            description: '掌控自然元素之力，远程魔法输出',
            icon: '⚡',
            talents: [
                // T1 层
                { id: 'convection', name: '对流', tier: 1, maxPoints: 5, effect: { type: 'mana_reduce', skills: ['lightningBolt', 'chainLightning'], bonus: 0.02 }, description: '闪电法术法力消耗降低{bonus*100}%' },
                { id: 'concussion', name: '震撼', tier: 1, maxPoints: 5, effect: { type: 'damage_enhance', skills: ['lightningBolt', 'chainLightning'], bonus: 0.01 }, description: '闪电法术伤害提高{bonus*100}%' },
                // T2 层
                { id: 'callOfFlame', name: '烈焰呼唤', tier: 2, maxPoints: 3, effect: { type: 'fire_enhance', bonus: 0.05 }, description: '火焰图腾和震击伤害提高{bonus*100}%' },
                { id: 'eyeOfTheStorm', name: '风暴之眼', tier: 2, maxPoints: 3, effect: { type: 'crit_bonus', bonus: 0.1 }, description: '法术暴击伤害提高{bonus*100}%' },
                // T3 层
                { id: 'elementalMastery', name: '元素掌握', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'elementalMastery' }, description: '解锁元素掌握：下一法术必定暴击', requires: 'eyeOfTheStorm' },
                { id: 'reverberation', name: '回响', tier: 3, maxPoints: 5, effect: { type: 'cooldown_reduce', skills: ['earthShock', 'flameShock', 'frostShock'], bonus: 0.2 }, description: '震击冷却时间减少{bonus}秒' },
                // T4 层
                { id: 'lavaBurst', name: '熔岩爆裂', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'lavaBurst' }, description: '解锁熔岩爆裂：目标有烈焰震击时必暴击', requires: 'elementalMastery' },
                { id: 'lightningOverload', name: '闪电超载', tier: 4, maxPoints: 5, effect: { type: 'spell_multicast', chance: 0.04 }, description: '闪电法术有{bonus*100}%几率额外施放一次', requires: 'elementalMastery' },
                // T5 层 - 终极天赋
                { id: 'thunderstorm', name: '雷暴', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'thunderstorm' }, description: '解锁雷暴：AOE击退+法力恢复', requires: 'lightningOverload' }
            ]
        },
        enhancement: {
            id: 'enhancement',
            name: '增强',
            description: '元素力量强化武器，近战战斗专精',
            icon: '🔨',
            talents: [
                // T1 层
                { id: 'ancestralKnowledge', name: '先祖智慧', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'mana', bonus: 0.01 }, description: '法力值上限提高{bonus*100}%' },
                { id: 'thunderingStrikes', name: '雷霆打击', tier: 1, maxPoints: 5, effect: { type: 'stat', stat: 'critChance', bonus: 0.01 }, description: '近战暴击几率提高{bonus*100}%' },
                // T2 层
                { id: 'flurry', name: '乱舞', tier: 2, maxPoints: 5, effect: { type: 'on_crit', stat: 'attackSpeed', bonus: 0.05 }, description: '暴击后攻击速度提高{bonus*100}%', requires: 'thunderingStrikes' },
                { id: 'elementalWeapons', name: '元素武器', tier: 2, maxPoints: 3, effect: { type: 'weapon_enhance', bonus: 0.05 }, description: '武器增强效果提高{bonus*100}%' },
                // T3 层
                { id: 'stormstrike', name: '风暴打击', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'stormstrike' }, description: '解锁风暴打击：双武器攻击+自然易伤', requires: 'flurry' },
                { id: 'dualWield', name: '双武器战斗', tier: 3, maxPoints: 1, effect: { type: 'unlock_ability', ability: 'dual_wield' }, description: '允许在副手装备单手武器' },
                // T4 层
                { id: 'shamanisticRage', name: '萨满之怒', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'shamanisticRage' }, description: '解锁萨满之怒：减伤30%+每回合回蓝', requires: 'stormstrike' },
                { id: 'weaponMastery', name: '武器精通', tier: 4, maxPoints: 3, effect: { type: 'stat', stat: 'strength', bonus: 0.02 }, description: '力量提高{bonus*100}%', requires: 'stormstrike' },
                // T5 层 - 终极天赋
                { id: 'feralSpirit', name: '野性之魂', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'feralSpirit' }, description: '解锁野性之魂：召唤两只幽灵狼协助战斗', requires: 'weaponMastery' }
            ]
        },
        restoration: {
            id: 'restoration',
            name: '恢复',
            description: '自然治疗之力，团队治疗专精',
            icon: '💧',
            talents: [
                // T1 层
                { id: 'improvedHealingWave', name: '强化治疗波', tier: 1, maxPoints: 5, effect: { type: 'cast_reduce', skill: 'healingWave', bonus: 0.1 }, description: '治疗波施法时间减少{bonus}秒' },
                { id: 'tidalFocus', name: '潮汐专注', tier: 1, maxPoints: 5, effect: { type: 'mana_reduce', skills: ['healingWave', 'chainHeal'], bonus: 0.01 }, description: '治疗法术法力消耗降低{bonus*100}%' },
                // T2 层
                { id: 'totemicFocus', name: '图腾专注', tier: 2, maxPoints: 5, effect: { type: 'totem_mana', bonus: 0.05 }, description: '图腾法力消耗降低{bonus*100}%' },
                { id: 'healingFocus', name: '治疗专注', tier: 2, maxPoints: 5, effect: { type: 'pushback_resist', bonus: 0.14 }, description: '治疗法术被打断几率降低{bonus*100}%' },
                // T3 层
                { id: 'naturesSwiftness', name: '自然迅捷', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'naturesSwiftnessShaman' }, description: '解锁自然迅捷：下一个治疗法术瞬发', requires: 'healingFocus' },
                { id: 'restorativeTotems', name: '恢复图腾', tier: 3, maxPoints: 5, effect: { type: 'totem_enhance', bonus: 0.05 }, description: '恢复系图腾效果提高{bonus*100}%', requires: 'healingFocus' },
                { id: 'healingGrace', name: '治疗之赐', tier: 3, maxPoints: 3, effect: { type: 'heal_enhance', bonus: 0.02 }, description: '所有治疗效果提高{bonus*100}%' },
                // T4 层
                { id: 'manaTideTotem', name: '法力之潮图腾', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'manaTideTotem' }, description: '解锁法力之潮图腾：群体法力恢复', requires: 'restorativeTotems' },
                { id: 'earthShield', name: '大地之盾', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'earthShield' }, description: '解锁大地之盾：6层护盾，受击触发治疗', requires: 'naturesSwiftness' },
                // T5 层 - 终极天赋
                { id: 'riptide', name: '激流', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'riptide' }, description: '解锁激流：瞬发治疗+持续HOT', requires: 'manaTideTotem' }
            ]
        }
    },

    // 法师天赋树 — 精简版
    mage: {
        arcane: {
            id: 'arcane',
            name: '奥术',
            description: '纯粹的奥术能量，法力效率和多功能',
            icon: '💜',
            talents: [
                // T1 层 (0点解锁)
                { id: 'arcaneSublety', name: '奥术微妙', tier: 1, maxPoints: 2, effect: { type: 'threat_reduce', bonus: 0.2 }, description: '奥术法术仇恨降低{bonus*100}%' },
                { id: 'arcaneConcentration', name: '奥术集中', tier: 1, maxPoints: 5, effect: { type: 'clearcast', bonus: 0.02 }, description: '施法后有{bonus*100}%几率下次法术无消耗' },
                // T2 层 (5点解锁)
                { id: 'arcaneMind', name: '奥术心智', tier: 2, maxPoints: 5, effect: { type: 'stat', stat: 'intellect', bonus: 0.02 }, description: '智力提高{bonus*100}%' },
                { id: 'presence', name: '奥术冥想', tier: 2, maxPoints: 3, effect: { type: 'mana_regen', bonus: 0.05 }, description: '施法时继续恢复{bonus*100}%法力' },
                // T3 层 (10点解锁)
                { id: 'arcanePower', name: '奥术强化', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'arcanePower' }, description: '解锁奥术强化：伤害+30%，消耗+30%', requires: 'arcaneMind' },
                { id: 'spellImpact', name: '法术冲击', tier: 3, maxPoints: 3, effect: { type: 'damage_enhance', damageType: 'arcane', bonus: 0.02 }, description: '奥术法术伤害提高{bonus*100}%' },
                // T4 层 (15点解锁)
                { id: 'presenceOfMind', name: '瞬发思维', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'presenceOfMind' }, description: '解锁瞬发思维：下一个法术变为瞬发', requires: 'arcanePower' },
                { id: 'mindMastery', name: '心智精通', tier: 4, maxPoints: 5, effect: { type: 'stat', stat: 'spellpower', bonus: 0.03 }, description: '法术强度提高{bonus*100}%', requires: 'arcanePower' },
                // T5 层 (20点解锁) — 终极天赋
                { id: 'slow', name: '减速', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'slow' }, description: '解锁减速：降低目标攻击/施法/移动速度50%', requires: 'mindMastery' }
            ]
        },
        fire: {
            id: 'fire',
            name: '火焰',
            description: '毁灭性的火焰魔法，高爆发伤害',
            icon: '🔥',
            talents: [
                // T1 层 (0点解锁)
                { id: 'improvedFireball', name: '强化火球术', tier: 1, maxPoints: 5, effect: { type: 'cast_reduce', skill: 'fireball', bonus: 0.1 }, description: '火球术施法时间减少{bonus}秒' },
                { id: 'ignite', name: '点燃', tier: 1, maxPoints: 5, effect: { type: 'crit_dot', bonus: 0.08 }, description: '火焰暴击后造成{bonus*100}%额外持续伤害' },
                // T2 层 (5点解锁)
                { id: 'flameThrowing', name: '火焰投掷', tier: 2, maxPoints: 2, effect: { type: 'range', bonus: 3 }, description: '火焰法术射程增加{bonus}码' },
                { id: 'criticalMass', name: '临界质量', tier: 2, maxPoints: 3, effect: { type: 'fire_crit', bonus: 0.02 }, description: '火焰法术暴击几率提高{bonus*100}%' },
                // T3 层 (10点解锁)
                { id: 'combustion', name: '燃烧', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'combustion' }, description: '解锁燃烧：获得100%暴击率，持续3回合', requires: 'criticalMass' },
                { id: 'firePower', name: '火焰之力', tier: 3, maxPoints: 5, effect: { type: 'fire_enhance', bonus: 0.02 }, description: '火焰法术伤害提高{bonus*100}%' },
                // T4 层 (15点解锁)
                { id: 'dragonBreath', name: '龙息术', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'dragonBreath' }, description: '解锁龙息术：前排火焰AOE+昏迷', requires: 'combustion' },
                { id: 'pyromaniac', name: '纵火狂', tier: 4, maxPoints: 3, effect: { type: 'crit_bonus', bonus: 0.1 }, description: '火焰法术暴击伤害提高{bonus*100}%', requires: 'combustion' },
                // T5 层 (20点解锁) — 终极天赋
                { id: 'livingBomb', name: '活动炸弹', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'livingBomb' }, description: '解锁活动炸弹：DOT+爆炸AOE', requires: 'pyromaniac' }
            ]
        },
        frost: {
            id: 'frost',
            name: '冰霜',
            description: '寒冰控制专家，生存和控制能力',
            icon: '❄️',
            talents: [
                // T1 层 (0点解锁)
                { id: 'improvedFrostbolt', name: '强化寒冰箭', tier: 1, maxPoints: 5, effect: { type: 'cast_reduce', skill: 'frostbolt', bonus: 0.1 }, description: '寒冰箭施法时间减少{bonus}秒' },
                { id: 'frostbite', name: '冻伤', tier: 1, maxPoints: 3, effect: { type: 'freeze_chance', bonus: 0.05 }, description: '冰霜法术有{bonus*100}%几率冻结目标' },
                // T2 层 (5点解锁)
                { id: 'improvedFrostNova', name: '强化冰霜新星', tier: 2, maxPoints: 2, effect: { type: 'cooldown_reduce', skill: 'frostNova', bonus: 2 }, description: '冰霜新星冷却时间减少{bonus}秒' },
                { id: 'shatter', name: '碎裂', tier: 2, maxPoints: 5, effect: { type: 'frozen_crit', bonus: 0.1 }, description: '对冻结目标暴击几率提高{bonus*100}%' },
                // T3 层 (10点解锁)
                { id: 'iceBlock', name: '寒冰屏障', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'iceBlock' }, description: '解锁寒冰屏障：免疫伤害但无法行动', requires: 'shatter' },
                { id: 'permafrost', name: '永冻', tier: 3, maxPoints: 3, effect: { type: 'slow_enhance', bonus: 0.1 }, description: '减速效果提高{bonus*100}%，持续时间延长1回合' },
                // T4 层 (15点解锁)
                { id: 'iceBarrier', name: '寒冰护盾', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'iceBarrier' }, description: '解锁寒冰护盾：吸收伤害的护盾', requires: 'iceBlock' },
                { id: 'arcticWinds', name: '极寒之风', tier: 4, maxPoints: 5, effect: { type: 'frost_enhance', bonus: 0.02 }, description: '冰霜法术伤害提高{bonus*100}%', requires: 'iceBlock' },
                // T5 层 (20点解锁) — 终极天赋
                { id: 'coldSnap', name: '急速冷却', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'coldSnap' }, description: '解锁急速冷却：重置所有冰霜技能CD', requires: 'arcticWinds' }
            ]
        }
    },

    // 术士天赋树 — 精简版
    warlock: {
        affliction: {
            id: 'affliction',
            name: '痛苦',
            description: '持续伤害和诅咒专精，折磨敌人',
            icon: '☠️',
            talents: [
                // T1 层 (0点解锁)
                { id: 'suppression', name: '压制', tier: 1, maxPoints: 5, effect: { type: 'hit_enhance', skills: ['corruption', 'curseOfAgony'], bonus: 0.02 }, description: '痛苦系法术命中率提高{bonus*100}%' },
                { id: 'improvedCorruption', name: '强化腐蚀术', tier: 1, maxPoints: 5, effect: { type: 'cast_reduce', skill: 'corruption', bonus: 0.4 }, description: '腐蚀术施法时间减少{bonus}秒' },
                // T2 层 (5点解锁)
                { id: 'improvedCurseOfAgony', name: '强化痛苦诅咒', tier: 2, maxPoints: 3, effect: { type: 'dot_enhance', skill: 'curseOfAgony', bonus: 0.02 }, description: '痛苦诅咒伤害提高{bonus*100}%' },
                { id: 'shadowMastery', name: '暗影掌握', tier: 2, maxPoints: 5, effect: { type: 'damage_enhance', damageType: 'shadow', bonus: 0.02 }, description: '暗影伤害提高{bonus*100}%' },
                // T3 层 (10点解锁)
                { id: 'siphonLife', name: '生命虹吸', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'siphonLife' }, description: '解锁生命虹吸：DOT+生命转化', requires: 'improvedCurseOfAgony' },
                { id: 'amplifyCurse', name: '放大诅咒', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'amplifyCurse' }, description: '解锁放大诅咒：下一个诅咒效果增强', requires: 'shadowMastery' },
                { id: 'nightfall', name: '夜幕', tier: 3, maxPoints: 3, effect: { type: 'dot_proc', skill: 'corruption', procChance: 0.02, effect: 'instantShadowBolt' }, description: '腐蚀术跳动时有{procChance*100}%几率使下一暗影箭瞬发' },
                // T4 层 (15点解锁)
                { id: 'unstableAffliction', name: '痛苦无常', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'unstableAffliction' }, description: '解锁痛苦无常：DOT被驱散时沉默施法者', requires: 'siphonLife' },
                { id: 'malediction', name: '诅咒增幅', tier: 4, maxPoints: 3, effect: { type: 'dot_enhance_all', bonus: 0.03 }, description: '所有持续伤害提高{bonus*100}%', requires: 'siphonLife' },
                // T5 层 (20点解锁) — 终极天赋
                { id: 'haunt', name: '鬼影缠身', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'haunt' }, description: '解锁鬼影缠身：伤害+目标DoT易伤20%，鬼影返回治疗术士', requires: 'malediction' }
            ]
        },
        demonology: {
            id: 'demonology',
            name: '恶魔学识',
            description: '恶魔召唤和控制专精',
            icon: '👿',
            talents: [
                // T1 层 (0点解锁)
                { id: 'improvedHealthstone', name: '强化治疗石', tier: 1, maxPoints: 2, effect: { type: 'item_enhance', item: 'healthstone', bonus: 0.1 }, description: '治疗石恢复量提高{bonus*100}%' },
                { id: 'improvedImp', name: '强化小鬼', tier: 1, maxPoints: 3, effect: { type: 'pet_enhance', pet: 'imp', bonus: 0.1 }, description: '小鬼火球伤害提高{bonus*100}%' },
                // T2 层 (5点解锁)
                { id: 'demonicEmbrace', name: '恶魔之拥', tier: 2, maxPoints: 5, effect: { type: 'stat', stat: 'stamina', bonus: 0.03 }, description: '耐力提高{bonus*100}%' },
                { id: 'felDomination', name: '恶魔支配', tier: 2, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'felDomination' }, description: '解锁恶魔支配：下次召唤恶魔瞬发且无消耗', requires: 'improvedImp' },
                { id: 'masterDemonologist', name: '恶魔学大师', tier: 2, maxPoints: 5, effect: { type: 'demon_bonus', bonus: 0.02 }, description: '恶魔存活时获得{bonus*100}%属性加成' },
                // T3 层 (10点解锁)
                { id: 'soulLink', name: '灵魂链接', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'soulLink' }, description: '解锁灵魂链接：30%伤害转移给恶魔', requires: 'masterDemonologist' },
                { id: 'demonicKnowledge', name: '恶魔知识', tier: 3, maxPoints: 3, effect: { type: 'pet_stat_bonus', stat: 'allStats', bonus: 0.05 }, description: '恶魔全属性提高{bonus*100}%' },
                // T4 层 (15点解锁)
                { id: 'darkPact', name: '黑暗契约', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'darkPact' }, description: '解锁黑暗契约：消耗恶魔生命恢复法力', requires: 'soulLink' },
                { id: 'demonicTactics', name: '恶魔战术', tier: 4, maxPoints: 3, effect: { type: 'crit_enhance', bonus: 0.01 }, description: '暴击几率提高{bonus*100}%', requires: 'soulLink' },
                // T5 层 (20点解锁) — 终极天赋
                { id: 'metamorphosis', name: '恶魔变形', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'metamorphosis' }, description: '解锁恶魔变形：变身为恶魔形态，护甲+50%、伤害+20%', requires: 'demonicTactics' }
            ]
        },
        destruction: {
            id: 'destruction',
            name: '毁灭',
            description: '直接伤害法术专精，高爆发输出',
            icon: '💥',
            talents: [
                // T1 层 (0点解锁)
                { id: 'improvedShadowBolt', name: '强化暗影箭', tier: 1, maxPoints: 5, effect: { type: 'cast_reduce', skill: 'shadowBolt', bonus: 0.1 }, description: '暗影箭施法时间减少{bonus}秒' },
                { id: 'cataclysm', name: '大灾变', tier: 1, maxPoints: 5, effect: { type: 'mana_reduce', skills: ['immolate', 'soulFire'], bonus: 0.01 }, description: '毁灭法术法力消耗降低{bonus*100}%' },
                // T2 层 (5点解锁)
                { id: 'bane', name: '祸害', tier: 2, maxPoints: 5, effect: { type: 'cast_reduce', skills: ['shadowBolt', 'immolate'], bonus: 0.1 }, description: '暗影箭和献祭施法时间减少{bonus}秒' },
                { id: 'devastation', name: '破坏', tier: 2, maxPoints: 5, effect: { type: 'crit_enhance', bonus: 0.01 }, description: '毁灭法术暴击几率提高{bonus*100}%' },
                // T3 层 (10点解锁)
                { id: 'ruin', name: '毁灭', tier: 3, maxPoints: 1, effect: { type: 'crit_bonus', bonus: 0.5 }, description: '毁灭法术暴击伤害提高{bonus*100}%', requires: 'devastation' },
                { id: 'shadowburn', name: '暗影灼烧', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'shadowburn' }, description: '解锁暗影灼烧：目标低于20%生命时的斩杀技', requires: 'devastation' },
                { id: 'backlash', name: '反冲', tier: 3, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'backlash' }, description: '解锁反冲：受击时有几率使下一次暗影箭瞬发（被动）' },
                // T4 层 (15点解锁)
                { id: 'conflagrate', name: '燃尽', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'conflagrate' }, description: '解锁燃尽：消耗献祭造成火焰伤害', requires: 'ruin' },
                // T5 层 (20点解锁) — 终极天赋
                { id: 'chaosBolt', name: '混乱之箭', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'chaosBolt' }, description: '解锁混乱之箭：无法被抵抗或减免的高额火焰伤害', requires: 'conflagrate' }
            ]
        }
    },

    // 德鲁伊天赋树 — 精简版
    druid: {
        balance: {
            id: 'balance',
            name: '平衡',
            description: '自然与奥术魔法的完美平衡',
            icon: '☀️',
            talents: [
                // T1 层
                { id: 'improvedWrath', name: '强化愤怒', tier: 1, maxPoints: 5, effect: { type: 'damage_bonus', skill: 'wrath', bonus: 0.04 }, description: '愤怒伤害提高{bonus*100}%' },
                { id: 'improvedMoonfire', name: '强化月火术', tier: 1, maxPoints: 5, effect: { type: 'skill_enhance', skill: 'moonfire', bonus: 0.03 }, description: '月火术伤害和持续时间提高{bonus*100}%' },
                // T2 层
                { id: 'naturesReach', name: '自然之及', tier: 2, maxPoints: 2, effect: { type: 'range', bonus: 0.1 }, description: '平衡法术射程增加{bonus*100}%' },
                { id: 'moonglow', name: '月光', tier: 2, maxPoints: 3, effect: { type: 'mana_reduce', skills: ['wrath', 'moonfire'], bonus: 0.03 }, description: '愤怒、月火术法力消耗减少{bonus*100}%' },
                // T3 层
                { id: 'vengeance', name: '复仇', tier: 3, maxPoints: 5, effect: { type: 'crit_bonus', bonus: 0.2 }, description: '法术暴击伤害提高{bonus*100}%', requires: 'moonglow' },
                { id: 'lunarGuidance', name: '月光指引', tier: 3, maxPoints: 3, effect: { type: 'stat_to_spellpower', stat: 'intellect', bonus: 0.04 }, description: '智力的{bonus*100}%转化为法术强度' },
                // T4 层
                { id: 'moonkinForm', name: '枭兽形态', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'moonkinForm' }, description: '解锁枭兽形态', requires: 'vengeance' },
                { id: 'owlkinFrenzy', name: '枭兽狂乱', tier: 4, maxPoints: 3, effect: { type: 'on_hit_damage', chance: 0.1, bonus: 0.1 }, description: '被攻击时有{chance*100}%几率提高伤害{bonus*100}%持续2回合', requires: 'moonkinForm' },
                // T5 层 - 终极天赋
                { id: 'starfall', name: '星落', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'starfall' }, description: '解锁星落终极技能', requires: 'moonkinForm' }
            ]
        },
        feral: {
            id: 'feral',
            name: '野性战斗',
            description: '变形战斗专精，熊和猫形态强化',
            icon: '🐻',
            talents: [
                // T1 层
                { id: 'ferocity', name: '凶暴', tier: 1, maxPoints: 5, effect: { type: 'energy_reduce', skills: ['claw', 'rake', 'shred'], bonus: 1 }, description: '猫形态技能能量消耗减少{bonus}点' },
                { id: 'feralAggression', name: '野性侵略', tier: 1, maxPoints: 5, effect: { type: 'skill_enhance', skill: 'ferociousBite', bonus: 0.03 }, description: '凶猛撕咬伤害提高{bonus*100}%' },
                // T2 层
                { id: 'feralInstinct', name: '野性直觉', tier: 2, maxPoints: 5, effect: { type: 'threat', bonus: 0.05 }, description: '熊形态仇恨提高{bonus*100}%' },
                { id: 'thickHide', name: '厚皮', tier: 2, maxPoints: 5, effect: { type: 'armor_bonus', bonus: 0.04 }, description: '熊形态护甲值提高{bonus*100}%' },
                // T3 层
                { id: 'sharpenedClaws', name: '利爪', tier: 3, maxPoints: 3, effect: { type: 'crit_chance', bonus: 0.02 }, description: '近战暴击几率提高{bonus*100}%', requires: 'thickHide' },
                { id: 'primalFury', name: '原始狂怒', tier: 3, maxPoints: 5, effect: { type: 'combo_on_crit', bonus: 1 }, description: '暴击时额外获得{bonus}连击点', requires: 'sharpenedClaws' },
                // T4 层
                { id: 'leaderOfThePack', name: '兽群领袖', tier: 4, maxPoints: 1, effect: { type: 'aura', aura: 'leaderOfThePack', bonus: 0.05 }, description: '解锁兽群领袖光环：小队暴击几率提高5%', requires: 'primalFury' },
                { id: 'heartOfTheWild', name: '野性之心', tier: 4, maxPoints: 5, effect: { type: 'stat_mult', stat: 'agility', bonus: 0.04 }, description: '猫形态敏捷提高{bonus*100}%，熊形态耐力提高{bonus*100}%' },
                // T5 层 - 终极天赋
                { id: 'mangle', name: '割碎', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'mangle' }, description: '解锁割碎技能（熊/猫形态强力攻击）', requires: 'leaderOfThePack' }
            ]
        },
        restoration: {
            id: 'restoration',
            name: '恢复',
            description: '自然治疗专精，持续治疗能力',
            icon: '🌱',
            talents: [
                // T1 层
                { id: 'improvedMarkOfTheWild', name: '强化野性印记', tier: 1, maxPoints: 5, effect: { type: 'buff_enhance', buff: 'markOfTheWild', bonus: 0.07 }, description: '野性印记效果提高{bonus*100}%' },
                { id: 'improvedRejuvenation', name: '强化回春术', tier: 1, maxPoints: 3, effect: { type: 'heal_enhance', skill: 'rejuvenation', bonus: 0.05 }, description: '回春术治疗效果提高{bonus*100}%' },
                // T2 层
                { id: 'giftOfNature', name: '自然赐予', tier: 2, maxPoints: 5, effect: { type: 'heal_enhance_all', bonus: 0.02 }, description: '所有治疗法术效果提高{bonus*100}%' },
                { id: 'naturesBlessing', name: '自然祝福', tier: 2, maxPoints: 3, effect: { type: 'stat_to_healpower', stat: 'intellect', bonus: 0.04 }, description: '智力的{bonus*100}%转化为治疗强度' },
                // T3 层
                { id: 'empoweredTouch', name: '强化愈合', tier: 3, maxPoints: 2, effect: { type: 'heal_enhance', skill: 'healingTouch', bonus: 0.1 }, description: '愈合治疗效果提高{bonus*100}%', requires: 'giftOfNature' },
                { id: 'naturalPerfection', name: '自然完美', tier: 3, maxPoints: 3, effect: { type: 'crit_to_heal', bonus: 0.03 }, description: '治疗暴击几率提高{bonus*100}%，受到暴击伤害减少{bonus*100}%' },
                // T4 层
                { id: 'swiftmend', name: '迅捷治愈', tier: 4, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'swiftmend' }, description: '解锁迅捷治愈：消耗HOT效果立即治疗', requires: 'empoweredTouch' },
                // T5 层 - 终极天赋
                { id: 'treeOfLife', name: '生命之树', tier: 5, maxPoints: 1, effect: { type: 'unlock_skill', skill: 'treeOfLifeForm' }, description: '解锁生命之树形态', requires: 'swiftmend' }
            ]
        }
    }
};
