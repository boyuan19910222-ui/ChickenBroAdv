/**
 * 职业特殊机制数据配置
 * 包含宠物、恶魔、图腾、变形等系统
 */
export const ClassMechanics = {
    // 猎人宠物系统
    pet: {
        id: 'pet',
        name: '宠物系统',
        description: '驯服并控制野兽作为战斗伙伴',
        
        // 基础宠物（所有猎人默认）
        defaultPet: {
            id: 'wolf',
            name: '狼',
            emoji: '🐺',
            baseStats: {
                health: 100,
                damage: 15,
                armor: 50,
                attackSpeed: 1.5
            },
            abilities: ['bite', 'growl'],
            description: '忠诚的狼，猎人的基础战斗伙伴'
        },

        // 高级宠物（野兽控制天赋解锁，三选一）
        advancedPets: {
            bear: {
                id: 'bear',
                name: '巨熊',
                emoji: '🐻',
                role: 'warrior',
                roleDescription: 'DPS战士型：血多，伤害中等',
                baseStats: {
                    health: 180,
                    damage: 14,
                    armor: 90,
                    attackSpeed: 2.0
                },
                abilities: ['bite', 'growl', 'swipe'],
                specialAbility: 'swipe',
                description: '强壮的巨熊，拥有极高生命值和护甲，如同战士般坚韧'
            },
            boar: {
                id: 'boar',
                name: '战猪',
                emoji: '🐗',
                role: 'rogue',
                roleDescription: 'DPS盗贼型：血中等，物理伤害高',
                baseStats: {
                    health: 120,
                    damage: 22,
                    armor: 55,
                    attackSpeed: 1.4
                },
                abilities: ['bite', 'growl', 'charge'],
                specialAbility: 'charge',
                description: '凶猛的战猪，高物理输出如同盗贼般致命'
            },
            eagle: {
                id: 'eagle',
                name: '风鹰',
                emoji: '🦅',
                role: 'mage',
                roleDescription: '法师型：血少，法术类伤害高',
                baseStats: {
                    health: 70,
                    damage: 25,
                    armor: 30,
                    attackSpeed: 1.2
                },
                abilities: ['claw', 'growl', 'wind_blast'],
                specialAbility: 'wind_blast',
                description: '迅捷的风鹰，以法术般的风暴攻击撕裂敌人'
            }
        },
        
        // 宠物技能
        petAbilities: {
            bite: { name: '撕咬', damage: 1.2, cooldown: 0, resourceCost: 25 },
            claw: { name: '爪击', damage: 1.0, cooldown: 0, resourceCost: 20 },
            growl: { name: '低吼', damage: 0.3, cooldown: 5, resourceCost: 15, effect: 'taunt' },
            charge: { name: '冲锋', damage: 1.5, cooldown: 15, resourceCost: 0, effect: 'stun' },
            swipe: { name: '挥击', damage: 0.8, cooldown: 8, resourceCost: 20, effect: 'aoe' },
            wind_blast: { name: '风暴冲击', damage: 1.6, cooldown: 6, resourceCost: 25, effect: 'knockback', damageType: 'nature' }
        },
        
        // 宠物配置
        config: {
            maxPets: 1,
            stableSlots: 3,
            feedCooldown: 10,
            reviveCooldown: 60
        }
    },

    // 术士恶魔召唤系统
    demon: {
        id: 'demon',
        name: '恶魔召唤',
        description: '召唤并控制来自扭曲虚空的恶魔',
        
        // 恶魔类型
        demonTypes: {
            imp: {
                id: 'imp',
                name: '小鬼',
                emoji: '👿',
                unlockLevel: 1,
                soulShardCost: 0,    // 不消耗灵魂碎片
                summonTime: 6,        // 召唤时间（秒）
                baseStats: {
                    health: 60,
                    mana: 100,
                    damage: 20,
                    armor: 20
                },
                abilities: ['firebolt', 'fire_shield', 'blood_pact'],
                role: 'ranged_dps',
                description: '远程火焰攻击，提供生命值加成'
            },
            voidwalker: {
                id: 'voidwalker',
                name: '虚空行者',
                emoji: '👤',
                unlockLevel: 4,
                soulShardCost: 1,
                summonTime: 10,
                baseStats: {
                    health: 150,
                    mana: 50,
                    damage: 10,
                    armor: 100
                },
                abilities: ['torment', 'sacrifice', 'suffering'],
                role: 'tank',
                description: '坚韧的护卫，吸引敌人仇恨'
            },
            succubus: {
                id: 'succubus',
                name: '魅魔',
                emoji: '💃',
                unlockLevel: 8,
                soulShardCost: 1,
                summonTime: 10,
                baseStats: {
                    health: 80,
                    mana: 80,
                    damage: 25,
                    armor: 30
                },
                abilities: ['lash_of_pain', 'seduction', 'soothing_kiss'],
                role: 'control',
                description: '诱惑敌人，提供控制能力'
            },
            felhunter: {
                id: 'felhunter',
                name: '地狱猎犬',
                emoji: '🐕',
                unlockLevel: 12,
                soulShardCost: 1,
                summonTime: 10,
                baseStats: {
                    health: 100,
                    mana: 70,
                    damage: 22,
                    armor: 50
                },
                abilities: ['shadow_bite', 'devour_magic', 'spell_lock'],
                role: 'anti_caster',
                description: '对抗施法者，驱散魔法效果'
            },
            infernal: {
                id: 'infernal',
                name: '地狱火',
                emoji: '🔥',
                unlockLevel: 16,
                soulShardCost: 1,
                summonTime: 2,
                baseStats: {
                    health: 200,
                    mana: 0,
                    damage: 30,
                    armor: 80
                },
                abilities: ['immolation_aura', 'meteor_strike'],
                role: 'aoe_damage',
                isTimed: true,       // 限时召唤
                duration: 60,        // 持续时间（秒）
                description: '强力限时召唤，造成范围伤害'
            }
        },
        
        // 恶魔技能
        demonAbilities: {
            firebolt: { name: '火焰弹', damage: 1.5, cooldown: 0, manaCost: 20, school: 'fire' },
            fire_shield: { name: '火焰护盾', damage: 0, cooldown: 30, manaCost: 50, effect: 'shield' },
            blood_pact: { name: '血契', damage: 0, cooldown: 0, manaCost: 0, effect: 'passive_health' },
            torment: { name: '折磨', damage: 0.5, cooldown: 5, manaCost: 20, effect: 'taunt' },
            sacrifice: { name: '牺牲', damage: 0, cooldown: 300, manaCost: 0, effect: 'sacrifice_shield' },
            suffering: { name: '受难', damage: 0.3, cooldown: 4, manaCost: 30, effect: 'aoe_taunt' },
            lash_of_pain: { name: '痛苦鞭笞', damage: 2.0, cooldown: 6, manaCost: 35, school: 'shadow' },
            seduction: { name: '魅惑', damage: 0, cooldown: 30, manaCost: 40, effect: 'charm' },
            soothing_kiss: { name: '安抚之吻', damage: 0, cooldown: 10, manaCost: 25, effect: 'threat_reduce' },
            shadow_bite: { name: '暗影撕咬', damage: 1.8, cooldown: 6, manaCost: 30, school: 'shadow' },
            devour_magic: { name: '吞噬魔法', damage: 0, cooldown: 15, manaCost: 20, effect: 'dispel' },
            spell_lock: { name: '法术封锁', damage: 0, cooldown: 24, manaCost: 15, effect: 'silence' },
            immolation_aura: { name: '献祭光环', damage: 0.5, cooldown: 0, manaCost: 0, effect: 'aoe_dot' },
            meteor_strike: { name: '流星打击', damage: 3.0, cooldown: 0, manaCost: 0, effect: 'stun' }
        },
        
        // 灵魂碎片配置
        soulShardConfig: {
            maxShards: 20,
            bagSlotRequired: true,
            obtainMethods: ['drain_soul', 'soul_fire'],
            uses: ['summon_demon', 'soulstone', 'healthstone', 'firestone', 'spellstone']
        }
    },

    // 萨满图腾系统
    totem: {
        id: 'totem',
        name: '图腾系统',
        description: '召唤元素图腾提供各种效果',
        
        // 图腾类型 (按元素分类)
        totemTypes: {
            // 火焰图腾
            fire: {
                searing_totem: {
                    id: 'searing_totem',
                    name: '灼热图腾',
                    emoji: '🔥',
                    element: 'fire',
                    manaCost: 25,
                    duration: 30,
                    health: 5,
                    effect: { type: 'damage', target: 'enemy', value: 12, interval: 2 },
                    description: '周期性攻击附近敌人'
                },
                fire_nova_totem: {
                    id: 'fire_nova_totem',
                    name: '火焰新星图腾',
                    emoji: '💥',
                    element: 'fire',
                    manaCost: 50,
                    duration: 4,
                    health: 5,
                    effect: { type: 'aoe_damage', target: 'enemy', value: 80, delay: 4 },
                    description: '延迟后爆炸造成范围伤害'
                },
                magma_totem: {
                    id: 'magma_totem',
                    name: '熔岩图腾',
                    emoji: '🌋',
                    element: 'fire',
                    manaCost: 60,
                    duration: 20,
                    health: 5,
                    effect: { type: 'aoe_damage', target: 'enemy', value: 15, interval: 2 },
                    description: '周期性造成范围伤害'
                }
            },
            // 大地图腾
            earth: {
                stoneskin_totem: {
                    id: 'stoneskin_totem',
                    name: '石肤图腾',
                    emoji: '🪨',
                    element: 'earth',
                    manaCost: 30,
                    duration: 120,
                    health: 5,
                    effect: { type: 'buff', target: 'party', stat: 'armor', value: 50 },
                    description: '提升队伍护甲值'
                },
                earthbind_totem: {
                    id: 'earthbind_totem',
                    name: '地缚图腾',
                    emoji: '⛓️',
                    element: 'earth',
                    manaCost: 25,
                    duration: 45,
                    health: 5,
                    effect: { type: 'debuff', target: 'enemy', stat: 'moveSpeed', value: -0.5, interval: 3 },
                    description: '减缓附近敌人移动速度'
                },
                tremor_totem: {
                    id: 'tremor_totem',
                    name: '战栗图腾',
                    emoji: '📳',
                    element: 'earth',
                    manaCost: 35,
                    duration: 120,
                    health: 5,
                    effect: { type: 'dispel', target: 'party', removes: ['fear', 'charm', 'sleep'], interval: 3 },
                    description: '周期性移除恐惧、魅惑和昏睡效果'
                }
            },
            // 水之图腾
            water: {
                healing_stream_totem: {
                    id: 'healing_stream_totem',
                    name: '治疗之泉图腾',
                    emoji: '💧',
                    element: 'water',
                    manaCost: 40,
                    duration: 60,
                    health: 5,
                    effect: { type: 'heal', target: 'party', value: 10, interval: 2 },
                    description: '周期性治疗附近队友'
                },
                mana_spring_totem: {
                    id: 'mana_spring_totem',
                    name: '法力之泉图腾',
                    emoji: '🔵',
                    element: 'water',
                    manaCost: 50,
                    duration: 60,
                    health: 5,
                    effect: { type: 'mana_regen', target: 'party', value: 8, interval: 2 },
                    description: '周期性恢复队友法力'
                },
                poison_cleansing_totem: {
                    id: 'poison_cleansing_totem',
                    name: '祛毒图腾',
                    emoji: '🧪',
                    element: 'water',
                    manaCost: 35,
                    duration: 120,
                    health: 5,
                    effect: { type: 'dispel', target: 'party', removes: ['poison'], interval: 5 },
                    description: '周期性移除毒素效果'
                }
            },
            // 风之图腾
            air: {
                windfury_totem: {
                    id: 'windfury_totem',
                    name: '风怒图腾',
                    emoji: '🌪️',
                    element: 'air',
                    manaCost: 45,
                    duration: 120,
                    health: 5,
                    effect: { type: 'buff', target: 'party', stat: 'extraAttacks', value: 0.2 },
                    description: '为队友提供额外攻击机会'
                },
                grace_of_air_totem: {
                    id: 'grace_of_air_totem',
                    name: '风之优雅图腾',
                    emoji: '💨',
                    element: 'air',
                    manaCost: 40,
                    duration: 120,
                    health: 5,
                    effect: { type: 'buff', target: 'party', stat: 'agility', value: 30 },
                    description: '提升队友敏捷属性'
                },
                grounding_totem: {
                    id: 'grounding_totem',
                    name: '根基图腾',
                    emoji: '⚡',
                    element: 'air',
                    manaCost: 30,
                    duration: 45,
                    health: 5,
                    effect: { type: 'absorb', target: 'self', absorbs: 'spell', uses: 1 },
                    description: '吸收一次敌方法术攻击'
                }
            }
        },
        
        // 图腾配置
        config: {
            maxTotems: 4,           // 同时放置的图腾数（每种元素一个）
            totemRange: 20,         // 图腾效果范围（码）
            totemHealth: 5,         // 图腾基础生命值
            callOfTheElements: true // 是否支持图腾群召唤
        }
    },

    // 德鲁伊变形系统
    shapeshift: {
        id: 'shapeshift',
        name: '变形系统',
        description: '变形为不同的动物形态获得独特能力',
        
        // 形态类型
        formTypes: {
            bearForm: {
                id: 'bearForm',
                name: '熊形态',
                emoji: '🐻',
                category: 'combat',
                manaCost: 35,
                cooldown: 5,
                statModifiers: {
                    health: 1.5,      // 生命值提升50%
                    armor: 2.0,       // 护甲提升100%
                    strength: 1.2,    // 力量提升20%
                    attackPower: 1.3  // 攻击强度提升30%
                },
                resourceType: 'rage',
                baseResource: 20,     // 变形后初始怒气
                maxResource: 100,
                abilities: ['maul', 'swipe', 'demoralizingRoar', 'bash', 'growl', 'frenziedRegeneration'],
                role: 'tank',
                restrictions: ['no_spellcasting', 'no_healing_spells'],
                description: '坦克形态，高生命和护甲，使用怒气系统'
            },
            catForm: {
                id: 'catForm',
                name: '猫形态',
                emoji: '🐱',
                category: 'combat',
                manaCost: 30,
                cooldown: 3,
                statModifiers: {
                    attackSpeed: 1.3, // 攻击速度提升30%
                    agility: 1.2,     // 敏捷提升20%
                    critChance: 0.05  // 暴击几率提升5%
                },
                resourceType: 'energy',
                baseResource: 100,
                maxResource: 100,
                comboPointsMax: 5,
                abilities: ['claw', 'rake', 'rip', 'ferociousBite', 'prowl', 'dash', 'shred'],
                role: 'melee_dps',
                restrictions: ['no_spellcasting', 'no_healing_spells'],
                description: 'DPS形态，高攻击速度和暴击，使用能量和连击点系统'
            },
            travelForm: {
                id: 'travelForm',
                name: '旅行形态',
                emoji: '🦌',
                category: 'utility',
                manaCost: 30,
                cooldown: 0,
                statModifiers: {
                    moveSpeed: 1.4    // 移动速度提升40%
                },
                resourceType: 'none',
                abilities: [],
                role: 'travel',
                restrictions: ['no_combat', 'no_spellcasting', 'outdoor_only'],
                description: '快速移动形态，仅限室外'
            },
            aquaticForm: {
                id: 'aquaticForm',
                name: '水栖形态',
                emoji: '🦭',
                category: 'utility',
                manaCost: 30,
                cooldown: 0,
                statModifiers: {
                    swimSpeed: 1.5,   // 游泳速度提升50%
                    underwater: true  // 水下呼吸
                },
                resourceType: 'none',
                abilities: [],
                role: 'aquatic',
                restrictions: ['water_only', 'no_combat'],
                description: '水下形态，可水下呼吸'
            },
            moonkinForm: {
                id: 'moonkinForm',
                name: '枭兽形态',
                emoji: '🦉',
                category: 'combat',
                manaCost: 60,
                cooldown: 0,
                talentRequired: 'moonkinForm', // 需要天赋解锁
                statModifiers: {
                    armor: 1.8,       // 护甲提升80%
                    spellDamage: 1.15  // 法术伤害提升15%
                },
                auraEffect: {
                    name: '枭兽光环',
                    target: 'party',
                    stat: 'spellCrit',
                    value: 0.05
                },
                resourceType: 'mana',
                abilities: ['wrath', 'moonfire', 'starfire', 'hurricane'],
                role: 'ranged_dps',
                restrictions: [],
                description: '平衡DPS形态，提升法术暴击，为小队提供光环'
            },
            treeOfLifeForm: {
                id: 'treeOfLifeForm',
                name: '生命之树形态',
                emoji: '🌳',
                category: 'combat',
                manaCost: 60,
                cooldown: 0,
                talentRequired: 'treeOfLife', // 需要天赋解锁
                statModifiers: {
                    armor: 1.25,        // 护甲提升25%
                    healingDone: 1.20,  // 治疗效果提升20%
                    manaRegen: 1.15     // 法力回复提升15%
                },
                auraEffect: {
                    name: '生命之树光环',
                    target: 'party',
                    stat: 'healingReceived',
                    value: 0.10
                },
                resourceType: 'mana',
                abilities: ['rejuvenation', 'lifebloom', 'regrowth', 'swiftmend', 'wildGrowth'],
                role: 'healer',
                restrictions: [],
                description: '治疗形态，增强治疗效果，为小队提供治疗光环'
            }
        },
        
        // 形态专属技能（与 GameData.js 技能ID对应）
        formAbilities: {
            // 熊形态技能
            maul: { name: '槌击', damage: 1.5, generatesRage: 10, cooldown: 0, form: 'bearForm', type: 'builder' },
            swipe: { name: '横扫', damage: 1.2, rageCost: 20, cooldown: 3, form: 'bearForm', aoe: true },
            demoralizingRoar: { name: '挫志咆哮', damage: 0, rageCost: 10, cooldown: 4, form: 'bearForm', effect: 'debuff_attack' },
            bash: { name: '重击', damage: 1.0, rageCost: 15, cooldown: 5, form: 'bearForm', effect: 'stun' },
            growl: { name: '低吼', damage: 0, rageCost: 5, cooldown: 3, form: 'bearForm', effect: 'taunt' },
            frenziedRegeneration: { name: '狂暴回复', heal: 1.5, rageCost: 25, cooldown: 4, form: 'bearForm', effect: 'self_heal' },

            // 猫形态技能
            claw: { name: '爪击', damage: 1.3, energyCost: 25, cooldown: 0, form: 'catForm', comboGen: 1 },
            rake: { name: '撕扯', damage: 0.6, energyCost: 30, cooldown: 0, form: 'catForm', comboGen: 1, dot: true },
            rip: { name: '撕碎', damage: 0, energyCost: 30, cooldown: 0, form: 'catForm', comboFinisher: true, dot: true },
            ferociousBite: { name: '凶猛撕咬', damage: 2.0, energyCost: 35, cooldown: 0, form: 'catForm', comboFinisher: true },
            prowl: { name: '潜行', damage: 0, energyCost: 0, cooldown: 6, form: 'catForm', effect: 'stealth' },
            dash: { name: '疾奔', damage: 0, energyCost: 20, cooldown: 5, form: 'catForm', effect: 'dodge_boost' },
            shred: { name: '毁灭', damage: 2.0, energyCost: 40, cooldown: 0, form: 'catForm', comboGen: 1, bonusFromBehind: true }
        },
        
        // 变形配置
        config: {
            instantShift: true,      // 是否瞬发变形
            breakOnCC: true,         // 被控制时是否解除形态
            powerShifting: true,     // 是否支持动力变形（快速切换形态清除debuff）
            furorTalent: 'furor'     // 切换形态时保留资源的天赋
        }
    },

    // 盗贼潜行系统
    stealth: {
        id: 'stealth',
        name: '潜行系统',
        description: '盗贼独有的隐身和潜行攻击机制',

        // 潜行状态配置
        stealthState: {
            visibilityReduction: 1.0,    // 完全隐身
            movementSpeedPenalty: 0.3,    // 移动速度降低30%
            detectionRange: 2,            // 基础检测范围（格子）
            cooldown: 2,                  // 潜行被打断后的冷却时间
            bonuses: {
                critChance: 0.5,          // 潜行攻击暴击加成50%
                comboPointBonus: 1,       // 潜行攻击额外连击点
                damageBonus: 0.2          // 潜行攻击伤害加成20%
            }
        },

        // 潜行专属技能
        stealthOnlySkills: ['cheapShot', 'ambush', 'sap', 'pickpocket'],

        // 检测机制
        detection: {
            levelDifferenceMultiplier: 0.1,  // 每级差距增加10%检测几率
            proximityBonus: 0.2,              // 近距离检测加成
            facingBonus: 0.3,                 // 面向检测加成
            combatPenalty: -0.3               // 战斗中检测惩罚（降低检测几率）
        },

        // 消失机制
        vanish: {
            threatWipe: true,           // 清除仇恨
            forceStealth: true,         // 强制进入潜行
            breakDelay: 0.5,            // 消失后短暂无敌时间
            nextCritGuaranteed: true    // 下次攻击必暴
        }
    },

    // 盗贼毒药系统
    poison: {
        id: 'poison',
        name: '毒药系统',
        description: '盗贼可以涂抹毒药增强武器攻击',

        // 毒药类型
        poisonTypes: {
            deadlyPoison: {
                id: 'deadlyPoison',
                name: '致命毒药',
                emoji: '☠️',
                skillId: 'deadlyPoison',
                procChance: 0.30,
                type: 'dot',
                damageType: 'nature',
                tickDamage: 15,
                duration: 6,
                maxStacks: 5,
                description: '造成自然伤害的持续毒药，可叠加'
            },
            woundPoison: {
                id: 'woundPoison',
                name: '致伤毒药',
                emoji: '💊',
                skillId: 'woundPoison',
                procChance: 0.50,
                type: 'debuff',
                effect: 'healingReduction',
                value: 0.25,
                duration: 4,
                description: '降低目标治疗效果'
            },
            numbingPoison: {
                id: 'numbingPoison',
                name: '麻痹毒药',
                emoji: '🧊',
                skillId: 'numbingPoison',
                procChance: 0.20,
                type: 'debuff',
                effects: [
                    { stat: 'attackSpeed', value: -0.15 },
                    { stat: 'castSpeed', value: -0.30 }
                ],
                duration: 4,
                description: '降低目标攻击和施法速度'
            },
            instantPoison: {
                id: 'instantPoison',
                name: '速效毒药',
                emoji: '⚡',
                procChance: 0.20,
                type: 'instant',
                damageType: 'nature',
                damage: 20,
                description: '攻击时造成即时自然伤害'
            },
            cripplingPoison: {
                id: 'cripplingPoison',
                name: '致残毒药',
                emoji: '🦶',
                procChance: 0.30,
                type: 'debuff',
                effect: 'movementSlow',
                value: 0.50,
                duration: 10,
                description: '降低目标移动速度'
            }
        },

        // 双持毒药配置
        dualWield: {
            mainHand: true,
            offHand: true,
            separatePoisons: true    // 可以为主副手涂抹不同毒药
        },

        // 毒药触发机制
        procMechanics: {
            critBonus: 0.5,          // 暴击时毒药触发率增加50%
            spellDamageBonus: false,  // 毒药伤害不吃法术强度
            attackPowerScaling: 0.1,  // 毒药伤害的10%由攻击强度加成
            refreshOnReapply: true    // 重新应用时刷新持续时间
        }
    },

    // 圣骑士圣印系统
    seal: {
        id: 'seal',
        name: '圣印系统',
        description: '激活圣印为攻击附加神圣效果，审判消耗圣印释放强力一击',

        // 圣印类型
        sealTypes: {
            justice: {
                id: 'justice',
                name: '正义圣印',
                emoji: '⚖️',
                skillId: 'sealOfJustice',
                unlock: 'base',
                duration: 3,
                onHit: {
                    type: 'flat_holy_damage',
                    description: '攻击附加8点圣光伤害',
                    damageType: 'holy',
                    flatDamage: 8
                },
                onJudge: {
                    type: 'burst_damage',
                    description: '造成高额圣光伤害',
                    // 审判基础伤害已在 judgement 技能定义中
                    bonusEffect: null
                }
            },
            light: {
                id: 'light',
                name: '光明圣印',
                emoji: '🌅',
                skillId: 'sealOfLight',
                unlock: 'talent_holy_t2',
                duration: 3,
                onHit: {
                    type: 'lifesteal',
                    description: '攻击吸血15%',
                    lifestealPercent: 0.15
                },
                onJudge: {
                    type: 'burst_damage_and_heal',
                    description: '造成伤害并治疗自身',
                    selfHeal: { base: 30, scaling: 1.2, stat: 'intellect' }
                }
            },
            command: {
                id: 'command',
                name: '命令圣印',
                emoji: '🗡️',
                skillId: 'sealOfCommand',
                unlock: 'talent_retribution_t2',
                duration: 3,
                onHit: {
                    type: 'proc_damage',
                    description: '30%几率造成额外70%圣光伤害',
                    procChance: 0.3,
                    bonusDamagePercent: 0.7,
                    damageType: 'holy'
                },
                onJudge: {
                    type: 'burst_damage_and_stun',
                    description: '造成伤害并眩晕1回合',
                    stunDuration: 1
                }
            }
        },

        // 圣印系统配置
        config: {
            maxActiveSeal: 1,            // 同时只能激活1个圣印
            newSealOverrides: true,      // 新圣印覆盖旧圣印
            judgeConsumes: true,         // 审判消耗圣印
            judgeWithoutSeal: 'half',    // 无圣印审判：伤害减半
            sealEffectType: 'seal'       // 在 effects 系统中的类型标识
        }
    }
};

