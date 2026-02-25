/**
 * AIRegistry - 条件/动作/评分函数注册表
 * 
 * 所有函数统一签名: (unit, context, params?) => result
 * - condition: => boolean
 * - action:    => { skillId, targetIds } | null
 * - scorer:    => number (0~1)
 */

const _registries = {
    condition: {},
    action: {},
    scorer: {}
};

const AIRegistry = {

    /**
     * 注册函数到注册表
     * @param {'condition'|'action'|'scorer'} type 
     * @param {string} key 
     * @param {Function} fn 
     */
    register(type, key, fn) {
        if (!_registries[type]) {
            throw new Error(`[AIRegistry] Invalid type: ${type}. Must be 'condition', 'action', or 'scorer'.`);
        }
        if (typeof fn !== 'function') {
            throw new Error(`[AIRegistry] Value for '${key}' must be a function.`);
        }
        _registries[type][key] = fn;
    },

    /**
     * 查找注册的函数
     * @param {'condition'|'action'|'scorer'} type 
     * @param {string} key 
     * @returns {Function}
     */
    lookup(type, key) {
        const fn = _registries[type]?.[key];
        if (!fn) {
            throw new Error(`[AIRegistry] ${type} '${key}' not found. Available: [${Object.keys(_registries[type] || {}).join(', ')}]`);
        }
        return fn;
    },

    /**
     * 批量注册
     * @param {'condition'|'action'|'scorer'} type
     * @param {Object<string, Function>} entries 
     */
    registerAll(type, entries) {
        for (const [key, fn] of Object.entries(entries)) {
            this.register(type, key, fn);
        }
    },

    /**
     * 获取指定类型的所有已注册 key
     */
    keys(type) {
        return Object.keys(_registries[type] || {});
    },

    /**
     * 清空所有注册（测试用）
     */
    clear() {
        for (const type of Object.keys(_registries)) {
            _registries[type] = {};
        }
    }
};

export { AIRegistry };
