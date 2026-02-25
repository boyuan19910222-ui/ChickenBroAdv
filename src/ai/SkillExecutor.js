/**
 * SkillExecutor - 统一技能执行器
 * 
 * 所有单位（玩家、AI队友、敌方怪物）共用的技能执行路径：
 * 资源消耗 → 冷却设置 → 伤害/治疗计算 → 效果施加 → 连击点 → 资源生成
 */

import { EffectSystem } from '../systems/EffectSystem.js';
import { PositioningSystem } from '../systems/PositioningSystem.js';
import { ThreatSystem } from '../systems/ThreatSystem.js';
import { random } from '../core/RandomProvider.js';
import { ContextBuilder } from './ContextBuilder.js';

const SkillExecutor = {

    /**
     * 执行技能
     * @param {Object} unit - 施法者
     * @param {Object} rawSkill - 技能数据（可能是原始格式）
     * @param {Array<Object>} targets - 目标单位数组
     * @param {Object} battleContext - 战斗上下文 { battlefield, threatState, onDamage, onHeal, onLog, combatType }
     * @returns {{ success: boolean, results: Array, skillName: string }}
     */
    executeSkill(unit, rawSkill, targets, battleContext = {}) {
        const skill = ContextBuilder.normalizeSkill(rawSkill);
        if (!skill) {
            return { success: false, results: [], skillName: '未知' };
        }

        const { onDamage, onHeal, onLog } = battleContext;

        // 1. 检查资源消耗
        if (!this._consumeResource(unit, skill)) {
            return { success: false, results: [], skillName: skill.name, reason: 'insufficient_resource' };
        }

        // 2. 设置冷却
        this._setCooldown(unit, skill);

        // 3. 处理连击点（builder 产生 / finisher 消耗）
        const comboInfo = this._processComboPoints(unit, skill);

        // 4. 计算伤害
        const results = [];
        let totalDamage = 0;
        let totalHeal = 0;

        if (skill.damage || (comboInfo.isFinisher && comboInfo.damageTable)) {
            const damageResult = this._processDamage(unit, skill, targets, comboInfo, battleContext);
            totalDamage = damageResult.totalDamage;
            results.push(...damageResult.results);
        }

        // 5. 计算治疗
        if (skill.heal) {
            const healResult = this._processHealing(unit, skill, targets, battleContext);
            totalHeal = healResult.totalHeal;
            results.push(...healResult.results);
        }

        // 6. 施加效果
        this._processEffects(unit, skill, targets, battleContext);

        // 7. 处理吸血
        this._processLifesteal(unit, skill, totalDamage);

        // 8. 处理资源生成（如技能本身产生怒气等）
        this._processResourceGeneration(unit, skill);

        // 9. 威胁处理
        this._processThreat(unit, skill, targets, totalDamage, totalHeal, battleContext);

        return {
            success: true,
            results,
            skillName: skill.name,
            totalDamage,
            totalHeal,
            comboInfo
        };
    },

    // ===== 资源消耗 =====

    _consumeResource(unit, skill) {
        const cost = skill.resourceCost;
        if (!cost || !cost.value || cost.value <= 0) return true;

        if (unit.resource) {
            if (unit.resource.current < cost.value) return false;
            unit.resource.current -= cost.value;
            return true;
        }

        // 兼容旧 currentMana 字段
        if (unit.currentMana !== undefined) {
            const manaCost = cost.value;
            if (unit.currentMana < manaCost) return false;
            unit.currentMana -= manaCost;
            return true;
        }

        return true;
    },

    // ===== 冷却管理 =====

    _setCooldown(unit, skill) {
        if (!skill.cooldown || skill.cooldown <= 0) return;
        if (!unit.skillCooldowns) unit.skillCooldowns = {};
        unit.skillCooldowns[skill.id] = skill.cooldown;
    },

    /**
     * 递减所有技能冷却（每回合开始调用）
     */
    tickCooldowns(unit) {
        if (!unit.skillCooldowns) return;
        for (const skillId of Object.keys(unit.skillCooldowns)) {
            if (unit.skillCooldowns[skillId] > 0) {
                unit.skillCooldowns[skillId]--;
            }
        }
    },

    // ===== 连击点 =====

    _processComboPoints(unit, skill) {
        const info = {
            isBuilder: false,
            isFinisher: false,
            comboPointsUsed: 0,
            comboPointsGenerated: 0,
            damageTable: null
        };

        if (!unit.comboPoints) return info;

        const cp = skill.comboPoints;
        if (!cp) return info;

        // Finisher: 消耗连击点
        const requires = cp.requires || skill.requiresComboPoints;
        if (requires) {
            info.isFinisher = true;
            info.comboPointsUsed = unit.comboPoints.current;
            info.damageTable = cp.damageTable || skill.comboPointsDamage;
            unit.comboPoints.current = 0;
            return info;
        }

        // Builder: 产生连击点
        const generates = cp.generates || skill.comboPointsGenerated;
        if (generates) {
            info.isBuilder = true;
            info.comboPointsGenerated = generates;
            unit.comboPoints.current = Math.min(
                unit.comboPoints.max || 5,
                unit.comboPoints.current + generates
            );
        }

        return info;
    },

    // ===== 伤害计算 =====

    _processDamage(unit, skill, targets, comboInfo, battleContext) {
        const results = [];
        let totalDamage = 0;

        for (const target of targets) {
            if (target.currentHp <= 0) continue;

            let damage = 0;

            // Finisher 使用 damageTable
            if (comboInfo.isFinisher && comboInfo.damageTable) {
                const cp = comboInfo.comboPointsUsed;
                const entry = comboInfo.damageTable.find(d => d.points === cp)
                    || comboInfo.damageTable[comboInfo.damageTable.length - 1]
                    || comboInfo.damageTable[0];

                if (entry) {
                    const stat = skill.damage?.stat || 'agility';
                    const statValue = unit.stats?.[stat] || 10;
                    damage = Math.floor((entry.base || 0) + (entry.scaling || 0) * statValue);
                }
            } else {
                // 普通伤害
                damage = EffectSystem.resolveSkillDamage(skill, unit);
            }

            // 斩杀条件
            if (skill.conditions?.targetBelowHp) {
                const hpPercent = target.currentHp / target.maxHp;
                if (hpPercent <= skill.conditions.targetBelowHp) {
                    damage = Math.floor(damage * 2);
                }
            }

            // 暴击
            const critChance = (unit.stats?.agility || 10) / 100;
            let isCrit = false;

            // Vanish buff 保证暴击
            if (EffectSystem.hasBuff(unit, 'vanish')) {
                isCrit = true;
                unit.buffs = (unit.buffs || []).filter(b => b.name !== 'vanish');
            } else {
                isCrit = random() < critChance;
            }

            if (isCrit) {
                damage = Math.floor(damage * 1.5);
            }

            // Shield 吸收
            const { actualDamage, absorbed } = EffectSystem.absorbDamage(target, damage);
            target.currentHp = Math.max(0, target.currentHp - actualDamage);
            totalDamage += actualDamage;

            results.push({
                type: 'damage',
                targetId: target.id,
                targetName: target.name,
                damage: actualDamage,
                rawDamage: damage,
                absorbed,
                isCrit,
                skillId: skill.id,
                skillName: skill.name
            });

            // 回调
            if (battleContext.onDamage) {
                battleContext.onDamage(unit, target, actualDamage, isCrit, skill);
            }
        }

        return { totalDamage, results };
    },

    // ===== 治疗计算 =====

    _processHealing(unit, skill, targets, battleContext) {
        const results = [];
        let totalHeal = 0;

        // 治疗技能目标：self / ally / all_allies
        const healTargets = skill.targetType === 'self' ? [unit] : targets;

        for (const target of healTargets) {
            if (target.currentHp <= 0) continue;

            let healAmount = EffectSystem.resolveSkillHeal(skill, unit);

            const before = target.currentHp;
            target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
            const actual = target.currentHp - before;
            totalHeal += actual;

            results.push({
                type: 'heal',
                targetId: target.id,
                targetName: target.name,
                heal: actual,
                rawHeal: healAmount,
                skillId: skill.id,
                skillName: skill.name
            });

            if (battleContext.onHeal) {
                battleContext.onHeal(unit, target, actual, skill);
            }
        }

        return { totalHeal, results };
    },

    // ===== 效果施加 =====

    _processEffects(unit, skill, targets, battleContext) {
        const effects = EffectSystem.normalizeEffects(skill);
        if (!effects || effects.length === 0) return;

        for (const effect of effects) {
            if (effect.type === 'lifesteal') continue; // 吸血单独处理

            // 决定效果目标
            const isPositive = ['buff', 'hot', 'shield'].includes(effect.type);
            const effectTargets = isPositive
                ? (skill.targetType === 'self' ? [unit] : [unit]) // buff 默认加给自己
                : targets;

            // 特殊处理：如果技能是对敌人的且效果是正面的，效果加给施法者
            // 如果技能是对自己/队友的且效果是负面的，效果加给当前目标
            for (const target of effectTargets) {
                if (target.currentHp <= 0 && effect.type !== 'buff') continue;
                EffectSystem.applySingleEffect(unit, target, effect, {});
            }
        }
    },

    // ===== 吸血 =====

    _processLifesteal(unit, skill, totalDamage) {
        if (totalDamage <= 0) return;

        const effects = EffectSystem.normalizeEffects(skill);
        const lifesteal = effects.find(e => e.type === 'lifesteal');
        if (!lifesteal) return;

        const healAmount = Math.floor(totalDamage * (lifesteal.value || 0));
        if (healAmount > 0) {
            unit.currentHp = Math.min(unit.maxHp, unit.currentHp + healAmount);
        }
    },

    // ===== 资源生成 =====

    _processResourceGeneration(unit, skill) {
        if (!skill.generatesResource) return;
        if (!unit.resource) return;

        const gen = skill.generatesResource;
        const amount = gen.value || 0;
        if (amount > 0) {
            unit.resource.current = Math.min(
                unit.resource.max || 100,
                unit.resource.current + amount
            );
        }
    },

    // ===== 威胁处理 =====

    _processThreat(unit, skill, targets, totalDamage, totalHeal, battleContext) {
        const { threatState } = battleContext;
        if (!threatState) return;

        // 伤害产生仇恨
        if (totalDamage > 0) {
            for (const target of targets) {
                if (target.currentHp !== undefined) {
                    try {
                        // 这里需要判断方向：如果 unit 是玩家方，target 是敌方
                        if (typeof ThreatSystem !== 'undefined' && ThreatSystem.addDamageThreat) {
                            ThreatSystem.addDamageThreat(threatState, target.id, unit.id, totalDamage, skill.id);
                        }
                    } catch (e) { /* 野外战斗无仇恨系统 */ }
                }
            }
        }

        // 治疗产生仇恨
        if (totalHeal > 0) {
            try {
                if (typeof ThreatSystem !== 'undefined' && ThreatSystem.addHealingThreat) {
                    ThreatSystem.addHealingThreat(threatState, unit.id, totalHeal);
                }
            } catch (e) { /* 野外战斗无仇恨系统 */ }
        }
    },

    // ===== 目标解析工具 =====

    /**
     * 根据 skillId 和 targetId 解析完整目标列表
     * 用于战斗系统调用时从单个目标扩展到 AOE 目标
     */
    resolveTargets(unit, skill, primaryTarget, battlefield) {
        if (!skill) return primaryTarget ? [primaryTarget] : [];

        const normalized = ContextBuilder.normalizeSkill(skill);
        const targetType = normalized.targetType || 'enemy';

        switch (targetType) {
            case 'self':
                return [unit];
            case 'enemy':
                return primaryTarget ? [primaryTarget] : [];
            case 'ally':
                return primaryTarget ? [primaryTarget] : [];
            case 'all_enemies':
            case 'all_allies':
            case 'front_2':
            case 'front_3':
            case 'random_3':
            case 'cleave_3':
                try {
                    return PositioningSystem.getValidTargets(battlefield, unit, normalized)
                        .filter(t => t.currentHp > 0);
                } catch (e) {
                    return primaryTarget ? [primaryTarget] : [];
                }
            default:
                return primaryTarget ? [primaryTarget] : [];
        }
    }
};

export { SkillExecutor };
