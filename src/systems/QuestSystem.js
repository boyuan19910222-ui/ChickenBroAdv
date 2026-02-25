/**
 * QuestSystem - 任务系统
 * 管理任务的接取、追踪、完成、奖励发放和日常重置
 */
import {
    QuestDatabase,
    QuestType,
    QuestStatus,
    ObjectiveType,
    QuestTypeConfig,
} from '../data/QuestData.js'

export class QuestSystem {
    constructor() {
        this.engine = null
    }

    /**
     * 初始化系统
     * @param {GameEngine} engine
     */
    init(engine) {
        this.engine = engine
        this.setupEventListeners()
    }

    setupEventListeners() {
        // 战斗胜利 → 更新击杀/战斗目标
        this.engine.eventBus.on('combat:victory', (data) => {
            this._onCombatVictory(data)
        })

        // 经验获取 → 检查等级目标
        this.engine.eventBus.on('exp:gain', () => {
            this._checkLevelObjectives()
        })

        // 游戏开始 → 检查日常任务重置
        this.engine.eventBus.on('game:start', () => {
            this._checkDailyReset()
        })
    }

    // ==================== 任务接取 ====================

    /**
     * 检查任务是否可接取
     * @param {Object} player - 玩家数据
     * @param {string} questId - 任务ID
     * @returns {{ canAccept: boolean, reason?: string }}
     */
    canAcceptQuest(player, questId) {
        const quest = QuestDatabase[questId]
        if (!quest) {
            return { canAccept: false, reason: '任务不存在' }
        }

        // 等级检查
        if (player.level < quest.requiredLevel) {
            return { canAccept: false, reason: `需要等级 ${quest.requiredLevel}（当前 ${player.level}）` }
        }

        // 前置任务检查
        const completed = player.completedQuests || []
        if (quest.prerequisites && quest.prerequisites.length > 0) {
            for (const preId of quest.prerequisites) {
                if (!completed.includes(preId)) {
                    const preName = QuestDatabase[preId]?.name || preId
                    return { canAccept: false, reason: `需要先完成任务: ${preName}` }
                }
            }
        }

        // 是否已在进行中
        const active = player.activeQuests || []
        if (active.find(q => q.questId === questId)) {
            return { canAccept: false, reason: '任务已在进行中' }
        }

        // 非日常任务：已完成不能再接
        if (quest.type !== QuestType.DAILY && completed.includes(questId)) {
            return { canAccept: false, reason: '任务已完成' }
        }

        // 日常任务：今日已完成不能再接
        if (quest.type === QuestType.DAILY) {
            const dailyCompleted = player.dailyQuestsCompleted || []
            if (dailyCompleted.includes(questId)) {
                return { canAccept: false, reason: '今日已完成此日常任务' }
            }
        }

        // 最大进行中任务数限制
        if (active.length >= 10) {
            return { canAccept: false, reason: '进行中的任务已满（最多10个）' }
        }

        return { canAccept: true }
    }

    /**
     * 接取任务
     * @param {Object} player - 玩家数据
     * @param {string} questId - 任务ID
     * @returns {{ success: boolean, reason?: string }}
     */
    acceptQuest(player, questId) {
        const check = this.canAcceptQuest(player, questId)
        if (!check.canAccept) {
            return { success: false, reason: check.reason }
        }

        const quest = QuestDatabase[questId]

        // 创建任务实例
        const questInstance = {
            questId: quest.id,
            acceptedAt: Date.now(),
            objectives: quest.objectives.map((obj, idx) => ({
                index: idx,
                type: obj.type,
                monsterId: obj.monsterId || null,
                target: obj.target,
                current: 0,
                completed: false,
            })),
        }

        // 接取时立即检查等级目标（可能已满足）
        for (const obj of questInstance.objectives) {
            if (obj.type === ObjectiveType.REACH_LEVEL) {
                obj.current = player.level
                if (obj.current >= obj.target) {
                    obj.completed = true
                }
            }
            if (obj.type === ObjectiveType.WIN_BATTLES) {
                // 从0开始计
                obj.current = 0
            }
        }

        if (!player.activeQuests) player.activeQuests = []
        player.activeQuests.push(questInstance)

        this._saveAndNotify(player, 'quest:accepted', { questId, quest })

        return { success: true }
    }

    /**
     * 放弃任务
     * @param {Object} player - 玩家数据
     * @param {string} questId - 任务ID
     * @returns {{ success: boolean, reason?: string }}
     */
    abandonQuest(player, questId) {
        if (!player.activeQuests) return { success: false, reason: '没有进行中的任务' }

        const idx = player.activeQuests.findIndex(q => q.questId === questId)
        if (idx < 0) {
            return { success: false, reason: '该任务不在进行中' }
        }

        // 主线任务不允许放弃
        const quest = QuestDatabase[questId]
        if (quest?.type === QuestType.MAIN) {
            return { success: false, reason: '主线任务不能放弃' }
        }

        player.activeQuests.splice(idx, 1)
        this._saveAndNotify(player, 'quest:abandoned', { questId })

        return { success: true }
    }

    // ==================== 目标追踪 ====================

    /**
     * 战斗胜利时更新目标
     */
    _onCombatVictory(data) {
        const player = this._getPlayer()
        if (!player || !player.activeQuests || player.activeQuests.length === 0) return

        const enemy = data.enemy
        let changed = false

        for (const questInst of player.activeQuests) {
            for (const obj of questInst.objectives) {
                if (obj.completed) continue

                // 击杀目标
                if (obj.type === ObjectiveType.KILL && enemy && obj.monsterId === enemy.id) {
                    obj.current = Math.min(obj.current + 1, obj.target)
                    if (obj.current >= obj.target) obj.completed = true
                    changed = true
                }

                // 赢得战斗目标
                if (obj.type === ObjectiveType.WIN_BATTLES) {
                    obj.current = Math.min(obj.current + 1, obj.target)
                    if (obj.current >= obj.target) obj.completed = true
                    changed = true
                }
            }

            // 检查整个任务是否完成
            if (this._isQuestComplete(questInst)) {
                changed = true
            }
        }

        if (changed) {
            this.engine.stateManager.set('player', player)
            this.engine.eventBus.emit('quest:progress', { player })
        }
    }

    /**
     * 检查等级目标
     */
    _checkLevelObjectives() {
        const player = this._getPlayer()
        if (!player || !player.activeQuests) return

        let changed = false

        for (const questInst of player.activeQuests) {
            for (const obj of questInst.objectives) {
                if (obj.completed) continue

                if (obj.type === ObjectiveType.REACH_LEVEL) {
                    obj.current = player.level
                    if (obj.current >= obj.target) {
                        obj.completed = true
                        changed = true
                    }
                }
            }

            if (this._isQuestComplete(questInst)) {
                changed = true
            }
        }

        if (changed) {
            this.engine.stateManager.set('player', player)
            this.engine.eventBus.emit('quest:progress', { player })
        }
    }

    /**
     * 检查任务是否所有目标都完成
     */
    _isQuestComplete(questInst) {
        return questInst.objectives.every(o => o.completed)
    }

    // ==================== 任务完成和奖励 ====================

    /**
     * 交付完成的任务（领取奖励）
     * @param {Object} player - 玩家数据
     * @param {string} questId - 任务ID
     * @returns {{ success: boolean, rewards?: Object, reason?: string }}
     */
    turnInQuest(player, questId) {
        if (!player.activeQuests) return { success: false, reason: '没有进行中的任务' }

        const idx = player.activeQuests.findIndex(q => q.questId === questId)
        if (idx < 0) {
            return { success: false, reason: '该任务不在进行中' }
        }

        const questInst = player.activeQuests[idx]
        if (!this._isQuestComplete(questInst)) {
            return { success: false, reason: '任务目标尚未全部完成' }
        }

        const quest = QuestDatabase[questId]
        if (!quest) return { success: false, reason: '任务数据不存在' }

        // 从进行中列表移除
        player.activeQuests.splice(idx, 1)

        // 添加到已完成列表
        if (!player.completedQuests) player.completedQuests = []
        if (!player.completedQuests.includes(questId)) {
            player.completedQuests.push(questId)
        }

        // 日常任务：记录今日已完成
        if (quest.type === QuestType.DAILY) {
            if (!player.dailyQuestsCompleted) player.dailyQuestsCompleted = []
            player.dailyQuestsCompleted.push(questId)
        }

        // 更新统计
        if (player.statistics) {
            player.statistics.questsCompleted = (player.statistics.questsCompleted || 0) + 1
        }

        // 发放奖励
        const rewards = { ...quest.rewards }

        // 金币
        if (rewards.gold) {
            player.gold = (player.gold || 0) + rewards.gold
            if (player.statistics) {
                player.statistics.goldEarned = (player.statistics.goldEarned || 0) + rewards.gold
            }
        }

        // 经验值（通过事件触发，CharacterSystem 会处理升级）
        if (rewards.exp) {
            this.engine.eventBus.emit('exp:gain', rewards.exp)
        }

        // 物品奖励（加入背包）
        if (rewards.items && rewards.items.length > 0) {
            if (!player.inventory) player.inventory = []
            for (const item of rewards.items) {
                player.inventory.push({ ...item })
            }
        }

        this._saveAndNotify(player, 'quest:completed', { questId, quest, rewards })

        return { success: true, rewards }
    }

    // ==================== 日常任务重置 ====================

    /**
     * 检查是否需要重置日常任务
     */
    _checkDailyReset() {
        const player = this._getPlayer()
        if (!player) return

        const now = new Date()
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

        if (player.dailyQuestReset !== todayStr) {
            // 移除进行中的日常任务
            if (player.activeQuests) {
                player.activeQuests = player.activeQuests.filter(qi => {
                    const questDef = QuestDatabase[qi.questId]
                    return questDef?.type !== QuestType.DAILY
                })
            }

            // 清空今日已完成日常
            player.dailyQuestsCompleted = []
            player.dailyQuestReset = todayStr

            this.engine.stateManager.set('player', player)
            this.engine.eventBus.emit('quest:dailyReset', { date: todayStr })
        }
    }

    // ==================== 查询方法 ====================

    /**
     * 获取玩家可接取的任务列表
     * @param {Object} player
     * @returns {Array<Object>} 任务模板数组
     */
    getAvailableQuests(player) {
        const completedIds = player.completedQuests || []
        const activeIds = (player.activeQuests || []).map(q => q.questId)
        const dailyCompleted = player.dailyQuestsCompleted || []

        return Object.values(QuestDatabase).filter(quest => {
            // 等级不足
            if (player.level < quest.requiredLevel) return false

            // 已在进行中
            if (activeIds.includes(quest.id)) return false

            // 非日常：已完成
            if (quest.type !== QuestType.DAILY && completedIds.includes(quest.id)) return false

            // 日常：今日已完成
            if (quest.type === QuestType.DAILY && dailyCompleted.includes(quest.id)) return false

            // 前置任务未完成
            if (quest.prerequisites && quest.prerequisites.length > 0) {
                return quest.prerequisites.every(preId => completedIds.includes(preId))
            }

            return true
        })
    }

    /**
     * 获取进行中的任务（带详细信息）
     * @param {Object} player
     * @returns {Array<Object>}
     */
    getActiveQuestsWithDetails(player) {
        if (!player.activeQuests) return []

        return player.activeQuests.map(qi => {
            const questDef = QuestDatabase[qi.questId]
            if (!questDef) return null

            return {
                ...qi,
                questDef,
                isComplete: this._isQuestComplete(qi),
                typeConfig: QuestTypeConfig[questDef.type],
            }
        }).filter(Boolean)
    }

    /**
     * 获取已完成的任务列表（带详情）
     * @param {Object} player
     * @returns {Array<Object>}
     */
    getCompletedQuests(player) {
        const completedIds = player.completedQuests || []
        return completedIds.map(id => QuestDatabase[id]).filter(Boolean)
    }

    /**
     * 获取任务进度文本
     * @param {Object} objective - 目标实例
     * @param {Object} questDef - 任务定义
     * @returns {string}
     */
    getObjectiveText(objective, questDef) {
        const objDef = questDef.objectives[objective.index]
        if (!objDef) return '未知目标'

        // 替换进度数字
        const baseDesc = objDef.description
        if (objective.type === ObjectiveType.KILL) {
            return baseDesc.replace(/\(.*?\)/, `(${objective.current}/${objective.target})`)
        }
        if (objective.type === ObjectiveType.WIN_BATTLES) {
            return `${baseDesc.split('(')[0]}(${objective.current}/${objective.target})`
        }
        if (objective.type === ObjectiveType.REACH_LEVEL) {
            return objective.completed
                ? `✅ ${baseDesc}`
                : `${baseDesc} (当前 ${objective.current})`
        }
        return baseDesc
    }

    // ==================== 工具方法 ====================

    _getPlayer() {
        return this.engine?.stateManager?.get('player')
    }

    _saveAndNotify(player, event, data) {
        this.engine.stateManager.set('player', player)
        this.engine.eventBus.emit(event, data)
    }

    update(deltaTime) {
        // 任务系统无需每帧更新
    }
}
