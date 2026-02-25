import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BattleEngine } from '../../../server/BattleEngine.js'

const instantDelay = () => Promise.resolve()

function makeRoom(overrides = {}) {
    return {
        id: 'room-loot-1',
        hostId: 1,
        dungeonId: 'wailing_caverns',
        dungeonName: 'Wailing Caverns',
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
            { userId: -1, nickname: 'AI盗贼1', classId: 'rogue', level: 20, role: 'melee_dps', isAI: true, isOnline: true, snapshot: null },
            { userId: -2, nickname: 'AI法师1', classId: 'mage', level: 20, role: 'ranged_dps', isAI: true, isOnline: true, snapshot: null },
            { userId: -3, nickname: 'AI猎人1', classId: 'hunter', level: 20, role: 'ranged_dps', isAI: true, isOnline: true, snapshot: null },
        ],
        ...overrides,
    }
}

function makeDungeonMeta(overrides = {}) {
    return {
        id: 'wailing_caverns',
        name: 'Wailing Caverns',
        levelRange: { min: 17, max: 24 },
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

describe('BattleEngine - Personal Loot', () => {
    let io, room, dungeon, engine

    beforeEach(() => {
        io = makeMockIo()
        room = makeRoom()
        dungeon = makeDungeonMeta()
    })

    describe('generatePersonalLoot', () => {
        it('should generate loot for each online human player', () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.party = engine._buildParty()
            engine.seed = 42

            const lootResults = engine.generatePersonalLoot()

            // Player 1 (Alice) and Player 2 (Bob) should get loot
            expect(lootResults).toHaveProperty('1')
            expect(lootResults).toHaveProperty('2')

            // Each should have items
            expect(lootResults[1].length).toBeGreaterThan(0)
            expect(lootResults[2].length).toBeGreaterThan(0)
        })

        it('should not generate loot for AI players', () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.party = engine._buildParty()
            engine.seed = 42

            const lootResults = engine.generatePersonalLoot()

            // AI players have negative IDs
            expect(lootResults).not.toHaveProperty('-1')
            expect(lootResults).not.toHaveProperty('-2')
            expect(lootResults).not.toHaveProperty('-3')
        })

        it('should not generate loot for disconnected players', () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.party = engine._buildParty()
            engine.seed = 42

            // Disconnect Alice
            engine.handleDisconnect(1)

            const lootResults = engine.generatePersonalLoot()

            // Alice should not get loot, Bob should
            expect(lootResults).not.toHaveProperty('1')
            expect(lootResults).toHaveProperty('2')
        })

        it('should give different items to different players (different seeds)', () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.party = engine._buildParty()
            engine.seed = 42

            const lootResults = engine.generatePersonalLoot()

            const aliceItems = lootResults[1]
            const bobItems = lootResults[2]

            // Items should differ (at least one property) because seeds differ
            // Compare item IDs or names — they should not be identical
            const aliceIds = aliceItems.map(i => i.id || i.instanceId).join(',')
            const bobIds = bobItems.map(i => i.id || i.instanceId).join(',')
            expect(aliceIds).not.toBe(bobIds)
        })

        it('should produce deterministic results with the same seed', () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.party = engine._buildParty()
            engine.seed = 12345

            const loot1 = engine.generatePersonalLoot()

            // Create a second engine with the same seed
            const engine2 = new BattleEngine(io, 'room-2', room, { delayFn: instantDelay })
            engine2.party = engine2._buildParty()
            engine2.seed = 12345

            const loot2 = engine2.generatePersonalLoot()

            // Same number of items per player
            expect(loot1[1].length).toBe(loot2[1].length)
            expect(loot1[2].length).toBe(loot2[2].length)

            // Same quality for each item (since seed is deterministic)
            for (let i = 0; i < loot1[1].length; i++) {
                expect(loot1[1][i].quality).toBe(loot2[1][i].quality)
                expect(loot1[1][i].slot).toBe(loot2[1][i].slot)
            }
        })
    })

    describe('loot generation via battle flow', () => {
        it('should emit battle:loot for each online player on victory', async () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.seed = 42
            engine.rng.reset(42)
            await engine.startBattle(dungeon)

            if (engine.result === 'victory') {
                // Check that battle:loot was emitted
                const toEmitCalls = io.to.mock.results
                    .map(r => r.value.emit.mock.calls)
                    .flat()

                const lootEvents = toEmitCalls.filter(([event]) => event === 'battle:loot')
                expect(lootEvents.length).toBeGreaterThanOrEqual(1)

                // Each loot event should have userId and items
                for (const [, payload] of lootEvents) {
                    expect(payload).toHaveProperty('userId')
                    expect(payload).toHaveProperty('items')
                    expect(Array.isArray(payload.items)).toBe(true)
                }
            }
        })

        it('should store loot results in lastLootResults on victory', async () => {
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.seed = 42
            engine.rng.reset(42)
            await engine.startBattle(dungeon)

            if (engine.result === 'victory') {
                expect(engine.lastLootResults).toBeDefined()
                expect(typeof engine.lastLootResults).toBe('object')
            }
        })
    })

    describe('loot items structure', () => {
        it('should produce items with standard equipment fields', () => {
            // Use a dungeon that has DungeonLootConfig (wailing_caverns)
            engine = new BattleEngine(io, 'room-1', room, { delayFn: instantDelay })
            engine.party = engine._buildParty()
            engine.seed = 42

            const lootResults = engine.generatePersonalLoot()
            const items = lootResults[1]

            for (const item of items) {
                // Each item should have at minimum: type, quality, name
                expect(item).toHaveProperty('quality')
                expect(item).toHaveProperty('name')
                expect(typeof item.name).toBe('string')
                expect(item.name.length).toBeGreaterThan(0)
            }
        })
    })

    describe('fallback loot for unknown dungeons', () => {
        it('should generate simple loot when no DungeonLootConfig exists', () => {
            const unknownRoom = makeRoom({ dungeonId: 'unknown_dungeon_xyz' })
            engine = new BattleEngine(io, 'room-1', unknownRoom, { delayFn: instantDelay })
            engine.party = engine._buildParty()
            engine.seed = 42

            const lootResults = engine.generatePersonalLoot()

            expect(lootResults).toHaveProperty('1')
            expect(lootResults[1].length).toBeGreaterThan(0)
            expect(lootResults[1][0]).toHaveProperty('name')
        })
    })
})
