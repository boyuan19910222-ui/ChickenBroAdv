/**
 * 黑石塔上层副本数据
 * 推荐等级: 58-60
 * BOSS: 焰卫者/索拉卡/比斯巨兽/雷德·黑手/达基萨斯
 */
export const BlackrockSpire_Upper = {
    id: 'brs_upper', name: '黑石塔上层',
    description: '黑石塔的上层区域，黑龙军团的核心据点。',
    emoji: '⬆️',
    levelRange: { min: 58, max: 60 },
    difficulty: 'hard',
    rewards: { expBase: 600, goldBase: 300, lootTable: ['blueItem', 'epicItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '焰卫者大厅' },
        { id: 'wave_2', type: 'trash', name: '龙鳞走廊' },
        { id: 'boss_pyroguard', type: 'boss', name: '焰卫者埃博斯' },
        { id: 'wave_3', type: 'trash', name: '竞技场' },
        { id: 'boss_solakar', type: 'boss', name: '索拉卡·火冠' },
        { id: 'wave_4', type: 'trash', name: '比斯巨兽之巢' },
        { id: 'boss_beast', type: 'boss', name: '比斯巨兽' },
        { id: 'wave_5', type: 'trash', name: '黑翼大厅' },
        { id: 'wave_6', type: 'trash', name: '达基萨斯前厅' },
        { id: 'boss_rend', type: 'boss', name: '雷德·黑手' },
        { id: 'wave_7', type: 'trash', name: '将军之路' },
        { id: 'wave_8', type: 'trash', name: '龙门走廊' },
        { id: 'boss_drakkisath', type: 'boss', name: '达基萨斯将军' },
    ],

    wave_1: {
        id: 'wave_1', name: '焰卫者大厅', description: '黑铁火法师守卫',
        enemies: [
            { id: 'fire_1', name: '黑铁焰卫者', type: 'dwarf', slot: 1, emoji: '🔥', stats: { hp: 620, damage: 58, armor: 18 }, speed: 50, loot: { exp: 52 },
              skills: [{ id: 'firebolt', name: '火焰箭', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 58, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'fire_2', name: '黑铁焰卫者', type: 'dwarf', slot: 2, emoji: '🔥', stats: { hp: 620, damage: 58, armor: 18 }, speed: 50, loot: { exp: 52 },
              skills: [{ id: 'firebolt', name: '火焰箭', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 58, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'guard_1', name: '黑铁守卫', type: 'dwarf', slot: 3, emoji: '⛏️', stats: { hp: 700, damage: 52, armor: 26 }, speed: 40, loot: { exp: 50 },
              skills: [{ id: 'smash', name: '盾击', emoji: '🛡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 52, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '龙鳞走廊', description: '龙人巡逻队',
        enemies: [
            { id: 'drk_1', name: '黑翼龙人', type: 'dragonkin', slot: 1, emoji: '🐉', stats: { hp: 680, damage: 60, armor: 22 }, speed: 50, loot: { exp: 54 },
              skills: [{ id: 'claw', name: '龙爪', emoji: '🦖', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 60, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'drk_2', name: '黑翼技师', type: 'dragonkin', slot: 2, emoji: '🐉', stats: { hp: 500, damage: 65, armor: 14 }, speed: 55, loot: { exp: 52 },
              skills: [{ id: 'blast', name: '黑翼烈焰', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 65, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '竞技场', description: '竞技场中的兽人',
        enemies: [
            { id: 'orc_1', name: '黑石角斗士', type: 'orc', slot: 1, emoji: '👹', stats: { hp: 750, damage: 62, armor: 20 }, speed: 50, loot: { exp: 56 },
              skills: [{ id: 'cleave', name: '劈砍', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 45, cooldown: 2, actionPoints: 1, effects: [] }] },
            { id: 'orc_2', name: '黑石角斗士', type: 'orc', slot: 2, emoji: '👹', stats: { hp: 750, damage: 62, armor: 20 }, speed: 50, loot: { exp: 56 },
              skills: [{ id: 'strike', name: '致命打击', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 62, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '比斯巨兽之巢', description: '幼龙群',
        enemies: [
            { id: 'whelp_1', name: '黑翼雏龙', type: 'dragonkin', slot: 1, emoji: '🐉', stats: { hp: 400, damage: 45, armor: 10 }, speed: 65, loot: { exp: 40 },
              skills: [{ id: 'breath', name: '火焰吐息', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 45, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'whelp_2', name: '黑翼雏龙', type: 'dragonkin', slot: 2, emoji: '🐉', stats: { hp: 400, damage: 45, armor: 10 }, speed: 65, loot: { exp: 40 },
              skills: [{ id: 'breath', name: '火焰吐息', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 45, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'whelp_3', name: '黑翼雏龙', type: 'dragonkin', slot: 3, emoji: '🐉', stats: { hp: 400, damage: 45, armor: 10 }, speed: 65, loot: { exp: 40 },
              skills: [{ id: 'breath', name: '火焰吐息', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 45, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '黑翼大厅', description: '精锐黑翼守卫',
        enemies: [
            { id: 'elite_1', name: '黑翼精锐', type: 'dragonkin', slot: 1, emoji: '🐉', stats: { hp: 800, damage: 65, armor: 24 }, speed: 50, loot: { exp: 58 },
              skills: [{ id: 'strike', name: '黑翼斩', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 65, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'caster_1', name: '黑翼法师', type: 'dragonkin', slot: 2, emoji: '🐉', stats: { hp: 550, damage: 72, armor: 12 }, speed: 55, loot: { exp: 56 },
              skills: [{ id: 'shadowflame', name: '暗影烈焰', emoji: '🌑', skillType: 'ranged', damageType: 'fire', targetType: 'front_2', range: 'ranged', damage: 50, cooldown: 2, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_6: {
        id: 'wave_6', name: '达基萨斯前厅', description: '黑石兽人精英',
        enemies: [
            { id: 'orc_3', name: '黑石精英', type: 'orc', slot: 1, emoji: '👹', stats: { hp: 820, damage: 68, armor: 24 }, speed: 45, loot: { exp: 60 },
              skills: [{ id: 'mortal', name: '致死打击', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 68, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'orc_4', name: '黑石狂战士', type: 'orc', slot: 2, emoji: '👹', stats: { hp: 720, damage: 72, armor: 18 }, speed: 55, loot: { exp: 58 },
              skills: [{ id: 'whirlwind', name: '旋风斩', emoji: '🌀', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 45, cooldown: 3, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_7: {
        id: 'wave_7', name: '将军之路', description: '龙人卫兵',
        enemies: [
            { id: 'drk_3', name: '达基萨斯卫兵', type: 'dragonkin', slot: 1, emoji: '🐉', stats: { hp: 850, damage: 68, armor: 26 }, speed: 45, loot: { exp: 62 },
              skills: [{ id: 'strike', name: '龙鳞打击', emoji: '🦖', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 68, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'drk_4', name: '达基萨斯法师', type: 'dragonkin', slot: 2, emoji: '🐉', stats: { hp: 600, damage: 75, armor: 14 }, speed: 55, loot: { exp: 60 },
              skills: [{ id: 'flame', name: '龙焰风暴', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'all_enemies', range: 'ranged', damage: 42, cooldown: 3, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_8: {
        id: 'wave_8', name: '龙门走廊', description: '最后的守卫',
        enemies: [
            { id: 'drk_5', name: '黑翼近卫', type: 'dragonkin', slot: 1, emoji: '🐉', stats: { hp: 900, damage: 70, armor: 28 }, speed: 45, loot: { exp: 64 },
              skills: [{ id: 'strike', name: '近卫之击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 70, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'drk_6', name: '黑翼近卫', type: 'dragonkin', slot: 2, emoji: '🐉', stats: { hp: 900, damage: 70, armor: 28 }, speed: 45, loot: { exp: 64 },
              skills: [{ id: 'strike', name: '近卫之击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 70, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },

    // ========== BOSS ==========
    // 等级60: 新公式 finalDamage=2700
    boss_pyroguard: {
        id: 'boss_pyroguard', name: '焰卫者埃博斯', emoji: '🔥',
        description: '守护上层入口的强大火焰法师。', type: 'boss', slot: 1,
        baseStats: { hp: 3600, damage: 4500, armor: 18, speed: 50 },
        loot: { exp: 320, gold: 80 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['fireball', 'flame_shield'] },
            { hpPercent: 40, actionsPerTurn: 2, damageModifier: 1.4, skills: ['fireball', 'flame_shield', 'fire_nova'],
              onEnter: { type: 'buff', name: 'inferno', stat: 'damage', value: 25, duration: 99 } },
        ],
        enrage: { turns: 20, damageMultiplier: 2.0, message: '⚠️ 焰卫者燃烧殆尽！' },
        skills: {
            fireball: { id: 'fireball', name: '火球术', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', cooldown: 0, actionPoints: 1, effects: [] },
            flame_shield: { id: 'flame_shield', name: '烈焰之盾', emoji: '🛡️', skillType: 'buff', damageType: 'fire', targetType: 'self', range: 'self', damage: 0, cooldown: 6, actionPoints: 1,
                effects: [{ type: 'buff', name: 'flameShield', stat: 'armor', value: 20, duration: 3 }] },
            fire_nova: { id: 'fire_nova', name: '烈焰新星', emoji: '💥', skillType: 'ranged', damageType: 'fire', targetType: 'all_enemies', range: 'ranged', damage: 1350, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'dot', name: 'burn', damageType: 'fire', tickDamage: 15, duration: 2 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_solakar: {
        id: 'boss_solakar', name: '索拉卡·火冠', emoji: '🐉',
        description: '守护龙蛋的火冠龙人。', type: 'boss', slot: 1,
        baseStats: { hp: 3400, damage: 4500, armor: 20, speed: 55 },
        loot: { exp: 300, gold: 75 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['flame_strike', 'hatch_egg'] },
            { hpPercent: 50, actionsPerTurn: 2, damageModifier: 1.2, skills: ['flame_strike', 'hatch_egg', 'fire_breath'],
              onEnter: { type: 'summon', summonId: 'summon_whelps' } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.0, message: '⚠️ 索拉卡疯狂孵化龙蛋！' },
        skills: {
            flame_strike: { id: 'flame_strike', name: '烈焰打击', emoji: '🔥', skillType: 'melee', damageType: 'fire', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1, effects: [] },
            hatch_egg: { id: 'hatch_egg', name: '孵化龙蛋', emoji: '🥚', skillType: 'special', damageType: 'fire', targetType: 'self', range: 'self', damage: 0, cooldown: 6, actionPoints: 1,
                effects: [{ type: 'summon', summonId: 'summon_whelps' }] },
            fire_breath: { id: 'fire_breath', name: '烈焰吐息', emoji: '💨', skillType: 'ranged', damageType: 'fire', targetType: 'front_2', range: 'ranged', damage: 1800, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'dot', name: 'burn', damageType: 'fire', tickDamage: 12, duration: 2 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_beast: {
        id: 'boss_beast', name: '比斯巨兽', emoji: '🦎',
        description: '饲养的巨型怪兽。', type: 'boss', slot: 1,
        baseStats: { hp: 4200, damage: 4500, armor: 22, speed: 45 },
        loot: { exp: 340, gold: 85 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['rend', 'charge'] },
            { hpPercent: 50, actionsPerTurn: 2, damageModifier: 1.3, skills: ['rend', 'charge', 'terrifying_roar'] },
            { hpPercent: 20, actionsPerTurn: 2, damageModifier: 1.6, skills: ['rend', 'charge', 'terrifying_roar'],
              onEnter: { type: 'buff', name: 'beastFrenzy', stat: 'speed', value: 30, duration: 99 } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.5, message: '⚠️ 比斯巨兽陷入疯狂！' },
        skills: {
            rend: { id: 'rend', name: '撕裂', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'bleed', damageType: 'physical', tickDamage: 20, duration: 3 }] },
            charge: { id: 'charge', name: '冲锋', emoji: '🐂', skillType: 'melee', damageType: 'physical', targetType: 'random_enemy', range: 'melee', damage: 4500, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1, chance: 0.5 }] },
            terrifying_roar: { id: 'terrifying_roar', name: '恐惧咆哮', emoji: '🦁', skillType: 'ranged', damageType: 'physical', targetType: 'all_enemies', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'fear', duration: 2, chance: 0.4 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_rend: {
        id: 'boss_rend', name: '雷德·黑手', emoji: '👹',
        description: '黑石兽人酋长，骑乘黑龙盖斯作战。', type: 'boss', slot: 1,
        baseStats: { hp: 4800, damage: 4500, armor: 24, speed: 50 },
        loot: { exp: 380, gold: 95 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 2, damageModifier: 1.0, skills: ['dragon_breath', 'rend_strike'] },
            { hpPercent: 50, actionsPerTurn: 2, damageModifier: 1.3, skills: ['rend_strike', 'mortal_strike', 'whirlwind'],
              onEnter: { type: 'message', text: '👹 盖斯被击落！雷德跳下步战！' } },
            { hpPercent: 20, actionsPerTurn: 3, damageModifier: 1.5, skills: ['rend_strike', 'mortal_strike', 'whirlwind'],
              onEnter: { type: 'buff', name: 'lastStand', stat: 'damage', value: 30, duration: 99 } },
        ],
        enrage: { turns: 26, damageMultiplier: 2.5, message: '⚠️ 雷德·黑手爆发最后的怒火！' },
        skills: {
            dragon_breath: { id: 'dragon_breath', name: '龙焰吐息', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'all_enemies', range: 'ranged', damage: 1350, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'dot', name: 'dragonFlame', damageType: 'fire', tickDamage: 15, duration: 2 }] },
            rend_strike: { id: 'rend_strike', name: '撕裂打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1, effects: [] },
            mortal_strike: { id: 'mortal_strike', name: '致死打击', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 4500, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'debuff', name: 'mortalWound', stat: 'healReduction', value: -50, duration: 3 }] },
            whirlwind: { id: 'whirlwind', name: '旋风斩', emoji: '🌀', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 1800, cooldown: 3, actionPoints: 1, effects: [] },
        },
    },

    // 等级60: 新公式 finalDamage=2700 (最终BOSS)
    boss_drakkisath: {
        id: 'boss_drakkisath', name: '达基萨斯将军', emoji: '🐲',
        description: '黑石塔的龙人将军，奈法利安的左膀右臂。', type: 'boss', slot: 1,
        baseStats: { hp: 5500, damage: 4500, armor: 28, speed: 45 },
        loot: { exp: 450, gold: 120 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 2, damageModifier: 1.0, skills: ['cleave', 'fire_breath', 'conflagration'] },
            { hpPercent: 50, actionsPerTurn: 2, damageModifier: 1.3, skills: ['cleave', 'fire_breath', 'conflagration'],
              onEnter: { type: 'summon', summonId: 'summon_chromatic' } },
            { hpPercent: 20, actionsPerTurn: 3, damageModifier: 1.6, skills: ['cleave', 'fire_breath', 'conflagration'],
              onEnter: { type: 'buff', name: 'dragonFury', stat: 'damage', value: 35, duration: 99 } },
        ],
        enrage: { turns: 28, damageMultiplier: 3.0, message: '⚠️ 达基萨斯释放毁灭之焰！' },
        skills: {
            cleave: { id: 'cleave', name: '龙爪劈砍', emoji: '🦖', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 2250, cooldown: 2, actionPoints: 1, effects: [] },
            fire_breath: { id: 'fire_breath', name: '毁灭吐息', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'all_enemies', range: 'ranged', damage: 1350, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'dot', name: 'burn', damageType: 'fire', tickDamage: 18, duration: 3 }] },
            conflagration: { id: 'conflagration', name: '燃烧', emoji: '💥', skillType: 'ranged', damageType: 'fire', targetType: 'random_enemy', range: 'ranged', damage: 4500, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1, chance: 0.4 }] },
        },
    },

    summon_configs: {
        summon_whelps: {
            id: 'whelp_add', name: '黑翼雏龙', type: 'dragonkin', slot: 3, emoji: '🐉',
            stats: { hp: 250, damage: 30, armor: 6 }, speed: 65, loot: { exp: 15 },
            skills: [{ id: 'breath', name: '火焰吐息', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 30, cooldown: 0, actionPoints: 1, effects: [] }],
        },
        summon_chromatic: {
            id: 'chromatic_add', name: '五彩龙人', type: 'dragonkin', slot: 3, emoji: '🐉',
            stats: { hp: 500, damage: 55, armor: 18 }, speed: 50, loot: { exp: 30 },
            skills: [{ id: 'chromatic', name: '五彩吐息', emoji: '🌈', skillType: 'ranged', damageType: 'fire', targetType: 'front_2', range: 'ranged', damage: 40, cooldown: 2, actionPoints: 1, effects: [] }],
        },
    },

    getEncounter(id) { return this.encounters.find(e => e.id === id) },
    createBossInstance(bossId) {
        const cfg = this[bossId]; if (!cfg) return null
        return { ...cfg, currentHp: cfg.baseStats.hp, maxHp: cfg.baseStats.hp, currentPhase: 0, turnCount: 0, buffs: [], debuffs: [] }
    },
    createTrashInstance(waveId) {
        const wave = this[waveId]; if (!wave) return null
        return { ...wave, enemies: wave.enemies.map(e => ({ ...e, currentHp: e.stats.hp, maxHp: e.stats.hp, buffs: [], debuffs: [] })) }
    },
    createSummonInstance(summonId) {
        const cfg = this.summon_configs[summonId]; if (!cfg) return null
        return { ...cfg, currentHp: cfg.stats.hp, maxHp: cfg.stats.hp, buffs: [], debuffs: [] }
    },
}
