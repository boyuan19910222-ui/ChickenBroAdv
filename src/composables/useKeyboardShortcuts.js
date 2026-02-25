/**
 * useKeyboardShortcuts - 全局键盘快捷键 composable
 * 在 GameView.vue 中挂载，根据当前场景分发不同操作
 *
 * 快捷键方案:
 *   全局:
 *     Escape      — 关闭浮层 / 退出副本确认
 *     S           — 快速保存
 *     M           — 打开区域选择
 *     T           — 打开天赋面板
 *     1/2/3/4     — 切换右侧面板标签(装备/背包/任务/技能)
 *
 *   探索场景:
 *     E / Space   — 探索
 *     R           — 休息
 *     A           — 自动探索切换
 *
 *   野外战斗:
 *     Space / 1   — 普通攻击
 *     D / 2       — 防御
 *     F / 3       — 逃跑
 *     A           — 自动战斗切换
 *     4~9         — 使用技能(按技能列表顺序)
 *
 *   副本战斗:
 *     Space / 1   — 普通攻击
 *     D / 2       — 防御
 *     Enter       — 开始结算
 *     A           — 自动战斗切换
 *     4~9         — 使用技能
 *     Q           — 退出副本
 */
import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'

export function useKeyboardShortcuts({
    showAreaSelection,
    showTalents,
    saveGame,
    enterDungeon,
    exitGame,
}) {
    const gameStore = useGameStore()

    function handleKeydown(e) {
        // 忽略输入框中的按键
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return
        }

        const key = e.key.toLowerCase()
        const scene = gameStore.currentScene

        // ---- 浮层处理 (最高优先级) ----
        if (key === 'escape') {
            if (showTalents.value) {
                showTalents.value = false
                e.preventDefault()
                return
            }
            if (showAreaSelection.value) {
                showAreaSelection.value = false
                e.preventDefault()
                return
            }
        }

        // 浮层打开时不处理其他快捷键
        if (showTalents.value || showAreaSelection.value) {
            return
        }

        // ---- 全局快捷键 ----
        if (key === 's' && !e.ctrlKey && !e.metaKey) {
            saveGame()
            e.preventDefault()
            return
        }

        if (key === 'm') {
            showAreaSelection.value = true
            e.preventDefault()
            return
        }

        if (key === 't') {
            showTalents.value = true
            e.preventDefault()
            return
        }

        // 右侧面板标签切换 (仅非战斗数字键，Shift+数字)
        if (e.shiftKey && ['1', '2', '3', '4'].includes(e.key)) {
            const tabs = ['equipment', 'inventory', 'quests', 'skills']
            const idx = parseInt(e.key) - 1
            gameStore.eventBus?.emit('ui:switchTab', tabs[idx])
            e.preventDefault()
            return
        }

        // ---- 场景特定快捷键 ----
        if (scene === 'exploration') {
            handleExplorationKeys(e, key)
        } else if (scene === 'combat') {
            handleCombatKeys(e, key)
        } else if (scene === 'dungeon') {
            handleDungeonKeys(e, key)
        }
    }

    function handleExplorationKeys(e, key) {
        if (key === 'e' || key === ' ') {
            gameStore.eventBus?.emit('shortcut:explore')
            e.preventDefault()
        } else if (key === 'r') {
            gameStore.eventBus?.emit('shortcut:rest')
            e.preventDefault()
        } else if (key === 'a') {
            gameStore.eventBus?.emit('shortcut:autoExplore')
            e.preventDefault()
        }
    }

    function handleCombatKeys(e, key) {
        if (key === ' ' || key === '1') {
            gameStore.eventBus?.emit('shortcut:attack')
            e.preventDefault()
        } else if (key === 'd' || key === '2') {
            gameStore.eventBus?.emit('shortcut:defend')
            e.preventDefault()
        } else if (key === 'f' || key === '3') {
            gameStore.eventBus?.emit('shortcut:flee')
            e.preventDefault()
        } else if (key === 'a') {
            gameStore.eventBus?.emit('shortcut:autoBattle')
            e.preventDefault()
        } else if (key >= '4' && key <= '9') {
            const skillIndex = parseInt(key) - 4
            gameStore.eventBus?.emit('shortcut:useSkill', { index: skillIndex })
            e.preventDefault()
        }
    }

    function handleDungeonKeys(e, key) {
        if (key === ' ' || key === '1') {
            gameStore.eventBus?.emit('shortcut:attack')
            e.preventDefault()
        } else if (key === 'd' || key === '2') {
            gameStore.eventBus?.emit('shortcut:defend')
            e.preventDefault()
        } else if (key === 'enter') {
            gameStore.eventBus?.emit('shortcut:execute')
            e.preventDefault()
        } else if (key === 'a') {
            gameStore.eventBus?.emit('shortcut:autoBattle')
            e.preventDefault()
        } else if (key === 'q') {
            gameStore.eventBus?.emit('shortcut:exitDungeon')
            e.preventDefault()
        } else if (key >= '4' && key <= '9') {
            const skillIndex = parseInt(key) - 4
            gameStore.eventBus?.emit('shortcut:useSkill', { index: skillIndex })
            e.preventDefault()
        }
    }

    onMounted(() => {
        document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown)
    })
}
