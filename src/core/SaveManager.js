/**
 * 存档管理器 - 游戏数据持久化
 */
import { migrate, CURRENT_VERSION } from './SaveMigration.js'
import { QualityConfig } from '@/data/EquipmentData.js'

export class SaveManager {
    static MAX_SLOTS = 10

    constructor(eventBus) {
        this.eventBus = eventBus
        this.storageKey = 'chickenBro_save'
        this.autoSaveInterval = null
    }

    save(gameState, slot = 1) {
        try {
            const saveData = {
                version: CURRENT_VERSION,
                timestamp: new Date().toISOString(),
                syncStatus: 'local',
                slot,
                data: gameState
            }
            const key = `${this.storageKey}_${slot}`
            localStorage.setItem(key, JSON.stringify(saveData))
            this.eventBus.emit('save:complete', { slot, timestamp: saveData.timestamp })
            return true
        } catch (error) {
            console.error('存档失败:', error)
            this.eventBus.emit('save:error', error)
            return false
        }
    }

    load(slot = 1) {
        try {
            const key = `${this.storageKey}_${slot}`
            const rawData = localStorage.getItem(key)
            if (!rawData) return null

            const parsed = JSON.parse(rawData)

            // 检查是否需要迁移
            const currentVersion = typeof parsed.version === 'number' ? parsed.version : 1
            if (currentVersion < CURRENT_VERSION) {
                // 迁移前备份原始数据
                const backupKey = `chickenBro_backup_${slot}`
                localStorage.setItem(backupKey, rawData)
                console.log(`📦 已备份原始存档到 ${backupKey}`)

                // 执行迁移
                const migrated = migrate(parsed)

                // 迁移后回写 localStorage
                localStorage.setItem(key, JSON.stringify(migrated))
                console.log(`📦 存档已迁移至 v${CURRENT_VERSION}`)

                this.eventBus.emit('save:loaded', { slot, data: migrated.data })
                return migrated.data
            }

            this.eventBus.emit('save:loaded', { slot, data: parsed.data })
            return parsed.data
        } catch (error) {
            console.error('加载存档失败:', error)
            this.eventBus.emit('save:loadError', error)
            return null
        }
    }

    delete(slot = 1) {
        const key = `${this.storageKey}_${slot}`
        localStorage.removeItem(key)
        this.eventBus.emit('save:deleted', { slot })
    }

    getAllSaves() {
        const saves = []
        for (let i = 1; i <= SaveManager.MAX_SLOTS; i++) {
            const key = `${this.storageKey}_${i}`
            const data = localStorage.getItem(key)
            if (data) {
                const parsed = JSON.parse(data)
                saves.push({
                    slot: i,
                    timestamp: parsed.timestamp,
                    playerName: parsed.data?.player?.name || '未知角色',
                    level: parsed.data?.player?.level || 1
                })
            } else {
                saves.push({ slot: i, empty: true })
            }
        }
        return saves
    }

    export(slot = 1) {
        const key = `${this.storageKey}_${slot}`
        return localStorage.getItem(key) || ''
    }

    import(jsonString, slot = 1) {
        try {
            const parsed = JSON.parse(jsonString)

            // 导入时也执行迁移
            const migrated = migrate(parsed)

            const key = `${this.storageKey}_${slot}`
            localStorage.setItem(key, JSON.stringify(migrated))
            this.eventBus.emit('save:imported', { slot })
            return true
        } catch (error) {
            console.error('导入存档失败:', error)
            return false
        }
    }

    startAutoSave(getState, getSlot, interval = 60000) {
        this.stopAutoSave()
        this.autoSaveInterval = setInterval(() => {
            const state = getState()
            if (state) {
                const slot = typeof getSlot === 'function' ? getSlot() : 1
                this.save(state, slot)
                console.log(`自动存档完成 (槽位 ${slot})`)
            }
        }, interval)
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval)
            this.autoSaveInterval = null
        }
    }

    /**
     * 从当前存档中提取角色快照，用于联机上传
     * 字段名与 PlayerSchema.js 保持一致
     * @param {number} slot - 存档槽位
     * @returns {Object|null} CharacterSnapshot
     */
    exportSnapshot(slot = 1) {
        const gameState = this.load(slot)
        if (!gameState || !gameState.player) return null

        const player = gameState.player
        return {
            name: player.name,
            classId: player.classId || player.class,
            level: player.level,
            talents: player.talents || {},
            stats: player.stats ? { ...player.stats } : {},
            baseStats: player.baseStats ? { ...player.baseStats } : {},
            equipment: player.equipment ? { ...player.equipment } : {},
            skills: [...(player.skills || [])],
            resource: player.resource ? { ...player.resource } : null,
            comboPoints: player.comboPoints ? { ...player.comboPoints } : null,
            currentHp: player.currentHp,
            maxHp: player.maxHp,
        }
    }

    /**
     * 将联机获得的掉落物品写回存档背包
     * @param {Object[]} items - 掉落的装备列表
     * @param {number} slot - 存档槽位
     * @returns {boolean} 是否写入成功
     */
    applyLootToSave(items, slot = 1) {
        const gameState = this.load(slot)
        if (!gameState || !gameState.player) return false

        if (!gameState.player.inventory) {
            gameState.player.inventory = []
        }

        // 添加物品到背包并触发掉落日志
        for (const item of items) {
            gameState.player.inventory.push(item)

            // 触发掉落日志（与 LootSystem._giveItemToPlayer 保持一致）
            const qualityCfg = QualityConfig?.[item.quality]
            const logMessage = `${qualityCfg?.emoji || '📦'} ${item.name} (iLvl ${item.itemLevel}) — 装备掉落`
            this.eventBus?.emit('loot:log', logMessage)
        }

        const saved = this.save(gameState, slot)

        // 触发状态变化事件，让 gameStore 同步到 store
        this.eventBus?.emit('state:change')

        return saved
    }
}
