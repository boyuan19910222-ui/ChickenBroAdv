/**
 * 站位系统 - 管理战场位置、空位处理、目标选择逻辑
 * 
 * 战场布局:
 * 我方(左侧): [1][2][3][4][5] - 坦克/近战/远程/远程/治疗
 * 敌方(右侧): [1][2][3][4] - 前排到后排
 */
export const PositioningSystem = {
    // 战场配置
    BATTLEFIELD_CONFIG: {
        player: {
            positions: 5,
            layout: [
                { slot: 1, role: 'tank', x: 100, label: '坦克位' },
                { slot: 2, role: 'melee_dps', x: 200, label: '近战位' },
                { slot: 3, role: 'ranged_dps', x: 300, label: '远程位1' },
                { slot: 4, role: 'ranged_dps', x: 400, label: '远程位2' },
                { slot: 5, role: 'healer', x: 500, label: '治疗位' }
            ]
        },
        enemy: {
            positions: 5,
            layout: [
                { slot: 1, x: 700, label: '前排1' },
                { slot: 2, x: 800, label: '前排2' },
                { slot: 3, x: 900, label: '后排1' },
                { slot: 4, x: 1000, label: '后排2' },
                { slot: 5, x: 1100, label: '后排3' }
            ]
        },
        // 近战最大攻击距离（两边最近格子之间的基础距离 + 允许跨越的格子数 * 100）
        meleeMaxDistance: 400,
        // 玩家最前位置X坐标
        playerFrontX: 500,
        // 敌人最前位置X坐标  
        enemyFrontX: 700,
        // 每个格子间距
        slotWidth: 100
    },

    /**
     * 初始化战场状态
     * @returns {Object} 战场状态对象
     */
    createBattlefield() {
        return {
            player: this._createSidePositions('player', 5),
            enemy: this._createSidePositions('enemy', 5)
        };
    },

    /**
     * 创建一方的位置数组
     * @private
     */
    _createSidePositions(side, count) {
        const positions = [];
        const config = this.BATTLEFIELD_CONFIG[side];
        
        for (let i = 1; i <= count; i++) {
            const layoutInfo = config.layout.find(l => l.slot === i);
            positions.push({
                slot: i,
                unitId: null,
                unit: null,
                isOccupied: false,
                isAlive: false,
                x: layoutInfo ? layoutInfo.x : (side === 'player' ? i * 100 : 600 + i * 100),
                role: layoutInfo ? layoutInfo.role : null
            });
        }
        return positions;
    },

    /**
     * 将单位放置到指定位置
     * @param {Object} battlefield - 战场状态
     * @param {string} side - 'player' 或 'enemy'
     * @param {number} slot - 位置编号 (1-5 或 1-4)
     * @param {Object} unit - 单位对象
     */
    placeUnit(battlefield, side, slot, unit) {
        const position = battlefield[side].find(p => p.slot === slot);
        if (position) {
            position.unitId = unit.id;
            position.unit = unit;
            position.isOccupied = true;
            position.isAlive = unit.currentHp > 0;
        }
        return battlefield;
    },

    /**
     * 标记单位阵亡（保留位置）
     * @param {Object} battlefield - 战场状态
     * @param {string} side - 'player' 或 'enemy'
     * @param {string} unitId - 单位ID
     */
    markUnitDead(battlefield, side, unitId) {
        const position = battlefield[side].find(p => p.unitId === unitId);
        if (position) {
            position.isAlive = false;
            // 注意：不清除 unitId 和 unit，保留位置信息用于复活
        }
        return battlefield;
    },

    /**
     * 复活单位（恢复到原位置）
     * @param {Object} battlefield - 战场状态
     * @param {string} side - 'player' 或 'enemy'
     * @param {string} unitId - 单位ID
     */
    reviveUnit(battlefield, side, unitId) {
        const position = battlefield[side].find(p => p.unitId === unitId);
        if (position && position.unit) {
            position.isAlive = true;
        }
        return battlefield;
    },

    /**
     * 获取存活单位列表
     * @param {Object} battlefield - 战场状态
     * @param {string} side - 'player' 或 'enemy'
     * @returns {Array} 存活单位列表
     */
    getAliveUnits(battlefield, side) {
        return battlefield[side]
            .filter(p => p.isOccupied && p.isAlive)
            .map(p => ({
                ...p,
                unit: p.unit
            }));
    },

    /**
     * 计算逻辑位置（跳过阵亡单位）
     * @param {Object} battlefield - 战场状态
     * @param {string} side - 'player' 或 'enemy'
     * @returns {Array} 带逻辑位置的单位列表
     */
    calculateLogicalPositions(battlefield, side) {
        const aliveUnits = this.getAliveUnits(battlefield, side);
        // 按物理位置排序
        aliveUnits.sort((a, b) => a.slot - b.slot);
        
        // 分配逻辑位置
        return aliveUnits.map((unit, index) => ({
            ...unit,
            logicalSlot: index + 1,
            physicalSlot: unit.slot
        }));
    },

    /**
     * 根据逻辑位置获取目标
     * @param {Object} battlefield - 战场状态
     * @param {string} side - 'player' 或 'enemy'
     * @param {number} logicalSlot - 逻辑位置
     * @returns {Object|null} 目标单位
     */
    getUnitByLogicalSlot(battlefield, side, logicalSlot) {
        const unitsWithLogical = this.calculateLogicalPositions(battlefield, side);
        const target = unitsWithLogical.find(u => u.logicalSlot === logicalSlot);
        return target ? target.unit : null;
    },

    /**
     * 获取"前N个"目标（按逻辑位置）
     * @param {Object} battlefield - 战场状态
     * @param {string} side - 'player' 或 'enemy'
     * @param {number} count - 目标数量
     * @returns {Array} 目标单位列表
     */
    getFrontTargets(battlefield, side, count) {
        const unitsWithLogical = this.calculateLogicalPositions(battlefield, side);
        return unitsWithLogical
            .filter(u => u.logicalSlot <= count)
            .map(u => u.unit);
    },

    /**
     * 获取"后N个"目标（按逻辑位置）
     * @param {Object} battlefield - 战场状态
     * @param {string} side - 'player' 或 'enemy'
     * @param {number} count - 目标数量
     * @returns {Array} 目标单位列表
     */
    getBackTargets(battlefield, side, count) {
        const unitsWithLogical = this.calculateLogicalPositions(battlefield, side);
        const total = unitsWithLogical.length;
        return unitsWithLogical
            .filter(u => u.logicalSlot > total - count)
            .map(u => u.unit);
    },

    /**
     * 获取指定目标及其左右相邻的存活单位（用于 cleave_3 类 AOE）
     * @param {Object} battlefield - 战场状态
     * @param {string} side - 'player' 或 'enemy'
     * @param {string} targetId - 选中的主目标 ID
     * @returns {{ primary: Object, splash: Array }} 主目标和溅射目标
     */
    getAdjacentTargets(battlefield, side, targetId) {
        const unitsWithLogical = this.calculateLogicalPositions(battlefield, side);
        const targetEntry = unitsWithLogical.find(u => u.unitId === targetId);
        if (!targetEntry) return { primary: null, splash: [] };

        const primary = targetEntry.unit;
        const splash = unitsWithLogical
            .filter(u => u.unitId !== targetId &&
                Math.abs(u.logicalSlot - targetEntry.logicalSlot) === 1 &&
                u.unit.currentHp > 0)
            .map(u => u.unit);

        return { primary, splash };
    },

    /**
     * 获取所有存活目标
     * @param {Object} battlefield - 战场状态
     * @param {string} side - 'player' 或 'enemy'
     * @returns {Array} 所有存活单位
     */
    getAllAliveTargets(battlefield, side) {
        return this.getAliveUnits(battlefield, side).map(u => u.unit);
    },

    /**
     * 计算两个单位之间的物理距离
     * @param {Object} battlefield - 战场状态
     * @param {string} attackerSide - 攻击者所在方
     * @param {number} attackerSlot - 攻击者物理位置
     * @param {string} targetSide - 目标所在方
     * @param {number} targetSlot - 目标物理位置
     * @returns {number} 物理距离
     */
    calculatePhysicalDistance(battlefield, attackerSide, attackerSlot, targetSide, targetSlot) {
        const attackerPos = battlefield[attackerSide].find(p => p.slot === attackerSlot);
        const targetPos = battlefield[targetSide].find(p => p.slot === targetSlot);
        
        if (!attackerPos || !targetPos) return Infinity;
        
        return Math.abs(attackerPos.x - targetPos.x);
    },

    /**
     * 检查近战攻击是否在射程内
     * @param {Object} battlefield - 战场状态
     * @param {string} attackerSide - 攻击者所在方
     * @param {number} attackerSlot - 攻击者物理位置
     * @param {string} targetSide - 目标所在方
     * @param {number} targetSlot - 目标物理位置
     * @returns {boolean} 是否在射程内
     */
    isMeleeInRange(battlefield, attackerSide, attackerSlot, targetSide, targetSlot) {
        const distance = this.calculatePhysicalDistance(
            battlefield, attackerSide, attackerSlot, targetSide, targetSlot
        );
        return distance <= this.BATTLEFIELD_CONFIG.meleeMaxDistance;
    },

    /**
     * 获取近战可攻击的目标列表
     * @param {Object} battlefield - 战场状态
     * @param {string} attackerSide - 攻击者所在方
     * @param {number} attackerSlot - 攻击者物理位置
     * @returns {Array} 可攻击的目标列表
     */
    getMeleeTargetsInRange(battlefield, attackerSide, attackerSlot) {
        const targetSide = attackerSide === 'player' ? 'enemy' : 'player';
        const aliveTargets = this.getAliveUnits(battlefield, targetSide);
        
        return aliveTargets.filter(target => 
            this.isMeleeInRange(battlefield, attackerSide, attackerSlot, targetSide, target.slot)
        ).map(t => t.unit);
    },

    /**
     * 验证目标选择是否有效
     * @param {Object} battlefield - 战场状态
     * @param {Object} attacker - 攻击者单位
     * @param {Object} target - 目标单位
     * @param {Object} skill - 技能配置
     * @returns {Object} { valid: boolean, reason: string }
     */
    validateTargetSelection(battlefield, attacker, target, skill) {
        // 获取攻击者位置
        const attackerSide = this._findUnitSide(battlefield, attacker.id);
        const attackerPos = this._findUnitPosition(battlefield, attacker.id);
        
        if (!attackerSide || !attackerPos) {
            return { valid: false, reason: '无法找到攻击者位置' };
        }

        // 获取目标位置
        const targetSide = this._findUnitSide(battlefield, target.id);
        const targetPos = this._findUnitPosition(battlefield, target.id);
        
        if (!targetSide || !targetPos) {
            return { valid: false, reason: '无法找到目标位置' };
        }

        // 检查目标是否存活
        if (!targetPos.isAlive) {
            return { valid: false, reason: '目标已阵亡' };
        }

        // 检查技能目标类型
        const skillTargetType = skill.targetType || 'enemy';
        
        if (skillTargetType === 'enemy' && targetSide === attackerSide) {
            return { valid: false, reason: '该技能只能对敌方使用' };
        }
        
        if (skillTargetType === 'ally' && targetSide !== attackerSide) {
            return { valid: false, reason: '该技能只能对友方使用' };
        }
        
        if (skillTargetType === 'self' && target.id !== attacker.id) {
            return { valid: false, reason: '该技能只能对自己使用' };
        }

        // 检查近战射程
        const skillRange = skill.range || 'ranged';
        if (skillRange === 'melee') {
            if (!this.isMeleeInRange(battlefield, attackerSide, attackerPos.slot, targetSide, targetPos.slot)) {
                return { valid: false, reason: '目标超出近战攻击距离' };
            }
        }

        return { valid: true, reason: '' };
    },

    /**
     * 查找单位所在方
     * @private
     */
    _findUnitSide(battlefield, unitId) {
        if (battlefield.player.some(p => p.unitId === unitId)) return 'player';
        if (battlefield.enemy.some(p => p.unitId === unitId)) return 'enemy';
        return null;
    },

    /**
     * 查找单位位置信息
     * @private
     */
    _findUnitPosition(battlefield, unitId) {
        const playerPos = battlefield.player.find(p => p.unitId === unitId);
        if (playerPos) return playerPos;
        
        const enemyPos = battlefield.enemy.find(p => p.unitId === unitId);
        return enemyPos || null;
    },

    /**
     * 根据技能目标类型获取有效目标列表
     * @param {Object} battlefield - 战场状态
     * @param {Object} attacker - 攻击者单位
     * @param {Object} skill - 技能配置
     * @returns {Array} 有效目标列表
     */
    getValidTargets(battlefield, attacker, skill) {
        const attackerSide = this._findUnitSide(battlefield, attacker.id);
        const attackerPos = this._findUnitPosition(battlefield, attacker.id);
        
        if (!attackerSide || !attackerPos) return [];

        const targetType = skill.targetType || 'enemy';
        const skillRange = skill.range || 'ranged';
        
        let candidates = [];
        
        switch (targetType) {
            case 'self':
                return [attacker];
                
            case 'ally':
                candidates = this.getAllAliveTargets(battlefield, attackerSide);
                break;
                
            case 'enemy':
                const enemySide = attackerSide === 'player' ? 'enemy' : 'player';
                candidates = this.getAllAliveTargets(battlefield, enemySide);
                break;
                
            case 'all_enemies':
                const allEnemySide = attackerSide === 'player' ? 'enemy' : 'player';
                return this.getAllAliveTargets(battlefield, allEnemySide);
                
            case 'all_allies':
                return this.getAllAliveTargets(battlefield, attackerSide);
                
            case 'front_2':
                const front2Side = attackerSide === 'player' ? 'enemy' : 'player';
                return this.getFrontTargets(battlefield, front2Side, 2);
                
            case 'front_3':
                const front3Side = attackerSide === 'player' ? 'enemy' : 'player';
                return this.getFrontTargets(battlefield, front3Side, 3);

            case 'cleave_3':
                // cleave_3 需要先选目标，getValidTargets 返回所有可选敌方（用于目标选择阶段）
                const cleaveSide = attackerSide === 'player' ? 'enemy' : 'player';
                return this.getAllAliveTargets(battlefield, cleaveSide);
                
            default:
                candidates = [];
        }

        // 如果是近战单体技能（skillType=melee + targetType=enemy），限制为前2个存活敌人
        const skillType = skill.skillType || '';
        if (skillType === 'melee' && targetType === 'enemy') {
            const enemySide = attackerSide === 'player' ? 'enemy' : 'player';
            const front2 = this.getFrontTargets(battlefield, enemySide, 2);
            const front2Ids = new Set(front2.map(u => u.id));
            candidates = candidates.filter(target => front2Ids.has(target.id));
        }
        // 远程/法术单体技能不做额外过滤（可选任意存活敌人）

        return candidates;
    },

    /**
     * 获取单位的物理位置信息
     * @param {Object} battlefield - 战场状态
     * @param {string} unitId - 单位ID
     * @returns {Object|null} 位置信息
     */
    getUnitPositionInfo(battlefield, unitId) {
        const side = this._findUnitSide(battlefield, unitId);
        const position = this._findUnitPosition(battlefield, unitId);
        
        if (!side || !position) return null;
        
        const logicalPositions = this.calculateLogicalPositions(battlefield, side);
        const logicalInfo = logicalPositions.find(p => p.unitId === unitId);
        
        return {
            side,
            physicalSlot: position.slot,
            logicalSlot: logicalInfo ? logicalInfo.logicalSlot : null,
            x: position.x,
            isAlive: position.isAlive,
            role: position.role
        };
    }
};

// 导出到全局
