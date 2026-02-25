/**
 * 副本友方坦克行为树
 * 优先级: 保命 → 嘲讽 → 高威胁输出
 */

const dungeonAllyTank = {
    type: 'selector',
    children: [
        // 1. 保命：HP < 30% 用生存技能
        {
            type: 'sequence',
            children: [
                { type: 'condition', key: 'selfHpBelow', params: { threshold: 0.3 } },
                { type: 'condition', key: 'hasUsableSurvivalSkill' },
                { type: 'action', key: 'useSurvivalSkill' }
            ]
        },
        // 2. 嘲讽：有敌人没被自己嘲讽
        {
            type: 'sequence',
            children: [
                { type: 'condition', key: 'enemyNotTaunted' },
                { type: 'condition', key: 'hasUsableTauntSkill' },
                { type: 'action', key: 'useTauntSkill' }
            ]
        },
        // 3. 输出：评分选择最优攻击
        {
            type: 'scored',
            children: [
                { type: 'action', key: 'useThreatSkill', scorer: 'threatValue' },
                { type: 'action', key: 'useAoeSkill', scorer: 'aoeValue' },
                { type: 'action', key: 'useAttackSkill', scorer: 'damageValue' }
            ]
        },
        // 4. 兜底：基础攻击
        { type: 'action', key: 'useBasicAttack' }
    ]
};

export { dungeonAllyTank };
