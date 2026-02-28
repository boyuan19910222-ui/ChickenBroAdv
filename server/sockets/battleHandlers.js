/**
 * Battle Socket Handlers
 * 战斗相关 Socket.IO 事件处理
 */

/**
 * Register battle event handlers
 * @param {object} io - Socket.IO server instance
 * @param {object} socket - Socket instance
 * @param {object} deps - Dependencies { roomManager, activeBattles, battleCompletionStatus, stmts }
 */
export function registerBattleHandlers(io, socket, deps) {
    const { roomManager, activeBattles, battleCompletionStatus, stmts } = deps

    // Wave progress update
    socket.on('battle:wave_progress', ({ roomId, waveIndex, totalWaves }) => {
        const engine = activeBattles.get(roomId)
        if (!engine) return

        if (engine.battleState) {
            engine.battleState.currentWaveIndex = waveIndex
            engine.battleState.totalWaves = totalWaves
        }

        stmts.saveBattleState.run(roomId, engine.battleState)
            .catch(err => console.error('[battle] Failed to save wave progress:', err))

        socket.to(roomId).emit('battle:wave_updated', { waveIndex, totalWaves })
        console.log(`[battle] Wave progress updated: room=${roomId}, wave=${waveIndex}/${totalWaves}`)
    })

    // Battle state update
    socket.on('battle:update', ({ roomId, battleState }) => {
        const engine = activeBattles.get(roomId)
        const room = roomManager.getRoom(roomId)

        if (!engine || !room || room.status !== 'in_battle') {
            console.warn(`[battle] Ignoring battle:update for room ${roomId}: engine=${!!engine}, room=${!!room}, status=${room?.status}`)
            return
        }

        if (engine.battleState && battleState.round !== undefined) {
            if (battleState.round <= (engine.battleState.round || 0)) {
                console.warn(`[battle] Rejecting stale battle:update for room ${roomId}: current=${engine.battleState.round}, received=${battleState.round}`)
                return
            }
        }

        if (engine.battleState) {
            engine.battleState = { ...engine.battleState, ...battleState, lastUpdated: new Date().toISOString() }
        } else {
            engine.battleState = { ...battleState, lastUpdated: new Date().toISOString() }
        }

        stmts.saveBattleState.run(roomId, engine.battleState)
            .catch(err => console.error('[battle] Failed to save battle state update:', err))

        console.log(`[battle] Battle state updated: room=${roomId}, round=${battleState.round}`)
    })

    // Battle complete
    socket.on('battle:complete', async ({ roomId, result, dungeonId }) => {
        console.log(`[battle] battle:complete from ${socket.user.username}: room=${roomId}, result=${result}`)

        const engine = activeBattles.get(roomId)
        const room = roomManager.getRoom(roomId)

        if (!engine || !room) {
            console.warn(`[battle] No engine or room found for ${roomId}`)
            return
        }

        const completionTracking = battleCompletionStatus.get(roomId) || new Map()
        battleCompletionStatus.set(roomId, completionTracking)

        completionTracking.set(socket.user.id, result)
        console.log(`[battle] Player ${socket.user.username} completed: ${result}, ${completionTracking.size}/${room.players.filter(p => !p.isAI).length} humans completed`)

        const humanPlayers = room.players.filter(p => !p.isAI && p.userId > 0)
        const onlineHumanPlayers = humanPlayers.filter(p => p.isOnline !== false)
        const completedPlayers = onlineHumanPlayers.filter(p => completionTracking.has(p.userId))
        const allCompleted = onlineHumanPlayers.length > 0 && completedPlayers.length === onlineHumanPlayers.length

        if (allCompleted) {
            console.log(`[battle] All human players completed for room ${roomId}, finalizing battle`)

            if (result === 'victory') {
                const lootResults = engine.generatePersonalLoot()

                stmts.saveRoomRewards.run(roomId, lootResults)
                    .catch(err => console.error('[battle] Failed to persist rewards:', err))

                for (const [userId, items] of Object.entries(lootResults)) {
                    const playerResult = completionTracking.get(Number(userId))

                    if (playerResult === 'victory') {
                        const player = room.players.find(p => p.userId === Number(userId))
                        const characterId = player?.snapshot?.characterId

                        if (!characterId) {
                            console.warn(`[battle] No characterId for userId=${userId}, skipping reward`)
                            continue
                        }

                        const character = await stmts.findCharacterById.get(characterId)
                        if (!character) {
                            console.warn(`[battle] Character not found: characterId=${characterId}`)
                            continue
                        }

                        let gameState
                        try {
                            gameState = JSON.parse(character.game_state || '{}')
                        } catch (e) {
                            console.error('[battle] Failed to parse game_state:', e)
                            continue
                        }

                        if (!gameState.player) gameState.player = {}
                        if (!gameState.player.inventory) gameState.player.inventory = []

                        gameState.player.inventory.push(...items)

                        const updatedLevel = gameState.player?.level || character.level
                        await stmts.updateCharacterGameState.run(
                            JSON.stringify(gameState),
                            updatedLevel,
                            characterId
                        )

                        console.log(`[battle] Rewards added to character ${characterId} (userId=${userId}), ${items.length} items`)
                    }
                }
                console.log(`[battle] Loot distributed and persisted for room ${roomId}`)

                for (const [userId, items] of Object.entries(lootResults)) {
                    const playerResult = completionTracking.get(Number(userId))
                    if (playerResult === 'victory') {
                        io.to(roomId).emit('battle:reward', {
                            userId: Number(userId),
                            items,
                            alreadyClaimed: true,
                        })
                    }
                }
            }

            io.to(roomId).emit('battle:finished_server', {
                result,
                roomId,
            })

            activeBattles.delete(roomId)
            battleCompletionStatus.delete(roomId)

            if (room) {
                const socketsInRoom = io.sockets.adapter.rooms.get(roomId)
                if (socketsInRoom) {
                    for (const sid of socketsInRoom) {
                        const s = io.sockets.sockets.get(sid)
                        if (s) s.leave(roomId)
                    }
                }
                roomManager._destroyRoom(roomId)
                io.emit('room:list_updated', roomManager.getRoomList())
                console.log(`[battle] Room ${roomId} destroyed after battle`)
            }
        }
    })
}
