/**
 * 天赋系统 - 管理天赋点分配、验证和重置
 * @class TalentSystem
 */
import { TalentData } from '../data/TalentData.js'
import { GameData } from '../data/GameData.js'

export class TalentSystem {
    constructor() {
        this.engine = null;
    }

    /**
     * 初始化系统
     * @param {GameEngine} engine - 游戏引擎实例
     */
    init(engine) {
        this.engine = engine;
        this.setupEventListeners();
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听升级事件，通知可用天赋点变化
        this.engine.eventBus.on('character:levelUp', (data) => {
            const character = this.engine.stateManager.get('player');
            if (character) {
                const availablePoints = this.getAvailableTalentPoints(character);
                this.engine.eventBus.emit('talent:pointsAvailable', { points: availablePoints });
            }
        });
    }

    /**
     * 计算角色可用的天赋点数
     * 从10级开始每级获得1点天赋点
     * @param {Object} character - 角色数据
     * @returns {number} 可用天赋点数
     */
    calculateTotalTalentPoints(character) {
        if (character.level < 10) {
            return 0;
        }
        // 10级开始获得天赋点，每级1点，最高60级
        return Math.min(character.level - 9, 51);
    }

    /**
     * 获取角色已使用的天赋点数
     * @param {Object} character - 角色数据
     * @returns {number} 已使用天赋点数
     */
    getUsedTalentPoints(character) {
        if (!character.talents) {
            return 0;
        }
        
        let used = 0;
        Object.values(character.talents).forEach(tree => {
            Object.values(tree).forEach(points => {
                used += points;
            });
        });
        return used;
    }

    /**
     * 获取角色可分配的天赋点数
     * @param {Object} character - 角色数据
     * @returns {number} 可分配天赋点数
     */
    getAvailableTalentPoints(character) {
        return this.calculateTotalTalentPoints(character) - this.getUsedTalentPoints(character);
    }

    /**
     * 获取指定天赋树中已投入的点数
     * @param {Object} character - 角色数据
     * @param {string} treeName - 天赋树名称
     * @returns {number} 已投入点数
     */
    getPointsInTree(character, treeName) {
        if (!character.talents || !character.talents[treeName]) {
            return 0;
        }
        return Object.values(character.talents[treeName]).reduce((sum, points) => sum + points, 0);
    }

    /**
     * 验证是否可以分配天赋点
     * @param {Object} character - 角色数据
     * @param {string} classId - 职业ID
     * @param {string} treeName - 天赋树名称
     * @param {string} talentId - 天赋ID
     * @returns {Object} { valid: boolean, reason?: string }
     */
    canAllocateTalent(character, classId, treeName, talentId) {
        // 检查是否有可用点数
        if (this.getAvailableTalentPoints(character) <= 0) {
            return { valid: false, reason: '没有可用的天赋点' };
        }

        // 获取天赋配置
        const classTalents = TalentData[classId];
        if (!classTalents) {
            return { valid: false, reason: '无效的职业' };
        }

        const tree = classTalents[treeName];
        if (!tree) {
            return { valid: false, reason: '无效的天赋树' };
        }

        const talent = tree.talents.find(t => t.id === talentId);
        if (!talent) {
            return { valid: false, reason: '无效的天赋' };
        }

        // 检查当前天赋点数是否已满
        const currentPoints = this.getTalentPoints(character, treeName, talentId);
        if (currentPoints >= talent.maxPoints) {
            return { valid: false, reason: '该天赋已达到最大点数' };
        }

        // 检查层级解锁要求（每5点解锁下一层）
        const pointsInTree = this.getPointsInTree(character, treeName);
        const requiredPoints = (talent.tier - 1) * 5;
        if (pointsInTree < requiredPoints) {
            return { valid: false, reason: `需要在该天赋树中投入 ${requiredPoints} 点才能解锁此天赋` };
        }

        // 检查前置天赋要求
        if (talent.requires) {
            const prereqPoints = this.getTalentPoints(character, treeName, talent.requires);
            const prereqTalent = tree.talents.find(t => t.id === talent.requires);
            if (prereqPoints < prereqTalent.maxPoints) {
                return { valid: false, reason: `需要先点满 ${prereqTalent.name}` };
            }
        }

        return { valid: true };
    }

    /**
     * 获取指定天赋已分配的点数
     * @param {Object} character - 角色数据
     * @param {string} treeName - 天赋树名称
     * @param {string} talentId - 天赋ID
     * @returns {number} 已分配点数
     */
    getTalentPoints(character, treeName, talentId) {
        if (!character.talents || !character.talents[treeName]) {
            return 0;
        }
        return character.talents[treeName][talentId] || 0;
    }

    /**
     * 分配一个天赋点
     * @param {Object} character - 角色数据
     * @param {string} classId - 职业ID
     * @param {string} treeName - 天赋树名称
     * @param {string} talentId - 天赋ID
     * @returns {Object} { success: boolean, reason?: string }
     */
    allocateTalent(character, classId, treeName, talentId) {
        const validation = this.canAllocateTalent(character, classId, treeName, talentId);
        if (!validation.valid) {
            return { success: false, reason: validation.reason };
        }

        // 初始化天赋结构
        if (!character.talents) {
            character.talents = {};
        }
        if (!character.talents[treeName]) {
            character.talents[treeName] = {};
        }

        // 分配点数
        const currentPoints = character.talents[treeName][talentId] || 0;
        character.talents[treeName][talentId] = currentPoints + 1;

        // 保存角色数据（深拷贝以确保响应式更新）
        this.engine.stateManager.set('player', JSON.parse(JSON.stringify(character)));

        // 触发事件
        const classTalents = TalentData[classId];
        const talent = classTalents[treeName].talents.find(t => t.id === talentId);
        
        this.engine.eventBus.emit('talent:allocated', {
            talentId,
            treeName,
            points: character.talents[treeName][talentId],
            maxPoints: talent.maxPoints,
            availablePoints: this.getAvailableTalentPoints(character)
        });

        // 检查是否解锁了新技能 → 添加到 player.skills
        if (talent.effect.type === 'unlock_skill' && character.talents[treeName][talentId] === talent.maxPoints) {
            const skillId = talent.effect.skill;
            if (!character.skills) character.skills = [];
            if (!character.skills.includes(skillId)) {
                character.skills.push(skillId);
            }
            this.engine.eventBus.emit('skill:unlocked', { skillId });
        }

        // 检查是否解锁了能力（如双持）
        if (talent.effect.type === 'unlock_ability' && character.talents[treeName][talentId] === talent.maxPoints) {
            this.engine.eventBus.emit('ability:unlocked', { ability: talent.effect.ability });
        }

        return { success: true };
    }

    /**
     * 重置单个天赋树
     * @param {Object} character - 角色数据
     * @param {string} treeName - 天赋树名称
     * @returns {Object} { success: boolean, refundedPoints: number }
     */
    resetTree(character, treeName) {
        if (!character.talents || !character.talents[treeName]) {
            return { success: true, refundedPoints: 0 };
        }

        // 重置前：移除该天赋树中 unlock_skill 类型天赋解锁的技能
        this._removeTalentSkills(character, treeName);

        const refundedPoints = this.getPointsInTree(character, treeName);
        character.talents[treeName] = {};

        // 保存角色数据（深拷贝以确保响应式更新）
        this.engine.stateManager.set('player', JSON.parse(JSON.stringify(character)));

        // 触发事件
        this.engine.eventBus.emit('talent:treeReset', {
            treeName,
            refundedPoints,
            availablePoints: this.getAvailableTalentPoints(character)
        });

        return { success: true, refundedPoints };
    }

    /**
     * 重置所有天赋
     * @param {Object} character - 角色数据
     * @returns {Object} { success: boolean, refundedPoints: number }
     */
    resetAllTalents(character) {
        // 重置前：移除所有天赋树中 unlock_skill 类型天赋解锁的技能
        for (const tName of Object.keys(character.talents || {})) {
            this._removeTalentSkills(character, tName);
        }

        const refundedPoints = this.getUsedTalentPoints(character);
        character.talents = {};

        // 保存角色数据（深拷贝以确保响应式更新）
        this.engine.stateManager.set('player', JSON.parse(JSON.stringify(character)));

        // 触发事件
        this.engine.eventBus.emit('talent:allReset', {
            refundedPoints,
            availablePoints: this.getAvailableTalentPoints(character)
        });

        return { success: true, refundedPoints };
    }

    /**
     * 移除指定天赋树中 unlock_skill 类型天赋解锁的技能
     * @param {Object} character - 角色数据
     * @param {string} treeName - 天赋树名称
     */
    _removeTalentSkills(character, treeName) {
        if (!character.skills || !character.talents?.[treeName]) return;
        const classId = character.class;
        const classTalents = TalentData[classId];
        if (!classTalents?.[treeName]?.talents) return;

        for (const talent of classTalents[treeName].talents) {
            if (talent.effect?.type === 'unlock_skill' &&
                character.talents[treeName][talent.id] >= talent.maxPoints) {
                const idx = character.skills.indexOf(talent.effect.skill);
                if (idx !== -1) {
                    character.skills.splice(idx, 1);
                }
            }
        }
    }

    /**
     * 获取角色的天赋树配置
     * @param {string} classId - 职业ID
     * @returns {Object} 天赋树配置
     */
    getClassTalentTrees(classId) {
        return TalentData[classId] || null;
    }

    /**
     * 获取天赋效果加成
     * @param {Object} character - 角色数据
     * @param {string} effectType - 效果类型
     * @param {string} targetId - 目标ID（技能、属性等）
     * @returns {number} 效果加成值
     */
    getTalentBonus(character, effectType, targetId = null) {
        if (!character.talents) {
            return 0;
        }

        let totalBonus = 0;
        const classId = character.class;
        const classTalents = TalentData[classId];

        if (!classTalents) {
            return 0;
        }

        // 遍历所有天赋树
        Object.keys(character.talents).forEach(treeName => {
            const tree = classTalents[treeName];
            if (!tree) return;

            // 遍历该树中的天赋点
            Object.keys(character.talents[treeName]).forEach(talentId => {
                const points = character.talents[treeName][talentId];
                if (points <= 0) return;

                const talent = tree.talents.find(t => t.id === talentId);
                if (!talent || !talent.effect) return;

                // 检查效果类型匹配
                if (talent.effect.type === effectType) {
                    // 如果有目标ID要求，检查是否匹配
                    if (targetId) {
                        if (talent.effect.skill === targetId || 
                            talent.effect.stat === targetId ||
                            talent.effect.resourceType === targetId ||
                            (talent.effect.skills && talent.effect.skills.includes(targetId))) {
                            totalBonus += talent.effect.bonus * points;
                        }
                    } else {
                        totalBonus += talent.effect.bonus * points;
                    }
                }
            });
        });

        return totalBonus;
    }

    /**
     * 获取资源上限修正值（天赋加成）
     * @param {Object} character - 角色数据
     * @param {string} resourceType - 资源类型 ('rage' | 'mana' | 'energy')
     * @returns {number} 资源上限加成值
     */
    getResourceMaxBonus(character, resourceType) {
        return this.getTalentBonus(character, 'modify_resource_max', resourceType);
    }

    /**
     * 获取资源产生修正值（天赋加成）
     * @param {Object} character - 角色数据
     * @param {string} resourceType - 资源类型 ('rage' | 'mana' | 'energy')
     * @param {string} trigger - 触发类型 ('onAttack' | 'onHit' | 'onCrit')
     * @returns {number} 资源产生加成值（百分比，如 0.1 表示 +10%）
     */
    getResourceGenerationBonus(character, resourceType, trigger = null) {
        // 通用资源产生加成
        let bonus = this.getTalentBonus(character, 'modify_resource_generation', resourceType);
        
        // 特定触发类型的加成
        if (trigger) {
            const specificEffectType = `modify_resource_${trigger}`;
            bonus += this.getTalentBonus(character, specificEffectType, resourceType);
        }
        
        return bonus;
    }

    /**
     * 应用天赋效果到角色资源系统
     * @param {Object} character - 角色数据
     */
    applyResourceTalentEffects(character) {
        if (!character.resource) return;
        
        const resourceType = character.resource.type;
        const resourceConfig = GameData.resourceSystems[resourceType];
        
        if (!resourceConfig) return;
        
        // 计算天赋加成后的资源上限
        const baseMax = character.resource.baseMax || resourceConfig.defaultMax;
        const bonusMax = this.getResourceMaxBonus(character, resourceType);
        character.resource.max = baseMax + bonusMax;
        
        // 确保当前值不超过上限
        character.resource.current = Math.min(character.resource.current, character.resource.max);
        
        // 保存角色数据（深拷贝以确保响应式更新）
        this.engine.stateManager.set('player', JSON.parse(JSON.stringify(character)));
    }

    /**
     * 检查是否解锁了指定技能
     * @param {Object} character - 角色数据
     * @param {string} skillId - 技能ID
     * @returns {boolean} 是否解锁
     */
    isSkillUnlocked(character, skillId) {
        if (!character.talents) {
            return false;
        }

        const classId = character.class;
        const classTalents = TalentData[classId];

        if (!classTalents) {
            return false;
        }

        // 检查所有天赋树
        for (const treeName of Object.keys(character.talents)) {
            const tree = classTalents[treeName];
            if (!tree) continue;

            for (const talentId of Object.keys(character.talents[treeName])) {
                const talent = tree.talents.find(t => t.id === talentId);
                if (!talent) continue;

                if (talent.effect.type === 'unlock_skill' && 
                    talent.effect.skill === skillId &&
                    character.talents[treeName][talentId] >= talent.maxPoints) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 获取角色天赋摘要
     * @param {Object} character - 角色数据
     * @returns {Object} 天赋摘要
     */
    getTalentSummary(character) {
        const classId = character.class;
        const classTalents = TalentData[classId];
        
        if (!classTalents) {
            return null;
        }

        const summary = {
            totalPoints: this.calculateTotalTalentPoints(character),
            usedPoints: this.getUsedTalentPoints(character),
            availablePoints: this.getAvailableTalentPoints(character),
            trees: {}
        };

        Object.keys(classTalents).forEach(treeName => {
            const tree = classTalents[treeName];
            summary.trees[treeName] = {
                name: tree.name,
                icon: tree.icon,
                points: this.getPointsInTree(character, treeName)
            };
        });

        return summary;
    }

    /**
     * 系统更新
     * @param {number} deltaTime - 帧间隔
     */
    update(deltaTime) {
        // 天赋系统不需要实时更新
    }
}

