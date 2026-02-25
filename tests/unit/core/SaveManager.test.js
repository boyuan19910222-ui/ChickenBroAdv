import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SaveManager } from '../../../src/core/SaveManager.js'
import { CURRENT_VERSION } from '../../../src/core/SaveMigration.js'

// Mock localStorage for Node.js environment
function createMockLocalStorage() {
    const store = {}
    return {
        getItem: vi.fn((key) => store[key] ?? null),
        setItem: vi.fn((key, value) => { store[key] = value }),
        removeItem: vi.fn((key) => { delete store[key] }),
        clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
        _store: store,
    }
}

describe('SaveManager', () => {
    let sm, mockStorage, eventBus

    beforeEach(() => {
        mockStorage = createMockLocalStorage()
        global.localStorage = mockStorage

        eventBus = {
            emit: vi.fn(),
            on: vi.fn(),
        }

        sm = new SaveManager(eventBus)
    })

    // Helper: seed a save into localStorage
    function seedSave(slot, playerData) {
        const saveData = {
            version: CURRENT_VERSION,
            timestamp: new Date().toISOString(),
            syncStatus: 'local',
            slot,
            data: {
                player: {
                    name: 'TestHero',
                    class: 'warrior',
                    classId: 'warrior',
                    level: 20,
                    talents: {},
                    stats: { health: 500, mana: 50, strength: 30, agility: 10, intellect: 5, stamina: 20, spirit: 5 },
                    baseStats: { health: 100, mana: 50, strength: 20, agility: 10, intellect: 5, stamina: 15, spirit: 5 },
                    equipment: {
                        head: null, shoulders: null, chest: null, legs: null,
                        hands: null, wrists: null, waist: null, feet: null,
                        back: null, neck: null, finger1: null, finger2: null,
                        trinket1: null, trinket2: null, mainHand: null, offHand: null,
                    },
                    skills: ['heroicStrike', 'charge'],
                    resource: { type: 'rage', current: 0, max: 100, baseMax: 100 },
                    comboPoints: null,
                    currentHp: 500,
                    maxHp: 500,
                    inventory: [],
                    gold: 100,
                    ...playerData,
                },
            },
        }
        const key = `chickenBro_save_${slot}`
        mockStorage.setItem(key, JSON.stringify(saveData))
    }

    describe('exportSnapshot', () => {
        it('should extract correct fields from save data', () => {
            seedSave(1, {})
            const snapshot = sm.exportSnapshot(1)

            expect(snapshot).not.toBeNull()
            expect(snapshot.name).toBe('TestHero')
            expect(snapshot.classId).toBe('warrior')
            expect(snapshot.level).toBe(20)
            expect(snapshot.talents).toEqual({})
            expect(snapshot.skills).toEqual(['heroicStrike', 'charge'])
            expect(snapshot.resource).toEqual({ type: 'rage', current: 0, max: 100, baseMax: 100 })
            expect(snapshot.comboPoints).toBeNull()
            expect(snapshot.currentHp).toBe(500)
            expect(snapshot.maxHp).toBe(500)
        })

        it('should deep-copy stats and equipment (not reference)', () => {
            seedSave(1, {})
            const snapshot = sm.exportSnapshot(1)

            // Load again and check they are different object references
            const gameState = sm.load(1)
            expect(snapshot.stats).not.toBe(gameState.player.stats)
            expect(snapshot.stats).toEqual(gameState.player.stats)
            expect(snapshot.equipment).not.toBe(gameState.player.equipment)
        })

        it('should return null for empty slot', () => {
            const snapshot = sm.exportSnapshot(99)
            expect(snapshot).toBeNull()
        })

        it('should return null if save has no player data', () => {
            const key = 'chickenBro_save_1'
            mockStorage.setItem(key, JSON.stringify({
                version: CURRENT_VERSION,
                timestamp: new Date().toISOString(),
                slot: 1,
                data: { settings: {} }, // no player
            }))
            const snapshot = sm.exportSnapshot(1)
            expect(snapshot).toBeNull()
        })

        it('should export snapshot for rogue with comboPoints', () => {
            seedSave(1, {
                class: 'rogue',
                classId: 'rogue',
                comboPoints: { current: 3, max: 5 },
            })
            const snapshot = sm.exportSnapshot(1)

            expect(snapshot.classId).toBe('rogue')
            expect(snapshot.comboPoints).toEqual({ current: 3, max: 5 })
        })

        it('should fallback to player.class if classId is missing', () => {
            seedSave(1, { classId: undefined, class: 'paladin' })
            const snapshot = sm.exportSnapshot(1)
            expect(snapshot.classId).toBe('paladin')
        })

        it('should handle missing optional fields gracefully', () => {
            seedSave(1, {
                talents: undefined,
                skills: undefined,
                resource: undefined,
                stats: undefined,
                baseStats: undefined,
            })
            const snapshot = sm.exportSnapshot(1)

            expect(snapshot).not.toBeNull()
            expect(snapshot.talents).toEqual({})
            expect(snapshot.skills).toEqual([])
            expect(snapshot.resource).toBeNull()
            expect(snapshot.stats).toEqual({})
            expect(snapshot.baseStats).toEqual({})
        })
    })

    describe('applyLootToSave', () => {
        it('should add items to existing inventory', () => {
            seedSave(1, { inventory: [{ id: 'existing', name: 'Old Item' }] })

            const newItems = [
                { id: 'loot_1', name: 'Epic Sword', quality: 'epic' },
                { id: 'loot_2', name: 'Rare Shield', quality: 'rare' },
            ]
            const result = sm.applyLootToSave(newItems, 1)

            expect(result).toBe(true)

            // Reload and check
            const state = sm.load(1)
            expect(state.player.inventory).toHaveLength(3)
            expect(state.player.inventory[0].id).toBe('existing')
            expect(state.player.inventory[1].id).toBe('loot_1')
            expect(state.player.inventory[2].id).toBe('loot_2')
        })

        it('should create inventory array if missing', () => {
            seedSave(1, { inventory: undefined })

            // Force remove inventory from saved data
            const key = 'chickenBro_save_1'
            const saved = JSON.parse(mockStorage._store[key])
            delete saved.data.player.inventory
            mockStorage.setItem(key, JSON.stringify(saved))

            const newItems = [{ id: 'loot_1', name: 'New Sword' }]
            const result = sm.applyLootToSave(newItems, 1)

            expect(result).toBe(true)
            const state = sm.load(1)
            expect(state.player.inventory).toHaveLength(1)
            expect(state.player.inventory[0].id).toBe('loot_1')
        })

        it('should return false for empty slot', () => {
            const result = sm.applyLootToSave([{ id: 'item' }], 99)
            expect(result).toBe(false)
        })

        it('should handle empty items array', () => {
            seedSave(1, { inventory: [] })
            const result = sm.applyLootToSave([], 1)
            expect(result).toBe(true)
            const state = sm.load(1)
            expect(state.player.inventory).toHaveLength(0)
        })

        it('should persist through save call', () => {
            seedSave(1, { inventory: [] })

            const items = [{ id: 'loot_1', name: 'Sword' }]
            sm.applyLootToSave(items, 1)

            // Verify eventBus.emit was called for save:complete
            expect(eventBus.emit).toHaveBeenCalledWith(
                'save:complete',
                expect.objectContaining({ slot: 1 })
            )
        })
    })
})
