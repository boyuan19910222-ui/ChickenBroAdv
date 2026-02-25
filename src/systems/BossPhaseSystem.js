/**
 * BOSS阶段系统 - 管理BOSS战的阶段转换、狂暴和技能预告
 * 
 * 特性:
 * - 血量阶段制（70%/40%触发）
 * - BOSS多次行动（2-3次/回合）
 * - 狂暴计时器（15回合）
 * - 技能预告（蓄力大招）
 */
import { randomChoice } from '../core/RandomProvider.js'

export const BossPhaseSystem = {
    // 狂暴配置
    ENRAGE_CONFIG: {
        defaultTriggerRound: 15,
        damageMultiplier: 2.0,
        aoePerRound: true
    },

    /**
     * 创建BOSS战斗状态
     * @param {Object} bossConfig - BOSS配置
     * @returns {Object} BOSS状态
     */
    createBossState(bossConfig) {
        return {
            bossId: bossConfig.id,
            bossName: bossConfig.name,
            currentPhase: 1,
            currentHp: bossConfig.baseStats.hp,
            maxHp: bossConfig.baseStats.hp,
            currentHpPercent: 1.0,
            
            // 阶段信息
            phases: bossConfig.phases || [],
            phaseTriggered: { 1: true },  // 阶段1默认已触发
            
            // 狂暴
            isEnraged: false,
            enrageConfig: bossConfig.enrage || null,
            roundCount: 0,
            
            // 技能预告
            isCharging: false,
            chargingSkill: null,
            chargeRoundsRemaining: 0,
            
            // 当前阶段配置
            actionsPerTurn: bossConfig.phases?.[0]?.actionsPerTurn || 2,
            damageModifier: bossConfig.phases?.[0]?.damageModifier || 1.0,
            availableSkills: bossConfig.phases?.[0]?.skills || [],
            
            // 事件队列
            pendingEvents: []
        };
    },

    /**
     * 更新BOSS血量并检查阶段转换
     * @param {Object} bossState - BOSS状态
     * @param {number} newHp - 新血量
     * @returns {Object} { bossState, phaseChanged, events }
     */
    updateHp(bossState, newHp) {
        const result = {
            bossState,
            phaseChanged: false,
            newPhase: null,
            events: []
        };
        
        bossState.currentHp = Math.max(0, newHp);
        bossState.currentHpPercent = bossState.currentHp / bossState.maxHp;
        
        // 检查阶段转换
        for (const phase of bossState.phases) {
            if (phase.id > bossState.currentPhase && 
                bossState.currentHpPercent <= phase.hpThreshold &&
                !bossState.phaseTriggered[phase.id]) {
                
                // 触发阶段转换
                result.phaseChanged = true;
                result.newPhase = phase;
                result.events.push(...this._triggerPhaseTransition(bossState, phase));
            }
        }
        
        return result;
    },

    /**
     * 触发阶段转换
     * @private
     */
    _triggerPhaseTransition(bossState, phase) {
        const events = [];
        
        bossState.currentPhase = phase.id;
        bossState.phaseTriggered[phase.id] = true;
        bossState.actionsPerTurn = phase.actionsPerTurn || bossState.actionsPerTurn;
        bossState.damageModifier = phase.damageModifier || bossState.damageModifier;
        bossState.availableSkills = phase.skills || bossState.availableSkills;
        
        // 处理阶段转换事件
        if (phase.onEnter) {
            events.push({
                type: 'phase_transition',
                phaseId: phase.id,
                phaseName: phase.name,
                message: phase.onEnter.message,
                action: phase.onEnter
            });
            
            // 根据 onEnter.type 分发事件
            switch (phase.onEnter.type) {
                case 'summon':
                    events.push({
                        type: 'summon',
                        summonId: phase.onEnter.summonId,
                        slot: phase.onEnter.slot,
                        message: phase.onEnter.message
                    });
                    break;
                    
                case 'buff':
                    events.push({
                        type: 'buff',
                        buffName: phase.onEnter.buffName || phase.onEnter.name,
                        stat: phase.onEnter.stat,
                        value: phase.onEnter.value,
                        duration: phase.onEnter.duration || 99,
                        message: phase.onEnter.message
                    });
                    break;
                    
                case 'resurrect':
                    events.push({
                        type: 'resurrect',
                        targetId: phase.onEnter.targetId,
                        targetName: phase.onEnter.targetName,
                        hpPercent: phase.onEnter.hpPercent || 1.0,
                        message: phase.onEnter.message
                    });
                    break;
                    
                case 'message':
                    // phase_transition event already carries the message
                    break;
            }
        }
        
        return events;
    },

    /**
     * 回合开始处理
     * @param {Object} bossState - BOSS状态
     * @returns {Object} { bossState, events }
     */
    onRoundStart(bossState) {
        const events = [];
        
        bossState.roundCount++;
        
        // 检查狂暴
        if (!bossState.isEnraged && bossState.enrageConfig) {
            const triggerRound = bossState.enrageConfig.triggerRound || this.ENRAGE_CONFIG.defaultTriggerRound;
            
            if (bossState.roundCount >= triggerRound) {
                events.push(...this._triggerEnrage(bossState));
            }
        }
        
        return { bossState, events };
    },

    /**
     * 触发狂暴
     * @private
     */
    _triggerEnrage(bossState) {
        const events = [];
        
        bossState.isEnraged = true;
        bossState.damageModifier *= bossState.enrageConfig.damageModifier || this.ENRAGE_CONFIG.damageMultiplier;
        
        events.push({
            type: 'enrage',
            message: bossState.enrageConfig.message || `${bossState.bossName}狂暴了！`,
            damageModifier: bossState.damageModifier
        });
        
        return events;
    },

    /**
     * 狂暴AOE处理（每回合）
     * @param {Object} bossState - BOSS状态
     * @returns {Object|null} AOE事件
     */
    getEnrageAoe(bossState) {
        if (!bossState.isEnraged || !bossState.enrageConfig?.aoePerRound) {
            return null;
        }
        
        return {
            type: 'enrage_aoe',
            damage: bossState.enrageConfig.aoePerRound.damage || 50,
            damageType: bossState.enrageConfig.aoePerRound.type || 'physical',
            message: bossState.enrageConfig.aoePerRound.message || '狂暴能量爆发！'
        };
    },

    /**
     * 获取狂暴倒计时
     * @param {Object} bossState - BOSS状态
     * @returns {Object} { isEnraged, roundsRemaining, triggerRound }
     */
    getEnrageCountdown(bossState) {
        if (!bossState.enrageConfig) {
            return { isEnraged: false, roundsRemaining: null, triggerRound: null };
        }
        
        const triggerRound = bossState.enrageConfig.triggerRound || this.ENRAGE_CONFIG.defaultTriggerRound;
        const roundsRemaining = triggerRound - bossState.roundCount;
        
        return {
            isEnraged: bossState.isEnraged,
            roundsRemaining: bossState.isEnraged ? 0 : Math.max(0, roundsRemaining),
            triggerRound,
            currentRound: bossState.roundCount
        };
    },

    /**
     * 开始蓄力技能
     * @param {Object} bossState - BOSS状态
     * @param {Object} skill - 技能配置
     * @returns {Object} { bossState, event }
     */
    startCharging(bossState, skill) {
        if (!skill.telegraph) {
            return { bossState, event: null };
        }
        
        bossState.isCharging = true;
        bossState.chargingSkill = skill;
        bossState.chargeRoundsRemaining = skill.telegraph.chargeRounds || 1;
        
        return {
            bossState,
            event: {
                type: 'skill_telegraph',
                skillId: skill.id,
                skillName: skill.name,
                message: skill.telegraph.chargeMessage,
                warningIcon: skill.telegraph.warningIcon || '⚠️',
                roundsRemaining: bossState.chargeRoundsRemaining
            }
        };
    },

    /**
     * 更新蓄力状态
     * @param {Object} bossState - BOSS状态
     * @returns {Object} { bossState, shouldRelease, skill }
     */
    updateCharging(bossState) {
        if (!bossState.isCharging) {
            return { bossState, shouldRelease: false, skill: null };
        }
        
        bossState.chargeRoundsRemaining--;
        
        if (bossState.chargeRoundsRemaining <= 0) {
            const skill = bossState.chargingSkill;
            bossState.isCharging = false;
            bossState.chargingSkill = null;
            
            return {
                bossState,
                shouldRelease: true,
                skill,
                event: {
                    type: 'skill_release',
                    skillId: skill.id,
                    skillName: skill.name,
                    message: skill.telegraph?.releaseMessage || `${bossState.bossName}释放了${skill.name}！`
                }
            };
        }
        
        return { bossState, shouldRelease: false, skill: null };
    },

    /**
     * 获取BOSS当前回合可执行的行动次数
     * @param {Object} bossState - BOSS状态
     * @returns {number} 行动次数
     */
    getActionsPerTurn(bossState) {
        return bossState.actionsPerTurn;
    },

    /**
     * 获取BOSS当前可用技能
     * @param {Object} bossState - BOSS状态
     * @returns {Array} 可用技能ID列表
     */
    getAvailableSkills(bossState) {
        // 如果正在蓄力，只能继续蓄力或释放
        if (bossState.isCharging) {
            return [];
        }
        return bossState.availableSkills;
    },

    /**
     * 计算BOSS伤害（应用伤害修正）
     * @param {Object} bossState - BOSS状态
     * @param {number} baseDamage - 基础伤害
     * @returns {number} 最终伤害
     */
    calculateDamage(bossState, baseDamage) {
        return Math.floor(baseDamage * bossState.damageModifier);
    },

    /**
     * 获取BOSS状态显示信息
     * @param {Object} bossState - BOSS状态
     * @returns {Object} 显示信息
     */
    getDisplayInfo(bossState) {
        const currentPhaseConfig = bossState.phases.find(p => p.id === bossState.currentPhase);
        const enrageCountdown = this.getEnrageCountdown(bossState);
        
        return {
            name: bossState.bossName,
            hp: bossState.currentHp,
            maxHp: bossState.maxHp,
            hpPercent: Math.round(bossState.currentHpPercent * 100),
            
            phase: {
                current: bossState.currentPhase,
                name: currentPhaseConfig?.name || `阶段${bossState.currentPhase}`,
                total: bossState.phases.length
            },
            
            enrage: enrageCountdown,
            
            charging: bossState.isCharging ? {
                skill: bossState.chargingSkill?.name,
                icon: bossState.chargingSkill?.telegraph?.warningIcon || '⚠️',
                roundsRemaining: bossState.chargeRoundsRemaining
            } : null,
            
            modifiers: {
                damage: `${Math.round(bossState.damageModifier * 100)}%`,
                actions: bossState.actionsPerTurn
            }
        };
    },

    /**
     * 检查技能是否需要预告（蓄力）
     * @param {Object} skill - 技能配置
     * @returns {boolean}
     */
    skillNeedsTelegraph(skill) {
        return skill.telegraph && skill.telegraph.chargeRounds > 0;
    },

    /**
     * 选择BOSS下一个技能（AI逻辑）
     * @param {Object} bossState - BOSS状态
     * @param {Object} battleContext - 战斗上下文
     * @returns {string|null} 技能ID
     */
    selectNextSkill(bossState, battleContext) {
        const availableSkills = this.getAvailableSkills(bossState);
        
        if (availableSkills.length === 0) {
            return null;
        }
        
        // 简单AI：随机选择，但优先选择蓄力技能在特定条件下
        // 后续可以扩展更复杂的AI逻辑
        
        return randomChoice(availableSkills);
    }
};

// 导出到全局
