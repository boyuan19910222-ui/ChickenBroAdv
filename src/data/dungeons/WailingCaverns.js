/**
 * 哀嚎洞穴副本数据
 * 
 * 推荐等级: 1-3级
 * 难度: 普通
 * BOSS: 瑟芬迪斯（3阶段）
 */
export const WailingCaverns = {
    // 副本基础信息
    id: 'wailing_caverns',
    name: '哀嚎洞穴',
    description: '贫瘠之地深处的洞穴，被变异的德鲁伊和毒蛇占据。',
    emoji: '🐍',
    
    levelRange: { min: 1, max: 3 },
    difficulty: 'normal',
    
    // 副本奖励
    rewards: {
        expBase: 100,
        goldBase: 50,
        lootTable: ['greenItem', 'blueItem']
    },

    // 遭遇战列表
    encounters: [
        { id: 'wave_1', type: 'trash', name: '洞穴入口' },
        { id: 'boss_serpentis', type: 'boss', name: '瑟芬迪斯' },
    ],

    // ========== 第一波小怪配置 ==========
    wave_1: {
        id: 'wave_1',
        name: '洞穴入口守卫',
        description: '一群哀嚎洞穴的守卫生物',
        
        enemies: [
            {
                id: 'cultist_1',
                name: '狂热者',
                type: 'cultist',
                slot: 1,
                emoji: '🧙',
                
                stats: {
                    hp: 120,
                    damage: 15,
                    armor: 5
                },
                speed: 55,
                loot: { exp: 16 },
                
                skills: [
                    {
                        id: 'melee_attack', name: '攻击', emoji: '⚔️',
                        skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
                        damage: 15, cooldown: 0, actionPoints: 1,
                        effects: []
                    },
                    {
                        id: 'frenzy', name: '狂热', emoji: '😡',
                        description: '进入狂热状态，攻击力提升',
                        skillType: 'buff', damageType: null, targetType: 'self', range: 'melee',
                        damage: 0, cooldown: 4, actionPoints: 1,
                        effects: [{ type: 'buff', name: 'frenzy', stat: 'damage', value: 0.3, duration: 2 }]
                    }
                ]
            },
            {
                id: 'snake_1',
                name: '毒蛇',
                type: 'snake',
                slot: 2,
                emoji: '🐍',
                
                stats: {
                    hp: 80,
                    damage: 12,
                    armor: 2
                },
                speed: 80,
                loot: { exp: 13 },
                
                skills: [
                    {
                        id: 'poison_bite', name: '毒咬', emoji: '🐍',
                        skillType: 'melee', damageType: 'nature', targetType: 'enemy', range: 'melee',
                        damage: 10, cooldown: 0, actionPoints: 1,
                        effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 5, duration: 3 }]
                    }
                ]
            },
            {
                id: 'bat_1',
                name: '蝙蝠',
                type: 'bat',
                slot: 3,
                emoji: '🦇',
                
                stats: {
                    hp: 50,
                    damage: 8,
                    armor: 0
                },
                speed: 90,
                loot: { exp: 10 },
                
                skills: [
                    {
                        id: 'screech', name: '尖啸', emoji: '🦇',
                        skillType: 'ranged', damageType: 'physical', targetType: 'enemy', range: 'ranged',
                        damage: 8, cooldown: 0, actionPoints: 1,
                        effects: [{ type: 'cc', ccType: 'stun', duration: 1 }]
                    }
                ]
            },
            {
                id: 'bat_2',
                name: '蝙蝠',
                type: 'bat',
                slot: 4,
                emoji: '🦇',
                
                stats: {
                    hp: 50,
                    damage: 8,
                    armor: 0
                },
                speed: 90,
                loot: { exp: 10 },
                
                skills: [
                    {
                        id: 'screech', name: '尖啸', emoji: '🦇',
                        skillType: 'ranged', damageType: 'physical', targetType: 'enemy', range: 'ranged',
                        damage: 8, cooldown: 0, actionPoints: 1,
                        effects: []
                    }
                ]
            },
            {
                id: 'raptor_1',
                name: '迅猛龙',
                type: 'raptor',
                slot: 5,
                emoji: '🦎',
                
                stats: {
                    hp: 100,
                    damage: 18,
                    armor: 3
                },
                speed: 75,
                loot: { exp: 20 },
                
                skills: [
                    {
                        id: 'claw_strike', name: '利爪撕咬', emoji: '🦎',
                        skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
                        damage: 18, cooldown: 0, actionPoints: 1,
                        effects: []
                    },
                    {
                        id: 'pounce', name: '猛扑', emoji: '💥',
                        description: '扑向目标，造成伤害并降低护甲',
                        skillType: 'melee', damageType: 'physical', targetType: 'enemy', range: 'melee',
                        damage: 14, cooldown: 3, actionPoints: 2,
                        effects: [{ type: 'debuff', name: 'armor_break', stat: 'armor', value: -5, duration: 2 }]
                    }
                ]
            }
        ]
    },

    // ========== BOSS: 瑟芬迪斯 ==========
    // 等级3: baseDamage=150, difficultyMultiplier=0.5, finalDamage=75
    boss_serpentis: {
        id: 'serpentis',
        name: '变异的瑟芬迪斯',
        type: 'boss',
        slot: 2,
        emoji: '🐉',
        loot: { exp: 65 },
        
        baseStats: {
            hp: 800,
            damage: 75,
            armor: 20
        },
        speed: 60,
        
        // 三阶段配置
        phases: [
            {
                id: 1,
                name: '毒蛇之怒',
                hpThreshold: 1.0,
                actionsPerTurn: 2,
                damageModifier: 1.0,
                skills: ['venom_spit', 'tail_sweep'],
            },
            {
                id: 2,
                name: '触手召唤',
                hpThreshold: 0.7,
                actionsPerTurn: 2,
                damageModifier: 1.0,
                skills: ['venom_spit', 'tail_sweep', 'entangle'],
                onEnter: {
                    type: 'summon',
                    summonId: 'tendril_vine',
                    slot: 3,
                    message: '⚡ 瑟芬迪斯召唤了触手藤！',
                }
            },
            {
                id: 3,
                name: '狂暴蜕变',
                hpThreshold: 0.4,
                actionsPerTurn: 3,
                damageModifier: 1.3,
                skills: ['venom_spit', 'tail_sweep', 'entangle', 'toxic_burst'],
                onEnter: {
                    type: 'transform',
                    message: '🔥 瑟芬迪斯进入狂暴蜕变！',
                }
            }
        ],
        
        // 狂暴配置
        enrage: {
            triggerRound: 15,
            damageModifier: 2.0,
            aoePerRound: {
                damage: 50,
                type: 'poison',
                message: '☠️ 剧毒弥漫整个洞穴！',
            },
            message: '💀 瑟芬迪斯狂暴了！',
        },
        
        // BOSS技能
        skills: {
            venom_spit: {
                id: 'venom_spit', name: '毒液喷射', emoji: '💚',
                description: '向目标喷射毒液，造成自然伤害并附加中毒效果',
                skillType: 'ranged', damageType: 'nature', targetType: 'enemy', range: 'ranged',
                damage: 40, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'dot', name: 'poison', damageType: 'nature', tickDamage: 10, duration: 3 }],
            },
            
            tail_sweep: {
                id: 'tail_sweep', name: '尾巴横扫', emoji: '🌀',
                description: '用尾巴横扫前排敌人',
                skillType: 'melee', damageType: 'physical', targetType: 'front_2', range: 'melee',
                damage: 30, cooldown: 0, actionPoints: 1,
                effects: [],
            },
            
            entangle: {
                id: 'entangle', name: '缠绕', emoji: '🌿',
                description: '用藤蔓缠绕一名敌人，使其无法行动',
                skillType: 'debuff', damageType: 'nature', targetType: 'enemy', range: 'ranged',
                damage: 0, cooldown: 0, actionPoints: 1,
                effects: [{ type: 'cc', ccType: 'stun', duration: 1 }],
            },
            
            toxic_burst: {
                id: 'toxic_burst', name: '剧毒爆发', emoji: '☠️',
                description: '释放剧毒气体，对所有敌人造成大量伤害',
                skillType: 'spell', damageType: 'nature', targetType: 'all_enemies', range: 'ranged',
                damage: 60, cooldown: 0, actionPoints: 1,
                effects: [],
                
                // 需要蓄力
                telegraph: {
                    chargeRounds: 1,
                    chargeMessage: '⚠️ 瑟芬迪斯正在准备【剧毒爆发】！',
                    releaseMessage: '💀 瑟芬迪斯释放了【剧毒爆发】！',
                    warningIcon: '☠️',
                },
            },
        },
    },

    // ========== 触手藤（召唤物）==========
    tendril_vine: {
        id: 'tendril_vine',
        name: '触手藤',
        type: 'add',
        emoji: '🌱',
        
        stats: {
            hp: 200,
            damage: 20,
            armor: 5
        },
        speed: 30,
        
        skills: [
            {
                id: 'vine_whip',
                name: '藤鞭',
                damage: 20,
                damageType: 'nature',
                targetType: 'single'
            },
            {
                id: 'constrict',
                name: '收缩',
                damage: 15,
                targetType: 'single',
                effect: {
                    type: 'debuff',
                    id: 'slow',
                    name: '减速',
                    duration: 2,
                }
            }
        ]
    },

    // ========== 辅助方法 ==========
    
    /**
     * 获取遭遇战配置
     * @param {string} encounterId - 遭遇战ID
     * @returns {Object} 遭遇战配置
     */
    getEncounter(encounterId) {
        return this[encounterId] || null;
    },
    
    /**
     * 获取BOSS配置
     * @returns {Object} BOSS配置
     */
    getBoss() {
        return this.boss_serpentis;
    },
    
    /**
     * 获取所有遭遇战列表
     * @returns {Array} 遭遇战列表
     */
    getEncounterList() {
        return this.encounters.map(e => ({
            ...e,
            data: this.getEncounter(e.id)
        }));
    },
    
    /**
     * 创建BOSS实例（用于战斗）
     * @returns {Object} BOSS实例
     */
    createBossInstance() {
        const bossConfig = this.boss_serpentis;
        return {
            id: bossConfig.id,
            name: bossConfig.name,
            type: bossConfig.type,
            isBoss: true,
            slot: bossConfig.slot,
            emoji: bossConfig.emoji,
            
            currentHp: bossConfig.baseStats.hp,
            maxHp: bossConfig.baseStats.hp,
            damage: bossConfig.baseStats.damage,
            armor: bossConfig.baseStats.armor,
            speed: bossConfig.speed,
            
            // 复制配置供BossPhaseSystem使用
            phases: bossConfig.phases,
            enrage: bossConfig.enrage,
            skillData: bossConfig.skills,
            loot: bossConfig.loot || { exp: 0 },
        };
    },
    
    /**
     * 创建小怪实例（用于战斗）
     * @param {string} waveId - 波次ID
     * @returns {Array} 小怪实例列表
     */
    createTrashInstance(waveId) {
        const waveConfig = this[waveId];
        if (!waveConfig) return [];
        
        return waveConfig.enemies.map(enemy => ({
            id: enemy.id,
            name: enemy.name,
            type: enemy.type,
            slot: enemy.slot,
            emoji: enemy.emoji,
            
            currentHp: enemy.stats.hp,
            maxHp: enemy.stats.hp,
            damage: enemy.stats.damage,
            armor: enemy.stats.armor,
            speed: enemy.speed,
            
            skills: enemy.skills,
            loot: enemy.loot || { exp: 0 },
        }));
    },
    
    /**
     * 创建召唤物实例
     * @param {string} summonId - 召唤物ID
     * @param {number} slot - 位置
     * @returns {Object} 召唤物实例
     */
    createSummonInstance(summonId, slot) {
        const summonConfig = this[summonId];
        if (!summonConfig) return null;
        
        return {
            id: `${summonConfig.id}_${Date.now()}`,
            name: summonConfig.name,
            type: summonConfig.type,
            slot: slot || summonConfig.slot || 3,
            emoji: summonConfig.emoji,
            
            currentHp: summonConfig.stats.hp,
            maxHp: summonConfig.stats.hp,
            damage: summonConfig.stats.damage,
            armor: summonConfig.stats.armor,
            speed: summonConfig.speed,
            
            skills: summonConfig.skills,
        };
    }
};

export const DungeonData = {
    wailing_caverns: WailingCaverns
}
