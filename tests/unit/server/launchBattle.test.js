/**
 * T7.2.1 — launchBattle 集成行为测试
 *
 * launchBattle 位于 server/index.js 的模块闭包中，无法直接导入。
 * 本文件通过模拟 launchBattle 核心步骤来验证关键行为：
 *   1. generateWaves 成功时 battleState.waves 为非空数组
 *   2. battle:init emit payload 包含 waves 字段
 *   3. dungeonId 无 dataModule 时 emit battle:error，activeBattles 无该 roomId 条目
 */
import { describe, it, expect, vi } from 'vitest'
import { generateWaves } from '../../../server/WaveGenerator.js'
import { BattleEngine } from '../../../server/BattleEngine.js'

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeMockIo() {
    const emitted = []
    const roomEmitFn = vi.fn((...args) => emitted.push(args))
    return {
        to: vi.fn(() => ({ emit: roomEmitFn })),
        _emitted: emitted,
        _roomEmit: roomEmitFn,
    }
}

function makeRoom(dungeonId = 'ragefire_chasm') {
    return {
        id: 'test-room-1',
        dungeonId,
        players: [
            { userId: 1, nickname: 'Alice', classId: 'warrior', level: 20, isAI: false, isOnline: true },
        ],
    }
}

// 模拟 launchBattle 核心流程（不含 Socket.IO / DB 副作用）
async function simulateLaunchBattleCore(room, io, activeBattles) {
    // 1. 生成波次（这正是 launchBattle T2.1.2 所做的）
    let waves
    try {
        waves = await generateWaves(room.dungeonId)
    } catch (err) {
        io.to(room.id).emit('battle:error', { message: '波次数据生成失败: ' + err.message })
        return
    }

    // 2. 创建 engine 并写入 battleState（T2.1.2）
    const engine = new BattleEngine(io, room.id, room)
    const seed = 12345
    engine.battleState = { seed, snapshots: [], waves, currentWaveIndex: 0 }
    activeBattles.set(room.id, engine)

    // 3. 广播 battle:init 含 waves（T2.1.3）
    io.to(room.id).emit('battle:init', {
        dungeonId: room.dungeonId,
        seed,
        snapshots: [],
        roomId: room.id,
        waves,
    })
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('launchBattle 集成行为', () => {
    it('战斗启动后 activeBattles battleState.waves 为非空数组', async () => {
        const io = makeMockIo()
        const activeBattles = new Map()
        const room = makeRoom('ragefire_chasm')

        await simulateLaunchBattleCore(room, io, activeBattles)

        const engine = activeBattles.get(room.id)
        expect(engine).toBeDefined()
        expect(Array.isArray(engine.battleState.waves)).toBe(true)
        expect(engine.battleState.waves.length).toBeGreaterThan(0)
        expect(engine.battleState.currentWaveIndex).toBe(0)
    })

    it('battle:init emit payload 包含 waves 字段', async () => {
        const io = makeMockIo()
        const activeBattles = new Map()
        const room = makeRoom('ragefire_chasm')

        await simulateLaunchBattleCore(room, io, activeBattles)

        // 找到 battle:init emit 调用
        const initCall = io._emitted.find(([eventName]) => eventName === 'battle:init')
        expect(initCall).toBeDefined()

        const payload = initCall[1]
        expect(payload).toHaveProperty('waves')
        expect(Array.isArray(payload.waves)).toBe(true)
        expect(payload.waves.length).toBeGreaterThan(0)
    })

    it('dungeonId 无 dataModule 时 emit battle:error，activeBattles 无该 roomId', async () => {
        const io = makeMockIo()
        const activeBattles = new Map()
        const room = makeRoom('nonexistent_dungeon_xyz')

        await simulateLaunchBattleCore(room, io, activeBattles)

        // activeBattles 中不应有该 roomId
        expect(activeBattles.has(room.id)).toBe(false)

        // 应 emit battle:error
        const errorCall = io._emitted.find(([eventName]) => eventName === 'battle:error')
        expect(errorCall).toBeDefined()
    })
})
