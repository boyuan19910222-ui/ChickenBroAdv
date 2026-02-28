<template>
  <div 
    v-if="isVisible" 
    class="death-ghost-overlay"
  >
    <div class="ghost-run-content">
      <div class="ghost-run-text">
        跑尸中{{ dots }}
      </div>
    </div>
  </div>
</template>

<script>
import { useGameStore } from '@/stores/gameStore.js'
import { onMounted, onBeforeUnmount, ref } from 'vue'

export default {
  name: 'DeathGhostOverlay',
  setup() {
    const gameStore = useGameStore()
    
    // Reactive data
    const isVisible = ref(false)
    const dots = ref('.')
    const dotCount = ref(1)
    const dotDirection = ref(1) // 1 = increasing, -1 = decreasing
    
    let dotAnimationTimer = null
    let ghostRunTimer = null
    let emergencyTimeoutTimer = null // 15秒超时保护
    let randomDuration = 0
    
    const startGhostRun = () => {
      console.log('[DeathGhostOverlay] *** RECEIVED GHOST-RUN:START EVENT ***');
      console.log('[DeathGhostOverlay] Ghost run started!');
      
      // Clear any existing timers to prevent duplicates
      clearTimers()
      
      // Show overlay
      isVisible.value = true
      console.log('[DeathGhostOverlay] Overlay visibility set to:', isVisible.value);
      
      // Generate random duration (2-7 seconds)
      randomDuration = Math.floor(Math.random() * 5000) + 2000
      console.log('[DeathGhostOverlay] Random duration:', randomDuration + 'ms');
      
      // Start dot animation
      startDotAnimation()
      
      // Set timer to end ghost run
      ghostRunTimer = setTimeout(() => {
        triggerGhostRunEnd()
      }, randomDuration)
      
      // Set emergency timeout (15 seconds - safety mechanism)
      emergencyTimeoutTimer = setTimeout(() => {
        console.warn('[DeathGhostOverlay] Emergency timeout triggered - forcing ghost run end')
        triggerGhostRunEnd()
      }, 15000)
    }
    
    const endGhostRun = () => {
      console.log('[DeathGhostOverlay] Ghost run ended');
      isVisible.value = false
      clearTimers()
      resetDotAnimation()
    }
    
    const startDotAnimation = () => {
      dotAnimationTimer = setInterval(() => {
        if (dotDirection.value === 1) {
          // Increasing: 1 → 2 → 3 → 4 → 5
          dotCount.value++
          if (dotCount.value >= 5) {
            dotDirection.value = -1
          }
        } else {
          // Decreasing: 5 → 4 → 3 → 2 → 1
          dotCount.value--
          if (dotCount.value <= 1) {
            dotDirection.value = 1
          }
        }
        
        // Update dots display
        dots.value = '.'.repeat(dotCount.value)
      }, 500) // 500ms interval as specified
    }
    
    const resetDotAnimation = () => {
      dotCount.value = 1
      dotDirection.value = 1
      dots.value = '.'
    }
    
    const clearTimers = () => {
      if (dotAnimationTimer) {
        clearInterval(dotAnimationTimer)
        dotAnimationTimer = null
      }
      
      if (ghostRunTimer) {
        clearTimeout(ghostRunTimer)
        ghostRunTimer = null
      }
      
      if (emergencyTimeoutTimer) {
        clearTimeout(emergencyTimeoutTimer)
        emergencyTimeoutTimer = null
      }
    }
    
    const triggerGhostRunEnd = () => {
      // Emit ghost-run:end event to notify system
      console.log('[DeathGhostOverlay] Triggering ghost-run:end event');
      gameStore.eventBus?.emit('ghost-run:end')
    }
    
    onMounted(() => {
      console.log('[DeathGhostOverlay] Component mounted at:', new Date().toISOString());
      console.log('[DeathGhostOverlay] EventBus available:', !!gameStore.eventBus);
      console.log('[DeathGhostOverlay] EventBus instance:', gameStore.eventBus);
      
      const eventBus = gameStore.eventBus
      if (eventBus) {
        console.log('[DeathGhostOverlay] Registering listeners...');
        eventBus.on('ghost-run:start', startGhostRun)
        eventBus.on('ghost-run:end', endGhostRun)
        console.log('[DeathGhostOverlay] Event listeners registered successfully');
        console.log('[DeathGhostOverlay] Listeners count for ghost-run:start:', eventBus.listenerCount?.('ghost-run:start') || 'listenerCount not available');
        
        // Test direct emit to verify listener is working
        setTimeout(() => {
          console.log('[DeathGhostOverlay] Testing direct event emission...');
          eventBus.emit('ghost-run:start');
        }, 1000);
      } else {
        console.error('[DeathGhostOverlay] EventBus not available!');
      }
    })
    
    onBeforeUnmount(() => {
      console.log('[DeathGhostOverlay] Component unmounting, cleaning up');
      const eventBus = gameStore.eventBus
      if (eventBus) {
        eventBus.off('ghost-run:start', startGhostRun)
        eventBus.off('ghost-run:end', endGhostRun)
      }
      clearTimers()
    })
    
    return {
      isVisible,
      dots
    }
  }
}
</script>

<style scoped>
.death-ghost-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  filter: grayscale(100%);
  z-index: 9999;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Performance optimizations for low-end devices */
  will-change: filter, opacity;
  backface-visibility: hidden;
  transform: translateZ(0); /* Force hardware acceleration */
}

.ghost-run-content {
  text-align: center;
  pointer-events: none;
  /* Optimize text rendering */
  will-change: contents;
  transform: translateZ(0);
}

.ghost-run-text {
  font-size: 3rem;
  color: white;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  
  /* Text rendering optimization */
  text-rendering: optimizeSpeed;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  will-change: contents;
}

/* Responsive font size for smaller devices */
@media (max-width: 768px) {
  .ghost-run-text {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .ghost-run-text {
    font-size: 1.5rem;
  }
}
</style>