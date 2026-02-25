/**
 * BOSS 默认行为树
 * 支持多阶段、蓄力技能、狂暴机制
 * 
 * 注意：BOSS 的阶段管理和蓄力检测仍由 BossPhaseSystem 处理，
 * 此行为树负责在当前阶段内选择技能。
 */

const bossDefault = {
    type: 'selector',
    children: [
        // 1. 评分选择最优技能
        {
            type: 'scored',
            children: [
                { type: 'action', key: 'useAoeSkill', scorer: 'aoeValue' },
                { type: 'action', key: 'useAttackSkill', scorer: 'damageValue' }
            ]
        },
        // 2. 兜底
        { type: 'action', key: 'useBasicAttack' }
    ]
};

export { bossDefault };
