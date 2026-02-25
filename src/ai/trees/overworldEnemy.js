/**
 * 野外敌方行为树
 * 优先级: 技能优先级选择 → 基础攻击
 */

const overworldEnemy = {
    type: 'selector',
    children: [
        // 1. 评分选择
        {
            type: 'scored',
            children: [
                { type: 'action', key: 'useAttackSkill', scorer: 'damageValue' },
                { type: 'action', key: 'useAoeSkill', scorer: 'aoeValue' }
            ]
        },
        // 2. 兜底
        { type: 'action', key: 'useBasicAttack' }
    ]
};

export { overworldEnemy };
