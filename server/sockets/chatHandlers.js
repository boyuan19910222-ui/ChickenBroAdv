/**
 * Chat Socket Handlers
 * 聊天相关 Socket.IO 事件处理
 */

/**
 * Register chat event handlers
 * @param {object} io - Socket.IO server instance
 * @param {object} socket - Socket instance
 * @param {object} chatManager - ChatManager instance
 */
export function registerChatHandlers(io, socket, chatManager) {
    // Lobby chat
    socket.on('chat:lobby', (message, callback) => {
        const result = chatManager.addLobbyMessage(socket.user, message)
        if (result.error) {
            return callback?.({ error: result.error, message: result.message })
        }
        // Broadcast to all connected clients
        io.emit('chat:lobby', result.message)
        callback?.({ ok: true })
    })

    // Room chat
    socket.on('chat:room', ({ roomId, message }, callback) => {
        const result = chatManager.addRoomMessage(roomId, socket.user, message)
        if (result.error) {
            return callback?.({ error: result.error, message: result.message })
        }
        // Broadcast to room members only
        io.to(roomId).emit('chat:room', { roomId, message: result.message })
        callback?.({ ok: true })
    })

    // Request chat history
    socket.on('chat:history', (_, callback) => {
        const lobbyMessages = chatManager.getLobbyMessages()
        callback?.({ messages: lobbyMessages })
    })
}
