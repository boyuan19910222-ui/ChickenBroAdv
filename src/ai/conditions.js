/**
 * AI Conditions - 条件函数集
 * 
 * 所有条件函数签名: (unit, context, params?) => boolean
 */

import { AIRegistry } from './AIRegistry.js';

const conditions = {

    // ===== 自身状态 =====

    selfHpBelow(unit, context, params = {}) {
        const threshold = params.threshold || 0.3;
        return context.self.hpPercent < threshold;
    },

    selfHpAbove(unit, context, params = {}) {
        const threshold = params.threshold || 0.5;
        return context.self.hpPercent > threshold;
    },

    selfResourceAbove(unit, context, params = {}) {
        const threshold = params.threshold || 0;
        if (!context.self.resource) return true;
        return context.self.resource.current > threshold;
    },

    selfResourceBelow(unit, context, params = {}) {
        const threshold = params.threshold || 30;
        if (!context.self.resource) return false;
        return context.self.resource.current < threshold;
    },

    isCCed(unit, context) {
        return context.self.isCCed;
    },

    notCCed(unit, context) {
        return !context.self.isCCed;
    },

    // ===== 连击点 =====

    comboPointsAbove(unit, context, params = {}) {
        const threshold = params.threshold || 3;
        const cp = context.self.comboPoints;
        return cp && cp.current >= threshold;
    },

    comboPointsMax(unit, context) {
        const cp = context.self.comboPoints;
        return cp && cp.current >= (cp.max || 5);
    },

    hasComboPoints(unit, context) {
        const cp = context.self.comboPoints;
        return cp && cp.current > 0;
    },

    // ===== 技能可用性 =====

    hasUsableSkill(unit, context, params = {}) {
        const { category, skillType } = params;
        return context.self.availableSkills.some(s => {
            if (!s.isUsable) return false;
            if (category && s.category !== category) return false;
            if (skillType && s.skillType !== skillType) return false;
            return true;
        });
    },

    hasUsableHealSkill(unit, context) {
        return context.self.availableSkills.some(s => s.isUsable && s.heal);
    },

    hasUsableSurvivalSkill(unit, context) {
        return context.self.availableSkills.some(s => 
            s.isUsable && (s.category === 'utility' || s.category === 'powerful') &&
            (s.effects?.some(e => e.type === 'shield' || e.type === 'buff') || s.heal)
        );
    },

    hasUsableTauntSkill(unit, context) {
        return context.self.availableSkills.some(s => 
            s.isUsable && (s.id === 'taunt' || s.id === 'growl' || s.effects?.some(e => e.type === 'taunt'))
        );
    },

    hasUsableFinisher(unit, context) {
        return context.self.availableSkills.some(s => s.isUsable && s.comboPoints?.requires);
    },

    hasUsableBuilder(unit, context) {
        return context.self.availableSkills.some(s => s.isUsable && s.comboPoints?.generates);
    },

    hasUsableAoeSkill(unit, context) {
        return context.self.availableSkills.some(s => 
            s.isUsable && ['all_enemies', 'front_2', 'front_3', 'random_3'].includes(s.targetType)
        );
    },

    // ===== 队友状态 =====

    anyAllyHpBelow(unit, context, params = {}) {
        const threshold = params.threshold || 0.3;
        return context.battlefield.allies.some(a => a.isAlive && a.hpPercent < threshold);
    },

    multipleAlliesLowHp(unit, context, params = {}) {
        const threshold = params.threshold || 0.7;
        const minCount = params.minCount || 3;
        const lowCount = context.battlefield.allies.filter(a => a.isAlive && a.hpPercent < threshold).length;
        return lowCount >= minCount;
    },

    // ===== 敌方状态 =====

    anyEnemyAlive(unit, context) {
        return context.battlefield.enemies.some(e => e.isAlive);
    },

    multipleEnemiesAlive(unit, context, params = {}) {
        const minCount = params.minCount || 2;
        return context.battlefield.enemies.filter(e => e.isAlive).length >= minCount;
    },

    // ===== 仇恨 =====

    enemyNotTaunted(unit, context) {
        if (!context.tactical.threatInfo) return false;
        const tauntedSet = new Set(context.tactical.threatInfo.tauntedOnSelf || []);
        return context.battlefield.enemies.some(e => e.isAlive && !tauntedSet.has(e.id));
    },

    notTopThreatOnAll(unit, context) {
        const info = context.tactical.threatInfo;
        if (!info) return false;
        const aliveEnemies = context.battlefield.enemies.filter(e => e.isAlive).length;
        return info.isTopThreatCount < aliveEnemies;
    }
};

// 注册所有条件
AIRegistry.registerAll('condition', conditions);

export { conditions };
