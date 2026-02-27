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
import { useAuthStore } from '../stores/authStore.js';

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
        const { dungeonId, seed, snapshots, roomId, waves } = initData;
        const multiplayerStore = useMultiplayerStore();
        const gameStore = useGameStore();
        const authStore = useAuthStore();

        console.log(`[MultiplayerDungeonAdapter] 启动多人副本: ${dungeonId}, seed=${seed}, players=${snapshots?.length}`);

        // 1. 保存当前随机数实例，设置种子随机数
        this.previousRandom = getRandom();
        const seededRandom = new SeededRandom(seed);
        setRandom(seededRandom);

        // 2. 获取当前用户ID
        const currentUserId = this._resolveCurrentUserId(multiplayerStore, authStore);
        if (currentUserId == null) {
            console.error('[MultiplayerDungeonAdapter] 无法获取当前用户ID');
            this.cleanup();
            return;
        }
        const normalizedCurrentUserId = String(currentUserId);

        // 3. 构建队伍
        const party = PartyFormationSystem.createDungeonPartyFromSnapshots(snapshots, normalizedCurrentUserId);
        if (!party || party.length === 0) {
            console.error('[MultiplayerDungeonAdapter] 队伍构建失败');
            this.cleanup();
            return;
        }

        // 4. 找到当前用户的角色快照作为 player 数据
        const mySnapshot = snapshots.find(s => String(s.ownerId) === normalizedCurrentUserId);
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

        // 8. 监听 battle:reward Socket 事件
        if (multiplayerStore.socket) {
            const onReward = ({ userId, items, alreadyClaimed }) => {
                if (String(userId) === normalizedCurrentUserId) {
                    console.log('[MultiplayerDungeonAdapter] 收到个人掉落:', items?.length, '件, 已发放:', alreadyClaimed);
                    multiplayerStore.lootItems = items || [];

                    if (alreadyClaimed) {
                        // 服务端已发放，从服务器同步最新 game_state
                        console.log('[MultiplayerDungeonAdapter] 服务端已发放奖励，从服务器同步 game_state');
                        this._syncFromServer();
                    }

                    gameStore.eventBus.emit('multiplayer:lootReceived', { items, alreadyClaimed });
                }
            };
            const onFinished = () => {
                console.log('[MultiplayerDungeonAdapter] 服务端结算完成');
                gameStore.eventBus.emit('multiplayer:battleFinished');
            };

            multiplayerStore.socket.on('battle:reward', onReward);
            multiplayerStore.socket.on('battle:finished_server', onFinished);
            this._cleanupFns.push(() => {
                multiplayerStore.socket?.off('battle:reward', onReward);
                multiplayerStore.socket?.off('battle:finished_server', onFinished);
            });
        }

        // 9. 将 DungeonCombatSystem 挂载到 gameStore 以便 DungeonCombatView 访问
        gameStore.$patch({ _multiplayerDungeonSystem: this.dungeonCombatSystem });

        // 10. 监听波次完成事件，上报服务端（用于断线重连时恢复进度）
        const onEncounterVictory = (data) => {
            if (multiplayerStore.socket?.connected) {
                multiplayerStore.socket.emit('battle:wave_progress', {
                    roomId,
                    waveIndex:   data.encounterIndex,
                    totalWaves:  data.totalEncounters,
                })
                console.log(`[MultiplayerDungeonAdapter] 上报波次进度: ${data.encounterIndex}/${data.totalEncounters}`)
            }
        }
        gameStore.eventBus.on('dungeon:encounterVictory', onEncounterVictory)
        this._cleanupFns.push(() => gameStore.eventBus.off('dungeon:encounterVictory', onEncounterVictory))

        // 11a. 监听服务端广播的 battle:wave_updated，同步其他成员的波次进度到 eventBus
        if (multiplayerStore.socket) {
            const onWaveUpdated = ({ waveIndex, totalWaves }) => {
                gameStore.eventBus.emit('multiplayer:waveUpdated', { waveIndex, totalWaves })
            }
            multiplayerStore.socket.on('battle:wave_updated', onWaveUpdated)
            this._cleanupFns.push(() => multiplayerStore.socket?.off('battle:wave_updated', onWaveUpdated))
        }

        // 11. 启动多人模式副本（rejoin 时从已记录的波次索引继续）
        const startEncounterIndex = (initData.rejoin && initData.currentWaveIndex > 0)
            ? initData.currentWaveIndex
            : 0
        if (startEncounterIndex > 0) {
            console.log(`[MultiplayerDungeonAdapter] 断线重连，从第 ${startEncounterIndex} 波继续`)
        }
        // 若服务端提供了波次快照，优先使用；否则降级到客户端 seed 随机逻辑
        const wavesOption = Array.isArray(waves) && waves.length > 0 ? waves : undefined
        await this.dungeonCombatSystem.startDungeonMultiplayer(dungeonId, party, { startEncounterIndex, waves: wavesOption })
    }

    _resolveCurrentUserId(multiplayerStore, authStore) {
        const candidates = [
            multiplayerStore?.user?.id,
            authStore?.user?.id,
        ];

        try {
            const localUser = JSON.parse(localStorage.getItem('mp_user') || 'null');
            candidates.push(localUser?.id);
        } catch (error) {
            console.warn('[MultiplayerDungeonAdapter] 读取本地用户信息失败:', error);
        }

        const matched = candidates.find(id => id !== undefined && id !== null && id !== '');
        return matched ?? null;
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
     * 从服务器同步最新的 game_state（服务端奖励发放后调用）
     * @private
     */
    async _syncFromServer() {
        const gameStore = useGameStore();
        const characterId = gameStore.currentCharacterId;
        if (!characterId) {
            console.warn('[MultiplayerDungeonAdapter] 无 characterId，无法同步 game_state');
            return;
        }

        try {
            const token = localStorage.getItem('mp_token');
            if (!token) {
                console.warn('[MultiplayerDungeonAdapter] 无 token，无法同步 game_state');
                return;
            }

            const apiHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://127.0.0.1:3001'
                : `http://${window.location.hostname}:3001`;
            const url = `${apiHost}/api/characters/${characterId}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('[MultiplayerDungeonAdapter] 同步 game_state 失败:', response.status);
                return;
            }

            const data = await response.json();
            const characterData = data.character;

            if (characterData && characterData.game_state && characterData.game_state.player) {
                // 记录同步前的背包大小，用于计算新增物品
                const oldInventorySize = gameStore.player?.inventory?.length || 0;

                // 更新 gameStore.player（使用 $patch 触发响应式更新）
                gameStore.$patch({ player: characterData.game_state.player });

                // 触发掉落日志（只记录新增的物品）
                const newInventory = characterData.game_state.player.inventory || [];
                const newItems = newInventory.slice(oldInventorySize);

                if (newItems.length > 0) {
                    const { QualityConfig } = await import('@/data/EquipmentData.js');
                    for (const item of newItems) {
                        const qualityCfg = QualityConfig?.[item.quality];
                        const logMessage = `${qualityCfg?.emoji || '📦'} ${item.name} (iLvl ${item.itemLevel}) — 装备掉落`;
                        gameStore.eventBus?.emit('loot:log', logMessage);
                    }
                }
            }
        } catch (error) {
            console.error('[MultiplayerDungeonAdapter] 同步 game_state 出错:', error);
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
