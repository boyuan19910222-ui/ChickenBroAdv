<template>
  <div class="exploration-view">
    <div class="area-info pixel-panel" v-if="currentArea">
      <h3>{{ currentArea.emoji }} {{ currentArea.name }}</h3>
      <p>{{ currentArea.description }}</p>
      <p class="level-range">等级范围: {{ currentArea.levelRange.min }}-{{ currentArea.levelRange.max }}</p>
    </div>

    <div class="exploration-actions">
      <button class="pixel-btn primary" @click="explore" :disabled="isResting || isAutoExploring">
        <span class="btn-icon">🗺️</span>
        <span>探索</span>
      </button>
      <button class="pixel-btn" @click="rest" :disabled="isResting || isAutoExploring">
        <span class="btn-icon">🏕️</span>
        <span>{{ isResting ? '休息中...' : '休息' }}</span>
      </button>
      <button
        class="pixel-btn"
        :class="{ 'auto-active': isAutoExploring }"
        @click="toggleAutoExplore"
        :disabled="isResting"
      >
        <span class="btn-icon">{{ isAutoExploring ? '⏹️' : '🔄' }}</span>
        <span>{{ isAutoExploring ? '停止挂机' : '自动探索' }}</span>
      </button>
    </div>

    <!-- 自动探索状态栏 -->
    <div v-if="isAutoExploring" class="auto-status-bar">
      <span class="auto-pulse-dot"></span>
      <span>自动探索中... 低血量({{ autoHpThreshold }}%)时自动休息</span>
    </div>

    <!-- 休息进度条 -->
    <div v-if="isResting" class="rest-progress-bar">
      <div class="rest-progress-fill" :style="{ width: restProgress + '%' }"></div>
      <span class="rest-progress-text">恢复中 {{ Math.floor(restProgress) }}%</span>
    </div>

    <div v-if="!currentArea" class="no-area">
      <p>请从顶部菜单选择一个区域开始探索</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'
import { GameData } from '@/data/GameData.js'
import { randomChoice } from '@/core/RandomProvider.js'

const gameStore = useGameStore()
const currentArea = ref(
  gameStore.engine?.stateManager?.get('currentArea') || GameData.areas.elwynnForest
)

const isResting = ref(false)
const restProgress = ref(0)
let restTimer = null

// ==================== 自动探索 ====================
const isAutoExploring = ref(false)
const autoHpThreshold = ref(30) // 低于此百分比自动休息
let autoExploreTimer = null
let autoListeners = []

// 区域切换监听
function onAreaEnter(area) {
  currentArea.value = area
}

// 组件重新挂载时，从全局标记恢复自动探索状态
// （场景从 combat 切回 exploration 时，ExplorationView 被重新创建）
onMounted(() => {
  // 监听区域切换事件
  const eventBus = gameStore.eventBus
  if (eventBus) {
    eventBus.on('area:enter', onAreaEnter)
  }

  // 同步一次当前区域（防止组件重建时丢失）
  const savedArea = gameStore.engine?.stateManager?.get('currentArea')
  if (savedArea) {
    currentArea.value = savedArea
  }

  if (gameStore.autoBattleEnabled && !isAutoExploring.value) {
    isAutoExploring.value = true
    // 重新注册 scene:change 监听
    if (eventBus) {
      const onSceneChange = (scene) => {
        if (scene === 'exploration' && isAutoExploring.value) {
          autoExploreTimer = setTimeout(() => autoExploreNext(), 1500)
        }
      }
      eventBus.on('scene:change', onSceneChange)
      autoListeners.push(['scene:change', onSceneChange])
    }
    // 恢复后立即启动下一轮自动探索（检查血量/资源，决定休息还是继续战斗）
    autoExploreTimer = setTimeout(() => autoExploreNext(), 1500)
  }
})

function toggleAutoExplore() {
  if (isAutoExploring.value) {
    stopAutoExplore()
  } else {
    startAutoExplore()
  }
}

function startAutoExplore() {
  if (!currentArea.value) {
    gameStore.addLog('❌ 请先选择一个探索区域！', 'system')
    return
  }
  isAutoExploring.value = true
  gameStore.addLog('🔄 开启自动探索模式', 'system')

  // 启用自动战斗标记（CombatView 会读取此标记）
  gameStore.autoBattleEnabled = true

  // 监听战斗结束事件（胜利/失败/逃跑后场景切回 exploration）
  const eventBus = gameStore.eventBus
  if (eventBus) {
    const onSceneChange = (scene) => {
      if (scene === 'exploration' && isAutoExploring.value) {
        // 回到探索后，检查血量决定休息还是继续
        autoExploreTimer = setTimeout(() => autoExploreNext(), 1500)
      }
    }
    eventBus.on('scene:change', onSceneChange)
    autoListeners.push(['scene:change', onSceneChange])
  }

  // 立即开始第一次探索
  autoExploreNext()
}

function stopAutoExplore() {
  isAutoExploring.value = false
  gameStore.autoBattleEnabled = false
  if (autoExploreTimer) {
    clearTimeout(autoExploreTimer)
    autoExploreTimer = null
  }
  // 清理监听
  const eventBus = gameStore.eventBus
  if (eventBus) {
    autoListeners.forEach(([event, fn]) => eventBus.off(event, fn))
  }
  autoListeners = []
  gameStore.addLog('⏹️ 停止自动探索', 'system')
}

function autoExploreNext() {
  if (!isAutoExploring.value) return
  if (gameStore.currentScene !== 'exploration') return

  const player = gameStore.stateManager?.get('player')
  if (!player) return

  const hpPercent = player.maxHp > 0 ? (player.currentHp / player.maxHp) * 100 : 0

  // 检查法力/资源值（怒气除外，怒气是战斗中产生的）
  let resourcePercent = 100
  if (player.resource && player.resource.type !== 'rage' && player.resource.max > 0) {
    resourcePercent = (player.resource.current / player.resource.max) * 100
  }

  // 生命值或法力值任一低于阈值，自动休息恢复至满
  const needsRest = hpPercent < autoHpThreshold.value || resourcePercent < autoHpThreshold.value
  if (needsRest) {
    const reasons = []
    if (hpPercent < autoHpThreshold.value) reasons.push(`血量${Math.floor(hpPercent)}%`)
    if (resourcePercent < autoHpThreshold.value) reasons.push(`资源${Math.floor(resourcePercent)}%`)
    gameStore.addLog(`🏕️ ${reasons.join('、')}较低，自动休息恢复...`, 'system')
    autoRest(() => {
      // 休息完成后继续探索
      if (isAutoExploring.value) {
        autoExploreTimer = setTimeout(() => autoExploreNext(), 800)
      }
    })
    return
  }

  // 开始探索（触发战斗）
  explore()
}

function autoRest(callback) {
  const player = gameStore.stateManager?.get('player')
  if (!player) { callback?.(); return }

  const hpFull = player.currentHp >= player.maxHp
  const resourceFull = !player.resource || player.resource.type === 'rage' || player.resource.current >= player.resource.max
  const pet = player.activePet
  const petNeedsHeal = pet && pet.isAlive && pet.currentHp < pet.maxHp
  if (hpFull && resourceFull && !petNeedsHeal) { callback?.(); return }

  const startHp = player.currentHp
  const targetHp = player.maxHp
  const startResource = (player.resource && player.resource.type !== 'rage') ? player.resource.current : null
  const targetResource = (player.resource && player.resource.type !== 'rage') ? player.resource.max : null
  const startPetHp = petNeedsHeal ? pet.currentHp : null
  const targetPetHp = petNeedsHeal ? pet.maxHp : null

  const hpMissingRatio = player.maxHp > 0 ? (targetHp - startHp) / player.maxHp : 0
  const resMissingRatio = targetResource != null && targetResource > 0
    ? (targetResource - startResource) / targetResource : 0
  const petMissingRatio = petNeedsHeal ? (targetPetHp - startPetHp) / targetPetHp : 0
  const maxMissingRatio = Math.max(hpMissingRatio, resMissingRatio, petMissingRatio)

  const FULL_DURATION = 8000
  const duration = Math.max(500, maxMissingRatio * FULL_DURATION)
  const TICK_INTERVAL = 50
  const totalTicks = Math.ceil(duration / TICK_INTERVAL)
  let currentTick = 0

  isResting.value = true
  restProgress.value = 0

  restTimer = setInterval(() => {
    currentTick++
    const progress = Math.min(1, currentTick / totalTicks)
    restProgress.value = progress * 100

    player.currentHp = Math.min(targetHp, Math.floor(startHp + (targetHp - startHp) * progress))
    if (startResource != null) {
      player.resource.current = Math.min(targetResource, Math.floor(startResource + (targetResource - startResource) * progress))
    }
    if (startPetHp != null && player.activePet) {
      player.activePet.currentHp = Math.min(targetPetHp, Math.floor(startPetHp + (targetPetHp - startPetHp) * progress))
    }
    gameStore.stateManager.set('player', player)

    if (currentTick >= totalTicks) {
      player.currentHp = targetHp
      if (startResource != null) player.resource.current = targetResource
      if (player.comboPoints) player.comboPoints.current = 0
      if (startPetHp != null && player.activePet) player.activePet.currentHp = targetPetHp
      gameStore.stateManager.set('player', player)

      clearInterval(restTimer)
      restTimer = null
      isResting.value = false
      restProgress.value = 0
      callback?.()
    }
  }, TICK_INTERVAL)
}

function explore() {
  if (!currentArea.value) {
    gameStore.addLog('请先选择一个探索区域！', 'system')
    return
  }

  const monsters = currentArea.value.monsters
  if (monsters && monsters.length > 0) {
    const monsterId = randomChoice(monsters)
    const monster = GameData.monsters[monsterId]
    if (monster) {
      gameStore.addLog(`⚔️ 遭遇了 ${monster.emoji} ${monster.name}！`, 'combat')
      // 通过 CombatSystem 正式开始战斗（会初始化敌人、切换场景）
      gameStore.eventBus?.emit('combat:start', monsterId)
    }
  } else {
    gameStore.addLog('🌿 一片宁静，没有发现任何敌人。', 'system')
  }
}

function rest() {
  const player = gameStore.stateManager?.get('player')
  if (!player) return

  // 已满血且资源满且宠物满血，无需休息
  const hpFull = player.currentHp >= player.maxHp
  const resourceFull = !player.resource || player.resource.type === 'rage' || player.resource.current >= player.resource.max
  const pet = player.activePet
  const petNeedsHeal = pet && pet.isAlive && pet.currentHp < pet.maxHp
  if (hpFull && resourceFull && !petNeedsHeal) {
    gameStore.addLog('🏕️ 你精力充沛，不需要休息。', 'system')
    return
  }

  // 记录初始值
  const startHp = player.currentHp
  const targetHp = player.maxHp
  const startResource = (player.resource && player.resource.type !== 'rage') ? player.resource.current : null
  const targetResource = (player.resource && player.resource.type !== 'rage') ? player.resource.max : null
  const startPetHp = petNeedsHeal ? pet.currentHp : null
  const targetPetHp = petNeedsHeal ? pet.maxHp : null

  // 计算需要恢复的比例（取 HP、资源、宠物HP 中缺失比例更大的那个）
  const hpMissingRatio = player.maxHp > 0 ? (targetHp - startHp) / player.maxHp : 0
  const resMissingRatio = targetResource != null && targetResource > 0
    ? (targetResource - startResource) / targetResource : 0
  const petMissingRatio = petNeedsHeal ? (targetPetHp - startPetHp) / targetPetHp : 0
  const maxMissingRatio = Math.max(hpMissingRatio, resMissingRatio, petMissingRatio)

  // 实际恢复时长 = 缺失比例 * 8秒，最少 0.5 秒
  const FULL_DURATION = 8000
  const duration = Math.max(500, maxMissingRatio * FULL_DURATION)
  const TICK_INTERVAL = 50 // 50ms 一帧
  const totalTicks = Math.ceil(duration / TICK_INTERVAL)
  let currentTick = 0

  isResting.value = true
  restProgress.value = 0
  gameStore.addLog('🏕️ 你开始休息...', 'system')

  restTimer = setInterval(() => {
    currentTick++
    const progress = Math.min(1, currentTick / totalTicks)
    restProgress.value = progress * 100

    // 线性插值恢复
    player.currentHp = Math.min(targetHp, Math.floor(startHp + (targetHp - startHp) * progress))
    if (startResource != null) {
      player.resource.current = Math.min(targetResource, Math.floor(startResource + (targetResource - startResource) * progress))
    }
    if (startPetHp != null && player.activePet) {
      player.activePet.currentHp = Math.min(targetPetHp, Math.floor(startPetHp + (targetPetHp - startPetHp) * progress))
    }
    gameStore.stateManager.set('player', player)

    if (currentTick >= totalTicks) {
      // 确保精确到满
      player.currentHp = targetHp
      if (startResource != null) {
        player.resource.current = targetResource
      }
      if (player.comboPoints) {
        player.comboPoints.current = 0
      }
      if (startPetHp != null && player.activePet) {
        player.activePet.currentHp = targetPetHp
      }
      gameStore.stateManager.set('player', player)

      clearInterval(restTimer)
      restTimer = null
      isResting.value = false
      restProgress.value = 0
      gameStore.addLog('🏕️ 休息完毕，恢复了全部生命值和资源。', 'system')
    }
  }, TICK_INTERVAL)
}

// ==================== 键盘快捷键响应 ====================
const shortcutListeners = []
onMounted(() => {
  const eventBus = gameStore.eventBus
  if (eventBus) {
    const onExplore = () => { if (!isResting.value && !isAutoExploring.value) explore() }
    const onRest = () => { if (!isResting.value && !isAutoExploring.value) rest() }
    const onAutoExplore = () => { if (!isResting.value) toggleAutoExplore() }
    eventBus.on('shortcut:explore', onExplore)
    eventBus.on('shortcut:rest', onRest)
    eventBus.on('shortcut:autoExplore', onAutoExplore)
    shortcutListeners.push(['shortcut:explore', onExplore], ['shortcut:rest', onRest], ['shortcut:autoExplore', onAutoExplore])
  }
})

onUnmounted(() => {
  if (restTimer) {
    clearInterval(restTimer)
    restTimer = null
  }
  if (autoExploreTimer) {
    clearTimeout(autoExploreTimer)
    autoExploreTimer = null
  }
  const eventBus = gameStore.eventBus
  if (eventBus) {
    eventBus.off('area:enter', onAreaEnter)
    autoListeners.forEach(([event, fn]) => eventBus.off(event, fn))
    shortcutListeners.forEach(([event, fn]) => eventBus.off(event, fn))
  }
  autoListeners = []
})
</script>

<style scoped>
.exploration-view {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
}

.area-info {
  padding: 15px;
}

.area-info h3 {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  margin-bottom: 8px;
}

.area-info p {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 6px;
}

.level-range {
  color: var(--secondary-gold) !important;
  font-size: var(--fs-xs) !important;
}

.exploration-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.no-area {
  text-align: center;
  padding: 40px;
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}

.rest-progress-bar {
  position: relative;
  width: 100%;
  height: 14px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-primary);
  border-radius: 3px;
  overflow: hidden;
}

.rest-progress-fill {
  height: 100%;
  background: linear-gradient(to right, var(--primary-green), var(--color-buff));
  transition: width 0.05s linear;
  border-radius: 2px;
}

.rest-progress-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-xs);
  color: var(--text-primary);
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}

/* 自动探索 */
.auto-active {
  border-color: var(--color-buff) !important;
  background: rgba(74, 222, 128, 0.15) !important; /* --color-buff */
  color: var(--color-buff) !important;
  animation: autoPulse 1.5s ease-in-out infinite;
}

.auto-status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(74, 222, 128, 0.08); /* --color-buff */
  border: 1px solid rgba(74, 222, 128, 0.3); /* --color-buff */
  border-radius: 4px;
  font-size: var(--fs-xs);
  color: var(--color-buff);
}

.auto-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-buff);
  animation: dotPulse 1s ease-in-out infinite;
}

@keyframes autoPulse {
  0%, 100% { box-shadow: 0 0 4px rgba(74, 222, 128, 0.2); /* --color-buff */ }
  50% { box-shadow: 0 0 12px rgba(74, 222, 128, 0.5); /* --color-buff */ }
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}
</style>
