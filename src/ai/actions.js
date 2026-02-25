/**
 * AI Actions - 动作函数集
 * 
 * 所有动作函数签名: (unit, context, params?) => { skillId, targetIds } | null
 */

import { AIRegistry } from './AIRegistry.js';

const actions = {

    // ===== 攻击 =====

    /**
     * 使用最佳攻击技能（优先核心/强力，退回填充）
     */
    useAttackSkill(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s => 
            s.isUsable && s.damage && !s.comboPoints?.requires
        );
        if (skills.length === 0) return null;

        // 优先级: powerful > core > filler
        const priorityOrder = ['powerful', 'ultimate', 'core', 'filler'];
        let best = null;
        for (const cat of priorityOrder) {
            best = skills.find(s => s.category === cat);
            if (best) break;
        }
        if (!best) best = skills[0];

        const targetId = _pickBestDamageTarget(context, best);
        if (!targetId) return null;

        return { skillId: best.id, targetIds: [targetId] };
    },

    /**
     * 使用 AOE 攻击技能
     */
    useAoeSkill(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && s.damage &&
            ['all_enemies', 'front_2', 'front_3', 'random_3'].includes(s.targetType)
        );
        if (skills.length === 0) return null;

        const best = skills[0];
        return { skillId: best.id, targetIds: best.validTargets };
    },

    // ===== 治疗 =====

    /**
     * 使用治疗技能（对最低血量队友）
     */
    useHealSkill(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s => s.isUsable && s.heal);
        if (skills.length === 0) return null;

        // 找血量最低的存活队友
        const allies = context.battlefield.allies.filter(a => a.isAlive && a.hpPercent < 1);
        if (allies.length === 0) return null;

        allies.sort((a, b) => a.hpPercent - b.hpPercent);
        const target = allies[0];

        // 优先群体治疗（多人受伤时）
        const lowCount = allies.filter(a => a.hpPercent < 0.7).length;
        const aoeHeal = skills.find(s => ['all_allies'].includes(s.targetType));
        if (aoeHeal && lowCount >= 3) {
            return { skillId: aoeHeal.id, targetIds: aoeHeal.validTargets };
        }

        // 单体治疗
        const singleHeal = skills.find(s => s.targetType === 'ally' || s.targetType === 'self');
        const healSkill = singleHeal || skills[0];
        return { skillId: healSkill.id, targetIds: [target.id] };
    },

    /**
     * 紧急治疗（对血量极低的队友，使用最强治疗）
     */
    useEmergencyHeal(unit, context, params = {}) {
        const threshold = params.threshold || 0.3;
        const skills = context.self.availableSkills.filter(s => s.isUsable && s.heal);
        if (skills.length === 0) return null;

        const critical = context.battlefield.allies
            .filter(a => a.isAlive && a.hpPercent < threshold)
            .sort((a, b) => a.hpPercent - b.hpPercent);

        if (critical.length === 0) return null;

        // 选最强单体治疗
        const best = skills.reduce((a, b) => {
            const aHeal = a.heal?.base || 0;
            const bHeal = b.heal?.base || 0;
            return bHeal > aHeal ? b : a;
        });

        return { skillId: best.id, targetIds: [critical[0].id] };
    },

    // ===== 坦克 =====

    /**
     * 使用嘲讽技能
     */
    useTauntSkill(unit, context, params = {}) {
        const tauntSkills = context.self.availableSkills.filter(s =>
            s.isUsable && (s.id === 'taunt' || s.id === 'growl' || s.effects?.some(e => e.type === 'taunt'))
        );
        if (tauntSkills.length === 0) return null;

        // 找没有被自己嘲讽的敌人
        const tauntedOnSelf = new Set(context.tactical.threatInfo?.tauntedOnSelf || []);
        const untaunted = context.battlefield.enemies.filter(e => 
            e.isAlive && !tauntedOnSelf.has(e.id)
        );

        if (untaunted.length === 0) return null;

        // 优先嘲讽在打治疗/DPS的敌人
        const target = untaunted[0];
        return { skillId: tauntSkills[0].id, targetIds: [target.id] };
    },

    /**
     * 使用高威胁技能（坦克维持仇恨用）
     */
    useThreatSkill(unit, context, params = {}) {
        // 优先使用有额外威胁的技能，退回普通攻击技能
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && s.damage && !s.comboPoints?.requires
        );
        if (skills.length === 0) return null;

        // 优先选高伤害（高伤害 = 高仇恨）
        skills.sort((a, b) => {
            const aDmg = a.damage?.base || 0;
            const bDmg = b.damage?.base || 0;
            return bDmg - aDmg;
        });

        const targetId = _pickBestDamageTarget(context, skills[0]);
        if (!targetId) return null;

        return { skillId: skills[0].id, targetIds: [targetId] };
    },

    // ===== 生存 =====

    /**
     * 使用生存/防御技能
     */
    useSurvivalSkill(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && (
                s.effects?.some(e => e.type === 'shield' || (e.type === 'buff' && e.stat === 'damageReduction')) ||
                (s.heal && s.targetType === 'self')
            )
        );
        if (skills.length === 0) return null;

        return { skillId: skills[0].id, targetIds: [unit.id] };
    },

    // ===== 连击点 =====

    /**
     * 使用 Builder 技能（产生连击点）
     */
    useBuilderSkill(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && s.comboPoints?.generates
        );
        if (skills.length === 0) return null;

        // 选伤害最高的 builder
        skills.sort((a, b) => {
            const aDmg = a.damage?.base || 0;
            const bDmg = b.damage?.base || 0;
            return bDmg - aDmg;
        });

        const targetId = _pickBestDamageTarget(context, skills[0]);
        if (!targetId) return null;

        return { skillId: skills[0].id, targetIds: [targetId] };
    },

    /**
     * 使用 Finisher 技能（消耗连击点）
     */
    useFinisherSkill(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && s.comboPoints?.requires
        );
        if (skills.length === 0) return null;

        const targetId = _pickBestDamageTarget(context, skills[0]);
        if (!targetId) return null;

        return { skillId: skills[0].id, targetIds: [targetId] };
    },

    // ===== 通用 =====

    /**
     * 使用填充技能（filler，无冷却/低消耗）
     */
    useFillerSkill(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s =>
            s.isUsable && s.damage && s.category === 'filler'
        );
        if (skills.length === 0) {
            // 退回任何可用的攻击技能
            const any = context.self.availableSkills.find(s => s.isUsable && s.damage);
            if (!any) return null;
            const targetId = _pickBestDamageTarget(context, any);
            if (!targetId) return null;
            return { skillId: any.id, targetIds: [targetId] };
        }

        const targetId = _pickBestDamageTarget(context, skills[0]);
        if (!targetId) return null;
        return { skillId: skills[0].id, targetIds: [targetId] };
    },

    /**
     * 默认攻击（兜底）
     */
    useBasicAttack(unit, context, params = {}) {
        const skills = context.self.availableSkills.filter(s => s.isUsable && s.damage);
        if (skills.length === 0) return null;

        // 选消耗最低的
        skills.sort((a, b) => {
            const aCost = a.resourceCost?.value || 0;
            const bCost = b.resourceCost?.value || 0;
            return aCost - bCost;
        });

        const targetId = _pickBestDamageTarget(context, skills[0]);
        if (!targetId) return null;
        return { skillId: skills[0].id, targetIds: [targetId] };
    }
};

// ===== 辅助函数 =====

/**
 * 选择最佳伤害目标
 * - 敌方单位：优先按仇恨表选目标（嘲讽 > 最高仇恨 > 血量最低）
 * - 友方单位：攻击血量最低的敌人
 */
function _pickBestDamageTarget(context, skill) {
    if (!skill || !skill.validTargets || skill.validTargets.length === 0) return null;

    // AOE 技能返回第一个目标 ID（实际执行时会展开）
    if (['all_enemies', 'front_2', 'front_3', 'random_3'].includes(skill.targetType)) {
        return skill.validTargets[0];
    }

    const enemies = context.battlefield.enemies.filter(e => 
        e.isAlive && skill.validTargets.includes(e.id)
    );
    if (enemies.length === 0) return skill.validTargets[0];

    // 仇恨系统：如果有 topThreatTarget 且在合法目标中，优先选它
    const topThreat = context.tactical?.threatInfo?.topThreatTarget;
    if (topThreat && skill.validTargets.includes(topThreat)) {
        const target = enemies.find(e => e.id === topThreat);
        if (target) return target.id;
    }

    // 降级：按血量最低选目标
    enemies.sort((a, b) => a.hp - b.hp);
    return enemies[0].id;
}

// 注册所有动作
AIRegistry.registerAll('action', actions);

export { actions };
