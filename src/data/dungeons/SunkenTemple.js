/**
 * 阿塔哈卡神庙（沉没的神庙）副本数据
 * 推荐等级: 50-56
 * BOSS: 阿塔莱守护者/梦游双龙/哈卡之影/伊兰尼库斯/加玛拉[charm]
 */
export const SunkenTemple = {
    id: 'sunken_temple', name: '阿塔哈卡神庙',
    description: '悲伤沼泽深处沉没的古神殿，邪恶的阿塔莱巨魔在此供奉血神哈卡。',
    emoji: '🐲',
    levelRange: { min: 50, max: 56 },
    difficulty: 'normal',
    rewards: { expBase: 450, goldBase: 220, lootTable: ['blueItem', 'epicItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '沉没走廊' },
        { id: 'wave_2', type: 'trash', name: '水淹大厅' },
        { id: 'boss_atal_guardian', type: 'boss', name: '阿塔莱守护者' },
        { id: 'wave_3', type: 'trash', name: '蛇形通道' },
        { id: 'wave_4', type: 'trash', name: '翠绿之厅' },
        { id: 'boss_dreamscythe', type: 'boss', name: '梦游者与噩梦龙' },
        { id: 'wave_5', type: 'trash', name: '阿塔莱祭坛' },
        { id: 'wave_6', type: 'trash', name: '哈卡通道' },
        { id: 'boss_shade_of_hakkar', type: 'boss', name: '哈卡之影' },
        { id: 'wave_7', type: 'trash', name: '龙殿前厅' },
        { id: 'wave_8', type: 'trash', name: '龙殿深处' },
        { id: 'boss_eranikus', type: 'boss', name: '伊兰尼库斯之影' },
        { id: 'boss_jammal', type: 'boss', name: '加玛拉·安' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '沉没走廊', description: '巡逻的阿塔莱巨魔',
        enemies: [
            { id: 'troll_1', name: '阿塔莱巫医', type: 'troll', slot: 1, emoji: '🧟', stats: { hp: 420, damage: 42, armor: 10 }, speed: 45, loot: { exp: 40 },
              skills: [{ id: 'bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 42, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'troll_2', name: '阿塔莱战士', type: 'troll', slot: 2, emoji: '🧟', stats: { hp: 500, damage: 38, armor: 16 }, speed: 50, loot: { exp: 38 },
              skills: [{ id: 'slash', name: '利刃猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 38, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'troll_3', name: '阿塔莱战士', type: 'troll', slot: 3, emoji: '🧟', stats: { hp: 500, damage: 38, armor: 16 }, speed: 50, loot: { exp: 38 },
              skills: [{ id: 'slash', name: '利刃猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 38, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '水淹大厅', description: '沉没区域的水元素',
        enemies: [
            { id: 'water_1', name: '深水元素', type: 'elemental', slot: 1, emoji: '🌊', stats: { hp: 380, damage: 40, armor: 8 }, speed: 55, loot: { exp: 36 },
              skills: [{ id: 'waterbolt', name: '水箭', emoji: '💧', skillType: 'ranged', damageType: 'frost', targetType: 'enemy', range: 'ranged', damage: 40, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'water_2', name: '深水元素', type: 'elemental', slot: 2, emoji: '🌊', stats: { hp: 380, damage: 40, armor: 8 }, speed: 55, loot: { exp: 36 },
              skills: [{ id: 'waterbolt', name: '水箭', emoji: '💧', skillType: 'ranged', damageType: 'frost', targetType: 'enemy', range: 'ranged', damage: 40, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'serpent_1', name: '神殿巨蛇', type: 'serpent', slot: 3, emoji: '🐍', stats: { hp: 350, damage: 35, armor: 6 }, speed: 65, loot: { exp: 32 },
              skills: [{ id: 'bite', name: '毒蛇咬', emoji: '🦷', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 10, duration: 3 }] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '蛇形通道', description: '盘踞的巨蛇和巨魔',
        enemies: [
            { id: 'serpent_2', name: '翠绿巨蛇', type: 'serpent', slot: 1, emoji: '🐍', stats: { hp: 400, damage: 38, armor: 8 }, speed: 60, loot: { exp: 36 },
              skills: [{ id: 'spit', name: '毒液喷射', emoji: '💚', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 38, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'troll_4', name: '阿塔莱祭司', type: 'troll', slot: 2, emoji: '🧟', stats: { hp: 360, damage: 35, armor: 8 }, speed: 50, loot: { exp: 34 },
              skills: [{ id: 'heal', name: '暗影治疗', emoji: '💜', skillType: 'ranged', damageType: 'shadow', targetType: 'ally', range: 'ranged', damage: 0, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'heal', value: 80 }] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '翠绿之厅', description: '被腐化的翠绿龙族',
        enemies: [
            { id: 'drake_1', name: '腐化翠绿幼龙', type: 'dragonkin', slot: 1, emoji: '🐉', stats: { hp: 480, damage: 44, armor: 14 }, speed: 50, loot: { exp: 42 },
              skills: [{ id: 'breath', name: '毒息', emoji: '💨', skillType: 'ranged', damageType: 'nature', targetType: 'front_2', range: 'ranged', damage: 30, cooldown: 2, actionPoints: 1,
                effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 8, duration: 2 }] }] },
            { id: 'drake_2', name: '腐化翠绿幼龙', type: 'dragonkin', slot: 2, emoji: '🐉', stats: { hp: 480, damage: 44, armor: 14 }, speed: 50, loot: { exp: 42 },
              skills: [{ id: 'claw', name: '龙爪', emoji: '🦖', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 44, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '阿塔莱祭坛', description: '祭坛前的护卫',
        enemies: [
            { id: 'guard_1', name: '阿塔莱卫兵', type: 'troll', slot: 1, emoji: '🧟', stats: { hp: 550, damage: 42, armor: 18 }, speed: 45, loot: { exp: 44 },
              skills: [{ id: 'crush', name: '碎骨打击', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 42, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'caster_1', name: '阿塔莱暗影术士', type: 'troll', slot: 2, emoji: '🧟', stats: { hp: 380, damage: 48, armor: 6 }, speed: 50, loot: { exp: 40 },
              skills: [{ id: 'shadow', name: '暗影烈焰', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 48, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'caster_2', name: '阿塔莱暗影术士', type: 'troll', slot: 3, emoji: '🧟', stats: { hp: 380, damage: 48, armor: 6 }, speed: 50, loot: { exp: 40 },
              skills: [{ id: 'shadow', name: '暗影烈焰', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 48, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_6: {
        id: 'wave_6', name: '哈卡通道', description: '通往哈卡之影的通道',
        enemies: [
            { id: 'spirit_1', name: '哈卡信徒', type: 'undead', slot: 1, emoji: '👻', stats: { hp: 440, damage: 45, armor: 10 }, speed: 50, loot: { exp: 42 },
              skills: [{ id: 'drain', name: '灵魂吸取', emoji: '💜', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 35, cooldown: 2, actionPoints: 1,
                effects: [{ type: 'lifesteal', value: 0.5 }] }] },
            { id: 'serpent_3', name: '血毒蛇', type: 'serpent', slot: 2, emoji: '🐍', stats: { hp: 360, damage: 40, armor: 6 }, speed: 70, loot: { exp: 36 },
              skills: [{ id: 'bite', name: '血毒咬', emoji: '🩸', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 32, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'bloodPoison', damageType: 'nature', tickDamage: 12, duration: 3 }] }] },
        ],
    },
    wave_7: {
        id: 'wave_7', name: '龙殿前厅', description: '腐化龙族守卫',
        enemies: [
            { id: 'drake_3', name: '暗影幼龙', type: 'dragonkin', slot: 1, emoji: '🐉', stats: { hp: 520, damage: 46, armor: 16 }, speed: 45, loot: { exp: 46 },
              skills: [{ id: 'breath', name: '暗影吐息', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'front_2', range: 'ranged', damage: 32, cooldown: 2, actionPoints: 1, effects: [] }] },
            { id: 'drake_4', name: '暗影幼龙', type: 'dragonkin', slot: 2, emoji: '🐉', stats: { hp: 520, damage: 46, armor: 16 }, speed: 45, loot: { exp: 46 },
              skills: [{ id: 'claw', name: '暗影爪', emoji: '🦖', skillType: 'melee', damageType: 'shadow', targetType: 'enemy', range: 'melee', damage: 46, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_8: {
        id: 'wave_8', name: '龙殿深处', description: '最深处的巨魔精英',
        enemies: [
            { id: 'elite_1', name: '阿塔莱精英', type: 'troll', slot: 1, emoji: '🧟', stats: { hp: 600, damage: 50, armor: 20 }, speed: 45, loot: { exp: 50 },
              skills: [{ id: 'slash', name: '猛烈斩击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 50, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'caster_3', name: '阿塔莱先知', type: 'troll', slot: 2, emoji: '🧟', stats: { hp: 400, damage: 52, armor: 8 }, speed: 55, loot: { exp: 44 },
              skills: [{ id: 'curse', name: '哈卡诅咒', emoji: '☠️', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 40, cooldown: 2, actionPoints: 1,
                effects: [{ type: 'debuff', name: 'curse', stat: 'armor', value: -10, duration: 3 }] }] },
        ],
    },

    // ========== BOSS 配置 ==========
    boss_atal_guardian: {
        id: 'boss_atal_guardian', name: '阿塔莱守护者', emoji: '🗿',
        description: '守护神殿入口的巨大石像鬼，被暗影魔法驱动。',
        type: 'boss', slot: 1,
        baseStats: { hp: 2200, damage: 55, armor: 22, speed: 40 },
        loot: { exp: 200, gold: 50 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['stone_fist', 'ground_slam'] },
            { hpPercent: 40, actionsPerTurn: 2, damageModifier: 1.3, skills: ['stone_fist', 'ground_slam', 'stone_shield'],
              onEnter: { type: 'buff', name: 'stoneForm', stat: 'armor', value: 15, duration: 99 } },
        ],
        enrage: { turns: 20, damageMultiplier: 2.0, message: '⚠️ 阿塔莱守护者进入狂暴状态！' },
        skills: {
            stone_fist: { id: 'stone_fist', name: '石拳猛击', emoji: '👊', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 55, cooldown: 0, actionPoints: 1, effects: [] },
            ground_slam: { id: 'ground_slam', name: '地面震击', emoji: '🪨', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 30, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1, chance: 0.3 }] },
            stone_shield: { id: 'stone_shield', name: '石盾', emoji: '🛡️', skillType: 'buff', damageType: 'physical', targetType: 'self', range: 'self', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'buff', name: 'stoneShield', stat: 'armor', value: 20, duration: 2 }] },
        },
    },

    boss_dreamscythe: {
        id: 'boss_dreamscythe', name: '梦游者与噩梦龙', emoji: '🐉',
        description: '一对被腐化的翠绿龙族双子，在梦境与噩梦间交替。',
        type: 'boss', slot: 1,
        baseStats: { hp: 2800, damage: 58, armor: 18, speed: 50 },
        loot: { exp: 250, gold: 60 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['dream_breath', 'nightmare_bolt'] },
            { hpPercent: 50, actionsPerTurn: 2, damageModifier: 1.2, skills: ['dream_breath', 'nightmare_bolt', 'sleep_cloud'],
              onEnter: { type: 'message', text: '🐉 梦游者切换到噩梦形态！' } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.0, message: '⚠️ 梦境与噩梦交织爆发！' },
        skills: {
            dream_breath: { id: 'dream_breath', name: '梦境吐息', emoji: '💨', skillType: 'ranged', damageType: 'nature', targetType: 'front_2', range: 'ranged', damage: 40, cooldown: 2, actionPoints: 1,
                effects: [{ type: 'dot', name: 'dreamRot', damageType: 'nature', tickDamage: 10, duration: 2 }] },
            nightmare_bolt: { id: 'nightmare_bolt', name: '噩梦箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 58, cooldown: 0, actionPoints: 1, effects: [] },
            sleep_cloud: { id: 'sleep_cloud', name: '催眠云雾', emoji: '💤', skillType: 'ranged', damageType: 'nature', targetType: 'random_enemy', range: 'ranged', damage: 20, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'sleep', duration: 2, chance: 0.5 }] },
        },
    },

    boss_shade_of_hakkar: {
        id: 'boss_shade_of_hakkar', name: '哈卡之影', emoji: '🐍',
        description: '血神哈卡的虚影投射，拥有恐怖的灵魂吸取能力。',
        type: 'boss', slot: 1,
        baseStats: { hp: 3200, damage: 62, armor: 16, speed: 55 },
        loot: { exp: 280, gold: 70 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['blood_bolt', 'soul_drain'] },
            { hpPercent: 60, actionsPerTurn: 2, damageModifier: 1.2, skills: ['blood_bolt', 'soul_drain', 'blood_nova'] },
            { hpPercent: 25, actionsPerTurn: 2, damageModifier: 1.5, skills: ['blood_bolt', 'soul_drain', 'blood_nova'],
              onEnter: { type: 'buff', name: 'bloodFrenzy', stat: 'damage', value: 20, duration: 99 } },
        ],
        enrage: { turns: 24, damageMultiplier: 2.5, message: '⚠️ 哈卡之影开始吞噬一切灵魂！' },
        skills: {
            blood_bolt: { id: 'blood_bolt', name: '鲜血箭', emoji: '🩸', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 62, cooldown: 0, actionPoints: 1, effects: [] },
            soul_drain: { id: 'soul_drain', name: '灵魂虹吸', emoji: '💜', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 45, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'lifesteal', value: 0.6 }] },
            blood_nova: { id: 'blood_nova', name: '鲜血新星', emoji: '🩸', skillType: 'ranged', damageType: 'shadow', targetType: 'all_enemies', range: 'ranged', damage: 35, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'dot', name: 'bloodCurse', damageType: 'shadow', tickDamage: 12, duration: 3 }] },
        },
    },

    boss_eranikus: {
        id: 'boss_eranikus', name: '伊兰尼库斯之影', emoji: '🐲',
        description: '被噩梦腐化的翠绿巨龙伊兰尼库斯的投影。',
        type: 'boss', slot: 1,
        baseStats: { hp: 3600, damage: 65, armor: 20, speed: 45 },
        loot: { exp: 300, gold: 80 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['shadow_breath', 'tail_sweep'] },
            { hpPercent: 50, actionsPerTurn: 2, damageModifier: 1.3, skills: ['shadow_breath', 'tail_sweep', 'nightmare_scream'],
              onEnter: { type: 'message', text: '🐲 伊兰尼库斯的噩梦之力觉醒！' } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.0, message: '⚠️ 伊兰尼库斯陷入彻底的噩梦！' },
        skills: {
            shadow_breath: { id: 'shadow_breath', name: '暗影吐息', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'front_2', range: 'ranged', damage: 50, cooldown: 2, actionPoints: 1,
                effects: [{ type: 'debuff', name: 'shadowBreath', stat: 'armor', value: -8, duration: 2 }] },
            tail_sweep: { id: 'tail_sweep', name: '尾部横扫', emoji: '🦎', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 40, cooldown: 3, actionPoints: 1, effects: [] },
            nightmare_scream: { id: 'nightmare_scream', name: '噩梦尖啸', emoji: '😱', skillType: 'ranged', damageType: 'shadow', targetType: 'all_enemies', range: 'ranged', damage: 35, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'fear', duration: 1, chance: 0.4 }] },
        },
    },

    boss_jammal: {
        id: 'boss_jammal', name: '加玛拉·安', emoji: '🧙',
        description: '阿塔莱巨魔的大预言者，掌握强大的精神控制魔法。',
        type: 'boss', slot: 1,
        baseStats: { hp: 3000, damage: 60, armor: 14, speed: 55 },
        loot: { exp: 320, gold: 90 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['hex_bolt', 'mind_blast'] },
            { hpPercent: 60, actionsPerTurn: 2, damageModifier: 1.2, skills: ['hex_bolt', 'mind_blast', 'charm'],
              onEnter: { type: 'message', text: '🧙 加玛拉·安释放精神控制之力！' } },
            { hpPercent: 25, actionsPerTurn: 2, damageModifier: 1.5, skills: ['hex_bolt', 'mind_blast', 'charm'],
              onEnter: { type: 'buff', name: 'shadowPower', stat: 'damage', value: 25, duration: 99 } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.5, message: '⚠️ 加玛拉·安呼唤血神哈卡的力量！' },
        skills: {
            hex_bolt: { id: 'hex_bolt', name: '妖术', emoji: '🐸', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 55, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'silence', duration: 1, chance: 0.25 }] },
            mind_blast: { id: 'mind_blast', name: '心灵爆震', emoji: '🧠', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 70, cooldown: 3, actionPoints: 1, effects: [] },
            charm: { id: 'charm', name: '精神控制', emoji: '💫', skillType: 'ranged', damageType: 'shadow', targetType: 'random_enemy', range: 'ranged', damage: 0, cooldown: 6, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'charm', duration: 2, chance: 0.7 }] },
        },
    },

    // ========== 召唤配置 ==========
    summon_configs: {},

    // ========== 辅助方法 ==========
    getEncounter(id) { return this.encounters.find(e => e.id === id) },
    createBossInstance(bossId) {
        const cfg = this[bossId]
        if (!cfg) return null
        return { ...cfg, currentHp: cfg.baseStats.hp, maxHp: cfg.baseStats.hp, currentPhase: 0, turnCount: 0, buffs: [], debuffs: [] }
    },
    createTrashInstance(waveId) {
        const wave = this[waveId]
        if (!wave) return null
        return { ...wave, enemies: wave.enemies.map(e => ({ ...e, currentHp: e.stats.hp, maxHp: e.stats.hp, buffs: [], debuffs: [] })) }
    },
    createSummonInstance(summonId) {
        const cfg = this.summon_configs[summonId]
        if (!cfg) return null
        return { ...cfg, currentHp: cfg.stats.hp, maxHp: cfg.stats.hp, buffs: [], debuffs: [] }
    },
}
