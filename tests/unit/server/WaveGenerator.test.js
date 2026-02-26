import { describe, it, expect } from 'vitest'
import { generateWaves } from '../../../server/WaveGenerator.js'

// T7.1.1 — WaveGenerator 单元测试
describe('WaveGenerator', () => {
    describe('generateWaves', () => {
        // ── ragefire_chasm ───────────────────────────────────────────
        it('ragefire_chasm: 返回数组，长度等于 encounters 数组长度', async () => {
            const waves = await generateWaves('ragefire_chasm')

            expect(Array.isArray(waves)).toBe(true)
            expect(waves.length).toBeGreaterThan(0)

            // 与副本 encounters 数量一致（ragefire_chasm 有12个）
            const { RagefireChasm } = await import('../../../src/data/dungeons/RagefireChasm.js')
            expect(waves.length).toBe(RagefireChasm.encounters.length)
        })

        it('ragefire_chasm: 每个 Wave 元素含必需字段，enemies 非空', async () => {
            const waves = await generateWaves('ragefire_chasm')

            for (const wave of waves) {
                expect(wave).toHaveProperty('waveId')
                expect(wave).toHaveProperty('type')
                expect(wave).toHaveProperty('name')
                expect(wave).toHaveProperty('enemies')
                expect(Array.isArray(wave.enemies)).toBe(true)
                expect(wave.enemies.length).toBeGreaterThan(0)
            }
        })

        it('ragefire_chasm: enemies[0] 包含所有必需字段', async () => {
            const waves = await generateWaves('ragefire_chasm')
            const firstTrashWave = waves.find(w => w.type === 'trash')
            expect(firstTrashWave).toBeDefined()

            const enemy = firstTrashWave.enemies[0]
            expect(enemy).toHaveProperty('id')
            expect(enemy).toHaveProperty('name')
            expect(enemy).toHaveProperty('type')
            expect(enemy).toHaveProperty('slot')
            expect(enemy).toHaveProperty('emoji')
            expect(enemy).toHaveProperty('stats')
            expect(enemy).toHaveProperty('speed')
            expect(enemy).toHaveProperty('skills')
            expect(Array.isArray(enemy.skills)).toBe(true)
        })

        it('ragefire_chasm: enemies[0].stats 含 hp, damage, armor', async () => {
            const waves = await generateWaves('ragefire_chasm')
            const trashWave = waves.find(w => w.type === 'trash')

            const stats = trashWave.enemies[0].stats
            expect(stats).toHaveProperty('hp')
            expect(stats).toHaveProperty('damage')
            expect(stats).toHaveProperty('armor')
            expect(typeof stats.hp).toBe('number')
            expect(typeof stats.damage).toBe('number')
            expect(typeof stats.armor).toBe('number')
        })

        it('ragefire_chasm: enemies 不含 loot 字段（精简字段验证）', async () => {
            const waves = await generateWaves('ragefire_chasm')
            const trashWave = waves.find(w => w.type === 'trash')

            for (const enemy of trashWave.enemies) {
                expect(enemy).not.toHaveProperty('loot')
            }
        })

        // ── wailing_caverns ──────────────────────────────────────────
        it('wailing_caverns: 正常返回，验证多副本兼容', async () => {
            const waves = await generateWaves('wailing_caverns')

            expect(Array.isArray(waves)).toBe(true)
            expect(waves.length).toBeGreaterThan(0)

            for (const wave of waves) {
                expect(wave.enemies.length).toBeGreaterThan(0)
                const enemy = wave.enemies[0]
                expect(enemy.stats).toHaveProperty('hp')
                expect(enemy.stats).toHaveProperty('damage')
                expect(enemy.stats).toHaveProperty('armor')
                expect(Array.isArray(enemy.skills)).toBe(true)
            }
        })

        // ── 错误处理 ─────────────────────────────────────────────────
        it('nonexistent_dungeon: 抛出含 dungeonId 的 Error', async () => {
            await expect(generateWaves('nonexistent_dungeon'))
                .rejects
                .toThrow('nonexistent_dungeon')
        })

        it('nonexistent_dungeon: 错误对象是 Error 实例', async () => {
            await expect(generateWaves('nonexistent_dungeon'))
                .rejects
                .toBeInstanceOf(Error)
        })
    })
})
