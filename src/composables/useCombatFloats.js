import { reactive } from 'vue'

/**
 * Composable for managing floating combat numbers and shake animations.
 * Unified model: all floating numbers indexed by unit ID.
 */
export function useCombatFloats() {
  const floatingNumbers = reactive({})
  const shakeStates = reactive({})
  // 死亡动画状态: 'dying-enemy' | 'dying-player' | 'dead' | null
  const deathStates = reactive({})
  let keyCounter = 0
  const timers = []

  function spawnFloatingNumber(unitId, damage, isCrit, isHeal = false, skillName = null) {
    const key = ++keyCounter
    const text = isHeal ? `+${damage}` : `-${damage}`
    const entry = { key, text, isCrit: !!isCrit, isHeal: !!isHeal, skillName: skillName || null }

    if (!floatingNumbers[unitId]) {
      floatingNumbers[unitId] = []
    }
    floatingNumbers[unitId].push(entry)

    // Trigger shake for damage (not heal)
    if (!isHeal) {
      triggerShake(unitId, !!isCrit)
    }

    // Auto-remove after animation
    const duration = isCrit ? 1200 : 800
    const timer = setTimeout(() => {
      const arr = floatingNumbers[unitId]
      if (arr) {
        const idx = arr.findIndex(n => n.key === key)
        if (idx !== -1) arr.splice(idx, 1)
      }
    }, duration)
    timers.push(timer)
  }

  function getFloatingNumbers(unitId) {
    return floatingNumbers[unitId] || []
  }

  function triggerShake(unitId, isCrit) {
    shakeStates[unitId] = isCrit ? 'crit' : 'hit'
    const duration = isCrit ? 600 : 300
    const timer = setTimeout(() => {
      if (shakeStates[unitId]) {
        delete shakeStates[unitId]
      }
    }, duration)
    timers.push(timer)
  }

  function isShaking(unitId) {
    return shakeStates[unitId] || false
  }

  /**
   * 触发死亡动画
   * @param {string} unitId
   * @param {'player'|'enemy'} side
   */
  function triggerDeath(unitId, side) {
    deathStates[unitId] = side === 'enemy' ? 'dying-enemy' : 'dying-player'
    // 动画播放完毕后切换为 dead 状态
    const duration = 800
    const timer = setTimeout(() => {
      if (deathStates[unitId]) {
        deathStates[unitId] = 'dead'
      }
    }, duration)
    timers.push(timer)
  }

  function getDeathState(unitId) {
    return deathStates[unitId] || null
  }

  function cleanup() {
    // Clear all floating numbers
    Object.keys(floatingNumbers).forEach(key => {
      delete floatingNumbers[key]
    })
    // Clear all shake states
    Object.keys(shakeStates).forEach(key => {
      delete shakeStates[key]
    })
    // Clear all death states
    Object.keys(deathStates).forEach(key => {
      delete deathStates[key]
    })
    // Clear all timers
    timers.forEach(t => clearTimeout(t))
    timers.length = 0
  }

  return {
    floatingNumbers,
    spawnFloatingNumber,
    getFloatingNumbers,
    triggerShake,
    isShaking,
    triggerDeath,
    getDeathState,
    cleanup
  }
}
