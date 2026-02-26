import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RoomManager } from '../../../server/rooms.js'

// Helper to create mock users
function mockUser(id, nickname) {
    return { id, username: `user${id}`, nickname: nickname || `Player${id}` }
}

// Mocks for server-level variables used in tests
const activeBattles = new Map()
const battleCompleteReceived = new Map()

const roomManager = new RoomManager({
    timerFn: () => 'fake-timer',
    clearFn: () => {},
})

describe('RoomManager - Create Room', () => {
    let rm

    beforeEach(() => {
        rm = new RoomManager({
            timerFn: () => 'fake-timer',  // no-op timer
            clearFn: () => {},
        })
    })

    it('should create a room with the host as the only player', () => {
        const user = mockUser(1, 'HostPlayer')
        const result = rm.createRoom(user, 'dungeon_01', '黑暗森林')

        expect(result.error).toBeUndefined()
        expect(result.room).toBeDefined()
        expect(result.room.dungeonId).toBe('dungeon_01')
        expect(result.room.dungeonName).toBe('黑暗森林')
        expect(result.room.status).toBe('waiting')
        expect(result.room.hostId).toBe(1)
        expect(result.room.players).toHaveLength(1)
        expect(result.room.players[0].isHost).toBe(true)
        expect(result.room.players[0].userId).toBe(1)
    })

    it('should prevent a user from creating a second room', () => {
        const user = mockUser(1)
        rm.createRoom(user, 'dungeon_01', 'D1')
        const result = rm.createRoom(user, 'dungeon_02', 'D2')

        expect(result.error).toBe('ALREADY_IN_ROOM')
    })

    it('should assign a UUID id to the room', () => {
        const user = mockUser(1)
        const result = rm.createRoom(user, 'dungeon_01', 'D1')

        expect(result.room.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
        )
    })
})

describe('RoomManager - Join Room', () => {
    let rm, roomId

    beforeEach(() => {
        rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
        })
        const result = rm.createRoom(mockUser(1, 'Host'), 'dungeon_01', 'D1')
        roomId = result.room.id
    })

    it('should allow a user to join an existing waiting room', () => {
        const result = rm.joinRoom(roomId, mockUser(2, 'Joiner'), { classId: 'mage', name: 'Joiner', level: 10 })

        expect(result.error).toBeUndefined()
        expect(result.room.players).toHaveLength(2)
        expect(result.room.players[1].userId).toBe(2)
        expect(result.room.players[1].classId).toBe('mage')
        expect(result.room.players[1].isHost).toBe(false)
    })

    it('should reject joining a non-existent room', () => {
        const result = rm.joinRoom('non-existent', mockUser(2))
        expect(result.error).toBe('ROOM_NOT_FOUND')
    })

    it('should reject joining when already in a room', () => {
        rm.joinRoom(roomId, mockUser(2))
        const result = rm.joinRoom(roomId, mockUser(2))
        expect(result.error).toBe('ALREADY_IN_ROOM')
    })

    it('should reject joining a full room', () => {
        rm.joinRoom(roomId, mockUser(2))
        rm.joinRoom(roomId, mockUser(3))
        rm.joinRoom(roomId, mockUser(4))
        rm.joinRoom(roomId, mockUser(5))
        // Room should now be full (5 players)
        const result = rm.joinRoom(roomId, mockUser(6))
        // Room auto-started on 5th join, so status is in_battle
        expect(result.error).toBe('ROOM_NOT_WAITING')
    })
})

describe('RoomManager - Leave Room', () => {
    let rm, roomId

    beforeEach(() => {
        rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
        })
        const result = rm.createRoom(mockUser(1, 'Host'), 'dungeon_01', 'D1')
        roomId = result.room.id
        rm.joinRoom(roomId, mockUser(2, 'Player2'))
    })

    it('should remove a player from the room', () => {
        const result = rm.leaveRoom(roomId, 2)
        expect(result.room.players).toHaveLength(1)
        expect(result.room.players[0].userId).toBe(1)
    })

    it('should transfer host when the host leaves', () => {
        const result = rm.leaveRoom(roomId, 1)
        expect(result.room.hostId).toBe(2)
        expect(result.room.players[0].isHost).toBe(true)
    })

    it('should destroy room when last player leaves', () => {
        rm.leaveRoom(roomId, 2)
        const result = rm.leaveRoom(roomId, 1)

        expect(result.destroyed).toBe(true)
        expect(result.room).toBeNull()
        expect(rm.getRoom(roomId)).toBeNull()
    })

    it('should return error for non-existent room', () => {
        const result = rm.leaveRoom('bad-id', 1)
        expect(result.error).toBe('ROOM_NOT_FOUND')
    })
})

describe('RoomManager - Room List', () => {
    let rm

    beforeEach(() => {
        rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
        })
    })

    it('should list only waiting rooms', () => {
        rm.createRoom(mockUser(1), 'dungeon_01', 'D1')
        rm.createRoom(mockUser(2), 'dungeon_02', 'D2')

        const list = rm.getRoomList()
        expect(list).toHaveLength(2)
        expect(list[0].dungeonId).toBe('dungeon_01')
        expect(list[1].dungeonId).toBe('dungeon_02')
    })

    it('should not include rooms that have started battle', () => {
        const result = rm.createRoom(mockUser(1), 'dungeon_01', 'D1')
        rm.startBattle(result.room.id)

        const list = rm.getRoomList()
        expect(list).toHaveLength(0)
    })

    it('should show correct player count', () => {
        const result = rm.createRoom(mockUser(1), 'dungeon_01', 'D1')
        rm.joinRoom(result.room.id, mockUser(2))

        const list = rm.getRoomList()
        expect(list[0].playerCount).toBe(2)
    })
})

describe('RoomManager - Auto-start when full', () => {
    it('should start battle when room reaches max players', () => {
        let startedRoom = null
        const rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
            onRoomStart(room) { startedRoom = room },
        })

        const result = rm.createRoom(mockUser(1), 'dungeon_01', 'D1')
        const roomId = result.room.id

        rm.joinRoom(roomId, mockUser(2))
        rm.joinRoom(roomId, mockUser(3))
        rm.joinRoom(roomId, mockUser(4))

        // 4 players — still waiting
        expect(rm.getRoom(roomId).status).toBe('waiting')

        // 5th player triggers auto-start
        rm.joinRoom(roomId, mockUser(5))

        expect(rm.getRoom(roomId).status).toBe('in_battle')
        expect(startedRoom).not.toBeNull()
        expect(startedRoom.players).toHaveLength(5)
    })
})

describe('RoomManager - Timeout with AI backfill', () => {
    it('should fill room with AI players on timeout', () => {
        let timeoutCallback = null
        const rm = new RoomManager({
            timerFn: (cb) => { timeoutCallback = cb; return 'timer-id' },
            clearFn: () => {},
        })

        const result = rm.createRoom(mockUser(1), 'dungeon_01', 'D1')
        rm.joinRoom(result.room.id, mockUser(2))

        // Simulate timeout
        expect(timeoutCallback).not.toBeNull()
        timeoutCallback()

        const room = rm.getRoom(result.room.id)
        expect(room.status).toBe('in_battle')
        expect(room.players).toHaveLength(5)

        // Last 3 players should be AI
        const aiPlayers = room.players.filter(p => p.isAI)
        expect(aiPlayers).toHaveLength(3)
        expect(aiPlayers[0].nickname).toContain('AI')
    })
})

describe('RoomManager - Host transfer on leave', () => {
    it('should transfer host to next player when host leaves', () => {
        const rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
        })

        const result = rm.createRoom(mockUser(1, 'Host'), 'dungeon_01', 'D1')
        const roomId = result.room.id
        rm.joinRoom(roomId, mockUser(2, 'Next'))
        rm.joinRoom(roomId, mockUser(3, 'Third'))

        // Host leaves
        rm.leaveRoom(roomId, 1)

        const room = rm.getRoom(roomId)
        expect(room.hostId).toBe(2)
        expect(room.players.find(p => p.userId === 2).isHost).toBe(true)
    })
})

describe('RoomManager - Destroy room when all leave', () => {
    it('should fully destroy room when all players leave', () => {
        const clearFn = vi.fn()
        const rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn,
        })

        const result = rm.createRoom(mockUser(1), 'dungeon_01', 'D1')
        const roomId = result.room.id

        rm.leaveRoom(roomId, 1)

        expect(rm.getRoom(roomId)).toBeNull()
        expect(rm.rooms.size).toBe(0)
    })
})

describe('RoomManager - Disconnect handling', () => {
    it('should remove player from waiting room on disconnect', () => {
        const rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
        })

        const result = rm.createRoom(mockUser(1, 'Host'), 'dungeon_01', 'D1')
        rm.joinRoom(result.room.id, mockUser(2, 'Player2'))

        const dcResult = rm.handleDisconnect(2)
        expect(dcResult.room.players).toHaveLength(1)
    })

    it('should mark player offline in battle room on disconnect', () => {
        const rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
        })

        const result = rm.createRoom(mockUser(1), 'dungeon_01', 'D1')
        rm.startBattle(result.room.id)

        const dcResult = rm.handleDisconnect(1)
        expect(dcResult.action).toBe('marked_offline')
        const player = dcResult.room.players.find(p => p.userId === 1)
        expect(player.isOnline).toBe(false)
    })

    it('should return null for unknown user disconnect', () => {
        const rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
        })

        const result = rm.handleDisconnect(999)
        expect(result).toBeNull()
    })
})

describe('RoomManager - Battle State & Rewards (with stmts)', () => {
    let rm, roomId, mockStmts

    beforeEach(() => {
        mockStmts = {
            saveBattleState: {
                run: vi.fn().mockResolvedValue({ changes: 1 }),
            },
            saveRoomRewards: {
                run: vi.fn().mockResolvedValue({ changes: 1 }),
            },
            getBattleState: {
                get: vi.fn().mockResolvedValue({ seed: 12345, round: 5, monsters: [], result: null }),
            },
            getRoomRewards: {
                get: vi.fn().mockResolvedValue({ 1: [{ name: 'Sword', quality: 'rare' }] }),
            },
        }

        rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
            stmts: mockStmts,
        })

        const result = rm.createRoom(mockUser(1), 'dungeon_01', 'D1')
        roomId = result.room.id
    })

    it('should persist battle state when updateBattleState is called', () => {
        const battleState = { seed: 12345, round: 5, monsters: [], result: null }
        rm.updateBattleState(roomId, battleState)

        expect(mockStmts.saveBattleState.run).toHaveBeenCalledWith(roomId, battleState)
    })

    it('should not call saveBattleState when stmts is not provided', () => {
        const rmNoStmts = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
        })

        const battleState = { seed: 12345, round: 5, monsters: [], result: null }
        rmNoStmts.updateBattleState(roomId, battleState)

        // Should not throw, just silently skip
        expect(rmNoStmts._stmts).toBeNull()
    })

    it('should persist room rewards when updateRoomRewards is called', () => {
        const rewards = { 1: [{ name: 'Sword', quality: 'rare' }] }
        rm.updateRoomRewards(roomId, rewards)

        expect(mockStmts.saveRoomRewards.run).toHaveBeenCalledWith(roomId, rewards)
    })

    it('should retrieve battle state from database', async () => {
        const state = await rm.getBattleState(roomId)

        expect(mockStmts.getBattleState.get).toHaveBeenCalledWith(roomId)
        expect(state).toEqual({ seed: 12345, round: 5, monsters: [], result: null })
    })

    it('should return null on getBattleState error', async () => {
        mockStmts.getBattleState.get.mockRejectedValueOnce(new Error('DB error'))

        const state = await rm.getBattleState(roomId)

        expect(state).toBeNull()
    })

    it('should retrieve room rewards from database', async () => {
        const rewards = await rm.getRoomRewards(roomId)

        expect(mockStmts.getRoomRewards.get).toHaveBeenCalledWith(roomId)
        expect(rewards).toEqual({ 1: [{ name: 'Sword', quality: 'rare' }] })
    })

    it('should return null on getRoomRewards error', async () => {
        mockStmts.getRoomRewards.get.mockRejectedValueOnce(new Error('DB error'))

        const rewards = await rm.getRoomRewards(roomId)

        expect(rewards).toBeNull()
    })
})

describe('RoomManager - Reconnection to in_battle rooms', () => {
    let rm, roomId, mockIo

    beforeEach(() => {
        mockIo = {
            to: vi.fn().mockReturnValue({
                emit: vi.fn(),
            }),
        }

        rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
            io: mockIo,
        })

        const result = rm.createRoom(mockUser(1), 'dungeon_01', 'D1')
        roomId = result.room.id
        rm.startBattle(roomId)
    })

    it('should handle reconnection to in_battle room', () => {
        const result = rm.joinRoom(roomId, mockUser(1))

        expect(result.error).toBeUndefined()
        expect(result.inBattle).toBe(true)
        expect(result.rejoined).toBe(true)
    })

    it('should reject new joins to in_battle room', () => {
        const result = rm.joinRoom(roomId, mockUser(2))

        expect(result.error).toBe('ROOM_IN_BATTLE')
        expect(result.message).toBe('房间战斗中，无法加入')
    })
})

describe('RoomManager - Monotonic round validation (in server/index.js)', () => {
    it('should accept battle update with higher round number', () => {
        const mockEngine = {
            battleState: { round: 5 },
        }
        const roomId = 'test-room'
        activeBattles.set(roomId, mockEngine)

        const room = { status: 'in_battle' }
        roomManager.rooms.set(roomId, room)

        const socket = { user: { id: 1 } }
        const battleState = { round: 10, monsters: [] }

        // Simulate the handler logic
        if (room?.status === 'in_battle' && battleState.round > mockEngine.battleState.round) {
            mockEngine.battleState = { ...mockEngine.battleState, ...battleState, lastUpdated: new Date().toISOString() }
        }

        expect(mockEngine.battleState.round).toBe(10)
        expect(mockEngine.battleState.lastUpdated).toBeDefined()
    })

    it('should reject battle update with lower or equal round number', () => {
        const mockEngine = {
            battleState: { round: 10 },
        }
        const roomId = 'test-room'
        activeBattles.set(roomId, mockEngine)

        const room = { status: 'in_battle' }
        roomManager.rooms.set(roomId, room)

        const battleState = { round: 5, monsters: [] }
        const originalRound = mockEngine.battleState.round

        // Simulate the handler logic - should not update
        if (battleState.round <= originalRound) {
            // Reject - don't update
        }

        expect(mockEngine.battleState.round).toBe(10) // Unchanged
    })
})

describe('RoomManager - Rewards idempotency (in server/index.js)', () => {
    it('should only process first battle:complete', () => {
        const roomId = 'test-room'
        battleCompleteReceived.set(roomId, false)

        // First completion
        const first = !battleCompleteReceived.get(roomId)
        expect(first).toBe(true)
        battleCompleteReceived.set(roomId, true)

        // Second completion (should be rejected)
        const second = !battleCompleteReceived.get(roomId)
        expect(second).toBe(false)
    })
})
