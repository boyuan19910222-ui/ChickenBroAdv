/**
 * 祖尔法拉克副本数据
 * 推荐等级: 44-54
 * BOSS: 安图苏尔/赞达拉尔/乌克兹/首席执行官/加兹瑞拉
 */
export const ZulFarrak = {
    id: 'zulfarrak', name: '祖尔法拉克',
    description: '沙漠中的远古巨魔神殿，水元素首领加兹瑞拉沉睡在此。',
    emoji: '🏜️',
    levelRange: { min: 44, max: 54 },
    difficulty: 'normal',
    rewards: { expBase: 420, goldBase: 210, lootTable: ['blueItem', 'blueItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '神殿入口' },
        { id: 'wave_2', type: 'trash', name: '蜥蜴巢穴' },
        { id: 'boss_antusu', type: 'boss', name: '安图苏尔' },
        { id: 'wave_3', type: 'trash', name: '亡灵通道' },
        { id: 'wave_4', type: 'trash', name: '祭坛广场' },
        { id: 'boss_zandalar', type: 'boss', name: '魔女赞达拉尔' },
        { id: 'wave_5', type: 'trash', name: '竞技场走廊' },
        { id: 'boss_ukorz', type: 'boss', name: '乌克兹·沙顶' },
        { id: 'wave_6', type: 'trash', name: '执行官大厅' },
        { id: 'boss_chief', type: 'boss', name: '首席执行官' },
        { id: 'wave_7', type: 'trash', name: '水池圣殿' },
        { id: 'wave_8', type: 'trash', name: '加兹瑞拉的深渊' },
        { id: 'boss_gahzrilla', type: 'boss', name: '加兹瑞拉' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '巨魔巡逻', description: '沙漠巨魔的入口守卫',
        enemies: [
            { id: 'troll_1', name: '沙怒巨魔', type: 'troll', slot: 1, emoji: '🧌', stats: { hp: 280, damage: 32, armor: 10 }, speed: 50, loot: { exp: 34 },
              skills: [{ id: 'slash', name: '弯刀劈砍', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 32, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'troll_2', name: '沙怒巨魔', type: 'troll', slot: 2, emoji: '🧌', stats: { hp: 280, damage: 32, armor: 10 }, speed: 50, loot: { exp: 34 },
              skills: [{ id: 'slash', name: '弯刀劈砍', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 32, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'caster_1', name: '沙怒术士', type: 'troll', slot: 3, emoji: '🧙', stats: { hp: 200, damage: 28, armor: 4 }, speed: 55, loot: { exp: 30 },
              skills: [{ id: 'shadow_bolt', name: '暗影箭', emoji: '🟣', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 28, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '蜥蜴巢穴', description: '蝎子和蜥蜴',
        enemies: [
            { id: 'scorpion_1', name: '沙漠蝎子', type: 'beast', slot: 1, emoji: '🦂', stats: { hp: 240, damage: 28, armor: 12 }, speed: 45, loot: { exp: 28 },
              skills: [{ id: 'sting', name: '毒刺', emoji: '🦂', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'venom', damageType: 'nature', tickDamage: 8, duration: 2 }] }] },
            { id: 'scorpion_2', name: '沙漠蝎子', type: 'beast', slot: 2, emoji: '🦂', stats: { hp: 240, damage: 28, armor: 12 }, speed: 45, loot: { exp: 28 },
              skills: [{ id: 'sting', name: '毒刺', emoji: '🦂', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'venom', damageType: 'nature', tickDamage: 8, duration: 2 }] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '亡灵通道', description: '远古巨魔亡灵',
        enemies: [
            { id: 'zombie_1', name: '沙怒僵尸', type: 'undead', slot: 1, emoji: '🧟', stats: { hp: 260, damage: 30, armor: 8 }, speed: 38, loot: { exp: 30 },
              skills: [{ id: 'slam', name: '重击', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 30, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'skeleton_1', name: '远古骷髅', type: 'undead', slot: 2, emoji: '💀', stats: { hp: 220, damage: 26, armor: 6 }, speed: 45, loot: { exp: 28 },
              skills: [{ id: 'bone_strike', name: '骨矛', emoji: '🦴', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'witch_doctor', name: '巫医', type: 'troll', slot: 3, emoji: '🧙', stats: { hp: 180, damage: 24, armor: 4 }, speed: 55, loot: { exp: 28 },
              skills: [
                { id: 'hex', name: '妖术', emoji: '🐸', skillType: 'debuff', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1, effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] },
                { id: 'lightning', name: '闪电箭', emoji: '⚡', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 24, cooldown: 0, actionPoints: 1, effects: [] },
              ] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '祭坛守卫', description: '赞达拉尔的仆从',
        enemies: [
            { id: 'acolyte_1', name: '巨魔祭祀', type: 'troll', slot: 1, emoji: '🧙', stats: { hp: 220, damage: 28, armor: 4 }, speed: 52, loot: { exp: 30 },
              skills: [{ id: 'shadow_bolt', name: '暗影箭', emoji: '🟣', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 28, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'guardian_1', name: '神殿守护者', type: 'troll', slot: 2, emoji: '🧌', stats: { hp: 300, damage: 34, armor: 12 }, speed: 45, loot: { exp: 34 },
              skills: [{ id: 'slam', name: '重击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 34, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '竞技场', description: '角斗士和精英战士',
        enemies: [
            { id: 'gladiator', name: '沙怒角斗士', type: 'troll', slot: 1, emoji: '💪', stats: { hp: 320, damage: 36, armor: 12 }, speed: 50, loot: { exp: 36 },
              skills: [{ id: 'cleave', name: '顺劈', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 28, cooldown: 2, actionPoints: 1, effects: [] }] },
            { id: 'troll_3', name: '沙怒狂战士', type: 'troll', slot: 2, emoji: '🧌', stats: { hp: 280, damage: 34, armor: 8 }, speed: 55, loot: { exp: 34 },
              skills: [{ id: 'frenzy', name: '狂暴打击', emoji: '💢', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 34, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_6: {
        id: 'wave_6', name: '执行官大厅', description: '首席执行官的近侍',
        enemies: [
            { id: 'elite_troll', name: '沙怒精英', type: 'troll', slot: 1, emoji: '🧌', stats: { hp: 340, damage: 36, armor: 14 }, speed: 48, loot: { exp: 38 },
              skills: [
                { id: 'whirlwind', name: '旋风斩', emoji: '🌪️', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 26, cooldown: 3, actionPoints: 1, effects: [] },
                { id: 'strike', name: '猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 36, cooldown: 0, actionPoints: 1, effects: [] },
              ] },
        ],
    },
    wave_7: {
        id: 'wave_7', name: '水元素守卫', description: '守护加兹瑞拉的水元素',
        enemies: [
            { id: 'water_elem_1', name: '水元素', type: 'elemental', slot: 1, emoji: '💧', stats: { hp: 280, damage: 30, armor: 8 }, speed: 45, loot: { exp: 32 },
              skills: [{ id: 'frost_bolt', name: '寒冰箭', emoji: '❄️', skillType: 'ranged', damageType: 'frost', targetType: 'enemy', range: 'ranged', damage: 30, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'water_elem_2', name: '水元素', type: 'elemental', slot: 2, emoji: '💧', stats: { hp: 280, damage: 30, armor: 8 }, speed: 45, loot: { exp: 32 },
              skills: [{ id: 'frost_bolt', name: '寒冰箭', emoji: '❄️', skillType: 'ranged', damageType: 'frost', targetType: 'enemy', range: 'ranged', damage: 30, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_8: {
        id: 'wave_8', name: '深渊守卫', description: '深渊中的精英水元素',
        enemies: [
            { id: 'deep_elem', name: '深渊水元素', type: 'elemental', slot: 1, emoji: '🌊', stats: { hp: 350, damage: 34, armor: 10 }, speed: 42, loot: { exp: 38 },
              skills: [
                { id: 'tidal_wave', name: '潮汐冲击', emoji: '🌊', skillType: 'spell', damageType: 'frost', targetType: 'front_3', range: 'ranged', damage: 28, cooldown: 3, actionPoints: 1, effects: [] },
                { id: 'frost_bolt', name: '寒冰箭', emoji: '❄️', skillType: 'ranged', damageType: 'frost', targetType: 'enemy', range: 'ranged', damage: 34, cooldown: 0, actionPoints: 1, effects: [] },
              ] },
        ],
    },

    // ========== BOSS ==========

    // 等级54: 新公式 finalDamage=4050
    boss_antusu: {
        id: 'antusu', name: '安图苏尔', type: 'boss', slot: 2, emoji: '🦂',
        loot: { exp: 120 },
        baseStats: { hp: 1300, damage: 4050, armor: 12 }, speed: 45,
        phases: [
            { id: 1, name: '蝎王', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['summon_scorpions', 'earth_strike', 'chain_lightning'] },
        ],
        enrage: { triggerRound: 15, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'nature', message: '🦂 蝎子从四面八方涌出！' }, message: '🦂 安图苏尔召唤了蝎群！' },
        skills: {
            summon_scorpions: { id: 'summon_scorpions', name: '召唤蝎子', emoji: '🦂', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'summon', summonId: 'summon_scorpion', count: 2 }] },
            earth_strike: { id: 'earth_strike', name: '大地之击', emoji: '🪨', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 34, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] },
            chain_lightning: { id: 'chain_lightning', name: '闪电链', emoji: '⚡', skillType: 'spell', damageType: 'nature', targetType: 'front_3', range: 'ranged', damage: 28, cooldown: 2, actionPoints: 1, effects: [] },
        },
    },
    summon_scorpion: {
        id: 'scorpion', name: '沙漠蝎子', type: 'add', emoji: '🦂',
        stats: { hp: 100, damage: 18, armor: 6 }, speed: 50,
        skills: [{ id: 'sting', name: '毒刺', emoji: '🦂', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }],
    },

    // 等级54: 新公式 finalDamage=4050
    boss_zandalar: {
        id: 'zandalar', name: '魔女赞达拉尔', type: 'boss', slot: 2, emoji: '💀',
        loot: { exp: 130 },
        baseStats: { hp: 1200, damage: 4050, armor: 6 }, speed: 52,
        phases: [
            { id: 1, name: '亡灵女巫', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['summon_skeleton', 'shadow_bolt', 'heal'] },
        ],
        enrage: { triggerRound: 15, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'shadow', message: '💀 亡灵大军涌出！' }, message: '💀 赞达拉尔释放了所有亡灵！' },
        skills: {
            summon_skeleton: { id: 'summon_skeleton', name: '召唤骷髅', emoji: '💀', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'summon', summonId: 'summon_zf_skeleton', count: 1 }] },
            shadow_bolt: { id: 'shadow_bolt', name: '暗影箭', emoji: '🟣', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 32, cooldown: 0, actionPoints: 1, effects: [] },
            heal: { id: 'heal', name: '治疗术', emoji: '💚', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1, effects: [{ type: 'heal', value: 100 }] },
        },
    },
    summon_zf_skeleton: {
        id: 'zf_skeleton', name: '沙怒骷髅', type: 'add', emoji: '💀',
        stats: { hp: 120, damage: 20, armor: 4 }, speed: 45,
        skills: [{ id: 'strike', name: '骨爪', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }],
    },

    // 等级54: 新公式 finalDamage=4050
    boss_ukorz: {
        id: 'ukorz', name: '乌克兹·沙顶', type: 'boss', slot: 2, emoji: '💪',
        loot: { exp: 130 },
        baseStats: { hp: 1400, damage: 4050, armor: 14 }, speed: 52,
        phases: [
            { id: 1, name: '沙怒酋长', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['war_cry', 'whirlwind', 'cleave'] },
            { id: 2, name: '狂暴酋长', hpThreshold: 0.4, actionsPerTurn: 3, damageModifier: 1.6, skills: ['whirlwind', 'cleave'],
              onEnter: { type: 'transform', message: '💪 乌克兹进入狂暴状态！伤害大幅提升！' } },
        ],
        enrage: { triggerRound: 15, damageModifier: 2.0, aoePerRound: { damage: 40, type: 'physical', message: '💪 乌克兹疯狂地挥斧！' }, message: '💪 乌克兹狂暴了！' },
        skills: {
            war_cry: { id: 'war_cry', name: '战斗怒吼', emoji: '📢', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'buff', name: 'war_cry', stat: 'damage', value: 0.3, duration: 3 }] },
            whirlwind: { id: 'whirlwind', name: '旋风斩', emoji: '🌪️', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 30, cooldown: 3, actionPoints: 1, effects: [] },
            cleave: { id: 'cleave', name: '顺劈斩', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 34, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },

    // 等级54: 新公式 finalDamage=4050
    boss_chief: {
        id: 'chief', name: '首席执行官', type: 'boss', slot: 2, emoji: '⚔️',
        loot: { exp: 130 },
        baseStats: { hp: 1400, damage: 4050, armor: 14 }, speed: 50,
        phases: [
            { id: 1, name: '执行官', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['whirlwind', 'mortal_strike', 'cleave'] },
        ],
        enrage: { triggerRound: 15, damageModifier: 2.0, aoePerRound: { damage: 38, type: 'physical', message: '⚔️ 首席执行官疯狂地旋转巨剑！' }, message: '⚔️ 首席执行官狂暴了！' },
        skills: {
            whirlwind: { id: 'whirlwind', name: '旋风斩', emoji: '🌪️', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 32, cooldown: 3, actionPoints: 1, effects: [] },
            mortal_strike: { id: 'mortal_strike', name: '致死打击', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 48, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'debuff', name: 'mortal_wound', stat: 'heal_reduction', value: -0.5, duration: 3 }] },
            cleave: { id: 'cleave', name: '顺劈', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 36, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },

    // 等级54: 新公式 finalDamage=4050 (最终BOSS)
    boss_gahzrilla: {
        id: 'gahzrilla', name: '加兹瑞拉', type: 'boss', slot: 2, emoji: '🌊',
        loot: { exp: 180 },
        baseStats: { hp: 2000, damage: 4050, armor: 16 }, speed: 40,
        phases: [
            { id: 1, name: '水之守护者', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['freeze', 'frost_bolt'] },
            { id: 2, name: '寒冰风暴', hpThreshold: 0.6, actionsPerTurn: 2, damageModifier: 1.3, skills: ['freeze', 'frost_bolt', 'blizzard'],
              onEnter: { type: 'transform', message: '🌊 加兹瑞拉召唤了寒冰风暴！' } },
            { id: 3, name: '极寒狂暴', hpThreshold: 0.3, actionsPerTurn: 3, damageModifier: 1.6, skills: ['frost_bolt', 'blizzard', 'frost_nova'],
              onEnter: { type: 'buff', message: '❄️ 加兹瑞拉进入极寒狂暴状态！' } },
        ],
        enrage: { triggerRound: 18, damageModifier: 2.0, aoePerRound: { damage: 45, type: 'frost', message: '❄️ 绝对零度席卷全场！' }, message: '❄️ 加兹瑞拉释放了终极寒流！' },
        skills: {
            freeze: { id: 'freeze', name: '冰冻', emoji: '🧊', description: '冻结全体', skillType: 'debuff', damageType: 'frost', targetType: 'all_enemies', range: 'ranged', damage: 15, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'root', duration: 1 }] },
            frost_bolt: { id: 'frost_bolt', name: '寒冰箭', emoji: '❄️', skillType: 'spell', damageType: 'frost', targetType: 'front_3', range: 'ranged', damage: 36, cooldown: 0, actionPoints: 1, effects: [] },
            blizzard: { id: 'blizzard', name: '寒冰风暴', emoji: '🌨️', description: '蓄力后全体高额冰霜伤害', skillType: 'spell', damageType: 'frost', targetType: 'all_enemies', range: 'ranged', damage: 60, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'telegraph', chargeRounds: 2, message: '🌨️ 加兹瑞拉开始聚集寒冰之力...' }] },
            frost_nova: { id: 'frost_nova', name: '冰霜新星', emoji: '❄️', skillType: 'spell', damageType: 'frost', targetType: 'all_enemies', range: 'ranged', damage: 30, cooldown: 2, actionPoints: 1, effects: [] },
        },
    },

    // ========== 辅助方法 ==========
    getEncounter(encounterId) { return this[encounterId] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(bossEncounterId) {
        const key = bossEncounterId || 'boss_antusu'
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
