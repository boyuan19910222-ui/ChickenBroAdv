/**
 * @deprecated BroadcastEventBus 已不再用于战斗事件广播。
 * 保留 import 仅为兼容已有构造函数签名。
 */
import { BroadcastEventBus } from './BroadcastEventBus.js'
import { SeededRandom } from '../src/core/SeededRandom.js'
import { setRandom, getRandom } from '../src/core/RandomProvider.js'
import { PartyFormationSystem } from '../src/systems/PartyFormationSystem.js'
import {
    DungeonLootConfig,
    EquipmentDatabase,
    generateEquipment,
    QUALITY_ORDER,
    clampQuality,
    ClassArmorAffinity,
} from '../src/data/EquipmentData.js'

/**
 * 服务端战斗引擎 — 精简版（仅保留掉落计算）
 *
 * 重构说明:
 *   战斗模拟已迁移至客户端 DungeonCombatSystem（autoPlayMode），
 *   服务端不再运行回合制战斗循环。
 *   BattleEngine 现仅用于:
 *     1. 保存 party 数据（由 launchBattle 构建并注入）
 *     2. 接收客户端上报的战斗结果
 *     3. 为每个在线真人玩家生成个人掉落
 *
 *   旧版战斗模拟方法（_runBattleLoop, _processRound, _executeTurn 等）
 *   已移除。如需回退，请查看 git history。
 */

export class BattleEngine {
    /**
     * @param {import('socket.io').Server} io
     * @param {string} roomId
     * @param {Object} room - rooms.js 中的 room 对象
     * @param {Object} [options]
     */
    constructor(io, roomId, room, options = {}) {
        this.io = io
        this.roomId = roomId
        this.room = room

        this.seed = Date.now()
        this.rng = new SeededRandom(this.seed)

        this.party = []       // BattleUnit[] — 由外部注入
        this.finished = false
        this.result = null    // 'victory' | 'defeat'（由客户端上报设置）
    }

    // ────────────────────────────────────────────────────
    // Public API
    // ────────────────────────────────────────────────────

    /**
     * 获取在线玩家的 userId 列表（用于掉落分发）
     */
    getOnlinePlayerIds() {
        return this.party
            .filter(u => !u.isAI && u.isOnline)
            .map(u => u.ownerId)
    }

    // ────────────────────────────────────────────────────
    // Personal Loot
    // ────────────────────────────────────────────────────

    /**
     * 为房间内每个在线真人玩家独立生成掉落
     * @returns {Object<string, Object[]>} userId → items[]
     */
    generatePersonalLoot() {
        const lootResults = {}
        for (const unit of this.party) {
            if (!unit.isAI && unit.isOnline && unit.ownerId != null) {
                const playerSeed = this.seed + unit.ownerId
                const playerRng = new SeededRandom(playerSeed)
                const items = this._generateLootForPlayer(unit, playerRng)
                lootResults[unit.ownerId] = items
            }
        }
        return lootResults
    }

    /**
     * 为单个玩家生成掉落物品
     * @param {Object} unit
     * @param {SeededRandom} playerRng
     * @returns {Object[]} 装备物品列表
     */
    _generateLootForPlayer(unit, playerRng) {
        const prevRandom = getRandom()
        setRandom(playerRng)

        try {
            const dungeonId = this.room.dungeonId
            const config = DungeonLootConfig[dungeonId]

            if (!config) {
                return this._generateSimpleLoot(unit, playerRng)
            }

            const totalDrops = 1 + Math.floor(config.bossCount / 2)
            const results = []
            let remaining = totalDrops

            // 1. 专属掉落判定
            if (config.exclusiveDrops && config.exclusiveDrops.length > 0) {
                for (const excDrop of config.exclusiveDrops) {
                    if (remaining <= 1) break
                    if (playerRng.next() < excDrop.chance) {
                        const template = EquipmentDatabase[excDrop.templateId]
                        if (template) {
                            results.push({
                                ...template,
                                instanceId: `eq_${Date.now()}_${playerRng.next().toString(36).substr(2, 6)}`,
                                durability: template.durability ? { ...template.durability } : null,
                                stats: { ...template.stats },
                            })
                            remaining--
                        }
                    }
                }
            }

            // 2. 剩余用生成器补齐
            const playerLevel = unit.level || 1
            const classId = unit.classId || 'warrior'

            for (let i = 0; i < remaining; i++) {
                const quality = this._weightedQualityRoll(config.qualityWeights, playerRng)
                const cappedQuality = clampQuality(quality, 'epic')

                const [iLvlMin, iLvlMax] = config.iLvlOffset
                let iLvl = Math.max(1, config.recommendedLevelMax + playerRng.randomInt(iLvlMin, iLvlMax))
                const maxILvl = Math.floor((playerLevel + 3) / 0.6)
                iLvl = Math.min(iLvl, maxILvl)

                const { slot, armorType, weaponType, weaponHand } = this._randomSlotForPlayer(
                    classId, cappedQuality, playerRng
                )

                const item = generateEquipment({
                    slot, itemLevel: iLvl, quality: cappedQuality, armorType, weaponType, weaponHand,
                })
                results.push(item)
            }

            return results
        } finally {
            setRandom(prevRandom)
        }
    }

    /**
     * 简化掉落（无 DungeonLootConfig 时的兜底）
     */
    _generateSimpleLoot(unit, playerRng) {
        const count = 1 + (playerRng.chance(30) ? 1 : 0)
        const items = []
        for (let i = 0; i < count; i++) {
            items.push({
                id: `loot_${unit.id}_${i}`,
                name: `战利品 #${i + 1}`,
                quality: playerRng.chance(20) ? 'rare' : 'common',
                type: 'equipment',
            })
        }
        return items
    }

    /**
     * 加权品质随机
     */
    _weightedQualityRoll(weights, rng) {
        const entries = Object.entries(weights)
        const totalWeight = entries.reduce((s, [, w]) => s + w, 0)
        let roll = rng.next() * totalWeight
        for (const [quality, weight] of entries) {
            roll -= weight
            if (roll <= 0) return quality
        }
        return entries[entries.length - 1][0]
    }

    /**
     * 随机选择一个装备槽位并匹配甲种
     */
    _randomSlotForPlayer(classId, quality, rng) {
        const ARMOR_SLOTS = ['head', 'shoulders', 'chest', 'legs', 'hands', 'wrists', 'waist', 'feet', 'back']
        const ACCESSORY_SLOT_LIST = ['neck', 'finger1', 'finger2', 'trinket1', 'trinket2']
        const ALL_ARMOR_TYPES = ['cloth', 'leather', 'mail', 'plate']
        const CASTER_CLASSES = new Set(['mage', 'warlock', 'priest'])

        const MELEE_WEAPON_CONFIGS = [
            { weaponType: 'sword', weaponHand: 'one_hand' },
            { weaponType: 'sword', weaponHand: 'two_hand' },
            { weaponType: 'axe', weaponHand: 'one_hand' },
            { weaponType: 'mace', weaponHand: 'one_hand' },
            { weaponType: 'dagger', weaponHand: 'one_hand' },
        ]
        const CASTER_WEAPON_CONFIGS = [
            { weaponType: 'wand', weaponHand: 'one_hand' },
            { weaponType: 'staff', weaponHand: 'two_hand' },
            { weaponType: 'dagger', weaponHand: 'one_hand' },
        ]

        const categoryRoll = rng.next()
        let slot, armorType, weaponType, weaponHand

        if (categoryRoll < 0.60) {
            slot = rng.randomChoice(ARMOR_SLOTS)
            const affinity = ClassArmorAffinity[classId]
            if (affinity && rng.next() < 0.8) {
                armorType = affinity.primary
            } else {
                armorType = rng.randomChoice(ALL_ARMOR_TYPES)
            }
        } else if (categoryRoll < 0.85) {
            slot = 'mainHand'
            const weaponPool = CASTER_CLASSES.has(classId) ? CASTER_WEAPON_CONFIGS : MELEE_WEAPON_CONFIGS
            const wConfig = rng.randomChoice(weaponPool)
            weaponType = wConfig.weaponType
            weaponHand = wConfig.weaponHand
        } else {
            if (QUALITY_ORDER.indexOf(quality) < QUALITY_ORDER.indexOf('uncommon')) {
                slot = rng.randomChoice(ARMOR_SLOTS)
                const affinity = ClassArmorAffinity[classId]
                armorType = affinity ? affinity.primary : rng.randomChoice(ALL_ARMOR_TYPES)
            } else {
                slot = rng.randomChoice(ACCESSORY_SLOT_LIST)
            }
        }

        return { slot, armorType, weaponType, weaponHand }
    }
}
