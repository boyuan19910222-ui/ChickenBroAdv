import { DungeonRegistry } from '../src/data/dungeons/DungeonRegistry.js'

/**
 * 服务端波次生成器
 *
 * 在战斗启动时为多人副本一次性生成全部波次的敌人快照（EnemySnapshot[]），
 * 结果写入 battleState.waves[]，用于：
 *   1. battle:init 下发给所有客户端
 *   2. battle:restore 断线重连时恢复战场
 */

/**
 * @typedef {{ hp: number, damage: number, armor: number }} EnemyStats
 *
 * @typedef {{
 *   id: string,
 *   name: string,
 *   type: string,
 *   slot: number,
 *   emoji: string,
 *   stats: EnemyStats,
 *   speed: number,
 *   skills: object[]
 * }} EnemySnapshot
 *
 * @typedef {{
 *   waveId: string,
 *   type: 'trash' | 'boss',
 *   name: string,
 *   enemies: EnemySnapshot[]
 * }} Wave
 */

/**
 * 从指定副本生成所有波次快照.
 *
 * @param {string} dungeonId - 副本 ID（需在 DungeonRegistry 中注册且 dataModule 不为 null）
 * @returns {Promise<Wave[]>} 波次数组
 * @throws {Error} 若找不到副本、dataModule 为 null、或副本数据缺少 encounters
 */
export async function generateWaves(dungeonId) {
    const entry = DungeonRegistry[dungeonId]
    if (!entry || !entry.dataModule) {
        throw new Error(`[WaveGenerator] 副本 "${dungeonId}" 不存在或尚未实现 (dataModule 为空)`)
    }

    let dungeonData
    try {
        const mod = await entry.dataModule()
        dungeonData = mod.default || Object.values(mod).find(v => v?.id && v?.encounters)
    } catch (err) {
        throw new Error(`[WaveGenerator] 加载副本 "${dungeonId}" 数据失败: ${err.message}`)
    }

    if (!dungeonData || !Array.isArray(dungeonData.encounters) || dungeonData.encounters.length === 0) {
        throw new Error(`[WaveGenerator] 副本 "${dungeonId}" 缺少有效的 encounters 数组`)
    }

    return dungeonData.encounters.map(encounter => {
        const encounterData = dungeonData.getEncounter(encounter.id)
        if (!encounterData) {
            throw new Error(`[WaveGenerator] 副本 "${dungeonId}" 找不到遭遇战数据: "${encounter.id}"`)
        }

        let enemies
        if (encounter.type === 'boss') {
            // Boss encounter: 单个 Boss 对象，使用 baseStats 字段
            enemies = [{
                id: encounterData.id,
                name: encounterData.name,
                type: encounterData.type,
                slot: encounterData.slot ?? 2,
                emoji: encounterData.emoji,
                stats: {
                    hp: encounterData.baseStats.hp,
                    damage: encounterData.baseStats.damage,
                    armor: encounterData.baseStats.armor,
                },
                speed: encounterData.speed,
                // boss.skills 是字典（id→配置），转为数组
                skills: encounterData.skills ? Object.values(encounterData.skills) : [],
            }]
        } else {
            // Trash encounter: encounters[].enemies 数组
            enemies = (encounterData.enemies || []).map(e => ({
                id: e.id,
                name: e.name,
                type: e.type,
                slot: e.slot,
                emoji: e.emoji,
                stats: {
                    hp: e.stats.hp,
                    damage: e.stats.damage,
                    armor: e.stats.armor,
                },
                speed: e.speed,
                skills: e.skills || [],
            }))
        }

        return {
            waveId: encounter.id,
            type: encounter.type,
            name: encounter.name,
            enemies,
        }
    })
}
