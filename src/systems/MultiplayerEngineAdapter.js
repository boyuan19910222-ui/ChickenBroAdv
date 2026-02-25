/**
 * MultiplayerEngineAdapter
 * 
 * 轻量级引擎适配器，为多人模式下的 DungeonCombatSystem 提供 engine 接口。
 * DungeonCombatSystem.init(engine) 需要 engine 提供：
 *   - eventBus (~70 uses): emit/on 事件总线
 *   - stateManager (~14 uses): get/set 状态管理
 *   - getSystem(name): 获取子系统（仅 'combat' 被使用 1 次）
 *   - saveGame(): 存档（仅 completeDungeon 使用 1 次，autoPlayMode 下已跳过）
 * 
 * 多人模式下：
 *   - eventBus 复用 gameStore.eventBus（共享 UI 事件通道）
 *   - stateManager 提供适配实现（get('player') 返回快照数据，set 为空操作）
 *   - getSystem 返回 null（autoPlayMode 下不需要 CombatSystem 的脱战恢复）
 *   - saveGame 为空操作
 */

export class MultiplayerEngineAdapter {
    /**
     * @param {Object} eventBus - 事件总线实例（来自 gameStore.eventBus）
     * @param {Object} playerSnapshot - 当前用户的角色快照数据
     */
    constructor(eventBus, playerSnapshot) {
        this.eventBus = eventBus;
        this._playerSnapshot = playerSnapshot;
        
        // stateManager 适配实现
        this.stateManager = {
            _state: {
                player: playerSnapshot ? { ...playerSnapshot } : null,
            },
            
            get: (path) => {
                if (path === 'player') {
                    return this.stateManager._state.player;
                }
                // 其他路径返回 null（多人模式不需要）
                console.warn(`[MultiplayerEngineAdapter] stateManager.get('${path}') - 多人模式下未实现`);
                return null;
            },
            
            set: (path, value, silent) => {
                if (path === 'player') {
                    // 在多人模式下，player 状态更新仅在内存中（不持久化）
                    this.stateManager._state.player = value;
                    return;
                }
                // 其他 set 操作静默忽略
                console.debug(`[MultiplayerEngineAdapter] stateManager.set('${path}') - 多人模式下忽略`);
            },
            
            snapshot: () => {
                return { player: this.stateManager._state.player };
            },
            
            restore: () => {
                console.warn('[MultiplayerEngineAdapter] stateManager.restore() - 多人模式下不支持');
            }
        };
    }

    /**
     * 获取子系统（多人模式下返回 null）
     * DungeonCombatSystem 仅在 resetPlayerStateAfterDungeon 中调用 getSystem('combat')
     * autoPlayMode 下该方法已被跳过
     */
    getSystem(name) {
        console.debug(`[MultiplayerEngineAdapter] getSystem('${name}') - 多人模式下返回 null`);
        return null;
    }

    /**
     * 存档（多人模式下为空操作）
     * autoPlayMode 下 completeDungeon 已跳过此调用
     */
    saveGame() {
        console.debug('[MultiplayerEngineAdapter] saveGame() - 多人模式下忽略');
    }

    /**
     * 更新玩家快照数据
     * @param {Object} snapshot - 新的玩家快照
     */
    updatePlayerSnapshot(snapshot) {
        this._playerSnapshot = snapshot;
        this.stateManager._state.player = { ...snapshot };
    }
}
