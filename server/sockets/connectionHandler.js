/**
 * Connection Handler
 * Socket.IO 连接/断开/重连处理
 */
import { sanitizeRoom } from './roomHandlers.js'

/**
 * Handle socket connection and reconnection logic
 * @param {object} io - Socket.IO server instance
 * @param {object} socket - Socket instance
 * @param {object} deps - Dependencies { roomManager, activeBattles, stmts }
 */
export function handleConnection(io, socket, deps) {
    const { roomManager, activeBattles, stmts } = deps

    console.log(`[socket] connected: ${socket.user.username} (id=${socket.user.id})`)

    // Check if user is already in a room (reconnection)
    const existingRoomId = roomManager.userRoomMap.get(socket.user.id)
    if (existingRoomId) {
        const room = roomManager.getRoom(existingRoomId)
        if (!room || room.status === 'closed') {
            if (room?.status === 'closed' || !room) {
                stmts.findRoomById.get(existingRoomId).then(dbRoom => {
                    if (dbRoom && dbRoom.rewards) {
                        const battleState = dbRoom.battle_state || {}
                        socket.emit('battle:restore', {
                            battleState: {
                                seed: battleState.seed,
                                result: battleState.result || null,
                            },
                            rewards: dbRoom.rewards[socket.user.id] || [],
                        })
                        console.log(`[socket] Sent battle result and rewards to ${socket.user.username} for finished room ${existingRoomId}`)
                    }
                    roomManager.userRoomMap.delete(socket.user.id)
                    console.log(`[socket] Cleared userRoomMap for ${socket.user.username} after restore (roomId=${existingRoomId})`)
                }).catch(err => console.error('[socket] Failed to query room for reconnection:', err))
            }
        } else {
            // Restore player online status
            const player = room.players.find(p => p.userId === socket.user.id)
            if (player) player.isOnline = true

            // Restore BattleEngine party unit online status
            const reconnectEngine = activeBattles.get(existingRoomId)
            if (reconnectEngine) {
                const unit = reconnectEngine.party.find(u => u.ownerId === socket.user.id)
                if (unit) {
                    unit.isOnline = true
                    console.log(`[socket] Restored engine party unit isOnline for ${socket.user.username}`)
                }
            }

            socket.join(existingRoomId)
            console.log(`[socket] ${socket.user.username} rejoined room ${existingRoomId}`)
            socket.emit('room:updated', { room: sanitizeRoom(room) })
            socket.to(existingRoomId).emit('room:updated', { room: sanitizeRoom(room) })

            // Resend battle:init if in battle
            if (room.status === 'in_battle') {
                const engine = activeBattles.get(existingRoomId)
                if (engine && engine.battleState) {
                    socket.emit('battle:init', {
                        dungeonId:        room.dungeonId,
                        seed:             engine.battleState.seed,
                        snapshots:        engine.battleState.snapshots,
                        roomId:           existingRoomId,
                        rejoin:           true,
                        currentWaveIndex: engine.battleState.currentWaveIndex || 0,
                        waves:            engine.battleState.waves,
                    })
                    console.log(`[socket] Resent battle:init to ${socket.user.username} for room ${existingRoomId}`)
                }
            }
        }
    }
}

/**
 * Handle socket disconnect
 * @param {object} io - Socket.IO server instance
 * @param {object} socket - Socket instance
 * @param {object} deps - Dependencies { roomManager, activeBattles }
 */
export function handleDisconnect(io, socket, deps) {
    const { roomManager, activeBattles } = deps

    console.log(`[socket] disconnected: ${socket.user.username}`)
    const result = roomManager.handleDisconnect(socket.user.id)
    if (result && result.room) {
        io.to(result.room.id).emit('room:updated', { room: sanitizeRoom(result.room) })
        io.emit('room:list_updated', roomManager.getRoomList())

        const battleEngine = activeBattles.get(result.room.id)
        if (battleEngine && result.action === 'marked_offline') {
            const unit = battleEngine.party.find(u => u.ownerId === socket.user.id)
            if (unit) unit.isOnline = false
        }
    }
}
