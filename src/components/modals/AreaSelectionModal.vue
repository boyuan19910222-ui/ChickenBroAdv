<template>
  <div class="modal-overlay show" @click.self="$emit('close')">
    <div class="modal-content pixel-panel area-modal">
      <div class="modal-title">🌍 选择开放区域</div>
      <div class="area-selection-content">
        <div class="area-grid">
          <div
            v-for="area in areaList"
            :key="area.id"
            class="area-card"
            :class="{ locked: !area.isUnlocked, 'current-area': area.id === currentAreaId }"
            @click="area.isUnlocked && enterArea(area)"
          >
            <span v-if="!area.isUnlocked" class="area-lock-icon">🔒</span>
            <span v-if="area.id === currentAreaId" class="area-current-badge">正在探索</span>
            <div class="area-name">
              <span>{{ area.emoji }}</span>
              <span>{{ area.name }}</span>
            </div>
            <div class="area-level">
              推荐等级: {{ area.levelRange.min }}-{{ area.levelRange.max }}级
              <span v-if="!area.isUnlocked">(需要{{ area.unlockLevel }}级解锁)</span>
            </div>
            <div class="area-description">{{ area.description }}</div>
            <div class="area-rewards">
              经验加成: +{{ Math.round((area.rewards.expBonus - 1) * 100) }}% |
              金币加成: +{{ Math.round((area.rewards.goldBonus - 1) * 100) }}%
            </div>
          </div>
        </div>
        <div v-if="areaList.length === 0" class="no-areas">
          请先创建角色后再进行探索
        </div>
      </div>
      <div class="modal-buttons">
        <button class="pixel-btn" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'
import { GameData } from '@/data/GameData.js'

const emit = defineEmits(['close'])
const gameStore = useGameStore()

const currentAreaId = computed(() => {
  const saved = gameStore.engine?.stateManager?.get('currentArea')
  return saved?.id || 'elwynnForest'
})

const areaList = computed(() => {
  const player = gameStore.player
  const areas = GameData.areas
  if (!player || !areas) return []

  return Object.values(areas).map(area => ({
    ...area,
    isUnlocked: player.level >= area.unlockLevel
  }))
})

function enterArea(area) {
  if (!gameStore.engine) return

  const player = gameStore.player
  if (player.level < area.unlockLevel) {
    gameStore.addLog(`⚠️ 需要达到${area.unlockLevel}级才能进入${area.name}`, 'system')
    return
  }

  gameStore.engine.stateManager.set('currentArea', area)
  gameStore.changeScene('exploration')
  emit('close')

  gameStore.addLog(`🌍 进入区域: ${area.emoji} ${area.name}`, 'system')
  gameStore.eventBus.emit('area:enter', area)
}
</script>

<style scoped>
.area-modal {
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
}

.modal-title {
  padding-top: 0;
}

.area-selection-content {
  padding: 15px 0;
}

.area-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.area-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.area-card:hover:not(.locked) {
  background: rgba(0, 0, 0, 0.5);
  border-color: var(--accent-gold);
  transform: translateY(-2px);
}

.area-card.current-area {
  border-color: var(--accent-gold);
  background: rgba(255, 215, 0, 0.08);
}

.area-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.area-card.locked:hover {
  transform: none;
  border-color: var(--border-primary);
}

.area-lock-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 14px;
}

.area-current-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 11px;
  color: var(--accent-gold);
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--accent-gold);
  border-radius: 3px;
  padding: 1px 6px;
}

.area-name {
  font-size: var(--fs-xs);
  font-weight: bold;
  color: var(--accent-gold);
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.area-level {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  margin-bottom: 8px;
}

.area-description {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  line-height: 1.3;
  margin-bottom: 8px;
}

.area-rewards {
  font-size: var(--fs-xs);
  color: var(--secondary-gold);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 5px;
}

.no-areas {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  font-size: var(--fs-xs);
}

.modal-buttons {
  display: flex;
  justify-content: center;
  padding-top: 10px;
}
</style>
