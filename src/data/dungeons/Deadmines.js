/**
 * 死亡矿井副本数据
 * 
 * 推荐等级: 17-26
 * 难度: 普通
 * BOSS: 采矿傀儡/斯奈德/基尔尼格/斯莫特先生/范克里夫
 */
export const Deadmines = {
    id: 'deadmines',
    name: '死亡矿井',
    description: '迪菲亚兄弟会在西部荒野矿洞中的秘密基地。',
    emoji: '⛏️',
    levelRange: { min: 17, max: 26 },
    difficulty: 'normal',
    rewards: { expBase: 180, goldBase: 90, lootTable: ['greenItem', 'blueItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '矿道入口' },
        { id: 'wave_2', type: 'trash', name: '矿工帮众' },
        { id: 'boss_rhahkzor', type: 'boss', name: '采矿傀儡' },
        { id: 'wave_3', type: 'trash', name: '伐木场' },
        { id: 'wave_4', type: 'trash', name: '机械车间' },
        { id: 'boss_sneed', type: 'boss', name: '斯奈德的伐木机' },
        { id: 'wave_5', type: 'trash', name: '熔炉通道' },
        { id: 'wave_6', type: 'trash', name: '铸造间' },
        { id: 'boss_gilnid', type: 'boss', name: '基尔尼格' },
        { id: 'wave_7', type: 'trash', name: '船坞甲板' },
        { id: 'wave_8', type: 'trash', name: '迪菲亚水手' },
        { id: 'boss_smite', type: 'boss', name: '斯莫特先生' },
        { id: 'wave_9', type: 'trash', name: '船长室守卫' },
        { id: 'wave_10', type: 'trash', name: '精英护卫' },
        { id: 'boss_vancleef', type: 'boss', name: '范克里夫' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '矿道入口', description: '迪菲亚帮众',
        enemies: [
            { id: 'miner_1', name: '迪菲亚矿工', type: 'humanoid', slot: 1, emoji: '⛏️',
              stats: { hp: 110, damage: 14, armor: 4 }, speed: 50, loot: { exp: 14 },
              skills: [{ id: 'pick_strike', name: '镐击', emoji: '⛏️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 14, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'miner_2', name: '迪菲亚矿工', type: 'humanoid', slot: 2, emoji: '⛏️',
              stats: { hp: 110, damage: 14, armor: 4 }, speed: 50, loot: { exp: 14 },
              skills: [{ id: 'pick_strike', name: '镐击', emoji: '⛏️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 14, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'thug_1', name: '迪菲亚暴徒', type: 'humanoid', slot: 3, emoji: '🔪',
              stats: { hp: 90, damage: 16, armor: 3 }, speed: 60, loot: { exp: 12 },
              skills: [{ id: 'stab', name: '刺击', emoji: '🔪', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 16, cooldown: 0, actionPoints: 1, effects: [] }]
            },
        ]
    },
    wave_2: {
        id: 'wave_2', name: '矿工帮众', description: '更多矿洞深处的帮众',
        enemies: [
            { id: 'elf_1', name: '迪菲亚法师', type: 'humanoid', slot: 1, emoji: '🧙',
              stats: { hp: 85, damage: 16, armor: 2 }, speed: 55, loot: { exp: 15 },
              skills: [{ id: 'frost_bolt', name: '寒冰箭', emoji: '❄️', skillType: 'ranged', damageType: 'frost', targetType: 'enemy', range: 'ranged', damage: 16, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'thug_2', name: '迪菲亚暴徒', type: 'humanoid', slot: 2, emoji: '🔪',
              stats: { hp: 95, damage: 15, armor: 3 }, speed: 60, loot: { exp: 13 },
              skills: [{ id: 'stab', name: '刺击', emoji: '🔪', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 15, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'thug_3', name: '迪菲亚暴徒', type: 'humanoid', slot: 3, emoji: '🔪',
              stats: { hp: 95, damage: 15, armor: 3 }, speed: 60, loot: { exp: 13 },
              skills: [{ id: 'stab', name: '刺击', emoji: '🔪', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 15, cooldown: 0, actionPoints: 1, effects: [] }]
            },
        ]
    },
    wave_3: {
        id: 'wave_3', name: '伐木场', description: '伐木工和工头',
        enemies: [
            { id: 'lumber_1', name: '迪菲亚伐木工', type: 'humanoid', slot: 1, emoji: '🪓',
              stats: { hp: 120, damage: 17, armor: 5 }, speed: 45, loot: { exp: 15 },
              skills: [{ id: 'chop', name: '劈砍', emoji: '🪓', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 17, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'lumber_2', name: '迪菲亚伐木工', type: 'humanoid', slot: 2, emoji: '🪓',
              stats: { hp: 120, damage: 17, armor: 5 }, speed: 45, loot: { exp: 15 },
              skills: [{ id: 'chop', name: '劈砍', emoji: '🪓', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 17, cooldown: 0, actionPoints: 1, effects: [] }]
            },
        ]
    },
    wave_4: {
        id: 'wave_4', name: '机械车间', description: '机械傀儡守卫',
        enemies: [
            { id: 'golem_1', name: '采矿机器人', type: 'mechanical', slot: 1, emoji: '🤖',
              stats: { hp: 140, damage: 15, armor: 10 }, speed: 35, loot: { exp: 16 },
              skills: [{ id: 'slam', name: '碾压', emoji: '🤖', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'engineer_1', name: '迪菲亚工程师', type: 'humanoid', slot: 2, emoji: '🔧',
              stats: { hp: 90, damage: 14, armor: 3 }, speed: 55, loot: { exp: 14 },
              skills: [{ id: 'bomb', name: '炸弹投掷', emoji: '💣', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 18, cooldown: 3, actionPoints: 1, effects: [] }]
            },
        ]
    },
    wave_5: {
        id: 'wave_5', name: '熔炉通道', description: '高温通道的守卫',
        enemies: [
            { id: 'smelter_1', name: '迪菲亚冶炼工', type: 'humanoid', slot: 1, emoji: '🔥',
              stats: { hp: 100, damage: 16, armor: 4 }, speed: 50, loot: { exp: 14 },
              skills: [{ id: 'molten_splash', name: '熔铜飞溅', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'front_2', range: 'melee', damage: 12, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'smelter_2', name: '迪菲亚冶炼工', type: 'humanoid', slot: 2, emoji: '🔥',
              stats: { hp: 100, damage: 16, armor: 4 }, speed: 50, loot: { exp: 14 },
              skills: [{ id: 'molten_splash', name: '熔铜飞溅', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'front_2', range: 'melee', damage: 12, cooldown: 0, actionPoints: 1, effects: [] }]
            },
        ]
    },
    wave_6: {
        id: 'wave_6', name: '铸造间', description: '锻造工人',
        enemies: [
            { id: 'smith_1', name: '迪菲亚铁匠', type: 'humanoid', slot: 1, emoji: '🔨',
              stats: { hp: 130, damage: 18, armor: 8 }, speed: 45, loot: { exp: 16 },
              skills: [{ id: 'hammer_strike', name: '锤击', emoji: '🔨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'thug_4', name: '迪菲亚保镖', type: 'humanoid', slot: 2, emoji: '💪',
              stats: { hp: 105, damage: 16, armor: 5 }, speed: 55, loot: { exp: 14 },
              skills: [{ id: 'punch', name: '重拳', emoji: '👊', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 16, cooldown: 0, actionPoints: 1, effects: [] }]
            },
        ]
    },
    wave_7: {
        id: 'wave_7', name: '船坞甲板', description: '船上的水手',
        enemies: [
            { id: 'pirate_1', name: '迪菲亚海盗', type: 'humanoid', slot: 1, emoji: '🏴‍☠️',
              stats: { hp: 105, damage: 17, armor: 4 }, speed: 60, loot: { exp: 15 },
              skills: [{ id: 'cutlass', name: '弯刀斩', emoji: '🗡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 17, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'pirate_2', name: '迪菲亚海盗', type: 'humanoid', slot: 2, emoji: '🏴‍☠️',
              stats: { hp: 105, damage: 17, armor: 4 }, speed: 60, loot: { exp: 15 },
              skills: [{ id: 'cutlass', name: '弯刀斩', emoji: '🗡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 17, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'gunner_1', name: '迪菲亚炮手', type: 'humanoid', slot: 3, emoji: '💣',
              stats: { hp: 80, damage: 20, armor: 2 }, speed: 45, loot: { exp: 14 },
              skills: [{ id: 'cannon', name: '火炮射击', emoji: '💣', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 22, cooldown: 2, actionPoints: 1, effects: [] }]
            },
        ]
    },
    wave_8: {
        id: 'wave_8', name: '迪菲亚水手', description: '精锐水手',
        enemies: [
            { id: 'sailor_1', name: '迪菲亚精锐', type: 'humanoid', slot: 1, emoji: '⚓',
              stats: { hp: 115, damage: 18, armor: 5 }, speed: 55, loot: { exp: 16 },
              skills: [{ id: 'slash', name: '斩击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'sailor_2', name: '迪菲亚精锐', type: 'humanoid', slot: 2, emoji: '⚓',
              stats: { hp: 115, damage: 18, armor: 5 }, speed: 55, loot: { exp: 16 },
              skills: [{ id: 'slash', name: '斩击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }]
            },
        ]
    },
    wave_9: {
        id: 'wave_9', name: '船长室守卫', description: '船长室门前的守卫',
        enemies: [
            { id: 'guard_1', name: '迪菲亚卫兵', type: 'humanoid', slot: 1, emoji: '💂',
              stats: { hp: 130, damage: 19, armor: 7 }, speed: 50, loot: { exp: 17 },
              skills: [{ id: 'guard_strike', name: '防卫打击', emoji: '🛡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 19, cooldown: 0, actionPoints: 1, effects: [] }]
            },
            { id: 'assassin_1', name: '迪菲亚刺客', type: 'humanoid', slot: 2, emoji: '🗡️',
              stats: { hp: 90, damage: 22, armor: 3 }, speed: 70, loot: { exp: 16 },
              skills: [{ id: 'backstab', name: '背刺', emoji: '🗡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }]
            },
        ]
    },
    wave_10: {
        id: 'wave_10', name: '精英护卫', description: '范克里夫的近卫',
        enemies: [
            { id: 'elite_1', name: '迪菲亚精英护卫', type: 'humanoid', slot: 1, emoji: '⚔️',
              stats: { hp: 140, damage: 20, armor: 8 }, speed: 55, loot: { exp: 18 },
              skills: [
                { id: 'heavy_slash', name: '重斩', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'shield_block', name: '盾挡', emoji: '🛡️', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 4, actionPoints: 1, effects: [{ type: 'buff', name: 'shield', stat: 'armor', value: 10, duration: 2 }] }
              ]
            },
            { id: 'elite_2', name: '迪菲亚精英护卫', type: 'humanoid', slot: 2, emoji: '⚔️',
              stats: { hp: 140, damage: 20, armor: 8 }, speed: 55, loot: { exp: 18 },
              skills: [{ id: 'heavy_slash', name: '重斩', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }]
            },
        ]
    },

    // ========== BOSS: 采矿傀儡 ==========
    // 等级26: baseDamage=1300, difficultyMultiplier=0.5, finalDamage=650
    boss_rhahkzor: {
        id: 'rhahkzor', name: '采矿傀儡', type: 'boss', slot: 2, emoji: '🤖',
        loot: { exp: 60 },
        baseStats: { hp: 600, damage: 650, armor: 12 },
        speed: 40,
        phases: [
            { id: 1, name: '重型机械', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['thunder_cleave', 'ground_slam'] },
        ],
        enrage: { triggerRound: 12, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'physical', message: '💀 采矿傀儡失控地砸向地面！' }, message: '💀 采矿傀儡狂暴了！' },
        skills: {
            thunder_cleave: { id: 'thunder_cleave', name: '雷霆劈砍', emoji: '⚡', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] },
            ground_slam: { id: 'ground_slam', name: '地面砸击', emoji: '💥', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 40, cooldown: 0, actionPoints: 1, effects: [],
                telegraph: { chargeRounds: 1, chargeMessage: '⚠️ 采矿傀儡举起巨斧准备砸击！', releaseMessage: '💥 采矿傀儡猛砸地面！', warningIcon: '⚠️' }
            },
        },
    },

    // ========== BOSS: 斯奈德的伐木机 ==========
    // 等级26: baseDamage=1300, difficultyMultiplier=0.5, finalDamage=650
    boss_sneed: {
        id: 'sneed_shredder', name: '斯奈德的伐木机', type: 'boss', slot: 2, emoji: '🤖',
        loot: { exp: 70 },
        baseStats: { hp: 700, damage: 650, armor: 15 },
        speed: 45,
        phases: [
            { id: 1, name: '伐木机', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['saw_blade', 'eject_parts'] },
            { id: 2, name: '斯奈德本体', hpThreshold: 0.01, actionsPerTurn: 2, damageModifier: 1.2, skills: ['dismantle', 'throw_parts'],
              onEnter: { type: 'transform', message: '💥 伐木机爆炸了！斯奈德从残骸中跳出！' }
            },
        ],
        enrage: { triggerRound: 14, damageModifier: 2.0, aoePerRound: { damage: 25, type: 'physical', message: '💀 斯奈德疯狂攻击！' }, message: '💀 斯奈德狂暴了！' },
        skills: {
            saw_blade: { id: 'saw_blade', name: '锯刃', emoji: '🪚', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] },
            eject_parts: { id: 'eject_parts', name: '喷射零件', emoji: '⚙️', skillType: 'ranged', damageType: 'physical', targetType: 'front_2', range: 'ranged', damage: 18, cooldown: 2, actionPoints: 1, effects: [{ type: 'debuff', name: 'armor_break', stat: 'armor', value: -3, duration: 2 }] },
            dismantle: { id: 'dismantle', name: '拆解', emoji: '🔧', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 35, cooldown: 0, actionPoints: 1, effects: [] },
            throw_parts: { id: 'throw_parts', name: '丢弃零件', emoji: '💥', skillType: 'ranged', damageType: 'physical', targetType: 'front_2', range: 'ranged', damage: 20, cooldown: 2, actionPoints: 1, effects: [{ type: 'debuff', name: 'armor_break', stat: 'armor', value: -4, duration: 2 }] },
        },
    },

    // ========== BOSS: 基尔尼格 ==========
    // 等级26: baseDamage=1300, difficultyMultiplier=0.5, finalDamage=650
    boss_gilnid: {
        id: 'gilnid', name: '基尔尼格', type: 'boss', slot: 2, emoji: '🔥',
        loot: { exp: 75 },
        baseStats: { hp: 750, damage: 650, armor: 8 },
        speed: 50,
        phases: [
            { id: 1, name: '熔炉大师', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['molten_metal', 'fire_blast'] },
            { id: 2, name: '过热', hpThreshold: 0.5, actionsPerTurn: 2, damageModifier: 1.2, skills: ['molten_metal', 'fire_blast'],
              onEnter: { type: 'summon', summonId: 'molten_elemental', slot: 4, message: '🔥 基尔尼格召唤了熔岩元素！' }
            },
        ],
        enrage: { triggerRound: 14, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'fire', message: '🔥 熔炉过热，岩浆四溅！' }, message: '💀 基尔尼格狂暴了！' },
        skills: {
            molten_metal: { id: 'molten_metal', name: '熔铜浇灌', emoji: '🔥', skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 15, cooldown: 0, actionPoints: 1, effects: [{ type: 'dot', name: 'molten_copper', damageType: 'fire', tickDamage: 8, duration: 3 }] },
            fire_blast: { id: 'fire_blast', name: '灼热冲击', emoji: '💥', skillType: 'spell', damageType: 'fire', targetType: 'front_2', range: 'ranged', damage: 22, cooldown: 2, actionPoints: 1, effects: [] },
        },
    },
    molten_elemental: {
        id: 'molten_elemental', name: '熔岩元素', type: 'add', emoji: '🌋',
        stats: { hp: 200, damage: 15, armor: 5 }, speed: 40,
        skills: [{ id: 'magma_bolt', name: '熔岩弹', damage: 15, damageType: 'fire', targetType: 'single' }],
    },

    // ========== BOSS: 斯莫特先生（3 阶段换武器）==========
    // 等级26: baseDamage=1300, difficultyMultiplier=0.5, finalDamage=650
    boss_smite: {
        id: 'mr_smite', name: '斯莫特先生', type: 'boss', slot: 2, emoji: '💪',
        loot: { exp: 85 },
        baseStats: { hp: 900, damage: 650, armor: 12 },
        speed: 55,
        phases: [
            { id: 1, name: '双斧', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['axe_slash', 'stomp'] },
            { id: 2, name: '大锤', hpThreshold: 0.66, actionsPerTurn: 2, damageModifier: 1.1, skills: ['hammer_slam', 'ground_pound'],
              onEnter: { type: 'transform', message: '⚡ 斯莫特先生切换到大锤！"你以为你赢了？"' }
            },
            { id: 3, name: '双剑', hpThreshold: 0.33, actionsPerTurn: 3, damageModifier: 1.2, skills: ['dual_slash', 'whirlwind'],
              onEnter: { type: 'transform', message: '⚡ 斯莫特先生拔出双剑！"让你见识真正的力量！"' }
            },
        ],
        enrage: { triggerRound: 15, damageModifier: 2.0, aoePerRound: { damage: 35, type: 'physical', message: '💀 斯莫特先生疯狂挥舞武器！' }, message: '💀 斯莫特先生狂暴了！' },
        skills: {
            axe_slash: { id: 'axe_slash', name: '斧劈', emoji: '🪓', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 30, cooldown: 0, actionPoints: 1, effects: [] },
            stomp: { id: 'stomp', name: '践踏', emoji: '🦶', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 15, cooldown: 3, actionPoints: 1, effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] },
            hammer_slam: { id: 'hammer_slam', name: '锤击', emoji: '🔨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 38, cooldown: 0, actionPoints: 1, effects: [] },
            ground_pound: { id: 'ground_pound', name: '震击', emoji: '💥', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 25, cooldown: 2, actionPoints: 1, effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] },
            dual_slash: { id: 'dual_slash', name: '双刃斩', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] },
            whirlwind: { id: 'whirlwind', name: '旋风斩', emoji: '🌀', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 22, cooldown: 3, actionPoints: 1, effects: [] },
        },
    },

    // ========== BOSS: 范克里夫 ==========
    // 等级26: baseDamage=1300, difficultyMultiplier=0.5, finalDamage=650
    boss_vancleef: {
        id: 'vancleef', name: '艾德温·范克里夫', type: 'boss', slot: 2, emoji: '🏴‍☠️',
        loot: { exp: 100 },
        baseStats: { hp: 1100, damage: 650, armor: 10 },
        speed: 65,
        phases: [
            { id: 1, name: '暗影之刃', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['ambush', 'poison_blade'] },
            { id: 2, name: '绝境反击', hpThreshold: 0.3, actionsPerTurn: 3, damageModifier: 1.4, skills: ['ambush', 'poison_blade'],
              onEnter: { type: 'summon', summonId: 'defias_guard', slot: 4, message: '🏴‍☠️ "兄弟会绝不会倒下！来人！"' }
            },
        ],
        enrage: { triggerRound: 16, damageModifier: 2.0, aoePerRound: { damage: 40, type: 'physical', message: '💀 范克里夫发动致命连击！' }, message: '💀 范克里夫狂暴了！' },
        skills: {
            ambush: { id: 'ambush', name: '偷袭', emoji: '🗡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 45, cooldown: 0, actionPoints: 1, effects: [],
                telegraph: { chargeRounds: 1, chargeMessage: '⚠️ 范克里夫消失在阴影中...', releaseMessage: '🗡️ 范克里夫从暗处发动偷袭！', warningIcon: '👤' }
            },
            poison_blade: { id: 'poison_blade', name: '毒刃', emoji: '🐍', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 8, duration: 3 }] },
        },
    },
    defias_guard: {
        id: 'defias_guard', name: '迪菲亚护卫', type: 'add', emoji: '⚔️',
        stats: { hp: 250, damage: 18, armor: 6 }, speed: 55,
        skills: [{ id: 'slash', name: '斩击', damage: 18, damageType: 'physical', targetType: 'single' }],
    },

    // ========== 辅助方法 ==========
    getEncounter(encounterId) { return this[encounterId] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(bossEncounterId) {
        const key = bossEncounterId || 'boss_rhahkzor'
        const bc = this[key]
        if (!bc) return null
        return { id: bc.id, name: bc.name, type: bc.type, isBoss: true, slot: bc.slot, emoji: bc.emoji, currentHp: bc.baseStats.hp, maxHp: bc.baseStats.hp, damage: bc.baseStats.damage, armor: bc.baseStats.armor, speed: bc.speed, phases: bc.phases, enrage: bc.enrage, skillData: bc.skills, loot: bc.loot || { exp: 0 } }
    },
    createTrashInstance(waveId) {
        const w = this[waveId]; if (!w) return []
        return w.enemies.map(e => ({ id: e.id, name: e.name, type: e.type, slot: e.slot, emoji: e.emoji, currentHp: e.stats.hp, maxHp: e.stats.hp, damage: e.stats.damage, armor: e.stats.armor, speed: e.speed, skills: e.skills, loot: e.loot || { exp: 0 } }))
    },
    createSummonInstance(summonId, slot) {
        const c = this[summonId]; if (!c) return null
        return { id: `${c.id}_${Date.now()}`, name: c.name, type: c.type, slot: slot || c.slot || 3, emoji: c.emoji, currentHp: c.stats.hp, maxHp: c.stats.hp, damage: c.stats.damage, armor: c.stats.armor, speed: c.speed, skills: c.skills }
    },
}
