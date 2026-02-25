/**
 * 副本友方 DPS 行为树
 * 优先级: 保命 → 连击点循环(盗贼) → 核心输出 → 填充
 */

const dungeonAllyDps = {
    type: 'selector',
    children: [
        // 1. 保命：HP < 30%
        {
            type: 'sequence',
            children: [
                { type: 'condition', key: 'selfHpBelow', params: { threshold: 0.3 } },
                { type: 'condition', key: 'hasUsableSurvivalSkill' },
                { type: 'action', key: 'useSurvivalSkill' }
            ]
        },
        // 2. 终结技：连击点 >= 4 时使用 finisher
        {
            type: 'sequence',
            children: [
                { type: 'condition', key: 'comboPointsAbove', params: { threshold: 4 } },
                { type: 'condition', key: 'hasUsableFinisher' },
                { type: 'action', key: 'useFinisherSkill' }
            ]
        },
        // 3. Builder：有连击点系统但没满时积攒
        {
            type: 'sequence',
            children: [
                { type: 'condition', key: 'hasUsableBuilder' },
                { type: 'action', key: 'useBuilderSkill' }
            ]
        },
        // 4. 评分输出：核心/AOE/普攻
        {
            type: 'scored',
            children: [
                { type: 'action', key: 'useAttackSkill', scorer: 'damageValue' },
                { type: 'action', key: 'useAoeSkill', scorer: 'aoeValue' }
            ]
        },
        // 5. 兜底：填充技能
        { type: 'action', key: 'useFillerSkill' }
    ]
};

export { dungeonAllyDps };
