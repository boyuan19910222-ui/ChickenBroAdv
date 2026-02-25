import { describe, it, expect, vi } from 'vitest'
import { EventBus } from '@/core/EventBus.js'

describe('EventBus', () => {
    describe('on / emit', () => {
        it('should call listener when event is emitted', () => {
            const bus = new EventBus()
            const callback = vi.fn()

            bus.on('test', callback)
            bus.emit('test', { value: 42 })

            expect(callback).toHaveBeenCalledTimes(1)
            expect(callback).toHaveBeenCalledWith({ value: 42 })
        })

        it('should support multiple listeners for the same event', () => {
            const bus = new EventBus()
            const cb1 = vi.fn()
            const cb2 = vi.fn()

            bus.on('test', cb1)
            bus.on('test', cb2)
            bus.emit('test', 'data')

            expect(cb1).toHaveBeenCalledTimes(1)
            expect(cb2).toHaveBeenCalledTimes(1)
        })

        it('should not call listeners for other events', () => {
            const bus = new EventBus()
            const callback = vi.fn()

            bus.on('eventA', callback)
            bus.emit('eventB', 'data')

            expect(callback).not.toHaveBeenCalled()
        })

        it('should call listener on every emit', () => {
            const bus = new EventBus()
            const callback = vi.fn()

            bus.on('test', callback)
            bus.emit('test', 1)
            bus.emit('test', 2)
            bus.emit('test', 3)

            expect(callback).toHaveBeenCalledTimes(3)
        })
    })

    describe('once', () => {
        it('should call listener only once', () => {
            const bus = new EventBus()
            const callback = vi.fn()

            bus.once('test', callback)
            bus.emit('test', 'first')
            bus.emit('test', 'second')

            expect(callback).toHaveBeenCalledTimes(1)
            expect(callback).toHaveBeenCalledWith('first')
        })
    })

    describe('off', () => {
        it('should remove a specific listener', () => {
            const bus = new EventBus()
            const callback = vi.fn()

            bus.on('test', callback)
            bus.off('test', callback)
            bus.emit('test', 'data')

            expect(callback).not.toHaveBeenCalled()
        })

        it('should only remove the specified listener', () => {
            const bus = new EventBus()
            const cb1 = vi.fn()
            const cb2 = vi.fn()

            bus.on('test', cb1)
            bus.on('test', cb2)
            bus.off('test', cb1)
            bus.emit('test', 'data')

            expect(cb1).not.toHaveBeenCalled()
            expect(cb2).toHaveBeenCalledTimes(1)
        })

        it('should return unsubscribe function from on()', () => {
            const bus = new EventBus()
            const callback = vi.fn()

            const unsub = bus.on('test', callback)
            unsub()
            bus.emit('test', 'data')

            expect(callback).not.toHaveBeenCalled()
        })

        it('should also remove once listeners', () => {
            const bus = new EventBus()
            const callback = vi.fn()

            bus.once('test', callback)
            bus.off('test', callback)
            bus.emit('test', 'data')

            expect(callback).not.toHaveBeenCalled()
        })
    })

    describe('clear', () => {
        it('should remove all listeners', () => {
            const bus = new EventBus()
            const cb1 = vi.fn()
            const cb2 = vi.fn()
            const cb3 = vi.fn()

            bus.on('eventA', cb1)
            bus.on('eventB', cb2)
            bus.once('eventC', cb3)

            bus.clear()

            bus.emit('eventA')
            bus.emit('eventB')
            bus.emit('eventC')

            expect(cb1).not.toHaveBeenCalled()
            expect(cb2).not.toHaveBeenCalled()
            expect(cb3).not.toHaveBeenCalled()
        })
    })

    describe('error handling', () => {
        it('should not crash if a listener throws', () => {
            const bus = new EventBus()
            const errorCb = vi.fn(() => { throw new Error('listener error') })
            const normalCb = vi.fn()

            bus.on('test', errorCb)
            bus.on('test', normalCb)

            // Should not throw
            expect(() => bus.emit('test', 'data')).not.toThrow()
            expect(errorCb).toHaveBeenCalledTimes(1)
            expect(normalCb).toHaveBeenCalledTimes(1)
        })

        it('should not crash if a once listener throws', () => {
            const bus = new EventBus()
            const errorCb = vi.fn(() => { throw new Error('once error') })
            const normalCb = vi.fn()

            bus.once('test', errorCb)
            bus.once('test', normalCb)

            expect(() => bus.emit('test', 'data')).not.toThrow()
            expect(errorCb).toHaveBeenCalledTimes(1)
            expect(normalCb).toHaveBeenCalledTimes(1)
        })

        it('should handle emitting an event with no listeners', () => {
            const bus = new EventBus()
            expect(() => bus.emit('nonexistent', 'data')).not.toThrow()
        })
    })
})
