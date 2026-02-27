/**
 * @deprecated 此模块已废弃。
 * 多人战斗不再由服务端运行战斗循环并广播事件，
 * 而是客户端本地执行 DungeonCombatSystem（autoPlayMode）。
 * 保留此文件仅为兼容 BattleEngine 的 import（BattleEngine 也已精简为仅掉落计算）。
 */
import { EventBus } from '../../src/core/EventBus.js'

/**
 * 广播事件总线 - 继承 EventBus，emit 时额外通过 Socket.IO 广播给房间内所有客户端
 */
export class BroadcastEventBus extends EventBus {
    constructor(io, roomId) {
        super()
        this.io = io
        this.roomId = roomId
    }

    emit(event, data) {
        super.emit(event, data)  // 服务端本地处理
        // 广播给房间内所有客户端
        if (this.io && this.roomId) {
            this.io.to(this.roomId).emit('battle:event', { event, data })
        }
    }
}
