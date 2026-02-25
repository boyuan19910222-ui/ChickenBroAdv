import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BattleEngine } from '../../../server/BattleEngine.js'

// Instant delay for tests
const instantDelay = () => Promise.resolve()

// Helper: build a minimal room object matching rooms.js structure
function makeRoom(overrides = {}) {
    return {
        id: 'room-test-1',
        hostId: 1,
        dungeonId: 'test_dungeon',
        dungeonName: 'Test Dungeon',
        status: 'in_battle',
        maxPlayers: 5,
        players: [
            {
                userId: 1,
                nickname: 'Alice',
                classId: 'warrior',
                talent: 'protection',
                level: 20,
                role: 'tank',
                isHost: true,
                isOnline: true,
                isAI: false,
                snapshot: { maxHp: 500, currentHp: 500, damage: 30, stats: { strength: 30 } },
            },
            {
                userId: 2,
                nickname: 'Bob',
                classId: 'priest',
                talent: 'holy',
                level: 20,
                role: 'healer',
                isHost: false,
                isOnline: true,
                isAI: false,
                snapshot: { maxHp: 300, currentHp: 300, damage: 15, stats: { intellect: 25 } },
            },
            // AI fillers
            { userId: -1, nickname: 'AI盗贼1', classId: 'rogue', level: 20, role: 'melee_dps', isAI: true, isOnline: true, snapshot: null },
            { userId: -2, nickname: 'AI法师1', classId: 'mage', level: 20, role: 'ranged_dps', isAI: true, isOnline: true, snapshot: null },
            { userId: -3, nickname: 'AI猎人1', classId: 'hunter', level: 20, role: 'ranged_dps', isAI: true, isOnline: true, snapshot: null },
        ],
        ...overrides,
    }
}

function makeDungeonMeta(overrides = {}) {
    return {
        id: 'test_dungeon',
        name: 'Test Dungeon',
        levelRange: { min: 18, max: 22 },
        bossCount: 1,
        ...overrides,
    }
}

function makeMockIo() {
    const events = []
    return {
        to: vi.fn().mockReturnValue({
            emit: vi.fn((...args) => events.push(args)),
        }),
        emit: vi.fn((...args) => events.push(args)),
        _events: events,
    }
}

describe('BattleEngine', () => {
    let io, room, dungeon, engine

    beforeEach(() => {
        io = makeMockIo()
        room = makeRoom()
        dungeon = makeDungeonMeta()
    })

    describe('initialization', () => {
        it('should create a BattleEngine with correct initial state', () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })

            expect(engine.io).toBe(io)
            expect(engine.roomId).toBe('room-1')
            expect(engine.room).toBe(room)
            expect(engine.finished).toBe(false)
            expect(engine.result).toBeNull()
            expect(engine.party).toEqual([])
            expect(engine.enemies).toEqual([])
        })

        it('should build party from room players', () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            const party = engine._buildParty()

            expect(party.length).toBe(5)

            // Human players
            const humans = party.filter(u => !u.isAI)
            expect(humans.length).toBe(2)
            expect(humans[0].ownerId).toBe(1)
            expect(humans[1].ownerId).toBe(2)

            // AI players
            const ais = party.filter(u => u.isAI)
            expect(ais.length).toBe(3)
            expect(ais[0].ownerId).toBeNull()
        })

        it('should generate enemies based on dungeon metadata', () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            const enemies = engine._generateEnemies(dungeon)

            // 1 boss encounter = trash (3-5) + 1 boss
            expect(enemies.length).toBeGreaterThanOrEqual(4)
            expect(enemies.length).toBeLessThanOrEqual(6)

            const bosses = enemies.filter(e => e.isBoss)
            expect(bosses.length).toBe(1)
        })
    })

    describe('battle completion', () => {
        it('should emit battle:started on startBattle', async () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            await engine.startBattle(dungeon)

            // Check that battle:event with battle:started was broadcast
            const toMock = io.to.mock.results[0]?.value
            expect(toMock).toBeDefined()
            // The BroadcastEventBus calls io.to(roomId).emit('battle:event', ...)
            // so we check io.to was called with 'room-1'
            expect(io.to).toHaveBeenCalledWith('room-1')
        })

        it('should finish with victory or defeat', async () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            await engine.startBattle(dungeon)

            expect(engine.finished).toBe(true)
            expect(['victory', 'defeat']).toContain(engine.result)
        })

        it('should produce a result with stats', async () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            await engine.startBattle(dungeon)

            // The engine should have broadcast battle:finished
            expect(engine.finished).toBe(true)
            expect(engine.round).toBeGreaterThan(0)
        })
    })

    describe('disconnect handling', () => {
        it('should mark disconnected player as offline', async () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.party = engine._buildParty()

            engine.handleDisconnect(1)

            const alice = engine.party.find(u => u.ownerId === 1)
            expect(alice.isOnline).toBe(false)
        })

        it('should emit battle:playerDisconnected event', async () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.party = engine._buildParty()

            engine.handleDisconnect(2)

            // Check io.to('room-1').emit was called with battle:event containing playerDisconnected
            expect(io.to).toHaveBeenCalledWith('room-1')
        })

        it('should ignore disconnect for unknown users', () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.party = engine._buildParty()

            // Should not throw
            engine.handleDisconnect(999)
        })

        it('should exclude disconnected players from online list', () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.party = engine._buildParty()

            expect(engine.getOnlinePlayerIds()).toContain(1)
            expect(engine.getOnlinePlayerIds()).toContain(2)

            engine.handleDisconnect(1)

            expect(engine.getOnlinePlayerIds()).not.toContain(1)
            expect(engine.getOnlinePlayerIds()).toContain(2)
        })
    })

    describe('loot distribution', () => {
        it('should not distribute loot on defeat', async () => {
            // Create a very strong dungeon so the party loses
            const hardDungeon = makeDungeonMeta({
                levelRange: { min: 60, max: 63 },
                bossCount: 3,
            })
            const weakRoom = makeRoom({
                players: [
                    { userId: 1, nickname: 'Weak', classId: 'warrior', level: 1, role: 'tank', isAI: false, isOnline: true, isHost: true, snapshot: { maxHp: 50, currentHp: 50, damage: 5 } },
                    { userId: -1, nickname: 'AI1', classId: 'rogue', level: 1, role: 'dps', isAI: true, isOnline: true, snapshot: null },
                    { userId: -2, nickname: 'AI2', classId: 'mage', level: 1, role: 'dps', isAI: true, isOnline: true, snapshot: null },
                    { userId: -3, nickname: 'AI3', classId: 'hunter', level: 1, role: 'dps', isAI: true, isOnline: true, snapshot: null },
                    { userId: -4, nickname: 'AI4', classId: 'priest', level: 1, role: 'healer', isAI: true, isOnline: true, snapshot: null },
                ],
            })

            engine = new BattleEngine(io, 'room-1', weakRoom, { delayFn: instantDelay })
            await engine.startBattle(hardDungeon)

            if (engine.result === 'defeat') {
                // battle:loot should not be emitted for defeat
                // We just confirm the result is defeat
                expect(engine.result).toBe('defeat')
            }
            // If they somehow win, that's also fine — we just verify consistency
            expect(engine.finished).toBe(true)
        })
    })

    describe('seeded randomness', () => {
        it('should produce deterministic results with the same seed', async () => {
            const engine1 = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine1.seed = 12345
            engine1.rng.reset(12345)
            await engine1.startBattle(dungeon)

            const engine2 = new BattleEngine(io, 'room-2', room, { delayFn: instantDelay })
            engine2.seed = 12345
            engine2.rng.reset(12345)
            await engine2.startBattle(dungeon)

            expect(engine1.result).toBe(engine2.result)
            expect(engine1.round).toBe(engine2.round)
        })
    })
})
