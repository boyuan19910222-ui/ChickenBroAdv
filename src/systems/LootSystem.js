/**
 * LootSystem - 统一掉落系统
 * 
 * 职责:
 * - 野外战斗装备掉落判定 (rollWorldLoot)
 * - 副本通关装备奖励 (rollDungeonReward)
 * - 等级差惩罚
 * - 品质上限约束
 * - 甲种智能匹配
 */

import {
    EQUIPMENT_SLOTS,
    SLOT_IDS,
    QualityConfig,
    QUALITY_ORDER,
    ACCESSORY_SLOTS,
    clampQuality,
    ClassArmorAffinity,
    AreaLootConfig,
    MonsterLootOverrides,
    DungeonLootConfig,
    EquipmentDatabase,
    generateEquipment,
} from '@/data/EquipmentData.js'

import { GameData } from '@/data/GameData.js'
import { random, randomInt, randomChoice } from '@/core/RandomProvider.js'

// 所有甲种列表（用于 20% 随机）
const ALL_ARMOR_TYPES = ['cloth', 'leather', 'mail', 'plate']

// 可生成装备的护甲槽位
const ARMOR_SLOTS = ['head', 'shoulders', 'chest', 'legs', 'hands', 'wrists', 'waist', 'feet', 'back']

// 可生成的武器配置（按职业类型分组）
const MELEE_WEAPON_CONFIGS = [
    { weaponType: 'sword', weaponHand: 'one_hand' },
    { weaponType: 'sword', weaponHand: 'two_hand' },
    { weaponType: 'axe', weaponHand: 'one_hand' },
    { weaponType: 'axe', weaponHand: 'two_hand' },
    { weaponType: 'mace', weaponHand: 'one_hand' },
    { weaponType: 'mace', weaponHand: 'two_hand' },
    { weaponType: 'dagger', weaponHand: 'one_hand' },
    { weaponType: 'staff', weaponHand: 'two_hand' },
    { weaponType: 'bow', weaponHand: 'two_hand' },
]

const CASTER_WEAPON_CONFIGS = [
    { weaponType: 'wand', weaponHand: 'one_hand' },
    { weaponType: 'staff', weaponHand: 'two_hand' },
    { weaponType: 'dagger', weaponHand: 'one_hand' },
    { weaponType: 'mace', weaponHand: 'one_hand' },
]

// 法系职业集合
const CASTER_CLASSES = new Set(['mage', 'warlock', 'priest'])

// 饰品类槽位（用于生成随机槽位）
const ACCESSORY_SLOT_LIST = ['neck', 'finger1', 'finger2', 'trinket1', 'trinket2']

export default class LootSystem {
    constructor() {
        this.engine = null
    }

    init(engine) {
        this.engine = engine
        this.setupEventListeners()
    }

    setupEventListeners() {
        // 野外战斗胜利 → 装备掉落
        this.engine.eventBus.on('combat:victory', (data) => {
            if (data.enemy) {
                this.handleWorldDrop(data.enemy)
            }
        })

        // 副本通关 → 装备奖励（多人模式由服务端统一结算，跳过本地生成）
        this.engine.eventBus.on('dungeon:complete', (data) => {
            if (data.isMultiplayer) return
            if (data.dungeon) {
                this.handleDungeonReward(data.dungeon)
            }
        })
    }

    // ==================== 野外掉落 ====================

    /**
     * 处理野外战斗装备掉落
     */
    handleWorldDrop(enemy) {
        const player = this.engine.stateManager.get('player')
        if (!player) return

        const areaId = this._getMonsterAreaId(enemy.id)
        const items = this.rollWorldLoot(enemy, player, areaId)

        for (const item of items) {
            this._giveItemToPlayer(player, item)
        }
    }

    /**
     * 野外掉落判定
     * @param {Object} enemy - 怪物数据
     * @param {Object} player - 玩家数据
     * @param {string} areaId - 区域 ID
     * @returns {Object[]} 掉落的装备列表
     */
    rollWorldLoot(enemy, player, areaId) {
        const monsterLevel = enemy.level || 1
        const playerLevel = player.level || 1

        // 等级差惩罚
        const penalty = this.applyLevelPenalty(playerLevel, monsterLevel)
        if (penalty.dropChanceMultiplier <= 0) return []

        // 获取掉落配置（怪物覆写 > 区域默认）
        const areaConfig = AreaLootConfig[areaId] || AreaLootConfig.elwynnForest
        const monsterOverride = MonsterLootOverrides[enemy.id]
        const config = {
            ...areaConfig,
            ...(monsterOverride || {}),
        }

        // dropChance 判定
        const effectiveChance = config.dropChance * penalty.dropChanceMultiplier
        if (random() >= effectiveChance) return []

        // 品质上限：野外最高 rare，叠加等级差惩罚
        const worldCap = 'rare'
        const effectiveCap = clampQuality(worldCap, penalty.qualityCap)

        // 品质随机
        let quality = this._weightedQualityRoll(config.qualityWeights)
        quality = clampQuality(quality, effectiveCap)

        // iLvl 计算：基于怪物等级 + 偏移，但限制 requiredLevel 不超过 playerLevel + 2
        const [iLvlMin, iLvlMax] = config.iLvlOffset
        let iLvl = Math.max(1, monsterLevel + this._randInt(iLvlMin, iLvlMax))
        // requiredLevel = floor(iLvl * 0.6)，所以 iLvl 上限 = floor((playerLevel + 2) / 0.6)
        const maxILvl = Math.floor((playerLevel + 2) / 0.6)
        iLvl = Math.min(iLvl, maxILvl)

        // 随机槽位 + 甲种匹配
        const { slot, armorType, weaponType, weaponHand } = this._randomSlotForPlayer(player, quality)

        // 生成装备
        const item = generateEquipment({
            slot, itemLevel: iLvl, quality, armorType, weaponType, weaponHand,
        })

        return [item]
    }

    // ==================== 副本掉落 ====================

    /**
     * 处理副本通关奖励
     */
    handleDungeonReward(dungeon) {
        const player = this.engine.stateManager.get('player')
        if (!player) return

        const items = this.rollDungeonReward(dungeon.id || dungeon.dungeonId, player)

        for (const item of items) {
            this._giveItemToPlayer(player, item)
        }

        if (items.length > 0) {
            this.engine.eventBus.emit('system:log', {
                message: `🏆 通关奖励: 获得 ${items.length} 件装备！`,
                type: 'loot',
            })
        }
    }

    /**
     * 副本通关奖励判定
     * @param {string} dungeonId - 副本 ID
     * @param {Object} player - 玩家数据
     * @returns {Object[]} 掉落的装备列表
     */
    rollDungeonReward(dungeonId, player) {
        const config = DungeonLootConfig[dungeonId]
        if (!config) {
            console.warn(`[LootSystem] No loot config for dungeon: ${dungeonId}`)
            return []
        }

        const totalDrops = 1 + Math.floor(config.bossCount / 2)
        const results = []
        let remaining = totalDrops

        // 1. 专属掉落判定（最多占 totalDrops - 1）
        if (config.exclusiveDrops && config.exclusiveDrops.length > 0) {
            for (const excDrop of config.exclusiveDrops) {
                if (remaining <= 1) break // 保留至少 1 个给生成器
                if (random() < excDrop.chance) {
                    const template = EquipmentDatabase[excDrop.templateId]
                    if (template) {
                        results.push({
                            ...template,
                            instanceId: `eq_${Date.now()}_${random().toString(36).substr(2, 6)}`,
                            durability: template.durability ? { ...template.durability } : null,
                            stats: { ...template.stats },
                        })
                        remaining--
                    }
                }
            }
        }

        // 2. 剩余用生成器补齐
        for (let i = 0; i < remaining; i++) {
            const quality = this._weightedQualityRoll(config.qualityWeights)
            // 副本品质上限 epic（legendary 仅从 exclusiveDrops）
            const cappedQuality = clampQuality(quality, 'epic')

            const [iLvlMin, iLvlMax] = config.iLvlOffset
            const playerLevel = player.level || 1
            let iLvl = Math.max(1, config.recommendedLevelMax + this._randInt(iLvlMin, iLvlMax))
            // 限制 requiredLevel 不超过 playerLevel + 3（副本允许稍微高一点）
            const maxILvl = Math.floor((playerLevel + 3) / 0.6)
            iLvl = Math.min(iLvl, maxILvl)

            const { slot, armorType, weaponType, weaponHand } = this._randomSlotForPlayer(player, cappedQuality)

            const item = generateEquipment({
                slot, itemLevel: iLvl, quality: cappedQuality, armorType, weaponType, weaponHand,
            })
            results.push(item)
        }

        return results
    }

    // ==================== 等级差惩罚 ====================

    /**
     * 计算等级差惩罚
     * @returns {{ dropChanceMultiplier: number, qualityCap: string }}
     */
    applyLevelPenalty(playerLevel, monsterLevel) {
        const diff = playerLevel - monsterLevel

        if (diff > 15) {
            return { dropChanceMultiplier: 0, qualityCap: 'poor' }
        }
        if (diff > 10) {
            return { dropChanceMultiplier: 0.5, qualityCap: 'common' }
        }
        if (diff > 5) {
            return { dropChanceMultiplier: 1.0, qualityCap: 'common' }
        }
        return { dropChanceMultiplier: 1.0, qualityCap: 'legendary' }
    }

    // ==================== 内部工具方法 ====================

    /**
     * 根据怪物 ID 查找所在区域
     */
    _getMonsterAreaId(monsterId) {
        const areas = GameData.areas
        for (const [areaId, area] of Object.entries(areas)) {
            if (area.monsters && area.monsters.includes(monsterId)) {
                return areaId
            }
        }
        return 'elwynnForest' // 兜底
    }

    /**
     * 随机选择一个装备槽位并匹配甲种
     * 80% 匹配玩家职业最高甲种 / 20% 随机
     */
    _randomSlotForPlayer(player, quality) {
        // 随机决定装备大类：60% 护甲，25% 武器，15% 饰品
        const categoryRoll = random()
        let slot, armorType, weaponType, weaponHand

        if (categoryRoll < 0.60) {
            // 护甲
            slot = randomChoice(ARMOR_SLOTS)
            armorType = this._pickArmorType(player)
        } else if (categoryRoll < 0.85) {
            // 武器（根据职业选择合适的武器池）
            slot = 'mainHand'
            const classId = player.class || 'warrior'
            const weaponPool = CASTER_CLASSES.has(classId) ? CASTER_WEAPON_CONFIGS : MELEE_WEAPON_CONFIGS
            const wConfig = randomChoice(weaponPool)
            weaponType = wConfig.weaponType
            weaponHand = wConfig.weaponHand
        } else {
            // 饰品类
            // 饰品只能是 uncommon+，如果品质太低则回退到护甲
            if (QUALITY_ORDER.indexOf(quality) < QUALITY_ORDER.indexOf('uncommon')) {
                slot = randomChoice(ARMOR_SLOTS)
                armorType = this._pickArmorType(player)
            } else {
                slot = randomChoice(ACCESSORY_SLOT_LIST)
            }
        }

        return { slot, armorType, weaponType, weaponHand }
    }

    /**
     * 选择甲种：80% 玩家职业最高甲种，20% 随机
     */
    _pickArmorType(player) {
        const classId = player.class || 'warrior'
        const affinity = ClassArmorAffinity[classId]

        if (!affinity) return randomChoice(ALL_ARMOR_TYPES)

        if (random() < 0.8) {
            return affinity.primary
        }
        return randomChoice(ALL_ARMOR_TYPES)
    }

    /**
     * 加权品质随机
     */
    _weightedQualityRoll(weights) {
        const entries = Object.entries(weights)
        const totalWeight = entries.reduce((s, [, w]) => s + w, 0)
        let roll = random() * totalWeight
        for (const [quality, weight] of entries) {
            roll -= weight
            if (roll <= 0) return quality
        }
        return entries[entries.length - 1][0]
    }

    /**
     * 将装备给予玩家（加入背包）
     */
    _giveItemToPlayer(player, item) {
        if (!player.inventory) player.inventory = []

        const bagCapacity = 40 // BAG_CAPACITY
        const currentCount = player.inventory.filter(i => i && i.type === 'equipment').length
            + player.inventory.filter(i => i && i.type !== 'equipment').length

        if (player.inventory.length >= bagCapacity) {
            this.engine.eventBus.emit('system:log', {
                message: `📦 ${item.name} 掉落了，但背包已满！`,
                type: 'warning',
            })
            return
        }

        player.inventory.push(item)
        this.engine.stateManager.set('player', player)

        const qualityCfg = QualityConfig[item.quality]
        this.engine.eventBus.emit('loot:log',
            `${qualityCfg?.emoji || '📦'} ${item.name} (iLvl ${item.itemLevel}) — 装备掉落`
        )
        this.engine.eventBus.emit('equipment:dropped', { item })
    }

    /**
     * 随机整数 [min, max]
     */
    _randInt(min, max) {
        return randomInt(min, max)
    }
}
