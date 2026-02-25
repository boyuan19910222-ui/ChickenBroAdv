/**
 * 副本注册表 - 所有副本的元数据索引
 * 
 * 副本选择 UI 直接读取此文件，通过 dataModule 懒加载副本战斗数据。
 * dataModule 为 null 表示该副本尚未实现（UI 显示"开发中"）。
 */

export const DungeonRegistry = {
    // ==================== 低级副本 (Lv 13-32) ====================
    ragefire_chasm: {
        id: 'ragefire_chasm',
        name: '怒焰裂谷',
        emoji: '🔥',
        description: '奥格瑞玛城下的火焰洞穴，被邪恶的巨魔术士和他们的恶魔仆从占据。',
        levelRange: { min: 13, max: 18 },
        unlockLevel: 13,
        bossCount: 4,
        estimatedTime: '10分钟',
        type: 'standard',
        dataModule: () => import('./RagefireChasm.js'),
    },

    deadmines: {
        id: 'deadmines',
        name: '死亡矿井',
        emoji: '⛏️',
        description: '西部荒野的矿井深处，迪菲亚兄弟会在此秘密建造战舰。',
        levelRange: { min: 17, max: 26 },
        unlockLevel: 17,
        bossCount: 5,
        estimatedTime: '15分钟',
        type: 'standard',
        dataModule: () => import('./Deadmines.js'),
    },

    wailing_caverns: {
        id: 'wailing_caverns',
        name: '哀嚎洞穴',
        emoji: '🐍',
        description: '贫瘠之地深处的洞穴，被变异的德鲁伊和毒蛇占据。',
        levelRange: { min: 17, max: 24 },
        unlockLevel: 17,
        bossCount: 1,
        estimatedTime: '8分钟',
        type: 'standard',
        dataModule: () => import('./WailingCaverns.js'),
    },

    shadowfang_keep: {
        id: 'shadowfang_keep',
        name: '影牙城堡',
        emoji: '🏰',
        description: '银松森林中阴森的城堡，被狼人领主和亡灵巫师占据。',
        levelRange: { min: 22, max: 30 },
        unlockLevel: 22,
        bossCount: 5,
        estimatedTime: '15分钟',
        type: 'standard',
        dataModule: () => import('./ShadowfangKeep.js'),
    },

    stormwind_stockade: {
        id: 'stormwind_stockade',
        name: '暴风城监狱',
        emoji: '🔒',
        description: '暴风城地下监狱，暴动的囚犯已控制了这里。',
        levelRange: { min: 24, max: 32 },
        unlockLevel: 24,
        bossCount: 3,
        estimatedTime: '8分钟',
        type: 'standard',
        dataModule: () => import('./StormwindStockade.js'),
    },

    // ==================== 中级副本 (Lv 29-55) ====================
    gnomeregan: {
        id: 'gnomeregan',
        name: '诺莫瑞根',
        emoji: '⚙️',
        description: '侏儒族的地下首都，被辐射废料和叛变的机械装置占据。',
        levelRange: { min: 29, max: 38 },
        unlockLevel: 29,
        bossCount: 4,
        estimatedTime: '15分钟',
        type: 'standard',
        dataModule: () => import('./Gnomeregan.js'),
    },

    razorfen_kraul: {
        id: 'razorfen_kraul',
        name: '剃刀沼泽',
        emoji: '🐗',
        description: '贫瘠之地南部的野猪人巢穴，被邪恶的巫师统治。',
        levelRange: { min: 29, max: 38 },
        unlockLevel: 29,
        bossCount: 4,
        estimatedTime: '12分钟',
        type: 'standard',
        dataModule: () => import('./RazorfenKraul.js'),
    },

    scarlet_monastery: {
        id: 'scarlet_monastery',
        name: '血色修道院',
        emoji: '✝️',
        description: '血色十字军的要塞，狂热的教徒在此顽固抵抗亡灵天灾。',
        levelRange: { min: 28, max: 44 },
        unlockLevel: 28,
        type: 'multi-wing',
        estimatedTime: '每翼8-12分钟',
        wings: [
            { id: 'sm_graveyard', name: '墓地', emoji: '☠️', levelRange: { min: 28, max: 38 }, unlockLevel: 28, bossCount: 1, estimatedTime: '8分钟', dataModule: () => import('./ScarletMonastery_GY.js') },
            { id: 'sm_library', name: '图书馆', emoji: '📚', levelRange: { min: 33, max: 40 }, unlockLevel: 33, bossCount: 2, estimatedTime: '10分钟', dataModule: () => import('./ScarletMonastery_Lib.js') },
            { id: 'sm_armory', name: '军械库', emoji: '🗡️', levelRange: { min: 36, max: 42 }, unlockLevel: 36, bossCount: 1, estimatedTime: '8分钟', dataModule: () => import('./ScarletMonastery_Arm.js') },
            { id: 'sm_cathedral', name: '大教堂', emoji: '⛪', levelRange: { min: 38, max: 44 }, unlockLevel: 38, bossCount: 2, estimatedTime: '12分钟', dataModule: () => import('./ScarletMonastery_Cath.js') },
        ],
    },

    zulfarrak: {
        id: 'zulfarrak',
        name: '祖尔法拉克',
        emoji: '🏜️',
        description: '塔纳利斯沙漠中的巨魔神殿，沙漠巨魔在此举行血腥仪式。',
        levelRange: { min: 44, max: 54 },
        unlockLevel: 44,
        bossCount: 5,
        estimatedTime: '15分钟',
        type: 'standard',
        dataModule: () => import('./ZulFarrak.js'),
    },

    maraudon: {
        id: 'maraudon',
        name: '玛拉顿',
        emoji: '🌿',
        description: '凄凉之地深处的地下洞穴，远古元素力量在此汇聚。',
        levelRange: { min: 46, max: 55 },
        unlockLevel: 46,
        bossCount: 5,
        estimatedTime: '15分钟',
        type: 'standard',
        dataModule: () => import('./Maraudon.js'),
    },

    // ==================== 高级副本 (Lv 50-60) ====================
    sunken_temple: {
        id: 'sunken_temple',
        name: '阿塔哈卡神庙',
        emoji: '🐲',
        description: '悲伤沼泽中沉没的古神殿，供奉着血神哈卡的邪恶信徒。',
        levelRange: { min: 50, max: 56 },
        unlockLevel: 50,
        bossCount: 5,
        estimatedTime: '15分钟',
        type: 'standard',
        dataModule: () => import('./SunkenTemple.js'),
    },

    blackrock_spire: {
        id: 'blackrock_spire',
        name: '黑石塔',
        emoji: '🌋',
        description: '黑石山中的巨大堡垒，黑铁矮人和黑龙军团在此盘踞。',
        levelRange: { min: 55, max: 60 },
        unlockLevel: 55,
        type: 'multi-wing',
        estimatedTime: '每层15-20分钟',
        wings: [
            { id: 'brs_lower', name: '下层', emoji: '⬇️', levelRange: { min: 55, max: 60 }, unlockLevel: 55, bossCount: 6, estimatedTime: '18分钟', dataModule: () => import('./BlackrockSpire_Lower.js') },
            { id: 'brs_upper', name: '上层', emoji: '⬆️', levelRange: { min: 58, max: 60 }, unlockLevel: 58, bossCount: 5, estimatedTime: '15分钟', dataModule: () => import('./BlackrockSpire_Upper.js') },
        ],
    },

    stratholme: {
        id: 'stratholme',
        name: '斯坦索姆',
        emoji: '💀',
        description: '被天灾军团摧毁的洛丹伦城市，如今已成为亡灵横行的鬼城。',
        levelRange: { min: 58, max: 60 },
        unlockLevel: 58,
        bossCount: 6,
        estimatedTime: '18分钟',
        type: 'standard',
        dataModule: () => import('./Stratholme.js'),
    },

    scholomance: {
        id: 'scholomance',
        name: '通灵学院',
        emoji: '📖',
        description: '西瘟疫之地的巨大学院，天灾军团在此培训亡灵巫师。',
        levelRange: { min: 58, max: 60 },
        unlockLevel: 58,
        bossCount: 6,
        estimatedTime: '18分钟',
        type: 'standard',
        dataModule: () => import('./Scholomance.js'),
    },

    dire_maul: {
        id: 'dire_maul',
        name: '厄运之槌',
        emoji: '🏛️',
        description: '菲拉斯的上古精灵废墟，如今被食人魔和恶魔占据。',
        levelRange: { min: 56, max: 60 },
        unlockLevel: 56,
        bossCount: 5,
        estimatedTime: '15分钟',
        type: 'standard',
        dataModule: () => import('./DireMaul.js'),
    },
}

/**
 * 获取按解锁等级排序的副本列表
 * @returns {Array} 排序后的副本条目
 */
export function getSortedDungeonList() {
    return Object.values(DungeonRegistry).sort((a, b) => {
        const aLevel = a.unlockLevel || a.levelRange?.min || 0
        const bLevel = b.unlockLevel || b.levelRange?.min || 0
        return aLevel - bLevel
    })
}

/**
 * 获取副本的状态
 * @param {string} dungeonId - 副本ID或翼ID
 * @param {number} playerLevel - 玩家等级
 * @param {Set} clearedDungeons - 已通关副本ID集合
 * @returns {'locked'|'available'|'cleared'|'developing'}
 */
export function getDungeonStatus(dungeonId, playerLevel, clearedDungeons = new Set()) {
    // 在注册表中查找（包括翼/层）
    const entry = DungeonRegistry[dungeonId]
    let unlockLevel, dataModule

    if (entry) {
        unlockLevel = entry.unlockLevel || entry.levelRange?.min || 1
        dataModule = entry.type === 'multi-wing' ? true : entry.dataModule
    } else {
        // 查找翼/层
        for (const dungeon of Object.values(DungeonRegistry)) {
            if (dungeon.type === 'multi-wing' && dungeon.wings) {
                const wing = dungeon.wings.find(w => w.id === dungeonId)
                if (wing) {
                    unlockLevel = wing.unlockLevel || wing.levelRange?.min || 1
                    dataModule = wing.dataModule
                    break
                }
            }
        }
    }

    if (unlockLevel === undefined) return 'developing'

    // 未实现的副本
    if (dataModule === null || dataModule === undefined) return 'developing'

    // 等级不足
    if (playerLevel < unlockLevel) return 'locked'

    // 已通关
    if (clearedDungeons.has(dungeonId)) return 'cleared'

    return 'available'
}
