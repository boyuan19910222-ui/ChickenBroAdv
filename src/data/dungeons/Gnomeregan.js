/**
 * 诺莫瑞根副本数据
 * 推荐等级: 29-38
 * BOSS: 粘稠辐射者/格拉比斯/电刑器6000/瑟玛普拉格
 */
export const Gnomeregan = {
    id: 'gnomeregan', name: '诺莫瑞根',
    description: '被辐射污染的侏儒城市，到处都是疯狂的机械和变异怪物。',
    emoji: '⚙️',
    levelRange: { min: 29, max: 38 },
    difficulty: 'normal',
    rewards: { expBase: 280, goldBase: 140, lootTable: ['greenItem', 'blueItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '污染隧道' },
        { id: 'wave_2', type: 'trash', name: '辐射走廊' },
        { id: 'boss_viscous_fallout', type: 'boss', name: '粘稠辐射者' },
        { id: 'wave_3', type: 'trash', name: '洞穴通道' },
        { id: 'wave_4', type: 'trash', name: '采矿区' },
        { id: 'boss_grubbis', type: 'boss', name: '格拉比斯' },
        { id: 'wave_5', type: 'trash', name: '机械车间' },
        { id: 'wave_6', type: 'trash', name: '工程实验室' },
        { id: 'boss_electrocutioner', type: 'boss', name: '电刑器6000' },
        { id: 'wave_7', type: 'trash', name: '核心通道' },
        { id: 'wave_8', type: 'trash', name: '瑟玛普拉格大厅' },
        { id: 'boss_thermaplugg', type: 'boss', name: '麦克尼尔·瑟玛普拉格' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '辐射软泥怪', description: '被辐射污染的软泥怪群',
        enemies: [
            { id: 'ooze_1', name: '辐射软泥', type: 'ooze', slot: 1, emoji: '🟢', stats: { hp: 180, damage: 22, armor: 4 }, speed: 35, loot: { exp: 22 },
              skills: [{ id: 'slam', name: '猛拍', emoji: '💥', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'ooze_2', name: '辐射软泥', type: 'ooze', slot: 2, emoji: '🟢', stats: { hp: 180, damage: 22, armor: 4 }, speed: 35, loot: { exp: 22 },
              skills: [{ id: 'slam', name: '猛拍', emoji: '💥', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'trogg_1', name: '变异穴居人', type: 'trogg', slot: 3, emoji: '👾', stats: { hp: 150, damage: 20, armor: 6 }, speed: 45, loot: { exp: 20 },
              skills: [{ id: 'strike', name: '石拳打击', emoji: '🪨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '辐射区巡逻', description: '高辐射区域的变异生物',
        enemies: [
            { id: 'trogg_2', name: '穴居人蛮兵', type: 'trogg', slot: 1, emoji: '👾', stats: { hp: 170, damage: 24, armor: 8 }, speed: 45, loot: { exp: 22 },
              skills: [{ id: 'strike', name: '重击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'trogg_3', name: '穴居人蛮兵', type: 'trogg', slot: 2, emoji: '👾', stats: { hp: 170, damage: 24, armor: 8 }, speed: 45, loot: { exp: 22 },
              skills: [{ id: 'strike', name: '重击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'mech_1', name: '故障机器人', type: 'mechanical', slot: 3, emoji: '🤖', stats: { hp: 130, damage: 18, armor: 12 }, speed: 55, loot: { exp: 18 },
              skills: [{ id: 'zap', name: '电击', emoji: '⚡', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '洞穴蜘蛛巢', description: '潜伏的变异蜘蛛',
        enemies: [
            { id: 'spider_1', name: '变异蜘蛛', type: 'spider', slot: 1, emoji: '🕷️', stats: { hp: 140, damage: 20, armor: 4 }, speed: 65, loot: { exp: 18 },
              skills: [{ id: 'bite', name: '毒咬', emoji: '🦷', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 15, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 6, duration: 2 }] }] },
            { id: 'spider_2', name: '变异蜘蛛', type: 'spider', slot: 2, emoji: '🕷️', stats: { hp: 140, damage: 20, armor: 4 }, speed: 65, loot: { exp: 18 },
              skills: [{ id: 'bite', name: '毒咬', emoji: '🦷', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 15, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 6, duration: 2 }] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '采矿区守卫', description: '疯狂的侏儒矿工',
        enemies: [
            { id: 'miner_1', name: '疯狂矿工', type: 'gnome', slot: 1, emoji: '⛏️', stats: { hp: 160, damage: 22, armor: 6 }, speed: 50, loot: { exp: 20 },
              skills: [{ id: 'pickaxe', name: '矿镐猛击', emoji: '⛏️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'miner_2', name: '疯狂矿工', type: 'gnome', slot: 2, emoji: '⛏️', stats: { hp: 160, damage: 22, armor: 6 }, speed: 50, loot: { exp: 20 },
              skills: [{ id: 'pickaxe', name: '矿镐猛击', emoji: '⛏️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'bomber_1', name: '侏儒炸弹手', type: 'gnome', slot: 3, emoji: '💣', stats: { hp: 110, damage: 28, armor: 2 }, speed: 60, loot: { exp: 22 },
              skills: [{ id: 'bomb', name: '投掷炸弹', emoji: '💣', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 28, cooldown: 2, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '机械车间', description: '失控的机械造物',
        enemies: [
            { id: 'mech_2', name: '失控机械兵', type: 'mechanical', slot: 1, emoji: '🤖', stats: { hp: 200, damage: 26, armor: 14 }, speed: 40, loot: { exp: 24 },
              skills: [{ id: 'smash', name: '机械臂打击', emoji: '🦾', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'mech_3', name: '巡逻机器人', type: 'mechanical', slot: 2, emoji: '🤖', stats: { hp: 160, damage: 20, armor: 10 }, speed: 50, loot: { exp: 20 },
              skills: [{ id: 'laser', name: '激光扫射', emoji: '🔴', skillType: 'ranged', damageType: 'fire', targetType: 'front_2', range: 'ranged', damage: 16, cooldown: 2, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_6: {
        id: 'wave_6', name: '实验室守卫', description: '被辐射强化的穴居人精英',
        enemies: [
            { id: 'elite_trogg', name: '辐射穴居人精英', type: 'trogg', slot: 1, emoji: '👾', stats: { hp: 220, damage: 28, armor: 10 }, speed: 45, loot: { exp: 28 },
              skills: [
                { id: 'smash', name: '大地猛击', emoji: '💥', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'radiation', name: '辐射吐息', emoji: '☢️', skillType: 'ranged', damageType: 'nature', targetType: 'front_2', range: 'ranged', damage: 15, cooldown: 3, actionPoints: 1,
                  effects: [{ type: 'dot', name: 'radiation', damageType: 'nature', tickDamage: 5, duration: 2 }] },
              ] },
            { id: 'ooze_3', name: '剧毒软泥', type: 'ooze', slot: 2, emoji: '🟢', stats: { hp: 160, damage: 20, armor: 2 }, speed: 30, loot: { exp: 20 },
              skills: [{ id: 'toxic', name: '毒液喷射', emoji: '🧪', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 15, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'toxic', damageType: 'nature', tickDamage: 7, duration: 2 }] }] },
        ],
    },
    wave_7: {
        id: 'wave_7', name: '核心通道', description: '瑟玛普拉格的机械卫兵',
        enemies: [
            { id: 'guardian_1', name: '机械卫兵', type: 'mechanical', slot: 1, emoji: '🤖', stats: { hp: 200, damage: 24, armor: 16 }, speed: 40, loot: { exp: 26 },
              skills: [{ id: 'slam', name: '重型打击', emoji: '🔨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'guardian_2', name: '机械卫兵', type: 'mechanical', slot: 2, emoji: '🤖', stats: { hp: 200, damage: 24, armor: 16 }, speed: 40, loot: { exp: 26 },
              skills: [{ id: 'slam', name: '重型打击', emoji: '🔨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_8: {
        id: 'wave_8', name: '瑟玛普拉格外围', description: '最后的机械守卫',
        enemies: [
            { id: 'elite_mech', name: '精英机械兵', type: 'mechanical', slot: 1, emoji: '🤖', stats: { hp: 240, damage: 28, armor: 18 }, speed: 45, loot: { exp: 30 },
              skills: [
                { id: 'pound', name: '碾压打击', emoji: '🦾', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'shock', name: '电磁脉冲', emoji: '⚡', skillType: 'ranged', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 12, cooldown: 4, actionPoints: 1, effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] },
              ] },
            { id: 'bomber_2', name: '自爆机器人', type: 'mechanical', slot: 2, emoji: '💣', stats: { hp: 80, damage: 40, armor: 0 }, speed: 70, loot: { exp: 15 },
              skills: [{ id: 'detonate', name: '自爆', emoji: '💥', skillType: 'melee', damageType: 'fire', targetType: 'all_enemies', range: 'melee', damage: 40, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },

    // ========== BOSS 配置 ==========

    // 等级38: baseDamage=1900, difficultyMultiplier=0.75, finalDamage=1425
    boss_viscous_fallout: {
        id: 'viscous_fallout', name: '粘稠辐射者', type: 'boss', slot: 2, emoji: '🟢',
        loot: { exp: 90 },
        baseStats: { hp: 850, damage: 1425, armor: 6 }, speed: 30,
        phases: [
            { id: 1, name: '辐射体', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['radiation_aoe', 'slime_debuff'] },
        ],
        enrage: { triggerRound: 14, damageModifier: 1.8, aoePerRound: { damage: 25, type: 'nature', message: '☢️ 辐射能量爆发！' }, message: '☢️ 粘稠辐射者的辐射浓度急剧上升！' },
        skills: {
            radiation_aoe: { id: 'radiation_aoe', name: '辐射', emoji: '☢️', skillType: 'spell', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 18, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'radiation', damageType: 'nature', tickDamage: 8, duration: 2 }] },
            slime_debuff: { id: 'slime_debuff', name: '黏液', emoji: '🟢', description: '降低目标速度', skillType: 'debuff', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 10, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'debuff', name: 'slowed', stat: 'speed', value: -0.3, duration: 2 }] },
        },
    },

    // 等级38: baseDamage=1900, difficultyMultiplier=0.75, finalDamage=1425
    boss_grubbis: {
        id: 'grubbis', name: '格拉比斯', type: 'boss', slot: 2, emoji: '👹',
        loot: { exp: 100 },
        baseStats: { hp: 950, damage: 1425, armor: 10 }, speed: 40,
        phases: [
            { id: 1, name: '穴居头领', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['summon_miners', 'bomb_throw'] },
        ],
        enrage: { triggerRound: 14, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'fire', message: '💣 格拉比斯投出无数炸弹！' }, message: '💣 格拉比斯疯狂了！' },
        skills: {
            summon_miners: { id: 'summon_miners', name: '召唤矿工', emoji: '⛏️', description: '召唤疯狂矿工小怪', skillType: 'summon', damageType: null, targetType: 'summon', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1, effects: [], summonId: 'summon_crazy_miner' },
            bomb_throw: { id: 'bomb_throw', name: '炸弹投掷', emoji: '💣', description: '蓄力后投掷炸弹', skillType: 'ranged', damageType: 'fire', targetType: 'front_3', range: 'ranged', damage: 45, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'telegraph', chargeRounds: 1, message: '💣 格拉比斯掏出一颗巨大的炸弹...' }] },
        },
    },
    summon_crazy_miner: {
        id: 'crazy_miner', name: '疯狂矿工', type: 'add', emoji: '⛏️',
        stats: { hp: 100, damage: 18, armor: 4 }, speed: 55,
        skills: [{ id: 'pickaxe', name: '矿镐猛击', emoji: '⛏️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }],
    },

    // 等级38: baseDamage=1900, difficultyMultiplier=0.75, finalDamage=1425
    boss_electrocutioner: {
        id: 'electrocutioner', name: '电刑器6000', type: 'boss', slot: 2, emoji: '⚡',
        loot: { exp: 110 },
        baseStats: { hp: 1100, damage: 1425, armor: 16 }, speed: 50,
        phases: [
            { id: 1, name: '常规模式', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['chain_lightning', 'shock'] },
            { id: 2, name: '超载模式', hpThreshold: 0.4, actionsPerTurn: 3, damageModifier: 2.0, skills: ['chain_lightning', 'shock'],
              onEnter: { type: 'transform', message: '⚡ 电刑器6000进入超载模式！能量输出翻倍！' } },
        ],
        enrage: { triggerRound: 15, damageModifier: 2.0, aoePerRound: { damage: 35, type: 'nature', message: '⚡ 电流失控，全场电击！' }, message: '⚡ 电刑器6000完全失控！' },
        skills: {
            chain_lightning: { id: 'chain_lightning', name: '闪电链', emoji: '⚡', skillType: 'spell', damageType: 'nature', targetType: 'front_3', range: 'ranged', damage: 30, cooldown: 2, actionPoints: 1, effects: [] },
            shock: { id: 'shock', name: '电击', emoji: '💥', skillType: 'spell', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 25, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] },
        },
    },

    // 等级38: baseDamage=1900, difficultyMultiplier=0.75, finalDamage=1425
    boss_thermaplugg: {
        id: 'thermaplugg', name: '麦克尼尔·瑟玛普拉格', type: 'boss', slot: 2, emoji: '🔧',
        loot: { exp: 140 },
        baseStats: { hp: 1500, damage: 1425, armor: 18 }, speed: 45,
        phases: [
            { id: 1, name: '疯狂工程师', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['bomb_barrage', 'summon_bomb_bot', 'wrench_strike'] },
            { id: 2, name: '过载状态', hpThreshold: 0.3, actionsPerTurn: 3, damageModifier: 1.4, skills: ['bomb_barrage', 'summon_bomb_bot', 'wrench_strike'],
              onEnter: { type: 'transform', message: '🔧 瑟玛普拉格启动紧急过载协议！' } },
        ],
        enrage: { triggerRound: 15, damageModifier: 2.0, aoePerRound: { damage: 40, type: 'fire', message: '💣 炸弹从四面八方飞来！' }, message: '💣 瑟玛普拉格启动了终极自爆程序！' },
        skills: {
            bomb_barrage: { id: 'bomb_barrage', name: '炸弹阵', emoji: '💣', description: '蓄力后对全体造成高额火焰伤害', skillType: 'spell', damageType: 'fire', targetType: 'all_enemies', range: 'ranged', damage: 55, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'telegraph', chargeRounds: 1, message: '💣 瑟玛普拉格按下了炸弹发射按钮...' }] },
            summon_bomb_bot: { id: 'summon_bomb_bot', name: '召唤炸弹机器人', emoji: '🤖', description: '召唤会自爆的机器人', skillType: 'summon', damageType: null, targetType: 'summon', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1, effects: [], summonId: 'summon_bomb_robot' },
            wrench_strike: { id: 'wrench_strike', name: '扳手打击', emoji: '🔧', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 38, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },
    summon_bomb_robot: {
        id: 'bomb_robot', name: '炸弹机器人', type: 'add', emoji: '💣',
        stats: { hp: 60, damage: 50, armor: 0 }, speed: 70,
        skills: [{ id: 'self_destruct', name: '自爆', emoji: '💥', skillType: 'melee', damageType: 'fire', targetType: 'all_enemies', range: 'melee', damage: 50, cooldown: 0, actionPoints: 1, effects: [] }],
    },

    // ========== 辅助方法 ==========
    getEncounter(encounterId) { return this[encounterId] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(bossEncounterId) {
        const key = bossEncounterId || 'boss_viscous_fallout'
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
