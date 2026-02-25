/**
 * 副本敌方行为树
 * 优先级: 特殊技能(冷却就绪) → 基础攻击, 目标基于仇恨
 */

const dungeonEnemy = {
    type: 'selector',
    children: [
        // 1. 评分选择：特殊技能 vs 基础攻击
        {
            type: 'scored',
            children: [
                { type: 'action', key: 'useAttackSkill', scorer: 'damageValue' },
                { type: 'action', key: 'useAoeSkill', scorer: 'aoeValue' }
            ]
        },
        // 2. 兜底：基础攻击
        { type: 'action', key: 'useBasicAttack' }
    ]
};

export { dungeonEnemy };
