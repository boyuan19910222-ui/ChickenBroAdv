/**
 * 血色修道院 - 图书馆翼
 * 推荐等级: 33-40
 * BOSS: 猎犬统领洛克希/阿鲁安·杜安
 */
export const ScarletMonastery_Lib = {
    id: 'scarlet_monastery_lib', name: '血色修道院·图书馆',
    description: '收藏着大量圣光文献的图书馆，由猎犬统领和大法师守卫。',
    emoji: '📚',
    levelRange: { min: 33, max: 40 },
    difficulty: 'normal',
    rewards: { expBase: 300, goldBase: 150, lootTable: ['greenItem', 'blueItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '图书馆走廊' },
        { id: 'wave_2', type: 'trash', name: '阅览大厅' },
        { id: 'wave_3', type: 'trash', name: '猎犬廊道' },
        { id: 'boss_loksey', type: 'boss', name: '猎犬统领洛克希' },
        { id: 'wave_4', type: 'trash', name: '秘密书房' },
        { id: 'wave_5', type: 'trash', name: '杜安的研究室' },
        { id: 'boss_doan', type: 'boss', name: '阿鲁安·杜安' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '图书馆巡逻', description: '血色十字军巡逻兵',
        enemies: [
            { id: 'adept_1', name: '血色神官', type: 'human', slot: 1, emoji: '✝️', stats: { hp: 180, damage: 22, armor: 6 }, speed: 50, loot: { exp: 24 },
              skills: [
                { id: 'smite', name: '惩击', emoji: '✝️', skillType: 'ranged', damageType: 'holy', targetType: 'enemy', range: 'ranged', damage: 22, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'heal', name: '治疗术', emoji: '💚', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 4, actionPoints: 1, effects: [{ type: 'heal', value: 40 }] },
              ] },
            { id: 'guard_1', name: '血色卫兵', type: 'human', slot: 2, emoji: '⚔️', stats: { hp: 210, damage: 24, armor: 12 }, speed: 45, loot: { exp: 24 },
              skills: [{ id: 'strike', name: '正义打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '阅览大厅', description: '正在研习的十字军成员',
        enemies: [
            { id: 'scholar_1', name: '血色学者', type: 'human', slot: 1, emoji: '📖', stats: { hp: 160, damage: 20, armor: 4 }, speed: 55, loot: { exp: 22 },
              skills: [{ id: 'arcane_bolt', name: '奥术箭', emoji: '💫', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'scholar_2', name: '血色学者', type: 'human', slot: 2, emoji: '📖', stats: { hp: 160, damage: 20, armor: 4 }, speed: 55, loot: { exp: 22 },
              skills: [{ id: 'arcane_bolt', name: '奥术箭', emoji: '💫', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'guard_2', name: '血色护卫', type: 'human', slot: 3, emoji: '🛡️', stats: { hp: 230, damage: 22, armor: 14 }, speed: 40, loot: { exp: 24 },
              skills: [{ id: 'shield_bash', name: '盾击', emoji: '🛡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 2, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '猎犬巡逻', description: '血色猎犬和训练师',
        enemies: [
            { id: 'hound_1', name: '血色猎犬', type: 'beast', slot: 1, emoji: '🐕', stats: { hp: 140, damage: 20, armor: 4 }, speed: 70, loot: { exp: 18 },
              skills: [{ id: 'bite', name: '撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'hound_2', name: '血色猎犬', type: 'beast', slot: 2, emoji: '🐕', stats: { hp: 140, damage: 20, armor: 4 }, speed: 70, loot: { exp: 18 },
              skills: [{ id: 'bite', name: '撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'trainer_1', name: '猎犬训练师', type: 'human', slot: 3, emoji: '🐕‍🦺', stats: { hp: 190, damage: 22, armor: 8 }, speed: 50, loot: { exp: 22 },
              skills: [{ id: 'whip', name: '鞭打', emoji: '🏇', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '秘密书房', description: '守卫珍本的精英卫兵',
        enemies: [
            { id: 'elite_guard', name: '血色精英卫兵', type: 'human', slot: 1, emoji: '⚔️', stats: { hp: 250, damage: 28, armor: 14 }, speed: 45, loot: { exp: 28 },
              skills: [
                { id: 'strike', name: '十字军打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'devotion', name: '虔诚光环', emoji: '✨', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                  effects: [{ type: 'buff', name: 'devotion', stat: 'armor', value: 0.3, duration: 3 }] },
              ] },
            { id: 'mage_1', name: '血色法师', type: 'human', slot: 2, emoji: '🔥', stats: { hp: 160, damage: 26, armor: 4 }, speed: 55, loot: { exp: 26 },
              skills: [{ id: 'fireball', name: '火球术', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 26, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '研究室守卫', description: '杜安的近侍学徒',
        enemies: [
            { id: 'apprentice_1', name: '奥术学徒', type: 'human', slot: 1, emoji: '🧙', stats: { hp: 170, damage: 24, armor: 4 }, speed: 55, loot: { exp: 24 },
              skills: [{ id: 'arcane_blast', name: '奥术冲击', emoji: '💫', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'apprentice_2', name: '奥术学徒', type: 'human', slot: 2, emoji: '🧙', stats: { hp: 170, damage: 24, armor: 4 }, speed: 55, loot: { exp: 24 },
              skills: [{ id: 'arcane_blast', name: '奥术冲击', emoji: '💫', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },

    // ========== BOSS ==========

    // 等级40: baseDamage=2000, difficultyMultiplier=0.75, finalDamage=1500
    boss_loksey: {
        id: 'loksey', name: '猎犬统领洛克希', type: 'boss', slot: 2, emoji: '🐕‍🦺',
        loot: { exp: 110 },
        baseStats: { hp: 1000, damage: 1500, armor: 10 }, speed: 50,
        phases: [
            { id: 1, name: '猎犬统领', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['summon_hounds', 'bloodlust', 'strike'] },
        ],
        enrage: { triggerRound: 14, damageModifier: 1.8, aoePerRound: { damage: 25, type: 'physical', message: '🐕 猎犬群疯狂撕咬！' }, message: '🐕 洛克希狂暴了！' },
        skills: {
            summon_hounds: { id: 'summon_hounds', name: '召唤血色猎犬', emoji: '🐕', description: '召唤猎犬助战', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'summon', summonId: 'summon_scarlet_hound', count: 2 }] },
            bloodlust: { id: 'bloodlust', name: '血性狂乱', emoji: '🔴', description: '提升自身伤害', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'buff', name: 'bloodlust', stat: 'damage', value: 0.3, duration: 2 }] },
            strike: { id: 'strike', name: '鞭打', emoji: '🏇', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 30, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },
    summon_scarlet_hound: {
        id: 'scarlet_hound', name: '血色猎犬', type: 'add', emoji: '🐕',
        stats: { hp: 80, damage: 16, armor: 2 }, speed: 70,
        skills: [{ id: 'bite', name: '撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 16, cooldown: 0, actionPoints: 1, effects: [] }],
    },

    // 等级40: baseDamage=2000, difficultyMultiplier=0.75, finalDamage=1500
    boss_doan: {
        id: 'doan', name: '阿鲁安·杜安', type: 'boss', slot: 2, emoji: '🧙',
        loot: { exp: 130 },
        baseStats: { hp: 1200, damage: 1500, armor: 6 }, speed: 55,
        phases: [
            { id: 1, name: '大法师', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['arcane_explosion', 'silence', 'mana_shield', 'arcane_bolt'] },
        ],
        enrage: { triggerRound: 14, damageModifier: 2.0, aoePerRound: { damage: 35, type: 'arcane', message: '💫 奥术能量爆炸！' }, message: '💫 杜安释放了全部魔力！' },
        skills: {
            arcane_explosion: { id: 'arcane_explosion', name: '奥术爆炸', emoji: '💥', description: '蓄力后全体AOE', skillType: 'spell', damageType: 'arcane', targetType: 'all_enemies', range: 'ranged', damage: 50, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'telegraph', chargeRounds: 1, message: '💫 杜安开始聚集奥术能量...' }] },
            silence: { id: 'silence', name: '沉默', emoji: '🤫', description: '使目标无法施法', skillType: 'debuff', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'silence', duration: 1 }] },
            mana_shield: { id: 'mana_shield', name: '法力护盾', emoji: '🛡️', description: '吸收伤害的护盾', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 6, actionPoints: 1,
                effects: [{ type: 'buff', name: 'mana_shield', stat: 'shield', value: 120, duration: 3 }] },
            arcane_bolt: { id: 'arcane_bolt', name: '奥术飞弹', emoji: '💫', skillType: 'spell', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 34, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },

    // ========== 辅助方法 ==========
    getEncounter(encounterId) { return this[encounterId] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(bossEncounterId) {
        const key = bossEncounterId || 'boss_loksey'
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
