/**
 * SaveMigration - 版本化存档迁移管道
 * 支持从任意旧版本按顺序执行迁移链到最新版本
 */
import { ensurePlayerFields } from './PlayerSchema.js'
import { GameData } from '../data/GameData.js'
import { random } from './RandomProvider.js'

/**
 * 当前存档数据版本
 * 每次存档结构变更时递增
 */
export const CURRENT_VERSION = 6

/**
 * 迁移注册表
 * key: 源版本号（整数），value: 迁移函数 (data) => data
 * 每个函数将 data 从版本 N 迁移到版本 N+1
 */
const migrations = {
    /**
     * v1 → v2: 归一化所有旧存档
     * - 调用 ensurePlayerFields() 补全所有缺失字段
     * - 统一 exp → experience 字段名
     * - 规范化 equipment 结构（空对象 → 具名槽位）
     * - 生成缺失的 id 和 createdAt
     * - 补全 className、isPlayer、experienceToNext
     * - 资源系统迁移
     * - 盗贼连击点迁移
     */
    1: (data) => {
        if (!data.player) return data

        const player = data.player

        // 1. 统一 exp → experience（优先保留 experience）
        if ('exp' in player && !('experience' in player)) {
            player.experience = player.exp
        }
        if ('exp' in player) {
            delete player.exp
        }

        // 2. 生成缺失的 id
        if (!player.id) {
            player.id = 'char_' + Date.now() + '_' + random().toString(36).substr(2, 9)
        }

        // 3. 生成缺失的 createdAt
        if (!player.createdAt) {
            player.createdAt = new Date().toISOString()
        }

        // 4. 补全 className
        if (!player.className && player.class) {
            const classData = GameData.classes[player.class]
            if (classData) {
                player.className = classData.name
            }
        }

        // 5. 补全 classId（View 版有 classId，System 版用 class）
        if (!player.classId && player.class) {
            player.classId = player.class
        }

        // 6. 补全 isPlayer
        if (player.isPlayer === undefined) {
            player.isPlayer = true
        }

        // 7. 补全 experienceToNext
        if (!player.experienceToNext && player.level) {
            player.experienceToNext = GameData.expTable[player.level] || 100
        }

        // 8. 资源系统迁移
        if (!player.resource && player.class) {
            const classData = GameData.classes[player.class]
            if (classData) {
                const resourceType = classData.resourceType || 'mana'
                const resourceConfig = GameData.resourceSystems[resourceType]
                let resourceMax, resourceCurrent
                if (resourceType === 'mana') {
                    resourceMax = player.maxMana || player.stats?.mana || 50
                    resourceCurrent = player.currentMana || resourceMax
                } else if (resourceType === 'energy') {
                    resourceMax = resourceConfig.defaultMax
                    resourceCurrent = resourceMax
                } else {
                    resourceMax = resourceConfig.defaultMax
                    resourceCurrent = 0
                }
                player.resource = {
                    type: resourceType,
                    current: resourceCurrent,
                    max: resourceMax,
                    baseMax: resourceMax
                }
            }
        }

        // 9. 盗贼连击点迁移
        if (player.class === 'rogue' && !player.comboPoints) {
            player.comboPoints = { current: 0, max: 5 }
        }

        // 10. 使用 ensurePlayerFields 补全所有其余缺失字段
        data.player = ensurePlayerFields(player)

        console.log('📦 存档迁移 v1→v2 完成')
        return data
    },

    /**
     * v2 → v3: 装备系统升级
     * - 5 槽位 → 9 槽位迁移 (weapon→mainHand, armor→chest, helmet→head, boots→feet)
     * - accessory 槽位物品移入背包
     * - 补全 equipment 中缺失的新槽位
     */
    2: (data) => {
        if (!data.player) return data

        const player = data.player
        const oldEquip = player.equipment || {}

        // 检测是否是旧版 5 槽格式
        const hasOldSlots = 'weapon' in oldEquip || 'armor' in oldEquip || 'helmet' in oldEquip || 'boots' in oldEquip || 'accessory' in oldEquip
        
        if (hasOldSlots) {
            const newEquip = { head: null, shoulders: null, chest: null, hands: null, legs: null, feet: null, mainHand: null, offHand: null, ranged: null }
            
            // 迁移映射
            if (oldEquip.weapon)  newEquip.mainHand = oldEquip.weapon
            if (oldEquip.armor)   newEquip.chest = oldEquip.armor
            if (oldEquip.helmet)  newEquip.head = oldEquip.helmet
            if (oldEquip.boots)   newEquip.feet = oldEquip.boots
            
            // accessory 放入背包
            if (oldEquip.accessory) {
                if (!Array.isArray(player.inventory)) player.inventory = []
                player.inventory.push(oldEquip.accessory)
            }
            
            player.equipment = newEquip
        } else {
            // 已经是新格式，只确保 9 个槽位都存在
            const slots = ['head', 'shoulders', 'chest', 'hands', 'legs', 'feet', 'mainHand', 'offHand', 'ranged']
            for (const slot of slots) {
                if (!(slot in player.equipment)) {
                    player.equipment[slot] = null
                }
            }
        }

        console.log('📦 存档迁移 v2→v3 完成（装备系统 9 槽位）')
        return data
    },

    /**
     * v3 → v4: 经验系统升级
     * - 根据新的 60 级分段经验曲线重新计算 experienceToNext
     * - 保留玩家等级和当前经验不变
     */
    3: (data) => {
        if (!data.player) return data

        const player = data.player
        const level = player.level || 1

        // 满级处理
        if (level >= 60) {
            player.experience = 0
            player.experienceToNext = 0
        } else {
            // 根据新经验表重新计算 experienceToNext
            player.experienceToNext = GameData.expTable[level] || 200
        }

        console.log('📦 存档迁移 v3→v4 完成（经验系统 60 级）')
        return data
    },

    /**
     * v4 → v5: 装备系统 16 槽位升级
     * - 9 槽→16 槽：保留已有槽位，ranged 装备移入背包，新增 7 个 null 槽位
     * - 背包容量从 20 扩展到 40（无需数据迁移，只是上限变更）
     * - 兼容 5 槽旧存档（weapon→mainHand, armor→chest, helmet→head, boots→feet, accessory→背包）
     */
    4: (data) => {
        if (!data.player) return data

        const player = data.player
        const oldEquip = player.equipment || {}

        // 新 16 槽默认值
        const newEquip = {
            head: null, shoulders: null, chest: null, legs: null,
            hands: null, wrists: null, waist: null, feet: null,
            back: null, neck: null, finger1: null, finger2: null,
            trinket1: null, trinket2: null, mainHand: null, offHand: null,
        }

        if (!Array.isArray(player.inventory)) player.inventory = []

        // 检测是否是旧版 5 槽格式
        const hasOldSlots = 'weapon' in oldEquip || 'armor' in oldEquip || 'helmet' in oldEquip
        
        if (hasOldSlots) {
            // 5 槽 → 16 槽
            if (oldEquip.weapon)  newEquip.mainHand = oldEquip.weapon
            if (oldEquip.armor)   newEquip.chest = oldEquip.armor
            if (oldEquip.helmet)  newEquip.head = oldEquip.helmet
            if (oldEquip.boots)   newEquip.feet = oldEquip.boots
            if (oldEquip.accessory) {
                player.inventory.push(oldEquip.accessory)
            }
        } else {
            // 9 槽 → 16 槽：拷贝已有，ranged 移入背包
            const existingSlots = ['head', 'shoulders', 'chest', 'hands', 'legs', 'feet', 'mainHand', 'offHand']
            for (const slot of existingSlots) {
                if (slot in oldEquip && oldEquip[slot]) {
                    newEquip[slot] = oldEquip[slot]
                }
            }
            // ranged 装备移入背包
            if (oldEquip.ranged) {
                // 将 ranged 武器的 slot 改为 mainHand（弓/枪/弩现在是双手武器）
                const rangedItem = oldEquip.ranged
                if (rangedItem.slot === 'ranged') {
                    rangedItem.slot = 'mainHand'
                    rangedItem.weaponHand = 'two_hand'
                    rangedItem.category = 'weapon'
                }
                player.inventory.push(rangedItem)
            }
        }

        player.equipment = newEquip

        console.log('📦 存档迁移 v4→v5 完成（装备系统 16 槽位 + 背包 40 格）')
        return data
    },

    /**
     * v5 → v6: 统一宠物/恶魔召唤体系
     * - 猎人 skills: 移除 petAttack
     * - 术士 skills: summonImp → summonDemon
     * - 清理 activePet 中旧格式数据
     */
    5: (data) => {
        if (!data.player) return data

        const player = data.player
        const classId = player.class || player.classId

        // 猎人：移除 petAttack
        if (classId === 'hunter' && Array.isArray(player.skills)) {
            player.skills = player.skills.filter(s => s !== 'petAttack')
        }

        // 术士：summonImp → summonDemon
        if (classId === 'warlock' && Array.isArray(player.skills)) {
            player.skills = player.skills.map(s => s === 'summonImp' ? 'summonDemon' : s)
        }

        // 清理冷却中的旧技能引用
        if (player.skillCooldowns) {
            delete player.skillCooldowns.petAttack
            delete player.skillCooldowns.summonImp
        }

        // 清理 activePet 中旧格式的 specialSkills（概率触发式）
        if (player.activePet && player.activePet.specialSkills) {
            delete player.activePet.specialSkills
        }

        console.log('📦 存档迁移 v5→v6 完成（统一宠物/恶魔召唤体系）')
        return data
    }
}

/**
 * 解析存档版本号
 * 兼容旧格式：无版本号、字符串版本号 "1.0.0"、整数版本号
 * @param {*} version - 原始版本值
 * @returns {number} 整数版本号
 */
function parseVersion(version) {
    if (version === undefined || version === null) return 1
    if (typeof version === 'number' && Number.isInteger(version)) return version
    // 旧版字符串格式 "1.0.0" → 视为 v1
    if (typeof version === 'string') return 1
    return 1
}

/**
 * 执行存档迁移
 * @param {Object} saveData - 完整存档数据 { version, timestamp, slot, data }
 * @returns {Object} 迁移后的存档数据，version 更新为 CURRENT_VERSION
 */
export function migrate(saveData) {
    if (!saveData) return saveData

    let version = parseVersion(saveData.version)
    
    // 已经是最新版本，无需迁移
    if (version >= CURRENT_VERSION) {
        return saveData
    }

    // 深拷贝 data 以避免副作用
    let data
    try {
        data = JSON.parse(JSON.stringify(saveData.data))
    } catch (e) {
        console.error('存档数据拷贝失败:', e)
        return saveData
    }

    // 依次执行迁移链
    while (version < CURRENT_VERSION) {
        const migrationFn = migrations[version]
        if (!migrationFn) {
            console.error(`缺少迁移函数: v${version} → v${version + 1}`)
            break
        }
        console.log(`📦 执行存档迁移: v${version} → v${version + 1}`)
        data = migrationFn(data)
        version++
    }

    return {
        ...saveData,
        version: CURRENT_VERSION,
        data
    }
}
