import { describe, it, expect } from 'vitest'
import { SeededRandom, globalRandom } from '@/core/SeededRandom.js'

describe('SeededRandom', () => {
    describe('determinism', () => {
        it('should produce identical sequences with the same seed', () => {
            const rng1 = new SeededRandom(42)
            const rng2 = new SeededRandom(42)

            const seq1 = Array.from({ length: 100 }, () => rng1.next())
            const seq2 = Array.from({ length: 100 }, () => rng2.next())

            expect(seq1).toEqual(seq2)
        })

        it('should produce different sequences with different seeds', () => {
            const rng1 = new SeededRandom(42)
            const rng2 = new SeededRandom(999)

            const seq1 = Array.from({ length: 20 }, () => rng1.next())
            const seq2 = Array.from({ length: 20 }, () => rng2.next())

            expect(seq1).not.toEqual(seq2)
        })
    })

    describe('random()', () => {
        it('should return values in [0, 1)', () => {
            const rng = new SeededRandom(123)
            for (let i = 0; i < 1000; i++) {
                const val = rng.random()
                expect(val).toBeGreaterThanOrEqual(0)
                expect(val).toBeLessThan(1)
            }
        })
    })

    describe('randomInt(min, max)', () => {
        it('should return integers within the specified range', () => {
            const rng = new SeededRandom(456)
            const min = 5
            const max = 15

            for (let i = 0; i < 500; i++) {
                const val = rng.randomInt(min, max)
                expect(val).toBeGreaterThanOrEqual(min)
                expect(val).toBeLessThanOrEqual(max)
                expect(Number.isInteger(val)).toBe(true)
            }
        })

        it('should return min when min === max', () => {
            const rng = new SeededRandom(789)
            expect(rng.randomInt(7, 7)).toBe(7)
        })

        it('should cover all values in range over many samples', () => {
            const rng = new SeededRandom(101)
            const seen = new Set()
            for (let i = 0; i < 1000; i++) {
                seen.add(rng.randomInt(0, 4))
            }
            expect(seen.size).toBe(5) // 0, 1, 2, 3, 4
        })
    })

    describe('randomChoice(array)', () => {
        it('should return an element from the array', () => {
            const rng = new SeededRandom(202)
            const arr = ['a', 'b', 'c', 'd']

            for (let i = 0; i < 100; i++) {
                expect(arr).toContain(rng.randomChoice(arr))
            }
        })

        it('should eventually pick all elements', () => {
            const rng = new SeededRandom(303)
            const arr = ['x', 'y', 'z']
            const seen = new Set()
            for (let i = 0; i < 1000; i++) {
                seen.add(rng.randomChoice(arr))
            }
            expect(seen.size).toBe(3)
        })
    })

    describe('shuffle(array)', () => {
        it('should return an array with the same elements', () => {
            const rng = new SeededRandom(404)
            const original = [1, 2, 3, 4, 5]
            const shuffled = rng.shuffle(original)

            expect(shuffled).toHaveLength(original.length)
            expect(shuffled.sort()).toEqual([...original].sort())
        })

        it('should not mutate the original array', () => {
            const rng = new SeededRandom(505)
            const original = [1, 2, 3, 4, 5]
            const copy = [...original]
            rng.shuffle(original)

            expect(original).toEqual(copy)
        })

        it('should produce different orderings with different seeds', () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            const rng1 = new SeededRandom(606)
            const rng2 = new SeededRandom(707)

            const shuffled1 = rng1.shuffle(arr)
            const shuffled2 = rng2.shuffle(arr)

            // Very unlikely to be identical for 10 elements
            expect(shuffled1).not.toEqual(shuffled2)
        })
    })

    describe('chance(percent)', () => {
        it('should return true roughly according to the percentage', () => {
            const rng = new SeededRandom(808)
            let trueCount = 0
            const trials = 10000

            for (let i = 0; i < trials; i++) {
                if (rng.chance(50)) trueCount++
            }

            // With 10000 trials and 50%, expect ~5000 ± 300
            expect(trueCount).toBeGreaterThan(4500)
            expect(trueCount).toBeLessThan(5500)
        })

        it('should return false for 0%', () => {
            const rng = new SeededRandom(909)
            for (let i = 0; i < 100; i++) {
                expect(rng.chance(0)).toBe(false)
            }
        })

        it('should return true for 100%', () => {
            const rng = new SeededRandom(1010)
            for (let i = 0; i < 100; i++) {
                expect(rng.chance(100)).toBe(true)
            }
        })
    })

    describe('reset()', () => {
        it('should reproduce the same sequence after reset', () => {
            const rng = new SeededRandom(42)
            const seq1 = Array.from({ length: 10 }, () => rng.next())

            rng.reset()
            const seq2 = Array.from({ length: 10 }, () => rng.next())

            expect(seq1).toEqual(seq2)
        })

        it('should accept a new seed on reset', () => {
            const rng = new SeededRandom(42)
            rng.next()
            rng.next()
            rng.reset(999)

            const rng2 = new SeededRandom(999)
            expect(rng.next()).toBe(rng2.next())
        })
    })

    describe('globalRandom', () => {
        it('should be an instance of SeededRandom', () => {
            expect(globalRandom).toBeInstanceOf(SeededRandom)
        })
    })
})
