/**
 * 血色修道院 - 军械库翼
 * 推荐等级: 36-42
 * BOSS: 赫洛德
 */
export const ScarletMonastery_Arm = {
    id: 'scarlet_monastery_arm', name: '血色修道院·军械库',
    description: '存放血色十字军武器装备的军械库，由旋风战士赫洛德把守。',
    emoji: '⚔️',
    levelRange: { min: 36, max: 42 },
    difficulty: 'normal',
    rewards: { expBase: 320, goldBase: 160, lootTable: ['greenItem', 'blueItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '军械库入口' },
        { id: 'wave_2', type: 'trash', name: '武器陈列室' },
        { id: 'wave_3', type: 'trash', name: '训练场' },
        { id: 'wave_4', type: 'trash', name: '赫洛德的竞技场' },
        { id: 'boss_herod', type: 'boss', name: '赫洛德' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '入口守卫', description: '军械库门口的精锐卫兵',
        enemies: [
            { id: 'champion_1', name: '血色勇士', type: 'human', slot: 1, emoji: '⚔️', stats: { hp: 230, damage: 28, armor: 12 }, speed: 48, loot: { exp: 28 },
              skills: [{ id: 'heroic_strike', name: '英勇打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'champion_2', name: '血色勇士', type: 'human', slot: 2, emoji: '⚔️', stats: { hp: 230, damage: 28, armor: 12 }, speed: 48, loot: { exp: 28 },
              skills: [{ id: 'heroic_strike', name: '英勇打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '武器陈列室', description: '巡逻的十字军战士',
        enemies: [
            { id: 'defender_1', name: '血色护卫', type: 'human', slot: 1, emoji: '🛡️', stats: { hp: 260, damage: 24, armor: 16 }, speed: 40, loot: { exp: 28 },
              skills: [
                { id: 'shield_slam', name: '盾牌猛击', emoji: '🛡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'shield_wall', name: '盾墙', emoji: '🛡️', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                  effects: [{ type: 'buff', name: 'shield_wall', stat: 'armor', value: 0.5, duration: 2 }] },
              ] },
            { id: 'berserker_1', name: '血色狂战士', type: 'human', slot: 2, emoji: '💢', stats: { hp: 200, damage: 32, armor: 8 }, speed: 55, loot: { exp: 28 },
              skills: [{ id: 'cleave', name: '顺劈斩', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 24, cooldown: 2, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '训练场卫兵', description: '正在训练的十字军战士',
        enemies: [
            { id: 'trainee_1', name: '血色学徒战士', type: 'human', slot: 1, emoji: '⚔️', stats: { hp: 200, damage: 26, armor: 10 }, speed: 50, loot: { exp: 26 },
              skills: [{ id: 'strike', name: '猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'trainee_2', name: '血色学徒战士', type: 'human', slot: 2, emoji: '⚔️', stats: { hp: 200, damage: 26, armor: 10 }, speed: 50, loot: { exp: 26 },
              skills: [{ id: 'strike', name: '猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'trainee_3', name: '血色学徒战士', type: 'human', slot: 3, emoji: '⚔️', stats: { hp: 200, damage: 26, armor: 10 }, speed: 50, loot: { exp: 26 },
              skills: [{ id: 'strike', name: '猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '竞技场守卫', description: '赫洛德的精锐近卫',
        enemies: [
            { id: 'elite_warrior', name: '血色精英战士', type: 'human', slot: 1, emoji: '💪', stats: { hp: 280, damage: 30, armor: 14 }, speed: 48, loot: { exp: 32 },
              skills: [
                { id: 'mortal_strike', name: '致死打击', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 35, cooldown: 3, actionPoints: 1,
                  effects: [{ type: 'debuff', name: 'mortal_wound', stat: 'heal_reduction', value: -0.5, duration: 3 }] },
                { id: 'strike', name: '猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 30, cooldown: 0, actionPoints: 1, effects: [] },
              ] },
        ],
    },

    // ========== BOSS ==========

    // 等级42: baseDamage=2100, difficultyMultiplier=0.75, finalDamage=1575
    boss_herod: {
        id: 'herod', name: '赫洛德', type: 'boss', slot: 2, emoji: '🌪️',
        loot: { exp: 140 },
        baseStats: { hp: 1400, damage: 1575, armor: 16 }, speed: 50,
        phases: [
            { id: 1, name: '血色斗士', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['whirlwind', 'charge', 'cleave'] },
            { id: 2, name: '狂暴斗士', hpThreshold: 0.3, actionsPerTurn: 3, damageModifier: 1.4, skills: ['whirlwind', 'charge', 'cleave'],
              onEnter: { type: 'buff', message: '🌪️ 赫洛德进入狂暴状态！旋风斩更加频繁！' } },
        ],
        enrage: { triggerRound: 15, damageModifier: 2.0, aoePerRound: { damage: 40, type: 'physical', message: '🌪️ 无尽的旋风斩！' }, message: '🌪️ 赫洛德完全失控！' },
        skills: {
            whirlwind: { id: 'whirlwind', name: '旋风斩', emoji: '🌪️', description: '蓄力后对全体造成高额物理伤害', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 55, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'telegraph', chargeRounds: 1, message: '🌪️ 赫洛德举起巨斧开始旋转...' }] },
            charge: { id: 'charge', name: '冲锋', emoji: '💨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 36, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] },
            cleave: { id: 'cleave', name: '顺劈斩', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 30, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },

    // ========== 辅助方法 ==========
    getEncounter(encounterId) { return this[encounterId] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(bossEncounterId) {
        const key = bossEncounterId || 'boss_herod'
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
