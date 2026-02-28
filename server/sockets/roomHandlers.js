/**
 * Room Socket Handlers
 * 房间相关 Socket.IO 事件处理
 */

/**
 * Strip non-serializable fields (waitTimer etc.) before sending room to clients
 */
export function sanitizeRoom(room) {
    if (!room) return room
    const { waitTimer, ...safe } = room
    return safe
}

/**
 * Register room event handlers
 * @param {object} io - Socket.IO server instance
 * @param {object} socket - Socket instance
 * @param {object} roomManager - RoomManager instance
 */
export function registerRoomHandlers(io, socket, roomManager) {
    // Create room
    socket.on('room:create', ({ dungeonId, dungeonName, playerSnapshot }, callback) => {
        const result = roomManager.createRoom(socket.user, dungeonId, dungeonName, playerSnapshot)
        if (result.error) {
            return callback?.({
                error: result.error,
                message: result.message,
                ...(result.rejoin ? { rejoin: true, room: sanitizeRoom(result.room) } : {})
            })
        }
        socket.join(result.room.id)
        io.emit('room:list_updated', roomManager.getRoomList())
        callback?.({ room: sanitizeRoom(result.room) })
    })

    // Join room
    socket.on('room:join', ({ roomId, playerSnapshot }, callback) => {
        const result = roomManager.joinRoom(roomId, socket.user, playerSnapshot)
        if (result.error) {
            return callback?.({
                error: result.error,
                message: result.message,
                ...(result.rejoin ? { rejoin: true, room: sanitizeRoom(result.room) } : {})
            })
        }
        socket.join(roomId)
        io.to(roomId).emit('room:updated', { room: sanitizeRoom(result.room) })
        io.emit('room:list_updated', roomManager.getRoomList())
        callback?.({ room: sanitizeRoom(result.room) })
    })

    // Leave room
    socket.on('room:leave', ({ roomId }, callback) => {
        const result = roomManager.leaveRoom(roomId, socket.user.id)
        if (result.error) {
            return callback?.({ error: result.error, message: result.message })
        }
        socket.leave(roomId)
        if (!result.destroyed) {
            io.to(roomId).emit('room:updated', { room: sanitizeRoom(result.room) })
        }
        io.emit('room:list_updated', roomManager.getRoomList())
        callback?.({ ok: true })
    })

    // List rooms
    socket.on('room:list', (_, callback) => {
        callback?.(roomManager.getRoomList())
    })

    // Start battle
    socket.on('room:start', ({ roomId }, callback) => {
        const room = roomManager.getRoom(roomId)
        if (!room) {
            return callback?.({ error: 'ROOM_NOT_FOUND', message: '房间不存在' })
        }
        if (room.hostId !== socket.user.id) {
            return callback?.({ error: 'NOT_HOST', message: '只有房主可以开始' })
        }
        const result = roomManager.startBattle(roomId)
        if (result.error) {
            return callback?.({ error: result.error, message: result.message })
        }
        io.emit('room:list_updated', roomManager.getRoomList())
        callback?.({ room: sanitizeRoom(result.room) })
    })
}
