/**
 * 暴风城监狱副本数据
 * 推荐等级: 24-32, BOSS: 巴吉尔/德克斯特/卡姆
 */
export const StormwindStockade = {
    id: 'stormwind_stockade', name: '暴风城监狱', description: '暴风城地下监狱，关押着迪菲亚兄弟会和危险罪犯。',
    emoji: '🔒', levelRange: { min: 24, max: 32 }, difficulty: 'normal',
    rewards: { expBase: 200, goldBase: 100, lootTable: ['greenItem', 'blueItem'] },
    encounters: [
        { id: 'wave_1', type: 'trash', name: '监狱入口' }, { id: 'wave_2', type: 'trash', name: '牢房走廊' },
        { id: 'boss_bazil', type: 'boss', name: '巴吉尔·斯瑞德' },
        { id: 'wave_3', type: 'trash', name: '暴动区域' }, { id: 'wave_4', type: 'trash', name: '深层牢房' },
        { id: 'boss_dextren', type: 'boss', name: '德克斯特·沃德' },
        { id: 'wave_5', type: 'trash', name: '监狱长室走廊' }, { id: 'wave_6', type: 'trash', name: '最深处' },
        { id: 'boss_kam', type: 'boss', name: '卡姆·迪普顿' },
    ],
    // 小怪波次
    wave_1: { id: 'wave_1', name: '监狱入口', description: '暴动的囚犯', enemies: [
        { id: 'prisoner_1', name: '暴动囚犯', type: 'humanoid', slot: 1, emoji: '⛓️', stats: { hp: 120, damage: 17, armor: 3 }, speed: 55, loot: { exp: 17 }, skills: [{ id: 'punch', name: '重拳', emoji: '👊', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 17, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'prisoner_2', name: '暴动囚犯', type: 'humanoid', slot: 2, emoji: '⛓️', stats: { hp: 120, damage: 17, armor: 3 }, speed: 55, loot: { exp: 17 }, skills: [{ id: 'punch', name: '重拳', emoji: '👊', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 17, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'prisoner_3', name: '迪菲亚囚犯', type: 'humanoid', slot: 3, emoji: '🔪', stats: { hp: 100, damage: 19, armor: 2 }, speed: 65, loot: { exp: 15 }, skills: [{ id: 'shiv', name: '刺击', emoji: '🔪', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 19, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_2: { id: 'wave_2', name: '牢房走廊', description: '更多囚犯', enemies: [
        { id: 'convict_1', name: '凶残罪犯', type: 'humanoid', slot: 1, emoji: '😡', stats: { hp: 135, damage: 19, armor: 4 }, speed: 55, loot: { exp: 18 }, skills: [{ id: 'slam', name: '猛击', emoji: '💪', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 19, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'convict_2', name: '凶残罪犯', type: 'humanoid', slot: 2, emoji: '😡', stats: { hp: 135, damage: 19, armor: 4 }, speed: 55, loot: { exp: 18 }, skills: [{ id: 'slam', name: '猛击', emoji: '💪', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 19, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_3: { id: 'wave_3', name: '暴动区域', description: '暴动核心', enemies: [
        { id: 'rioter_1', name: '暴动头目', type: 'humanoid', slot: 1, emoji: '🔥', stats: { hp: 150, damage: 20, armor: 5 }, speed: 50, loot: { exp: 20 }, skills: [
            { id: 'strike', name: '猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] },
            { id: 'rally', name: '鼓舞', emoji: '📢', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 4, actionPoints: 1, effects: [{ type: 'buff', name: 'rally', stat: 'damage', value: 0.3, duration: 2 }] },
        ]},
        { id: 'thug_1', name: '监狱暴徒', type: 'humanoid', slot: 2, emoji: '😡', stats: { hp: 120, damage: 18, armor: 3 }, speed: 55, loot: { exp: 17 }, skills: [{ id: 'punch', name: '重拳', emoji: '👊', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'thug_2', name: '监狱暴徒', type: 'humanoid', slot: 3, emoji: '😡', stats: { hp: 120, damage: 18, armor: 3 }, speed: 55, loot: { exp: 17 }, skills: [{ id: 'punch', name: '重拳', emoji: '👊', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_4: { id: 'wave_4', name: '深层牢房', description: '关押重刑犯', enemies: [
        { id: 'heavy_1', name: '重刑犯', type: 'humanoid', slot: 1, emoji: '💀', stats: { hp: 160, damage: 21, armor: 6 }, speed: 45, loot: { exp: 20 }, skills: [{ id: 'crush', name: '碾压', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'heavy_2', name: '重刑犯', type: 'humanoid', slot: 2, emoji: '💀', stats: { hp: 160, damage: 21, armor: 6 }, speed: 45, loot: { exp: 20 }, skills: [{ id: 'crush', name: '碾压', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_5: { id: 'wave_5', name: '监狱长室走廊', description: '精锐守卫', enemies: [
        { id: 'elite_1', name: '迪菲亚精英', type: 'humanoid', slot: 1, emoji: '⚔️', stats: { hp: 145, damage: 20, armor: 7 }, speed: 55, loot: { exp: 20 }, skills: [{ id: 'slash', name: '斩击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'mage_1', name: '迪菲亚法师', type: 'humanoid', slot: 2, emoji: '🧙', stats: { hp: 100, damage: 20, armor: 2 }, speed: 55, loot: { exp: 18 }, skills: [{ id: 'fireball', name: '火球术', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_6: { id: 'wave_6', name: '最深处', description: '卡姆的卫兵', enemies: [
        { id: 'bodyguard_1', name: '卡姆的卫兵', type: 'humanoid', slot: 1, emoji: '🛡️', stats: { hp: 170, damage: 21, armor: 10 }, speed: 45, loot: { exp: 22 }, skills: [
            { id: 'shield_slam', name: '盾击', emoji: '🛡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] },
        ]},
    ]},
    // BOSS
    // 等级32: baseDamage=1600, difficultyMultiplier=0.75, finalDamage=1200
    boss_bazil: {
        id: 'bazil', name: '巴吉尔·斯瑞德', type: 'boss', slot: 2, emoji: '🗡️', loot: { exp: 75 },
        baseStats: { hp: 800, damage: 1200, armor: 6 }, speed: 65,
        phases: [{ id: 1, name: '暗影盗贼', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['backstab', 'crippling_poison', 'smoke_bomb'] }],
        enrage: { triggerRound: 13, damageModifier: 1.8, aoePerRound: { damage: 25, type: 'physical', message: '💀 巴吉尔疯狂攻击！' }, message: '💀 巴吉尔狂暴了！' },
        skills: {
            backstab: { id: 'backstab', name: '背刺', emoji: '🗡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 35, cooldown: 0, actionPoints: 1, effects: [] },
            crippling_poison: { id: 'crippling_poison', name: '致残毒药', emoji: '🐍', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 10, cooldown: 4, actionPoints: 1, effects: [{ type: 'debuff', name: 'cripple', stat: 'speed', value: -20, duration: 2 }] },
            smoke_bomb: { id: 'smoke_bomb', name: '烟雾弹', emoji: '💨', skillType: 'debuff', damageType: null, targetType: 'all_enemies', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1, effects: [{ type: 'debuff', name: 'blind', stat: 'damage', value: -0.25, duration: 2 }] },
        },
    },
    // 等级32: baseDamage=1600, difficultyMultiplier=0.75, finalDamage=1200
    boss_dextren: {
        id: 'dextren', name: '德克斯特·沃德', type: 'boss', slot: 2, emoji: '😱', loot: { exp: 80 },
        baseStats: { hp: 850, damage: 1200, armor: 8 }, speed: 55,
        phases: [{ id: 1, name: '恐惧领主', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['heavy_strike', 'fear', 'howl_of_terror'] }],
        enrage: { triggerRound: 13, damageModifier: 1.8, aoePerRound: { damage: 28, type: 'shadow', message: '😱 恐惧吞噬一切！' }, message: '💀 德克斯特狂暴了！' },
        skills: {
            heavy_strike: { id: 'heavy_strike', name: '重击', emoji: '🔨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 32, cooldown: 0, actionPoints: 1, effects: [] },
            fear: { id: 'fear', name: '恐惧', emoji: '😱', skillType: 'debuff', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 0, cooldown: 4, actionPoints: 1, effects: [{ type: 'cc', ccType: 'fear', duration: 1 }] },
            howl_of_terror: { id: 'howl_of_terror', name: '恐惧嚎叫', emoji: '🌀', skillType: 'debuff', damageType: 'shadow', targetType: 'all_enemies', range: 'ranged', damage: 10, cooldown: 6, actionPoints: 1, effects: [{ type: 'cc', ccType: 'fear', duration: 1 }] },
        },
    },
    // 等级32: baseDamage=1600, difficultyMultiplier=0.75, finalDamage=1200
    boss_kam: {
        id: 'kam', name: '卡姆·迪普顿', type: 'boss', slot: 2, emoji: '🛡️', loot: { exp: 90 },
        baseStats: { hp: 1000, damage: 1200, armor: 16 }, speed: 45,
        phases: [
            { id: 1, name: '防御大师', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['shield_slam', 'shield_wall', 'war_cry'] },
            { id: 2, name: '反击', hpThreshold: 0.35, actionsPerTurn: 3, damageModifier: 1.3, skills: ['shield_slam', 'war_cry'],
              onEnter: { type: 'transform', message: '🔥 卡姆进入反击状态！' } },
        ],
        enrage: { triggerRound: 15, damageModifier: 2.0, aoePerRound: { damage: 30, type: 'physical', message: '💀 卡姆疯狂盾击！' }, message: '💀 卡姆狂暴了！' },
        skills: {
            shield_slam: { id: 'shield_slam', name: '盾牌猛击', emoji: '🛡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] },
            shield_wall: { id: 'shield_wall', name: '盾墙', emoji: '🏰', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 6, actionPoints: 1, effects: [{ type: 'buff', name: 'shield_wall', stat: 'armor', value: 20, duration: 2 }] },
            war_cry: { id: 'war_cry', name: '战斗怒吼', emoji: '📢', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1, effects: [{ type: 'buff', name: 'war_cry', stat: 'damage', value: 0.35, duration: 3 }] },
        },
    },
    // 辅助方法
    getEncounter(id) { return this[id] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(key) {
        const bc = this[key || 'boss_bazil']; if (!bc) return null
        return { id: bc.id, name: bc.name, type: bc.type, isBoss: true, slot: bc.slot, emoji: bc.emoji, currentHp: bc.baseStats.hp, maxHp: bc.baseStats.hp, damage: bc.baseStats.damage, armor: bc.baseStats.armor, speed: bc.speed, phases: bc.phases, enrage: bc.enrage, skillData: bc.skills, loot: bc.loot || { exp: 0 } }
    },
    createTrashInstance(waveId) {
        const w = this[waveId]; if (!w) return []
        return w.enemies.map(e => ({ id: e.id, name: e.name, type: e.type, slot: e.slot, emoji: e.emoji, currentHp: e.stats.hp, maxHp: e.stats.hp, damage: e.stats.damage, armor: e.stats.armor, speed: e.speed, skills: e.skills, loot: e.loot || { exp: 0 } }))
    },
    createSummonInstance(summonId, slot) { const c = this[summonId]; if (!c) return null; return { id: `${c.id}_${Date.now()}`, name: c.name, type: c.type, slot: slot || 3, emoji: c.emoji, currentHp: c.stats.hp, maxHp: c.stats.hp, damage: c.stats.damage, armor: c.stats.armor, speed: c.speed, skills: c.skills } },
}
