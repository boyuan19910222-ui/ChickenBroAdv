/**
 * 怒焰裂谷副本数据
 * 
 * 推荐等级: 13-18
 * 难度: 普通
 * BOSS: 奥格芬格/塔拉加曼/杰格罗什/巴扎兰
 */
export const RagefireChasm = {
    id: 'ragefire_chasm',
    name: '怒焰裂谷',
    description: '奥格瑞玛地下的火焰洞穴，被邪恶的暗影议会成员和恶魔占据。',
    emoji: '🔥',
    levelRange: { min: 13, max: 18 },
    difficulty: 'normal',
    rewards: { expBase: 120, goldBase: 60, lootTable: ['greenItem', 'blueItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '洞穴入口' },
        { id: 'wave_2', type: 'trash', name: '火焰甬道' },
        { id: 'boss_oggleflint', type: 'boss', name: '奥格芬格' },
        { id: 'wave_3', type: 'trash', name: '熔岩通道' },
        { id: 'wave_4', type: 'trash', name: '恶魔据点' },
        { id: 'boss_taragaman', type: 'boss', name: '塔拉加曼' },
        { id: 'wave_5', type: 'trash', name: '暗影祭坛外围' },
        { id: 'wave_6', type: 'trash', name: '暗影议会守卫' },
        { id: 'boss_jergosh', type: 'boss', name: '杰格罗什' },
        { id: 'wave_7', type: 'trash', name: '恶魔巢穴' },
        { id: 'wave_8', type: 'trash', name: '深渊通道' },
        { id: 'boss_bazzalan', type: 'boss', name: '巴扎兰' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '洞穴入口守卫', description: '巡逻的巨魔战士',
        enemies: [
            { id: 'troll_1', name: '烈焰巨魔', type: 'troll', slot: 1, emoji: '👹',
              stats: { hp: 90, damage: 12, armor: 4 }, speed: 55, loot: { exp: 12 },
              skills: [
                { id: 'strike', name: '猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 12, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
            { id: 'troll_2', name: '烈焰巨魔', type: 'troll', slot: 2, emoji: '👹',
              stats: { hp: 90, damage: 12, armor: 4 }, speed: 55, loot: { exp: 12 },
              skills: [
                { id: 'strike', name: '猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 12, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
            { id: 'imp_1', name: '小鬼', type: 'demon', slot: 3, emoji: '👿',
              stats: { hp: 50, damage: 10, armor: 0 }, speed: 70, loot: { exp: 8 },
              skills: [
                { id: 'fire_bolt', name: '火焰弹', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 10, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
        ]
    },
    wave_2: {
        id: 'wave_2', name: '火焰甬道巡逻', description: '火焰元素在甬道中游荡',
        enemies: [
            { id: 'elemental_1', name: '烈焰精灵', type: 'elemental', slot: 1, emoji: '🔥',
              stats: { hp: 70, damage: 14, armor: 2 }, speed: 60, loot: { exp: 14 },
              skills: [
                { id: 'fire_blast', name: '火焰冲击', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 14, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
            { id: 'elemental_2', name: '烈焰精灵', type: 'elemental', slot: 2, emoji: '🔥',
              stats: { hp: 70, damage: 14, armor: 2 }, speed: 60, loot: { exp: 14 },
              skills: [
                { id: 'fire_blast', name: '火焰冲击', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 14, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
            { id: 'troll_3', name: '暗影议会密探', type: 'troll', slot: 3, emoji: '🧙',
              stats: { hp: 85, damage: 11, armor: 3 }, speed: 50, loot: { exp: 11 },
              skills: [
                { id: 'shadow_bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 11, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
        ]
    },
    wave_3: {
        id: 'wave_3', name: '熔岩通道', description: '守护在熔岩边的烈焰犬',
        enemies: [
            { id: 'hound_1', name: '地狱犬', type: 'beast', slot: 1, emoji: '🐕',
              stats: { hp: 80, damage: 13, armor: 3 }, speed: 75, loot: { exp: 13 },
              skills: [
                { id: 'bite', name: '撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 13, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'flame_breath', name: '喷火', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'front_2', range: 'melee', damage: 8, cooldown: 3, actionPoints: 1, effects: [] }
              ]},
            { id: 'hound_2', name: '地狱犬', type: 'beast', slot: 2, emoji: '🐕',
              stats: { hp: 80, damage: 13, armor: 3 }, speed: 75, loot: { exp: 13 },
              skills: [
                { id: 'bite', name: '撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 13, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
        ]
    },
    wave_4: {
        id: 'wave_4', name: '恶魔据点', description: '恶魔聚集之处',
        enemies: [
            { id: 'imp_2', name: '恶魔小鬼', type: 'demon', slot: 1, emoji: '👿',
              stats: { hp: 55, damage: 11, armor: 0 }, speed: 75, loot: { exp: 9 },
              skills: [
                { id: 'fire_bolt', name: '火焰弹', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 11, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
            { id: 'imp_3', name: '恶魔小鬼', type: 'demon', slot: 2, emoji: '👿',
              stats: { hp: 55, damage: 11, armor: 0 }, speed: 75, loot: { exp: 9 },
              skills: [
                { id: 'fire_bolt', name: '火焰弹', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 11, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
            { id: 'felguard_1', name: '恶魔卫兵', type: 'demon', slot: 3, emoji: '😈',
              stats: { hp: 120, damage: 16, armor: 6 }, speed: 45, loot: { exp: 16 },
              skills: [
                { id: 'cleave', name: '顺劈', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 12, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
        ]
    },
    wave_5: {
        id: 'wave_5', name: '暗影祭坛外围', description: '暗影议会的信徒',
        enemies: [
            { id: 'cultist_1', name: '暗影术士', type: 'cultist', slot: 1, emoji: '🧙',
              stats: { hp: 95, damage: 13, armor: 3 }, speed: 50, loot: { exp: 13 },
              skills: [
                { id: 'shadow_bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 13, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
            { id: 'cultist_2', name: '暗影术士', type: 'cultist', slot: 2, emoji: '🧙',
              stats: { hp: 95, damage: 13, armor: 3 }, speed: 50, loot: { exp: 13 },
              skills: [
                { id: 'shadow_bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 13, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
        ]
    },
    wave_6: {
        id: 'wave_6', name: '暗影议会守卫', description: '精锐的守卫',
        enemies: [
            { id: 'guard_1', name: '议会护卫', type: 'humanoid', slot: 1, emoji: '💂',
              stats: { hp: 110, damage: 15, armor: 8 }, speed: 50, loot: { exp: 15 },
              skills: [
                { id: 'shield_bash', name: '盾击', emoji: '🛡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 15, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
            { id: 'warlock_1', name: '议会术士', type: 'humanoid', slot: 2, emoji: '🧙',
              stats: { hp: 80, damage: 14, armor: 2 }, speed: 55, loot: { exp: 14 },
              skills: [
                { id: 'immolate', name: '献祭', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 8, cooldown: 0, actionPoints: 1, effects: [{ type: 'dot', name: 'immolate', damageType: 'fire', tickDamage: 5, duration: 3 }] }
              ]},
        ]
    },
    wave_7: {
        id: 'wave_7', name: '恶魔巢穴', description: '恶魔巢穴中的守卫',
        enemies: [
            { id: 'succubus_1', name: '魅魔', type: 'demon', slot: 1, emoji: '😈',
              stats: { hp: 75, damage: 14, armor: 2 }, speed: 65, loot: { exp: 14 },
              skills: [
                { id: 'lash', name: '鞭笞', emoji: '⚡', skillType: 'melee', damageType: 'shadow', targetType: 'enemy', range: 'melee', damage: 14, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
            { id: 'felguard_2', name: '恶魔卫兵', type: 'demon', slot: 2, emoji: '😈',
              stats: { hp: 120, damage: 16, armor: 6 }, speed: 45, loot: { exp: 16 },
              skills: [
                { id: 'cleave', name: '顺劈', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 12, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
        ]
    },
    wave_8: {
        id: 'wave_8', name: '深渊通道', description: '通往最终boss的路上',
        enemies: [
            { id: 'troll_elite', name: '暗影议会精英', type: 'troll', slot: 1, emoji: '👹',
              stats: { hp: 110, damage: 15, armor: 5 }, speed: 55, loot: { exp: 15 },
              skills: [
                { id: 'strike', name: '猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 15, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'war_cry', name: '战吼', emoji: '📢', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 4, actionPoints: 1, effects: [{ type: 'buff', name: 'war_cry', stat: 'damage', value: 0.3, duration: 2 }] }
              ]},
            { id: 'imp_4', name: '恶魔小鬼', type: 'demon', slot: 2, emoji: '👿',
              stats: { hp: 55, damage: 11, armor: 0 }, speed: 75, loot: { exp: 9 },
              skills: [
                { id: 'fire_bolt', name: '火焰弹', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 11, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
            { id: 'imp_5', name: '恶魔小鬼', type: 'demon', slot: 3, emoji: '👿',
              stats: { hp: 55, damage: 11, armor: 0 }, speed: 75, loot: { exp: 9 },
              skills: [
                { id: 'fire_bolt', name: '火焰弹', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 11, cooldown: 0, actionPoints: 1, effects: [] }
              ]},
        ]
    },

    // ========== BOSS: 奥格芬格 ==========
    boss_oggleflint: {
        id: 'oggleflint', name: '奥格芬格', type: 'boss', slot: 2, emoji: '👹',
        loot: { exp: 45 },
        baseStats: { hp: 450, damage: 22, armor: 8 },
        speed: 50,
        phases: [
            { id: 1, name: '战斗者', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['heavy_strike', 'war_cry'] },
        ],
        enrage: { triggerRound: 12, damageModifier: 1.8, aoePerRound: { damage: 20, type: 'physical', message: '💀 奥格芬格狂暴地挥舞大棒！' }, message: '💀 奥格芬格狂暴了！' },
        skills: {
            heavy_strike: { id: 'heavy_strike', name: '重击', emoji: '🔨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 30, cooldown: 0, actionPoints: 1, effects: [] },
            war_cry: { id: 'war_cry', name: '战斗怒吼', emoji: '📢', description: '提升自身伤害', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 4, actionPoints: 1, effects: [{ type: 'buff', name: 'war_cry', stat: 'damage', value: 0.3, duration: 2 }] },
        },
    },

    // ========== BOSS: 塔拉加曼 ==========
    boss_taragaman: {
        id: 'taragaman', name: '塔拉加曼', type: 'boss', slot: 2, emoji: '😈',
        loot: { exp: 55 },
        baseStats: { hp: 550, damage: 18, armor: 5 },
        speed: 55,
        phases: [
            { id: 1, name: '烈焰领主', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['fire_strike', 'fire_nova'] },
        ],
        enrage: { triggerRound: 12, damageModifier: 1.8, aoePerRound: { damage: 25, type: 'fire', message: '🔥 塔拉加曼的烈焰吞噬一切！' }, message: '💀 塔拉加曼狂暴了！' },
        skills: {
            fire_strike: { id: 'fire_strike', name: '火焰打击', emoji: '🔥', skillType: 'spell', damageType: 'fire', targetType: 'all_enemies', range: 'ranged', damage: 15, cooldown: 0, actionPoints: 1, effects: [] },
            fire_nova: { id: 'fire_nova', name: '火焰新星', emoji: '💥', skillType: 'spell', damageType: 'fire', targetType: 'front_3', range: 'melee', damage: 22, cooldown: 3, actionPoints: 1, effects: [{ type: 'dot', name: 'burning', damageType: 'fire', tickDamage: 6, duration: 3 }] },
        },
    },

    // ========== BOSS: 杰格罗什 ==========
    boss_jergosh: {
        id: 'jergosh', name: '杰格罗什', type: 'boss', slot: 2, emoji: '🧙',
        loot: { exp: 60 },
        baseStats: { hp: 500, damage: 16, armor: 4 },
        speed: 55,
        phases: [
            { id: 1, name: '暗影术士', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['immolate', 'curse_weakness', 'shadow_bolt'] },
        ],
        enrage: { triggerRound: 13, damageModifier: 1.8, aoePerRound: { damage: 25, type: 'shadow', message: '🌑 暗影能量吞噬一切！' }, message: '💀 杰格罗什狂暴了！' },
        skills: {
            immolate: { id: 'immolate', name: '献祭', emoji: '🔥', skillType: 'spell', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 10, cooldown: 0, actionPoints: 1, effects: [{ type: 'dot', name: 'immolate', damageType: 'fire', tickDamage: 6, duration: 3 }] },
            curse_weakness: { id: 'curse_weakness', name: '虚弱诅咒', emoji: '💀', skillType: 'debuff', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 0, cooldown: 4, actionPoints: 1, effects: [{ type: 'debuff', name: 'weakness', stat: 'damage', value: -0.25, duration: 3 }] },
            shadow_bolt: { id: 'shadow_bolt', name: '暗影箭', emoji: '🌑', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 25, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },

    // ========== BOSS: 巴扎兰 ==========
    boss_bazzalan: {
        id: 'bazzalan', name: '巴扎兰', type: 'boss', slot: 2, emoji: '🗡️',
        loot: { exp: 70 },
        baseStats: { hp: 650, damage: 25, armor: 10 },
        speed: 65,
        phases: [
            { id: 1, name: '刺客', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['sinister_strike', 'poison_blade'] },
            { id: 2, name: '狂暴刺客', hpThreshold: 0.4, actionsPerTurn: 3, damageModifier: 1.3, skills: ['sinister_strike', 'poison_blade'],
              onEnter: { type: 'transform', message: '🔥 巴扎兰进入狂暴状态！伤害大幅提升！' }
            },
        ],
        enrage: { triggerRound: 14, damageModifier: 2.0, aoePerRound: { damage: 30, type: 'physical', message: '💀 巴扎兰疯狂地挥刀！' }, message: '💀 巴扎兰狂暴了！' },
        skills: {
            sinister_strike: { id: 'sinister_strike', name: '正弦切割', emoji: '🗡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 32, cooldown: 0, actionPoints: 1, effects: [] },
            poison_blade: { id: 'poison_blade', name: '毒药涂层', emoji: '🐍', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 15, cooldown: 3, actionPoints: 1, effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 7, duration: 3 }] },
        },
    },

    // ========== 辅助方法 ==========
    getEncounter(encounterId) { return this[encounterId] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(bossEncounterId) {
        const key = bossEncounterId || 'boss_oggleflint'
        const bossConfig = this[key]
        if (!bossConfig) return null
        return {
            id: bossConfig.id, name: bossConfig.name, type: bossConfig.type, isBoss: true,
            slot: bossConfig.slot, emoji: bossConfig.emoji,
            currentHp: bossConfig.baseStats.hp, maxHp: bossConfig.baseStats.hp,
            damage: bossConfig.baseStats.damage, armor: bossConfig.baseStats.armor, speed: bossConfig.speed,
            phases: bossConfig.phases, enrage: bossConfig.enrage, skillData: bossConfig.skills,
            loot: bossConfig.loot || { exp: 0 },
        }
    },
    createTrashInstance(waveId) {
        const waveConfig = this[waveId]
        if (!waveConfig) return []
        return waveConfig.enemies.map(enemy => ({
            id: enemy.id, name: enemy.name, type: enemy.type, slot: enemy.slot, emoji: enemy.emoji,
            currentHp: enemy.stats.hp, maxHp: enemy.stats.hp, damage: enemy.stats.damage,
            armor: enemy.stats.armor, speed: enemy.speed, skills: enemy.skills, loot: enemy.loot || { exp: 0 },
        }))
    },
    createSummonInstance(summonId, slot) {
        const config = this[summonId]
        if (!config) return null
        return {
            id: `${config.id}_${Date.now()}`, name: config.name, type: config.type,
            slot: slot || config.slot || 3, emoji: config.emoji,
            currentHp: config.stats.hp, maxHp: config.stats.hp, damage: config.stats.damage,
            armor: config.stats.armor, speed: config.speed, skills: config.skills,
        }
    },
}
