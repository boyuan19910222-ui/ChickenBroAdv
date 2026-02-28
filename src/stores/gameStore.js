/**
 * 游戏全局状态 Store
 */
import { defineStore } from 'pinia'
import { GameEngine } from '@/core/GameEngine.js'
import { CharacterSystem, CombatSystem, DungeonCombatSystem, EquipmentSystem, LootSystem, TalentSystem, QuestSystem } from '@/systems/index.js'
import { random } from '@/core/RandomProvider.js'
import { ensurePlayerFields } from '@/core/PlayerSchema.js'
import { GameData } from '@/data/GameData.js'
import { characterApi } from '@/services/api.js'

export const useGameStore = defineStore('game', {
    state: () => ({
        // 游戏引擎实例
        engine: null,

        // 当前场景
        currentScene: 'menu',

        // 玩家数据
        player: null,

        // 战斗日志
        logs: [],
        maxLogs: 100,
        logVersion: 0,

        // 掉落日志（独立通道）
        lootLogs: [],
        maxLootLogs: 50,
        lootLogVersion: 0,

        // UI 状态
        selectedClass: null,
        isPlayerTurn: true,

        // 自动战斗标记
        autoBattleEnabled: false,

        // 当前活跃存档槽位
        currentSlot: 1,

        // 当前选择的副本ID
        selectedDungeonId: null,

        // 当前选中的角色ID（服务器端）
        currentCharacterId: null,

        // 多人模式专用 DungeonCombatSystem（由 MultiplayerDungeonAdapter 挂载）
        _multiplayerDungeonSystem: null,
    }),

    getters: {
        characterSystem() {
            return this.engine?.getSystem('character')
        },
        combatSystem() {
            return this.engine?.getSystem('combat')
        },
        dungeonCombatSystem() {
            // 多人模式下优先使用 MultiplayerDungeonAdapter 挂载的系统
            return this._multiplayerDungeonSystem ?? this.engine?.getSystem('dungeonCombat')
        },
        equipmentSystem() {
            return this.engine?.getSystem('equipment')
        },
        talentSystem() {
            return this.engine?.getSystem('talent')
        },
        questSystem() {
            return this.engine?.getSystem('quest')
        },
        eventBus() {
            return this.engine?.eventBus
        },
        stateManager() {
            return this.engine?.stateManager
        },
        saveManager() {
            return this.engine?.saveManager
        },
        isInCombat() {
            return this.currentScene === 'combat'
        },
        isInDungeon() {
            return this.currentScene === 'dungeon'
        },
    },

    actions: {
        /**
         * 初始化游戏引擎
         */
        initEngine() {
            this.engine = new GameEngine()
            this.engine.init()

            // 注册游戏系统
            this.engine.registerSystem('character', new CharacterSystem())
            this.engine.registerSystem('combat', new CombatSystem())
            this.engine.registerSystem('dungeonCombat', new DungeonCombatSystem())
            this.engine.registerSystem('equipment', new EquipmentSystem())
            this.engine.registerSystem('loot', new LootSystem())
            this.engine.registerSystem('talent', new TalentSystem())
            this.engine.registerSystem('quest', new QuestSystem())

            // 监听状态变化
            this.engine.eventBus.on('state:change', () => {
                this.syncFromEngine()
            })

            // 桥接 CombatSystem 的战斗日志到 store（战斗中的详细动作日志）
            this.engine.eventBus.on('combat:log', (logEntry) => {
                this.addLog(logEntry.message, logEntry.type === 'normal' ? 'combat' : logEntry.type, logEntry.color)
            })

            // 桥接副本战斗日志到 store（与野外战斗日志统一）
            this.engine.eventBus.on('dungeon:log', (logEntry) => {
                this.addLog(logEntry.message, logEntry.type === 'normal' ? 'combat' : logEntry.type, logEntry.color)
            })

            // 桥接掉落日志
            this.engine.eventBus.on('loot:log', (message) => {
                this.addLootLog(message)
            })

            // 自动存档完成后也同步到服务器
            this.engine.eventBus.on('save:complete', () => {
                this._syncToServer()
            })

            console.log('🎮 游戏引擎初始化完成')
        },

        /**
         * 从引擎同步状态到 store
         */
        syncFromEngine() {
            if (!this.engine) return
            const player = this.engine.stateManager.get('player')
            if (player) {
                this.player = JSON.parse(JSON.stringify(player))
            }
            const scene = this.engine.stateManager.get('game.scene')
            if (scene) {
                this.currentScene = scene
            }
        },

        /**
         * 切换场景
         */
        changeScene(scene) {
            this.currentScene = scene
            this.engine?.eventBus.emit('scene:change', scene)
        },

        /**
         * 添加日志
         */
        addLog(message, type = 'system', color = null) {
            this.logs.push({
                id: Date.now() + random(),
                message,
                type,
                color,
                timestamp: new Date().toLocaleTimeString()
            })
            if (this.logs.length > this.maxLogs) {
                this.logs = this.logs.slice(-this.maxLogs)
            }
            this.logVersion++
        },

        /**
         * 添加掉落日志
         */
        addLootLog(message) {
            this.lootLogs.push({
                id: Date.now() + random(),
                message,
                timestamp: new Date().toLocaleTimeString()
            })
            if (this.lootLogs.length > this.maxLootLogs) {
                this.lootLogs = this.lootLogs.slice(-this.maxLootLogs)
            }
            this.lootLogVersion++
        },

        /**
         * 清空日志
         */
        clearLogs() {
            this.logs = []
            this.lootLogs = []
        },

        /**
         * 保存游戏（默认保存到当前活跃槽位）
         */
        saveGame(slot) {
            if (this.engine) {
                const targetSlot = slot || this.currentSlot
                const success = this.engine.saveGame(targetSlot)
                // save:complete 事件会自动触发 _syncToServer
                this.addLog(success ? '💾 游戏已保存！' : '❌ 保存失败！', 'system')
                return success
            }
            return false
        },

        /**
         * 加载游戏（记住加载的槽位）
         */
        loadGame(slot = 1) {
            if (this.engine) {
                const success = this.engine.loadGame(slot)
                if (success) {
                    this.currentSlot = slot  // 记住当前槽位
                    this.syncFromEngine()
                    this.addLog('📂 游戏已加载！', 'system')
                }
                return success
            }
            return false
        },

        /**
         * 导出存档
         */
        exportSave(slot = 1) {
            return this.engine?.saveManager.export(slot) || ''
        },

        /**
         * 导入存档
         */
        importSave(jsonString, slot = 1) {
            return this.engine?.saveManager.import(jsonString, slot) || false
        },

        /**
         * 启动游戏（新建角色时自动分配空槽位并立即存档）
         */
        startGame(playerData) {
            if (this.engine) {
                // 为新角色自动分配第一个空槽位
                const slot = this.engine.findEmptySlot()
                this.currentSlot = slot
                this.engine.currentSlot = slot

                this.engine.start(playerData)
                this.player = playerData
                this.changeScene('exploration')

                // 立即存档，防止关闭浏览器丢失新角色
                this.engine.saveGame(slot)
            }
        },

        /**
         * 退出到主菜单
         */
        exitToMenu() {
            // 退出前同步一次到服务器
            this._syncToServer()
            this._removeBeaconHandler()
            if (this.engine) {
                this.engine.stop()
            }
            this.player = null
            this.currentScene = 'menu'
            this.clearLogs()
            this.currentCharacterId = null
        },

        /**
         * 加载角色数据（从服务器获取）
         * @param {number} characterId - 角色ID
         * @param {object} gameState - 完整游戏状态
         */
        loadCharacter(characterId, gameState) {
            if (!this.engine) {
                this.initEngine()
            }

            this.currentCharacterId = characterId

            // 从 gameState 恢复玩家数据
            if (gameState && gameState.player) {
                // 确保所有必要字段存在（兼容旧存档）
                let player = ensurePlayerFields(gameState.player)

                // 确保经验值字段正确
                if (player.experienceToNext === undefined || player.experienceToNext === null) {
                    player.experienceToNext = GameData.expTable[player.level] || 200
                }
                if (player.experience === undefined || player.experience === null) {
                    player.experience = 0
                }

                this.player = player
                this.engine.stateManager.set('player', player)
            }

            // 恢复场景
            if (gameState && gameState.scene) {
                this.currentScene = gameState.scene
                this.engine.stateManager.set('game.scene', gameState.scene)
            }

            // 分配存档槽位并启动引擎（自动存档 + beforeunload + 游戏循环）
            const slot = this.engine.findEmptySlot()
            this.currentSlot = slot
            this.engine.currentSlot = slot
            this.engine.start()  // 不传 playerData，上面已手动设置

            // 注册 beforeunload 服务器同步（keepalive fetch 不受页面卸载影响）
            this._removeBeaconHandler()
            this._beaconHandler = () => { this._syncToServer(true) }
            window.addEventListener('beforeunload', this._beaconHandler)

            // 立即存档一次（localStorage + 服务器）
            this.engine.saveGame(slot)

            this.addLog(`📂 角色 #${characterId} 已加载！`, 'system')
        },

        /**
         * 清除当前角色
         */
        clearCharacter() {
            this._syncToServer()
            this._removeBeaconHandler()
            this.currentCharacterId = null
            if (this.engine) {
                this.engine.stop()
            }
            this.player = null
            this.currentScene = 'menu'
            this.clearLogs()
        },

        /**
         * 将当前游戏状态同步到服务器数据库
         * 异步执行，失败不阻塞游戏流程
         * @param {boolean} keepalive - 是否使用 keepalive（用于 beforeunload）
         */
        _syncToServer(keepalive = false) {
            if (!this.currentCharacterId || !this.engine) return
            const state = this.engine.stateManager.snapshot()
            if (!state) return
            const level = state.player?.level || 1
            const token = localStorage.getItem('mp_token')
            if (!token) return
            // 动态获取 API 地址
            const apiHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://127.0.0.1:3001'
                : `http://${window.location.hostname}:3001`
            const url = `${apiHost}/api/v1/characters/${this.currentCharacterId}`
            try {
                fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ game_state: state, level }),
                    keepalive,
                }).catch((err) => {
                    console.warn('存档同步到服务器失败:', err.message)
                })
            } catch (e) {
                // 静默失败（防止 beforeunload 中抛错）
            }
        },

        /**
         * 移除 beforeunload beacon 监听器
         */
        _removeBeaconHandler() {
            if (this._beaconHandler) {
                window.removeEventListener('beforeunload', this._beaconHandler)
                this._beaconHandler = null
            }
        }
    }
})
