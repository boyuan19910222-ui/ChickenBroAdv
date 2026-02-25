/**
 * 状态管理器 - 集中式游戏状态管理
 */
export class StateManager {
    constructor(eventBus) {
        this.eventBus = eventBus
        this.state = {}
        this.history = []
        this.maxHistory = 10
    }

    init(initialState) {
        this.state = JSON.parse(JSON.stringify(initialState))
        this.eventBus.emit('state:init', this.state)
    }

    get(path) {
        if (!path) return this.state
        const keys = path.split('.')
        let value = this.state
        for (const key of keys) {
            if (value === undefined || value === null) return undefined
            value = value[key]
        }
        return value
    }

    set(path, value, silent = false) {
        this.saveHistory()
        const keys = path.split('.')
        let current = this.state
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {}
            }
            current = current[keys[i]]
        }
        const oldValue = current[keys[keys.length - 1]]
        current[keys[keys.length - 1]] = value
        if (!silent) {
            this.eventBus.emit('state:change', { path, oldValue, newValue: value })
            this.eventBus.emit(`state:${path}`, value)
        }
    }

    update(path, updates) {
        const current = this.get(path) || {}
        this.set(path, { ...current, ...updates })
    }

    saveHistory() {
        this.history.push(JSON.parse(JSON.stringify(this.state)))
        if (this.history.length > this.maxHistory) {
            this.history.shift()
        }
    }

    undo() {
        if (this.history.length === 0) return false
        this.state = this.history.pop()
        this.eventBus.emit('state:undo', this.state)
        return true
    }

    snapshot() {
        return JSON.parse(JSON.stringify(this.state))
    }

    restore(snapshot) {
        this.saveHistory()
        this.state = JSON.parse(JSON.stringify(snapshot))
        this.eventBus.emit('state:restore', this.state)
    }
}
