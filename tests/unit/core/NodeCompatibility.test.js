import { describe, it, expect } from 'vitest'

describe('Node.js module compatibility', () => {
    it('should import PositioningSystem', async () => {
        const mod = await import('@/systems/PositioningSystem.js')
        expect(mod.PositioningSystem).toBeDefined()
    })

    it('should import TurnOrderSystem', async () => {
        const mod = await import('@/systems/TurnOrderSystem.js')
        expect(mod.TurnOrderSystem).toBeDefined()
        expect(mod.TurnOrderSystem.createTurnState).toBeTypeOf('function')
    })

    it('should import ThreatSystem', async () => {
        const mod = await import('@/systems/ThreatSystem.js')
        expect(mod.ThreatSystem).toBeDefined()
        expect(mod.ThreatSystem.createThreatState).toBeTypeOf('function')
    })

    it('should import BossPhaseSystem', async () => {
        const mod = await import('@/systems/BossPhaseSystem.js')
        expect(mod.BossPhaseSystem).toBeDefined()
    })

    it('should import ActionPointSystem', async () => {
        const mod = await import('@/systems/ActionPointSystem.js')
        expect(mod.ActionPointSystem).toBeDefined()
    })

    it('should import LootSystem', async () => {
        const mod = await import('@/systems/LootSystem.js')
        expect(mod.default).toBeDefined()
    })

    it('should import PartyFormationSystem', async () => {
        const mod = await import('@/systems/PartyFormationSystem.js')
        expect(mod.PartyFormationSystem).toBeDefined()
    })

    it('should import SeededRandom and RandomProvider', async () => {
        const seeded = await import('@/core/SeededRandom.js')
        expect(seeded.SeededRandom).toBeDefined()
        expect(seeded.globalRandom).toBeDefined()

        const provider = await import('@/core/RandomProvider.js')
        expect(provider.random).toBeTypeOf('function')
        expect(provider.randomInt).toBeTypeOf('function')
        expect(provider.randomChoice).toBeTypeOf('function')
        expect(provider.shuffle).toBeTypeOf('function')
        expect(provider.chance).toBeTypeOf('function')
    })

    it('should import EventBus', async () => {
        const mod = await import('@/core/EventBus.js')
        expect(mod.EventBus).toBeDefined()
        const bus = new mod.EventBus()
        expect(bus.on).toBeTypeOf('function')
        expect(bus.emit).toBeTypeOf('function')
    })
})
