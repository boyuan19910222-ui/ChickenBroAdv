/**
 * T7.3.1 — MultiplayerDungeonAdapter.start() 单元测试
 *
 * 验证：
 *   - initData.waves 为有效数组时，startDungeonMultiplayer options 携带 waves
 *   - initData.waves 为 undefined 时，startDungeonMultiplayer options 不含 waves
 *   - 两种情况下 SeededRandom 均被正确初始化
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Vue Store Mocks ──────────────────────────────────────────────────────────
const mockEventBus = {
    on:  vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
}
const mockSocket = {
    on:  vi.fn(),
    off: vi.fn(),
    connected: false,
}
const mockMultiplayerStore = {
    socket: mockSocket,
    user: { id: 1 },
    lootItems: [],
    $patch: vi.fn(),
}
const mockGameStore = {
    eventBus: mockEventBus,
    $patch: vi.fn(),
}
const mockAuthStore = {
    user: { id: 1 },
}

vi.mock('../../src/stores/multiplayerStore.js', () => ({
    useMultiplayerStore: () => mockMultiplayerStore,
}))
vi.mock('../../src/stores/gameStore.js', () => ({
    useGameStore: () => mockGameStore,
}))
vi.mock('../../src/stores/authStore.js', () => ({
    useAuthStore: () => mockAuthStore,
}))

// ── DungeonCombatSystem mock ─────────────────────────────────────────────────
const mockDungeonCombatSystem = {
    init: vi.fn(),
    startDungeonMultiplayer: vi.fn().mockResolvedValue(undefined),
    abortBattle: vi.fn(),
}

vi.mock('../../src/systems/DungeonCombatSystem.js', () => ({
    DungeonCombatSystem: vi.fn(function DungeonCombatSystem() {
        Object.assign(this, mockDungeonCombatSystem)
    }),
}))

// ── MultiplayerEngineAdapter mock ────────────────────────────────────
vi.mock('../../src/systems/MultiplayerEngineAdapter.js', () => ({
    MultiplayerEngineAdapter: vi.fn(function MultiplayerEngineAdapter() {
        this.eventBus = mockEventBus
    }),
}))

// ── PartyFormationSystem mock ────────────────────────────────────────────────
vi.mock('../../src/systems/PartyFormationSystem.js', () => ({
    PartyFormationSystem: {
        createDungeonPartyFromSnapshots: vi.fn(() => [
            { id: 1, name: 'Alice', isPlayer: true, slot: 1 },
        ]),
    },
}))

// ── SeededRandom / RandomProvider mocks ──────────────────────────────────────
const mockSetRandom = vi.fn()
const mockGetRandom = vi.fn(() => null)
vi.mock('../../src/core/RandomProvider.js', () => ({
    setRandom: (...args) => mockSetRandom(...args),
    getRandom: () => mockGetRandom(),
}))

// SeededRandom 必须使用普通函数（可 new），不能用箭头函数
vi.mock('../../src/core/SeededRandom.js', () => ({
    SeededRandom: vi.fn(function SeededRandom(seed) {
        this.seed = seed
    }),
}))

// ── Subject under test & mocked modules ────────────────────────────────────
const { MultiplayerDungeonAdapter } = await import('../../src/systems/MultiplayerDungeonAdapter.js')
const { SeededRandom: MockSeededRandomCtor } = await import('../../src/core/SeededRandom.js')

// Node.js 环境无 localStorage，提供一个最简单的模拟
if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
}

// ── Fixtures ─────────────────────────────────────────────────────────────────
function makeInitData(overrides = {}) {
    return {
        dungeonId: 'ragefire_chasm',
        seed: 12345,
        snapshots: [
            { ownerId: 1, name: 'Alice', classId: 'warrior', level: 20 },
        ],
        roomId: 'room-1',
        ...overrides,
    }
}

const MOCK_WAVES = [
    { waveId: 'wave_1', type: 'trash', name: '入口', enemies: [{ id: 'e1', name: '骷髅', type: 'undead', slot: 1, emoji: '💀', stats: { hp: 100, damage: 10, armor: 2 }, speed: 50, skills: [] }] },
    { waveId: 'wave_2', type: 'trash', name: '通道', enemies: [{ id: 'e2', name: '幽灵', type: 'undead', slot: 1, emoji: '👻', stats: { hp: 80, damage: 12, armor: 0 }, speed: 60, skills: [] }] },
    { waveId: 'boss_1', type: 'boss',  name: 'BOSS', enemies: [{ id: 'b1', name: '恶魔领主', type: 'boss', slot: 2, emoji: '😈', stats: { hp: 500, damage: 30, armor: 10 }, speed: 40, skills: [] }] },
]

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('MultiplayerDungeonAdapter.start()', () => {
    let adapter

    beforeEach(() => {
        vi.clearAllMocks()
        mockDungeonCombatSystem.startDungeonMultiplayer.mockResolvedValue(undefined)
        adapter = new MultiplayerDungeonAdapter()
    })

    it('initData.waves 为有效数组时，startDungeonMultiplayer options 携带 waves', async () => {
        const initData = makeInitData({ waves: MOCK_WAVES })
        await adapter.start(initData)

        expect(mockDungeonCombatSystem.startDungeonMultiplayer).toHaveBeenCalledOnce()
        const [, , options] = mockDungeonCombatSystem.startDungeonMultiplayer.mock.calls[0]
        expect(options.waves).toBe(MOCK_WAVES)
    })

    it('initData.waves 为 undefined 时，startDungeonMultiplayer options 不含 waves（或 waves 为 undefined）', async () => {
        const initData = makeInitData({ waves: undefined })
        await adapter.start(initData)

        expect(mockDungeonCombatSystem.startDungeonMultiplayer).toHaveBeenCalledOnce()
        const [, , options] = mockDungeonCombatSystem.startDungeonMultiplayer.mock.calls[0]
        expect(options.waves).toBeUndefined()
    })

    it('initData.waves 为空数组时，startDungeonMultiplayer options 中 waves 为 undefined', async () => {
        const initData = makeInitData({ waves: [] })
        await adapter.start(initData)

        const [, , options] = mockDungeonCombatSystem.startDungeonMultiplayer.mock.calls[0]
        expect(options.waves).toBeUndefined()
    })

    it('waves 有效时 SeededRandom 仍被正确初始化', async () => {
        const initData = makeInitData({ waves: MOCK_WAVES })
        await adapter.start(initData)

        // SeededRandom 应以 seed 初始化
        expect(MockSeededRandomCtor).toHaveBeenCalledWith(initData.seed)
        // setRandom 应被调用，且参数是 SeededRandom 实例
        expect(mockSetRandom).toHaveBeenCalledOnce()
        const seededInstance = mockSetRandom.mock.calls[0][0]
        expect(seededInstance).toHaveProperty('seed', initData.seed)
    })

    it('waves 为 undefined 时 SeededRandom 同样被正确初始化', async () => {
        const initData = makeInitData({ waves: undefined })
        await adapter.start(initData)

        expect(MockSeededRandomCtor).toHaveBeenCalledWith(initData.seed)
        expect(mockSetRandom).toHaveBeenCalledOnce()
    })
})
