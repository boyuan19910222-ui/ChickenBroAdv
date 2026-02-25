/**
 * 游戏引擎核心 - 协调所有游戏系统
 */
import { EventBus } from './EventBus.js'
import { StateManager } from './StateManager.js'
import { SaveManager } from './SaveManager.js'

export class GameEngine {
    constructor() {
        this.eventBus = new EventBus()
        this.stateManager = new StateManager(this.eventBus)
        this.saveManager = new SaveManager(this.eventBus)
        this.systems = new Map()
        this.isRunning = false
        this.isPaused = false
        this.animationFrameId = null
        this.lastTime = 0
        this.currentSlot = 1  // 当前活跃存档槽位
        this._beforeUnloadHandler = null
        this.update = this.update.bind(this)
    }

    registerSystem(name, system) {
        this.systems.set(name, system)
        if (system.init) {
            system.init(this)
        }
        console.log(`系统已注册: ${name}`)
    }

    getSystem(name) {
        return this.systems.get(name)
    }

    init(config = {}) {
        console.log('🐔 鸡哥大冒险 - 游戏引擎初始化')
        this.stateManager.init({
            game: {
                scene: 'menu',
                time: 0,
                paused: false
            },
            player: null,
            combat: null,
            inventory: [],
            quests: []
        })
        this.setupEventListeners()
        this.eventBus.emit('engine:init', config)
    }

    setupEventListeners() {
        this.eventBus.on('scene:change', (scene) => {
            this.stateManager.set('game.scene', scene)
        })
        this.eventBus.on('game:pause', () => {
            this.isPaused = true
            this.stateManager.set('game.paused', true)
        })
        this.eventBus.on('game:resume', () => {
            this.isPaused = false
            this.stateManager.set('game.paused', false)
        })
    }

    start(playerData = null) {
        // 防止重复启动：先清理旧的游戏循环、定时器和监听器
        if (this.isRunning) {
            this.stop()
        }

        if (playerData) {
            this.stateManager.set('player', playerData)
        }
        this.isRunning = true
        this.eventBus.emit('game:start')
        this.saveManager.startAutoSave(() => this.stateManager.snapshot(), () => this.currentSlot, 300000)

        // 注册 beforeunload 紧急存档
        this._beforeUnloadHandler = () => {
            if (this.currentSlot) {
                try {
                    this.saveManager.save(this.stateManager.snapshot(), this.currentSlot)
                } catch (e) {
                    console.warn('紧急存档失败:', e)
                }
            }
        }
        window.addEventListener('beforeunload', this._beforeUnloadHandler)

        this.lastTime = performance.now()
        this.startGameLoop()
        console.log('游戏开始运行')
    }

    startGameLoop() {
        const loop = (currentTime) => {
            if (!this.isRunning) return
            const deltaTime = currentTime - this.lastTime
            this.lastTime = currentTime
            this.update(deltaTime)
            this.animationFrameId = requestAnimationFrame(loop)
        }
        this.animationFrameId = requestAnimationFrame(loop)
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return
        const currentTime = this.stateManager.get('game.time') || 0
        this.stateManager.set('game.time', currentTime + deltaTime, true)
        this.systems.forEach((system) => {
            if (system.update) {
                system.update(deltaTime)
            }
        })
        this.eventBus.emit('engine:update', deltaTime)
    }

    stop() {
        this.isRunning = false
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
        }
        this.saveManager.stopAutoSave()

        // 移除 beforeunload 监听器
        if (this._beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this._beforeUnloadHandler)
            this._beforeUnloadHandler = null
        }

        this.eventBus.emit('game:stop')
    }

    saveGame(slot) {
        const targetSlot = slot || this.currentSlot
        const state = this.stateManager.snapshot()
        return this.saveManager.save(state, targetSlot)
    }

    loadGame(slot = 1) {
        const state = this.saveManager.load(slot)
        if (state) {
            this.currentSlot = slot
            this.stateManager.restore(state)
            this._sanitizeLoadedState()
            this.eventBus.emit('game:loaded', this.stateManager.snapshot())
            return true
        }
        return false
    }

    /**
     * 加载存档后清洗状态：满血满蓝回到野外探索
     * 保留角色元数据（等级、装备、经验、金币、任务等）
     */
    _sanitizeLoadedState() {
        // 1. 场景强制设为探索
        this.stateManager.set('game.scene', 'exploration')

        // 2. 清除战斗状态
        this.stateManager.set('combat', null)
        this.stateManager.set('dungeonCombat', null)

        // 3. 玩家状态清洗
        const player = this.stateManager.get('player')
        if (!player) return

        // HP/Mana 回满
        player.currentHp = player.maxHp
        player.currentMana = player.maxMana

        // 按职业区分资源重置
        if (player.resource) {
            if (player.resource.type === 'rage') {
                player.resource.current = 0
            } else {
                // mana / energy → 回满
                player.resource.current = player.resource.max || player.resource.baseMax || 0
            }
        }

        // 清除 buff/debuff
        player.buffs = []
        player.debuffs = []

        // 技能冷却归零
        if (player.skillCooldowns) {
            for (const skillId in player.skillCooldowns) {
                player.skillCooldowns[skillId] = 0
            }
        }

        // 连击点归零（盗贼）
        if (player.comboPoints) {
            player.comboPoints.current = 0
        }

        // 宠物 HP 回满
        if (player.activePet && player.activePet.maxHp != null) {
            player.activePet.currentHp = player.activePet.maxHp
        }

        // icon 兼容：旧存档 emoji → icon
        if (!player.icon && player.class) {
            player.icon = `/icons/classes/${player.class}.png`
        }
        delete player.emoji

        this.stateManager.set('player', player)
    }

    /**
     * 查找第一个空的存档槽位，如果都满了则返回 1
     */
    findEmptySlot() {
        const saves = this.saveManager.getAllSaves()
        const emptySlot = saves.find(s => s.empty)
        return emptySlot ? emptySlot.slot : 1
    }
}
