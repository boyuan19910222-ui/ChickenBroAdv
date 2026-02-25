/**
 * 影牙城堡副本数据
 * 推荐等级: 22-30, BOSS: 拉文凯斯/斯普林瓦尔/沃尔夫/沃尔登/戈弗雷
 */
export const ShadowfangKeep = {
    id: 'shadowfang_keep', name: '影牙城堡', description: '银松森林中被诅咒的城堡，充满亡灵和狼人。',
    emoji: '🏰', levelRange: { min: 22, max: 30 }, difficulty: 'normal',
    rewards: { expBase: 220, goldBase: 110, lootTable: ['greenItem', 'blueItem'] },
    encounters: [
        { id: 'wave_1', type: 'trash', name: '城堡大门' }, { id: 'wave_2', type: 'trash', name: '前厅巡逻' },
        { id: 'boss_rethilgore', type: 'boss', name: '拉文凯斯男爵' },
        { id: 'wave_3', type: 'trash', name: '骑士大厅' }, { id: 'wave_4', type: 'trash', name: '暗影走廊' },
        { id: 'boss_springvale', type: 'boss', name: '斯普林瓦尔' },
        { id: 'wave_5', type: 'trash', name: '城堡阳台' }, { id: 'wave_6', type: 'trash', name: '密室通道' },
        { id: 'boss_ashbury', type: 'boss', name: '沃尔夫勋爵' },
        { id: 'wave_7', type: 'trash', name: '炼金实验室' }, { id: 'wave_8', type: 'trash', name: '塔顶守卫' },
        { id: 'boss_walden', type: 'boss', name: '沃尔登领主' },
        { id: 'wave_9', type: 'trash', name: '戈弗雷的近卫' },
        { id: 'boss_godfrey', type: 'boss', name: '大领主戈弗雷' },
    ],
    // 小怪波次
    wave_1: { id: 'wave_1', name: '城堡大门守卫', description: '亡灵哨兵', enemies: [
        { id: 'ghoul_1', name: '食尸鬼', type: 'undead', slot: 1, emoji: '🧟', stats: { hp: 130, damage: 18, armor: 4 }, speed: 60, loot: { exp: 18 }, skills: [{ id: 'claw', name: '撕抓', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'ghoul_2', name: '食尸鬼', type: 'undead', slot: 2, emoji: '🧟', stats: { hp: 130, damage: 18, armor: 4 }, speed: 60, loot: { exp: 18 }, skills: [{ id: 'claw', name: '撕抓', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'wolf_1', name: '影牙狼', type: 'beast', slot: 3, emoji: '🐺', stats: { hp: 100, damage: 20, armor: 3 }, speed: 75, loot: { exp: 16 }, skills: [{ id: 'bite', name: '撕咬', emoji: '🐺', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_2: { id: 'wave_2', name: '前厅巡逻', description: '巡逻的亡灵', enemies: [
        { id: 'skeleton_1', name: '骷髅战士', type: 'undead', slot: 1, emoji: '💀', stats: { hp: 120, damage: 17, armor: 6 }, speed: 50, loot: { exp: 17 }, skills: [{ id: 'strike', name: '劈砍', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 17, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'necro_1', name: '亡灵法师', type: 'undead', slot: 2, emoji: '🧙', stats: { hp: 95, damage: 18, armor: 2 }, speed: 50, loot: { exp: 18 }, skills: [{ id: 'shadow_bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_3: { id: 'wave_3', name: '骑士大厅', description: '亡灵骑士', enemies: [
        { id: 'knight_1', name: '幽灵骑士', type: 'undead', slot: 1, emoji: '🗡️', stats: { hp: 150, damage: 20, armor: 10 }, speed: 45, loot: { exp: 20 }, skills: [{ id: 'lance', name: '骑枪冲刺', emoji: '🗡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'knight_2', name: '幽灵骑士', type: 'undead', slot: 2, emoji: '🗡️', stats: { hp: 150, damage: 20, armor: 10 }, speed: 45, loot: { exp: 20 }, skills: [{ id: 'lance', name: '骑枪冲刺', emoji: '🗡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_4: { id: 'wave_4', name: '暗影走廊', description: '游荡怨灵', enemies: [
        { id: 'wraith_1', name: '暗影幽灵', type: 'undead', slot: 1, emoji: '👻', stats: { hp: 110, damage: 20, armor: 0 }, speed: 65, loot: { exp: 18 }, skills: [{ id: 'shadow_strike', name: '暗影打击', emoji: '🌑', skillType: 'melee', damageType: 'shadow', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'ghoul_3', name: '腐化食尸鬼', type: 'undead', slot: 2, emoji: '🧟', stats: { hp: 140, damage: 19, armor: 5 }, speed: 55, loot: { exp: 19 }, skills: [{ id: 'rend', name: '撕裂', emoji: '🩸', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 16, cooldown: 0, actionPoints: 1, effects: [{ type: 'dot', name: 'bleed', damageType: 'physical', tickDamage: 6, duration: 3 }] }] },
    ]},
    wave_5: { id: 'wave_5', name: '城堡阳台', description: '蝙蝠群', enemies: [
        { id: 'bat_1', name: '暗影蝙蝠', type: 'beast', slot: 1, emoji: '🦇', stats: { hp: 80, damage: 16, armor: 0 }, speed: 85, loot: { exp: 14 }, skills: [{ id: 'screech', name: '尖啸', emoji: '🦇', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 16, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'bat_2', name: '暗影蝙蝠', type: 'beast', slot: 2, emoji: '🦇', stats: { hp: 80, damage: 16, armor: 0 }, speed: 85, loot: { exp: 14 }, skills: [{ id: 'screech', name: '尖啸', emoji: '🦇', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 16, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'bat_3', name: '暗影蝙蝠', type: 'beast', slot: 3, emoji: '🦇', stats: { hp: 80, damage: 16, armor: 0 }, speed: 85, loot: { exp: 14 }, skills: [{ id: 'screech', name: '尖啸', emoji: '🦇', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 16, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_6: { id: 'wave_6', name: '密室通道', description: '血肉傀儡', enemies: [
        { id: 'construct_1', name: '血肉傀儡', type: 'undead', slot: 1, emoji: '🧟', stats: { hp: 170, damage: 22, armor: 8 }, speed: 40, loot: { exp: 20 }, skills: [{ id: 'smash', name: '重拳', emoji: '👊', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 25, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_7: { id: 'wave_7', name: '炼金实验室', description: '实验品', enemies: [
        { id: 'ooze_1', name: '毒液软泥怪', type: 'elemental', slot: 1, emoji: '🟢', stats: { hp: 160, damage: 17, armor: 3 }, speed: 35, loot: { exp: 18 }, skills: [{ id: 'acid', name: '酸液', emoji: '🟢', skillType: 'ranged', damageType: 'nature', targetType: 'front_2', range: 'melee', damage: 14, cooldown: 0, actionPoints: 1, effects: [{ type: 'dot', name: 'acid', damageType: 'nature', tickDamage: 5, duration: 3 }] }] },
        { id: 'rat_1', name: '变异巨鼠', type: 'beast', slot: 2, emoji: '🐀', stats: { hp: 90, damage: 18, armor: 2 }, speed: 70, loot: { exp: 14 }, skills: [{ id: 'gnaw', name: '啃咬', emoji: '🐀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_8: { id: 'wave_8', name: '塔顶守卫', description: '弓手', enemies: [
        { id: 'archer_1', name: '暗影弓手', type: 'undead', slot: 1, emoji: '🏹', stats: { hp: 110, damage: 22, armor: 3 }, speed: 60, loot: { exp: 20 }, skills: [{ id: 'arrow', name: '暗影箭', emoji: '🏹', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'archer_2', name: '暗影弓手', type: 'undead', slot: 2, emoji: '🏹', stats: { hp: 110, damage: 22, armor: 3 }, speed: 60, loot: { exp: 20 }, skills: [{ id: 'arrow', name: '暗影箭', emoji: '🏹', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    wave_9: { id: 'wave_9', name: '戈弗雷的近卫', description: '精锐近卫', enemies: [
        { id: 'guard_1', name: '亡灵近卫', type: 'undead', slot: 1, emoji: '💀', stats: { hp: 160, damage: 22, armor: 10 }, speed: 50, loot: { exp: 22 }, skills: [{ id: 'cleave', name: '顺劈', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }] },
        { id: 'guard_2', name: '亡灵近卫', type: 'undead', slot: 2, emoji: '💀', stats: { hp: 160, damage: 22, armor: 10 }, speed: 50, loot: { exp: 22 }, skills: [{ id: 'cleave', name: '顺劈', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }] },
    ]},
    // BOSS
    // 等级30: baseDamage=1500, difficultyMultiplier=0.5, finalDamage=750
    boss_rethilgore: {
        id: 'rethilgore', name: '拉文凯斯男爵', type: 'boss', slot: 2, emoji: '🧛', loot: { exp: 70 },
        baseStats: { hp: 700, damage: 750, armor: 8 }, speed: 55,
        phases: [{ id: 1, name: '亡灵之主', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['void_bolt', 'shadow_drain'] }],
        enrage: { triggerRound: 13, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'shadow', message: '💀 暗影吞噬！' }, message: '💀 拉文凯斯狂暴了！' },
        skills: {
            void_bolt: { id: 'void_bolt', name: '虚无箭', emoji: '🌑', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 30, cooldown: 0, actionPoints: 1, effects: [] },
            shadow_drain: { id: 'shadow_drain', name: '暗影吸取', emoji: '💜', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 20, cooldown: 3, actionPoints: 1, effects: [{ type: 'dot', name: 'drain', damageType: 'shadow', tickDamage: 6, duration: 3 }] },
        },
    },
    // 等级30: baseDamage=1500, difficultyMultiplier=0.5, finalDamage=750
    boss_springvale: {
        id: 'springvale', name: '指挥官斯普林瓦尔', type: 'boss', slot: 2, emoji: '🛡️', loot: { exp: 80 },
        baseStats: { hp: 850, damage: 750, armor: 14 }, speed: 50,
        phases: [{ id: 1, name: '圣光守护', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['holy_shield', 'divine_strike', 'shield_bash'] }],
        enrage: { triggerRound: 14, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'holy', message: '✨ 腐化圣光！' }, message: '💀 斯普林瓦尔狂暴了！' },
        skills: {
            holy_shield: { id: 'holy_shield', name: '神圣之盾', emoji: '✨', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1, effects: [{ type: 'buff', name: 'holy_shield', stat: 'armor', value: 15, duration: 2 }] },
            divine_strike: { id: 'divine_strike', name: '神圣打击', emoji: '⚔️', skillType: 'melee', damageType: 'holy', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] },
            shield_bash: { id: 'shield_bash', name: '盾击', emoji: '🛡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 3, actionPoints: 1, effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] },
        },
    },
    // 等级30: baseDamage=1500, difficultyMultiplier=0.5, finalDamage=750
    boss_ashbury: {
        id: 'ashbury', name: '沃尔夫勋爵', type: 'boss', slot: 2, emoji: '🧛', loot: { exp: 85 },
        baseStats: { hp: 900, damage: 750, armor: 6 }, speed: 55,
        phases: [{ id: 1, name: '暗影领主', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['asphyxiate', 'dark_heal', 'shadow_bolt'] }],
        enrage: { triggerRound: 14, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'shadow', message: '💀 窒息黑暗！' }, message: '💀 沃尔夫狂暴了！' },
        skills: {
            asphyxiate: { id: 'asphyxiate', name: '窒息之握', emoji: '🤚', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 15, cooldown: 4, actionPoints: 1, effects: [{ type: 'cc', ccType: 'stun', duration: 1 }, { type: 'dot', name: 'asphyxiate', damageType: 'shadow', tickDamage: 8, duration: 2 }] },
            dark_heal: { id: 'dark_heal', name: '黑暗愈合', emoji: '💚', skillType: 'heal', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1, effects: [],
                telegraph: { chargeRounds: 1, chargeMessage: '⚠️ 沃尔夫开始施放黑暗愈合！', releaseMessage: '💚 沃尔夫恢复大量生命值！', warningIcon: '💚' } },
            shadow_bolt: { id: 'shadow_bolt', name: '暗影箭', emoji: '🌑', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 28, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },
    // 等级30: baseDamage=1500, difficultyMultiplier=0.5, finalDamage=750
    boss_walden: {
        id: 'walden', name: '沃尔登领主', type: 'boss', slot: 2, emoji: '🧪', loot: { exp: 90 },
        baseStats: { hp: 950, damage: 750, armor: 8 }, speed: 55,
        phases: [
            { id: 1, name: '毒药阶段', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['poison_mix', 'toxic_fog'] },
            { id: 2, name: '冰霜阶段', hpThreshold: 0.5, actionsPerTurn: 2, damageModifier: 1.15, skills: ['ice_shard', 'frost_nova'],
              onEnter: { type: 'transform', message: '❄️ 沃尔登切换到冰霜炼金！' } },
        ],
        enrage: { triggerRound: 14, damageModifier: 1.8, aoePerRound: { damage: 30, type: 'nature', message: '☠️ 毒雾寒冰交织！' }, message: '💀 沃尔登狂暴了！' },
        skills: {
            poison_mix: { id: 'poison_mix', name: '毒药混合', emoji: '🧪', skillType: 'spell', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 12, cooldown: 0, actionPoints: 1, effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 8, duration: 3 }] },
            toxic_fog: { id: 'toxic_fog', name: '毒雾', emoji: '☁️', skillType: 'spell', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 10, cooldown: 4, actionPoints: 1, effects: [{ type: 'debuff', name: 'weakness', stat: 'damage', value: -0.2, duration: 2 }] },
            ice_shard: { id: 'ice_shard', name: '寒冰箭', emoji: '❄️', skillType: 'spell', damageType: 'frost', targetType: 'enemy', range: 'ranged', damage: 32, cooldown: 0, actionPoints: 1, effects: [] },
            frost_nova: { id: 'frost_nova', name: '冰冻', emoji: '🧊', skillType: 'spell', damageType: 'frost', targetType: 'all_enemies', range: 'ranged', damage: 12, cooldown: 5, actionPoints: 1, effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] },
        },
    },
    // 等级30: baseDamage=1500, difficultyMultiplier=0.5, finalDamage=750
    boss_godfrey: {
        id: 'godfrey', name: '大领主戈弗雷', type: 'boss', slot: 2, emoji: '🔫', loot: { exp: 100 },
        baseStats: { hp: 1100, damage: 750, armor: 10 }, speed: 60,
        phases: [
            { id: 1, name: '暗影领主', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['cursed_barrage', 'pistol_shot', 'summon_ghoul'] },
            { id: 2, name: '绝望反击', hpThreshold: 0.3, actionsPerTurn: 3, damageModifier: 1.3, skills: ['cursed_barrage', 'pistol_shot'],
              onEnter: { type: 'transform', message: '🔥 戈弗雷进入狂暴！"你们都去死！"' } },
        ],
        enrage: { triggerRound: 15, damageModifier: 2.0, aoePerRound: { damage: 35, type: 'shadow', message: '💀 诅咒弹幕！' }, message: '💀 戈弗雷狂暴了！' },
        skills: {
            cursed_barrage: { id: 'cursed_barrage', name: '诅咒弹幕', emoji: '💀', skillType: 'spell', damageType: 'shadow', targetType: 'front_3', range: 'ranged', damage: 22, cooldown: 2, actionPoints: 1, effects: [] },
            pistol_shot: { id: 'pistol_shot', name: '手枪射击', emoji: '🔫', skillType: 'ranged', damageType: 'physical', targetType: 'enemy', range: 'ranged', damage: 35, cooldown: 0, actionPoints: 1, effects: [] },
            summon_ghoul: { id: 'summon_ghoul', name: '召唤食尸鬼', emoji: '🧟', skillType: 'summon', damageType: null, targetType: 'summon', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1, effects: [], summonId: 'ghoul' },
        },
    },
    // 召唤物定义
    ghoul: { id: 'ghoul', name: '腐尸食尸鬼', type: 'undead', emoji: '🧟', stats: { hp: 180, damage: 20, armor: 5 }, speed: 55, skills: [
        { id: 'claw', name: '撕抓', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [] },
        { id: 'rend', name: '撕裂', emoji: '🩸', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 15, cooldown: 3, actionPoints: 1, effects: [{ type: 'dot', name: 'bleed', damageType: 'physical', tickDamage: 8, duration: 3 }] },
    ]},
    // 辅助方法
    getEncounter(id) { return this[id] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(key) {
        const bc = this[key || 'boss_rethilgore']; if (!bc) return null
        return { id: bc.id, name: bc.name, type: bc.type, isBoss: true, slot: bc.slot, emoji: bc.emoji, currentHp: bc.baseStats.hp, maxHp: bc.baseStats.hp, damage: bc.baseStats.damage, armor: bc.baseStats.armor, speed: bc.speed, phases: bc.phases, enrage: bc.enrage, skillData: bc.skills, loot: bc.loot || { exp: 0 } }
    },
    createTrashInstance(waveId) {
        const w = this[waveId]; if (!w) return []
        return w.enemies.map(e => ({ id: e.id, name: e.name, type: e.type, slot: e.slot, emoji: e.emoji, currentHp: e.stats.hp, maxHp: e.stats.hp, damage: e.stats.damage, armor: e.stats.armor, speed: e.speed, skills: e.skills, loot: e.loot || { exp: 0 } }))
    },
    createSummonInstance(summonId, slot) { const c = this[summonId]; if (!c) return null; return { id: `${c.id}_${Date.now()}`, name: c.name, type: c.type, slot: slot || 3, emoji: c.emoji, currentHp: c.stats.hp, maxHp: c.stats.hp, damage: c.stats.damage, armor: c.stats.armor, speed: c.speed, skills: c.skills } },
}
