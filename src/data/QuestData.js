/**
 * QuestData - 任务系统数据配置
 * 定义所有任务模板、类型、目标、奖励和前置条件
 */

/**
 * 任务类型枚举
 */
export const QuestType = {
    MAIN: 'main',       // 主线任务
    SIDE: 'side',       // 支线任务
    DAILY: 'daily',     // 日常任务
}

/**
 * 任务状态枚举
 */
export const QuestStatus = {
    AVAILABLE: 'available',     // 可接取
    ACTIVE: 'active',           // 进行中
    COMPLETED: 'completed',     // 已完成（待交付）
    TURNED_IN: 'turned_in',     // 已交付
    LOCKED: 'locked',           // 锁定（前置未满足）
}

/**
 * 目标类型枚举
 */
export const ObjectiveType = {
    KILL: 'kill',           // 击杀指定怪物
    COLLECT: 'collect',     // 收集物品
    REACH_LEVEL: 'reach_level', // 达到指定等级
    WIN_BATTLES: 'win_battles', // 赢得战斗次数
    EXPLORE: 'explore',     // 到达区域
}

/**
 * 任务类型配置
 */
export const QuestTypeConfig = {
    [QuestType.MAIN]: {
        name: '主线',
        emoji: '📜',
        color: '#ffd700',
        sortOrder: 0,
    },
    [QuestType.SIDE]: {
        name: '支线',
        emoji: '📋',
        color: '#4fc3f7',
        sortOrder: 1,
    },
    [QuestType.DAILY]: {
        name: '日常',
        emoji: '🔄',
        color: '#81c784',
        sortOrder: 2,
    },
}

/**
 * 任务数据库 - 所有任务模板
 */
export const QuestDatabase = {
    // ═══════════════════════════════════════════
    // 主线任务 (Main Quests) — 按顺序推进
    // ═══════════════════════════════════════════

    mq_first_blood: {
        id: 'mq_first_blood',
        name: '初次战斗',
        emoji: '⚔️',
        type: QuestType.MAIN,
        description: '作为一名冒险者，你需要证明自己的实力。在艾尔文森林中击败你的第一个敌人。',
        hint: '前往艾尔文森林与野兽战斗',
        requiredLevel: 1,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.WIN_BATTLES, target: 1, description: '赢得一场战斗' },
        ],
        rewards: {
            exp: 50,
            gold: 20,
            items: [],
        },
        nextQuest: 'mq_wolf_threat',
    },

    mq_wolf_threat: {
        id: 'mq_wolf_threat',
        name: '狼群威胁',
        emoji: '🐺',
        type: QuestType.MAIN,
        description: '艾尔文森林中的野狼越来越多，威胁到了村民的安全。帮助清除这些野狼。',
        hint: '击败野狼来保护村民',
        requiredLevel: 1,
        prerequisites: ['mq_first_blood'],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'wolf', target: 3, description: '击败野狼 (0/3)' },
        ],
        rewards: {
            exp: 100,
            gold: 30,
            items: [],
        },
        nextQuest: 'mq_orc_scouts',
    },

    mq_orc_scouts: {
        id: 'mq_orc_scouts',
        name: '兽人侦察兵',
        emoji: '👹',
        type: QuestType.MAIN,
        description: '森林中发现了兽人侦察兵的踪迹。消灭他们以阻止兽人的入侵计划。',
        hint: '找到并消灭森林兽人',
        requiredLevel: 2,
        prerequisites: ['mq_wolf_threat'],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'forestOrc', target: 3, description: '击败森林兽人 (0/3)' },
        ],
        rewards: {
            exp: 150,
            gold: 50,
            items: [],
        },
        nextQuest: 'mq_westfall_journey',
    },

    mq_westfall_journey: {
        id: 'mq_westfall_journey',
        name: '前往西部荒野',
        emoji: '🌾',
        type: QuestType.MAIN,
        description: '你已经在艾尔文森林证明了自己。现在是时候前往更危险的西部荒野继续冒险了。',
        hint: '达到10级以解锁西部荒野',
        requiredLevel: 10,
        prerequisites: ['mq_orc_scouts'],
        objectives: [
            { type: ObjectiveType.REACH_LEVEL, target: 10, description: '达到等级 10' },
        ],
        rewards: {
            exp: 300,
            gold: 100,
            items: [],
        },
        nextQuest: 'mq_goblin_menace',
    },

    mq_goblin_menace: {
        id: 'mq_goblin_menace',
        name: '哥布林之祸',
        emoji: '👺',
        type: QuestType.MAIN,
        description: '西部荒野的哥布林部落正在劫掠商队。帮助清除这些贪婪的小家伙。',
        hint: '在西部荒野消灭哥布林',
        requiredLevel: 10,
        prerequisites: ['mq_westfall_journey'],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'goblin', target: 5, description: '击败哥布林 (0/5)' },
        ],
        rewards: {
            exp: 400,
            gold: 120,
            items: [],
        },
        nextQuest: 'mq_undead_rising',
    },

    mq_undead_rising: {
        id: 'mq_undead_rising',
        name: '亡灵崛起',
        emoji: '💀',
        type: QuestType.MAIN,
        description: '骷髅战士开始出没在荒野边缘，有人怀疑是某种邪恶力量在操控它们。',
        hint: '击败在荒野中游荡的骷髅战士',
        requiredLevel: 12,
        prerequisites: ['mq_goblin_menace'],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'skeleton', target: 5, description: '击败骷髅战士 (0/5)' },
        ],
        rewards: {
            exp: 500,
            gold: 150,
            items: [],
        },
        nextQuest: 'mq_jungle_expedition',
    },

    mq_jungle_expedition: {
        id: 'mq_jungle_expedition',
        name: '丛林远征',
        emoji: '🌿',
        type: QuestType.MAIN,
        description: '传闻荆棘谷中存在古老的力量。达到足够的实力后，前去一探究竟。',
        hint: '变得更强大以踏入荆棘谷',
        requiredLevel: 30,
        prerequisites: ['mq_undead_rising'],
        objectives: [
            { type: ObjectiveType.REACH_LEVEL, target: 30, description: '达到等级 30' },
        ],
        rewards: {
            exp: 800,
            gold: 300,
            items: [],
        },
        nextQuest: 'mq_troll_warlord',
    },

    mq_troll_warlord: {
        id: 'mq_troll_warlord',
        name: '巨魔军阀',
        emoji: '👾',
        type: QuestType.MAIN,
        description: '荆棘谷中的巨魔部落正在聚集力量。你必须击败他们的军阀以阻止入侵。',
        hint: '在荆棘谷中与巨魔战斗',
        requiredLevel: 30,
        prerequisites: ['mq_jungle_expedition'],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'troll', target: 5, description: '击败巨魔 (0/5)' },
        ],
        rewards: {
            exp: 1200,
            gold: 500,
            items: [],
        },
        nextQuest: null,
    },

    // ═══════════════════════════════════════════
    // 支线任务 (Side Quests)
    // ═══════════════════════════════════════════

    sq_wolf_pelts: {
        id: 'sq_wolf_pelts',
        name: '狼皮收集',
        emoji: '🐺',
        type: QuestType.SIDE,
        description: '毛皮商人需要狼皮来制作冬衣。在森林中猎杀野狼并收集它们的皮毛。',
        hint: '在艾尔文森林猎杀野狼',
        requiredLevel: 2,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'wolf', target: 5, description: '击败野狼 (0/5)' },
        ],
        rewards: {
            exp: 80,
            gold: 40,
            items: [],
        },
    },

    sq_orc_weapons: {
        id: 'sq_orc_weapons',
        name: '缴获兽人武器',
        emoji: '🗡️',
        type: QuestType.SIDE,
        description: '铁匠想要研究兽人的武器锻造技术。帮他收集一些兽人的武器。',
        hint: '击败森林兽人获取武器',
        requiredLevel: 3,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'forestOrc', target: 4, description: '击败森林兽人 (0/4)' },
        ],
        rewards: {
            exp: 120,
            gold: 50,
            items: [],
        },
    },

    sq_goblin_gold: {
        id: 'sq_goblin_gold',
        name: '追回失窃黄金',
        emoji: '💰',
        type: QuestType.SIDE,
        description: '哥布林偷走了商人的金币。去讨回公道！',
        hint: '击败哥布林追回金币',
        requiredLevel: 10,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'goblin', target: 6, description: '击败哥布林 (0/6)' },
        ],
        rewards: {
            exp: 200,
            gold: 100,
            items: [],
        },
    },

    sq_skeleton_patrol: {
        id: 'sq_skeleton_patrol',
        name: '骷髅巡逻队',
        emoji: '💀',
        type: QuestType.SIDE,
        description: '骷髅战士在夜间巡逻，阻碍了旅行者的通行。清除巡逻的骷髅们。',
        hint: '在西部荒野击败骷髅战士',
        requiredLevel: 12,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'skeleton', target: 8, description: '击败骷髅战士 (0/8)' },
        ],
        rewards: {
            exp: 300,
            gold: 80,
            items: [],
        },
    },

    sq_troll_totems: {
        id: 'sq_troll_totems',
        name: '巨魔的图腾',
        emoji: '🗿',
        type: QuestType.SIDE,
        description: '学者想要研究巨魔的图腾文化。击败巨魔并带回图腾碎片。',
        hint: '在荆棘谷与巨魔战斗',
        requiredLevel: 30,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'troll', target: 6, description: '击败巨魔 (0/6)' },
        ],
        rewards: {
            exp: 500,
            gold: 200,
            items: [],
        },
    },

    sq_battle_hardened: {
        id: 'sq_battle_hardened',
        name: '百战老兵',
        emoji: '🏆',
        type: QuestType.SIDE,
        description: '真正的冒险者需要积累大量的战斗经验。赢得足够多的战斗来证明自己。',
        hint: '不断战斗并赢得胜利',
        requiredLevel: 5,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.WIN_BATTLES, target: 20, description: '赢得 20 场战斗' },
        ],
        rewards: {
            exp: 400,
            gold: 150,
            items: [],
        },
    },

    sq_level_milestone: {
        id: 'sq_level_milestone',
        name: '成长之路',
        emoji: '📈',
        type: QuestType.SIDE,
        description: '不断提升自己的实力，达到更高的等级。',
        hint: '持续战斗获取经验值',
        requiredLevel: 1,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.REACH_LEVEL, target: 20, description: '达到等级 20' },
        ],
        rewards: {
            exp: 500,
            gold: 200,
            items: [],
        },
    },

    // ═══════════════════════════════════════════
    // 日常任务 (Daily Quests) — 每日重置
    // ═══════════════════════════════════════════

    dq_daily_hunt: {
        id: 'dq_daily_hunt',
        name: '每日狩猎',
        emoji: '🎯',
        type: QuestType.DAILY,
        description: '猎人公会发布了每日狩猎任务。赢得几场战斗来获取报酬。',
        hint: '在任意地区进行战斗',
        requiredLevel: 1,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.WIN_BATTLES, target: 3, description: '赢得 3 场战斗' },
        ],
        rewards: {
            exp: 60,
            gold: 30,
            items: [],
        },
    },

    dq_wolf_control: {
        id: 'dq_wolf_control',
        name: '狼群控制',
        emoji: '🐺',
        type: QuestType.DAILY,
        description: '森林中的狼群需要定期清理，以保护村民的安全。',
        hint: '在艾尔文森林猎杀野狼',
        requiredLevel: 1,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'wolf', target: 2, description: '击败野狼 (0/2)' },
        ],
        rewards: {
            exp: 40,
            gold: 20,
            items: [],
        },
    },

    dq_skeleton_cleanup: {
        id: 'dq_skeleton_cleanup',
        name: '亡灵清扫',
        emoji: '💀',
        type: QuestType.DAILY,
        description: '西部荒野的骷髅永远不会消停。每日都需要清理一批。',
        hint: '在西部荒野击败骷髅战士',
        requiredLevel: 10,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.KILL, monsterId: 'skeleton', target: 3, description: '击败骷髅战士 (0/3)' },
        ],
        rewards: {
            exp: 80,
            gold: 40,
            items: [],
        },
    },

    dq_battle_practice: {
        id: 'dq_battle_practice',
        name: '战斗训练',
        emoji: '⚔️',
        type: QuestType.DAILY,
        description: '保持战斗力的最好方式就是每天练习。完成今日的训练任务。',
        hint: '赢得任意战斗',
        requiredLevel: 5,
        prerequisites: [],
        objectives: [
            { type: ObjectiveType.WIN_BATTLES, target: 5, description: '赢得 5 场战斗' },
        ],
        rewards: {
            exp: 100,
            gold: 50,
            items: [],
        },
    },
}

/**
 * 获取某类型的所有任务
 * @param {string} type - 任务类型
 * @returns {Array}
 */
export function getQuestsByType(type) {
    return Object.values(QuestDatabase).filter(q => q.type === type)
}

/**
 * 获取玩家等级对应的可用任务
 * @param {number} playerLevel
 * @param {string[]} completedQuestIds
 * @returns {Array}
 */
export function getAvailableQuests(playerLevel, completedQuestIds = []) {
    return Object.values(QuestDatabase).filter(q => {
        if (completedQuestIds.includes(q.id) && q.type !== QuestType.DAILY) return false
        if (q.requiredLevel > playerLevel) return false
        if (q.prerequisites && q.prerequisites.length > 0) {
            return q.prerequisites.every(preId => completedQuestIds.includes(preId))
        }
        return true
    })
}
