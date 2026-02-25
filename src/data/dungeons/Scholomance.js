/**
 * 通灵学院副本数据
 * 推荐等级: 58-60
 * BOSS: 基尔图诺斯/詹迪斯[幻象+spellReflect]/拉特格尔/维克提斯/克拉斯提诺夫/加丁[传送]
 */
export const Scholomance = {
    id: 'scholomance', name: '通灵学院',
    description: '西瘟疫之地的黑暗学院，天灾军团在此培训亡灵法师。',
    emoji: '📖',
    levelRange: { min: 58, max: 60 },
    difficulty: 'hard',
    rewards: { expBase: 600, goldBase: 300, lootTable: ['blueItem', 'epicItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '学院入口' },
        { id: 'wave_2', type: 'trash', name: '骨室' },
        { id: 'boss_kirtonos', type: 'boss', name: '基尔图诺斯' },
        { id: 'wave_3', type: 'trash', name: '幻象大厅' },
        { id: 'boss_jandice', type: 'boss', name: '詹迪斯·巴罗夫' },
        { id: 'wave_4', type: 'trash', name: '炼金实验室' },
        { id: 'boss_rattlegore', type: 'boss', name: '拉特格尔' },
        { id: 'wave_5', type: 'trash', name: '瘟疫实验室' },
        { id: 'boss_vectus', type: 'boss', name: '维克提斯' },
        { id: 'wave_6', type: 'trash', name: '手术室' },
        { id: 'boss_krastinov', type: 'boss', name: '克拉斯提诺夫' },
        { id: 'wave_7', type: 'trash', name: '加丁通道' },
        { id: 'wave_8', type: 'trash', name: '巫妖大厅' },
        { id: 'boss_gandling', type: 'boss', name: '加丁·达克威尔' },
    ],

    wave_1: {
        id: 'wave_1', name: '学院入口', description: '骷髅守卫',
        enemies: [
            { id: 'skel_1', name: '骷髅卫士', type: 'undead', slot: 1, emoji: '💀', stats: { hp: 600, damage: 52, armor: 20 }, speed: 50, loot: { exp: 50 },
              skills: [{ id: 'strike', name: '骨刃', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 52, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'skel_2', name: '骷髅法师', type: 'undead', slot: 2, emoji: '💀', stats: { hp: 420, damage: 58, armor: 8 }, speed: 55, loot: { exp: 48 },
              skills: [{ id: 'bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 58, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'skel_3', name: '骷髅法师', type: 'undead', slot: 3, emoji: '💀', stats: { hp: 420, damage: 58, armor: 8 }, speed: 55, loot: { exp: 48 },
              skills: [{ id: 'bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 58, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '骨室', description: '骨构造体',
        enemies: [
            { id: 'bone_1', name: '骨构造体', type: 'undead', slot: 1, emoji: '🦴', stats: { hp: 800, damage: 60, armor: 24 }, speed: 35, loot: { exp: 56 },
              skills: [{ id: 'smash', name: '骨锤', emoji: '🦴', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 60, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'student_1', name: '暗影学徒', type: 'undead', slot: 2, emoji: '🧙', stats: { hp: 450, damage: 55, armor: 8 }, speed: 55, loot: { exp: 48 },
              skills: [{ id: 'shadow', name: '暗影弹', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 55, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '幻象大厅', description: '幻象陷阱',
        enemies: [
            { id: 'illusion_1', name: '幻象侍从', type: 'undead', slot: 1, emoji: '👻', stats: { hp: 350, damage: 45, armor: 4 }, speed: 70, loot: { exp: 40 },
              skills: [{ id: 'strike', name: '幻影打击', emoji: '💫', skillType: 'melee', damageType: 'arcane', targetType: 'enemy', range: 'melee', damage: 45, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'illusion_2', name: '幻象侍从', type: 'undead', slot: 2, emoji: '👻', stats: { hp: 350, damage: 45, armor: 4 }, speed: 70, loot: { exp: 40 },
              skills: [{ id: 'strike', name: '幻影打击', emoji: '💫', skillType: 'melee', damageType: 'arcane', targetType: 'enemy', range: 'melee', damage: 45, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'illusion_3', name: '幻象侍从', type: 'undead', slot: 3, emoji: '👻', stats: { hp: 350, damage: 45, armor: 4 }, speed: 70, loot: { exp: 40 },
              skills: [{ id: 'strike', name: '幻影打击', emoji: '💫', skillType: 'melee', damageType: 'arcane', targetType: 'enemy', range: 'melee', damage: 45, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '炼金实验室', description: '泥浆怪和软泥',
        enemies: [
            { id: 'ooze_1', name: '酸液软泥', type: 'ooze', slot: 1, emoji: '🟢', stats: { hp: 650, damage: 50, armor: 6 }, speed: 30, loot: { exp: 50 },
              skills: [{ id: 'acid', name: '酸液喷射', emoji: '💚', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 38, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'debuff', name: 'acidCorrosion', stat: 'armor', value: -8, duration: 3 }] }] },
            { id: 'ooze_2', name: '毒液软泥', type: 'ooze', slot: 2, emoji: '🟢', stats: { hp: 650, damage: 50, armor: 6 }, speed: 30, loot: { exp: 50 },
              skills: [{ id: 'poison', name: '剧毒喷射', emoji: '☠️', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 30, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 15, duration: 3 }] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '瘟疫实验室', description: '瘟疫实验体',
        enemies: [
            { id: 'plague_1', name: '瘟疫犬', type: 'undead', slot: 1, emoji: '🐕', stats: { hp: 580, damage: 52, armor: 12 }, speed: 65, loot: { exp: 48 },
              skills: [{ id: 'bite', name: '瘟疫撕咬', emoji: '🦷', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 40, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'plague', damageType: 'nature', tickDamage: 12, duration: 3 }] }] },
            { id: 'plague_2', name: '瘟疫犬', type: 'undead', slot: 2, emoji: '🐕', stats: { hp: 580, damage: 52, armor: 12 }, speed: 65, loot: { exp: 48 },
              skills: [{ id: 'bite', name: '瘟疫撕咬', emoji: '🦷', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 40, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'plague', damageType: 'nature', tickDamage: 12, duration: 3 }] }] },
        ],
    },
    wave_6: {
        id: 'wave_6', name: '手术室', description: '克拉斯提诺夫的实验品',
        enemies: [
            { id: 'ghoul_1', name: '缝合怪', type: 'undead', slot: 1, emoji: '🧟', stats: { hp: 750, damage: 58, armor: 18 }, speed: 40, loot: { exp: 54 },
              skills: [{ id: 'slam', name: '肉锤', emoji: '🔨', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 58, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'student_2', name: '暗影高徒', type: 'undead', slot: 2, emoji: '🧙', stats: { hp: 480, damage: 62, armor: 10 }, speed: 55, loot: { exp: 52 },
              skills: [{ id: 'bolt', name: '黑暗之箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 62, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_7: {
        id: 'wave_7', name: '加丁通道', description: '精锐死灵守卫',
        enemies: [
            { id: 'dk_1', name: '死灵骑士', type: 'undead', slot: 1, emoji: '🗡️', stats: { hp: 850, damage: 68, armor: 26 }, speed: 45, loot: { exp: 62 },
              skills: [{ id: 'strike', name: '死灵之击', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 68, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'necro_1', name: '高级死灵法师', type: 'undead', slot: 2, emoji: '🧙', stats: { hp: 550, damage: 70, armor: 10 }, speed: 55, loot: { exp: 58 },
              skills: [{ id: 'bolt', name: '死亡缠绕', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 70, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_8: {
        id: 'wave_8', name: '巫妖大厅', description: '加丁的亲卫',
        enemies: [
            { id: 'guard_1', name: '加丁卫兵', type: 'undead', slot: 1, emoji: '💀', stats: { hp: 900, damage: 72, armor: 28 }, speed: 45, loot: { exp: 66 },
              skills: [{ id: 'strike', name: '亡灵之击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 72, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'guard_2', name: '加丁卫兵', type: 'undead', slot: 2, emoji: '💀', stats: { hp: 900, damage: 72, armor: 28 }, speed: 45, loot: { exp: 66 },
              skills: [{ id: 'strike', name: '亡灵之击', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 72, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },

    // ========== BOSS ==========
    // 等级60: 新公式 finalDamage=2700
    boss_kirtonos: {
        id: 'boss_kirtonos', name: '基尔图诺斯', emoji: '🦇',
        description: '被召唤出的强大蝙蝠魔，通灵学院的守护者。', type: 'boss', slot: 1,
        baseStats: { hp: 3600, damage: 4500, armor: 18, speed: 60 },
        loot: { exp: 320, gold: 80 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['swoop', 'sonic_burst'] },
            { hpPercent: 40, actionsPerTurn: 2, damageModifier: 1.4, skills: ['swoop', 'sonic_burst', 'vampiric_bite'],
              onEnter: { type: 'buff', name: 'bloodlust', stat: 'speed', value: 20, duration: 99 } },
        ],
        enrage: { turns: 20, damageMultiplier: 2.0, message: '⚠️ 基尔图诺斯陷入血腥狂暴！' },
        skills: {
            swoop: { id: 'swoop', name: '俯冲打击', emoji: '🦇', skillType: 'melee', damageType: 'physical', targetType: 'random_enemy', range: 'melee', damage: 4500, cooldown: 3, actionPoints: 1, effects: [] },
            sonic_burst: { id: 'sonic_burst', name: '音波冲击', emoji: '🔊', skillType: 'ranged', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 900, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'silence', duration: 2, chance: 0.35 }] },
            vampiric_bite: { id: 'vampiric_bite', name: '吸血撕咬', emoji: '🩸', skillType: 'melee', damageType: 'shadow', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1,
                effects: [{ type: 'lifesteal', value: 0.4 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_jandice: {
        id: 'boss_jandice', name: '詹迪斯·巴罗夫', emoji: '👻',
        description: '幻术大师，能创造镜像并反射法术。', type: 'boss', slot: 1,
        baseStats: { hp: 3400, damage: 4500, armor: 14, speed: 55 },
        loot: { exp: 340, gold: 85 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['arcane_bolt', 'create_illusion'] },
            { hpPercent: 50, actionsPerTurn: 2, damageModifier: 1.2, skills: ['arcane_bolt', 'create_illusion', 'spell_reflect'],
              onEnter: { type: 'buff', name: 'spellReflect', stat: 'spellReflect', value: 1, duration: 3 } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.0, message: '⚠️ 詹迪斯的幻象充斥整个大厅！' },
        skills: {
            arcane_bolt: { id: 'arcane_bolt', name: '奥术飞弹', emoji: '🔮', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', cooldown: 0, actionPoints: 1, effects: [] },
            create_illusion: { id: 'create_illusion', name: '创造幻象', emoji: '💫', skillType: 'special', damageType: 'arcane', targetType: 'self', range: 'self', damage: 0, cooldown: 6, actionPoints: 1,
                effects: [{ type: 'summon', summonId: 'summon_illusion' }] },
            spell_reflect: { id: 'spell_reflect', name: '法术反射', emoji: '🪞', skillType: 'buff', damageType: 'arcane', targetType: 'self', range: 'self', damage: 0, cooldown: 8, actionPoints: 1,
                effects: [{ type: 'buff', name: 'spellReflect', stat: 'spellReflect', value: 1, duration: 3 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_rattlegore: {
        id: 'boss_rattlegore', name: '拉特格尔', emoji: '🦴',
        description: '巨型骨构造体，由无数骷髅拼接而成。', type: 'boss', slot: 1,
        baseStats: { hp: 4200, damage: 4500, armor: 28, speed: 35 },
        loot: { exp: 320, gold: 80 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['bone_smash', 'war_stomp'] },
            { hpPercent: 35, actionsPerTurn: 2, damageModifier: 1.5, skills: ['bone_smash', 'war_stomp'],
              onEnter: { type: 'buff', name: 'boneShield', stat: 'armor', value: 20, duration: 99 } },
        ],
        enrage: { turns: 20, damageMultiplier: 2.0, message: '⚠️ 拉特格尔开始崩裂！' },
        skills: {
            bone_smash: { id: 'bone_smash', name: '骨锤粉碎', emoji: '🦴', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1, effects: [] },
            war_stomp: { id: 'war_stomp', name: '战争践踏', emoji: '🦶', skillType: 'melee', damageType: 'physical', targetType: 'all_enemies', range: 'melee', damage: 1800, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1, chance: 0.35 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_vectus: {
        id: 'boss_vectus', name: '维克提斯', emoji: '🧙',
        description: '精通瘟疫的死灵法师，实验各种恐怖疾病。', type: 'boss', slot: 1,
        baseStats: { hp: 3400, damage: 4500, armor: 14, speed: 50 },
        loot: { exp: 300, gold: 75 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['plague_bolt', 'fire_shield'] },
            { hpPercent: 40, actionsPerTurn: 2, damageModifier: 1.3, skills: ['plague_bolt', 'fire_shield', 'plague_nova'],
              onEnter: { type: 'message', text: '🧙 维克提斯释放实验瘟疫！' } },
        ],
        enrage: { turns: 22, damageMultiplier: 2.0, message: '⚠️ 瘟疫失控！' },
        skills: {
            plague_bolt: { id: 'plague_bolt', name: '瘟疫箭', emoji: '☠️', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', cooldown: 0, actionPoints: 1, effects: [] },
            fire_shield: { id: 'fire_shield', name: '火焰护盾', emoji: '🔥', skillType: 'buff', damageType: 'fire', targetType: 'self', range: 'self', damage: 0, cooldown: 6, actionPoints: 1,
                effects: [{ type: 'buff', name: 'fireShield', stat: 'armor', value: 15, duration: 3 }] },
            plague_nova: { id: 'plague_nova', name: '瘟疫新星', emoji: '💀', skillType: 'ranged', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 900, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'dot', name: 'plague', damageType: 'nature', tickDamage: 16, duration: 3 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700
    boss_krastinov: {
        id: 'boss_krastinov', name: '克拉斯提诺夫', emoji: '🩸',
        description: '屠夫克拉斯提诺夫，通灵学院最臭名昭著的角色。', type: 'boss', slot: 1,
        baseStats: { hp: 3800, damage: 4500, armor: 20, speed: 55 },
        loot: { exp: 320, gold: 80 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 1, damageModifier: 1.0, skills: ['butcher_strike', 'rend'] },
            { hpPercent: 40, actionsPerTurn: 2, damageModifier: 1.4, skills: ['butcher_strike', 'rend', 'frenzy'],
              onEnter: { type: 'buff', name: 'bloodFrenzy', stat: 'speed', value: 25, duration: 99 } },
        ],
        enrage: { turns: 20, damageMultiplier: 2.0, message: '⚠️ 屠夫陷入嗜血狂暴！' },
        skills: {
            butcher_strike: { id: 'butcher_strike', name: '屠夫之击', emoji: '🔪', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', cooldown: 0, actionPoints: 1, effects: [] },
            rend: { id: 'rend', name: '撕裂伤口', emoji: '🩸', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 2700, cooldown: 3, actionPoints: 1,
                effects: [{ type: 'dot', name: 'bleed', damageType: 'physical', tickDamage: 18, duration: 3 }] },
            frenzy: { id: 'frenzy', name: '嗜血狂暴', emoji: '😤', skillType: 'buff', damageType: 'physical', targetType: 'self', range: 'self', damage: 0, cooldown: 8, actionPoints: 1,
                effects: [{ type: 'buff', name: 'frenzy', stat: 'damage', value: 20, duration: 3 }] },
        },
    },

    // 等级60: 新公式 finalDamage=2700 (最终BOSS)
    boss_gandling: {
        id: 'boss_gandling', name: '加丁·达克威尔', emoji: '🧙',
        description: '通灵学院的校长，精通传送和暗影魔法的巫妖。', type: 'boss', slot: 1,
        baseStats: { hp: 5500, damage: 4500, armor: 16, speed: 55 },
        loot: { exp: 450, gold: 120 },
        phases: [
            { hpPercent: 100, actionsPerTurn: 2, damageModifier: 1.0, skills: ['shadow_bolt', 'arcane_missiles'] },
            { hpPercent: 60, actionsPerTurn: 2, damageModifier: 1.3, skills: ['shadow_bolt', 'arcane_missiles', 'teleport_strike'],
              onEnter: { type: 'message', text: '🧙 加丁打开传送门！' } },
            { hpPercent: 25, actionsPerTurn: 3, damageModifier: 1.6, skills: ['shadow_bolt', 'arcane_missiles', 'teleport_strike'],
              onEnter: { type: 'buff', name: 'darkPower', stat: 'damage', value: 35, duration: 99 } },
        ],
        enrage: { turns: 28, damageMultiplier: 3.0, message: '⚠️ 加丁释放终极暗影风暴！' },
        skills: {
            shadow_bolt: { id: 'shadow_bolt', name: '暗影箭', emoji: '🌑', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', cooldown: 0, actionPoints: 1, effects: [] },
            arcane_missiles: { id: 'arcane_missiles', name: '奥术飞弹', emoji: '🔮', skillType: 'ranged', damageType: 'arcane', targetType: 'random_enemy', range: 'ranged', damage: 2250, cooldown: 2, actionPoints: 1, effects: [] },
            teleport_strike: { id: 'teleport_strike', name: '传送打击', emoji: '💫', skillType: 'melee', damageType: 'shadow', targetType: 'random_enemy', range: 'melee', damage: 4500, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1, chance: 0.5 }] },
        },
    },

    summon_configs: {
        summon_illusion: {
            id: 'illusion', name: '詹迪斯幻象', type: 'undead', slot: 3, emoji: '👻',
            stats: { hp: 300, damage: 35, armor: 4 }, speed: 65, loot: { exp: 15 },
            skills: [{ id: 'bolt', name: '幻象飞弹', emoji: '🔮', skillType: 'ranged', damageType: 'arcane', targetType: 'enemy', range: 'ranged', damage: 35, cooldown: 0, actionPoints: 1, effects: [] }],
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
