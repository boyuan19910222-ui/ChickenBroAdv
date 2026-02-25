/**
 * 厄运之槌副本数据
 * 推荐等级: 56-60
 * BOSS: 萨琳/伊利亚纳/托塞德林/戈多克大王/伊莫塔尔[3阶段]
 */
export const DireMaul = {
    id: 'dire_maul', name: '厄运之槌',
    description: '菲拉斯的上古精灵废墟，被食人魔和恶魔占据。',
    emoji: '🏛️',
    levelRange: { min: 56, max: 60 },
    difficulty: 'hard',
    rewards: { expBase: 580, goldBase: 290, lootTable: ['blueItem', 'epicItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '废墟入口' },
        { id: 'wave_2', type: 'trash', name: '精灵花园' },
        { id: 'boss_zevrim', type: 'boss', name: '萨琳·火树' },
        { id: 'wave_3', type: 'trash', name: '裂蹄牛营地' },
        { id: 'boss_illyanna', type: 'boss', name: '伊利亚纳·雷文克斯' },
        { id: 'wave_4', type: 'trash', name: '古树通道' },
        { id: 'wave_5', type: 'trash', name: '奥术图书馆' },
        { id: 'boss_tendris', type: 'boss', name: '托塞德林王子' },
        { id: 'wave_6', type: 'trash', name: '食人魔区' },
        { id: 'boss_gordok', type: 'boss', name: '戈多克大王' },
        { id: 'wave_7', type: 'trash', name: '恶魔通道' },
        { id: 'wave_8', type: 'trash', name: '伊莫塔尔监牢' },
        { id: 'boss_immolthar', type: 'boss', name: '伊莫塔尔' },
    ],

    wave_1: {
        id: 'wave_1', name: '废墟入口', description: '废墟中的枯木精',
        enemies: [
            { id: 'treant_1', name: '腐化树人', type: 'elemental', slot: 1, emoji: '🌳', stats: { hp: 600, damage: 50, armor: 20 }, speed: 35, loot: { exp: 48 },
              skills: [{ id: 'slam', name: '树臂重击', emoji: '🪵', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 50, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'treant_2', name: '腐化树人', type: 'elemental', slot: 2, emoji: '🌳', stats: { hp: 600, damage: 50, armor: 20 }, speed: 35, loot: { exp: 48 },
              skills: [{ id: 'slam', name: '树臂重击', emoji: '🪵', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 50, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'satyr_1', name: '邪恶萨特', type: 'demon', slot: 3, emoji: '😈', stats: { hp: 450, damage: 55, armor: 10 }, speed: 60, loot: { exp: 50 },
              skills: [{ id: 'bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 55, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '精灵花园', description: '腐化的自然守卫',
        enemies: [
            { id: 'lash_1', name: '鞭笞者', type: 'elemental', slot: 1, emoji: '🌿', stats: { hp: 520, damage: 48, armor: 8 }, speed: 55, loot: { exp: 46 },
              skills: [{ id: 'lash', name: '藤鞭', emoji: '🌿', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 38, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 10, duration: 2 }] }] },
            { id: 'lash_2', name: '鞭笞者', type: 'elemental', slot: 2, emoji: '🌿', stats: { hp: 520, damage: 48, armor: 8 }, speed: 55, loot: { exp: 46 },
              skills: [{ id: 'lash', name: '藤鞭', emoji: '🌿', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 38, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 10, duration: 2 }] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '裂蹄牛营地', description: '野蛮的裂蹄牛',
        enemies: [
            { id: 'beast_1', name: '裂蹄牛', type: 'beast', slot: 1, emoji: '🐂', stats: { hp: 700, damage: 55, armor: 16 }, speed: 45, loot: { exp: 52 },
              skills: [{ id: 'charge', name: '冲锋', emoji: '🐂', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 65, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1, chance: 0.4 }] }] },
            { id: 'beast_2', name: '裂蹄牛', type: 'beast', slot: 2, emoji: '🐂', stats: { hp: 700, damage: 55, armor: 16 }, speed: 45, loot: { exp: 52 },
              skills: [{ id: 'gore', name: '戳刺', emoji: '🦬', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 55, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '古树通道', description: '古老的树人守卫',
        enemies: [
            { id: 'ancient_1', name: '远古守护者', type: 'elemental', slot: 1, emoji: '🌳', stats: { hp: 850, damage: 58, armor: 24 }, speed: 30, loot: { exp: 56 },
              skills: [{ id: 'smash', name: '巨木打击', emoji: '🪵', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 58, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'sprite_1', name: '仙灵', type: 'elemental', slot: 2, emoji: '🧚', stats: { hp: 380, damage: 50, armor: 4 }, speed: 70, loot: { exp: 44 },
              skills: [{ id: 'bolt', name: '自然箭', emoji: '🌿', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 50, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '奥术图书馆', description: '堕落的精灵魔法师',
        enemies: [
            { id: 'elf_1', name: '堕落法师', type: 'humanoid', slot: 1, emoji: '🧝', stats: { hp: 500, damage: 62, armor: 10 }, speed: 55, loot: { exp: 54 },
              skills: [{ id: 'arcane', name: '奥术冲击', emoji: '🔮', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 62, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'elf_2', name: '堕落法师', type: 'humanoid', slot: 2, emoji: '🧝', stats: { hp: 500, damage: 62, armor: 10 }, speed: 55, loot: { exp: 54 },
              skills: [{ id: 'arcane', name: '奥术冲击', emoji: '🔮', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 62, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'elf_3', name: '堕落护卫', type: 'humanoid', slot: 3, emoji: '🧝', stats: { hp: 680, damage: 55, armor: 22 }, speed: 50, loot: { exp: 52 },
              skills: [{ id: 'slash', name: '月刃', emoji: '🌙', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 55, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_6: {
        id: 'wave_6', name: '食人魔区', description: '食人魔部族',
        enemies: [
            { id: 'ogre_1', name: '戈多克食人魔', type: 'ogre', slot: 1, emoji: '👹', stats: { hp: 800, damage: 60, armor: 18 }, speed: 35, loot: { exp: 56 },
              skills: [{ id: 'smash', name: '巨力粉碎', emoji: '💪', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 60, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'ogre_2', name: '戈多克法师', type: 'ogre', slot: 2, emoji: '👹', stats: { hp: 550, damage: 65, armor: 10 }, speed: 40, loot: { exp: 54 },
              skills: [{ id: 'bolt', name: '奥术飞弹', emoji: '🔮', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 65, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_7: {
        id: 'wave_7', name: '恶魔通道', description: '被封印的恶魔',
        enemies: [
            { id: 'demon_1', name: '恐惧魔王卫兵', type: 'demon', slot: 1, emoji: '😈', stats: { hp: 750, damage: 68, armor: 20 }, speed: 50, loot: { exp: 60 },
              skills: [{ id: 'strike', name: '恶魔之击', emoji: '🔥', skillType: 'melee', damageType: 'fire', targetType: 'enemy', range: 'melee', damage: 68, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'demon_2', name: '地狱犬', type: 'demon', slot: 2, emoji: '🐕', stats: { hp: 550, damage: 55, armor: 12 }, speed: 65, loot: { exp: 52 },
              skills: [{ id: 'bite', name: '烈焰撕咬', emoji: '🔥', skillType: 'melee', damageType: 'fire', targetType: 'enemy', range: 'melee', damage: 45, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'burn', damageType: 'fire', tickDamage: 12, duration: 2 }] }] },
        ],
    },
    wave_8: {
        id: 'wave_8', name: '伊莫塔尔监牢', description: '伊莫塔尔的恶魔仆从',
        enemies: [
            { id: 'demon_3', name: '恶魔守卫', type: 'demon', slot: 1, emoji: '😈', stats: { hp: 880, damage: 72, armor: 24 }, speed: 45, loot: { exp: 64 },
              skills: [{ id: 'smash', name: '恶魔粉碎', emoji: '💥', skillType: 'melee', damageType: 'fire', targetType: 'enemy', range: 'melee', damage: 72, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'demon_4', name: '恶魔守卫', type: 'demon', slot: 2, emoji: '😈', stats: { hp: 880, damage: 72, armor: 24 }, speed: 45, loot: { exp: 64 },
              skills: [{ id: 'smash', name: '恶魔粉碎', emoji: '💥', skillType: 'melee', damageType: 'fire', targetType: 'enemy', range: 'melee', damage: 72, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },

    // ========== BOSS ==========
    boss_zevrim: {
        id: 'boss_zevrim', name: '萨琳·火树', emoji: '😈',
        description: '萨特领主，擅长牺牲和暗影魔法。', type: 'boss', slot: 1,
        baseStats: { hp: 3400, damage: 68, armor: 16, speed: 55 },
        loot: { exp: 300, gold: 75 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['shadow_bolt', 'sacrifice'] },
            { hpPercent: 40, actionsPerTurn: 2, damageModifier: 1.4, skills: ['shadow_bolt', 'sacrifice', 'shadow_nova'],
              onEnter: { type: 'buff', name: 'darkPower', stat: 'damage', value: 20, duration: 99 } },
        ],
        enrage: { turns: 20, damageMultiplier: 2.0, message: '⚠️ 萨琳开始献祭仪式！' },
        skills: {
            shadow_bolt: { id: 'shadow_bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 68, cooldown: 0, actionPoints: 1, effects: [] },
            sacrifice: { id: 'sacrifice', name: '牺牲', emoji: '☠️', skillType: 'ranged', damageType: 'shadow', targetType: 'random_enemy', range: 'ranged', damage: 100, cooldown: 8, actionPoints: 1,
                effects: [{ type: 'lifesteal', value: 0.8 }] },
            shadow_nova: { id: 'shadow_nova', name: '暗影新星', emoji: '💜', skillType: 'ranged', damageType: 'shadow', targetType: 'all_enemies', range: 'ranged', damage: 40, cooldown: 4, actionPoints: 1, effects: [] },
        },
    },

    boss_illyanna: {
        id: 'boss_illyanna', name: '伊利亚纳·雷文克斯', emoji: '🧝',
        description: '堕落的暗夜精灵猎手和她的宠物熊。', type: 'boss', slot: 1,
        baseStats: { hp: 3600, damage: 65, armor: 18, speed: 60 },
        loot: { exp: 320, gold: 80 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['multishot', 'concussive_shot'] },
            { hpPercent: 45, actionsPerTurn: 2, damageModifier: 1.3, skills: ['multishot', 'concussive_shot', 'volley'],
              onEnter: { type: 'summon', summonId: 'summon_bear' } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.0, message: '⚠️ 伊利亚纳进入疯狂射击！' },
        skills: {
            multishot: { id: 'multishot', name: '多重射击', emoji: '🏹', skillType: 'ranged', damageType: 'physical', targetType: 'front_2', range: 'ranged', damage: 50, cooldown: 2, actionPoints: 1, effects: [] },
            concussive_shot: { id: 'concussive_shot', name: '震荡射击', emoji: '🎯', skillType: 'ranged', damageType: 'physical', targetType: 'enemy', range: 'ranged', damage: 65, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1, chance: 0.25 }] },
            volley: { id: 'volley', name: '乱射', emoji: '🏹', skillType: 'ranged', damageType: 'physical', targetType: 'all_enemies', range: 'ranged', damage: 35, cooldown: 4, actionPoints: 1, effects: [] },
        },
    },

    boss_tendris: {
        id: 'boss_tendris', name: '托塞德林王子', emoji: '🧝',
        description: '堕落的辛达雷精灵王子，吸取远古魔法维持生命。', type: 'boss', slot: 1,
        baseStats: { hp: 4000, damage: 72, armor: 14, speed: 55 },
        loot: { exp: 360, gold: 90 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['arcane_blast', 'mana_drain'] },
            { hpPercent: 50, actionsPerTurn: 2, damageModifier: 1.3, skills: ['arcane_blast', 'mana_drain', 'counterspell'],
              onEnter: { type: 'message', text: '🧝 托塞德林开始疯狂汲取魔力！' } },
            { hpPercent: 20, actionsPerTurn: 2, damageModifier: 1.6, skills: ['arcane_blast', 'mana_drain', 'counterspell'],
              onEnter: { type: 'buff', name: 'arcaneFury', stat: 'damage', value: 30, duration: 99 } },
        ],
        enrage: { turns: 24, damageMultiplier: 2.5, message: '⚠️ 托塞德林释放所有汲取的魔力！' },
        skills: {
            arcane_blast: { id: 'arcane_blast', name: '奥术冲击', emoji: '🔮', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 72, cooldown: 0, actionPoints: 1, effects: [] },
            mana_drain: { id: 'mana_drain', name: '法力虹吸', emoji: '💫', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 50, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'lifesteal', value: 0.5 }] },
            counterspell: { id: 'counterspell', name: '法术反制', emoji: '🚫', skillType: 'ranged', damageType: 'arcane', targetType: 'random_enemy', range: 'ranged', damage: 30, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'silence', duration: 2, chance: 0.6 }] },
        },
    },

    boss_gordok: {
        id: 'boss_gordok', name: '戈多克大王', emoji: '👹',
        description: '食人魔部族的首领，力大无穷。', type: 'boss', slot: 1,
        baseStats: { hp: 4200, damage: 75, armor: 26, speed: 35 },
        loot: { exp: 340, gold: 85 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['war_stomp', 'mortal_strike'] },
            { hpPercent: 35, actionsPerTurn: 2, damageModifier: 1.5, skills: ['war_stomp', 'mortal_strike', 'frenzy'],
              onEnter: { type: 'buff', name: 'ogreFrenzy', stat: 'damage', value: 25, duration: 99 } },
        ],
        enrage: { turns: 20, damageMultiplier: 2.0, message: '⚠️ 戈多克大王暴怒了！' },
        skills: {
            war_stomp: { id: 'war_stomp', name: '战争践踏', emoji: '🦶', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 45, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1, chance: 0.35 }] },
            mortal_strike: { id: 'mortal_strike', name: '致死打击', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 75, cooldown: 0, actionPoints: 1, effects: [] },
            frenzy: { id: 'frenzy', name: '狂暴', emoji: '😤', skillType: 'buff', damageType: 'physical', targetType: 'self', range: 'self', damage: 0, cooldown: 8, actionPoints: 1,
                effects: [{ type: 'buff', name: 'frenzy', stat: 'speed', value: 20, duration: 3 }] },
        },
    },

    boss_immolthar: {
        id: 'boss_immolthar', name: '伊莫塔尔', emoji: '👁️',
        description: '被封印的强大恶魔，拥有毁灭性的力量。', type: 'boss', slot: 1,
        baseStats: { hp: 5500, damage: 80, armor: 22, speed: 45 },
        loot: { exp: 450, gold: 120 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 2, damageModifier: 1.0, skills: ['eye_beam', 'portal_strike'] },
            { hpPercent: 60, actionsPerTurn: 2, damageModifier: 1.3, skills: ['eye_beam', 'portal_strike', 'demonic_frenzy'],
              onEnter: { type: 'summon', summonId: 'summon_eye' } },
            { hpPercent: 25, actionsPerTurn: 3, damageModifier: 1.6, skills: ['eye_beam', 'portal_strike', 'demonic_frenzy'],
              onEnter: { type: 'buff', name: 'demonicRage', stat: 'damage', value: 35, duration: 99 } },
        ],
        enrage: { turns: 28, damageMultiplier: 3.0, message: '⚠️ 伊莫塔尔挣脱了所有封印！' },
        skills: {
            eye_beam: { id: 'eye_beam', name: '死亡射线', emoji: '👁️', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 90, cooldown: 4, actionPoints: 1, effects: [] },
            portal_strike: { id: 'portal_strike', name: '传送打击', emoji: '🌀', skillType: 'melee', damageType: 'shadow', targetType: 'random_enemy', range: 'melee', damage: 70, cooldown: 0, actionPoints: 1, effects: [] },
            demonic_frenzy: { id: 'demonic_frenzy', name: '恶魔狂暴', emoji: '😈', skillType: 'ranged', damageType: 'fire', targetType: 'all_enemies', range: 'ranged', damage: 45, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'dot', name: 'demonicFlame', damageType: 'fire', tickDamage: 18, duration: 3 }] },
        },
    },

    summon_configs: {
        summon_bear: {
            id: 'bear', name: '伊利亚纳的战熊', type: 'beast', slot: 3, emoji: '🐻',
            stats: { hp: 500, damage: 45, armor: 18 }, speed: 45, loot: { exp: 25 },
            skills: [{ id: 'swipe', name: '熊掌拍击', emoji: '🐻', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 45, cooldown: 0, actionPoints: 1, effects: [] }],
        },
        summon_eye: {
            id: 'evil_eye', name: '恶魔之眼', type: 'demon', slot: 3, emoji: '👁️',
            stats: { hp: 350, damage: 50, armor: 6 }, speed: 60, loot: { exp: 20 },
            skills: [{ id: 'beam', name: '凝视射线', emoji: '👁️', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 50, cooldown: 0, actionPoints: 1, effects: [] }],
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
