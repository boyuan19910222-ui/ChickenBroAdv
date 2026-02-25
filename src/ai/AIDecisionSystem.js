/**
 * AIDecisionSystem - AI 决策系统入口
 * 
 * 按角色/类型选择行为树，调用 ContextBuilder + BehaviorTree.tick 做出决策
 * 统一所有 AI 单位（友方AI队友、敌方怪物、BOSS、宠物）的决策流程
 */

import { BehaviorTree } from './BehaviorTree.js';
import { ContextBuilder } from './ContextBuilder.js';
import { SkillExecutor } from './SkillExecutor.js';
import { GameData } from '../data/GameData.js';

// 导入行为树定义
import { dungeonAllyTank } from './trees/dungeonAllyTank.js';
import { dungeonAllyHealer } from './trees/dungeonAllyHealer.js';
import { dungeonAllyDps } from './trees/dungeonAllyDps.js';
import { dungeonEnemy } from './trees/dungeonEnemy.js';
import { bossDefault } from './trees/bossDefault.js';
import { overworldEnemy } from './trees/overworldEnemy.js';
import { petDefault } from './trees/petDefault.js';

// 确保条件/动作/评分函数已注册
import './conditions.js';
import './actions.js';
import './scorers.js';

const AIDecisionSystem = {

    /**
     * 为 AI 单位做出决策
     * @param {Object} unit - 行动单位
     * @param {Object} battleState - 战斗状态 { battlefield, threatState, turnState, gameData, combatType }
     * @returns {{ skillId: string, targetIds: string[] } | null} 决策结果
     */
    decideAction(unit, battleState) {
        // 1. 选择行为树
        const tree = this._selectTree(unit, battleState);
        if (!tree) {
            console.warn(`[AIDecisionSystem] No tree for unit: ${unit.name} (${unit.id})`);
            return null;
        }

        // 2. 构建 context
        const context = ContextBuilder.build(unit, battleState);

        // 3. tick 行为树
        const result = BehaviorTree.tick(tree, unit, context);

        if (result.status === 'SUCCESS' && result.action) {
            return result.action; // { skillId, targetIds }
        }

        return null;
    },

    /**
     * 完整的 AI 回合：决策 + 执行
     * @param {Object} unit - 行动单位
     * @param {Object} battleState - 战斗状态
     * @returns {{ success: boolean, action: Object|null, executeResult: Object|null }}
     */
    processAITurn(unit, battleState) {
        // 1. 冷却递减
        SkillExecutor.tickCooldowns(unit);

        // 2. 做出决策
        const action = this.decideAction(unit, battleState);
        if (!action) {
            return { success: false, action: null, executeResult: null };
        }

        // 3. 解析技能
        const skill = this._resolveSkill(action.skillId, unit, battleState);
        if (!skill) {
            return { success: false, action, executeResult: null };
        }

        // 4. 解析目标
        const targets = this._resolveTargets(action.targetIds, battleState);
        if (targets.length === 0) {
            return { success: false, action, executeResult: null };
        }

        // 5. 执行技能
        const battleContext = {
            battlefield: battleState.battlefield,
            threatState: battleState.threatState,
            combatType: battleState.combatType || 'dungeon'
        };

        const executeResult = SkillExecutor.executeSkill(unit, skill, targets, battleContext);

        return {
            success: executeResult.success,
            action,
            skill,
            targets,
            executeResult
        };
    },

    /**
     * 根据单位类型/角色选择行为树
     * @private
     */
    _selectTree(unit, battleState) {
        const combatType = battleState.combatType || 'dungeon';

        // BOSS
        if (unit.isBoss || unit.type === 'boss') {
            return bossDefault;
        }

        // 宠物
        if (unit.isPet || unit.type === 'pet') {
            return petDefault;
        }

        // 野外战斗中的敌人
        if (combatType === 'overworld') {
            return overworldEnemy;
        }

        // 副本中的敌方
        if (unit.side === 'enemy' || unit.isEnemy) {
            return dungeonEnemy;
        }

        // 副本中的友方 AI（按角色定位选择）
        const role = unit.role;
        switch (role) {
            case 'tank':
                return dungeonAllyTank;
            case 'healer':
                return dungeonAllyHealer;
            case 'melee_dps':
            case 'ranged_dps':
            case 'dps':
                return dungeonAllyDps;
            default:
                return dungeonAllyDps;
        }
    },

    /**
     * 解析技能 ID 到技能对象
     * @private
     */
    _resolveSkill(skillId, unit, battleState) {
        if (!skillId) return null;

        const gameData = battleState.gameData || GameData;

        // 先查 GameData.skills
        if (gameData?.skills?.[skillId]) {
            return gameData.skills[skillId];
        }

        // 再查单位自带的技能列表（敌人技能可能是内联对象）
        if (unit.skills) {
            for (const sk of unit.skills) {
                if (typeof sk === 'object' && sk.id === skillId) {
                    return sk;
                }
            }
        }

        return null;
    },

    /**
     * 解析目标 ID 列表到目标对象
     * @private
     */
    _resolveTargets(targetIds, battleState) {
        if (!targetIds || targetIds.length === 0) return [];

        const { battlefield } = battleState;
        if (!battlefield) return [];

        const targets = [];

        // 搜索所有站位中的单位
        const allPositions = [
            ...(battlefield.playerPositions ? Object.values(battlefield.playerPositions) : []),
            ...(battlefield.enemyPositions ? Object.values(battlefield.enemyPositions) : [])
        ];

        for (const targetId of targetIds) {
            const pos = allPositions.find(p => p && p.id === targetId);
            if (pos && pos.currentHp > 0) {
                targets.push(pos);
            }
        }

        // 如果没找到（兼容 partyState.members 结构的目标），尝试从 battleState 额外数据中查找
        if (targets.length === 0 && battleState.partyMembers) {
            for (const targetId of targetIds) {
                const member = battleState.partyMembers.find(m => m.id === targetId && m.currentHp > 0);
                if (member) targets.push(member);
            }
        }

        if (targets.length === 0 && battleState.enemies) {
            for (const targetId of targetIds) {
                const enemy = battleState.enemies.find(e => e.id === targetId && e.currentHp > 0);
                if (enemy) targets.push(enemy);
            }
        }

        return targets;
    }
};

export { AIDecisionSystem };
