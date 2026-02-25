/**
 * 副本友方治疗行为树
 * 优先级: 紧急治疗 → 群体治疗 → 维护治疗 → 输出
 */

const dungeonAllyHealer = {
    type: 'selector',
    children: [
        // 1. 保命：自己 HP < 30%
        {
            type: 'sequence',
            children: [
                { type: 'condition', key: 'selfHpBelow', params: { threshold: 0.3 } },
                { type: 'condition', key: 'hasUsableSurvivalSkill' },
                { type: 'action', key: 'useSurvivalSkill' }
            ]
        },
        // 2. 紧急治疗：有队友 HP < 30%
        {
            type: 'sequence',
            children: [
                { type: 'condition', key: 'anyAllyHpBelow', params: { threshold: 0.3 } },
                { type: 'condition', key: 'hasUsableHealSkill' },
                { type: 'action', key: 'useEmergencyHeal', params: { threshold: 0.3 } }
            ]
        },
        // 3. 群体治疗：3+ 人 HP < 70%
        {
            type: 'sequence',
            children: [
                { type: 'condition', key: 'multipleAlliesLowHp', params: { threshold: 0.7, minCount: 3 } },
                { type: 'condition', key: 'hasUsableHealSkill' },
                { type: 'action', key: 'useHealSkill' }
            ]
        },
        // 4. 维护治疗：有人受伤
        {
            type: 'sequence',
            children: [
                { type: 'condition', key: 'anyAllyHpBelow', params: { threshold: 0.85 } },
                { type: 'condition', key: 'hasUsableHealSkill' },
                { type: 'action', key: 'useHealSkill' }
            ]
        },
        // 5. 输出：没人需要治疗时打伤害
        {
            type: 'scored',
            children: [
                { type: 'action', key: 'useAttackSkill', scorer: 'damageValue' },
                { type: 'action', key: 'useAoeSkill', scorer: 'aoeValue' }
            ]
        },
        // 6. 兜底
        { type: 'action', key: 'useBasicAttack' }
    ]
};

export { dungeonAllyHealer };
