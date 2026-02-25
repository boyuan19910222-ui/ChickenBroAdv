/**
 * 玛拉顿副本数据
 * 推荐等级: 46-55
 * BOSS: 诺克赛恩/维利塔恩/塞雷布拉斯/兰斯利德/瑟莱德斯公主
 */
export const Maraudon = {
    id: 'maraudon', name: '玛拉顿',
    description: '远古半神塞纳留斯之子扎尔塔的圣地，被邪恶力量腐化。',
    emoji: '🌿',
    levelRange: { min: 46, max: 55 },
    difficulty: 'normal',
    rewards: { expBase: 440, goldBase: 220, lootTable: ['blueItem', 'blueItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '橙色水晶通道' },
        { id: 'wave_2', type: 'trash', name: '毒蛇洞穴' },
        { id: 'boss_noxxion', type: 'boss', name: '诺克赛恩' },
        { id: 'wave_3', type: 'trash', name: '荆棘迷宫' },
        { id: 'wave_4', type: 'trash', name: '紫色水晶走廊' },
        { id: 'boss_razorlash', type: 'boss', name: '维利塔恩' },
        { id: 'wave_5', type: 'trash', name: '德鲁伊圣殿' },
        { id: 'boss_celebras', type: 'boss', name: '被诅咒的塞雷布拉斯' },
        { id: 'wave_6', type: 'trash', name: '大地裂隙' },
        { id: 'wave_7', type: 'trash', name: '岩石大厅' },
        { id: 'boss_landslide', type: 'boss', name: '兰斯利德' },
        { id: 'wave_8', type: 'trash', name: '瀑布通道' },
        { id: 'boss_princess', type: 'boss', name: '瑟莱德斯公主' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '毒性植物', description: '被污染的植物怪',
        enemies: [
            { id: 'lasher_1', name: '毒性鞭笞者', type: 'elemental', slot: 1, emoji: '🌿', stats: { hp: 260, damage: 28, armor: 6 }, speed: 40, loot: { exp: 32 },
              skills: [{ id: 'lash', name: '鞭打', emoji: '🌿', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'lasher_2', name: '毒性鞭笞者', type: 'elemental', slot: 2, emoji: '🌿', stats: { hp: 260, damage: 28, armor: 6 }, speed: 40, loot: { exp: 32 },
              skills: [{ id: 'lash', name: '鞭打', emoji: '🌿', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'spore_1', name: '毒孢子', type: 'elemental', slot: 3, emoji: '🍄', stats: { hp: 150, damage: 20, armor: 2 }, speed: 50, loot: { exp: 24 },
              skills: [{ id: 'toxic_cloud', name: '毒云', emoji: '☁️', skillType: 'ranged', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 14, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'dot', name: 'toxic', damageType: 'nature', tickDamage: 6, duration: 2 }] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '毒蛇洞穴', description: '巨型毒蛇',
        enemies: [
            { id: 'snake_1', name: '深渊巨蛇', type: 'beast', slot: 1, emoji: '🐍', stats: { hp: 280, damage: 30, armor: 8 }, speed: 55, loot: { exp: 32 },
              skills: [{ id: 'bite', name: '剧毒咬', emoji: '🐍', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'venom', damageType: 'nature', tickDamage: 8, duration: 3 }] }] },
            { id: 'snake_2', name: '深渊巨蛇', type: 'beast', slot: 2, emoji: '🐍', stats: { hp: 280, damage: 30, armor: 8 }, speed: 55, loot: { exp: 32 },
              skills: [{ id: 'bite', name: '剧毒咬', emoji: '🐍', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'venom', damageType: 'nature', tickDamage: 8, duration: 3 }] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '荆棘守护者', description: '荆棘怪和蘑菇人',
        enemies: [
            { id: 'treant', name: '腐化树人', type: 'elemental', slot: 1, emoji: '🌳', stats: { hp: 320, damage: 32, armor: 12 }, speed: 35, loot: { exp: 36 },
              skills: [{ id: 'smash', name: '树干猛击', emoji: '🌳', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 32, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'fungal', name: '毒蘑菇人', type: 'elemental', slot: 2, emoji: '🍄', stats: { hp: 200, damage: 24, armor: 4 }, speed: 48, loot: { exp: 28 },
              skills: [{ id: 'spore_cloud', name: '孢子云', emoji: '☁️', skillType: 'ranged', damageType: 'nature', targetType: 'front_2', range: 'ranged', damage: 18, cooldown: 2, actionPoints: 1,
                effects: [{ type: 'dot', name: 'spore', damageType: 'nature', tickDamage: 7, duration: 2 }] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '水晶守卫', description: '紫色水晶通道中的元素',
        enemies: [
            { id: 'crystal', name: '紫晶元素', type: 'elemental', slot: 1, emoji: '💎', stats: { hp: 300, damage: 30, armor: 16 }, speed: 40, loot: { exp: 34 },
              skills: [{ id: 'crystal_bolt', name: '水晶飞弹', emoji: '💎', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 30, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'slime_1', name: '剧毒软泥', type: 'ooze', slot: 2, emoji: '🟢', stats: { hp: 250, damage: 26, armor: 4 }, speed: 30, loot: { exp: 30 },
              skills: [{ id: 'acid', name: '酸液喷射', emoji: '🧪', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 20, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'acid', damageType: 'nature', tickDamage: 8, duration: 2 }] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '堕落德鲁伊', description: '被腐化的德鲁伊守卫',
        enemies: [
            { id: 'druid_1', name: '堕落德鲁伊', type: 'humanoid', slot: 1, emoji: '🧙', stats: { hp: 280, damage: 30, armor: 8 }, speed: 50, loot: { exp: 34 },
              skills: [
                { id: 'wrath', name: '愤怒', emoji: '🌿', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 30, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'heal', name: '治疗术', emoji: '💚', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 4, actionPoints: 1, effects: [{ type: 'heal', value: 60 }] },
              ] },
            { id: 'druid_2', name: '堕落德鲁伊', type: 'humanoid', slot: 2, emoji: '🧙', stats: { hp: 280, damage: 30, armor: 8 }, speed: 50, loot: { exp: 34 },
              skills: [{ id: 'wrath', name: '愤怒', emoji: '🌿', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 30, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_6: {
        id: 'wave_6', name: '大地元素', description: '裂隙中的岩石元素',
        enemies: [
            { id: 'earth_elem', name: '大地元素', type: 'elemental', slot: 1, emoji: '🪨', stats: { hp: 380, damage: 34, armor: 20 }, speed: 30, loot: { exp: 38 },
              skills: [{ id: 'boulder', name: '巨石投掷', emoji: '🪨', skillType: 'ranged', damageType: 'physical', targetType: 'enemy', range: 'ranged', damage: 34, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'rock_borer', name: '石甲虫', type: 'beast', slot: 2, emoji: '🪲', stats: { hp: 220, damage: 26, armor: 14 }, speed: 45, loot: { exp: 30 },
              skills: [{ id: 'bore', name: '钻击', emoji: '🪲', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_7: {
        id: 'wave_7', name: '岩石巨人', description: '兰斯利德的岩石卫兵',
        enemies: [
            { id: 'golem', name: '岩石傀儡', type: 'elemental', slot: 1, emoji: '🗿', stats: { hp: 400, damage: 36, armor: 22 }, speed: 28, loot: { exp: 40 },
              skills: [
                { id: 'slam', name: '碎地猛击', emoji: '💥', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 30, cooldown: 2, actionPoints: 1, effects: [] },
                { id: 'punch', name: '石拳', emoji: '🗿', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 36, cooldown: 0, actionPoints: 1, effects: [] },
              ] },
        ],
    },
    wave_8: {
        id: 'wave_8', name: '深渊守卫', description: '公主领地的最后守卫',
        enemies: [
            { id: 'hydra', name: '深渊多头蛇', type: 'beast', slot: 1, emoji: '🐉', stats: { hp: 350, damage: 34, armor: 10 }, speed: 45, loot: { exp: 40 },
              skills: [
                { id: 'multi_bite', name: '多头撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 28, cooldown: 2, actionPoints: 1, effects: [] },
                { id: 'poison_spit', name: '毒液喷射', emoji: '🐍', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 24, cooldown: 0, actionPoints: 1,
                  effects: [{ type: 'dot', name: 'venom', damageType: 'nature', tickDamage: 8, duration: 2 }] },
              ] },
        ],
    },

    // ========== BOSS ==========

    // 等级55: 新公式 finalDamage=4125
    boss_noxxion: {
        id: 'noxxion', name: '诺克赛恩', type: 'boss', slot: 2, emoji: '🍄',
        loot: { exp: 130 },
        baseStats: { hp: 1400, damage: 4125, armor: 8 }, speed: 38,
        phases: [
            { id: 1, name: '毒性之主', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['toxic_spray', 'split', 'poison_cloud'] },
        ],
        enrage: { triggerRound: 15, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'nature', message: '🍄 毒孢子满天飞舞！' }, message: '🍄 诺克赛恩释放了致命毒雾！' },
        skills: {
            toxic_spray: { id: 'toxic_spray', name: '毒性喷射', emoji: '☁️', skillType: 'spell', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 20, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'toxic', damageType: 'nature', tickDamage: 8, duration: 2 }] },
            split: { id: 'split', name: '分裂', emoji: '🍄', description: '召唤毒性小怪', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'summon', summonId: 'summon_toxic_add', count: 2 }] },
            poison_cloud: { id: 'poison_cloud', name: '毒云', emoji: '☁️', skillType: 'spell', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 25, cooldown: 3, actionPoints: 1, effects: [] },
        },
    },
    summon_toxic_add: {
        id: 'toxic_add', name: '毒性分裂体', type: 'add', emoji: '🟢',
        stats: { hp: 100, damage: 16, armor: 2 }, speed: 45,
        skills: [{ id: 'toxic', name: '毒液', emoji: '🟢', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 16, cooldown: 0, actionPoints: 1, effects: [] }],
    },

    // 等级55: 新公式 finalDamage=4125
    boss_razorlash: {
        id: 'razorlash', name: '维利塔恩', type: 'boss', slot: 2, emoji: '🌿',
        loot: { exp: 130 },
        baseStats: { hp: 1500, damage: 4125, armor: 14 }, speed: 42,
        phases: [
            { id: 1, name: '荆棘之王', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['puncture', 'thorn_armor', 'lash'] },
        ],
        enrage: { triggerRound: 15, damageModifier: 2.0, aoePerRound: { damage: 32, type: 'nature', message: '🌿 荆棘从地面爆出！' }, message: '🌿 维利塔恩狂暴了！' },
        skills: {
            puncture: { id: 'puncture', name: '穿刺', emoji: '🌿', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 48, cooldown: 3, actionPoints: 1, effects: [] },
            thorn_armor: { id: 'thorn_armor', name: '荆棘护甲', emoji: '🛡️', description: '反弹物理伤害', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'buff', name: 'thorns', stat: 'armor', value: 0.4, duration: 3 }] },
            lash: { id: 'lash', name: '鞭打', emoji: '🌿', skillType: 'melee', damageType: 'nature', targetType: 'front_2', range: 'melee', damage: 30, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },

    // 等级55: 新公式 finalDamage=4125
    boss_celebras: {
        id: 'celebras', name: '被诅咒的塞雷布拉斯', type: 'boss', slot: 2, emoji: '🧙',
        loot: { exp: 130 },
        baseStats: { hp: 1400, damage: 4125, armor: 10 }, speed: 48,
        phases: [
            { id: 1, name: '堕落德鲁伊', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['entangling_roots', 'wrath', 'heal'] },
        ],
        enrage: { triggerRound: 15, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'nature', message: '🌿 自然之力失控！' }, message: '🧙 塞雷布拉斯释放了全部自然之力！' },
        skills: {
            entangling_roots: { id: 'entangling_roots', name: '纠缠根须', emoji: '🌱', skillType: 'debuff', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 0, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'root', duration: 2 }] },
            wrath: { id: 'wrath', name: '愤怒', emoji: '🌿', skillType: 'spell', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 34, cooldown: 0, actionPoints: 1, effects: [] },
            heal: { id: 'heal', name: '治疗术', emoji: '💚', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 4, actionPoints: 1, effects: [{ type: 'heal', value: 100 }] },
        },
    },

    // 等级55: 新公式 finalDamage=4125
    boss_landslide: {
        id: 'landslide', name: '兰斯利德', type: 'boss', slot: 2, emoji: '🪨',
        loot: { exp: 150 },
        baseStats: { hp: 1800, damage: 4125, armor: 22 }, speed: 35,
        phases: [
            { id: 1, name: '大地守护者', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['earthquake', 'stone_armor', 'boulder_toss'] },
        ],
        enrage: { triggerRound: 16, damageModifier: 2.0, aoePerRound: { damage: 40, type: 'nature', message: '🪨 大地震动不止！' }, message: '🪨 兰斯利德的力量达到极限！' },
        skills: {
            earthquake: { id: 'earthquake', name: '大地震击', emoji: '💥', description: '蓄力后全体高伤+眩晕', skillType: 'spell', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 55, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'telegraph', chargeRounds: 1, message: '🪨 兰斯利德举起巨大的石拳...' }, { type: 'cc', ccType: 'stun', duration: 1 }] },
            stone_armor: { id: 'stone_armor', name: '石甲', emoji: '🛡️', description: '减伤40%持续2回合', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'buff', name: 'stone_armor', stat: 'armor', value: 0.4, duration: 2 }] },
            boulder_toss: { id: 'boulder_toss', name: '巨石投掷', emoji: '🪨', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 50, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },

    // 等级55: 新公式 finalDamage=4125 (最终BOSS)
    boss_princess: {
        id: 'princess', name: '瑟莱德斯公主', type: 'boss', slot: 2, emoji: '👑',
        loot: { exp: 180 },
        baseStats: { hp: 2200, damage: 4125, armor: 18 }, speed: 38,
        phases: [
            { id: 1, name: '大地公主', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['dust_storm', 'boulder_toss'] },
            { id: 2, name: '岩石之盾', hpThreshold: 0.4, actionsPerTurn: 2, damageModifier: 1.0, skills: ['rock_shield', 'earthquake', 'boulder_toss'],
              onEnter: { type: 'buff', message: '👑 瑟莱德斯启动了岩石之盾！物理攻击无效！' } },
            { id: 3, name: '狂暴公主', hpThreshold: 0.2, actionsPerTurn: 3, damageModifier: 1.5, skills: ['earthquake', 'boulder_toss', 'dust_storm'],
              onEnter: { type: 'transform', message: '👑 瑟莱德斯的力量达到顶峰！' } },
        ],
        enrage: { triggerRound: 18, damageModifier: 2.0, aoePerRound: { damage: 50, type: 'nature', message: '👑 大地在愤怒中震动！' }, message: '👑 瑟莱德斯公主狂暴了！' },
        skills: {
            dust_storm: { id: 'dust_storm', name: '灰尘之暴', emoji: '🌪️', skillType: 'spell', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 24, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'dust', damageType: 'nature', tickDamage: 8, duration: 2 }] },
            boulder_toss: { id: 'boulder_toss', name: '巨石投掷', emoji: '🪨', description: '蓄力后高伤单体', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 65, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'telegraph', chargeRounds: 1, message: '🪨 瑟莱德斯举起一块巨石...' }] },
            rock_shield: { id: 'rock_shield', name: '岩石之盾', emoji: '🛡️', description: '物理免疫2回合', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 6, actionPoints: 1,
                effects: [{ type: 'buff', name: 'physicalImmune', stat: 'physicalImmune', value: 1, duration: 2 }] },
            earthquake: { id: 'earthquake', name: '大地震击', emoji: '💥', skillType: 'spell', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 40, cooldown: 3, actionPoints: 1, effects: [] },
        },
    },

    // ========== 辅助方法 ==========
    getEncounter(encounterId) { return this[encounterId] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(bossEncounterId) {
        const key = bossEncounterId || 'boss_noxxion'
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
