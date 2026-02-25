/**
 * 剃刀沼泽副本数据
 * 推荐等级: 29-38
 * BOSS: 阿格姆/苏拉比/拉莫斯/卡莉瑟
 */
export const RazorfenKraul = {
    id: 'razorfen_kraul', name: '剃刀沼泽',
    description: '被野猪人占据的荆棘迷宫，深处潜伏着强大的德鲁伊和唤风者。',
    emoji: '🐗',
    levelRange: { min: 29, max: 38 },
    difficulty: 'normal',
    rewards: { expBase: 280, goldBase: 140, lootTable: ['greenItem', 'blueItem'] },

    encounters: [
        { id: 'wave_1', type: 'trash', name: '荆棘入口' },
        { id: 'wave_2', type: 'trash', name: '野猪人营地' },
        { id: 'boss_aggem', type: 'boss', name: '阿格姆' },
        { id: 'wave_3', type: 'trash', name: '暗影通道' },
        { id: 'wave_4', type: 'trash', name: '亡灵据点' },
        { id: 'boss_sulabhi', type: 'boss', name: '死亡预言者苏拉比' },
        { id: 'wave_5', type: 'trash', name: '战士营地' },
        { id: 'wave_6', type: 'trash', name: '荆棘深处' },
        { id: 'boss_ramus', type: 'boss', name: '主宰拉莫斯' },
        { id: 'wave_7', type: 'trash', name: '风暴祭坛' },
        { id: 'wave_8', type: 'trash', name: '卡莉瑟的花园' },
        { id: 'boss_charlga', type: 'boss', name: '唤风者卡莉瑟' },
    ],

    // ========== 小怪波次 ==========
    wave_1: {
        id: 'wave_1', name: '荆棘守卫', description: '入口处的野猪人巡逻队',
        enemies: [
            { id: 'quilboar_1', name: '野猪人战士', type: 'quilboar', slot: 1, emoji: '🐗', stats: { hp: 190, damage: 24, armor: 8 }, speed: 45, loot: { exp: 22 },
              skills: [{ id: 'slash', name: '劈砍', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'quilboar_2', name: '野猪人战士', type: 'quilboar', slot: 2, emoji: '🐗', stats: { hp: 190, damage: 24, armor: 8 }, speed: 45, loot: { exp: 22 },
              skills: [{ id: 'slash', name: '劈砍', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 24, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'quilboar_3', name: '野猪人地卜师', type: 'quilboar', slot: 3, emoji: '🐗', stats: { hp: 130, damage: 18, armor: 4 }, speed: 55, loot: { exp: 20 },
              skills: [{ id: 'lightning', name: '闪电箭', emoji: '⚡', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_2: {
        id: 'wave_2', name: '营地精英', description: '野猪人营地的精锐守卫',
        enemies: [
            { id: 'quilboar_4', name: '野猪人护卫', type: 'quilboar', slot: 1, emoji: '🐗', stats: { hp: 210, damage: 26, armor: 10 }, speed: 45, loot: { exp: 24 },
              skills: [{ id: 'shield_bash', name: '盾击', emoji: '🛡️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 2, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] }] },
            { id: 'bat_1', name: '洞穴蝙蝠', type: 'bat', slot: 2, emoji: '🦇', stats: { hp: 120, damage: 16, armor: 2 }, speed: 70, loot: { exp: 16 },
              skills: [{ id: 'sonic', name: '音波攻击', emoji: '🔊', skillType: 'ranged', damageType: 'physical', targetType: 'front_2', range: 'ranged', damage: 14, cooldown: 2, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_3: {
        id: 'wave_3', name: '暗影走廊', description: '亡灵术士的领地',
        enemies: [
            { id: 'undead_1', name: '复活骷髅', type: 'undead', slot: 1, emoji: '💀', stats: { hp: 150, damage: 20, armor: 6 }, speed: 40, loot: { exp: 18 },
              skills: [{ id: 'slash', name: '骨爪撕裂', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'undead_2', name: '复活骷髅', type: 'undead', slot: 2, emoji: '💀', stats: { hp: 150, damage: 20, armor: 6 }, speed: 40, loot: { exp: 18 },
              skills: [{ id: 'slash', name: '骨爪撕裂', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'necro_1', name: '野猪人术士', type: 'quilboar', slot: 3, emoji: '🧙', stats: { hp: 140, damage: 22, armor: 2 }, speed: 55, loot: { exp: 22 },
              skills: [{ id: 'shadow_bolt', name: '暗影箭', emoji: '🟣', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_4: {
        id: 'wave_4', name: '亡灵据点', description: '更多亡灵和术士',
        enemies: [
            { id: 'undead_3', name: '骷髅战士', type: 'undead', slot: 1, emoji: '💀', stats: { hp: 180, damage: 22, armor: 8 }, speed: 42, loot: { exp: 20 },
              skills: [{ id: 'strike', name: '骨矛突刺', emoji: '🦴', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'necro_2', name: '亡灵法师', type: 'undead', slot: 2, emoji: '🧙', stats: { hp: 130, damage: 20, armor: 2 }, speed: 55, loot: { exp: 22 },
              skills: [{ id: 'shadow_bolt', name: '暗影箭', emoji: '🟣', skillType: 'ranged', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'bat_2', name: '毒牙蝙蝠', type: 'bat', slot: 3, emoji: '🦇', stats: { hp: 110, damage: 15, armor: 2 }, speed: 75, loot: { exp: 16 },
              skills: [{ id: 'bite', name: '毒咬', emoji: '🦷', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 12, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 5, duration: 2 }] }] },
        ],
    },
    wave_5: {
        id: 'wave_5', name: '战士营地', description: '拉莫斯手下的精锐战士',
        enemies: [
            { id: 'quilboar_5', name: '野猪人狂战士', type: 'quilboar', slot: 1, emoji: '🐗', stats: { hp: 220, damage: 28, armor: 10 }, speed: 50, loot: { exp: 26 },
              skills: [{ id: 'cleave', name: '顺劈', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] }] },
            { id: 'quilboar_6', name: '野猪人狂战士', type: 'quilboar', slot: 2, emoji: '🐗', stats: { hp: 220, damage: 28, armor: 10 }, speed: 50, loot: { exp: 26 },
              skills: [{ id: 'cleave', name: '顺劈', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_6: {
        id: 'wave_6', name: '荆棘深处', description: '自然守护者和荆棘怪',
        enemies: [
            { id: 'thornweaver', name: '荆棘编织者', type: 'elemental', slot: 1, emoji: '🌿', stats: { hp: 200, damage: 22, armor: 6 }, speed: 40, loot: { exp: 24 },
              skills: [
                { id: 'thorn_lash', name: '荆棘鞭打', emoji: '🌿', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 22, cooldown: 0, actionPoints: 1, effects: [] },
                { id: 'entangle', name: '缠绕', emoji: '🌱', skillType: 'debuff', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 0, cooldown: 4, actionPoints: 1, effects: [{ type: 'cc', ccType: 'root', duration: 1 }] },
              ] },
            { id: 'quilboar_7', name: '野猪人地卜师', type: 'quilboar', slot: 2, emoji: '🧙', stats: { hp: 150, damage: 20, armor: 4 }, speed: 55, loot: { exp: 22 },
              skills: [{ id: 'lightning', name: '闪电箭', emoji: '⚡', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 20, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_7: {
        id: 'wave_7', name: '风暴祭坛', description: '卡莉瑟的侍从',
        enemies: [
            { id: 'quilboar_8', name: '荆棘祭司', type: 'quilboar', slot: 1, emoji: '🧙', stats: { hp: 180, damage: 24, armor: 4 }, speed: 50, loot: { exp: 24 },
              skills: [
                { id: 'heal', name: '治疗术', emoji: '💚', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 3, actionPoints: 1,
                  effects: [{ type: 'heal', value: 50 }] },
                { id: 'wrath', name: '愤怒', emoji: '🌿', skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 24, cooldown: 0, actionPoints: 1, effects: [] },
              ] },
            { id: 'quilboar_9', name: '野猪人卫兵', type: 'quilboar', slot: 2, emoji: '🐗', stats: { hp: 200, damage: 26, armor: 10 }, speed: 45, loot: { exp: 24 },
              skills: [{ id: 'slash', name: '劈砍', emoji: '⚔️', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 26, cooldown: 0, actionPoints: 1, effects: [] }] },
        ],
    },
    wave_8: {
        id: 'wave_8', name: '荆棘藤蔓', description: '卡莉瑟花园的守卫',
        enemies: [
            { id: 'vine_1', name: '巨型荆棘藤', type: 'elemental', slot: 1, emoji: '🌿', stats: { hp: 250, damage: 24, armor: 8 }, speed: 30, loot: { exp: 28 },
              skills: [
                { id: 'lash', name: '藤蔓抽打', emoji: '🌿', skillType: 'melee', damageType: 'nature', targetType: 'front_2', range: 'melee', damage: 20, cooldown: 2, actionPoints: 1, effects: [] },
                { id: 'grip', name: '束缚', emoji: '🌱', skillType: 'debuff', damageType: null, targetType: 'enemy', range: 'ranged', damage: 0, cooldown: 4, actionPoints: 1, effects: [{ type: 'cc', ccType: 'root', duration: 1 }] },
              ] },
        ],
    },

    // ========== BOSS 配置 ==========

    boss_aggem: {
        id: 'aggem', name: '阿格姆', type: 'boss', slot: 2, emoji: '🌿',
        loot: { exp: 90 },
        baseStats: { hp: 900, damage: 28, armor: 8 }, speed: 45,
        phases: [
            { id: 1, name: '荆棘德鲁伊', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['thorn_curse', 'heal', 'thorn_lash'] },
        ],
        enrage: { triggerRound: 14, damageModifier: 1.8, aoePerRound: { damage: 25, type: 'nature', message: '🌿 荆棘从地面爆出！' }, message: '🌿 阿格姆的自然力量失控了！' },
        skills: {
            thorn_curse: { id: 'thorn_curse', name: '荆棘诅咒', emoji: '🌿', description: '反弹DOT', skillType: 'debuff', damageType: 'nature', targetType: 'enemy', range: 'ranged', damage: 0, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'dot', name: 'thorns', damageType: 'nature', tickDamage: 8, duration: 3 }] },
            heal: { id: 'heal', name: '治疗术', emoji: '💚', description: '恢复自身生命', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'heal', value: 80 }] },
            thorn_lash: { id: 'thorn_lash', name: '荆棘鞭打', emoji: '🌿', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 28, cooldown: 0, actionPoints: 1, effects: [] },
        },
    },

    boss_sulabhi: {
        id: 'sulabhi', name: '死亡预言者苏拉比', type: 'boss', slot: 2, emoji: '💀',
        loot: { exp: 100 },
        baseStats: { hp: 950, damage: 30, armor: 6 }, speed: 50,
        phases: [
            { id: 1, name: '暗影法师', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['shadow_bolt', 'fear', 'heal'] },
        ],
        enrage: { triggerRound: 14, damageModifier: 1.8, aoePerRound: { damage: 28, type: 'shadow', message: '💀 暗影能量吞噬一切！' }, message: '💀 苏拉比召唤了强大的暗影力量！' },
        skills: {
            shadow_bolt: { id: 'shadow_bolt', name: '暗影箭', emoji: '🟣', skillType: 'spell', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 30, cooldown: 0, actionPoints: 1, effects: [] },
            fear: { id: 'fear', name: '恐惧术', emoji: '😱', description: '使目标恐惧', skillType: 'debuff', damageType: 'shadow', targetType: 'enemy', range: 'ranged', damage: 0, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'fear', duration: 1 }] },
            heal: { id: 'heal', name: '治疗术', emoji: '💚', description: '恢复自身生命', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'heal', value: 90 }] },
        },
    },

    boss_ramus: {
        id: 'ramus', name: '主宰拉莫斯', type: 'boss', slot: 2, emoji: '⚔️',
        loot: { exp: 110 },
        baseStats: { hp: 1100, damage: 35, armor: 14 }, speed: 50,
        phases: [
            { id: 1, name: '战争主宰', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['charge', 'war_cry', 'mortal_strike'] },
        ],
        enrage: { triggerRound: 14, damageModifier: 2.0, aoePerRound: { damage: 30, type: 'physical', message: '⚔️ 拉莫斯疯狂地横扫！' }, message: '⚔️ 拉莫斯进入狂暴状态！' },
        skills: {
            charge: { id: 'charge', name: '冲锋', emoji: '💨', description: '冲锋并击晕', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 35, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1 }] },
            war_cry: { id: 'war_cry', name: '战斗怒吼', emoji: '📢', description: '提升自身伤害', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'buff', name: 'war_cry', stat: 'damage', value: 0.3, duration: 3 }] },
            mortal_strike: { id: 'mortal_strike', name: '致命攻击', emoji: '💀', skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee', damage: 45, cooldown: 3, actionPoints: 1, effects: [] },
        },
    },

    boss_charlga: {
        id: 'charlga', name: '唤风者卡莉瑟', type: 'boss', slot: 2, emoji: '🌪️',
        loot: { exp: 140 },
        baseStats: { hp: 1400, damage: 32, armor: 10 }, speed: 50,
        phases: [
            { id: 1, name: '唤风者', hpThreshold: 1.0, actionsPerTurn: 2, damageModifier: 1.0, skills: ['chain_lightning', 'heal_chain', 'entangling_roots'] },
            { id: 2, name: '自然之怒', hpThreshold: 0.3, actionsPerTurn: 3, damageModifier: 1.4, skills: ['chain_lightning', 'heal_chain', 'entangling_roots', 'summon_thorns'],
              onEnter: { type: 'buff', message: '🌪️ 卡莉瑟进入狂暴状态！召唤荆棘之力！' } },
        ],
        enrage: { triggerRound: 16, damageModifier: 2.0, aoePerRound: { damage: 35, type: 'nature', message: '🌪️ 狂风荆棘席卷全场！' }, message: '🌪️ 卡莉瑟释放了终极风暴！' },
        skills: {
            chain_lightning: { id: 'chain_lightning', name: '闪电链', emoji: '⚡', skillType: 'spell', damageType: 'nature', targetType: 'front_3', range: 'ranged', damage: 28, cooldown: 2, actionPoints: 1, effects: [] },
            heal_chain: { id: 'heal_chain', name: '治疗链', emoji: '💚', description: '恢复自身生命', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 4, actionPoints: 1,
                effects: [{ type: 'heal', value: 100 }] },
            entangling_roots: { id: 'entangling_roots', name: '纠缠根须', emoji: '🌱', description: '束缚全体', skillType: 'debuff', damageType: 'nature', targetType: 'all_enemies', range: 'ranged', damage: 0, cooldown: 5, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'root', duration: 1 }] },
            summon_thorns: { id: 'summon_thorns', name: '召唤荆棘藤', emoji: '🌿', description: '召唤荆棘藤蔓', skillType: 'buff', damageType: null, targetType: 'self', range: 'melee', damage: 0, cooldown: 6, actionPoints: 1,
                effects: [{ type: 'summon', summonId: 'summon_thorn_vine', count: 1 }] },
        },
    },
    summon_thorn_vine: {
        id: 'thorn_vine', name: '荆棘藤蔓', type: 'add', emoji: '🌿',
        stats: { hp: 120, damage: 18, armor: 4 }, speed: 35,
        skills: [{ id: 'lash', name: '抽打', emoji: '🌿', skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee', damage: 18, cooldown: 0, actionPoints: 1, effects: [] }],
    },

    // ========== 辅助方法 ==========
    getEncounter(encounterId) { return this[encounterId] || null },
    getEncounterList() { return this.encounters.map(e => ({ ...e, data: this.getEncounter(e.id) })) },
    createBossInstance(bossEncounterId) {
        const key = bossEncounterId || 'boss_aggem'
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
