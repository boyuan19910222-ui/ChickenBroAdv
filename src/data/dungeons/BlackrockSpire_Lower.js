/**
 * 黑石塔下层副本数据
 * 推荐等级: 55-60
 * BOSS: 欧莫克/沃许/沃恩/兹格雷斯/嗜血双兽/维姆萨拉克
 */
export const BlackrockSpire_Lower = {
    id: 'brs_lower', name: '黑石塔下层',
    description: '黑石塔的下层区域，被黑铁矮人和食人魔占据。',
    emoji: '⬇️',
    levelRange: { min: 55, max: 60 },
    difficulty: 'hard',
    rewards: { expBase: 520, goldBase: 260, lootTable: ['blueItem', 'epicItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '黑石入口' },
        { id: 'wave_2', type: 'trash', name: '食人魔营地' },
        { id: 'boss_omokk', type: 'boss', name: '欧莫克大王' },
        { id: 'wave_3', type: 'trash', name: '暗影猎手通道' },
        { id: 'boss_voone', type: 'boss', name: '沃许' },
        { id: 'wave_4', type: 'trash', name: '蜘蛛巢穴' },
        { id: 'boss_voone2', type: 'boss', name: '沃恩' },
        { id: 'wave_5', type: 'trash', name: '巨魔大厅' },
        { id: 'boss_zigris', type: 'boss', name: '兹格雷斯' },
        { id: 'wave_6', type: 'trash', name: '兽栏' },
        { id: 'boss_halycon', type: 'boss', name: '嗜血双兽' },
        { id: 'wave_7', type: 'trash', name: '维姆萨拉克要塞' },
        { id: 'wave_8', type: 'trash', name: '王座前厅' },
        { id: 'boss_wyrmthalak', type: 'boss', name: '维姆萨拉克' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '黑石入口', description: '黑铁矮人守卫',
        enemies: [
            { id: 'dwarf_1', name: '黑铁矮人战士', type: 'dwarf', slot: 1, emoji: '⛏️', stats: { hp: 580, damage: 48, armor: 22 }, speed: 45, loot: { exp: 48 },
              skills: [{ id: 'strike', name: '锤击', emoji: '🔨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 48, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'dwarf_2', name: '黑铁矮人战士', type: 'dwarf', slot: 2, emoji: '⛏️', stats: { hp: 580, damage: 48, armor: 22 }, speed: 45, loot: { exp: 48 },
              skills: [{ id: 'strike', name: '锤击', emoji: '🔨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 48, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'dwarf_3', name: '黑铁火法师', type: 'dwarf', slot: 3, emoji: '🔥', stats: { hp: 420, damage: 55, armor: 10 }, speed: 55, loot: { exp: 46 },
              skills: [{ id: 'fireball', name: '火球术', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 55, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '食人魔营地', description: '占据下层的食人魔部族',
        enemies: [
            { id: 'ogre_1', name: '黑石食人魔', type: 'ogre', slot: 1, emoji: '👹', stats: { hp: 700, damage: 52, armor: 18 }, speed: 35, loot: { exp: 50 },
              skills: [{ id: 'smash', name: '巨力粉碎', emoji: '💪', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 52, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'ogre_2', name: '黑石食人魔法师', type: 'ogre', slot: 2, emoji: '👹', stats: { hp: 500, damage: 58, armor: 10 }, speed: 40, loot: { exp: 48 },
              skills: [{ id: 'bolt', name: '奥术飞弹', emoji: '🔮', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 58, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '暗影猎手通道', description: '潜伏的巨魔暗影猎手',
        enemies: [
            { id: 'troll_1', name: '黑石巨魔狂战士', type: 'troll', slot: 1, emoji: '🧟', stats: { hp: 620, damage: 55, armor: 16 }, speed: 55, loot: { exp: 50 },
              skills: [{ id: 'frenzy', name: '狂暴攻击', emoji: '😤', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 55, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'troll_2', name: '黑石巨魔暗影猎手', type: 'troll', slot: 2, emoji: '🧟', stats: { hp: 480, damage: 50, armor: 12 }, speed: 60, loot: { exp: 48 },
              skills: [{ id: 'hex', name: '妖术箭', emoji: '🏹', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 50, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'troll_3', name: '黑石巨魔巫医', type: 'troll', slot: 3, emoji: '🧟', stats: { hp: 450, damage: 45, armor: 8 }, speed: 50, loot: { exp: 46 },
              skills: [{ id: 'heal', name: '治疗之触', emoji: '💚', skillType: 'ranged', damageType: 'nature', targetType: 'ally', range: 'ranged', damage: 0, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'heal', value: 120 }] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '蜘蛛巢穴', description: '深处的巨型蜘蛛',
        enemies: [
            { id: 'spider_1', name: '黑石蜘蛛', type: 'spider', slot: 1, emoji: '🕷️', stats: { hp: 500, damage: 45, armor: 10 }, speed: 65, loot: { exp: 44 },
              skills: [{ id: 'bite', name: '毒咬', emoji: '🦷', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 35, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 12, duration: 3 }] }] },
            { id: 'spider_2', name: '黑石蜘蛛', type: 'spider', slot: 2, emoji: '🕷️', stats: { hp: 500, damage: 45, armor: 10 }, speed: 65, loot: { exp: 44 },
              skills: [{ id: 'web', name: '蛛网缠绕', emoji: '🕸️', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 20, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'root', duration: 2, chance: 0.5 }] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '巨魔大厅', description: '黑石巨魔精英守卫',
        enemies: [
            { id: 'elite_1', name: '黑石精英卫士', type: 'troll', slot: 1, emoji: '🧟', stats: { hp: 680, damage: 58, armor: 20 }, speed: 50, loot: { exp: 54 },
              skills: [{ id: 'cleave', name: '劈砍', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee', damage: 40, cooldown: 2, actionPoints: 1, effects: [] }] },
            { id: 'elite_2', name: '黑石精英术士', type: 'troll', slot: 2, emoji: '🧟', stats: { hp: 480, damage: 62, armor: 10 }, speed: 55, loot: { exp: 52 },
              skills: [{ id: 'shadowbolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 62, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_6: {
        id: 'wave_6', name: '兽栏', description: '关押的凶猛野兽',
        enemies: [
            { id: 'worg_1', name: '黑石战狼', type: 'beast', slot: 1, emoji: '🐺', stats: { hp: 550, damage: 50, armor: 12 }, speed: 70, loot: { exp: 46 },
              skills: [{ id: 'rend', name: '撕裂', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 35, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'bleed', damageType: 'physical', tickDamage: 15, duration: 2 }] }] },
            { id: 'worg_2', name: '黑石战狼', type: 'beast', slot: 2, emoji: '🐺', stats: { hp: 550, damage: 50, armor: 12 }, speed: 70, loot: { exp: 46 },
              skills: [{ id: 'howl', name: '嚎叫', emoji: '🐺', skillType: 'ranged', damageType: 'physical', targetType: 'all_enemies', range: 'ranged', damage: 0, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'fear', duration: 1, chance: 0.3 }] }] },
            { id: 'raptor_1', name: '黑石迅猛龙', type: 'beast', slot: 3, emoji: '🦎', stats: { hp: 600, damage: 55, armor: 14 }, speed: 60, loot: { exp: 48 },
              skills: [{ id: 'strike', name: '利爪打击', emoji: '🦖', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 55, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_7: {
        id: 'wave_7', name: '维姆萨拉克要塞', description: '维姆萨拉克的精锐守卫',
        enemies: [
            { id: 'guard_1', name: '黑石龙人卫士', type: 'dragonkin', slot: 1, emoji: '🐉', stats: { hp: 720, damage: 58, armor: 24 }, speed: 45, loot: { exp: 56 },
              skills: [{ id: 'slash', name: '龙鳞斩', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 58, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'guard_2', name: '黑石龙人法师', type: 'dragonkin', slot: 2, emoji: '🐉', stats: { hp: 500, damage: 65, armor: 12 }, speed: 50, loot: { exp: 54 },
              skills: [{ id: 'flame', name: '龙焰', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'enemy', range: 'ranged', damage: 65, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_8: {
        id: 'wave_8', name: '王座前厅', description: '最后的守卫',
        enemies: [
            { id: 'elite_3', name: '黑翼卫兵', type: 'dragonkin', slot: 1, emoji: '🐉', stats: { hp: 750, damage: 62, armor: 22 }, speed: 45, loot: { exp: 58 },
              skills: [{ id: 'strike', name: '黑翼之击', emoji: '🦅', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 62, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'elite_4', name: '黑翼卫兵', type: 'dragonkin', slot: 2, emoji: '🐉', stats: { hp: 750, damage: 62, armor: 22 }, speed: 45, loot: { exp: 58 },
              skills: [{ id: 'strike', name: '黑翼之击', emoji: '🦅', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 62, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },

    // ========== BOSS 配置 ==========
    // 等级60: 新公式 finalDamage=2700
    boss_omokk: {
        id: 'boss_omokk', name: '欧莫克大王', emoji: '👹',
        description: '黑石塔下层的食人魔首领，力大无穷。',
        type: 'boss', slot: 1,
        baseStats: { hp: 3200, damage: 4500, armor: 24, speed: 35 },
        loot: { exp: 280, gold: 70 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['war_stomp', 'knock_away'] },
            { hpPercent: 40, actionsPerTurn: 2, damageModifier: 1.4, skills: ['war_stomp', 'knock_away', 'frenzy'],
              onEnter: { type: 'buff', name: 'ogreFrenzy', stat: 'damage', value: 20, duration: 99 } },
        ],
        enrage: { turns: 20, damageMultiplier: 2.0, message: '⚠️ 欧莫克暴怒了！' },
        skills: {
            war_stomp: { id: 'war_stomp', name: '战争践踏', emoji: '🦶', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 1800, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1, chance: 0.35 }] },
            knock_away: { id: 'knock_away', name: '击退', emoji: '💪', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1, effects: [] },
            frenzy: { id: 'frenzy', name: '狂暴', emoji: '😤', skillType: 'buff', damageType: 'physical', targetType: 'self', range: 'self', damage: 0, cooldown: 8, actionPoints: 1,
                effects: [{ type: 'buff', name: 'frenzy', stat: 'speed', value: 20, duration: 3 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_voone: {
        id: 'boss_voone', name: '沃许指挥官', emoji: '🧟',
        description: '黑石巨魔的军事指挥官，精通战术。',
        type: 'boss', slot: 1,
        baseStats: { hp: 2800, damage: 4500, armor: 20, speed: 55 },
        loot: { exp: 260, gold: 65 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['snap_kick', 'throw_axe'] },
            { hpPercent: 45, actionsPerTurn: 2, damageModifier: 1.3, skills: ['snap_kick', 'throw_axe', 'call_reinforcements'],
              onEnter: { type: 'summon', summonId: 'summon_troll_adds' } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.0, message: '⚠️ 沃许发出最后的战斗命令！' },
        skills: {
            snap_kick: { id: 'snap_kick', name: '快速踢击', emoji: '🦵', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1, effects: [] },
            throw_axe: { id: 'throw_axe', name: '投掷飞斧', emoji: '🪓', skillType: 'ranged', damageType: 'physical', targetType: 'random_enemy', range: 'ranged', damage: 2250, cooldown: 2, actionPoints: 1, effects: [] },
            call_reinforcements: { id: 'call_reinforcements', name: '召唤增援', emoji: '📯', skillType: 'special', damageType: 'physical', targetType: 'self', range: 'self', damage: 0, cooldown: 8, actionPoints: 1,
                effects: [{ type: 'summon', summonId: 'summon_troll_adds' }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_voone2: {
        id: 'boss_voone2', name: '沃恩', emoji: '🕷️',
        description: '蜘蛛巢穴深处的巨型母蜘蛛。',
        type: 'boss', slot: 1,
        baseStats: { hp: 3000, damage: 4500, armor: 16, speed: 60 },
        loot: { exp: 240, gold: 60 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['poison_bite', 'web_spray'] },
            { hpPercent: 40, actionsPerTurn: 2, damageModifier: 1.3, skills: ['poison_bite', 'web_spray', 'summon_spiders'],
              onEnter: { type: 'summon', summonId: 'summon_spiderlings' } },
        ],
        enrage: { turns: 20, damageMultiplier: 2.0, message: '⚠️ 母蜘蛛疯狂产卵！' },
        skills: {
            poison_bite: { id: 'poison_bite', name: '剧毒撕咬', emoji: '🦷', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'deadlyPoison', damageType: 'nature', tickDamage: 18, duration: 3 }] },
            web_spray: { id: 'web_spray', name: '蛛网喷射', emoji: '🕸️', skillType: 'ranged', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 1125, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'root', duration: 2, chance: 0.4 }] },
            summon_spiders: { id: 'summon_spiders', name: '召唤蜘蛛', emoji: '🕷️', skillType: 'special', damageType: 'nature', targetType: 'self', range: 'self', damage: 0, cooldown: 8, actionPoints: 1,
                effects: [{ type: 'summon', summonId: 'summon_spiderlings' }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_zigris: {
        id: 'boss_zigris', name: '兹格雷斯', emoji: '🧟',
        description: '黑石巨魔的军需官，装备精良的战士。',
        type: 'boss', slot: 1,
        baseStats: { hp: 2600, damage: 4500, armor: 22, speed: 50 },
        loot: { exp: 250, gold: 65 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['shoot', 'hooked_net'] },
            { hpPercent: 40, actionsPerTurn: 2, damageModifier: 1.3, skills: ['shoot', 'hooked_net', 'multishot'] },
        ],
        enrage: { turns: 20, damageMultiplier: 2.0, message: '⚠️ 兹格雷斯进入疯狂射击模式！' },
        skills: {
            shoot: { id: 'shoot', name: '精准射击', emoji: '🏹', skillType: 'ranged', damageType: 'physical', targetType: 'enemy', range: 'ranged', cooldown: 0, actionPoints: 1, effects: [] },
            hooked_net: { id: 'hooked_net', name: '钩网', emoji: '🪤', skillType: 'ranged', damageType: 'physical', targetType: 'enemy', range: 'ranged', damage: 1350, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'root', duration: 2, chance: 0.6 }] },
            multishot: { id: 'multishot', name: '多重射击', emoji: '🎯', skillType: 'ranged', damageType: 'physical', targetType: 'front_2', range: 'ranged', damage: 2250, cooldown: 3, actionPoints: 1, effects: [] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_halycon: {
        id: 'boss_halycon', name: '嗜血双兽', emoji: '🐺',
        description: '驯服的巨型战狼和迅猛龙，凶猛无比。',
        type: 'boss', slot: 1,
        baseStats: { hp: 3400, damage: 4500, armor: 18, speed: 65 },
        loot: { exp: 260, gold: 65 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 2, damageModifier: 1.0, skills: ['rend_flesh', 'pack_howl'] },
            { hpPercent: 30, actionsPerTurn: 3, damageModifier: 1.5, skills: ['rend_flesh', 'pack_howl', 'blood_frenzy'],
              onEnter: { type: 'buff', name: 'bloodFrenzy', stat: 'speed', value: 30, duration: 99 } },
        ],
        enrage: { turns: 18, damageMultiplier: 2.0, message: '⚠️ 嗜血双兽陷入疯狂！' },
        skills: {
            rend_flesh: { id: 'rend_flesh', name: '撕肉', emoji: '🦷', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'bleed', damageType: 'physical', tickDamage: 15, duration: 2 }] },
            pack_howl: { id: 'pack_howl', name: '兽群嚎叫', emoji: '🐺', skillType: 'ranged', damageType: 'physical', targetType: 'all_enemies', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'fear', duration: 1, chance: 0.35 }] },
            blood_frenzy: { id: 'blood_frenzy', name: '嗜血狂暴', emoji: '🩸', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 3600, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'lifesteal', value: 0.3 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700 (最终BOSS)
    boss_wyrmthalak: {
        id: 'boss_wyrmthalak', name: '维姆萨拉克', emoji: '🐉',
        description: '黑石塔下层的龙人领主，奈法利安的忠实仆从。',
        type: 'boss', slot: 1,
        baseStats: { hp: 4000, damage: 4500, armor: 26, speed: 50 },
        loot: { exp: 350, gold: 90 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['strike', 'fire_breath'] },
            { hpPercent: 60, actionsPerTurn: 2, damageModifier: 1.2, skills: ['strike', 'fire_breath', 'war_cry'],
              onEnter: { type: 'summon', summonId: 'summon_dragonkin_adds' } },
            { hpPercent: 25, actionsPerTurn: 2, damageModifier: 1.5, skills: ['strike', 'fire_breath', 'war_cry'],
              onEnter: { type: 'buff', name: 'dragonRage', stat: 'damage', value: 30, duration: 99 } },
        ],
        enrage: { turns: 24, damageMultiplier: 2.5, message: '⚠️ 维姆萨拉克释放黑龙之怒！' },
        skills: {
            strike: { id: 'strike', name: '龙爪猛击', emoji: '🦖', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1, effects: [] },
            fire_breath: { id: 'fire_breath', name: '烈焰吐息', emoji: '🔥', skillType: 'ranged', damageType: 'fire', targetType: 'front_2', range: 'ranged', damage: 2250, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'dot', name: 'burn', damageType: 'fire', tickDamage: 15, duration: 2 }] },
            war_cry: { id: 'war_cry', name: '战争怒吼', emoji: '📯', skillType: 'buff', damageType: 'physical', targetType: 'self', range: 'self', damage: 0, cooldown: 6, actionPoints: 1,
                effects: [{ type: 'buff', name: 'warCry', stat: 'armor', value: 15, duration: 3 }] },
        },
    },

    // ========== 召唤配置 ==========
    summon_configs: {
        summon_troll_adds: {
            id: 'troll_add', name: '黑石巨魔援兵', type: 'troll', slot: 3, emoji: '🧟',
            stats: { hp: 300, damage: 35, armor: 12 }, speed: 55, loot: { exp: 20 },
            skills: [{ id: 'strike', name: '打击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 35, cooldown: 0, actionPoints: 1, effects: [] }],
        },
        summon_spiderlings: {
            id: 'spiderling', name: '蜘蛛幼崽', type: 'spider', slot: 3, emoji: '🕷️',
            stats: { hp: 200, damage: 25, armor: 4 }, speed: 70, loot: { exp: 15 },
            skills: [{ id: 'bite', name: '啃咬', emoji: '🦷', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 25, cooldown: 0, actionPoints: 1, effects: [] }],
        },
        summon_dragonkin_adds: {
            id: 'dragonkin_add', name: '黑石龙人', type: 'dragonkin', slot: 3, emoji: '🐉',
            stats: { hp: 400, damage: 45, armor: 16 }, speed: 50, loot: { exp: 25 },
            skills: [{ id: 'claw', name: '龙爪', emoji: '🦖', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 45, cooldown: 0, actionPoints: 1, effects: [] }],
        },
    },

    // ========== 辅助方法 ==========
    getEncounter(id) { return this.encounters.find(e => e.id === id) },
    createBossInstance(bossId) {
        const cfg = this[bossId]
        if (!cfg) return null
        return { ...cfg, currentHp: cfg.baseStats.hp, maxHp: cfg.baseStats.hp, currentPhase: 0, turnCount: 0, buffs: [], debuffs: [] }
    },
    createTrashInstance(waveId) {
        const wave = this[waveId]
        if (!wave) return null
        return { ...wave, enemies: wave.enemies.map(e => ({ ...e, currentHp: e.stats.hp, maxHp: e.stats.hp, buffs: [], debuffs: [] })) }
    },
    createSummonInstance(summonId) {
        const cfg = this.summon_configs[summonId]
        if (!cfg) return null
        return { ...cfg, currentHp: cfg.stats.hp, maxHp: cfg.stats.hp, buffs: [], debuffs: [] }
    },
}
