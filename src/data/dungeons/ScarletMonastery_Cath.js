/**
 * 血色修道院 - 大教堂翼
 * 推荐等级: 38-44
 * BOSS: 弗尔席恩/莫格莱尼+怀特迈恩(双BOSS战/resurrect)
 */
export const ScarletMonastery_Cath = {
    id: 'scarlet_monastery_cath', name: '血色修道院·大教堂',
    description: '血色十字军的圣殿，指挥官莫格莱尼与大检察官怀特迈恩在此坐镇。',
    emoji: '⛪',
    levelRange: { min: 38, max: 44 },
    difficulty: 'hard',
    rewards: { expBase: 380, goldBase: 190, lootTable: ['blueItem', 'blueItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '教堂入口' },
        { id: 'wave_2', type: 'trash', name: '祈祷大厅' },
        { id: 'wave_3', type: 'trash', name: '审讯走廊' },
        { id: 'boss_fairbanks', type: 'boss', name: '弗尔席恩' },
        { id: 'wave_4', type: 'trash', name: '大教堂走廊' },
        { id: 'wave_5', type: 'trash', name: '圣光祭坛' },
        { id: 'wave_6', type: 'trash', name: '莫格莱尼的近卫' },
        { id: 'boss_mograine', type: 'boss', name: '指挥官莫格莱尼' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '教堂守卫', description: '大教堂入口巡逻队',
        enemies: [
            { id: 'paladin_1', name: '血色圣骑士', type: 'human', slot: 1, emoji: '✝️', stats: { hp: 250, damage: 28, armor: 14 }, speed: 45, loot: { exp: 30 },
              skills: [
                { id: 'holy_strike', name: '神圣打击', emoji: '✝️', skillType: 'melee', damageType: 'holy', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'lay_hands', name: '圣疗术', emoji: '💚', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 6, actionPoints: 1, effects: [{ type: 'heal', value: 60 }] },
              ] },
            { id: 'crusader_1', name: '血色十字军', type: 'human', slot: 2, emoji: '⚔️', stats: { hp: 230, damage: 26, armor: 12 }, speed: 48, loot: { exp: 28 },
              skills: [{ id: 'strike', name: '十字军打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '祈祷大厅', description: '正在祈祷的牧师和卫兵',
        enemies: [
            { id: 'priest_1', name: '血色牧师', type: 'human', slot: 1, emoji: '✝️', stats: { hp: 180, damage: 22, armor: 4 }, speed: 52, loot: { exp: 26 },
              skills: [
                { id: 'smite', name: '惩击', emoji: '✝️', skillType: 'ranged', damageType: 'holy', targetType: 'enemy', range: 'ranged', damage: 22, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'heal', name: '治疗术', emoji: '💚', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 3, actionPoints: 1, effects: [{ type: 'heal', value: 50 }] },
              ] },
            { id: 'guard_1', name: '血色卫兵', type: 'human', slot: 2, emoji: '⚔️', stats: { hp: 240, damage: 26, armor: 12 }, speed: 45, loot: { exp: 28 },
              skills: [{ id: 'strike', name: '猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'guard_2', name: '血色卫兵', type: 'human', slot: 3, emoji: '⚔️', stats: { hp: 240, damage: 26, armor: 12 }, speed: 45, loot: { exp: 28 },
              skills: [{ id: 'strike', name: '猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '审讯走廊', description: '审讯者和狂热者',
        enemies: [
            { id: 'inquisitor_1', name: '血色审讯者', type: 'human', slot: 1, emoji: '🔥', stats: { hp: 200, damage: 28, armor: 8 }, speed: 52, loot: { exp: 28 },
              skills: [{ id: 'holy_fire', name: '神圣之火', emoji: '🔥', skillType: 'ranged', damageType: 'holy', targetType: 'enemy', range: 'ranged', damage: 24, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'holy_fire', damageType: 'holy', tickDamage: 6, duration: 2 }] }] },
            { id: 'zealot_1', name: '血色狂热者', type: 'human', slot: 2, emoji: '💢', stats: { hp: 220, damage: 30, armor: 10 }, speed: 52, loot: { exp: 28 },
              skills: [{ id: 'frenzy', name: '狂热打击', emoji: '💢', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 30, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '大教堂走廊', description: '通往圣殿的走廊',
        enemies: [
            { id: 'champion_1', name: '血色勇士长', type: 'human', slot: 1, emoji: '⚔️', stats: { hp: 260, damage: 30, armor: 14 }, speed: 48, loot: { exp: 32 },
              skills: [{ id: 'heroic_strike', name: '英勇打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 30, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'champion_2', name: '血色勇士长', type: 'human', slot: 2, emoji: '⚔️', stats: { hp: 260, damage: 30, armor: 14 }, speed: 48, loot: { exp: 32 },
              skills: [{ id: 'heroic_strike', name: '英勇打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 30, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '圣光祭坛', description: '祭坛前的牧师和骑士',
        enemies: [
            { id: 'high_priest', name: '血色高阶牧师', type: 'human', slot: 1, emoji: '✝️', stats: { hp: 200, damage: 26, armor: 6 }, speed: 52, loot: { exp: 30 },
              skills: [
                { id: 'smite', name: '惩击', emoji: '✝️', skillType: 'ranged', damageType: 'holy', targetType: 'enemy', range: 'ranged', damage: 26, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'renew', name: '恢复', emoji: '💚', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 4, actionPoints: 1,
                  effects: [{ type: 'heal', value: 60 }] },
              ] },
            { id: 'knight_1', name: '血色骑士', type: 'human', slot: 2, emoji: '🗡️', stats: { hp: 270, damage: 30, armor: 16 }, speed: 45, loot: { exp: 32 },
              skills: [{ id: 'holy_strike', name: '神圣打击', emoji: '✝️', skillType: 'melee', damageType: 'holy', targetType: 'enemy', range: 'melee', damage: 30, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_6: {
        id: 'wave_6', name: '莫格莱尼近卫', description: '指挥官的贴身卫队',
        enemies: [
            { id: 'elite_knight', name: '血色精锐骑士', type: 'human', slot: 1, emoji: '🗡️', stats: { hp: 300, damage: 32, armor: 16 }, speed: 48, loot: { exp: 36 },
              skills: [
                { id: 'crusader_strike', name: '十字军打击', emoji: '⚔️', skillType: 'melee', damageType: 'holy', targetType: 'enemy', range: 'melee', damage: 32, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'devotion_aura', name: '虔诚光环', emoji: '✨', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                  effects: [{ type: 'buff', name: 'devotion', stat: 'armor', value: 0.3, duration: 3 }] },
              ] },
            { id: 'elite_priest', name: '血色高阶神官', type: 'human', slot: 2, emoji: '✝️', stats: { hp: 200, damage: 24, armor: 6 }, speed: 52, loot: { exp: 30 },
              skills: [
                { id: 'holy_bolt', name: '神圣箭', emoji: '✝️', skillType: 'ranged', damageType: 'holy', targetType: 'enemy', range: 'ranged', damage: 24, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'heal', name: '强效治疗', emoji: '💚', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 3, actionPoints: 1, effects: [{ type: 'heal', value: 70 }] },
              ] },
        ],
    },

    // ========== BOSS ==========

    boss_fairbanks: {
        id: 'fairbanks', name: '审讯员弗尔席恩', type: 'boss', slot: 2, emoji: '😈',
        loot: { exp: 120 },
        baseStats: { hp: 1200, damage: 32, armor: 8 }, speed: 50,
        phases: [
            { id: 1, name: '堕落审讯员', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['curse', 'vampiric_touch', 'fear', 'shadow_bolt'] },
        ],
        enrage: { triggerRound: 14, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'shadow', message: '😈 黑暗力量吞噬一切！' }, message: '😈 弗尔席恩释放了被压抑的邪恶！' },
        skills: {
            curse: { id: 'curse', name: '诅咒', emoji: '💀', description: '降低全属性', skillType: 'debuff', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'debuff', name: 'curse', stat: 'damage', value: -0.2, duration: 3 }] },
            vampiric_touch: { id: 'vampiric_touch', name: '吸血之触', emoji: '🧛', description: '吸取生命', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 28, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'heal', value: 28 }] },
            fear: { id: 'fear', name: '恐惧', emoji: '😱', skillType: 'debuff', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'fear', duration: 1 }] },
            shadow_bolt: { id: 'shadow_bolt', name: '暗影箭', emoji: '🟣', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 32, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },

    // 莫格莱尼+怀特迈恩 双BOSS战
    // 等级44: baseDamage=2200, difficultyMultiplier=0.75, finalDamage=1650
    // P1: 莫格莱尼独战
    // P2: 莫格莱尼倒下(isDown)，怀特迈恩出场
    // P3: 怀特迈恩复活莫格莱尼(resurrect)，双BOSS同时行动
    boss_mograine: {
        id: 'mograine', name: '指挥官莫格莱尼', type: 'boss', slot: 2, emoji: '⚔️',
        loot: { exp: 180 },
        baseStats: { hp: 1600, damage: 1650, armor: 18 }, speed: 50,
        phases: [
            { id: 1, name: '圣光指挥官', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['crusader_strike', 'holy_shield', 'divine_smite'] },
            { id: 2, name: '倒下', hpThreshold: 0.0, actionsPerTurn: 0, damageModifier: 0,
              skills: [],
              onEnter: { type: 'summon', message: '✝️ 莫格莱尼倒下了...怀特迈恩从圣殿深处走出！',
                summonId: 'summon_whitemane', count: 1 } },
        ],
        enrage: { triggerRound: 18, damageModifier: 2.0, aoePerRound: { damage: 45, type: 'holy', message: '⚔️ 圣光裁决！' }, message: '⚔️ 莫格莱尼的力量达到极限！' },
        skills: {
            crusader_strike: { id: 'crusader_strike', name: '十字军打击', emoji: '⚔️', skillType: 'melee', damageType: 'holy', targetType: 'enemy', range: 'melee', damage: 45, cooldown: 0, actionPoints: 1, effects: [] },
            holy_shield: { id: 'holy_shield', name: '圣光护盾', emoji: '🛡️', description: '圣光护盾吸收伤害', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'buff', name: 'holy_shield', stat: 'shield', value: 150, duration: 2 }] },
            divine_smite: { id: 'divine_smite', name: '神圣惩击', emoji: '✝️', skillType: 'spell', damageType: 'holy', targetType: 'front_2', range: 'ranged', damage: 35, cooldown: 3, actionPoints: 1, effects: [] },
        },
    },

    // 怀特迈恩 - 作为召唤物出场
    summon_whitemane: {
        id: 'whitemane', name: '大检察官怀特迈恩', type: 'add', emoji: '✝️',
        stats: { hp: 1200, damage: 30, armor: 6 }, speed: 55,
        skills: [
            { id: 'heal', name: '治疗术', emoji: '💚', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 3, actionPoints: 1, effects: [{ type: 'heal', value: 80 }] },
            { id: 'smite', name: '惩击', emoji: '✝️', skillType: 'ranged', damageType: 'holy', targetType: 'enemy', range: 'ranged', damage: 30, cooldown: 0, actionPoints: 1, effects: [] },
            { id: 'resurrect', name: '复活术', emoji: '💫', description: '蓄力后复活莫格莱尼', skillType: 'spell', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 99, actionPoints: 1,
              effects: [{ type: 'telegraph', chargeRounds: 2, message: '✝️ 怀特迈恩开始吟唱复活术...' },
                        { type: 'resurrect', targetId: 'mograine', hpPercent: 1.0, message: '✝️ 以圣光之名，起来吧，我的勇士！' }] },
        ],
    },

    // ========== 辅助方法 ==========
    getEncounter(encounterId) { return this[encounterId] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(bossEncounterId) {
        const key = bossEncounterId || 'boss_fairbanks'
        const b = this[key]; if (!b) return null
        return { id: b.id, name: b.name, type: b.type, isBoss: true, slot: b.slot, emoji: b.emoji,
            currentHp: b.baseStats.hp, maxHp: b.baseStats.hp, damage: b.baseStats.damage, armor: b.baseStats.armor,
            speed: b.speed, phases: b.phases, enrage: b.enrage, skillData: b.skills, loot: b.loot || { exp: 0 } }
    },
    createTrashInstance(waveId) {
        const w = this[waveId]; if (!w) return []
        return w.enemies.map(e => ({ id: e.id, name: e.name, type: e.type, slot: e.slot, emoji: e.emoji,
            currentHp: e.stats.hp, maxHp: e.stats.hp, damage: e.stats.damage, armor: e.stats.armor,
            speed: e.speed, skills: e.skills, loot: e.loot || { exp: 0 } }))
    },
    createSummonInstance(summonId, slot) {
        const c = this[summonId]; if (!c) return null
        return { id: `${c.id}_${Date.now()}`, name: c.name, type: c.type, slot: slot || c.slot || 3, emoji: c.emoji,
            currentHp: c.stats.hp, maxHp: c.stats.hp, damage: c.stats.damage, armor: c.stats.armor,
            speed: c.speed, skills: c.skills }
    },
}
