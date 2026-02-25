/**
 * AI Scorers - 评分函数集
 * 
 * 所有评分函数签名: (unit, context, params?) => number (0~1)
 */

import { AIRegistry } from './AIRegistry.js';

const scorers = {

    /**
     * 伤害价值：基于可用攻击技能的预期伤害
     */
    damageValue(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && s.damage && !s.comboPoints?.requires
        );
        if (skills.length === 0) return 0;

        // 有高伤害技能可用时分数更高
        const bestDmg = Math.max(...skills.map(s => s.damage?.base || 0));
        return Math.min(1, bestDmg / 100) * 0.6 + 0.3;
    },

    /**
     * 治疗价值：基于队友受伤程度
     */
    healValue(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s => s.isUsable && s.heal);
        if (skills.length === 0) return 0;

        const allies = context.battlefield.allies.filter(a => a.isAlive);
        if (allies.length === 0) return 0;

        // 计算队伍整体缺血程度
        const avgMissingHp = 1 - context.tactical.teamSummary.avgHpPercent;
        const criticalCount = context.tactical.teamSummary.criticalHpCount;

        // 有人快死了 → 高分
        if (criticalCount > 0) return 0.95;

        // 多人受伤 → 中高分
        if (context.tactical.teamSummary.lowHpCount >= 2) return 0.7;

        // 一般受伤
        return Math.min(0.6, avgMissingHp * 1.2);
    },

    /**
     * 嘲讽价值：基于仇恨管理需求
     */
    tauntValue(unit, context, params = {}) {
        const tauntSkills = context.self.availableSkills.filter(s =>
            s.isUsable && (s.id === 'taunt' || s.id === 'growl')
        );
        if (tauntSkills.length === 0) return 0;

        const info = context.tactical.threatInfo;
        if (!info) return 0.3;

        // 有敌人没被自己嘲讽 → 高分
        const tauntedCount = (info.tauntedOnSelf || []).length;
        const aliveEnemies = context.battlefield.enemies.filter(e => e.isAlive).length;
        const untauntedRatio = aliveEnemies > 0 ? 1 - (tauntedCount / aliveEnemies) : 0;

        // 不是所有敌人仇恨最高的 → 更需要嘲讽
        const notTopRatio = aliveEnemies > 0 ? 1 - (info.isTopThreatCount / aliveEnemies) : 0;

        return Math.min(1, untauntedRatio * 0.5 + notTopRatio * 0.5);
    },

    /**
     * AOE 价值：基于敌人聚集程度
     */
    aoeValue(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && s.damage &&
            ['all_enemies', 'front_2', 'front_3', 'random_3'].includes(s.targetType)
        );
        if (skills.length === 0) return 0;

        return context.tactical.aoeValue || 0;
    },

    /**
     * 生存价值：自身血量越低越需要自保
     */
    survivalValue(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && (
                s.effects?.some(e => e.type === 'shield' || (e.type === 'buff' && e.stat === 'damageReduction')) ||
                (s.heal && s.targetType === 'self')
            )
        );
        if (skills.length === 0) return 0;

        // 血量越低，生存价值越高
        const hpPercent = context.self.hpPercent;
        if (hpPercent < 0.2) return 0.95;
        if (hpPercent < 0.4) return 0.7;
        if (hpPercent < 0.6) return 0.3;
        return 0.1;
    },

    /**
     * 连击点积攒价值
     */
    builderValue(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && s.comboPoints?.generates
        );
        if (skills.length === 0) return 0;

        const cp = context.self.comboPoints;
        if (!cp) return 0;

        // 连击点越少，积攒价值越高
        const ratio = cp.current / (cp.max || 5);
        return 0.5 * (1 - ratio) + 0.3;
    },

    /**
     * 终结技价值：连击点越多越值得释放
     */
    finisherValue(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && s.comboPoints?.requires
        );
        if (skills.length === 0) return 0;

        const cp = context.self.comboPoints;
        if (!cp || cp.current <= 0) return 0;

        // 连击点越多，终结技价值越高
        const ratio = cp.current / (cp.max || 5);
        return ratio * 0.9 + 0.1;
    },

    /**
     * 威胁输出价值（坦克用）
     */
    threatValue(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && s.damage && !s.comboPoints?.requires
        );
        if (skills.length === 0) return 0;

        const info = context.tactical.threatInfo;
        if (!info) return 0.4;

        // 仇恨不稳定时输出更重要
        const aliveEnemies = context.battlefield.enemies.filter(e => e.isAlive).length;
        const topRatio = aliveEnemies > 0 ? info.isTopThreatCount / aliveEnemies : 1;

        // 仇恨越稳（topRatio高），纯输出价值稍低
        return 0.3 + 0.4 * (1 - topRatio);
    }
};

// 注册所有评分
AIRegistry.registerAll('scorer', scorers);

export { scorers };
