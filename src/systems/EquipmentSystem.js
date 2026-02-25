/**
 * EquipmentSystem - 装备系统（16 槽位重构版）
 * 管理装备的穿戴、卸下、耐久度、套装效果、属性计算
 * 新增：weaponHand 校验、双持、双手互斥、唯一性、护甲值、物理减伤
 */
import { GameData } from '../data/GameData.js'
import { randomInt } from '../core/RandomProvider.js'
import {
    ItemQuality,
    QualityConfig,
    EQUIPMENT_SLOTS,
    SLOT_IDS,
    WeaponSlotMap,
    DurabilityConfig,
    SetBonuses,
    EquipmentDatabase,
    EquipmentCategory,
    ArmorCoefficients,
    ARMOR_REDUCTION_K_LEVEL,
    ARMOR_REDUCTION_K_BASE,
    ARMOR_REDUCTION_CAP,
    BAG_CAPACITY,
    INNATE_DUAL_WIELD_CLASSES,
    rollEquipmentDrop,
} from '../data/EquipmentData.js'

export class EquipmentSystem {
    constructor() {
        this.engine = null
    }

    init(engine) {
        this.engine = engine
        this.setupEventListeners()
    }

    setupEventListeners() {
        // 装备掉落已由 LootSystem 接管，此处不再监听 combat:victory

        this.engine.eventBus.on('combat:roundEnd', () => {
            this.degradeDurability()
        })
    }

    // ==================== 装备穿戴 ====================

    /**
     * 检查物品是否可以装备到指定槽位
     * 支持 16 槽位验证、weaponHand 分组校验、副手/盾牌职业限制、
     * 披风通用、唯一性检查
     */
    canEquip(player, item, slot) {
        if (!item || item.type !== 'equipment') {
            return { canEquip: false, reason: '该物品不是装备' }
        }

        // 等级检查
        if (item.requiredLevel && player.level < item.requiredLevel) {
            return { canEquip: false, reason: `需要等级 ${item.requiredLevel}（当前 ${player.level}）` }
        }

        // 槽位存在性检查
        const slotDef = EQUIPMENT_SLOTS[slot]
        if (!slotDef) {
            return { canEquip: false, reason: '无效的装备槽位' }
        }

        const classData = GameData.classes[player.class]
        if (!classData) {
            return { canEquip: false, reason: '无效的职业' }
        }

        // ---- 护甲类装备 ----
        if (item.armorType && item.category === 'armor') {
            // 披风特殊处理：通用不限职业护甲类型（Task 2.9）
            if (item.slot !== 'back') {
                if (!classData.armorTypes || !classData.armorTypes.includes(item.armorType)) {
                    return { canEquip: false, reason: `${classData.name}无法穿戴此护甲类型` }
                }
            }
            // 护甲只能放到对应槽位
            if (item.slot !== slot) {
                return { canEquip: false, reason: `该护甲应装备在${EQUIPMENT_SLOTS[item.slot]?.label || item.slot}` }
            }
        }

        // ---- 武器类装备 ----
        if (item.weaponType && item.category === 'weapon') {
            // weaponHand 分组校验（Task 2.1）
            const weaponTypes = classData.weaponTypes
            if (weaponTypes && typeof weaponTypes === 'object' && !Array.isArray(weaponTypes)) {
                const hand = item.weaponHand
                if (hand === 'one_hand') {
                    if (!weaponTypes.oneHand || !weaponTypes.oneHand.includes(item.weaponType)) {
                        return { canEquip: false, reason: `${classData.name}无法使用此单手武器` }
                    }
                } else if (hand === 'two_hand') {
                    if (!weaponTypes.twoHand || !weaponTypes.twoHand.includes(item.weaponType)) {
                        return { canEquip: false, reason: `${classData.name}无法使用此双手武器` }
                    }
                }
            } else if (Array.isArray(weaponTypes)) {
                // 向后兼容旧格式
                if (!weaponTypes.includes(item.weaponType)) {
                    return { canEquip: false, reason: `${classData.name}无法使用此武器类型` }
                }
            }

            // 武器槽位映射检查
            const allowedSlots = WeaponSlotMap[item.weaponType]
            if (allowedSlots && !allowedSlots.includes(slot)) {
                return { canEquip: false, reason: `该武器不能装备在${EQUIPMENT_SLOTS[slot]?.label}` }
            }

            // 副手武器需要双持能力检查（Task 2.2）
            if (slot === 'offHand' && item.weaponHand === 'one_hand') {
                if (!this.canDualWield(player)) {
                    return { canEquip: false, reason: '你不具备双持能力' }
                }
            }
        }

        // ---- 盾牌 ----
        if (item.category === 'shield') {
            if (!classData.canUseShield) {
                return { canEquip: false, reason: `${classData.name}无法使用盾牌` }
            }
            if (slot !== 'offHand') {
                return { canEquip: false, reason: '盾牌只能装备在副手' }
            }
        }

        // ---- 副手物品 ----
        if (item.category === 'offhand') {
            if (!classData.canUseOffhand) {
                return { canEquip: false, reason: `${classData.name}无法使用副手物品` }
            }
            if (slot !== 'offHand') {
                return { canEquip: false, reason: '副手物品只能装备在副手' }
            }
        }

        // ---- 饰品类 ----
        if (item.category === 'accessory') {
            // 允许戒指放在 finger1 或 finger2，饰品放在 trinket1 或 trinket2
            const itemSlot = item.slot
            if (itemSlot === 'finger1' || itemSlot === 'finger2') {
                if (slot !== 'finger1' && slot !== 'finger2') {
                    return { canEquip: false, reason: '戒指只能装备在戒指槽' }
                }
            } else if (itemSlot === 'trinket1' || itemSlot === 'trinket2') {
                if (slot !== 'trinket1' && slot !== 'trinket2') {
                    return { canEquip: false, reason: '饰品只能装备在饰品槽' }
                }
            } else if (itemSlot !== slot) {
                return { canEquip: false, reason: `该饰品应装备在${EQUIPMENT_SLOTS[itemSlot]?.label || itemSlot}` }
            }
        }

        // ---- 装备唯一性检查（Task 2.4）----
        if (item.unique) {
            for (const s of SLOT_IDS) {
                const equipped = player.equipment[s]
                if (equipped && equipped.id === item.id) {
                    return { canEquip: false, reason: `唯一装备：${item.name}已经装备` }
                }
            }
        }

        return { canEquip: true }
    }

    /**
     * 检查角色是否具备双持能力（Task 2.2）
     * 战士/盗贼/猎人天生 true，萨满需检查 dualWield 天赋
     */
    canDualWield(player) {
        if (INNATE_DUAL_WIELD_CLASSES.includes(player.class)) {
            return true
        }
        // 萨满通过增强天赋解锁
        if (player.class === 'shaman' && player.talents) {
            if (player.talents.enhancement?.dualWield && player.talents.enhancement.dualWield > 0) {
                return true
            }
        }
        return false
    }

    /**
     * 装备物品（含双手武器互斥逻辑 Task 2.3）
     * 原子操作：穿双手→自动卸 offHand；穿 offHand→如 mainHand 是双手则自动卸 mainHand
     */
    equipItem(player, item, slot) {
        const check = this.canEquip(player, item, slot)
        if (!check.canEquip) {
            return { success: false, reason: check.reason }
        }

        // 计算需要的额外背包空间
        let extraSlotsNeeded = 0
        const currentInSlot = player.equipment[slot]
        let autoUnequipSlot = null  // 互斥自动卸下的槽位

        // 双手武器互斥逻辑（Task 2.3）
        if (item.weaponHand === 'two_hand' && slot === 'mainHand') {
            // 穿双手武器 → 检查 offHand
            if (player.equipment.offHand) {
                autoUnequipSlot = 'offHand'
                extraSlotsNeeded++
            }
        }
        if (slot === 'offHand') {
            // 穿副手 → 检查 mainHand 是否双手
            const mainHandItem = player.equipment.mainHand
            if (mainHandItem && mainHandItem.weaponHand === 'two_hand') {
                autoUnequipSlot = 'mainHand'
                extraSlotsNeeded++
            }
        }

        // 如果被替换的装备存在，也要一个空间（但它会替换物品，不需要额外空间）
        // 从背包取出 item 会释放一格，装上替换的会占一格，净效果为 0
        // 但互斥自动卸下的需要额外空间
        const inventoryCount = this.getInventoryCount(player)
        // 从背包取出 item 腾出 1 格（如果 item 在背包中）
        const itemInInventory = this._isInInventory(player, item) ? 1 : 0
        const currentOccupied = currentInSlot ? 1 : 0  // 被替换的回背包占 1 格
        const netChange = extraSlotsNeeded + currentOccupied - itemInInventory

        if (inventoryCount + netChange > BAG_CAPACITY) {
            return { success: false, reason: '背包已满，无法完成装备操作' }
        }

        // ---- 执行装备操作（原子性）----
        
        // 1. 从背包移除要装备的物品
        this.removeFromInventory(player, item)

        // 2. 处理互斥自动卸下
        if (autoUnequipSlot) {
            const autoItem = player.equipment[autoUnequipSlot]
            if (autoItem) {
                player.equipment[autoUnequipSlot] = null
                this.addToInventory(player, autoItem)
            }
        }

        // 3. 处理被替换的装备
        const unequippedItem = player.equipment[slot]
        if (unequippedItem) {
            this.addToInventory(player, unequippedItem)
        }

        // 4. 装备新物品
        player.equipment[slot] = item

        this._saveAndNotify(player, 'equipment:changed', {
            slot,
            newItem: item,
            oldItem: unequippedItem,
            autoUnequipped: autoUnequipSlot ? { slot: autoUnequipSlot } : null,
        })

        return { success: true, unequippedItem }
    }

    /**
     * 卸下装备
     */
    unequipItem(player, slot) {
        const item = player.equipment[slot]
        if (!item) {
            return { success: false, reason: '该槽位没有装备' }
        }

        if (this.getInventoryCount(player) >= BAG_CAPACITY) {
            return { success: false, reason: '背包已满，无法卸下装备' }
        }

        player.equipment[slot] = null
        this.addToInventory(player, item)

        this._saveAndNotify(player, 'equipment:removed', { slot, item })

        return { success: true, unequippedItem: item }
    }

    // ==================== 副手伤害惩罚（Task 2.5）====================

    /**
     * 获取副手武器伤害（50% 惩罚）
     * @param {number} rolledDamage - 骰出的原始伤害
     * @returns {number} 惩罚后的伤害
     */
    getOffHandDamage(rolledDamage) {
        return Math.floor(rolledDamage * 0.5)
    }

    /**
     * 根据武器 damage 范围随机出伤害值
     * @param {Object} weapon - 武器物品
     * @returns {number} 随机伤害值
     */
    rollWeaponDamage(weapon) {
        if (!weapon || !weapon.damage) return 0
        const { min, max } = weapon.damage
        return min + randomInt(0, max - min)
    }

    // ==================== 护甲值与物理减伤（Tasks 2.6, 2.7）====================

    /**
     * 计算角色总护甲值（Task 2.6）
     * 累加所有已装备物品的 armorValue
     */
    getTotalArmor(player) {
        let total = 0
        for (const slot of SLOT_IDS) {
            const item = player.equipment[slot]
            if (!item || !item.armorValue) continue
            // 耐久度为 0 不提供护甲
            if (item.durability && item.durability.current <= 0) continue
            total += item.armorValue
        }
        return total
    }

    /**
     * 计算物理减伤百分比（Task 2.7）
     * reduction% = totalArmor / (totalArmor + 85 × attackerLevel + 400)
     * 减伤上限 75%
     */
    getPhysicalReduction(totalArmor, attackerLevel) {
        if (totalArmor <= 0 || attackerLevel <= 0) return 0
        const reduction = totalArmor / (totalArmor + ARMOR_REDUCTION_K_LEVEL * attackerLevel + ARMOR_REDUCTION_K_BASE)
        return Math.min(reduction, ARMOR_REDUCTION_CAP)
    }

    // ==================== 背包管理 ====================

    addToInventory(player, item) {
        if (!Array.isArray(player.inventory)) player.inventory = []
        player.inventory.push(item)
    }

    removeFromInventory(player, item) {
        if (!Array.isArray(player.inventory)) return
        const idx = player.inventory.findIndex(i => 
            (item.instanceId && i.instanceId === item.instanceId) || i === item
        )
        if (idx >= 0) {
            player.inventory.splice(idx, 1)
        }
    }

    getInventoryCount(player) {
        return Array.isArray(player.inventory) ? player.inventory.length : 0
    }

    _isInInventory(player, item) {
        if (!Array.isArray(player.inventory)) return false
        return player.inventory.some(i =>
            (item.instanceId && i.instanceId === item.instanceId) || i === item
        )
    }

    // ==================== 耐久度系统 ====================

    degradeDurability() {
        const player = this._getPlayer()
        if (!player) return

        let changed = false
        for (const slot of SLOT_IDS) {
            const item = player.equipment[slot]
            if (!item || !item.durability) continue

            const slotDef = EQUIPMENT_SLOTS[slot]
            const isWeapon = slotDef.category === 'weapon' || item.category === 'weapon'
            const loss = isWeapon
                ? DurabilityConfig.combatWeaponLoss
                : DurabilityConfig.combatArmorLoss

            if (item.durability.current > 0) {
                item.durability.current = Math.max(0, item.durability.current - loss)
                changed = true

                if (item.durability.current === 0) {
                    this.engine.eventBus.emit('equipment:broken', { slot, item })
                } else if (item.durability.current / item.durability.max <= DurabilityConfig.warningThreshold) {
                    this.engine.eventBus.emit('equipment:lowDurability', { slot, item })
                }
            }
        }

        if (changed) {
            this.engine.stateManager.set('player', player)
        }
    }

    repairItem(player, slot) {
        const item = player.equipment[slot]
        if (!item || !item.durability) {
            return { success: false, reason: '没有可修理的装备' }
        }
        if (item.durability.current >= item.durability.max) {
            return { success: false, reason: '装备无需修理' }
        }

        const cost = this.getRepairCost(item)
        if (player.gold < cost) {
            return { success: false, reason: `金币不足（需要 ${cost}，拥有 ${player.gold}）` }
        }

        player.gold -= cost
        item.durability.current = item.durability.max

        this._saveAndNotify(player, 'equipment:repaired', { slot, item, cost })

        return { success: true, cost }
    }

    repairAll(player) {
        let totalCost = 0
        let repairedCount = 0

        for (const slot of SLOT_IDS) {
            const item = player.equipment[slot]
            if (!item || !item.durability) continue
            if (item.durability.current >= item.durability.max) continue
            totalCost += this.getRepairCost(item)
            repairedCount++
        }

        if (repairedCount === 0) {
            return { success: false, totalCost: 0, repairedCount: 0, reason: '没有需要修理的装备' }
        }
        if (player.gold < totalCost) {
            return { success: false, totalCost, repairedCount, reason: `金币不足（需要 ${totalCost}，拥有 ${player.gold}）` }
        }

        player.gold -= totalCost
        for (const slot of SLOT_IDS) {
            const item = player.equipment[slot]
            if (item?.durability && item.durability.current < item.durability.max) {
                item.durability.current = item.durability.max
            }
        }

        this._saveAndNotify(player, 'equipment:repairedAll', { totalCost, repairedCount })

        return { success: true, totalCost, repairedCount }
    }

    getRepairCost(item) {
        if (!item || !item.durability) return 0
        const damagePct = 1 - (item.durability.current / item.durability.max)
        const qualityMult = DurabilityConfig.repairCostByQuality[item.quality] || 1
        return Math.ceil(item.itemLevel * DurabilityConfig.repairCostBase * qualityMult * damagePct)
    }

    // ==================== 套装效果 ====================

    getActiveSetBonuses(player) {
        const setCounts = {}

        for (const slot of SLOT_IDS) {
            const item = player.equipment[slot]
            if (item?.setId) {
                setCounts[item.setId] = (setCounts[item.setId] || 0) + 1
            }
        }

        const result = []
        for (const [setId, count] of Object.entries(setCounts)) {
            const setDef = SetBonuses[setId]
            if (!setDef) continue

            const activeBonuses = []
            for (const [threshold, bonus] of Object.entries(setDef.bonuses)) {
                if (count >= parseInt(threshold)) {
                    activeBonuses.push(bonus)
                }
            }

            result.push({
                setId,
                setName: setDef.name,
                equippedCount: count,
                totalPieces: setDef.pieces.length,
                activeBonuses,
            })
        }

        return result
    }

    /**
     * 计算所有装备 + 套装的总属性加成
     * 考虑品质缩放和耐久度惩罚
     */
    calculateEquipmentStats(player) {
        const totalStats = {}

        for (const slot of SLOT_IDS) {
            const item = player.equipment[slot]
            if (!item || !item.stats) continue

            // 耐久度惩罚：耐久度为 0 时不提供属性
            if (item.durability && item.durability.current <= 0) continue

            // 品质缩放
            const qualityCfg = QualityConfig[item.quality]
            const scale = qualityCfg ? qualityCfg.statScale : 1.0

            for (const [stat, value] of Object.entries(item.stats)) {
                totalStats[stat] = (totalStats[stat] || 0) + Math.floor(value * scale)
            }
        }

        // 套装效果属性
        const setBonuses = this.getActiveSetBonuses(player)
        for (const setInfo of setBonuses) {
            for (const bonus of setInfo.activeBonuses) {
                if (bonus.stats) {
                    for (const [stat, value] of Object.entries(bonus.stats)) {
                        totalStats[stat] = (totalStats[stat] || 0) + value
                    }
                }
            }
        }

        return totalStats
    }

    // ==================== 掉落处理 ====================

    handleCombatDrop(enemy) {
        const player = this._getPlayer()
        if (!player) return

        const droppedItem = rollEquipmentDrop(enemy.id)
        if (!droppedItem) return

        if (this.getInventoryCount(player) >= BAG_CAPACITY) {
            this.engine.eventBus.emit('system:log', {
                message: `📦 ${droppedItem.name} 掉落了，但背包已满！`,
                type: 'warning',
            })
            return
        }

        this.addToInventory(player, droppedItem)
        this.engine.stateManager.set('player', player)

        const qualityCfg = QualityConfig[droppedItem.quality]
        this.engine.eventBus.emit('system:log', {
            message: `${qualityCfg?.emoji || '📦'} 获得装备: ${droppedItem.name}`,
            type: 'loot',
        })
        this.engine.eventBus.emit('equipment:dropped', { item: droppedItem })
    }

    sellItem(player, item) {
        if (!item || !item.sellPrice) {
            return { success: false, reason: '该物品无法出售' }
        }

        this.removeFromInventory(player, item)
        player.gold += item.sellPrice
        player.statistics.goldEarned += item.sellPrice

        this._saveAndNotify(player, 'equipment:sold', { item, gold: item.sellPrice })

        return { success: true, gold: item.sellPrice }
    }

    // ==================== 工具方法 ====================

    _getPlayer() {
        return this.engine?.stateManager?.get('player')
    }

    _saveAndNotify(player, event, data) {
        this.engine.eventBus.emit('equipment:statsChanged', { player })
        this.engine.stateManager.set('player', player)
        this.engine.eventBus.emit(event, data)
    }

    static getQualityColor(quality) {
        return QualityConfig[quality]?.color || '#9d9d9d'
    }

    static getQualityName(quality) {
        return QualityConfig[quality]?.name || '普通'
    }

    update(deltaTime) {
        // 装备系统无需每帧更新
    }
}
