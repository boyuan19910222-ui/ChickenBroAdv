/**
 * 宠物默认行为树
 * 简单：攻击 → 基础攻击
 */

const petDefault = {
    type: 'selector',
    children: [
        { type: 'action', key: 'useAttackSkill', scorer: 'damageValue' },
        { type: 'action', key: 'useBasicAttack' }
    ]
};

export { petDefault };
