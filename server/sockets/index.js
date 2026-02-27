/**
 * Socket Handlers Index
 * Socket.IO 事件注册入口
 */
import { registerRoomHandlers, sanitizeRoom } from './roomHandlers.js'
import { registerBattleHandlers } from './battleHandlers.js'
import { registerChatHandlers } from './chatHandlers.js'
import { handleConnection, handleDisconnect } from './connectionHandler.js'

/**
 * Register all socket event handlers
 * @param {object} io - Socket.IO server instance
 * @param {object} deps - Dependencies { roomManager, activeBattles, battleCompletionStatus, stmts, chatManager }
 */
export function registerSocketHandlers(io, deps) {
    const { roomManager, activeBattles, battleCompletionStatus, stmts, chatManager } = deps

    io.on('connection', (socket) => {
        // Handle connection/reconnection
        handleConnection(io, socket, { roomManager, activeBattles, stmts })

        // Register event handlers
        registerRoomHandlers(io, socket, roomManager)
        registerBattleHandlers(io, socket, { roomManager, activeBattles, battleCompletionStatus, stmts })
        registerChatHandlers(io, socket, chatManager)

        // Handle disconnect
        socket.on('disconnect', () => {
            handleDisconnect(io, socket, { roomManager, activeBattles })
        })
    })
}

export { sanitizeRoom } from './roomHandlers.js'
