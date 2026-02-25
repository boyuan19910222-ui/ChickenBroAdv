/**
 * 回合顺序系统 - 管理战斗中的行动顺序
 * 
 * 特性:
 * - 职业固定速度值
 * - 暗黑地牢式惊喜机制（随机打乱顺序）
 * - 完全交替回合结构（敌我按速度混排）
 */
import { random, randomInt } from '../core/RandomProvider.js'
import { GameData } from '../data/GameData.js'

export const TurnOrderSystem = {
    // 惊喜机制配置
    SURPRISE_CONFIG: {
        triggerChance: 0.15,    // 15%触发概率
        effects: [
            { type: 'random_insert', weight: 50, name: '随机插入' },
            { type: 'slowest_first', weight: 25, name: '慢者先行' },
            { type: 'fastest_last', weight: 25, name: '快者殿后' },
        ],
    },

    /**
     * 创建回合状态
     * @returns {Object} 回合状态对象
     */
    createTurnState() {
        return {
            currentRound: 1,
            turnOrder: [],
            currentTurnIndex: 0,
            surpriseTriggered: false,
            surpriseEffect: null,
            roundComplete: false
        };
    },

    /**
     * 获取单位的速度值
     * @param {Object} unit - 单位对象
     * @param {string} unitType - 'player' 或 'enemy'
     * @returns {number} 速度值
     */
    getUnitSpeed(unit, unitType) {
        if (unitType === 'player') {
            // 玩家单位使用职业速度
            const classId = unit.classId || unit.class;
            return GameData.classSpeed[classId] || 50;
        } else {
            // 敌人单位使用敌人速度配置
            const enemyType = unit.type || unit.id;
            return GameData.enemySpeed[enemyType] || 50;
        }
    },

    /**
     * 计算初始行动顺序
     * @param {Array} playerUnits - 玩家方单位列表 [{unit, slot}]
     * @param {Array} enemyUnits - 敌方单位列表 [{unit, slot}]
     * @param {Object} options - 可选参数 { isFirstRound: boolean }
     * @returns {Array} 行动顺序列表
     */
    calculateTurnOrder(playerUnits, enemyUnits, options = {}) {
        const allUnits = [];
        
        // 添加玩家单位
        playerUnits.forEach(({ unit, slot }) => {
            if (unit && unit.currentHp > 0) {
                allUnits.push({
                    unitId: unit.id,
                    unit: unit,
                    side: 'player',
                    slot: slot,
                    speed: this.getUnitSpeed(unit, 'player'),
                    hasActed: false
                });
            }
        });
        
        // 添加敌人单位
        enemyUnits.forEach(({ unit, slot }) => {
            if (unit && unit.currentHp > 0) {
                allUnits.push({
                    unitId: unit.id,
                    unit: unit,
                    side: 'enemy',
                    slot: slot,
                    speed: this.getUnitSpeed(unit, 'enemy'),
                    hasActed: false
                });
            }
        });
        
        // 按速度降序排序（速度高的先行动）
        allUnits.sort((a, b) => {
            // 速度不同按速度排
            if (b.speed !== a.speed) {
                return b.speed - a.speed;
            }
            // 速度相同，玩家优先
            if (a.side !== b.side) {
                return a.side === 'player' ? -1 : 1;
            }
            // 同方，按位置排
            return a.slot - b.slot;
        });
        
        // 遭遇战首轮：坦克先手（确保坦克第一个行动以拉住仇恨）
        if (options.isFirstRound) {
            const tankIndex = allUnits.findIndex(
                u => u.side === 'player' && u.unit.role === 'tank'
            );
            if (tankIndex > 0) {
                const [tank] = allUnits.splice(tankIndex, 1);
                allUnits.unshift(tank);
            }
        }
        
        return allUnits;
    },

    /**
     * 检查并应用惊喜机制
     * @param {Object} turnState - 回合状态
     * @returns {Object} 更新后的回合状态
     */
    applySurpriseMechanism(turnState) {
        // 随机决定是否触发惊喜
        if (random() > this.SURPRISE_CONFIG.triggerChance) {
            turnState.surpriseTriggered = false;
            turnState.surpriseEffect = null;
            return turnState;
        }
        
        // 选择惊喜效果
        const effect = this._selectRandomEffect();
        turnState.surpriseTriggered = true;
        turnState.surpriseEffect = effect;
        
        // 应用效果
        switch (effect.type) {
            case 'random_insert':
                turnState.turnOrder = this._applyRandomInsert(turnState.turnOrder);
                break;
            case 'slowest_first':
                turnState.turnOrder = this._applySlowestFirst(turnState.turnOrder);
                break;
            case 'fastest_last':
                turnState.turnOrder = this._applyFastestLast(turnState.turnOrder);
                break;
        }
        
        return turnState;
    },

    /**
     * 随机选择惊喜效果
     * @private
     */
    _selectRandomEffect() {
        const effects = this.SURPRISE_CONFIG.effects;
        const totalWeight = effects.reduce((sum, e) => sum + e.weight, 0);
        let random_ = random() * totalWeight;
        
        for (const effect of effects) {
            random_ -= effect.weight;
            if (random_ <= 0) {
                return effect;
            }
        }
        return effects[0];
    },

    /**
     * 随机插入效果 - 随机选择一个单位移动到新位置
     * @private
     */
    _applyRandomInsert(turnOrder) {
        if (turnOrder.length < 2) return turnOrder;
        
        const newOrder = [...turnOrder];
        const randomIndex = randomInt(0, newOrder.length - 1);
        const unit = newOrder.splice(randomIndex, 1)[0];
        const newPosition = randomInt(0, newOrder.length);
        newOrder.splice(newPosition, 0, unit);
        
        return newOrder;
    },

    /**
     * 慢者先行效果 - 最慢的单位移到最前
     * @private
     */
    _applySlowestFirst(turnOrder) {
        if (turnOrder.length < 2) return turnOrder;
        
        const newOrder = [...turnOrder];
        // 找到最慢的单位
        let slowestIndex = 0;
        let slowestSpeed = newOrder[0].speed;
        
        newOrder.forEach((unit, index) => {
            if (unit.speed < slowestSpeed) {
                slowestSpeed = unit.speed;
                slowestIndex = index;
            }
        });
        
        // 移到最前
        const slowest = newOrder.splice(slowestIndex, 1)[0];
        newOrder.unshift(slowest);
        
        return newOrder;
    },

    /**
     * 快者殿后效果 - 最快的单位移到最后
     * @private
     */
    _applyFastestLast(turnOrder) {
        if (turnOrder.length < 2) return turnOrder;
        
        const newOrder = [...turnOrder];
        // 找到最快的单位（应该在第一个，但再确认一下）
        let fastestIndex = 0;
        let fastestSpeed = newOrder[0].speed;
        
        newOrder.forEach((unit, index) => {
            if (unit.speed > fastestSpeed) {
                fastestSpeed = unit.speed;
                fastestIndex = index;
            }
        });
        
        // 移到最后
        const fastest = newOrder.splice(fastestIndex, 1)[0];
        newOrder.push(fastest);
        
        return newOrder;
    },

    /**
     * 开始新回合
     * @param {Object} turnState - 回合状态
     * @param {Array} playerUnits - 玩家方单位列表
     * @param {Array} enemyUnits - 敌方单位列表
     * @returns {Object} 更新后的回合状态
     */
    startNewRound(turnState, playerUnits, enemyUnits) {
        const isFirstRound = turnState.currentRound === 1;
        
        // 重新计算行动顺序（基于当前存活单位；首轮坦克先手）
        turnState.turnOrder = this.calculateTurnOrder(playerUnits, enemyUnits, { isFirstRound });
        turnState.currentTurnIndex = 0;
        turnState.roundComplete = false;
        
        // 重置所有单位的行动状态
        turnState.turnOrder.forEach(entry => {
            entry.hasActed = false;
        });
        
        // 惊喜机制：首轮跳过（坦克需要稳定先手拉仇恨），后续回合正常触发
        if (!isFirstRound) {
            this.applySurpriseMechanism(turnState);
        } else {
            turnState.surpriseTriggered = false;
            turnState.surpriseEffect = null;
        }
        
        return turnState;
    },

    /**
     * 获取当前行动的单位
     * @param {Object} turnState - 回合状态
     * @returns {Object|null} 当前单位信息
     */
    getCurrentUnit(turnState) {
        if (turnState.currentTurnIndex >= turnState.turnOrder.length) {
            return null;
        }
        return turnState.turnOrder[turnState.currentTurnIndex];
    },

    /**
     * 结束当前单位的回合，进入下一个
     * @param {Object} turnState - 回合状态
     * @returns {Object} 更新后的回合状态
     */
    endCurrentTurn(turnState) {
        const current = this.getCurrentUnit(turnState);
        if (current) {
            current.hasActed = true;
        }
        
        turnState.currentTurnIndex++;
        
        // 检查回合是否结束
        if (turnState.currentTurnIndex >= turnState.turnOrder.length) {
            turnState.roundComplete = true;
            turnState.currentRound++;
        }
        
        return turnState;
    },

    /**
     * 从行动顺序中移除阵亡单位
     * @param {Object} turnState - 回合状态
     * @param {string} unitId - 阵亡单位ID
     * @returns {Object} 更新后的回合状态
     */
    removeDeadUnit(turnState, unitId) {
        const index = turnState.turnOrder.findIndex(entry => entry.unitId === unitId);
        
        if (index !== -1) {
            turnState.turnOrder.splice(index, 1);
            
            // 如果移除的单位在当前索引之前，需要调整索引
            if (index < turnState.currentTurnIndex) {
                turnState.currentTurnIndex--;
            }
        }
        
        return turnState;
    },

    /**
     * 添加新单位到行动顺序（如召唤物）
     * @param {Object} turnState - 回合状态
     * @param {Object} unit - 新单位
     * @param {string} side - 'player' 或 'enemy'
     * @param {number} slot - 位置
     * @returns {Object} 更新后的回合状态
     */
    addUnit(turnState, unit, side, slot) {
        const speed = side === 'player' 
            ? this.getUnitSpeed(unit, 'player')
            : this.getUnitSpeed(unit, 'enemy');
        
        const newEntry = {
            unitId: unit.id,
            unit: unit,
            side: side,
            slot: slot,
            speed: speed,
            hasActed: true  // 新加入的单位本回合不行动
        };
        
        // 插入到合适的位置（按速度）
        let insertIndex = turnState.turnOrder.length;
        for (let i = turnState.currentTurnIndex; i < turnState.turnOrder.length; i++) {
            if (turnState.turnOrder[i].speed < speed) {
                insertIndex = i;
                break;
            }
        }
        
        turnState.turnOrder.splice(insertIndex, 0, newEntry);
        
        return turnState;
    },

    /**
     * 获取回合顺序预览（用于UI显示）
     * @param {Object} turnState - 回合状态
     * @returns {Array} 预览列表
     */
    getTurnOrderPreview(turnState) {
        return turnState.turnOrder.map((entry, index) => ({
            unitId: entry.unitId,
            unitName: entry.unit.name,
            side: entry.side,
            speed: entry.speed,
            isCurrent: index === turnState.currentTurnIndex,
            hasActed: entry.hasActed,
            emoji: entry.unit.emoji || (entry.side === 'player' ? '👤' : '👹'),
            icon: entry.unit.icon || '',
            isPlayer: entry.unit.isPlayer === true
        }));
    },

    /**
     * 获取惊喜效果提示信息
     * @param {Object} turnState - 回合状态
     * @returns {string|null} 提示信息
     */
    getSurpriseMessage(turnState) {
        if (!turnState.surpriseTriggered || !turnState.surpriseEffect) {
            return null;
        }
        
        switch (turnState.surpriseEffect.type) {
            case 'random_insert':
                return '⚡ 惊喜！行动顺序被打乱了！';
            case 'slowest_first':
                return '🐢 惊喜！最慢的单位抢先行动！';
            case 'fastest_last':
                return '🏃 惊喜！最快的单位落到最后！';
            default:
                return null;
        }
    }
};

// 导出到全局
