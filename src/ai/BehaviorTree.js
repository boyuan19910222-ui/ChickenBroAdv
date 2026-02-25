/**
 * BehaviorTree - 行为树引擎
 * 
 * 支持五种节点类型：
 * - selector: 固定优先级选择器，按顺序尝试子节点，第一个 SUCCESS 即返回
 * - scored:   评分选择器，调用各子节点的 scorer 函数，执行得分最高的
 * - sequence: 序列节点，按顺序执行所有子节点，任一 FAILURE 则整体 FAILURE
 * - condition: 条件节点，通过注册表 key 调用条件函数
 * - action:   动作节点，通过注册表 key 调用动作函数
 */

import { AIRegistry } from './AIRegistry.js';

const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const RUNNING = 'RUNNING';

const BehaviorTree = {

    tick(tree, unit, context) {
        const result = this._tickNode(tree, unit, context);
        return result;
    },

    _tickNode(node, unit, context) {
        switch (node.type) {
            case 'selector':  return this._tickSelector(node, unit, context);
            case 'scored':    return this._tickScored(node, unit, context);
            case 'sequence':  return this._tickSequence(node, unit, context);
            case 'condition': return this._tickCondition(node, unit, context);
            case 'action':    return this._tickAction(node, unit, context);
            default:
                console.warn(`[BehaviorTree] Unknown node type: ${node.type}`);
                return { status: FAILURE, action: null };
        }
    },

    /**
     * Selector: 按顺序尝试子节点，第一个 SUCCESS 即返回
     */
    _tickSelector(node, unit, context) {
        for (const child of node.children) {
            const result = this._tickNode(child, unit, context);
            if (result.status === SUCCESS) {
                return result;
            }
        }
        return { status: FAILURE, action: null };
    },

    /**
     * Scored: 执行所有子节点的 scorer，选得分最高的执行
     */
    _tickScored(node, unit, context) {
        let bestScore = -1;
        let bestChild = null;

        for (const child of node.children) {
            if (!child.scorer) continue;
            const scorerFn = AIRegistry.lookup('scorer', child.scorer);
            if (!scorerFn) continue;

            const score = scorerFn(unit, context, child.params);
            if (typeof score === 'number' && score > bestScore) {
                bestScore = score;
                bestChild = child;
            }
        }

        if (bestChild && bestScore > 0) {
            return this._tickNode(bestChild, unit, context);
        }

        return { status: FAILURE, action: null };
    },

    /**
     * Sequence: 按顺序执行所有子节点，任一 FAILURE 则整体 FAILURE
     */
    _tickSequence(node, unit, context) {
        let lastAction = null;
        for (const child of node.children) {
            const result = this._tickNode(child, unit, context);
            if (result.status === FAILURE) {
                return { status: FAILURE, action: null };
            }
            if (result.action) {
                lastAction = result.action;
            }
        }
        return { status: SUCCESS, action: lastAction };
    },

    /**
     * Condition: 通过注册表 key 调用条件函数
     */
    _tickCondition(node, unit, context) {
        const conditionFn = AIRegistry.lookup('condition', node.key);
        if (!conditionFn) {
            console.warn(`[BehaviorTree] Condition not found: ${node.key}`);
            return { status: FAILURE, action: null };
        }

        const result = conditionFn(unit, context, node.params);
        return {
            status: result ? SUCCESS : FAILURE,
            action: null
        };
    },

    /**
     * Action: 通过注册表 key 调用动作函数
     */
    _tickAction(node, unit, context) {
        const actionFn = AIRegistry.lookup('action', node.key);
        if (!actionFn) {
            console.warn(`[BehaviorTree] Action not found: ${node.key}`);
            return { status: FAILURE, action: null };
        }

        const action = actionFn(unit, context, node.params);
        if (action && action.skillId) {
            return { status: SUCCESS, action };
        }
        return { status: FAILURE, action: null };
    }
};

export { BehaviorTree, SUCCESS, FAILURE, RUNNING };
