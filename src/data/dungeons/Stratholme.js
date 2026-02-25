/**
 * 斯坦索姆副本数据
 * 推荐等级: 58-60
 * BOSS: 提米/弗拉斯[charm]/奥里克斯/安娜丝塔丽[charm]/奈鲁布恩坎/瑞文戴尔男爵[3阶段]
 */
export const Stratholme = {
    id: 'stratholme', name: '斯坦索姆',
    description: '被天灾军团摧毁的洛丹伦城市，亡灵横行的鬼城。',
    emoji: '💀',
    levelRange: { min: 58, max: 60 },
    difficulty: 'hard',
    rewards: { expBase: 600, goldBase: 300, lootTable: ['blueItem', 'epicItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '十字军广场' },
        { id: 'wave_2', type: 'trash', name: '恐惧走廊' },
        { id: 'boss_timmy', type: 'boss', name: '提米·残忍者' },
        { id: 'wave_3', type: 'trash', name: '真银通道' },
        { id: 'boss_malor', type: 'boss', name: '弗拉斯·希亚比' },
        { id: 'wave_4', type: 'trash', name: '屠宰场' },
        { id: 'boss_orikiis', type: 'boss', name: '奥里克斯' },
        { id: 'wave_5', type: 'trash', name: '亡灵区' },
        { id: 'boss_anastari', type: 'boss', name: '安娜丝塔丽男爵夫人' },
        { id: 'wave_6', type: 'trash', name: '蜘蛛区' },
        { id: 'boss_nerub', type: 'boss', name: '奈鲁布恩坎' },
        { id: 'wave_7', type: 'trash', name: '瑞文戴尔通道' },
        { id: 'wave_8', type: 'trash', name: '男爵大厅' },
        { id: 'boss_rivendare', type: 'boss', name: '瑞文戴尔男爵' },
    ],

    wave_1: {
        id: 'wave_1', name: '十字军广场', description: '游荡的亡灵',
        enemies: [
            { id: 'ghoul_1', name: '天灾食尸鬼', type: 'undead', slot: 1, emoji: '🧟', stats: { hp: 550, damage: 50, armor: 14 }, speed: 55, loot: { exp: 48 },
              skills: [{ id: 'rend', name: '撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 40, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'disease', damageType: 'shadow', tickDamage: 10, duration: 2 }] }] },
            { id: 'ghoul_2', name: '天灾食尸鬼', type: 'undead', slot: 2, emoji: '🧟', stats: { hp: 550, damage: 50, armor: 14 }, speed: 55, loot: { exp: 48 },
              skills: [{ id: 'rend', name: '撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 40, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'disease', damageType: 'shadow', tickDamage: 10, duration: 2 }] }] },
            { id: 'skeleton_1', name: '骷髅战士', type: 'undead', slot: 3, emoji: '💀', stats: { hp: 500, damage: 48, armor: 18 }, speed: 50, loot: { exp: 46 },
              skills: [{ id: 'strike', name: '骨刃斩击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 48, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '恐惧走廊', description: '幽灵巡逻队',
        enemies: [
            { id: 'ghost_1', name: '恐惧幽灵', type: 'undead', slot: 1, emoji: '👻', stats: { hp: 480, damage: 55, armor: 8 }, speed: 60, loot: { exp: 50 },
              skills: [{ id: 'bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 55, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'ghost_2', name: '恐惧幽灵', type: 'undead', slot: 2, emoji: '👻', stats: { hp: 480, damage: 55, armor: 8 }, speed: 60, loot: { exp: 50 },
              skills: [{ id: 'fear', name: '恐惧尖啸', emoji: '😱', skillType: 'ranged', damageType: 'shadow', targetType: 'random_enemy', range: 'ranged', damage: 20, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'fear', duration: 1, chance: 0.4 }] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '真银通道', description: '天灾构造体',
        enemies: [
            { id: 'abom_1', name: '天灾憎恶', type: 'undead', slot: 1, emoji: '🧟', stats: { hp: 800, damage: 60, armor: 22 }, speed: 35, loot: { exp: 56 },
              skills: [{ id: 'cleave', name: '肉钩劈砍', emoji: '🪝', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 45, cooldown: 2, actionPoints: 1, effects: [] }] },
            { id: 'necro_1', name: '亡灵法师', type: 'undead', slot: 2, emoji: '💀', stats: { hp: 450, damage: 60, armor: 8 }, speed: 55, loot: { exp: 52 },
              skills: [{ id: 'bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 60, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '屠宰场', description: '充满血腥的区域',
        enemies: [
            { id: 'abom_2', name: '屠宰场憎恶', type: 'undead', slot: 1, emoji: '🧟', stats: { hp: 850, damage: 65, armor: 24 }, speed: 30, loot: { exp: 58 },
              skills: [{ id: 'smash', name: '肉锤', emoji: '🔨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 65, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'ghoul_3', name: '狂暴食尸鬼', type: 'undead', slot: 2, emoji: '🧟', stats: { hp: 600, damage: 55, armor: 12 }, speed: 60, loot: { exp: 50 },
              skills: [{ id: 'frenzy', name: '疯狂撕咬', emoji: '😤', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 55, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'ghoul_4', name: '狂暴食尸鬼', type: 'undead', slot: 3, emoji: '🧟', stats: { hp: 600, damage: 55, armor: 12 }, speed: 60, loot: { exp: 50 },
              skills: [{ id: 'frenzy', name: '疯狂撕咬', emoji: '😤', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 55, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '亡灵区', description: '精锐亡灵守卫',
        enemies: [
            { id: 'wraith_1', name: '暗影怨灵', type: 'undead', slot: 1, emoji: '👻', stats: { hp: 520, damage: 62, armor: 6 }, speed: 65, loot: { exp: 54 },
              skills: [{ id: 'drain', name: '灵魂吸取', emoji: '💜', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 45, cooldown: 2, actionPoints: 1,
                effects: [{ type: 'lifesteal', value: 0.5 }] }] },
            { id: 'skeleton_2', name: '骷髅精英', type: 'undead', slot: 2, emoji: '💀', stats: { hp: 700, damage: 58, armor: 22 }, speed: 50, loot: { exp: 56 },
              skills: [{ id: 'slash', name: '骨刃猛击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 58, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_6: {
        id: 'wave_6', name: '蜘蛛区', description: '奈鲁布的蜘蛛群',
        enemies: [
            { id: 'spider_1', name: '天灾蜘蛛', type: 'undead', slot: 1, emoji: '🕷️', stats: { hp: 550, damage: 48, armor: 10 }, speed: 65, loot: { exp: 48 },
              skills: [{ id: 'bite', name: '剧毒撕咬', emoji: '🦷', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 38, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 14, duration: 3 }] }] },
            { id: 'spider_2', name: '天灾蜘蛛', type: 'undead', slot: 2, emoji: '🕷️', stats: { hp: 550, damage: 48, armor: 10 }, speed: 65, loot: { exp: 48 },
              skills: [{ id: 'web', name: '蛛网', emoji: '🕸️', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 20, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'root', duration: 2, chance: 0.5 }] }] },
            { id: 'nerub_1', name: '蛛魔战士', type: 'undead', slot: 3, emoji: '🕷️', stats: { hp: 680, damage: 55, armor: 18 }, speed: 55, loot: { exp: 54 },
              skills: [{ id: 'strike', name: '蛛刃', emoji: '🗡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 55, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_7: {
        id: 'wave_7', name: '瑞文戴尔通道', description: '死亡骑士守卫',
        enemies: [
            { id: 'dk_1', name: '黑暗骑士', type: 'undead', slot: 1, emoji: '🗡️', stats: { hp: 800, damage: 65, armor: 26 }, speed: 45, loot: { exp: 60 },
              skills: [{ id: 'strike', name: '黑暗打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 65, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'dk_2', name: '黑暗骑士', type: 'undead', slot: 2, emoji: '🗡️', stats: { hp: 800, damage: 65, armor: 26 }, speed: 45, loot: { exp: 60 },
              skills: [{ id: 'strike', name: '黑暗打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 65, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_8: {
        id: 'wave_8', name: '男爵大厅', description: '最终守卫',
        enemies: [
            { id: 'guard_1', name: '瑞文戴尔卫兵', type: 'undead', slot: 1, emoji: '💀', stats: { hp: 900, damage: 70, armor: 28 }, speed: 45, loot: { exp: 64 },
              skills: [{ id: 'strike', name: '死亡之击', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 70, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'necro_2', name: '亡灵巫师', type: 'undead', slot: 2, emoji: '💀', stats: { hp: 500, damage: 68, armor: 10 }, speed: 55, loot: { exp: 58 },
              skills: [{ id: 'bolt', name: '死亡缠绕', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 68, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },

    // ========== BOSS ==========
    // 等级60: 新公式 baseDamage=1800, difficultyMultiplier=1.0, levelBonus=(60-50)*0.05=0.50, finalDamage=1800*1.0*1.50=2700
    boss_timmy: {
        id: 'boss_timmy', name: '提米·残忍者', emoji: '🧟',
        description: '一个被天灾扭曲的巨大食尸鬼，曾经是一个孩子。', type: 'boss', slot: 1,
        baseStats: { hp: 3200, damage: 4500, armor: 20, speed: 50 },
        loot: { exp: 300, gold: 75 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['maul', 'enraging_bite'] },
            { hpPercent: 40, actionsPerTurn: 2, damageModifier: 1.5, skills: ['maul', 'enraging_bite'],
              onEnter: { type: 'buff', name: 'rage', stat: 'damage', value: 25, duration: 99 } },
        ],
        enrage: { turns: 18, damageMultiplier: 2.0, message: '⚠️ 提米陷入疯狂！' },
        skills: {
            maul: { id: 'maul', name: '重击', emoji: '💪', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1, effects: [] },
            enraging_bite: { id: 'enraging_bite', name: '狂暴撕咬', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 3600, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'buff', name: 'frenzy', stat: 'speed', value: 15, duration: 2 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_malor: {
        id: 'boss_malor', name: '弗拉斯·希亚比', emoji: '👻',
        description: '曾经的贵族，死后化为强大的幽灵，掌握精神控制。', type: 'boss', slot: 1,
        baseStats: { hp: 3400, damage: 4500, armor: 14, speed: 55 },
        loot: { exp: 320, gold: 80 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['soul_bolt', 'possess'] },
            { hpPercent: 45, actionsPerTurn: 2, damageModifier: 1.3, skills: ['soul_bolt', 'possess', 'soul_drain'],
              onEnter: { type: 'message', text: '👻 弗拉斯的怨念爆发！' } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.0, message: '⚠️ 弗拉斯陷入永恒的愤怒！' },
        skills: {
            soul_bolt: { id: 'soul_bolt', name: '灵魂箭', emoji: '💜', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', cooldown: 0, actionPoints: 1, effects: [] },
            possess: { id: 'possess', name: '精神控制', emoji: '💫', skillType: 'ranged', damageType: 'shadow', targetType: 'random_enemy', range: 'ranged', damage: 0, cooldown: 7, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'charm', duration: 2, chance: 0.6 }] },
            soul_drain: { id: 'soul_drain', name: '灵魂虹吸', emoji: '🌀', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 2700, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'lifesteal', value: 0.6 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_orikiis: {
        id: 'boss_orikiis', name: '奥里克斯', emoji: '🧟',
        description: '屠宰场中的巨型憎恶，力量惊人。', type: 'boss', slot: 1,
        baseStats: { hp: 4000, damage: 4500, armor: 24, speed: 35 },
        loot: { exp: 300, gold: 75 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['smash', 'cleave'] },
            { hpPercent: 35, actionsPerTurn: 2, damageModifier: 1.4, skills: ['smash', 'cleave', 'disease_cloud'],
              onEnter: { type: 'buff', name: 'berserk', stat: 'damage', value: 20, duration: 99 } },
        ],
        enrage: { turns: 20, damageMultiplier: 2.0, message: '⚠️ 奥里克斯失去控制！' },
        skills: {
            smash: { id: 'smash', name: '肉锤粉碎', emoji: '🔨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1, effects: [] },
            cleave: { id: 'cleave', name: '横扫', emoji: '💪', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 1800, cooldown: 3, actionPoints: 1, effects: [] },
            disease_cloud: { id: 'disease_cloud', name: '瘟疫之云', emoji: '☁️', skillType: 'ranged', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 900, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'dot', name: 'plague', damageType: 'nature', tickDamage: 15, duration: 3 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_anastari: {
        id: 'boss_anastari', name: '安娜丝塔丽男爵夫人', emoji: '👻',
        description: '强大的女幽灵贵族，精通精神控制魔法。', type: 'boss', slot: 1,
        baseStats: { hp: 3600, damage: 4500, armor: 12, speed: 60 },
        loot: { exp: 340, gold: 85 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['shadow_bolt', 'banshee_wail'] },
            { hpPercent: 50, actionsPerTurn: 2, damageModifier: 1.3, skills: ['shadow_bolt', 'banshee_wail', 'possession'],
              onEnter: { type: 'message', text: '👻 安娜丝塔丽释放压抑千年的怨恨！' } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.0, message: '⚠️ 安娜丝塔丽的怨念吞噬一切！' },
        skills: {
            shadow_bolt: { id: 'shadow_bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', cooldown: 0, actionPoints: 1, effects: [] },
            banshee_wail: { id: 'banshee_wail', name: '女妖哀嚎', emoji: '😱', skillType: 'ranged', damageType: 'shadow', targetType: 'all_enemies', range: 'ranged', damage: 900, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'silence', duration: 2, chance: 0.4 }] },
            possession: { id: 'possession', name: '灵魂附体', emoji: '💫', skillType: 'ranged', damageType: 'shadow', targetType: 'random_enemy', range: 'ranged', damage: 0, cooldown: 8, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'charm', duration: 3, chance: 0.65 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_nerub: {
        id: 'boss_nerub', name: '奈鲁布恩坎', emoji: '🕷️',
        description: '蛛魔领主，控制蜘蛛区的亡灵蛛魔。', type: 'boss', slot: 1,
        baseStats: { hp: 3800, damage: 4500, armor: 20, speed: 55 },
        loot: { exp: 320, gold: 80 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['crypt_scarab', 'impale'] },
            { hpPercent: 40, actionsPerTurn: 2, damageModifier: 1.3, skills: ['crypt_scarab', 'impale', 'web_wrap'],
              onEnter: { type: 'summon', summonId: 'summon_scarabs' } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.0, message: '⚠️ 奈鲁布恩坎召唤蛛群！' },
        skills: {
            crypt_scarab: { id: 'crypt_scarab', name: '甲虫群', emoji: '🪲', skillType: 'ranged', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 900, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'dot', name: 'scarab', damageType: 'nature', tickDamage: 10, duration: 3 }] },
            impale: { id: 'impale', name: '穿刺', emoji: '🗡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 4500, cooldown: 4, actionPoints: 1, effects: [] },
            web_wrap: { id: 'web_wrap', name: '蛛网束缚', emoji: '🕸️', skillType: 'ranged', damageType: 'nature', targetType: 'random_enemy', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'root', duration: 3, chance: 0.7 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700 (最终BOSS略高)
    boss_rivendare: {
        id: 'boss_rivendare', name: '瑞文戴尔男爵', emoji: '💀',
        description: '斯坦索姆的亡灵领主，死亡骑士，天灾军团的忠实仆从。', type: 'boss', slot: 1,
        baseStats: { hp: 5500, damage: 4500, armor: 28, speed: 50 },
        loot: { exp: 450, gold: 120 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 2, damageModifier: 1.0, skills: ['shadow_strike', 'death_coil'] },
            { hpPercent: 60, actionsPerTurn: 2, damageModifier: 1.3, skills: ['shadow_strike', 'death_coil', 'unholy_aura'],
              onEnter: { type: 'summon', summonId: 'summon_skeleton_wave' } },
            { hpPercent: 25, actionsPerTurn: 3, damageModifier: 1.6, skills: ['shadow_strike', 'death_coil', 'unholy_aura'],
              onEnter: { type: 'buff', name: 'deathPact', stat: 'damage', value: 35, duration: 99 } },
        ],
        enrage: { turns: 28, damageMultiplier: 3.0, message: '⚠️ 瑞文戴尔男爵释放死亡之力！' },
        skills: {
            shadow_strike: { id: 'shadow_strike', name: '暗影打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1, effects: [] },
            death_coil: { id: 'death_coil', name: '死亡缠绕', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 3600, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'lifesteal', value: 0.5 }] },
            unholy_aura: { id: 'unholy_aura', name: '邪恶光环', emoji: '☠️', skillType: 'ranged', damageType: 'shadow', targetType: 'all_enemies', range: 'ranged', damage: 1800, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'debuff', name: 'unholyAura', stat: 'armor', value: -12, duration: 3 }] },
        },
    },

    summon_configs: {
        summon_scarabs: {
            id: 'scarab', name: '地穴甲虫', type: 'undead', slot: 3, emoji: '🪲',
            stats: { hp: 200, damage: 25, armor: 4 }, speed: 70, loot: { exp: 10 },
            skills: [{ id: 'bite', name: '啃咬', emoji: '🦷', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 25, cooldown: 0, actionPoints: 1, effects: [] }],
        },
        summon_skeleton_wave: {
            id: 'skeleton_add', name: '骷髅战士', type: 'undead', slot: 3, emoji: '💀',
            stats: { hp: 350, damage: 40, armor: 14 }, speed: 50, loot: { exp: 20 },
            skills: [{ id: 'slash', name: '骨刃斩', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 40, cooldown: 0, actionPoints: 1, effects: [] }],
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
