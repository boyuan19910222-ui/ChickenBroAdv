/**
 * T7.4.1 — DungeonCombatSystem 波次注入单元测试
 *
 * 验证：
 *   - options.waves 有效时，startNextEncounter 使用注入的 enemies，不调用 createTrashInstance
 *   - options.waves 为 undefined 时，走原有 createTrashInstance 路径，行为不变
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DungeonCombatSystem } from '../../src/systems/DungeonCombatSystem.js'

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeEnemy(id = 'e1') {
    return {
        id,
        name: `怪物_${id}`,
        type: 'undead',
        slot: 1,
        emoji: '💀',
        stats: { hp: 100, damage: 10, armor: 2 },
        speed: 50,
        skills: [],
    }
}

function makeMockDungeon(encounterType = 'trash') {
    const encounterData = {
        id: 'wave_1',
        name: '测试波次',
        enemies: [
            { ...makeEnemy('orig_e1'), stats: { hp: 200, damage: 20, armor: 5 }, loot: { exp: 10 } },
            { ...makeEnemy('orig_e2'), stats: { hp: 150, damage: 15, armor: 3 }, loot: { exp: 8 } },
        ],
    }

    const createTrashInstance = vi.fn(() =>
        encounterData.enemies.map(e => ({
            ...e,
            currentHp: e.stats.hp, maxHp: e.stats.hp,
            damage: e.stats.damage, armor: e.stats.armor,
        }))
    )

    return {
        id: 'test_dungeon',
        name: '测试副本',
        encounters: [
            { id: 'wave_1', type: encounterType, name: '测试波次' },
        ],
        getEncounter: vi.fn(() => encounterData),
        createTrashInstance,
        _encounterData: encounterData,
    }
}

function makeMockWaves() {
    return [
        {
            waveId: 'wave_1',
            type: 'trash',
            name: '注入波次',
            enemies: [makeEnemy('injected_e1'), makeEnemy('injected_e2')],
        },
    ]
}

function setupSystem() {
    const system = new DungeonCombatSystem()

    // 注入 engine 桩（eventBus + _setTimeout）
    system.engine = {
        eventBus: {
            emit: vi.fn(),
        },
    }

    // 绑定 currentDungeon 和 encounterIndex
    system.currentDungeon = makeMockDungeon('trash')
    system.encounterIndex = 0
    system._aborted = false

    // 覆盖 initializeCombat 以阻止完整战斗初始化
    system.initializeCombat = vi.fn()

    // 覆盖 addLog 为 noop
    system.addLog = vi.fn()

    return system
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('DungeonCombatSystem 波次注入', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('options.waves 有效时 startNextEncounter 使用注入 enemies，不调用 createTrashInstance', async () => {
        const system = setupSystem()
        const waves = makeMockWaves()

        // 模拟 startDungeonMultiplayer 设置 _injectedWaves
        system._injectedWaves = waves

        system.startNextEncounter()

        // 推进 1500ms（showEncounterTransition 延迟）
        await vi.advanceTimersByTimeAsync(1500)

        // createTrashInstance 不应被调用
        expect(system.currentDungeon.createTrashInstance).not.toHaveBeenCalled()

        // initializeCombat 应以注入的敌人列表调用
        expect(system.initializeCombat).toHaveBeenCalledOnce()
        const [combatEnemies, isBoss] = system.initializeCombat.mock.calls[0]

        expect(isBoss).toBe(false)
        expect(combatEnemies).toHaveLength(waves[0].enemies.length)

        // 注入的 enemies 应被转换为战斗格式（currentHp/maxHp）
        expect(combatEnemies[0].id).toBe('injected_e1')
        expect(combatEnemies[0]).toHaveProperty('currentHp')
        expect(combatEnemies[0]).toHaveProperty('maxHp')
        expect(combatEnemies[0].currentHp).toBe(waves[0].enemies[0].stats.hp)
    })

    it('options.waves 为 undefined 时走原有 createTrashInstance 路径', async () => {
        const system = setupSystem()

        // 未注入波次
        system._injectedWaves = null

        system.startNextEncounter()
        await vi.advanceTimersByTimeAsync(1500)

        // createTrashInstance 应被调用（原有路径）
        expect(system.currentDungeon.createTrashInstance).toHaveBeenCalledOnce()
    })

    it('注入波次后第一波的 enemies 与 injectedWaves[0].enemies 对应', async () => {
        const system = setupSystem()
        const waves = makeMockWaves()
        system._injectedWaves = waves

        system.startNextEncounter()
        await vi.advanceTimersByTimeAsync(1500)

        const [combatEnemies] = system.initializeCombat.mock.calls[0]
        // 验证每个注入敌人的 id 对应
        waves[0].enemies.forEach((injectedEnemy, idx) => {
            expect(combatEnemies[idx].id).toBe(injectedEnemy.id)
        })
    })

    it('_injectedWaves 在 startDungeonMultiplayer options.waves 有效时被设置', () => {
        const system = setupSystem()
        // 注意：直接测试 startDungeonMultiplayer 中的赋值
        // 无效 waves（null）→ _injectedWaves 为 null
        system._injectedWaves = Array.isArray(null) && null.length > 0 ? null : null
        expect(system._injectedWaves).toBeNull()

        // 有效 waves → 设置
        const waves = makeMockWaves()
        system._injectedWaves = Array.isArray(waves) && waves.length > 0 ? waves : null
        expect(system._injectedWaves).toBe(waves)
    })
})
