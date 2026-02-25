import { describe, it, expect, beforeEach } from 'vitest'
import { RoomManager } from '../../../server/rooms.js'

function mockUser(id, nickname) {
    return { id, username: `user${id}`, nickname: nickname || `Player${id}` }
}

describe('RoomManager - Snapshot Validation', () => {
    let rm

    beforeEach(() => {
        rm = new RoomManager({
            timerFn: () => 'fake-timer',
            clearFn: () => {},
        })
    })

    describe('validateSnapshot', () => {
        it('should accept a valid snapshot', () => {
            const snapshot = {
                name: '勇者小明',
                classId: 'warrior',
                level: 20,
            }
            const result = rm.validateSnapshot(snapshot)
            expect(result.valid).toBe(true)
            expect(result.error).toBe('')
        })

        it('should accept all 9 valid class IDs', () => {
            const validClasses = ['warrior', 'paladin', 'rogue', 'hunter', 'mage', 'warlock', 'priest', 'shaman', 'druid']
            for (const classId of validClasses) {
                const result = rm.validateSnapshot({ name: 'Test', classId, level: 1 })
                expect(result.valid).toBe(true)
            }
        })

        it('should reject null/undefined snapshot', () => {
            expect(rm.validateSnapshot(null).valid).toBe(false)
            expect(rm.validateSnapshot(undefined).valid).toBe(false)
        })

        it('should reject non-object snapshot', () => {
            expect(rm.validateSnapshot('string').valid).toBe(false)
            expect(rm.validateSnapshot(123).valid).toBe(false)
        })

        // --- name validation ---
        it('should reject empty name', () => {
            const result = rm.validateSnapshot({ name: '', classId: 'warrior', level: 1 })
            expect(result.valid).toBe(false)
            expect(result.error).toContain('名称')
        })

        it('should reject name longer than 20 characters', () => {
            const result = rm.validateSnapshot({ name: 'A'.repeat(21), classId: 'warrior', level: 1 })
            expect(result.valid).toBe(false)
            expect(result.error).toContain('名称')
        })

        it('should reject non-string name', () => {
            const result = rm.validateSnapshot({ name: 123, classId: 'warrior', level: 1 })
            expect(result.valid).toBe(false)
        })

        it('should accept name at boundary lengths (1 and 20)', () => {
            expect(rm.validateSnapshot({ name: 'A', classId: 'warrior', level: 1 }).valid).toBe(true)
            expect(rm.validateSnapshot({ name: 'A'.repeat(20), classId: 'warrior', level: 1 }).valid).toBe(true)
        })

        // --- classId validation ---
        it('should reject invalid classId', () => {
            const result = rm.validateSnapshot({ name: 'Test', classId: 'death_knight', level: 1 })
            expect(result.valid).toBe(false)
            expect(result.error).toContain('职业')
        })

        it('should reject missing classId', () => {
            const result = rm.validateSnapshot({ name: 'Test', level: 1 })
            expect(result.valid).toBe(false)
        })

        // --- level validation ---
        it('should reject level below 1', () => {
            const result = rm.validateSnapshot({ name: 'Test', classId: 'warrior', level: 0 })
            expect(result.valid).toBe(false)
            expect(result.error).toContain('等级')
        })

        it('should reject level above 60', () => {
            const result = rm.validateSnapshot({ name: 'Test', classId: 'warrior', level: 61 })
            expect(result.valid).toBe(false)
            expect(result.error).toContain('等级')
        })

        it('should reject non-integer level', () => {
            const result = rm.validateSnapshot({ name: 'Test', classId: 'warrior', level: 10.5 })
            expect(result.valid).toBe(false)
        })

        it('should reject non-number level', () => {
            const result = rm.validateSnapshot({ name: 'Test', classId: 'warrior', level: '10' })
            expect(result.valid).toBe(false)
        })

        it('should accept level at boundaries (1 and 60)', () => {
            expect(rm.validateSnapshot({ name: 'Test', classId: 'warrior', level: 1 }).valid).toBe(true)
            expect(rm.validateSnapshot({ name: 'Test', classId: 'warrior', level: 60 }).valid).toBe(true)
        })
    })

    describe('joinRoom with snapshot validation', () => {
        it('should reject joining with an invalid snapshot', () => {
            const host = mockUser(1, 'Host')
            const createResult = rm.createRoom(host, 'dungeon_01', 'Test')
            const roomId = createResult.room.id

            const joiner = mockUser(2, 'Joiner')
            const invalidSnapshot = { name: '', classId: 'warrior', level: 1 }
            const result = rm.joinRoom(roomId, joiner, invalidSnapshot)

            expect(result.error).toBe('INVALID_SNAPSHOT')
        })

        it('should allow joining with a valid snapshot', () => {
            const host = mockUser(1, 'Host')
            const createResult = rm.createRoom(host, 'dungeon_01', 'Test')
            const roomId = createResult.room.id

            const joiner = mockUser(2, 'Joiner')
            const validSnapshot = { name: 'TestChar', classId: 'mage', level: 30 }
            const result = rm.joinRoom(roomId, joiner, validSnapshot)

            expect(result.error).toBeUndefined()
            expect(result.room.players).toHaveLength(2)
        })

        it('should allow joining without a snapshot (null)', () => {
            const host = mockUser(1, 'Host')
            const createResult = rm.createRoom(host, 'dungeon_01', 'Test')
            const roomId = createResult.room.id

            const joiner = mockUser(2, 'Joiner')
            const result = rm.joinRoom(roomId, joiner, null)

            expect(result.error).toBeUndefined()
            expect(result.room.players).toHaveLength(2)
        })

        it('should not add player to room when snapshot is invalid', () => {
            const host = mockUser(1, 'Host')
            const createResult = rm.createRoom(host, 'dungeon_01', 'Test')
            const roomId = createResult.room.id

            const joiner = mockUser(2, 'Joiner')
            const invalidSnapshot = { name: 'Test', classId: 'invalid_class', level: 10 }
            rm.joinRoom(roomId, joiner, invalidSnapshot)

            const room = rm.getRoom(roomId)
            expect(room.players).toHaveLength(1) // only host
        })
    })
})
