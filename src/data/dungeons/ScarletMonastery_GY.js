/**
 * 血色修道院 - 墓地翼
 * 推荐等级: 28-38
 * BOSS: 血色审讯官
 */
export const ScarletMonastery_GY = {
    id: 'scarlet_monastery_gy', name: '血色修道院·墓地',
    description: '修道院墓地被亡灵占据，血色十字军在此与不死族作战。',
    emoji: '⚰️',
    levelRange: { min: 28, max: 38 },
    difficulty: 'normal',
    rewards: { expBase: 220, goldBase: 110, lootTable: ['greenItem', 'blueItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '墓地入口' },
        { id: 'wave_2', type: 'trash', name: '坟墓通道' },
        { id: 'wave_3', type: 'trash', name: '亡灵聚集地' },
        { id: 'wave_4', type: 'trash', name: '审讯室走廊' },
        { id: 'boss_thalnos', type: 'boss', name: '血色审讯官' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '墓地守卫', description: '血色十字军士兵',
        enemies: [
            { id: 'crusader_1', name: '血色守卫', type: 'human', slot: 1, emoji: '⚔️', stats: { hp: 180, damage: 22, armor: 10 }, speed: 48, loot: { exp: 20 },
              skills: [{ id: 'strike', name: '正义打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'crusader_2', name: '血色守卫', type: 'human', slot: 2, emoji: '⚔️', stats: { hp: 180, damage: 22, armor: 10 }, speed: 48, loot: { exp: 20 },
              skills: [{ id: 'strike', name: '正义打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '坟墓守卫', description: '亡灵与骷髅',
        enemies: [
            { id: 'undead_1', name: '复活食尸鬼', type: 'undead', slot: 1, emoji: '🧟', stats: { hp: 160, damage: 20, armor: 4 }, speed: 42, loot: { exp: 18 },
              skills: [{ id: 'claw', name: '撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'undead_2', name: '复活食尸鬼', type: 'undead', slot: 2, emoji: '🧟', stats: { hp: 160, damage: 20, armor: 4 }, speed: 42, loot: { exp: 18 },
              skills: [{ id: 'claw', name: '撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'skeleton_1', name: '骷髅法师', type: 'undead', slot: 3, emoji: '💀', stats: { hp: 120, damage: 18, armor: 2 }, speed: 55, loot: { exp: 16 },
              skills: [{ id: 'shadow_bolt', name: '暗影箭', emoji: '🟣', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '精英亡灵', description: '强化的不死族',
        enemies: [
            { id: 'ghoul_elite', name: '暴怒食尸鬼', type: 'undead', slot: 1, emoji: '🧟', stats: { hp: 220, damage: 26, armor: 6 }, speed: 50, loot: { exp: 24 },
              skills: [
                { id: 'frenzy_bite', name: '狂暴撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'howl', name: '嚎叫', emoji: '🔊', skillType: 'debuff', damageType: null, targetType: 'all_enemies', range: 'ranged', damage: 0, cooldown: 4, actionPoints: 1,
                  effects: [{ type: 'debuff', name: 'fear_aura', stat: 'damage', value: -0.15, duration: 2 }] },
              ] },
            { id: 'wraith_1', name: '怨灵', type: 'undead', slot: 2, emoji: '👻', stats: { hp: 140, damage: 22, armor: 0 }, speed: 65, loot: { exp: 20 },
              skills: [{ id: 'soul_drain', name: '灵魂汲取', emoji: '👻', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '审讯室卫兵', description: '审讯官的近侍',
        enemies: [
            { id: 'torturer_1', name: '血色审讯员', type: 'human', slot: 1, emoji: '🔥', stats: { hp: 200, damage: 24, armor: 8 }, speed: 50, loot: { exp: 24 },
              skills: [
                { id: 'fire_lash', name: '火焰鞭笞', emoji: '🔥', skillType: 'melee', damageType: 'fire', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1,
                  effects: [{ type: 'dot', name: 'burn', damageType: 'fire', tickDamage: 6, duration: 2 }] },
              ] },
            { id: 'crusader_3', name: '血色狂热者', type: 'human', slot: 2, emoji: '⚔️', stats: { hp: 190, damage: 24, armor: 10 }, speed: 48, loot: { exp: 22 },
              skills: [{ id: 'zealous_strike', name: '狂热打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },

    // ========== BOSS ==========

    // 等级38: baseDamage=1900, difficultyMultiplier=0.75, finalDamage=1425
    boss_thalnos: {
        id: 'thalnos', name: '血色审讯官', type: 'boss', slot: 2, emoji: '🔥',
        loot: { exp: 120 },
        baseStats: { hp: 1100, damage: 1425, armor: 8 }, speed: 50,
        phases: [
            { id: 1, name: '审讯官', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['flame_shock', 'shadow_bolt', 'soul_drain'] },
        ],
        enrage: { triggerRound: 14, damageModifier: 1.8, aoePerRound: { damage: 28, type: 'fire', message: '🔥 烈焰吞噬一切！' }, message: '🔥 血色审讯官进入狂暴！' },
        skills: {
            flame_shock: { id: 'flame_shock', name: '烈焰震击', emoji: '🔥', skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 22, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'flame_shock', damageType: 'fire', tickDamage: 8, duration: 3 }] },
            shadow_bolt: { id: 'shadow_bolt', name: '暗影箭', emoji: '🟣', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 28, cooldown: 2, actionPoints: 1, effects: [] },
            soul_drain: { id: 'soul_drain', name: '灵魂汲取', emoji: '💜', description: '吸取目标生命恢复自身', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 20, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'heal', value: 20 }] },
        },
    },

    // ========== 辅助方法 ==========
    getEncounter(encounterId) { return this[encounterId] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(bossEncounterId) {
        const key = bossEncounterId || 'boss_thalnos'
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
