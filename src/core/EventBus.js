/**
 * 事件总线系统 - 实现模块间松耦合通信
 */
export class EventBus {
    constructor() {
        this.listeners = new Map()
        this.onceListeners = new Map()
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }
        this.listeners.get(event).add(callback)
        return () => this.off(event, callback)
    }

    once(event, callback) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, new Set())
        }
        this.onceListeners.get(event).add(callback)
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback)
        }
        if (this.onceListeners.has(event)) {
            this.onceListeners.get(event).delete(callback)
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data)
                } catch (error) {
                    console.error(`事件处理错误 [${event}]:`, error)
                }
            })
        }

        if (this.onceListeners.has(event)) {
            this.onceListeners.get(event).forEach(callback => {
                try {
                    callback(data)
                } catch (error) {
                    console.error(`一次性事件处理错误 [${event}]:`, error)
                }
            })
            this.onceListeners.delete(event)
        }
    }

    clear() {
        this.listeners.clear()
        this.onceListeners.clear()
    }
}
