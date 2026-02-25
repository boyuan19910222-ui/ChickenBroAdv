/**
 * 行动点系统 - 管理战斗中的行动点消耗
 * 
 * 特性:
 * - 每回合3点行动点
 * - 不同技能消耗不同点数
 * - 行动点不累积到下回合
 */
import { GameData } from '../data/GameData.js'

export const ActionPointSystem = {
    // 行动点配置
    CONFIG: {
        maxPoints: 3,           // 每回合最大行动点
        carryOver: false,       // 是否累积到下回合
    },

    // 技能消耗类型
    ACTION_COST_TYPE: {
        POWERFUL: 3,    // 强力技能（大招）
        NORMAL: 2,      // 普通技能
        QUICK: 1,       // 快速动作
        FREE: 0,        // 免费动作（如防御）
    },

    // 技能行动点消耗配置
    SKILL_COSTS: {
        // ========== 战士技能 ==========
        heroicStrike: 1,      // 英勇打击 - 快速
        shieldBlock: 1,       // 盾牌格挡 - 快速
        charge: 2,            // 冲锋 - 普通
        shieldWall: 3,        // 盾墙 - 强力
        mortalStrike: 2,      // 致死打击 - 普通
        execute: 2,           // 斩杀 - 普通
        taunt: 1,             // 嘲讽 - 快速
        thunderClap: 2,       // 雷霆一击 - 普通
        
        // ========== 圣骑士技能 ==========
        holyLight: 2,         // 圣光术 - 普通
        divineShield: 3,      // 神圣之盾 - 强力
        hammerOfJustice: 2,   // 制裁之锤 - 普通
        consecration: 2,      // 奉献 - 普通
        layOnHands: 3,        // 圣疗术 - 强力
        blessingOfProtection: 2, // 保护祝福 - 普通
        
        // ========== 猎人技能 ==========
        arcaneShot: 1,        // 奥术射击 - 快速filler
        serpentSting: 1,      // 毒蛇钉刺 - DOT
        huntersMark: 1,       // 猎人印记 - debuff
        summonPet: 2,         // 召唤野兽 - 召唤宠物
        killCommand: 1,       // 杀戮命令 - 宠物爆发
        intimidation: 1,      // 恐吓 - 宠物眩晕
        aimedShot: 2,         // 瞄准射击 - 高伤
        multiShot: 2,         // 多重射击 - AOE
        trueshotAura: 2,      // 强击光环 - 全队增益
        explosiveTrap: 1,     // 爆炸陷阱 - AOE
        wyvernSting: 1,       // 翼龙钉刺 - 控场
        mongooseBite: 2,      // 猫鼬撕咬 - 近战反击
        
        // ========== 盗贼技能 ==========
        shadowStrike: 1,      // 影袭 - 快速
        backstab: 2,          // 背刺 - 普通
        evade: 1,             // 闪避 - 快速
        eviscerate: 2,        // 剔骨 - 普通
        poisonBlade: 1,       // 毒刃 - 快速
        kidneyShot: 2,        // 肾击 - 普通
        vanish: 2,            // 消失 - 普通
        
        // ========== 牧师技能 ==========
        heal: 2,              // 治疗术 - 普通
        smite: 1,             // 惩击 - 快速
        shield: 2,            // 真言术：盾 - 普通
        greaterHeal: 3,       // 强效治疗 - 强力
        prayerOfHealing: 3,   // 治疗祷言 - 强力
        renew: 1,             // 恢复 - 快速
        dispelMagic: 1,       // 驱散魔法 - 快速
        
        // ========== 萨满祭司技能 ==========
        lightningBolt: 2,     // 闪电箭 - 普通
        healingWave: 2,       // 治疗波 - 普通
        searingTotem: 1,      // 灼热图腾 - 快速
        flameShock: 1,        // 烈焰震击 - 快速
        chainLightning: 3,    // 闪电链 - 强力
        chainHeal: 3,         // 治疗链 - 强力
        earthShock: 1,        // 大地震击 - 快速
        
        // ========== 法师技能 ==========
        fireball: 2,          // 火球术 - 普通
        frostNova: 2,         // 冰霜新星 - 普通
        arcaneIntellect: 1,   // 奥术智慧 - 快速
        pyroblast: 3,         // 炎爆术 - 强力
        blizzard: 3,          // 暴风雪 - 强力
        flamestrike: 1,        // 烈焰风暴 - 快速
        frostbolt: 2,         // 寒冰箭 - 普通
        
        // ========== 术士技能 ==========
        shadowBolt: 2,        // 暗影箭 - 普通
        immolate: 1,          // 献祭 - 快速
        fear: 2,              // 恐惧 - 普通
        summonDemon: 2,       // 召唤恶魔 - 普通
        corruption: 1,        // 腐蚀术 - 快速
        drainLife: 2,         // 吸取生命 - 普通
        curseOfAgony: 1,      // 痛苦诅咒 - 快速
        
        // ========== 德鲁伊技能 ==========
        wrath: 1,             // 愤怒 - 快速
        moonfire: 1,          // 月火术 - 快速
        rejuvenation: 1,      // 回春术 - 快速
        bearForm: 2,          // 熊形态 - 普通
        healingTouch: 2,      // 愈合 - 普通
        regrowth: 2,          // 治愈之触 - 普通
        starfire: 2,          // 星火术 - 普通
        
        // ========== 通用动作 ==========
        basicAttack: 1,       // 普通攻击 - 快速
        usePotion: 1,         // 使用药水 - 快速
        defend: 0,            // 防御姿态 - 免费（结束回合）
        flee: 0,              // 逃跑 - 免费（结束回合）
    },

    /**
     * 创建单位的行动点状态
     * @param {string} unitId - 单位ID
     * @returns {Object} 行动点状态
     */
    createActionPointState(unitId) {
        return {
            unitId: unitId,
            currentPoints: this.CONFIG.maxPoints,
            maxPoints: this.CONFIG.maxPoints,
            actionsThisTurn: [],
        };
    },

    /**
     * 获取技能的行动点消耗
     * 优先从 skill.actionPoints 读取，保留 SKILL_COSTS 映射表作为 fallback
     * @param {string} skillId - 技能ID
     * @returns {number} 消耗点数
     */
    getSkillCost(skillId) {
        // 优先从 GameData.skills[skillId].actionPoints 读取
        const skillData = GameData?.skills?.[skillId];
        if (skillData && skillData.actionPoints !== undefined && skillData.actionPoints !== null) {
            return skillData.actionPoints;
        }

        // Fallback: 使用静态映射表
        if (this.SKILL_COSTS.hasOwnProperty(skillId)) {
            return this.SKILL_COSTS[skillId];
        }
        
        // 默认消耗2点（普通技能）
        return this.ACTION_COST_TYPE.NORMAL;
    },

    /**
     * 检查是否有足够的行动点使用技能
     * @param {Object} apState - 行动点状态
     * @param {string} skillId - 技能ID
     * @returns {Object} { canUse: boolean, reason: string }
     */
    canUseSkill(apState, skillId) {
        const cost = this.getSkillCost(skillId);
        
        if (apState.currentPoints >= cost) {
            return { canUse: true, reason: '' };
        }
        
        return {
            canUse: false,
            reason: `行动点不足（需要${cost}点，当前${apState.currentPoints}点）`
        };
    },

    /**
     * 消耗行动点
     * @param {Object} apState - 行动点状态
     * @param {string} skillId - 技能ID
     * @returns {Object} 更新后的状态
     */
    consumePoints(apState, skillId) {
        const cost = this.getSkillCost(skillId);
        
        apState.currentPoints = Math.max(0, apState.currentPoints - cost);
        apState.actionsThisTurn.push({
            skillId: skillId,
            cost: cost,
            timestamp: Date.now()
        });
        
        return apState;
    },

    /**
     * 重置行动点（回合开始时调用）
     * @param {Object} apState - 行动点状态
     * @returns {Object} 更新后的状态
     */
    resetPoints(apState) {
        apState.currentPoints = apState.maxPoints;
        apState.actionsThisTurn = [];
        return apState;
    },

    /**
     * 检查回合是否应该结束
     * @param {Object} apState - 行动点状态
     * @returns {boolean} 是否应该结束
     */
    shouldEndTurn(apState) {
        // 行动点耗尽
        if (apState.currentPoints <= 0) {
            return true;
        }
        
        // 检查最后一个动作是否是结束回合的动作（如防御）
        const lastAction = apState.actionsThisTurn[apState.actionsThisTurn.length - 1];
        if (lastAction && (lastAction.skillId === 'defend' || lastAction.skillId === 'flee')) {
            return true;
        }
        
        return false;
    },

    /**
     * 获取剩余可用的技能列表
     * @param {Object} apState - 行动点状态
     * @param {Array} availableSkills - 可用技能ID列表
     * @returns {Array} 可使用的技能列表（带消耗信息）
     */
    getUsableSkills(apState, availableSkills) {
        return availableSkills.map(skillId => ({
            skillId: skillId,
            cost: this.getSkillCost(skillId),
            canUse: apState.currentPoints >= this.getSkillCost(skillId)
        })).filter(skill => skill.canUse);
    },

    /**
     * 获取行动点显示信息
     * @param {Object} apState - 行动点状态
     * @returns {Object} 显示信息
     */
    getDisplayInfo(apState) {
        const points = [];
        for (let i = 0; i < apState.maxPoints; i++) {
            points.push({
                filled: i < apState.currentPoints,
                index: i
            });
        }
        
        return {
            current: apState.currentPoints,
            max: apState.maxPoints,
            points: points,
            displayText: `⚡ ${apState.currentPoints}/${apState.maxPoints}`,
            actionsUsed: apState.actionsThisTurn.length
        };
    },

    /**
     * 为技能配置行动点消耗（运行时添加）
     * @param {string} skillId - 技能ID
     * @param {number} cost - 消耗点数
     */
    setSkillCost(skillId, cost) {
        this.SKILL_COSTS[skillId] = cost;
    },

    /**
     * 批量设置技能消耗
     * @param {Object} costs - { skillId: cost } 映射
     */
    setSkillCosts(costs) {
        Object.assign(this.SKILL_COSTS, costs);
    },

    /**
     * 获取消耗类型的描述
     * @param {number} cost - 消耗点数
     * @returns {string} 描述文本
     */
    getCostDescription(cost) {
        switch (cost) {
            case 0: return '免费';
            case 1: return '快速';
            case 2: return '普通';
            case 3: return '强力';
            default: return `${cost}点`;
        }
    },

    /**
     * 获取消耗类型的颜色
     * @param {number} cost - 消耗点数
     * @returns {string} 颜色代码
     */
    getCostColor(cost) {
        switch (cost) {
            case 0: return '#888888';  // 灰色
            case 1: return '#00FF00';  // 绿色
            case 2: return '#FFFF00';  // 黄色
            case 3: return '#FF6600';  // 橙色
            default: return '#FF0000'; // 红色
        }
    }
};

// 导出到全局
