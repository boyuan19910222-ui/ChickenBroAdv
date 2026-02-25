import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BroadcastEventBus } from '../../../server/BroadcastEventBus.js'

describe('BroadcastEventBus', () => {
    let bus
    let mockIo

    beforeEach(() => {
        mockIo = {
            to: vi.fn().mockReturnThis(),
            emit: vi.fn(),
        }
    })

    describe('with io and roomId', () => {
        beforeEach(() => {
            bus = new BroadcastEventBus(mockIo, 'room-123')
        })

        it('should trigger local listeners on emit', () => {
            const handler = vi.fn()
            bus.on('test:event', handler)

            bus.emit('test:event', { foo: 'bar' })

            expect(handler).toHaveBeenCalledWith({ foo: 'bar' })
            expect(handler).toHaveBeenCalledTimes(1)
        })

        it('should broadcast via Socket.IO on emit', () => {
            bus.emit('battle:action', { damage: 42 })

            expect(mockIo.to).toHaveBeenCalledWith('room-123')
            expect(mockIo.emit).toHaveBeenCalledWith('battle:event', {
                event: 'battle:action',
                data: { damage: 42 },
            })
        })

        it('should do both local + broadcast simultaneously', () => {
            const handler = vi.fn()
            bus.on('combo:hit', handler)

            bus.emit('combo:hit', { value: 99 })

            expect(handler).toHaveBeenCalledWith({ value: 99 })
            expect(mockIo.to).toHaveBeenCalledWith('room-123')
            expect(mockIo.emit).toHaveBeenCalledWith('battle:event', {
                event: 'combo:hit',
                data: { value: 99 },
            })
        })

        it('should support once listeners', () => {
            const handler = vi.fn()
            bus.once('one:time', handler)

            bus.emit('one:time', 'a')
            bus.emit('one:time', 'b')

            expect(handler).toHaveBeenCalledTimes(1)
            expect(handler).toHaveBeenCalledWith('a')
            // Both emits still broadcast
            expect(mockIo.emit).toHaveBeenCalledTimes(2)
        })

        it('should support off to remove listeners', () => {
            const handler = vi.fn()
            bus.on('remove:me', handler)
            bus.off('remove:me', handler)

            bus.emit('remove:me', {})

            expect(handler).not.toHaveBeenCalled()
            // Still broadcasts
            expect(mockIo.emit).toHaveBeenCalledTimes(1)
        })
    })

    describe('without io (local-only mode)', () => {
        it('should only trigger local listeners when io is null', () => {
            bus = new BroadcastEventBus(null, null)
            const handler = vi.fn()
            bus.on('local:only', handler)

            bus.emit('local:only', 'data')

            expect(handler).toHaveBeenCalledWith('data')
        })

        it('should not throw when io is undefined', () => {
            bus = new BroadcastEventBus(undefined, undefined)

            expect(() => bus.emit('safe', {})).not.toThrow()
        })
    })

    describe('without roomId', () => {
        it('should only trigger local listeners when roomId is null', () => {
            bus = new BroadcastEventBus(mockIo, null)
            const handler = vi.fn()
            bus.on('no:room', handler)

            bus.emit('no:room', 'x')

            expect(handler).toHaveBeenCalledWith('x')
            expect(mockIo.to).not.toHaveBeenCalled()
        })
    })

    describe('clear', () => {
        it('should clear all listeners', () => {
            bus = new BroadcastEventBus(mockIo, 'room-1')
            const handler = vi.fn()
            bus.on('test', handler)
            bus.clear()

            bus.emit('test', 'after-clear')

            expect(handler).not.toHaveBeenCalled()
            // Broadcast still fires
            expect(mockIo.emit).toHaveBeenCalledTimes(1)
        })
    })
})
