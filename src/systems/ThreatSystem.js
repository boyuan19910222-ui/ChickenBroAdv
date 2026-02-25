/**
 * 仇恨系统 - 管理敌人的攻击目标选择
 * 
 * 特性:
 * - 伤害产生仇恨（系数1.0）
 * - 治疗产生仇恨（系数0.5）
 * - 坦克技能额外仇恨（系数3.0）
 * - 嘲讽强制锁定2回合
 */
import { randomChoice } from '../core/RandomProvider.js'

export const ThreatSystem = {
    // 仇恨配置
    CONFIG: {
        damageMultiplier: 1.0,       // 伤害仇恨系数
        healingMultiplier: 0.5,      // 治疗仇恨系数
        tankSkillMultiplier: 3.0,    // 坦克技能额外系数
        tauntDuration: 2,            // 嘲讽持续回合数
    },

    // 坦克技能列表（产生额外仇恨）
    TANK_SKILLS: [
        'shieldBlock', 'taunt', 'shieldWall', 'thunderClap',  // 战士
        'consecration', 'hammerOfJustice',                      // 圣骑士
        'bearForm', 'swipe', 'growl',                           // 德鲁伊
    ],

    /**
     * 创建仇恨系统状态
     * @returns {Object} 仇恨状态对象
     */
    createThreatState() {
        return {
            // 仇恨表: { enemyId: { playerId: threatValue, ... }, ... }
            threatTable: {},
            // 嘲讽状态: { enemyId: { tauntedBy: playerId, remainingRounds: N }, ... }
            tauntState: {},
            // 事件日志
            threatLog: []
        };
    },

    /**
     * 初始化敌人的仇恨表
     * @param {Object} threatState - 仇恨状态
     * @param {string} enemyId - 敌人ID
     * @param {Array} playerIds - 玩家ID列表
     * @returns {Object} 更新后的状态
     */
    initializeEnemyThreat(threatState, enemyId, playerIds) {
        threatState.threatTable[enemyId] = {};
        playerIds.forEach(playerId => {
            threatState.threatTable[enemyId][playerId] = 0;
        });
        return threatState;
    },

    /**
     * 添加伤害仇恨
     * @param {Object} threatState - 仇恨状态
     * @param {string} enemyId - 敌人ID
     * @param {string} playerId - 玩家ID
     * @param {number} damage - 伤害量
     * @param {string} skillId - 技能ID（可选）
     * @returns {Object} 更新后的状态
     */
    addDamageThreat(threatState, enemyId, playerId, damage, skillId = null) {
        if (!threatState.threatTable[enemyId]) {
            threatState.threatTable[enemyId] = {};
        }
        
        let multiplier = this.CONFIG.damageMultiplier;
        
        // 检查是否是坦克技能
        if (skillId && this.TANK_SKILLS.includes(skillId)) {
            multiplier *= this.CONFIG.tankSkillMultiplier;
        }
        
        const threatAmount = Math.floor(damage * multiplier);
        
        if (!threatState.threatTable[enemyId][playerId]) {
            threatState.threatTable[enemyId][playerId] = 0;
        }
        
        threatState.threatTable[enemyId][playerId] += threatAmount;
        
        // 记录日志
        this._logThreatChange(threatState, {
            type: 'damage',
            enemyId,
            playerId,
            amount: threatAmount,
            reason: skillId || 'attack',
            newTotal: threatState.threatTable[enemyId][playerId]
        });
        
        return threatState;
    },

    /**
     * 添加治疗仇恨（对所有敌人）
     * @param {Object} threatState - 仇恨状态
     * @param {string} healerId - 治疗者ID
     * @param {number} healAmount - 治疗量
     * @returns {Object} 更新后的状态
     */
    addHealingThreat(threatState, healerId, healAmount) {
        const threatAmount = Math.floor(healAmount * this.CONFIG.healingMultiplier);
        
        // 对所有敌人增加仇恨
        Object.keys(threatState.threatTable).forEach(enemyId => {
            if (!threatState.threatTable[enemyId][healerId]) {
                threatState.threatTable[enemyId][healerId] = 0;
            }
            
            threatState.threatTable[enemyId][healerId] += threatAmount;
            
            // 记录日志
            this._logThreatChange(threatState, {
                type: 'healing',
                enemyId,
                playerId: healerId,
                amount: threatAmount,
                reason: 'healing',
                newTotal: threatState.threatTable[enemyId][healerId]
            });
        });
        
        return threatState;
    },

    /**
     * 添加坦克技能仇恨
     * @param {Object} threatState - 仇恨状态
     * @param {string} enemyId - 敌人ID
     * @param {string} tankId - 坦克ID
     * @param {number} baseAmount - 基础仇恨量
     * @param {string} skillId - 技能ID
     * @returns {Object} 更新后的状态
     */
    addTankSkillThreat(threatState, enemyId, tankId, baseAmount, skillId) {
        const threatAmount = Math.floor(baseAmount * this.CONFIG.tankSkillMultiplier);
        
        if (!threatState.threatTable[enemyId]) {
            threatState.threatTable[enemyId] = {};
        }
        
        if (!threatState.threatTable[enemyId][tankId]) {
            threatState.threatTable[enemyId][tankId] = 0;
        }
        
        threatState.threatTable[enemyId][tankId] += threatAmount;
        
        // 记录日志
        this._logThreatChange(threatState, {
            type: 'tank_skill',
            enemyId,
            playerId: tankId,
            amount: threatAmount,
            reason: skillId,
            newTotal: threatState.threatTable[enemyId][tankId]
        });
        
        return threatState;
    },

    /**
     * 应用嘲讽效果
     * @param {Object} threatState - 仇恨状态
     * @param {string} enemyId - 敌人ID
     * @param {string} taunterId - 嘲讽者ID
     * @returns {Object} 更新后的状态
     */
    applyTaunt(threatState, enemyId, taunterId) {
        threatState.tauntState[enemyId] = {
            tauntedBy: taunterId,
            remainingRounds: this.CONFIG.tauntDuration
        };
        
        // 记录日志
        this._logThreatChange(threatState, {
            type: 'taunt',
            enemyId,
            playerId: taunterId,
            amount: 0,
            reason: 'taunt',
            newTotal: null
        });
        
        return threatState;
    },

    /**
     * 更新嘲讽状态（回合结束时调用）
     * @param {Object} threatState - 仇恨状态
     * @returns {Object} 更新后的状态
     */
    updateTauntDuration(threatState) {
        Object.keys(threatState.tauntState).forEach(enemyId => {
            const taunt = threatState.tauntState[enemyId];
            if (taunt) {
                taunt.remainingRounds--;
                if (taunt.remainingRounds <= 0) {
                    delete threatState.tauntState[enemyId];
                }
            }
        });
        return threatState;
    },

    /**
     * 获取敌人的攻击目标
     * @param {Object} threatState - 仇恨状态
     * @param {string} enemyId - 敌人ID
     * @param {Array} alivePlayerIds - 存活玩家ID列表
     * @returns {string|null} 目标玩家ID
     */
    getAttackTarget(threatState, enemyId, alivePlayerIds) {
        // 检查是否被嘲讽
        const taunt = threatState.tauntState[enemyId];
        if (taunt && alivePlayerIds.includes(taunt.tauntedBy)) {
            return taunt.tauntedBy;
        }
        
        // 按仇恨值选择目标
        const threatTable = threatState.threatTable[enemyId];
        if (!threatTable) {
            // 没有仇恨表，随机选择
            return randomChoice(alivePlayerIds);
        }
        
        // 找到仇恨最高的存活玩家
        let highestThreat = -1;
        let targetId = null;
        
        alivePlayerIds.forEach(playerId => {
            const threat = threatTable[playerId] || 0;
            if (threat > highestThreat) {
                highestThreat = threat;
                targetId = playerId;
            }
        });
        
        // 如果没有找到（所有人仇恨为0），随机选择
        if (!targetId) {
            targetId = randomChoice(alivePlayerIds);
        }
        
        return targetId;
    },

    /**
     * 获取敌人的仇恨列表（用于UI显示）
     * @param {Object} threatState - 仇恨状态
     * @param {string} enemyId - 敌人ID
     * @returns {Array} 仇恨列表，按仇恨值降序
     */
    getThreatList(threatState, enemyId) {
        const threatTable = threatState.threatTable[enemyId];
        if (!threatTable) return [];
        
        const list = Object.entries(threatTable).map(([playerId, threat]) => ({
            playerId,
            threat,
            isTaunted: threatState.tauntState[enemyId]?.tauntedBy === playerId
        }));
        
        // 按仇恨值降序排序
        list.sort((a, b) => b.threat - a.threat);
        
        // 添加排名
        list.forEach((entry, index) => {
            entry.rank = index + 1;
        });
        
        return list;
    },

    /**
     * 获取玩家在某敌人处的仇恨排名
     * @param {Object} threatState - 仇恨状态
     * @param {string} enemyId - 敌人ID
     * @param {string} playerId - 玩家ID
     * @returns {Object} { rank, threat, isTop }
     */
    getPlayerThreatRank(threatState, enemyId, playerId) {
        const list = this.getThreatList(threatState, enemyId);
        const entry = list.find(e => e.playerId === playerId);
        
        if (!entry) {
            return { rank: list.length + 1, threat: 0, isTop: false };
        }
        
        return {
            rank: entry.rank,
            threat: entry.threat,
            isTop: entry.rank === 1
        };
    },

    /**
     * 移除阵亡玩家的仇恨
     * @param {Object} threatState - 仇恨状态
     * @param {string} playerId - 阵亡玩家ID
     * @returns {Object} 更新后的状态
     */
    removeDeadPlayer(threatState, playerId) {
        // 从所有敌人的仇恨表中移除
        Object.keys(threatState.threatTable).forEach(enemyId => {
            if (threatState.threatTable[enemyId][playerId] !== undefined) {
                delete threatState.threatTable[enemyId][playerId];
            }
            
            // 如果该玩家是嘲讽目标，移除嘲讽
            if (threatState.tauntState[enemyId]?.tauntedBy === playerId) {
                delete threatState.tauntState[enemyId];
            }
        });
        
        return threatState;
    },

    /**
     * 移除阵亡敌人的仇恨表
     * @param {Object} threatState - 仇恨状态
     * @param {string} enemyId - 阵亡敌人ID
     * @returns {Object} 更新后的状态
     */
    removeDeadEnemy(threatState, enemyId) {
        delete threatState.threatTable[enemyId];
        delete threatState.tauntState[enemyId];
        return threatState;
    },

    /**
     * 添加新敌人到仇恨系统（如召唤物）
     * @param {Object} threatState - 仇恨状态
     * @param {string} enemyId - 新敌人ID
     * @param {Array} playerIds - 玩家ID列表
     * @param {number} initialThreat - 初始仇恨值（可选）
     * @returns {Object} 更新后的状态
     */
    addNewEnemy(threatState, enemyId, playerIds, initialThreat = 0) {
        threatState.threatTable[enemyId] = {};
        playerIds.forEach(playerId => {
            threatState.threatTable[enemyId][playerId] = initialThreat;
        });
        return threatState;
    },

    /**
     * 记录仇恨变化日志
     * @private
     */
    _logThreatChange(threatState, event) {
        event.timestamp = Date.now();
        threatState.threatLog.push(event);
        
        // 保留最近100条日志
        if (threatState.threatLog.length > 100) {
            threatState.threatLog.shift();
        }
    },

    /**
     * 获取仇恨显示信息（用于坦克玩家UI）
     * @param {Object} threatState - 仇恨状态
     * @param {string} playerId - 玩家ID
     * @param {Array} enemyIds - 敌人ID列表
     * @returns {Object} 显示信息
     */
    getThreatDisplayForPlayer(threatState, playerId, enemyIds) {
        const info = {
            enemies: [],
            totalAggroCount: 0,
            isTopThreatCount: 0
        };
        
        enemyIds.forEach(enemyId => {
            const rank = this.getPlayerThreatRank(threatState, enemyId, playerId);
            const isTaunted = threatState.tauntState[enemyId]?.tauntedBy === playerId;
            
            info.enemies.push({
                enemyId,
                rank: rank.rank,
                threat: rank.threat,
                isTop: rank.isTop,
                isTaunted,
                hasAggro: rank.isTop || isTaunted
            });
            
            if (rank.isTop || isTaunted) {
                info.totalAggroCount++;
                if (rank.isTop) info.isTopThreatCount++;
            }
        });
        
        return info;
    }
};

// 导出到全局
