/**
 * MultiplayerDungeonAdapter
 * 
 * 集合石多人模式的客户端编排层。
 * 负责：
 *   1. 接收 battle:init 数据（dungeonId, seed, snapshots）
 *   2. 调用 PartyFormationSystem.createDungeonPartyFromSnapshots() 构建队伍
 *   3. 设置 RandomProvider 种子（确保所有客户端一致）
 *   4. 创建 MultiplayerEngineAdapter 提供 engine 接口
 *   5. 初始化并启动 DungeonCombatSystem（autoPlayMode）
 *   6. 监听 dungeon:complete / dungeon:defeat 事件，上报 battle:complete
 *   7. 监听 battle:loot Socket 事件，存储到 multiplayerStore
 */

import { DungeonCombatSystem } from './DungeonCombatSystem.js';
import { MultiplayerEngineAdapter } from './MultiplayerEngineAdapter.js';
import { PartyFormationSystem } from './PartyFormationSystem.js';
import { SeededRandom } from '../core/SeededRandom.js';
import { setRandom, getRandom } from '../core/RandomProvider.js';
import { useMultiplayerStore } from '../stores/multiplayerStore.js';
import { useGameStore } from '../stores/gameStore.js';

export class MultiplayerDungeonAdapter {
    constructor() {
        this.dungeonCombatSystem = null;
        this.engineAdapter = null;
        this.previousRandom = null; // 保存之前的随机数实例，战斗结束后恢复
        this._cleanupFns = [];
    }

    /**
     * 从 battle:init 数据启动多人副本战斗
     * @param {Object} initData - 服务端 battle:init 事件数据
     *   { dungeonId, seed, snapshots, roomId }
     */
    async start(initData) {
        const { dungeonId, seed, snapshots, roomId } = initData;
        const multiplayerStore = useMultiplayerStore();
        const gameStore = useGameStore();

        console.log(`[MultiplayerDungeonAdapter] 启动多人副本: ${dungeonId}, seed=${seed}, players=${snapshots?.length}`);

        // 1. 保存当前随机数实例，设置种子随机数
        this.previousRandom = getRandom();
        const seededRandom = new SeededRandom(seed);
        setRandom(seededRandom);

        // 2. 获取当前用户ID
        const currentUserId = multiplayerStore.user?.id;
        if (!currentUserId) {
            console.error('[MultiplayerDungeonAdapter] 无法获取当前用户ID');
            this.cleanup();
            return;
        }

        // 3. 构建队伍
        const party = PartyFormationSystem.createDungeonPartyFromSnapshots(snapshots, currentUserId);
        if (!party || party.length === 0) {
            console.error('[MultiplayerDungeonAdapter] 队伍构建失败');
            this.cleanup();
            return;
        }

        // 4. 找到当前用户的角色快照作为 player 数据
        const mySnapshot = snapshots.find(s => s.ownerId === currentUserId);
        const playerSnapshot = mySnapshot || snapshots[0];

        // 5. 创建 MultiplayerEngineAdapter
        this.engineAdapter = new MultiplayerEngineAdapter(gameStore.eventBus, playerSnapshot);

        // 6. 创建并初始化 DungeonCombatSystem
        this.dungeonCombatSystem = new DungeonCombatSystem();
        this.dungeonCombatSystem.init(this.engineAdapter);

        // 7. 监听战斗结束事件
        const onComplete = (data) => {
            console.log('[MultiplayerDungeonAdapter] 副本通关', data);
            this._reportBattleResult('victory', data, roomId);
        };
        const onDefeat = (data) => {
            console.log('[MultiplayerDungeonAdapter] 副本失败', data);
            this._reportBattleResult('defeat', data, roomId);
        };
        
        gameStore.eventBus.on('dungeon:complete', onComplete);
        gameStore.eventBus.on('dungeon:defeat', onDefeat);
        this._cleanupFns.push(() => {
            gameStore.eventBus.off('dungeon:complete', onComplete);
            gameStore.eventBus.off('dungeon:defeat', onDefeat);
        });

        // 8. 监听 battle:loot Socket 事件
        if (multiplayerStore.socket) {
            const onLoot = ({ userId, items }) => {
                if (userId === currentUserId) {
                    console.log('[MultiplayerDungeonAdapter] 收到个人掉落:', items?.length, '件');
                    multiplayerStore.lootItems = items || [];
                    gameStore.eventBus.emit('multiplayer:lootReceived', { items });
                }
            };
            const onFinished = () => {
                console.log('[MultiplayerDungeonAdapter] 服务端结算完成');
                gameStore.eventBus.emit('multiplayer:battleFinished');
            };
            
            multiplayerStore.socket.on('battle:loot', onLoot);
            multiplayerStore.socket.on('battle:finished_server', onFinished);
            this._cleanupFns.push(() => {
                multiplayerStore.socket?.off('battle:loot', onLoot);
                multiplayerStore.socket?.off('battle:finished_server', onFinished);
            });
        }

        // 9. 将 DungeonCombatSystem 挂载到 gameStore 以便 DungeonCombatView 访问
        gameStore.$patch({ _multiplayerDungeonSystem: this.dungeonCombatSystem });

        // 10. 启动多人模式副本
        await this.dungeonCombatSystem.startDungeonMultiplayer(dungeonId, party);
    }

    /**
     * 向服务端上报战斗结果
     * @param {'victory' | 'defeat'} result - 战斗结果
     * @param {Object} data - 事件数据
     * @param {string} roomId - 房间ID
     * @private
     */
    _reportBattleResult(result, data, roomId) {
        const multiplayerStore = useMultiplayerStore();
        
        if (multiplayerStore.socket?.connected) {
            multiplayerStore.socket.emit('battle:complete', {
                roomId,
                result,
                dungeonId: data?.dungeon?.id || this.dungeonCombatSystem?.currentDungeon?.id,
            });
            console.log(`[MultiplayerDungeonAdapter] 已上报战斗结果: ${result}`);
        } else {
            console.warn('[MultiplayerDungeonAdapter] Socket 未连接，无法上报战斗结果');
        }
    }

    /**
     * 清理资源，恢复状态
     */
    cleanup() {
        // 执行所有清理回调
        for (const fn of this._cleanupFns) {
            try { fn(); } catch (e) { console.warn('[MultiplayerDungeonAdapter] cleanup error:', e); }
        }
        this._cleanupFns = [];

        // 恢复之前的随机数实例
        if (this.previousRandom) {
            setRandom(this.previousRandom);
            this.previousRandom = null;
        }

        // 清理 gameStore 上的引用
        try {
            const gameStore = useGameStore();
            gameStore.$patch({ _multiplayerDungeonSystem: null });
        } catch (e) { /* ignore */ }

        // 中止战斗循环（清除所有 pending setTimeout）
        if (this.dungeonCombatSystem) {
            this.dungeonCombatSystem.abortBattle();
        }

        this.dungeonCombatSystem = null;
        this.engineAdapter = null;

        console.log('[MultiplayerDungeonAdapter] 已清理');
    }
}
