<template>
  <div class="message-log-container pixel-panel">
    <!-- 左侧：系统日志 -->
    <div class="log-column system-log-column">
      <div class="log-header">
        <span>📋 系统日志</span>
      </div>
      <div class="log-messages" ref="logContainer">
        <div
          v-for="log in gameStore.logs"
          :key="log.id"
          class="log-entry"
          :class="log.type"
          :style="log.color ? { color: log.color, borderLeftColor: log.color } : {}"
        >
          <span class="log-time">{{ log.timestamp }}</span>
          {{ log.message }}
        </div>
        <div v-if="gameStore.logs.length === 0" class="log-empty">
          暂无日志...
        </div>
      </div>
    </div>

    <!-- 右侧：掉落日志 -->
    <div class="log-column loot-log-column">
      <div class="log-header loot-header">
        <span>💰 掉落记录</span>
      </div>
      <div class="log-messages" ref="lootContainer">
        <div
          v-for="log in gameStore.lootLogs"
          :key="log.id"
          class="log-entry loot"
        >
          <span class="log-time">{{ log.timestamp }}</span>
          {{ log.message }}
        </div>
        <div v-if="gameStore.lootLogs.length === 0" class="log-empty">
          暂无掉落...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'

const gameStore = useGameStore()
const logContainer = ref(null)
const lootContainer = ref(null)

function scrollToBottom(el) {
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
}

watch(
  () => gameStore.logVersion,
  async () => {
    await nextTick()
    scrollToBottom(logContainer.value)
  }
)

watch(
  () => gameStore.lootLogVersion,
  async () => {
    await nextTick()
    scrollToBottom(lootContainer.value)
  }
)

onMounted(() => {
  scrollToBottom(logContainer.value)
  scrollToBottom(lootContainer.value)
})
</script>

<style scoped>
.message-log-container {
  display: flex;
  gap: 1px;
  padding: 0;
  overflow: hidden;
  background: var(--border-primary);
}

.log-column {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.system-log-column {
  flex: 3;
  background: var(--bg-primary);
}

.loot-log-column {
  flex: 2;
  background: var(--bg-primary);
}

.log-header {
  font-size: var(--fs-xs);
  color: var(--secondary-gold);
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
  font-weight: bold;
}

.loot-header {
  color: var(--color-friendly);
}

.log-messages {
  height: calc(var(--fs-xs) * 1.8 * 5 + 3px * 2 * 5 + 1px * 5 + 6px * 2);
  flex-shrink: 0;
  overflow-y: auto;
  padding: 6px 10px;
}

.log-time {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  margin-right: 6px;
  opacity: 0.7;
}

.log-empty {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  text-align: center;
  padding: 12px;
}
</style>
