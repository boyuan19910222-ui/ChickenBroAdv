import { monsters as expandedMonsters, areas as expandedAreas } from './MonsterData.js';

/**
 * 游戏数据配置 - 职业、技能、装备等基础数据
 */
export const GameData = {
    // 版本信息
    version: '1.0.0',
    
    // 职业速度配置（用于副本战斗行动顺序）
    classSpeed: {
        rogue: 95,      // 盗贼 - 最敏捷
        hunter: 85,     // 猎人 - 灵活
        druid: 75,      // 德鲁伊 - 中上
        mage: 70,       // 法师 - 中等
        shaman: 65,     // 萨满 - 中等
        warlock: 60,    // 术士 - 中下
        priest: 55,     // 牧师 - 偏慢
        paladin: 45,    // 圣骑士 - 慢
        warrior: 40,    // 战士 - 最慢（重甲）
    },
    
    // 敌人速度配置
    enemySpeed: {
        // 小怪
        bat: 90,           // 蝙蝠 - 极快
        snake: 80,         // 毒蛇 - 快
        spider: 75,        // 蜘蛛 - 快
        cultist: 55,       // 狂热者 - 中等
        skeleton: 50,      // 骷髅 - 中等
        zombie: 30,        // 僵尸 - 慢
        golem: 20,         // 傀儡 - 极慢
        forestOrc: 45,     // 森林兽人
        goblin: 65,        // 哥布林
        wolf: 70,          // 野狼
        troll: 35,         // 巨魔
        tendril_vine: 30,  // 触手藤
        
        // BOSS
        serpentis: 60,     // 瑟芬迪斯
        mutanus: 45,       // 穆坦努斯
    },
    
    // 资源系统配置
    resourceSystems: {
        rage: {
            displayName: '怒气',
            emoji: '💢',
            color: '#FF4444',
            defaultMax: 100,
            startValue: 0,
            
            generation: {
                onHit: 5,           // 被击中获得
                onAttack: 8,        // 普通攻击获得
                critMultiplier: 1.5 // 暴击倍率
            },
            
            decay: {
                enabled: true,
                delay: 3,           // 脱战后延迟秒数
                rate: 2             // 每秒衰减量
            }
        },
        
        mana: {
            displayName: '法力',
            emoji: '💧',
            color: '#4444FF',
            defaultMax: null,       // 由属性计算
            startValue: 'full',
            
            generation: {
                perTurn: 5,
                spiritScaling: 0.5
            },
            
            decay: {
                enabled: false
            }
        },
        
        energy: {
            displayName: '能量',
            emoji: '⚡',
            color: '#FFFF00',
            defaultMax: 100,
            startValue: 'full',
            
            generation: {
                perTurn: 15,        // 战斗中每回合恢复
                outOfCombat: {
                    enabled: true,
                    rate: 20,       // 脱战后每秒恢复量
                    delay: 1        // 脱战后延迟秒数
                }
            },
            
            decay: {
                enabled: false
            }
        }
    },
    
    // 职业配置
    classes: {
        warrior: {
            id: 'warrior',
            name: '战士',
            description: '近战物理职业，拥有高生命值和护甲',
            icon: '/icons/classes/warrior.png',
            color: '#C79C6E',
            baseStats: {
                health: 180,
                mana: 30,
                strength: 15,
                agility: 8,
                intellect: 5,
                stamina: 8,
                spirit: 5
            },
            growthPerLevel: {
                health: 15,
                mana: 3,
                strength: 3,
                agility: 1,
                intellect: 1,
                stamina: 0.5,
                spirit: 1
            },
            // 基础技能（创建角色时直接获得）
            baseSkills: ['heroicStrike', 'charge', 'rend', 'battleShout'],
            // 所有技能（含天赋解锁技能，供UI参考）
            skills: [
                // 基础技能 (4个)
                'heroicStrike', 'charge', 'rend', 'battleShout',
                // 武器树天赋解锁 (2个)
                'cleave', 'mortalStrike',
                // 狂暴树天赋解锁 (2个)
                'execute', 'bloodthirst',
                // 防护树天赋解锁 (3个)
                'shieldBlock', 'taunt', 'shieldWall'
            ],
            role: ['tank', 'dps'],
            armorTypes: ['cloth', 'leather', 'mail', 'plate'],
            weaponTypes: {
                oneHand: ['sword', 'axe', 'mace', 'dagger', 'fist'],
                twoHand: ['sword', 'axe', 'mace', 'polearm', 'bow', 'crossbow', 'gun'],
            },
            canUseShield: true,
            resourceType: 'rage',
            talentTrees: ['arms', 'fury', 'protection'],
            specialMechanic: null
        },
        paladin: {
            id: 'paladin',
            name: '圣骑士',
            description: '神圣战士，可担任坦克、治疗或近战DPS',
            icon: '/icons/classes/paladin.png',
            color: '#F58CBA',
            baseStats: {
                health: 165,
                mana: 70,
                strength: 14,
                agility: 6,
                intellect: 10,
                stamina: 7,
                spirit: 10
            },
            growthPerLevel: {
                health: 14,
                mana: 7,
                strength: 2,
                agility: 1,
                intellect: 2,
                stamina: 0.4,
                spirit: 2
            },
            // 基础技能（创建角色时直接获得）
            baseSkills: ['crusaderStrike', 'sealOfJustice', 'judgement', 'holyLight'],
            // 所有技能（含天赋解锁技能，供UI参考）
            skills: [
                // 基础技能 (4个)
                'crusaderStrike', 'sealOfJustice', 'judgement', 'holyLight',
                // 神圣树天赋解锁 (2个)
                'sealOfLight', 'layOnHands',
                // 防护树天赋解锁 (2个)
                'consecration', 'divineShield',
                // 惩戒树天赋解锁 (2个)
                'sealOfCommand', 'hammerOfWrath'
            ],
            role: ['tank', 'healer', 'dps'],
            armorTypes: ['cloth', 'leather', 'mail', 'plate'],
            weaponTypes: {
                oneHand: ['sword', 'axe', 'mace'],
                twoHand: ['sword', 'axe', 'mace', 'polearm'],
            },
            canUseShield: true,
            resourceType: 'mana',
            talentTrees: ['holy', 'protection', 'retribution'],
            specialMechanic: 'seal'
        },
        hunter: {
            id: 'hunter',
            name: '猎人',
            description: '远程物理职业，拥有宠物协助战斗',
            icon: '/icons/classes/hunter.png',
            color: '#ABD473',
            baseStats: {
                health: 90,
                mana: 60,
                strength: 8,
                agility: 16,
                intellect: 6,
                stamina: 9,
                spirit: 8
            },
            growthPerLevel: {
                health: 11,
                mana: 6,
                strength: 1,
                agility: 3,
                intellect: 1,
                stamina: 0.2,
                spirit: 1
            },
            // 基础技能（创建角色时直接获得）
            baseSkills: ['arcaneShot', 'serpentSting', 'huntersMark', 'summonPet'],
            // 所有技能（含天赋解锁技能，供UI参考）
            skills: [
                // 基础技能 (4个)
                'arcaneShot', 'serpentSting', 'huntersMark', 'summonPet',
                // 野兽控制树天赋解锁 (2个)
                'killCommand', 'intimidation',
                // 射击树天赋解锁 (2个)
                'aimedShot', 'multiShot',
                // 生存树天赋解锁 (2个)
                'explosiveTrap', 'mongooseBite'
            ],
            role: ['dps'],
            armorTypes: ['cloth', 'leather', 'mail'],
            weaponTypes: {
                oneHand: ['sword', 'axe', 'dagger', 'fist'],
                twoHand: ['sword', 'axe', 'polearm', 'staff', 'bow', 'crossbow', 'gun'],
            },
            canUseShield: false,
            resourceType: 'mana',
            talentTrees: ['beastMastery', 'marksmanship', 'survival'],
            specialMechanic: 'pet'
        },
        rogue: {
            id: 'rogue',
            name: '盗贼',
            description: '敏捷型职业，擅长暴击和闪避',
            icon: '/icons/classes/rogue.png',
            color: '#FFF569',
            baseStats: {
                health: 80,
                mana: 50,
                strength: 10,
                agility: 18,
                intellect: 5,
                stamina: 8,
                spirit: 6
            },
            growthPerLevel: {
                health: 10,
                mana: 5,
                strength: 2,
                agility: 4,
                intellect: 1,
                stamina: 0.1,
                spirit: 1
            },
            // 基础技能（创建角色时直接获得）
            baseSkills: ['shadowStrike', 'eviscerate', 'stealth', 'ambush', 'evade'],
            // 所有技能（含天赋解锁技能，供UI参考）
            skills: [
                // 基础技能 (5个)
                'shadowStrike', 'eviscerate', 'stealth', 'ambush', 'evade',
                // 刺杀树天赋解锁 (2个)
                'deadlyPoison', 'mutilate',
                // 战斗树天赋解锁 (2个)
                'bladeFlurry', 'killingSpree',
                // 敏锐树天赋解锁 (2个)
                'vanish', 'shadowDance'
            ],
            role: ['dps'],
            armorTypes: ['cloth', 'leather'],
            weaponTypes: {
                oneHand: ['sword', 'mace', 'dagger', 'fist'],
                twoHand: [],
            },
            canUseShield: false,
            resourceType: 'energy',
            talentTrees: ['assassination', 'combat', 'subtlety'],
            specialMechanic: 'stealth'
        },
        priest: {
            id: 'priest',
            name: '牧师',
            description: '治疗职业，可以恢复生命和驱散debuff',
            icon: '/icons/classes/priest.png',
            color: '#FFFFFF',
            baseStats: {
                health: 70,
                mana: 90,
                strength: 4,
                agility: 5,
                intellect: 16,
                stamina: 7,
                spirit: 18
            },
            growthPerLevel: {
                health: 9,
                mana: 10,
                strength: 1,
                agility: 1,
                intellect: 3,
                stamina: 0.0,
                spirit: 3
            },
            // 基础技能（创建角色时直接获得）
            baseSkills: ['smite', 'heal', 'shield', 'shadowWordPain', 'prayerOfHealing'],
            // 所有技能（含天赋解锁技能，供UI参考）
            skills: [
                // 基础技能 (5个)
                'smite', 'heal', 'shield', 'shadowWordPain', 'prayerOfHealing',
                // 戒律树天赋解锁 (2个)
                'innerFocus', 'painSuppression',
                // 神圣树天赋解锁 (2个)
                'lightwell', 'guardianSpirit',
                // 暗影树天赋解锁 (2个)
                'shadowform', 'dispersion'
            ],
            role: ['healer', 'dps'],
            armorTypes: ['cloth'],
            weaponTypes: {
                oneHand: ['mace', 'dagger', 'wand'],
                twoHand: ['staff'],
            },
            canUseShield: false,
            canUseOffhand: true,
            resourceType: 'mana',
            talentTrees: ['discipline', 'holy', 'shadow'],
            specialMechanic: null
        },
        shaman: {
            id: 'shaman',
            name: '萨满祭司',
            description: '元素使者，可担任治疗或DPS，拥有独特的图腾系统',
            icon: '/icons/classes/shaman.png',
            color: '#0070DE',
            baseStats: {
                health: 85,
                mana: 80,
                strength: 10,
                agility: 8,
                intellect: 14,
                stamina: 9,
                spirit: 12
            },
            growthPerLevel: {
                health: 11,
                mana: 8,
                strength: 2,
                agility: 1,
                intellect: 2,
                stamina: 0.2,
                spirit: 2
            },
            // 基础技能（创建角色时直接获得）
            baseSkills: ['lightningBolt', 'flameShock', 'healingWave', 'chainLightning', 'heroism'],
            // 所有技能（含天赋解锁技能，供UI参考）
            skills: [
                // 基础技能 (5个)
                'lightningBolt', 'flameShock', 'healingWave', 'chainLightning', 'heroism',
                // 核心技能 (5个，等级解锁)
                'earthShock', 'frostShock', 'purge', 'searingTotem', 'chainHeal',
                // 元素树天赋解锁 (3个)
                'elementalMastery', 'lavaBurst', 'thunderstorm',
                // 增强树天赋解锁 (3个)
                'stormstrike', 'shamanisticRage', 'feralSpirit',
                // 恢复树天赋解锁 (4个)
                'naturesSwiftnessShaman', 'manaTideTotem', 'earthShield', 'riptide'
            ],
            role: ['healer', 'dps'],
            armorTypes: ['cloth', 'leather', 'mail'],
            weaponTypes: {
                oneHand: ['axe', 'mace', 'dagger', 'fist'],
                twoHand: ['axe', 'mace', 'staff'],
            },
            canUseShield: true,
            resourceType: 'mana',
            talentTrees: ['elemental', 'enhancement', 'restoration'],
            specialMechanic: 'totem'
        },
        mage: {
            id: 'mage',
            name: '法师',
            description: '远程魔法职业，拥有强大的AOE伤害',
            icon: '/icons/classes/mage.png',
            color: '#69CCF0',
            baseStats: {
                health: 60,
                mana: 100,
                strength: 3,
                agility: 5,
                intellect: 18,
                stamina: 6,
                spirit: 14
            },
            growthPerLevel: {
                health: 8,
                mana: 12,
                strength: 1,
                agility: 1,
                intellect: 4,
                stamina: 0.0,
                spirit: 2
            },
            // 基础技能（创建角色时直接获得）
            baseSkills: ['fireball', 'frostbolt', 'arcaneIntellect', 'frostNova', 'blizzard'],
            // 所有技能（含天赋解锁技能，供UI参考）
            skills: [
                // 基础技能 (5个)
                'fireball', 'frostbolt', 'arcaneIntellect', 'frostNova', 'blizzard',
                // 核心技能 (6个，等级解锁)
                'flamestrike', 'pyroblast', 'arcaneMissiles', 'arcaneBlast', 'blink', 'conjureMana',
                // 奥术树天赋解锁 (3个)
                'arcanePower', 'presenceOfMind', 'slow',
                // 火焰树天赋解锁 (3个)
                'combustion', 'dragonBreath', 'livingBomb',
                // 冰霜树天赋解锁 (3个)
                'iceBlock', 'iceBarrier', 'coldSnap'
            ],
            role: ['dps'],
            armorTypes: ['cloth'],
            weaponTypes: {
                oneHand: ['sword', 'dagger', 'wand'],
                twoHand: ['staff'],
            },
            canUseShield: false,
            canUseOffhand: true,
            resourceType: 'mana',
            talentTrees: ['arcane', 'fire', 'frost'],
            specialMechanic: null
        },
        warlock: {
            id: 'warlock',
            name: '术士',
            description: '暗影魔法师，召唤恶魔并施放诅咒和持续伤害',
            icon: '/icons/classes/warlock.png',
            color: '#9482C9',
            baseStats: {
                health: 70,
                mana: 95,
                strength: 4,
                agility: 5,
                intellect: 17,
                stamina: 8,
                spirit: 13
            },
            growthPerLevel: {
                health: 9,
                mana: 11,
                strength: 1,
                agility: 1,
                intellect: 4,
                stamina: 0.0,
                spirit: 2
            },
            // 基础技能（创建角色时直接获得）
            baseSkills: ['shadowBolt', 'corruption', 'immolate', 'fear', 'summonDemon'],
            // 所有技能（含天赋解锁技能，供UI参考）
            skills: [
                // 基础技能 (5个)
                'shadowBolt', 'corruption', 'immolate', 'fear', 'summonDemon',
                // 核心技能 (6个，等级解锁)
                'drainLife', 'curseOfAgony', 'curseOfWeakness', 'curseOfElements', 'demonArmor', 'rainOfFire',
                // 特殊核心技能
                'soulFire',
                // 痛苦树天赋解锁 (3个)
                'amplifyCurse', 'siphonLife', 'unstableAffliction', 'haunt',
                // 恶魔学识天赋解锁 (4个)
                'felDomination', 'darkPact', 'soulLink', 'metamorphosis',
                // 毁灭系天赋解锁 (4个)
                'backlash', 'shadowburn', 'conflagrate', 'chaosBolt'
            ],
            role: ['dps'],
            armorTypes: ['cloth'],
            weaponTypes: {
                oneHand: ['sword', 'dagger', 'wand'],
                twoHand: ['staff'],
            },
            canUseShield: false,
            canUseOffhand: true,
            resourceType: 'mana',
            talentTrees: ['affliction', 'demonology', 'destruction'],
            specialMechanic: 'demon'
        },
        druid: {
            id: 'druid',
            name: '德鲁伊',
            description: '自然守护者，可变形为不同动物形态，承担多种角色',
            icon: '/icons/classes/druid.png',
            color: '#FF7D0A',
            baseStats: {
                health: 85,
                mana: 75,
                strength: 9,
                agility: 10,
                intellect: 12,
                stamina: 9,
                spirit: 14
            },
            growthPerLevel: {
                health: 10,
                mana: 8,
                strength: 2,
                agility: 2,
                intellect: 2,
                stamina: 0.5,
                spirit: 2
            },
            // 基础技能（创建角色时直接获得）
            baseSkills: [
                // 人形基础技能 (5个)
                'wrath', 'moonfire', 'rejuvenation', 'healingTouch', 'entanglingRoots',
                // 熊形态技能 (5个)
                'bearForm', 'maul', 'swipe', 'demoralizingRoar', 'bash',
                // 猫形态技能 (5个)
                'catForm', 'claw', 'rake', 'ferociousBite', 'prowl'
            ],
            // 所有技能（含天赋解锁技能，供UI参考）
            skills: [
                // 人形基础技能 (5个)
                'wrath', 'moonfire', 'rejuvenation', 'healingTouch', 'entanglingRoots',
                // 熊形态技能 (5个)
                'bearForm', 'maul', 'swipe', 'demoralizingRoar', 'bash',
                // 猫形态技能 (5个)
                'catForm', 'claw', 'rake', 'ferociousBite', 'prowl',
                // 平衡树天赋解锁 (2个)
                'moonkinForm', 'starfall',
                // 野性树天赋解锁 (1个)
                'mangle',
                // 恢复树天赋解锁 (2个)
                'swiftmend', 'treeOfLifeForm'
            ],
            role: ['tank', 'healer', 'dps'],
            armorTypes: ['cloth', 'leather'],
            weaponTypes: {
                oneHand: ['mace', 'dagger', 'fist'],
                twoHand: ['mace', 'staff'],
            },
            canUseShield: false,
            canUseOffhand: true,
            resourceType: 'mana',
            talentTrees: ['balance', 'feral', 'restoration'],
            specialMechanic: 'shapeshift'
        }
    },
    
    // 技能配置
    skills: {
        // ═══════════════════════════════════════════
        // 战士技能 (Warrior) — 资源: rage
        // ═══════════════════════════════════════════
        heroicStrike: {
            id: 'heroicStrike', name: '英勇打击', emoji: '⚔️',
            icon: '/icons/skills/warrior/heroic-strike.png',
            description: '强力的近战攻击，造成物理伤害',
            unlockLevel: 1, category: 'filler',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'rage', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: { base: 20, scaling: 1.5, stat: 'strength' },
            heal: null, effects: [], comboPoints: null, generatesResource: null, conditions: null
        },
        charge: {
            id: 'charge', name: '冲锋', emoji: '💨',
            icon: '/icons/skills/warrior/charge.png',
            description: '冲向敌人，造成伤害并眩晕1回合，产生15怒气',
            unlockLevel: 1, category: 'core',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'rage', value: 0 }, actionPoints: 2, cooldown: 3,
            damage: { base: 15, scaling: 1.0, stat: 'strength' },
            heal: null,
            effects: [{ type: 'cc', ccType: 'stun', duration: 1 }],
            comboPoints: null,
            generatesResource: { type: 'rage', value: 15 },
            conditions: null
        },
        // 撕裂 — 基础DOT技能
        rend: {
            id: 'rend', name: '撕裂', emoji: '🩸',
            icon: '/icons/skills/warrior/rend.png',
            description: '撕裂目标，造成持续流血伤害，持续3回合',
            unlockLevel: 4, category: 'core',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'rage', value: 10 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'dot', name: 'rend', damageType: 'physical', tickDamage: 8, scalingStat: 'strength', scalingFactor: 0.4, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // === 天赋解锁技能 — 武器树 ===
        // 横扫 — 武器树层2解锁，激活buff使技能溅射
        cleave: {
            id: 'cleave', name: '横扫', emoji: '🌀',
            description: '激活横扫姿态，3回合内所有技能额外溅射1个目标',
            unlockLevel: 1, category: 'core', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'rage', value: 20 }, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'cleaveStance', stat: 'cleave', value: 1, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // 顺劈斩 — 武器树层4解锁
        heroicLeap: {
            id: 'heroicLeap', name: '顺劈斩', emoji: '⚔️',
            description: '对前排2个敌人造成物理伤害',
            unlockLevel: 1, category: 'core', talentUnlock: true,
            skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee',
            resourceCost: { type: 'rage', value: 20 }, actionPoints: 2, cooldown: 2,
            damage: { base: 25, scaling: 1.5, stat: 'strength' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // 致死打击 — 武器树层5终极天赋解锁
        mortalStrike: {
            id: 'mortalStrike', name: '致死打击', emoji: '🗡️',
            description: '高伤害攻击，使目标受到的治疗效果降低50%，装备双手武器时伤害额外+30%',
            unlockLevel: 1, category: 'powerful', talentUnlock: true,
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'rage', value: 25 }, actionPoints: 2, cooldown: 2,
            damage: { base: 35, scaling: 2.0, stat: 'strength' },
            heal: null,
            effects: [{ type: 'debuff', name: 'mortalWound', stat: 'healingReceived', value: -0.5, duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // === 天赋解锁技能 — 狂暴树 ===
        // 斩杀 — 狂暴树层4解锁
        execute: {
            id: 'execute', name: '斩杀', emoji: '💀',
            description: '对低血量目标造成巨额伤害，目标低于20%HP时伤害翻倍',
            unlockLevel: 1, category: 'powerful', talentUnlock: true,
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'rage', value: 30 }, actionPoints: 2, cooldown: 3,
            damage: { base: 45, scaling: 2.5, stat: 'strength' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null,
            conditions: { targetBelowHp: 0.2 }
        },
        // 嗜血 — 狂暴树层5终极天赋解锁
        bloodthirst: {
            id: 'bloodthirst', name: '嗜血', emoji: '🩸',
            description: '基于力量的瞬发攻击，治疗自身相当于伤害的20%，装备双持武器时伤害额外+30%',
            unlockLevel: 1, category: 'powerful', talentUnlock: true,
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'rage', value: 20 }, actionPoints: 1, cooldown: 2,
            damage: { base: 20, scaling: 1.8, stat: 'strength' },
            heal: null,
            effects: [{ type: 'lifesteal', value: 0.2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // === 天赋解锁技能 — 防护树 ===
        // 盾牌格挡 — 防护树层2解锁（持续2回合）
        shieldBlock: {
            id: 'shieldBlock', name: '盾牌格挡', emoji: '🛡️',
            description: '格挡攻击，减少50%伤害持续2回合',
            unlockLevel: 1, category: 'utility', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'rage', value: 10 }, actionPoints: 1, cooldown: 3,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'block', stat: 'damageReduction', value: 0.5, duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // 嘲讽 — 防护树层3解锁
        taunt: {
            id: 'taunt', name: '嘲讽', emoji: '😤',
            description: '嘲讽敌人，强制其攻击自己2回合',
            unlockLevel: 1, category: 'utility', talentUnlock: true,
            skillType: 'debuff', damageType: null, targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'rage', value: 5 }, actionPoints: 1, cooldown: 3,
            damage: null, heal: null,
            effects: [{ type: 'debuff', name: 'taunt', duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // 破釜沉舟 — 防护树层4解锁
        lastStand: {
            id: 'lastStand', name: '破釜沉舟', emoji: '💪',
            description: '临时提高30%最大生命值，持续3回合',
            unlockLevel: 1, category: 'utility', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'rage', value: 20 }, actionPoints: 1, cooldown: 6,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'lastStand', stat: 'health', value: 0.3, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // 盾墙 — 防护树层5终极天赋解锁
        shieldWall: {
            id: 'shieldWall', name: '盾墙', emoji: '🏰',
            description: '大幅减伤75%持续2回合，持盾时额外每回合回复5%最大HP',
            unlockLevel: 1, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'rage', value: 40 }, actionPoints: 3, cooldown: 8,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'shieldWall', stat: 'damageReduction', value: 0.75, duration: 2 },
                { type: 'hot', name: 'shieldWallHeal', tickHeal: 0, tickHealPercent: 0.05, duration: 2 }
            ],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ═══════════════════════════════════════════
        // 盗贼技能 (Rogue) — 资源: energy + comboPoints
        // ═══════════════════════════════════════════
        shadowStrike: {
            id: 'shadowStrike', name: '影袭', emoji: '👤',
            description: '快速攻击敌人，产生1个连击点',
            unlockLevel: 1, category: 'builder',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 40 }, actionPoints: 1, cooldown: 0,
            damage: { base: 20, scaling: 1.2, stat: 'agility' },
            heal: null, effects: [],
            comboPoints: { generates: 1 },
            generatesResource: null, conditions: null
        },
        eviscerate: {
            id: 'eviscerate', name: '剔骨', emoji: '🔪',
            description: '消耗连击点造成伤害，连击点越多伤害越高',
            unlockLevel: 1, category: 'finisher',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 35 }, actionPoints: 2, cooldown: 0,
            damage: null, heal: null, effects: [],
            comboPoints: {
                requires: true,
                damageTable: [
                    { points: 1, base: 40, scaling: 0.5 },
                    { points: 2, base: 90, scaling: 0.8 },
                    { points: 3, base: 150, scaling: 1.2 },
                    { points: 4, base: 220, scaling: 1.6 },
                    { points: 5, base: 300, scaling: 2.0 }
                ]
            },
            generatesResource: null, conditions: null
        },
        backstab: {
            id: 'backstab', name: '背刺', emoji: '🗡️',
            description: '从背后攻击造成高伤害，产生1个连击点',
            unlockLevel: 4, category: 'builder',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 60 }, actionPoints: 2, cooldown: 0,
            damage: { base: 35, scaling: 2.0, stat: 'agility' },
            heal: null, effects: [],
            comboPoints: { generates: 1 },
            generatesResource: null, conditions: null
        },
        poisonBlade: {
            id: 'poisonBlade', name: '毒刃', emoji: '🧪',
            description: '附加毒素，造成伤害并持续中毒3回合',
            unlockLevel: 8, category: 'utility',
            skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 35 }, actionPoints: 1, cooldown: 2,
            damage: { base: 10, scaling: 0.5, stat: 'agility' },
            heal: null,
            effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 10, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        kidneyShot: {
            id: 'kidneyShot', name: '肾击', emoji: '👊',
            description: '消耗连击点眩晕敌人，持续时间随连击点增长',
            unlockLevel: 14, category: 'finisher',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 25 }, actionPoints: 2, cooldown: 4,
            damage: { base: 15, scaling: 0.5, stat: 'agility' },
            heal: null,
            effects: [{ type: 'cc', ccType: 'stun', duration: 2 }],
            comboPoints: { requires: true },
            generatesResource: null, conditions: null
        },
        evade: {
            id: 'evade', name: '闪避', emoji: '💨',
            description: '提高闪避率50%，持续2回合',
            unlockLevel: 20, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'energy', value: 25 }, actionPoints: 1, cooldown: 4,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'evasion', stat: 'dodgeChance', value: 0.5, duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        vanish: {
            id: 'vanish', name: '消失', emoji: '🌑',
            description: '消失在暗影中，脱离仇恨，下次攻击必定暴击',
            unlockLevel: 30, category: 'powerful',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'energy', value: 30 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'vanish', stat: 'nextCrit', value: 1.0, duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ── 盗贼潜行系统技能 (Stealth Skills) ─────────────────
        stealth: {
            id: 'stealth', name: '潜行', emoji: '🫥',
            description: '进入潜行状态，隐身于暗影之中',
            unlockLevel: 1, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 2,
            damage: null, heal: null,
            effects: [
                { type: 'stealth', name: 'stealth', duration: 99 },
                { type: 'buff', name: 'stealthSpeed', stat: 'moveSpeed', value: -0.3, duration: 99 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { outOfCombat: true }
        },
        cheapShot: {
            id: 'cheapShot', name: '偷袭', emoji: '💫',
            description: '潜行状态下使用，眩晕目标4秒并产生2个连击点',
            unlockLevel: 14, category: 'opener',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 40 }, actionPoints: 2, cooldown: 0,
            damage: { base: 15, scaling: 0.5, stat: 'agility' },
            heal: null,
            effects: [{ type: 'stun', name: 'cheapShot', duration: 4 }],
            comboPoints: { generates: 2 },
            generatesResource: null,
            conditions: { requiresStealth: true }
        },
        ambush: {
            id: 'ambush', name: '伏击', emoji: '🗡️',
            description: '潜行状态下使用，造成高额伤害并产生2个连击点',
            unlockLevel: 18, category: 'opener',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 60 }, actionPoints: 2, cooldown: 0,
            damage: { base: 80, scaling: 3.0, stat: 'agility' },
            heal: null,
            effects: [{ type: 'bonusCrit', value: 0.5 }],
            comboPoints: { generates: 2 },
            generatesResource: null,
            conditions: { requiresStealth: true }
        },
        sap: {
            id: 'sap', name: '闷棍', emoji: '😴',
            description: '潜行状态下使用，使目标昏迷30秒，伤害会打断效果',
            unlockLevel: 10, category: 'utility',
            skillType: 'melee', damageType: null, targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 35 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'incapacitate', name: 'sap', duration: 30, breakOnDamage: true }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresStealth: true, targetHumanoid: true }
        },

        // ── 盗贼连击技能 (Combo Skills) ─────────────────
        sliceAndDice: {
            id: 'sliceAndDice', name: '切割', emoji: '⚡',
            description: '消耗连击点提升攻击速度，持续时间随连击点增长',
            unlockLevel: 8, category: 'finisher',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'energy', value: 25 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'sliceAndDice', stat: 'attackSpeed', value: 0.3, durationPerCombo: 3 }],
            comboPoints: { consumes: true },
            generatesResource: null, conditions: null
        },
        hemorrhage: {
            id: 'hemorrhage', name: '出血', emoji: '🩸',
            description: '造成物理伤害并使目标流血，产生1个连击点',
            unlockLevel: 20, category: 'builder',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 35 }, actionPoints: 1, cooldown: 0,
            damage: { base: 25, scaling: 1.2, stat: 'agility' },
            heal: null,
            effects: [
                { type: 'dot', name: 'hemorrhage', damageType: 'physical', tickDamage: 8, duration: 4 },
                { type: 'debuff', name: 'hemorrhageVuln', stat: 'bleedDamage', value: 0.3, duration: 4 }
            ],
            comboPoints: { generates: 1 },
            generatesResource: null, conditions: null
        },
        fanOfKnives: {
            id: 'fanOfKnives', name: '刀扇', emoji: '🔪',
            description: '向周围所有敌人投掷飞刀，造成物理伤害',
            unlockLevel: 24, category: 'core',
            skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee',
            resourceCost: { type: 'energy', value: 50 }, actionPoints: 2, cooldown: 0,
            damage: { base: 18, scaling: 0.8, stat: 'agility' },
            heal: null, effects: [],
            comboPoints: { generates: 1 },
            generatesResource: null, conditions: null
        },
        rupture: {
            id: 'rupture', name: '割裂', emoji: '💥',
            description: '消耗连击点造成流血伤害，持续时间和伤害随连击点增长',
            unlockLevel: 14, category: 'finisher',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 25 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{
                type: 'dot', name: 'rupture', damageType: 'physical',
                tickDamage: 12, durationPerCombo: 2, damagePerCombo: 5
            }],
            comboPoints: { consumes: true },
            generatesResource: null, conditions: null
        },

        // ── 盗贼天赋解锁技能 (Talent Skills) ─────────────────
        coldBlood: {
            id: 'coldBlood', name: '冷血', emoji: '❄️',
            description: '激活后，下一次攻击技能必定暴击',
            unlockLevel: 1, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'coldBlood', stat: 'nextCrit', value: 1.0, duration: 3 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'coldBlood' }
        },
        bladeFlurry: {
            id: 'bladeFlurry', name: '剑刃乱舞', emoji: '🌀',
            description: '激活后，近战攻击同时打击附近敌人，持续8秒',
            unlockLevel: 1, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'energy', value: 25 }, actionPoints: 1, cooldown: 6,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'bladeFlurry', stat: 'cleaveAttacks', value: 0.5, duration: 4 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'bladeFlurry' }
        },
        adrenalineRush: {
            id: 'adrenalineRush', name: '冲动', emoji: '🔥',
            description: '能量恢复速度提高100%，持续10秒',
            unlockLevel: 1, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 8,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'adrenalineRush', stat: 'energyRegen', value: 1.0, duration: 5 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'adrenalineRush' }
        },
        ghostlyStrike: {
            id: 'ghostlyStrike', name: '幽灵打击', emoji: '👻',
            description: '造成物理伤害并提升闪避30%持续3秒',
            unlockLevel: 1, category: 'ultimate', talentUnlock: true,
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 35 }, actionPoints: 1, cooldown: 4,
            damage: { base: 45, scaling: 1.5, stat: 'agility' },
            heal: null,
            effects: [
                { type: 'buff', name: 'ghostlyStrike', stat: 'dodgeChance', value: 0.3, duration: 3 },
                { type: 'comboGen', value: 1 }
            ],
            comboPoints: { generates: 1 },
            generatesResource: null,
            conditions: { requiresTalent: 'ghostlyStrike' }
        },
        preparation: {
            id: 'preparation', name: '预谋', emoji: '🎯',
            description: '重置消失、闪避、疾跑等技能的冷却时间',
            unlockLevel: 1, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 10,
            damage: null, heal: null,
            effects: [{ type: 'resetCooldowns', skills: ['vanish', 'evade', 'sprint', 'evasion'] }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'preparation' }
        },

        // ── 盗贼T5终极天赋技能 (Ultimate Talent Skills) ─────────────────
        mutilate: {
            id: 'mutilate', name: '毁伤', emoji: '💀',
            description: '同时使用两把武器攻击，造成武器伤害并产生2个连击点，若目标中毒则额外产生1个',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 55 }, actionPoints: 2, cooldown: 0,
            damage: { base: 60, scaling: 2.0, stat: 'agility' },
            heal: null,
            effects: [
                { type: 'dualWieldAttack', mainHand: 1.0, offHand: 1.0 },
                { type: 'comboOnPoisoned', value: 1 }
            ],
            comboPoints: { generates: 2 },
            generatesResource: null,
            conditions: { requiresTalent: 'mutilate' }
        },
        killingSpree: {
            id: 'killingSpree', name: '杀戮盛筵', emoji: '⚔️',
            description: '在战场上穿梭，对最多5个敌人各造成一次武器伤害，期间免疫控制',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee',
            resourceCost: null, actionPoints: 3, cooldown: 10,
            damage: { base: 50, scaling: 1.5, stat: 'agility' },
            heal: null,
            effects: [
                { type: 'multiHit', maxTargets: 5, hitPerTarget: 1 },
                { type: 'buff', name: 'killingSpree', stat: 'ccImmunity', value: 1.0, duration: 2 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'killingSpree' }
        },
        shadowDance: {
            id: 'shadowDance', name: '暗影之舞', emoji: '🌙',
            description: '进入暗影之舞状态，持续6秒期间所有潜行技能可不进入潜行直接使用',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 8,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'shadowDance', stat: 'stealthSkillAccess', value: 1.0, duration: 3 },
                { type: 'buff', name: 'shadowDanceDamage', stat: 'abilityDamage', value: 0.2, duration: 3 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'shadowDance' }
        },

        // ── 盗贼毒药技能 (Poison Skills) ─────────────────
        deadlyPoison: {
            id: 'deadlyPoison', name: '致命毒药', emoji: '☠️',
            description: '涂抹致命毒药，攻击有30%几率使目标中毒，持续6秒',
            unlockLevel: 20, category: 'utility',
            skillType: 'buff', damageType: 'nature', targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 0, cooldown: 0,
            damage: null, heal: null,
            effects: [{
                type: 'weaponEnchant', name: 'deadlyPoison',
                procChance: 0.3, procEffect: { type: 'dot', damageType: 'nature', tickDamage: 15, duration: 6, maxStacks: 5 }
            }],
            comboPoints: null, generatesResource: null,
            conditions: { outOfCombat: true }
        },
        woundPoison: {
            id: 'woundPoison', name: '致伤毒药', emoji: '💊',
            description: '涂抹致伤毒药，攻击有50%几率降低目标治疗效果25%',
            unlockLevel: 24, category: 'utility',
            skillType: 'buff', damageType: 'nature', targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 0, cooldown: 0,
            damage: null, heal: null,
            effects: [{
                type: 'weaponEnchant', name: 'woundPoison',
                procChance: 0.5, procEffect: { type: 'debuff', stat: 'healingReceived', value: -0.25, duration: 4 }
            }],
            comboPoints: null, generatesResource: null,
            conditions: { outOfCombat: true }
        },
        numbingPoison: {
            id: 'numbingPoison', name: '麻痹毒药', emoji: '🧊',
            description: '涂抹麻痹毒药，攻击有20%几率降低目标攻击和施法速度',
            unlockLevel: 28, category: 'utility',
            skillType: 'buff', damageType: 'nature', targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 0, cooldown: 0,
            damage: null, heal: null,
            effects: [{
                type: 'weaponEnchant', name: 'numbingPoison',
                procChance: 0.2, procEffect: { type: 'debuff', stat: 'attackSpeed', value: -0.15, duration: 4 }
            }],
            comboPoints: null, generatesResource: null,
            conditions: { outOfCombat: true }
        },

        // ═══════════════════════════════════════════
        // 法师技能 (Mage) — 资源: mana
        // ═══════════════════════════════════════════
        flamestrike: {
            id: 'flamestrike', name: '烈焰风暴', emoji: '🔥',
            description: '召唤烈焰风暴，对选中目标及其左右相邻单位造成火焰伤害',
            unlockLevel: 1, category: 'filler',
            skillType: 'spell', damageType: 'fire', targetType: 'cleave_3', range: 'ranged',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: { base: 14, scaling: 0.8, stat: 'intellect' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        fireball: {
            id: 'fireball', name: '火球术', emoji: '☄️',
            description: '发射一个火球，造成高额火焰伤害',
            unlockLevel: 1, category: 'core',
            skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 2, cooldown: 0,
            damage: { base: 30, scaling: 2.0, stat: 'intellect' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        frostbolt: {
            id: 'frostbolt', name: '寒冰箭', emoji: '❄️',
            description: '发射寒冰箭，造成冰霜伤害并减速2回合',
            unlockLevel: 4, category: 'core',
            skillType: 'spell', damageType: 'frost', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 22 }, actionPoints: 2, cooldown: 0,
            damage: { base: 25, scaling: 1.6, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'debuff', name: 'slow', value: 0.5, duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        arcaneIntellect: {
            id: 'arcaneIntellect', name: '奥术智慧', emoji: '📘',
            description: '提升智力10%，持续整场战斗',
            unlockLevel: 8, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'ranged',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'arcaneIntellect', stat: 'intellect', value: 0.1, duration: 99 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        frostNova: {
            id: 'frostNova', name: '冰霜新星', emoji: '💎',
            description: '冻结周围所有敌人1回合并造成冰霜伤害',
            unlockLevel: 14, category: 'utility',
            skillType: 'spell', damageType: 'frost', targetType: 'all_enemies', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 3,
            damage: { base: 15, scaling: 1.0, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'cc', ccType: 'root', duration: 1 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        pyroblast: {
            id: 'pyroblast', name: '炎爆术', emoji: '💥',
            description: '极高火焰伤害并附加燃烧DOT',
            unlockLevel: 20, category: 'powerful',
            skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 50 }, actionPoints: 3, cooldown: 4,
            damage: { base: 55, scaling: 3.0, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'dot', name: 'pyroblastBurn', damageType: 'fire', tickDamage: 15, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        blizzard: {
            id: 'blizzard', name: '暴风雪', emoji: '🌨️',
            description: '对所有敌人造成冰霜伤害并减速3回合',
            unlockLevel: 30, category: 'powerful',
            skillType: 'spell', damageType: 'frost', targetType: 'all_enemies', range: 'ranged',
            resourceCost: { type: 'mana', value: 55 }, actionPoints: 3, cooldown: 4,
            damage: { base: 25, scaling: 1.5, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'debuff', name: 'slow', value: 0.5, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // 法师核心技能
        arcaneMissiles: {
            id: 'arcaneMissiles', name: '奥术飞弹', emoji: '💜',
            description: '发射5枚奥术飞弹，每枚造成奥术伤害',
            unlockLevel: 6, category: 'core',
            skillType: 'spell', damageType: 'arcane', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 2, cooldown: 0,
            damage: { base: 8, scaling: 0.5, stat: 'intellect', hits: 5 },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        arcaneBlast: {
            id: 'arcaneBlast', name: '奥术冲击', emoji: '💫',
            description: '造成奥术伤害，每次使用叠加增伤效果，最高叠加4层',
            unlockLevel: 12, category: 'core',
            skillType: 'spell', damageType: 'arcane', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 28 }, actionPoints: 2, cooldown: 0,
            damage: { base: 35, scaling: 2.2, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'stacking_buff', name: 'arcaneBlastStack', stat: 'damage', value: 0.15, maxStacks: 4 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        blink: {
            id: 'blink', name: '闪烁', emoji: '⚡',
            description: '瞬移并解除所有控制效果',
            unlockLevel: 20, category: 'utility',
            skillType: 'utility', damageType: 'arcane', targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 4,
            damage: null, heal: null,
            effects: [{ type: 'dispel', dispelType: 'cc' }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        conjureMana: {
            id: 'conjureMana', name: '制造法力宝石', emoji: '💎',
            description: '创造一个法力宝石，使用后恢复30%法力值',
            unlockLevel: 25, category: 'utility',
            skillType: 'summon', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 10 }, actionPoints: 1, cooldown: 10,
            damage: null, heal: null,
            effects: [{ type: 'create_item', item: 'manaGem', charges: 1, effect: 'restoreMana', value: 0.3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // 法师天赋解锁技能 - 奥术系
        arcanePower: {
            id: 'arcanePower', name: '奥术强化', emoji: '✨',
            description: '激活后，法术伤害提高30%，法力消耗提高30%，持续5回合',
            unlockLevel: 40, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 40 }, actionPoints: 1, cooldown: 8,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'arcanePower', stat: 'spellDamage', value: 0.3, duration: 5 },
                { type: 'buff', name: 'arcanePowerCost', stat: 'manaCost', value: 0.3, duration: 5 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'arcanePower' }
        },
        presenceOfMind: {
            id: 'presenceOfMind', name: '瞬发思维', emoji: '🧠',
            description: '下一个法术变为瞬发（不消耗额外行动点）',
            unlockLevel: 30, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 6,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'presenceOfMind', stat: 'instantCast', value: 1, duration: 2 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'presenceOfMind' }
        },
        slow: {
            id: 'slow', name: '减速', emoji: '🐌',
            description: '降低目标攻击速度、施法速度和移动速度50%，持续5回合',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'spell', damageType: 'arcane', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [
                { type: 'debuff', name: 'slowAttack', stat: 'attackSpeed', value: 0.5, duration: 5 },
                { type: 'debuff', name: 'slowCast', stat: 'castSpeed', value: 0.5, duration: 5 },
                { type: 'debuff', name: 'slowMove', stat: 'moveSpeed', value: 0.5, duration: 5 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'slow' }
        },

        // 法师天赋解锁技能 - 火焰系
        combustion: {
            id: 'combustion', name: '燃烧', emoji: '🔥',
            description: '激活后获得100%暴击率，持续3回合',
            unlockLevel: 40, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: 'fire', targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 45 }, actionPoints: 1, cooldown: 8,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'combustion', stat: 'critChance', value: 1.0, duration: 3 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'combustion' }
        },
        dragonBreath: {
            id: 'dragonBreath', name: '龙息术', emoji: '🐉',
            description: '锥形火焰喷射，对前排敌人造成火焰伤害并迷惑2回合',
            unlockLevel: 35, category: 'ultimate', talentUnlock: true,
            skillType: 'spell', damageType: 'fire', targetType: 'front_row', range: 'melee',
            resourceCost: { type: 'mana', value: 40 }, actionPoints: 2, cooldown: 4,
            damage: { base: 40, scaling: 2.5, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'cc', ccType: 'disorient', duration: 2 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'dragonBreath' }
        },
        livingBomb: {
            id: 'livingBomb', name: '活动炸弹', emoji: '💣',
            description: '将目标变为活体炸弹，4回合后爆炸对目标和周围敌人造成火焰伤害',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 55 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [
                { type: 'dot', name: 'livingBombTick', damageType: 'fire', tickDamage: 20, duration: 4 },
                { type: 'delayed_aoe', name: 'livingBombExplosion', damageType: 'fire', damage: 80, radius: 'cleave_3', delay: 4 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'livingBomb' }
        },

        // 法师天赋解锁技能 - 冰霜系
        iceBlock: {
            id: 'iceBlock', name: '寒冰屏障', emoji: '🧊',
            description: '进入冰块状态，免疫所有伤害但无法行动，持续3回合',
            unlockLevel: 30, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: 'frost', targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 1, cooldown: 8,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'iceBlock', stat: 'immune', value: 1, duration: 3 },
                { type: 'cc', ccType: 'selfStun', duration: 3 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'iceBlock' }
        },
        iceBarrier: {
            id: 'iceBarrier', name: '寒冰护盾', emoji: '🛡️',
            description: '创建冰盾吸收伤害，护盾破碎时对周围敌人造成冰霜伤害',
            unlockLevel: 40, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: 'frost', targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 45 }, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [
                { type: 'shield', name: 'iceBarrier', value: 200, scaling: 2.0, stat: 'intellect' }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'iceBarrier' }
        },
        coldSnap: {
            id: 'coldSnap', name: '急速冷却', emoji: '❄️',
            description: '立即重置所有冰霜系技能的冷却时间',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'utility', damageType: 'frost', targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 10,
            damage: null, heal: null,
            effects: [{ type: 'reset_cooldown', school: 'frost' }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'coldSnap' }
        },

        // ═══════════════════════════════════════════
        // 牧师技能 (Priest) — 资源: mana
        // ═══════════════════════════════════════════
        smite: {
            id: 'smite', name: '惩击', emoji: '✝️',
            description: '神圣伤害攻击',
            unlockLevel: 1, category: 'filler',
            skillType: 'spell', damageType: 'holy', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: { base: 20, scaling: 1.2, stat: 'intellect' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        heal: {
            id: 'heal', name: '治疗术', emoji: '💚',
            description: '恢复目标生命值',
            unlockLevel: 1, category: 'core',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 2, cooldown: 0,
            damage: null,
            heal: { base: 30, scaling: 1.5, stat: 'intellect' },
            effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        renew: {
            id: 'renew', name: '恢复', emoji: '💗',
            description: '为目标施加持续治疗效果4回合',
            unlockLevel: 4, category: 'utility',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'hot', name: 'renew', tickHeal: 15, duration: 4 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        shield: {
            id: 'shield', name: '真言术：盾', emoji: '🔰',
            description: '为目标施加吸收50伤害的护盾',
            unlockLevel: 8, category: 'core',
            skillType: 'buff', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 2, cooldown: 3,
            damage: null, heal: null,
            effects: [{ type: 'shield', name: 'powerWordShield', absorbAmount: 50, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        dispelMagic: {
            id: 'dispelMagic', name: '驱散魔法', emoji: '✨',
            description: '移除目标1个负面效果',
            unlockLevel: 14, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 18 }, actionPoints: 1, cooldown: 2,
            damage: null, heal: null,
            effects: [{ type: 'dispel', count: 1 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        shadowWordPain: {
            id: 'shadowWordPain', name: '暗言术：痛', emoji: '😈',
            description: '对目标施加暗影持续伤害5回合',
            unlockLevel: 20, category: 'utility',
            skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 18 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'dot', name: 'shadowWordPain', damageType: 'shadow', tickDamage: 12, duration: 5 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        greaterHeal: {
            id: 'greaterHeal', name: '强效治疗', emoji: '💖',
            description: '高额单体治疗',
            unlockLevel: 30, category: 'powerful',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 50 }, actionPoints: 3, cooldown: 3,
            damage: null,
            heal: { base: 80, scaling: 3.0, stat: 'intellect' },
            effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        prayerOfHealing: {
            id: 'prayerOfHealing', name: '治疗祷言', emoji: '🙏',
            description: '治疗全体队友',
            unlockLevel: 40, category: 'ultimate',
            skillType: 'heal', damageType: null, targetType: 'all_allies', range: 'ranged',
            resourceCost: { type: 'mana', value: 60 }, actionPoints: 3, cooldown: 5,
            damage: null,
            heal: { base: 40, scaling: 1.5, stat: 'intellect' },
            effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ── 天赋解锁技能: 戒律树 (3个) ──
        // 心灵专注 — 戒律树T2解锁
        innerFocus: {
            id: 'innerFocus', name: '心灵专注', emoji: '🧘',
            description: '使下一个法术的法力消耗降低100%，暴击几率提高25%',
            unlockLevel: null, category: 'utility', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 0 }, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'innerFocus', stat: 'manaCost', value: -1.0, duration: 1 },
                { type: 'buff', name: 'innerFocusCrit', stat: 'spellCrit', value: 0.25, duration: 1 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'innerFocus' }
        },
        // 能量灌注 — 戒律树T4解锁
        powerInfusion: {
            id: 'powerInfusion', name: '能量灌注', emoji: '⚡',
            description: '为目标灌注能量，使其法术伤害和治疗效果提高20%，持续3回合',
            unlockLevel: null, category: 'core', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'powerInfusion', stat: 'spellPower', value: 0.2, duration: 3 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'powerInfusion' }
        },
        // 痛苦压制 — 戒律树T5终极天赋解锁
        painSuppression: {
            id: 'painSuppression', name: '痛苦压制', emoji: '🛡️',
            description: '压制目标的痛苦，使其受到的伤害降低40%，持续3回合',
            unlockLevel: null, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 6,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'painSuppression', stat: 'damageReduction', value: 0.4, duration: 3 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'painSuppression' }
        },

        // ── 天赋解锁技能: 神圣树 (3个) ──
        // 神圣之灵 — 神圣树T2解锁
        divineSpirit: {
            id: 'divineSpirit', name: '神圣之灵', emoji: '✨',
            description: '为目标施加神圣之灵，使其精神提高20，持续5回合',
            unlockLevel: null, category: 'utility', talentUnlock: true,
            skillType: 'buff', damageType: 'holy', targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'divineSpirit', stat: 'spirit', value: 20, duration: 5 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'divineSpirit' }
        },
        // 光明之泉 — 神圣树T4解锁
        lightwell: {
            id: 'lightwell', name: '光明之泉', emoji: '⛲',
            description: '召唤光明之泉，队友可与之互动获得治疗，共5次充能',
            unlockLevel: null, category: 'core', talentUnlock: true,
            skillType: 'summon', damageType: null, targetType: 'self', range: 'ranged',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'summon', name: 'lightwell', summonType: 'totem', charges: 5, healAmount: 50 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'lightwell' }
        },
        // 守护之魂 — 神圣树T5终极天赋解锁
        guardianSpirit: {
            id: 'guardianSpirit', name: '守护之魂', emoji: '👼',
            description: '召唤守护之魂保护目标，如果目标死亡则立即恢复40%生命值，持续3回合',
            unlockLevel: null, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: 'holy', targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 40 }, actionPoints: 2, cooldown: 6,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'guardianSpirit', stat: 'deathPrevention', value: 0.4, duration: 3 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'guardianSpirit' }
        },

        // ── 天赋解锁技能: 暗影树 (3个) ──
        // 吸血鬼之拥 — 暗影树T3解锁
        vampiricEmbrace: {
            id: 'vampiricEmbrace', name: '吸血鬼之拥', emoji: '🧛',
            description: '进入吸血鬼之拥状态，对敌人造成的暗影伤害会为队友治疗15%的伤害量，持续5回合',
            unlockLevel: null, category: 'core', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 3,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'vampiricEmbrace', stat: 'vampiricHeal', value: 0.15, duration: 5 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'vampiricEmbrace' }
        },
        // 暗影形态 — 暗影树T4解锁
        shadowform: {
            id: 'shadowform', name: '暗影形态', emoji: '🌑',
            description: '进入暗影形态，暗影伤害提高15%，无法使用神圣法术',
            unlockLevel: null, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 60 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'shadowform', stat: 'shadowDamage', value: 0.15, duration: 99 },
                { type: 'restriction', restrictSkills: ['smite', 'holyFire', 'heal', 'greaterHeal', 'prayerOfHealing'] }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'shadowform' }
        },
        // 消散 — 暗影树T5终极天赋解锁
        dispersion: {
            id: 'dispersion', name: '消散', emoji: '🌀',
            description: '化为暗影能量，受到的伤害降低90%，每回合恢复6%法力，持续2回合',
            unlockLevel: null, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 0 }, actionPoints: 2, cooldown: 8,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'dispersion', stat: 'damageReduction', value: 0.9, duration: 2 },
                { type: 'hot', name: 'dispersionMana', tickManaPercent: 0.06, duration: 2 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'dispersion' }
        },

        // ── 其他核心技能 (3个) ──
        // 神圣之火
        holyFire: {
            id: 'holyFire', name: '神圣之火', emoji: '🔥',
            description: '对目标造成神圣伤害并附加持续燃烧效果3回合',
            unlockLevel: 20, category: 'core',
            skillType: 'spell', damageType: 'holy', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 2, cooldown: 2,
            damage: { base: 35, scaling: 1.5, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'dot', name: 'holyFire', damageType: 'holy', tickDamage: 10, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // 愈合祷言
        prayerOfMending: {
            id: 'prayerOfMending', name: '愈合祷言', emoji: '💫',
            description: '为目标施加愈合祷言，受伤后治疗并跳跃到下一个队友，最多跳跃3次',
            unlockLevel: 30, category: 'core',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 4,
            damage: null,
            heal: { base: 45, scaling: 1.2, stat: 'intellect' },
            effects: [{ type: 'hot', name: 'prayerOfMending', tickHeal: 0, duration: 1, jumpCount: 3, jumpDecay: 0.2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // 群体驱散
        massDispel: {
            id: 'massDispel', name: '群体驱散', emoji: '✨',
            description: '移除所有队友的1个负面效果，有几率驱散敌人的增益效果',
            unlockLevel: 50, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'all_allies', range: 'ranged',
            resourceCost: { type: 'mana', value: 50 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'dispel', count: 1, targetType: 'all_allies' }],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ═══════════════════════════════════════════
        // 猎人技能 (Hunter) — 资源: mana
        // 基础技能 4个 + 天赋解锁技能 8个 = 12个
        // ═══════════════════════════════════════════

        // ── 基础技能 (4个) ──
        arcaneShot: {
            id: 'arcaneShot', name: '奥术射击', emoji: '🏹',
            description: '即时远程奥术伤害',
            unlockLevel: 1, category: 'filler',
            skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 12 }, actionPoints: 1, cooldown: 0,
            damage: { base: 18, scaling: 1.0, stat: 'agility' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        serpentSting: {
            id: 'serpentSting', name: '毒蛇钉刺', emoji: '🐍',
            description: '射出毒箭，附加自然DOT 4回合',
            unlockLevel: 4, category: 'utility',
            skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: { base: 8, scaling: 0.5, stat: 'agility' },
            heal: null,
            effects: [{ type: 'dot', name: 'serpentSting', damageType: 'nature', tickDamage: 10, duration: 4 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        huntersMark: {
            id: 'huntersMark', name: '猎人印记', emoji: '🎯',
            description: '标记目标，使其受到的远程伤害提高20%，持续5回合',
            unlockLevel: 6, category: 'utility',
            skillType: 'debuff', damageType: null, targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'debuff', name: 'huntersMark', stat: 'rangedDamageTaken', value: 0.2, duration: 5 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        summonPet: {
            id: 'summonPet', name: '召唤野兽', emoji: '🐺',
            description: '召唤一只狼作为战斗伙伴。野兽控制天赋强化后可选择召唤：熊(战士型)、猪(盗贼型)、鹰(法师型)',
            unlockLevel: 1, category: 'utility',
            skillType: 'summon', damageType: null, targetType: 'self', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 2, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'summon', name: 'summonPet', summonType: 'pet' }],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ── 天赋解锁技能: 野兽控制树 (2个) ──
        killCommand: {
            id: 'killCommand', name: '杀戮命令', emoji: '🐾',
            description: '命令宠物发动凶猛一击，造成高额物理伤害',
            unlockLevel: null, category: 'core',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 3,
            damage: { base: 40, scaling: 1.6, stat: 'agility' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'killCommandTalent' }
        },
        intimidation: {
            id: 'intimidation', name: '恐吓', emoji: '😱',
            description: '命令宠物恐吓目标，眩晕2回合',
            unlockLevel: null, category: 'utility',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 5,
            damage: { base: 10, scaling: 0.4, stat: 'agility' },
            heal: null,
            effects: [{ type: 'cc', ccType: 'stun', duration: 2, name: 'intimidation' }],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'intimidationTalent' }
        },

        // ── 天赋解锁技能: 射击树 (3个) ──
        aimedShot: {
            id: 'aimedShot', name: '瞄准射击', emoji: '🎯',
            description: '精准射击，高物理远程伤害',
            unlockLevel: null, category: 'core',
            skillType: 'ranged', damageType: 'physical', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 2, cooldown: 2,
            damage: { base: 35, scaling: 1.8, stat: 'agility' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'aimedShotTalent' }
        },
        multiShot: {
            id: 'multiShot', name: '多重射击', emoji: '🎆',
            description: '射击最多3个随机目标',
            unlockLevel: null, category: 'core',
            skillType: 'ranged', damageType: 'physical', targetType: 'random_3', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 2, cooldown: 2,
            damage: { base: 20, scaling: 1.0, stat: 'agility' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'multiShotTalent' }
        },
        trueshotAura: {
            id: 'trueshotAura', name: '强击光环', emoji: '🏹',
            description: '全队远程攻击力提高15%，持续整场战斗',
            unlockLevel: null, category: 'powerful',
            skillType: 'buff', damageType: null, targetType: 'all_allies', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'trueshotAura', stat: 'rangedAttack', value: 0.15, duration: 99 }],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ── 天赋解锁技能: 生存树 (3个) ──
        explosiveTrap: {
            id: 'explosiveTrap', name: '爆炸陷阱', emoji: '💥',
            description: '放置爆炸陷阱，对所有敌人造成火焰伤害',
            unlockLevel: null, category: 'core',
            skillType: 'ranged', damageType: 'fire', targetType: 'all_enemies', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 3,
            damage: { base: 22, scaling: 0.8, stat: 'agility' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'explosiveTrapTalent' }
        },
        wyvernSting: {
            id: 'wyvernSting', name: '翼龙钉刺', emoji: '🐉',
            description: '射出翼龙毒刺，使目标昏睡3回合，受伤唤醒',
            unlockLevel: null, category: 'utility',
            skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'cc', ccType: 'sleep', duration: 3, name: 'wyvernSting', breakOnDamage: true }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        mongooseBite: {
            id: 'mongooseBite', name: '猫鼬撕咬', emoji: '🦡',
            description: '近战反击，对攻击者造成高额物理伤害并闪避下次攻击',
            unlockLevel: null, category: 'powerful',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 2, cooldown: 4,
            damage: { base: 45, scaling: 2.0, stat: 'agility' },
            heal: null,
            effects: [{ type: 'buff', name: 'mongooseEvasion', stat: 'dodgeChance', value: 1.0, duration: 1 }],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'mongooseBiteTalent' }
        },

        // ═══════════════════════════════════════════
        // 圣骑士技能 (Paladin) — 资源: mana
        // 基础技能 4个 + 天赋解锁技能 9个 = 13个
        // ═══════════════════════════════════════════

        // ── 基础技能 (4个) ──
        crusaderStrike: {
            id: 'crusaderStrike', name: '十字军打击', emoji: '✝️',
            description: '近战神圣伤害',
            unlockLevel: 1, category: 'filler',
            skillType: 'melee', damageType: 'holy', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'mana', value: 12 }, actionPoints: 1, cooldown: 0,
            damage: { base: 18, scaling: 1.2, stat: 'strength' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        sealOfJustice: {
            id: 'sealOfJustice', name: '正义圣印', emoji: '⚖️',
            description: '激活正义圣印，持续3回合，攻击附加8点圣光伤害',
            unlockLevel: 1, category: 'core',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'seal', sealType: 'justice', name: 'sealOfJustice', duration: 3, onHit: { damageType: 'holy', flatDamage: 8 } }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        judgement: {
            id: 'judgement', name: '审判', emoji: '⚡',
            description: '释放圣印之力，消耗当前圣印造成高额圣光伤害并触发圣印特殊效果',
            unlockLevel: 1, category: 'core',
            skillType: 'melee', damageType: 'holy', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 3,
            damage: { base: 35, scaling: 1.5, stat: 'strength' },
            heal: null,
            effects: [{ type: 'consume_seal' }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        holyLight: {
            id: 'holyLight', name: '圣光术', emoji: '🌟',
            description: '神圣之光治疗目标',
            unlockLevel: 4, category: 'core',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 0,
            damage: null,
            heal: { base: 45, scaling: 1.8, stat: 'intellect' },
            effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ── 天赋解锁技能: 神圣树 (3个) ──
        sealOfLight: {
            id: 'sealOfLight', name: '光明圣印', emoji: '🌅',
            description: '激活光明圣印，持续3回合，攻击吸血15%',
            unlockLevel: null, category: 'core',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'seal', sealType: 'light', name: 'sealOfLight', duration: 3, onHit: { lifesteal: 0.15 } }],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'sealOfLightTalent' }
        },
        blessingOfProtection: {
            id: 'blessingOfProtection', name: '保护祝福', emoji: '🛡️',
            description: '为目标施加减伤30%持续3回合',
            unlockLevel: null, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'blessingOfProtection', stat: 'damageReduction', value: 0.3, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        layOnHands: {
            id: 'layOnHands', name: '圣疗术', emoji: '🤲',
            description: '瞬间回满目标生命值',
            unlockLevel: null, category: 'ultimate',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 60 }, actionPoints: 3, cooldown: 10,
            damage: null,
            heal: { base: 9999, scaling: 0, stat: 'intellect' },
            effects: [],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'layOnHandsTalent' }
        },

        // ── 天赋解锁技能: 防护树 (3个) ──
        hammerOfJustice: {
            id: 'hammerOfJustice', name: '制裁之锤', emoji: '🔨',
            description: '投掷神圣之锤，造成伤害并眩晕2回合',
            unlockLevel: null, category: 'core',
            skillType: 'melee', damageType: 'holy', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 2, cooldown: 4,
            damage: { base: 25, scaling: 1.0, stat: 'strength' },
            heal: null,
            effects: [{ type: 'cc', ccType: 'stun', duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        consecration: {
            id: 'consecration', name: '奉献', emoji: '☀️',
            description: '在脚下创造神圣区域，对所有敌人造成DOT',
            unlockLevel: null, category: 'core',
            skillType: 'spell', damageType: 'holy', targetType: 'all_enemies', range: 'melee',
            resourceCost: { type: 'mana', value: 40 }, actionPoints: 2, cooldown: 3,
            damage: null, heal: null,
            effects: [{ type: 'dot', name: 'consecration', damageType: 'holy', tickDamage: 15, duration: 4 }],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'consecrationTalent' }
        },
        holyWrath: {
            id: 'holyWrath', name: '神圣愤怒', emoji: '💢',
            description: '神圣光芒爆发，嘲讽所有敌人3回合并获得反伤护盾',
            unlockLevel: null, category: 'ultimate',
            skillType: 'spell', damageType: 'holy', targetType: 'all_enemies', range: 'melee',
            resourceCost: { type: 'mana', value: 50 }, actionPoints: 3, cooldown: 8,
            damage: { base: 20, scaling: 0.8, stat: 'strength' },
            heal: null,
            effects: [
                { type: 'cc', ccType: 'taunt', duration: 3 },
                { type: 'self_buff', name: 'thorns', stat: 'thorns', value: 0.3, duration: 3 }
            ],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ── 天赋解锁技能: 惩戒树 (3个) ──
        sealOfCommand: {
            id: 'sealOfCommand', name: '命令圣印', emoji: '🗡️',
            description: '激活命令圣印，持续3回合，攻击30%几率造成额外70%圣光伤害',
            unlockLevel: null, category: 'core',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'seal', sealType: 'command', name: 'sealOfCommand', duration: 3, onHit: { procChance: 0.3, bonusDamagePercent: 0.7, damageType: 'holy' } }],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'sealOfCommandTalent' }
        },
        crusaderAura: {
            id: 'crusaderAura', name: '十字军光环', emoji: '⚔️',
            description: '圣光激励全队，攻击力提升10%持续3回合',
            unlockLevel: null, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'all_allies', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', stat: 'strength', value: 0.10, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        hammerOfWrath: {
            id: 'hammerOfWrath', name: '惩戒之锤', emoji: '🔱',
            description: '远程投掷圣光之锤，目标生命值低于30%时伤害翻倍',
            unlockLevel: null, category: 'ultimate',
            skillType: 'spell', damageType: 'holy', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 40 }, actionPoints: 2, cooldown: 6,
            damage: { base: 55, scaling: 2.0, stat: 'strength' },
            heal: null,
            effects: [{ type: 'execute', threshold: 0.3, damageMultiplier: 2.0 }],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'hammerOfWrathTalent' }
        },

        // ── 天赋解锁技能: 神圣树T4 ──
        holyShock: {
            id: 'holyShock', name: '神圣震击', emoji: '✨',
            description: '瞬发圣光攻击敌人或治疗友方',
            unlockLevel: null, category: 'core',
            skillType: 'melee', damageType: 'holy', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 28 }, actionPoints: 1, cooldown: 4,
            damage: { base: 30, scaling: 1.3, stat: 'intellect' },
            heal: { base: 35, scaling: 1.5, stat: 'intellect' },
            effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ── 天赋解锁技能: 防护树T4 ──
        divineShield: {
            id: 'divineShield', name: '神圣之盾', emoji: '🌈',
            description: '使自己免疫所有伤害2回合',
            unlockLevel: null, category: 'ultimate',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 50 }, actionPoints: 3, cooldown: 8,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'invulnerable', stat: 'damageReduction', value: 1.0, duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: { requiresTalent: 'divineShieldTalent' }
        },

        // ═══════════════════════════════════════════
        // 萨满技能 (Shaman) — 资源: mana
        // ═══════════════════════════════════════════
        lightningBolt: {
            id: 'lightningBolt', name: '闪电箭', emoji: '⚡',
            description: '召唤闪电攻击敌人',
            unlockLevel: 1, category: 'filler',
            skillType: 'spell', damageType: 'nature', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: { base: 22, scaling: 1.4, stat: 'intellect' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        flameShock: {
            id: 'flameShock', name: '烈焰震击', emoji: '🔥',
            description: '造成火焰伤害并附加燃烧DOT 4回合',
            unlockLevel: 1, category: 'core',
            skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 2,
            damage: { base: 15, scaling: 0.8, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'dot', name: 'flameShock', damageType: 'fire', tickDamage: 10, duration: 4 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        healingWave: {
            id: 'healingWave', name: '治疗波', emoji: '💧',
            description: '恢复目标生命值',
            unlockLevel: 4, category: 'core',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 2, cooldown: 0,
            damage: null,
            heal: { base: 35, scaling: 1.5, stat: 'intellect' },
            effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        earthShock: {
            id: 'earthShock', name: '大地震击', emoji: '🌍',
            description: '自然伤害并打断敌人施法',
            unlockLevel: 8, category: 'core',
            skillType: 'spell', damageType: 'nature', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 2,
            damage: { base: 20, scaling: 1.2, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'debuff', name: 'interrupt', duration: 1 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        searingTotem: {
            id: 'searingTotem', name: '灼热图腾', emoji: '🪔',
            description: '放置图腾，每回合对敌人造成火焰伤害',
            unlockLevel: 14, category: 'utility',
            skillType: 'summon', damageType: 'fire', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 3,
            damage: null, heal: null,
            effects: [{ type: 'summon', summonId: 'searingTotem', duration: 5 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        chainLightning: {
            id: 'chainLightning', name: '闪电链', emoji: '⛓️',
            description: '链式闪电攻击前排3个敌人',
            unlockLevel: 20, category: 'powerful',
            skillType: 'spell', damageType: 'nature', targetType: 'front_3', range: 'ranged',
            resourceCost: { type: 'mana', value: 45 }, actionPoints: 3, cooldown: 4,
            damage: { base: 30, scaling: 1.8, stat: 'intellect' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        chainHeal: {
            id: 'chainHeal', name: '治疗链', emoji: '💞',
            description: '链式治疗全体队友',
            unlockLevel: 30, category: 'powerful',
            skillType: 'heal', damageType: null, targetType: 'all_allies', range: 'ranged',
            resourceCost: { type: 'mana', value: 50 }, actionPoints: 3, cooldown: 4,
            damage: null,
            heal: { base: 30, scaling: 1.2, stat: 'intellect' },
            effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // ── 萨满基础补充技能 ───────────────────────
        frostShock: {
            id: 'frostShock', name: '冰霜震击', emoji: '❄️',
            description: '造成冰霜伤害并降低目标移动速度',
            unlockLevel: 20, category: 'core',
            skillType: 'spell', damageType: 'frost', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 3,
            damage: { base: 18, scaling: 1.0, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'debuff', name: 'frostShock', stat: 'speed', value: -0.5, duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        purge: {
            id: 'purge', name: '净化', emoji: '✨',
            description: '驱散目标身上的1个增益效果',
            unlockLevel: 12, category: 'utility',
            skillType: 'spell', damageType: 'nature', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 4,
            damage: null, heal: null,
            effects: [{ type: 'dispel', targetType: 'buff', count: 1 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        heroism: {
            id: 'heroism', name: '英雄主义', emoji: '🦸',
            description: '提升全体队友攻击和施法速度40%',
            unlockLevel: 35, category: 'powerful',
            skillType: 'buff', damageType: null, targetType: 'all_allies', range: 'ranged',
            resourceCost: { type: 'mana', value: 60 }, actionPoints: 3, cooldown: 20,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'heroism', stat: 'haste', value: 0.4, duration: 5 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        // ── 萨满天赋解锁技能 ───────────────────────
        // 元素系 (Elemental)
        elementalMastery: {
            id: 'elementalMastery', name: '元素掌握', emoji: '🌀',
            description: '激活后，下一个法术必定暴击',
            unlockLevel: 40, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'self',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 10,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'elementalMastery', effect: 'guaranteedCrit', duration: 1 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'elementalMastery' }
        },
        lavaBurst: {
            id: 'lavaBurst', name: '熔岩爆裂', emoji: '🌋',
            description: '对目标造成火焰伤害，若目标有烈焰震击则必定暴击',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 4,
            damage: { base: 45, scaling: 2.2, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'conditionalCrit', condition: 'flameShock' }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'lavaBurst' }
        },
        thunderstorm: {
            id: 'thunderstorm', name: '雷暴', emoji: '⛈️',
            description: '对所有敌人造成自然伤害并击退，恢复自身法力',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'spell', damageType: 'nature', targetType: 'all_enemies', range: 'ranged',
            resourceCost: { type: 'mana', value: 0 }, actionPoints: 3, cooldown: 12,
            damage: { base: 30, scaling: 1.5, stat: 'intellect' },
            heal: null,
            effects: [
                { type: 'knockback', duration: 1 },
                { type: 'restoreResource', resource: 'mana', value: 20, scaling: 0.1, stat: 'intellect' }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'thunderstorm' }
        },
        // 增强系 (Enhancement)
        stormstrike: {
            id: 'stormstrike', name: '风暴打击', emoji: '⚡',
            description: '双武器攻击，造成武器伤害并使目标受到的自然伤害提高20%',
            unlockLevel: 40, category: 'ultimate', talentUnlock: true,
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 2, cooldown: 6,
            damage: { base: 60, scaling: 2.0, stat: 'agility' },
            heal: null,
            effects: [
                { type: 'dualWieldAttack', mainHand: 1.0, offHand: 1.0 },
                { type: 'debuff', name: 'stormstrike', stat: 'natureDamageTaken', value: 0.2, duration: 2 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'stormstrike' }
        },
        shamanisticRage: {
            id: 'shamanisticRage', name: '萨满之怒', emoji: '😤',
            description: '降低受到的伤害30%，每回合恢复法力',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'self',
            resourceCost: { type: 'mana', value: 0 }, actionPoints: 1, cooldown: 8,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'shamanisticRage', effect: 'damageReduction', value: 0.3, duration: 4 },
                { type: 'buff', name: 'shamanisticRage', effect: 'manaRegen', value: 15, duration: 4 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'shamanisticRage' }
        },
        feralSpirit: {
            id: 'feralSpirit', name: '野性之魂', emoji: '🐺',
            description: '召唤两只幽灵狼协助战斗',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'summon', damageType: 'nature', targetType: 'self', range: 'self',
            resourceCost: { type: 'mana', value: 40 }, actionPoints: 3, cooldown: 15,
            damage: null, heal: null,
            effects: [{ type: 'summon', entity: 'spiritWolf', count: 2, duration: 6 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'feralSpirit' }
        },
        // 恢复系 (Restoration)
        naturesSwiftnessShaman: {
            id: 'naturesSwiftnessShaman', name: '自然迅捷', emoji: '🌿',
            description: '激活后，下一个治疗法术变为瞬发',
            unlockLevel: 30, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'self',
            resourceCost: { type: 'mana', value: 10 }, actionPoints: 0, cooldown: 8,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'naturesSwiftness', effect: 'instantCast', school: 'heal', duration: 1 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'naturesSwiftness' }
        },
        manaTideTotem: {
            id: 'manaTideTotem', name: '法力之潮图腾', emoji: '💧',
            description: '放置图腾，每回合为全体队友恢复法力',
            unlockLevel: 40, category: 'ultimate', talentUnlock: true,
            skillType: 'summon', damageType: null, targetType: 'all_allies', range: 'ranged',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 2, cooldown: 10,
            damage: null, heal: null,
            effects: [{ type: 'totem', name: 'manaTide', effect: 'manaRegen', value: 20, duration: 4 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'manaTideTotem' }
        },
        earthShield: {
            id: 'earthShield', name: '大地之盾', emoji: '🛡️',
            description: '为目标附加护盾，受击时有几率触发治疗',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 6,
            damage: null, heal: null,
            effects: [{ type: 'shield', name: 'earthShield', charges: 6, healOnHit: { base: 20, scaling: 1.0, stat: 'intellect' }, duration: 10 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'earthShield' }
        },
        riptide: {
            id: 'riptide', name: '激流', emoji: '🌊',
            description: '立即治疗目标并附加持续治疗效果，增强后续治疗链效果',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 40 }, actionPoints: 2, cooldown: 5,
            damage: null,
            heal: { base: 30, scaling: 1.2, stat: 'intellect' },
            effects: [
                { type: 'hot', name: 'riptide', tickHeal: 15, duration: 4 },
                { type: 'buff', name: 'riptide', effect: 'chainHealBonus', value: 0.25, duration: 4 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'riptide' }
        },

        // ═══════════════════════════════════════════
        // 术士技能 (Warlock) — 资源: mana
        // ═══════════════════════════════════════════
        shadowBolt: {
            id: 'shadowBolt', name: '暗影箭', emoji: '🌑',
            description: '发射暗影能量攻击敌人',
            unlockLevel: 1, category: 'filler',
            skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: { base: 22, scaling: 1.4, stat: 'intellect' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        corruption: {
            id: 'corruption', name: '腐蚀术', emoji: '☠️',
            description: '腐蚀敌人，造成暗影DOT 6回合',
            unlockLevel: 1, category: 'core',
            skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 18 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'dot', name: 'corruption', damageType: 'shadow', tickDamage: 10, duration: 6 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        immolate: {
            id: 'immolate', name: '献祭', emoji: '🔥',
            description: '点燃敌人，造成火焰伤害并附加DOT 5回合',
            unlockLevel: 4, category: 'core',
            skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 0,
            damage: { base: 12, scaling: 0.6, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'dot', name: 'immolate', damageType: 'fire', tickDamage: 12, duration: 5 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        fear: {
            id: 'fear', name: '恐惧', emoji: '😱',
            description: '使敌人陷入恐惧，无法行动2回合',
            unlockLevel: 8, category: 'utility',
            skillType: 'debuff', damageType: null, targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'cc', ccType: 'fear', duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        drainLife: {
            id: 'drainLife', name: '吸取生命', emoji: '🩸',
            description: '造成暗影伤害并回复自身50%伤害值的生命',
            unlockLevel: 14, category: 'core',
            skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 2, cooldown: 2,
            damage: { base: 25, scaling: 1.5, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'lifesteal', value: 0.5 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        curseOfAgony: {
            id: 'curseOfAgony', name: '痛苦诅咒', emoji: '💜',
            description: '诅咒敌人，造成递增暗影DOT 5回合',
            unlockLevel: 20, category: 'utility',
            skillType: 'debuff', damageType: 'shadow', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'dot', name: 'curseOfAgony', damageType: 'shadow', tickDamage: 8, duration: 5, scaling: true }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        summonDemon: {
            id: 'summonDemon', name: '召唤恶魔', emoji: '👿',
            description: '召唤一只恶魔协助战斗，按等级解锁不同恶魔类型',
            unlockLevel: 1, category: 'utility',
            skillType: 'summon', damageType: null, targetType: 'self', range: 'ranged',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 2, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'summon', name: 'summonDemon', summonType: 'demon' }],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ─────────────────────────────────────────────
        // 术士新增技能 - 诅咒系
        // ─────────────────────────────────────────────
        curseOfWeakness: {
            id: 'curseOfWeakness', name: '虚弱诅咒', emoji: '💔',
            description: '诅咒目标，使其攻击力降低15%持续5回合',
            unlockLevel: 10, category: 'utility',
            skillType: 'debuff', damageType: null, targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'debuff', name: 'curseOfWeakness', stat: 'attackPower', value: -0.15, duration: 5 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        curseOfElements: {
            id: 'curseOfElements', name: '元素诅咒', emoji: '🌀',
            description: '诅咒目标，使其受到的火焰和冰霜伤害提高10%持续5回合',
            unlockLevel: 16, category: 'utility',
            skillType: 'debuff', damageType: null, targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 15 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'debuff', name: 'curseOfElements', damageTypes: ['fire', 'frost'], value: 0.10, duration: 5 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        amplifyCurse: {
            id: 'amplifyCurse', name: '放大诅咒', emoji: '🔮',
            description: '激活后下一个诅咒法术效果提升50%',
            unlockLevel: 20, category: 'utility', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'amplifyCurse', nextCurseBonus: 0.5, duration: 1 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'amplifyCurse' }
        },

        // ─────────────────────────────────────────────
        // 术士新增技能 - 痛苦系天赋解锁
        // ─────────────────────────────────────────────
        siphonLife: {
            id: 'siphonLife', name: '生命虹吸', emoji: '🩸',
            description: '吸取目标生命，造成暗影DOT 6回合，每回合回复伤害值30%的生命',
            unlockLevel: 30, category: 'core', talentUnlock: true,
            skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [
                { type: 'dot', name: 'siphonLife', damageType: 'shadow', tickDamage: 12, duration: 6 },
                { type: 'lifesteal', value: 0.3, fromDot: 'siphonLife' }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'siphonLife' }
        },
        unstableAffliction: {
            id: 'unstableAffliction', name: '痛苦无常', emoji: '💜',
            description: '对目标施加痛苦无常，造成暗影DOT 5回合，被驱散时对驱散者造成高额伤害并沉默',
            unlockLevel: 35, category: 'core', talentUnlock: true,
            skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [
                { type: 'dot', name: 'unstableAffliction', damageType: 'shadow', tickDamage: 18, duration: 5 },
                { type: 'dispelPunishment', damage: 90, silenceDuration: 2 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'unstableAffliction' }
        },
        haunt: {
            id: 'haunt', name: '鬼影缠身', emoji: '👻',
            description: '发射鬼影攻击目标造成暗影伤害，使目标受到的DoT伤害提高20%持续6回合，鬼影返回时治疗术士',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 40 }, actionPoints: 2, cooldown: 6,
            damage: { base: 65, scaling: 2.0, stat: 'intellect' },
            heal: null,
            effects: [
                { type: 'debuff', name: 'haunt', dotBonus: 0.20, duration: 6 },
                { type: 'delayedHeal', delay: 6, percentOfDamage: 1.0 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'haunt' }
        },

        // ─────────────────────────────────────────────
        // 术士新增技能 - 恶魔学识天赋解锁
        // ─────────────────────────────────────────────
        darkPact: {
            id: 'darkPact', name: '黑暗契约', emoji: '🤝',
            description: '从恶魔身上抽取20%法力值转移给自己，恶魔必须存活',
            unlockLevel: 40, category: 'utility', talentUnlock: true,
            skillType: 'utility', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 3,
            damage: null, heal: null,
            effects: [{ type: 'manaTransfer', fromPet: true, percent: 0.20 }],
            comboPoints: null, generatesResource: { type: 'mana', value: 50 },
            conditions: { requiresTalent: 'darkPact', requiresPet: true }
        },
        felDomination: {
            id: 'felDomination', name: '恶魔支配', emoji: '👿',
            description: '瞬发召唤恶魔，行动点消耗减半',
            unlockLevel: 25, category: 'utility', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 50 }, actionPoints: 1, cooldown: 10,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'felDomination', nextSummonInstant: true, duration: 1 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'felDomination' }
        },
        soulLink: {
            id: 'soulLink', name: '灵魂链接', emoji: '🔗',
            description: '与恶魔建立灵魂链接，受到的伤害有30%转移给恶魔（被动）',
            unlockLevel: 40, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'passive', name: 'soulLink', damageSplit: 0.3, toPet: true }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'soulLink', requiresPet: true }
        },
        metamorphosis: {
            id: 'metamorphosis', name: '恶魔变形', emoji: '👹',
            description: '变身为恶魔形态，护甲+50%、伤害+20%、每回合回复5%生命，持续3回合',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 60 }, actionPoints: 2, cooldown: 8,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'metamorphosis', stat: 'armor', value: 0.5, duration: 3 },
                { type: 'buff', name: 'metamorphosis', stat: 'damage', value: 0.2, duration: 3 },
                { type: 'hot', name: 'metamorphosis', tickHealPercent: 0.05, duration: 3 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'metamorphosis' }
        },

        // ─────────────────────────────────────────────
        // 术士新增技能 - 毁灭系天赋解锁
        // ─────────────────────────────────────────────
        conflagrate: {
            id: 'conflagrate', name: '燃尽', emoji: '🔥',
            description: '消耗目标身上的献祭效果，造成相当于献祭剩余伤害的火焰伤害',
            unlockLevel: 40, category: 'core', talentUnlock: true,
            skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 4,
            damage: { base: 40, scaling: 1.8, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'consumeDot', dotName: 'immolate', damageMultiplier: 1.0 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'conflagrate', requiresDot: 'immolate' }
        },
        shadowburn: {
            id: 'shadowburn', name: '暗影灼烧', emoji: '🌑',
            description: '对生命值低于20%的目标造成高额暗影伤害，若目标在5回合内死亡获得灵魂碎片',
            unlockLevel: 35, category: 'core', talentUnlock: true,
            skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 1, cooldown: 3,
            damage: { base: 55, scaling: 2.2, stat: 'intellect' },
            heal: null,
            effects: [
                { type: 'executeBonus', threshold: 0.2, bonusDamage: 1.5 },
                { type: 'onKillSoulShard', duration: 5 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'shadowburn', targetHpBelow: 0.2 }
        },
        backlash: {
            id: 'backlash', name: '反冲', emoji: '⚡',
            description: '被动：受到攻击时有15%几率使下一次暗影箭或烧尽瞬发',
            unlockLevel: 30, category: 'passive', talentUnlock: true,
            skillType: 'passive', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 0, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'onHitProc', name: 'backlash', chance: 0.15, effect: 'instantCast', skills: ['shadowBolt', 'incinerate'] }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'backlash' }
        },
        chaosBolt: {
            id: 'chaosBolt', name: '混乱之箭', emoji: '🌈',
            description: '发射混乱能量，造成高额火焰伤害，无法被抵抗或减免',
            unlockLevel: 50, category: 'ultimate', talentUnlock: true,
            skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 50 }, actionPoints: 2, cooldown: 5,
            damage: { base: 100, scaling: 3.0, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'chaos', pierceResistance: true, pierceShield: true }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'chaosBolt' }
        },

        // ─────────────────────────────────────────────
        // 术士新增技能 - 其他核心技能
        // ─────────────────────────────────────────────
        demonArmor: {
            id: 'demonArmor', name: '恶魔护甲', emoji: '🛡️',
            description: '提升护甲30%并使生命恢复速度提高15%，持续直到取消',
            unlockLevel: 20, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 40 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'demonArmor', stat: 'armor', value: 0.3, duration: 99 },
                { type: 'buff', name: 'demonArmor', stat: 'healthRegen', value: 0.15, duration: 99 }
            ],
            comboPoints: null, generatesResource: null, conditions: null
        },
        soulFire: {
            id: 'soulFire', name: '灵魂之火', emoji: '🔥',
            description: '消耗灵魂碎片发射火焰弹，造成高额火焰伤害',
            unlockLevel: 36, category: 'powerful',
            skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 55 }, actionPoints: 2, cooldown: 4,
            damage: { base: 85, scaling: 2.8, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'consumeSoulShard', value: 1 }],
            comboPoints: null, generatesResource: null, conditions: { requiresSoulShard: 1 }
        },
        rainOfFire: {
            id: 'rainOfFire', name: '火焰之雨', emoji: '☄️',
            description: '召唤火焰之雨，对所有敌人造成火焰伤害持续3回合',
            unlockLevel: 28, category: 'core',
            skillType: 'spell', damageType: 'fire', targetType: 'allEnemies', range: 'ranged',
            resourceCost: { type: 'mana', value: 45 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'aoeDot', name: 'rainOfFire', damageType: 'fire', tickDamage: 20, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ═══════════════════════════════════════════
        // 德鲁伊技能 (Druid) — 资源: mana
        // ═══════════════════════════════════════════
        wrath: {
            id: 'wrath', name: '愤怒', emoji: '🌿',
            description: '释放自然能量攻击敌人',
            unlockLevel: 1, category: 'filler',
            skillType: 'spell', damageType: 'nature', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 18 }, actionPoints: 1, cooldown: 0,
            damage: { base: 22, scaling: 1.4, stat: 'intellect' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        moonfire: {
            id: 'moonfire', name: '月火术', emoji: '🌙',
            description: '奥术伤害并附加DOT 4回合',
            unlockLevel: 1, category: 'core',
            skillType: 'spell', damageType: 'arcane', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 0,
            damage: { base: 15, scaling: 0.8, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'dot', name: 'moonfire', damageType: 'arcane', tickDamage: 8, duration: 4 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        rejuvenation: {
            id: 'rejuvenation', name: '回春术', emoji: '🌱',
            description: '为目标施加持续治疗5回合',
            unlockLevel: 4, category: 'core',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'hot', name: 'rejuvenation', tickHeal: 15, duration: 5 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        healingTouch: {
            id: 'healingTouch', name: '愈合', emoji: '🍀',
            description: '高额单体治疗',
            unlockLevel: 8, category: 'core',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 40 }, actionPoints: 2, cooldown: 2,
            damage: null,
            heal: { base: 50, scaling: 2.0, stat: 'intellect' },
            effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        regrowth: {
            id: 'regrowth', name: '愈合之触', emoji: '🌸',
            description: '直接治疗并附加HOT 3回合',
            unlockLevel: 14, category: 'core',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 2,
            damage: null,
            heal: { base: 30, scaling: 1.2, stat: 'intellect' },
            effects: [{ type: 'hot', name: 'regrowth', tickHeal: 12, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        starfire: {
            id: 'starfire', name: '星火术', emoji: '⭐',
            description: '高额奥术伤害',
            unlockLevel: 20, category: 'powerful',
            skillType: 'spell', damageType: 'arcane', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 3,
            damage: { base: 45, scaling: 2.5, stat: 'intellect' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        bearForm: {
            id: 'bearForm', name: '熊形态', emoji: '🐻',
            description: '变形为熊，大幅提升护甲50%（持久）',
            unlockLevel: 30, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'bearForm', stat: 'armor', value: 0.5, duration: 99 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        wildGrowth: {
            id: 'wildGrowth', name: '野性成长', emoji: '🌳',
            description: '全体队友获得HOT持续4回合',
            unlockLevel: 40, category: 'ultimate',
            skillType: 'heal', damageType: null, targetType: 'all_allies', range: 'ranged',
            resourceCost: { type: 'mana', value: 55 }, actionPoints: 3, cooldown: 6,
            damage: null, heal: null,
            effects: [{ type: 'hot', name: 'wildGrowth', tickHeal: 12, duration: 4 }],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ── 熊形态专属技能 (Bear Form Skills) ─────────────────
        maul: {
            id: 'maul', name: '槌击', emoji: '🐾',
            description: '熊形态专属技能，造成物理伤害并生成怒气',
            unlockLevel: 10, category: 'builder',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 0,
            damage: { base: 25, scaling: 1.5, stat: 'strength' },
            heal: null, effects: [],
            comboPoints: null,
            generatesResource: { type: 'rage', value: 10 },
            conditions: { requiresForm: 'bear' }
        },
        swipe: {
            id: 'swipe', name: '横扫', emoji: '💥',
            description: '熊形态专属技能，横扫攻击所有近战敌人',
            unlockLevel: 16, category: 'core',
            skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee',
            resourceCost: { type: 'rage', value: 20 }, actionPoints: 1, cooldown: 3,
            damage: { base: 20, scaling: 1.2, stat: 'strength' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null,
            conditions: { requiresForm: 'bear' }
        },
        demoralizingRoar: {
            id: 'demoralizingRoar', name: '挫志咆哮', emoji: '🦁',
            description: '熊形态专属技能，降低敌人攻击力15%持续4回合',
            unlockLevel: 14, category: 'utility',
            skillType: 'spell', damageType: null, targetType: 'all_enemies', range: 'melee',
            resourceCost: { type: 'rage', value: 10 }, actionPoints: 1, cooldown: 4,
            damage: null, heal: null,
            effects: [{ type: 'debuff', name: 'demoralizingRoar', stat: 'strength', value: -0.15, duration: 4 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresForm: 'bear' }
        },
        bash: {
            id: 'bash', name: '重击', emoji: '👊',
            description: '熊形态专属技能，眩晕目标2回合',
            unlockLevel: 20, category: 'utility',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'rage', value: 15 }, actionPoints: 2, cooldown: 5,
            damage: { base: 18, scaling: 1.0, stat: 'strength' },
            heal: null,
            effects: [{ type: 'stun', name: 'bash', duration: 2 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresForm: 'bear' }
        },
        growl: {
            id: 'growl', name: '低吼', emoji: '😤',
            description: '熊形态专属技能，嘲讽目标强制攻击自己',
            unlockLevel: 8, category: 'utility',
            skillType: 'spell', damageType: null, targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'rage', value: 5 }, actionPoints: 1, cooldown: 3,
            damage: null, heal: null,
            effects: [{ type: 'taunt', name: 'growl', duration: 3 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresForm: 'bear' }
        },
        frenziedRegeneration: {
            id: 'frenziedRegeneration', name: '狂暴回复', emoji: '💚',
            description: '熊形态专属技能，消耗怒气回复生命值',
            unlockLevel: 24, category: 'utility',
            skillType: 'heal', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'rage', value: 25 }, actionPoints: 1, cooldown: 4,
            damage: null,
            heal: { base: 35, scaling: 1.5, stat: 'stamina' },
            effects: [],
            comboPoints: null, generatesResource: null,
            conditions: { requiresForm: 'bear' }
        },

        // ── 猫形态专属技能 (Cat Form Skills) ─────────────────
        claw: {
            id: 'claw', name: '爪击', emoji: '😼',
            description: '猫形态专属技能，造成物理伤害并生成1连击点',
            unlockLevel: 10, category: 'builder',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 25 }, actionPoints: 1, cooldown: 0,
            damage: { base: 22, scaling: 1.3, stat: 'agility' },
            heal: null, effects: [],
            comboPoints: { generates: 1 },
            generatesResource: null,
            conditions: { requiresForm: 'cat' }
        },
        rake: {
            id: 'rake', name: '撕扯', emoji: '🩸',
            description: '猫形态专属技能，造成流血DOT 4回合并生成1连击点',
            unlockLevel: 14, category: 'builder',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 30 }, actionPoints: 1, cooldown: 0,
            damage: { base: 12, scaling: 0.6, stat: 'agility' },
            heal: null,
            effects: [{ type: 'dot', name: 'rakeBleed', damageType: 'physical', tickDamage: 8, duration: 4 }],
            comboPoints: { generates: 1 },
            generatesResource: null,
            conditions: { requiresForm: 'cat' }
        },
        rip: {
            id: 'rip', name: '撕碎', emoji: '🦷',
            description: '猫形态专属终结技，消耗连击点造成流血DOT，每点持续2回合',
            unlockLevel: 20, category: 'finisher',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 30 }, actionPoints: 1, cooldown: 0,
            damage: null, heal: null,
            effects: [{
                type: 'dot', name: 'ripBleed', damageType: 'physical',
                tickDamage: 12, duration: 2, scalesWithComboPoints: true
            }],
            comboPoints: { consumes: true, damagePerPoint: 15 },
            generatesResource: null,
            conditions: { requiresForm: 'cat' }
        },
        ferociousBite: {
            id: 'ferociousBite', name: '凶猛撕咬', emoji: '🐆',
            description: '猫形态专属终结技，消耗连击点造成高额伤害',
            unlockLevel: 24, category: 'finisher',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 35 }, actionPoints: 1, cooldown: 0,
            damage: { base: 30, scaling: 2.0, stat: 'agility' },
            heal: null, effects: [],
            comboPoints: { consumes: true, damagePerPoint: 20 },
            generatesResource: null,
            conditions: { requiresForm: 'cat' }
        },
        prowl: {
            id: 'prowl', name: '潜行', emoji: '🌙',
            description: '猫形态专属技能，进入潜行状态，下一次攻击暴击率+50%',
            unlockLevel: 10, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 6,
            damage: null, heal: null,
            effects: [
                { type: 'stealth', name: 'prowl', duration: 3 },
                { type: 'buff', name: 'prowlCrit', stat: 'critChance', value: 0.5, duration: 1 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresForm: 'cat' }
        },
        dash: {
            id: 'dash', name: '疾奔', emoji: '💨',
            description: '猫形态专属技能，大幅提升闪避率40%持续2回合',
            unlockLevel: 16, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'energy', value: 20 }, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'dash', stat: 'dodgeChance', value: 0.4, duration: 2 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresForm: 'cat' }
        },
        shred: {
            id: 'shred', name: '毁灭', emoji: '✨',
            description: '猫形态专属技能，从背后攻击造成额外50%伤害并生成1连击点',
            unlockLevel: 28, category: 'builder',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 40 }, actionPoints: 1, cooldown: 0,
            damage: { base: 35, scaling: 2.0, stat: 'agility' },
            heal: null,
            effects: [{ type: 'bonusDamage', condition: 'behind', multiplier: 1.5 }],
            comboPoints: { generates: 1 },
            generatesResource: null,
            conditions: { requiresForm: 'cat' }
        },

        // ── 德鲁伊变形技能 (Shapeshift Skills) ─────────────────
        catForm: {
            id: 'catForm', name: '猫形态', emoji: '🐱',
            description: '变形为猫，提升敏捷20%并使用能量系统',
            unlockLevel: 20, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 1, cooldown: 3,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'catForm', stat: 'agility', value: 0.2, duration: 99 },
                { type: 'formChange', form: 'cat' }
            ],
            comboPoints: null, generatesResource: null, conditions: null
        },
        travelForm: {
            id: 'travelForm', name: '旅行形态', emoji: '🦌',
            description: '变形为旅行形态，脱离控制效果',
            unlockLevel: 30, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 4,
            damage: null, heal: null,
            effects: [
                { type: 'dispel', dispelType: 'all' },
                { type: 'formChange', form: 'travel' }
            ],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ── 德鲁伊控制/辅助技能 (Control/Utility Skills) ─────────────────
        entanglingRoots: {
            id: 'entanglingRoots', name: '纠缠根须', emoji: '🌿',
            description: '召唤根须缠绕敌人，使其无法移动并受到自然伤害',
            unlockLevel: 8, category: 'utility',
            skillType: 'spell', damageType: 'nature', targetType: 'enemy', range: 'ranged',
            resourceCost: { type: 'mana', value: 30 }, actionPoints: 1, cooldown: 4,
            damage: { base: 10, scaling: 0.5, stat: 'intellect' },
            heal: null,
            effects: [
                { type: 'root', name: 'entanglingRoots', duration: 3 },
                { type: 'dot', name: 'rootDamage', damageType: 'nature', tickDamage: 6, duration: 3 }
            ],
            comboPoints: null, generatesResource: null, conditions: null
        },
        natureGrasp: {
            id: 'natureGrasp', name: '自然之握', emoji: '🍃',
            description: '被动效果：被攻击时有30%几率对攻击者施放纠缠根须',
            unlockLevel: 18, category: 'utility',
            skillType: 'passive', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 0, cooldown: 0,
            damage: null, heal: null,
            effects: [{ type: 'passiveTrigger', trigger: 'onHit', chance: 0.3, skill: 'entanglingRoots' }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        tranquility: {
            id: 'tranquility', name: '宁静', emoji: '✨',
            description: '引导自然能量，为全体队友进行持续治疗',
            unlockLevel: 35, category: 'ultimate',
            skillType: 'heal', damageType: null, targetType: 'all_allies', range: 'ranged',
            resourceCost: { type: 'mana', value: 70 }, actionPoints: 3, cooldown: 8,
            damage: null, heal: null,
            effects: [{ type: 'hot', name: 'tranquility', tickHeal: 25, duration: 3, isChanneled: true }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        innervate: {
            id: 'innervate', name: '激活', emoji: '💫',
            description: '为目标恢复大量法力值',
            unlockLevel: 25, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 5 }, actionPoints: 1, cooldown: 6,
            damage: null, heal: null,
            effects: [{ type: 'resourceRestore', resource: 'mana', value: 50, percent: 0.3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        barkskin: {
            id: 'barkskin', name: '树皮术', emoji: '🪵',
            description: '获得树皮保护，受到的伤害降低20%持续3回合',
            unlockLevel: 20, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 20 }, actionPoints: 1, cooldown: 4,
            damage: null, heal: null,
            effects: [{ type: 'buff', name: 'barkskin', stat: 'damageReduction', value: 0.2, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ── 德鲁伊天赋解锁技能 (Talent Skills) ─────────────────
        starfall: {
            id: 'starfall', name: '星落', emoji: '🌠',
            description: '召唤星辰坠落，对所有敌人造成奥术伤害',
            unlockLevel: 50, category: 'ultimate',
            skillType: 'spell', damageType: 'arcane', targetType: 'all_enemies', range: 'ranged',
            resourceCost: { type: 'mana', value: 80 }, actionPoints: 3, cooldown: 10,
            damage: { base: 40, scaling: 2.0, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'dot', name: 'starfall', damageType: 'arcane', tickDamage: 15, duration: 3 }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'starfall' }
        },
        moonkinForm: {
            id: 'moonkinForm', name: '枭兽形态', emoji: '🦉',
            description: '变形为枭兽，提升护甲80%和法术伤害15%，为小队提供暴击光环',
            unlockLevel: 40, category: 'ultimate',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 60 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'moonkinForm', stat: 'armor', value: 0.8, duration: 99 },
                { type: 'buff', name: 'moonkinForm', stat: 'spellDamage', value: 0.15, duration: 99 },
                { type: 'aura', name: 'moonkinAura', stat: 'spellCrit', value: 0.05, target: 'party' },
                { type: 'formChange', form: 'moonkin' }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'moonkinForm' }
        },
        mangle: {
            id: 'mangle', name: '割碎', emoji: '🦁',
            description: '野性攻击，造成高额伤害并使目标受到的流血伤害提高30%',
            unlockLevel: 50, category: 'ultimate',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: { type: 'energy', value: 45 }, actionPoints: 2, cooldown: 4,
            damage: { base: 60, scaling: 2.5, stat: 'agility' },
            heal: null,
            effects: [
                { type: 'debuff', name: 'mangle', stat: 'bleedDamage', value: 0.3, duration: 4 },
                { type: 'comboGen', value: 1 }
            ],
            comboPoints: { generates: 1 },
            generatesResource: null,
            conditions: { requiresForm: 'cat', requiresTalent: 'mangle' }
        },
        swiftmend: {
            id: 'swiftmend', name: '迅捷治愈', emoji: '💚',
            description: '消耗目标的回春术或愈合效果，立即治疗目标',
            unlockLevel: 40, category: 'ultimate',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: { type: 'mana', value: 35 }, actionPoints: 1, cooldown: 4,
            damage: null,
            heal: { base: 70, scaling: 2.5, stat: 'intellect' },
            effects: [{ type: 'consumeHot', hotNames: ['rejuvenation', 'regrowth'], consumeAll: false }],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'swiftmend' }
        },
        naturesSwiftness: {
            id: 'naturesSwiftness', name: '自然迅捷', emoji: '⚡',
            description: '使下一个治疗法术瞬发并提高50%治疗效果',
            unlockLevel: 20, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 8,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'naturesSwiftness', stat: 'castSpeed', value: 1.0, duration: 2 },
                { type: 'buff', name: 'naturesSwiftnessHeal', stat: 'healingDone', value: 0.5, duration: 1 }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'naturesSwiftness' }
        },
        treeOfLifeForm: {
            id: 'treeOfLifeForm', name: '生命之树形态', emoji: '🌳',
            description: '变形为生命之树，提升护甲25%和治疗效果20%，为小队提供治疗加成光环',
            unlockLevel: 50, category: 'ultimate',
            skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
            resourceCost: { type: 'mana', value: 60 }, actionPoints: 2, cooldown: 5,
            damage: null, heal: null,
            effects: [
                { type: 'buff', name: 'treeOfLifeForm', stat: 'armor', value: 0.25, duration: 99 },
                { type: 'buff', name: 'treeOfLifeForm', stat: 'healingDone', value: 0.2, duration: 99 },
                { type: 'aura', name: 'treeOfLifeAura', stat: 'healingReceived', value: 0.1, target: 'party' },
                { type: 'formChange', form: 'treeOfLife' }
            ],
            comboPoints: null, generatesResource: null,
            conditions: { requiresTalent: 'treeOfLife' }
        },

        // ═══════════════════════════════════════════
        // 通用 / 怪物技能
        // ═══════════════════════════════════════════
        basicAttack: {
            id: 'basicAttack', name: '普通攻击', emoji: '⚔️',
            description: '基础物理攻击',
            unlockLevel: 1, category: 'filler',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 0,
            damage: { base: 8, scaling: 1.2, stat: 'strength' },
            heal: null, effects: [], comboPoints: null, generatesResource: null, conditions: null
        },
        orcRage: {
            id: 'orcRage', name: '兽人狂怒', emoji: '💢',
            description: '兽人进入狂怒状态，造成额外伤害并获得攻击力增益',
            unlockLevel: 1, category: 'core',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 3,
            damage: { base: 18, scaling: 1.5, stat: 'strength' },
            heal: null,
            effects: [{ type: 'buff', name: 'orcRage', stat: 'strength', value: 0.2, duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        goblinStab: {
            id: 'goblinStab', name: '毒刃突刺', emoji: '🗡️',
            description: '快速突刺，附带毒素DOT',
            unlockLevel: 1, category: 'core',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 2,
            damage: { base: 10, scaling: 1.0, stat: 'agility' },
            heal: null,
            effects: [{ type: 'dot', name: 'goblinPoison', tickDamage: 5, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        wolfBite: {
            id: 'wolfBite', name: '凶猛撕咬', emoji: '🐺',
            description: '猛烈的撕咬攻击，造成流血',
            unlockLevel: 1, category: 'core',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 2,
            damage: { base: 14, scaling: 1.3, stat: 'strength' },
            heal: null,
            effects: [{ type: 'dot', name: 'bleed', tickDamage: 4, duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        skeletonSlash: {
            id: 'skeletonSlash', name: '亡灵斩击', emoji: '💀',
            description: '诅咒的斩击，降低目标防御',
            unlockLevel: 1, category: 'core',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 3,
            damage: { base: 16, scaling: 1.2, stat: 'strength' },
            heal: null,
            effects: [{ type: 'debuff', name: 'curseWeakness', stat: 'armor', value: -0.15, duration: 2 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        trollSmash: {
            id: 'trollSmash', name: '巨魔重击', emoji: '👊',
            description: '强力重击，有几率眩晕',
            unlockLevel: 1, category: 'powerful',
            skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
            resourceCost: null, actionPoints: 1, cooldown: 3,
            damage: { base: 25, scaling: 1.5, stat: 'strength' },
            heal: null,
            effects: [{ type: 'cc', ccType: 'stun', duration: 1 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        trollRegenerate: {
            id: 'trollRegenerate', name: '巨魔再生', emoji: '💚',
            description: '巨魔天赋再生能力',
            unlockLevel: 1, category: 'utility',
            skillType: 'heal', damageType: null, targetType: 'self', range: 'self',
            resourceCost: null, actionPoints: 1, cooldown: 4,
            damage: null,
            heal: { base: 30, scaling: 1.0, stat: 'stamina' },
            effects: [], comboPoints: null, generatesResource: null, conditions: null
        },

        // ═══════════════════════════════════════════
        // 怪物法师类技能 (Monster Caster Skills)
        // ═══════════════════════════════════════════
        monsterFireball: {
            id: 'monsterFireball', name: '火球术', emoji: '☄️',
            description: '单体火焰伤害，伤害 = 智力 × 1.8',
            unlockLevel: 1, category: 'core',
            skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged',
            resourceCost: null, actionPoints: 1, cooldown: 2,
            damage: { base: 0, scaling: 1.8, stat: 'intellect' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        monsterFrostBolt: {
            id: 'monsterFrostBolt', name: '寒冰箭', emoji: '❄️',
            description: '单体冰霜伤害 + 减速1回合',
            unlockLevel: 1, category: 'core',
            skillType: 'spell', damageType: 'frost', targetType: 'enemy', range: 'ranged',
            resourceCost: null, actionPoints: 1, cooldown: 2,
            damage: { base: 0, scaling: 1.4, stat: 'intellect' },
            heal: null,
            effects: [{ type: 'debuff', name: 'slow', value: 0.5, duration: 1 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        monsterShadowBolt: {
            id: 'monsterShadowBolt', name: '暗影箭', emoji: '🌑',
            description: '单体暗影伤害，伤害 = 智力 × 2.0',
            unlockLevel: 1, category: 'core',
            skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged',
            resourceCost: null, actionPoints: 1, cooldown: 2,
            damage: { base: 0, scaling: 2.0, stat: 'intellect' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        monsterHeal: {
            id: 'monsterHeal', name: '治疗术', emoji: '💚',
            description: '恢复自身或友方HP，恢复量 = 智力 × 2.5',
            unlockLevel: 1, category: 'utility',
            skillType: 'heal', damageType: null, targetType: 'ally', range: 'ranged',
            resourceCost: null, actionPoints: 1, cooldown: 3,
            damage: null,
            heal: { base: 0, scaling: 2.5, stat: 'intellect' },
            effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },
        monsterCurseOfWeakness: {
            id: 'monsterCurseOfWeakness', name: '虚弱诅咒', emoji: '💜',
            description: '降低目标攻击力20%，持续3回合',
            unlockLevel: 1, category: 'utility',
            skillType: 'debuff', damageType: null, targetType: 'enemy', range: 'ranged',
            resourceCost: null, actionPoints: 1, cooldown: 4,
            damage: null, heal: null,
            effects: [{ type: 'debuff', name: 'curseOfWeakness', stat: 'strength', value: -0.2, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        monsterPoisonCloud: {
            id: 'monsterPoisonCloud', name: '毒云', emoji: '☁️',
            description: 'AOE毒素伤害，每回合 智力 × 0.6，持续3回合',
            unlockLevel: 1, category: 'powerful',
            skillType: 'spell', damageType: 'nature', targetType: 'all_enemies', range: 'ranged',
            resourceCost: null, actionPoints: 1, cooldown: 4,
            damage: null, heal: null,
            effects: [{ type: 'dot', name: 'poisonCloud', damageType: 'nature', tickDamage: 0, scalingStat: 'intellect', scalingFactor: 0.6, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        monsterLightningBolt: {
            id: 'monsterLightningBolt', name: '闪电链', emoji: '⚡',
            description: '对主目标造成 智力 × 1.6 伤害，溅射相邻目标50%',
            unlockLevel: 1, category: 'powerful',
            skillType: 'spell', damageType: 'nature', targetType: 'cleave_3', range: 'ranged',
            resourceCost: null, actionPoints: 1, cooldown: 3,
            damage: { base: 0, scaling: 1.6, stat: 'intellect' },
            heal: null, effects: [],
            comboPoints: null, generatesResource: null, conditions: null
        },

        // ═══════════════════════════════════════════
        // 被动技能 (Passive Skills) — 学习后自动生效
        // ═══════════════════════════════════════════
        plateArmor: {
            id: 'plateArmor', name: '板甲专精', emoji: '🛡️',
            description: '穿戴板甲时，体力+5%',
            unlockLevel: 1, category: 'passive',
            skillType: 'passive', damageType: null, targetType: 'self', range: 'self',
            passive: { trigger: 'always', effect: { type: 'stat_percent', stat: 'stamina', value: 0.05 } },
            resourceCost: null, actionPoints: 0, cooldown: 0,
            damage: null, heal: null, effects: [], comboPoints: null, generatesResource: null, conditions: null
        },
        leatherFinesse: {
            id: 'leatherFinesse', name: '皮甲精通', emoji: '🏃',
            description: '穿戴皮甲时，敏捷+5%',
            unlockLevel: 1, category: 'passive',
            skillType: 'passive', damageType: null, targetType: 'self', range: 'self',
            passive: { trigger: 'always', effect: { type: 'stat_percent', stat: 'agility', value: 0.05 } },
            resourceCost: null, actionPoints: 0, cooldown: 0,
            damage: null, heal: null, effects: [], comboPoints: null, generatesResource: null, conditions: null
        },
        arcaneMastery: {
            id: 'arcaneMastery', name: '奥术精通', emoji: '🔮',
            description: '法力上限+10%',
            unlockLevel: 1, category: 'passive',
            skillType: 'passive', damageType: null, targetType: 'self', range: 'self',
            passive: { trigger: 'always', effect: { type: 'stat_percent', stat: 'mana', value: 0.10 } },
            resourceCost: null, actionPoints: 0, cooldown: 0,
            damage: null, heal: null, effects: [], comboPoints: null, generatesResource: null, conditions: null
        },
        dualWieldSpec: {
            id: 'dualWieldSpec', name: '双持专精', emoji: '⚔️',
            description: '力量和敏捷+3',
            unlockLevel: 3, category: 'passive',
            skillType: 'passive', damageType: null, targetType: 'self', range: 'self',
            passive: { trigger: 'always', effect: { type: 'stat_flat', stats: { strength: 3, agility: 3 } } },
            resourceCost: null, actionPoints: 0, cooldown: 0,
            damage: null, heal: null, effects: [], comboPoints: null, generatesResource: null, conditions: null
        },
        innerFire: {
            id: 'innerFire', name: '心灵之火', emoji: '🔥',
            description: '精神+5，智力+3',
            unlockLevel: 2, category: 'passive',
            skillType: 'passive', damageType: null, targetType: 'self', range: 'self',
            passive: { trigger: 'always', effect: { type: 'stat_flat', stats: { spirit: 5, intellect: 3 } } },
            resourceCost: null, actionPoints: 0, cooldown: 0,
            damage: null, heal: null, effects: [], comboPoints: null, generatesResource: null, conditions: null
        },
        naturalRegeneration: {
            id: 'naturalRegeneration', name: '自然恢复', emoji: '🌿',
            description: '每回合恢复2%最大生命',
            unlockLevel: 3, category: 'passive',
            skillType: 'passive', damageType: null, targetType: 'self', range: 'self',
            passive: { trigger: 'turn_start', effect: { type: 'heal_percent', value: 0.02 } },
            resourceCost: null, actionPoints: 0, cooldown: 0,
            damage: null, heal: null, effects: [], comboPoints: null, generatesResource: null, conditions: null
        },

        // ═══════════════════════════════════════════
        // 团队光环技能 (Team Aura) — 对全队生效
        // ═══════════════════════════════════════════
        battleShout: {
            id: 'battleShout', name: '战斗怒吼', emoji: '📢',
            icon: '/icons/skills/warrior/battle-shout.png',
            description: '提升全队力量10%，持续3回合',
            unlockLevel: 4, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'all_allies', range: 'ranged',
            resourceCost: { type: 'rage', value: 20 }, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', stat: 'strength', value: 0.10, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        },
        devotionAura: {
            id: 'devotionAura', name: '虔诚光环', emoji: '✨',
            description: '提升全队体力8%，持续3回合',
            unlockLevel: 4, category: 'utility',
            skillType: 'buff', damageType: null, targetType: 'all_allies', range: 'ranged',
            resourceCost: { type: 'mana', value: 25 }, actionPoints: 1, cooldown: 5,
            damage: null, heal: null,
            effects: [{ type: 'buff', stat: 'stamina', value: 0.08, duration: 3 }],
            comboPoints: null, generatesResource: null, conditions: null
        }
    },
    
    // 怪物配置 - 覆盖 1-60 级，15个区域共 ~140 种
    monsters: expandedMonsters,
    
    // 物品配置
    items: {
        healthPotion: {
            id: 'healthPotion',
            name: '生命药水',
            emoji: '🧪',
            type: 'consumable',
            description: '恢复50点生命值',
            effect: { type: 'heal', value: 50 },
            price: 25
        },
        manaPotion: {
            id: 'manaPotion',
            name: '法力药水',
            emoji: '💧',
            type: 'consumable',
            description: '恢复30点法力值',
            effect: { type: 'mana', value: 30 },
            price: 30
        },
        strengthPotion: {
            id: 'strengthPotion',
            name: '力量药水',
            emoji: '💪',
            type: 'consumable',
            description: '临时提升20%力量',
            effect: { type: 'buff', stat: 'strength', value: 0.2, duration: 5 },
            price: 50
        }
    },
    
    // 开放区域配置 - 15个区域（数据来自 MonsterData.js）
    areas: expandedAreas,
    
    // 经验值等级表 - 60级分段线性曲线
    // Segment 1 (Lv 1-19):  200 + 40*(L-1)
    // Segment 2 (Lv 20-39): 1500 + 200*(L-20)
    // Segment 3 (Lv 40-54): 7000 + 700*(L-40)
    // Segment 4 (Lv 55-59): 18000 + 1200*(L-55)
    expTable: (() => {
        const table = [0]; // index 0 unused
        for (let L = 1; L <= 59; L++) {
            if (L < 20)      table[L] = 200 + 40 * (L - 1);
            else if (L < 40)  table[L] = 1500 + 200 * (L - 20);
            else if (L < 55)  table[L] = 7000 + 700 * (L - 40);
            else              table[L] = 18000 + 1200 * (L - 55);
        }
        return table;
    })()
};

