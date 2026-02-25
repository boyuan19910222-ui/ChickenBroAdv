<template>
  <div class="modal-overlay show" @click.self="$emit('close')">
    <div class="modal-content pixel-panel dungeon-modal">
      <div class="modal-title">🏰 选择副本</div>

      <div class="dungeon-layout">
        <!-- 左侧: 副本列表 -->
        <div class="dungeon-list">
          <div
            v-for="dungeon in dungeonList"
            :key="dungeon.id"
            class="dungeon-entry"
            :class="{
              locked: dungeon.status === 'locked',
              developing: dungeon.status === 'developing',
              cleared: dungeon.status === 'cleared',
              selected: selectedDungeon?.id === dungeon.id,
              'multi-wing': dungeon.type === 'multi-wing',
              expanded: expandedMultiWing === dungeon.id,
            }"
          >
            <!-- 主条目 -->
            <div
              class="dungeon-row"
              @click="handleDungeonClick(dungeon)"
            >
              <span class="dungeon-status-icon">
                <span v-if="dungeon.status === 'locked'">🔒</span>
                <span v-else-if="dungeon.status === 'developing'">🚧</span>
                <span v-else-if="dungeon.status === 'cleared'">✅</span>
                <span v-else>⚔️</span>
              </span>
              <span class="dungeon-emoji">{{ dungeon.emoji }}</span>
              <div class="dungeon-brief">
                <span class="dungeon-name">{{ dungeon.name }}</span>
                <span class="dungeon-level">Lv {{ dungeon.levelRange.min }}-{{ dungeon.levelRange.max }}</span>
              </div>
              <span v-if="dungeon.type === 'multi-wing'" class="expand-icon">
                {{ expandedMultiWing === dungeon.id ? '▼' : '▶' }}
              </span>
            </div>

            <!-- multi-wing 翼列表 -->
            <div v-if="dungeon.type === 'multi-wing' && expandedMultiWing === dungeon.id" class="wing-list">
              <div
                v-for="wing in dungeon.wings"
                :key="wing.id"
                class="wing-row"
                :class="{
                  locked: wing.status === 'locked',
                  developing: wing.status === 'developing',
                  cleared: wing.status === 'cleared',
                  selected: selectedWing?.id === wing.id,
                }"
                @click.stop="handleWingClick(dungeon, wing)"
              >
                <span class="dungeon-status-icon">
                  <span v-if="wing.status === 'locked'">🔒</span>
                  <span v-else-if="wing.status === 'developing'">🚧</span>
                  <span v-else-if="wing.status === 'cleared'">✅</span>
                  <span v-else>⚔️</span>
                </span>
                <span class="dungeon-emoji">{{ wing.emoji }}</span>
                <div class="dungeon-brief">
                  <span class="dungeon-name">{{ wing.name }}</span>
                  <span class="dungeon-level">Lv {{ wing.levelRange.min }}-{{ wing.levelRange.max }}</span>
                </div>
                <span class="wing-boss-count">{{ wing.bossCount }} Boss</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧: 副本详情面板 -->
        <div class="dungeon-detail" v-if="detailEntry">
          <div class="detail-header">
            <span class="detail-emoji">{{ detailEntry.emoji }}</span>
            <div>
              <div class="detail-name">{{ detailEntry.name }}</div>
              <div class="detail-level">推荐等级: Lv {{ detailEntry.levelRange.min }}-{{ detailEntry.levelRange.max }}</div>
            </div>
          </div>

          <div class="detail-description">{{ detailEntry.description || selectedDungeon?.description }}</div>

          <div class="detail-stats">
            <div class="stat-row" v-if="detailEntry.bossCount">
              <span class="stat-label">💀 BOSS</span>
              <span class="stat-value">{{ detailEntry.bossCount }}</span>
            </div>
            <div class="stat-row" v-if="detailEntry.estimatedTime">
              <span class="stat-label">⏱️ 时间</span>
              <span class="stat-value">{{ detailEntry.estimatedTime }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">📊 状态</span>
              <span class="stat-value" :class="'status-' + detailEntry.status">
                <span v-if="detailEntry.status === 'locked'">🔒 需 Lv{{ detailEntry.unlockLevel }}</span>
                <span v-else-if="detailEntry.status === 'developing'">🚧 开发中</span>
                <span v-else-if="detailEntry.status === 'cleared'">✅ 已通关</span>
                <span v-else>⚔️ 可进入</span>
              </span>
            </div>
          </div>

          <button
            class="pixel-btn enter-btn"
            :disabled="detailEntry.status === 'locked' || detailEntry.status === 'developing'"
            @click="enterDungeon"
          >
            ⚔️ 进入副本
          </button>
        </div>

        <!-- 未选择副本时的提示 -->
        <div class="dungeon-detail empty-detail" v-else>
          <div class="empty-hint">← 选择一个副本查看详情</div>
        </div>
      </div>

      <div class="modal-buttons">
        <button class="pixel-btn" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'
import { DungeonRegistry, getSortedDungeonList, getDungeonStatus } from '@/data/dungeons/DungeonRegistry.js'

const emit = defineEmits(['close', 'enter-dungeon'])
const gameStore = useGameStore()

const selectedDungeon = ref(null)
const selectedWing = ref(null)
const expandedMultiWing = ref(null)

const playerLevel = computed(() => gameStore.player?.level || 1)
const clearedDungeons = computed(() => {
  const player = gameStore.player
  return new Set(player?.clearedDungeons || [])
})

const dungeonList = computed(() => {
  return getSortedDungeonList().map(dungeon => {
    const status = getDungeonStatus(dungeon.id, playerLevel.value, clearedDungeons.value)
    const result = { ...dungeon, status }

    if (dungeon.type === 'multi-wing' && dungeon.wings) {
      result.wings = dungeon.wings.map(wing => ({
        ...wing,
        status: getDungeonStatus(wing.id, playerLevel.value, clearedDungeons.value),
      }))
    }

    return result
  })
})

// 当前详情面板展示的条目（翼优先，否则副本本身）
const detailEntry = computed(() => {
  if (selectedWing.value) return selectedWing.value
  if (selectedDungeon.value && selectedDungeon.value.type !== 'multi-wing') return selectedDungeon.value
  return null
})

function handleDungeonClick(dungeon) {
  if (dungeon.type === 'multi-wing') {
    expandedMultiWing.value = expandedMultiWing.value === dungeon.id ? null : dungeon.id
    selectedDungeon.value = dungeon
    selectedWing.value = null
  } else {
    selectedDungeon.value = dungeon
    selectedWing.value = null
    expandedMultiWing.value = null
  }
}

function handleWingClick(dungeon, wing) {
  selectedDungeon.value = dungeon
  selectedWing.value = wing
}

function enterDungeon() {
  const entry = detailEntry.value
  if (!entry || entry.status === 'locked' || entry.status === 'developing') return

  emit('enter-dungeon', entry.id)
  emit('close')
}
</script>

<style scoped>
.dungeon-modal {
  width: 700px;
  height: 80vh;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.dungeon-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px 0;
  flex: 1;
  min-height: 0;
}

.dungeon-list {
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding-right: 10px;
}

.dungeon-entry {
  margin-bottom: 2px;
}

.dungeon-row,
.wing-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: var(--fs-xs);
}

.dungeon-row:hover:not(.locked):not(.developing) {
  background: rgba(255, 215, 0, 0.1);
}

.wing-row {
  padding-left: 28px;
}

.wing-row:hover:not(.locked):not(.developing) {
  background: rgba(255, 215, 0, 0.1);
}

.dungeon-entry.selected > .dungeon-row,
.wing-row.selected {
  background: rgba(255, 215, 0, 0.15);
  border-left: 2px solid var(--accent-gold);
}

.dungeon-entry.locked > .dungeon-row,
.wing-row.locked {
  opacity: 0.45;
  cursor: not-allowed;
}

.dungeon-entry.developing > .dungeon-row,
.wing-row.developing {
  opacity: 0.4;
  cursor: not-allowed;
}

.dungeon-status-icon {
  font-size: 10px;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.dungeon-emoji {
  font-size: 14px;
  flex-shrink: 0;
}

.dungeon-brief {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.dungeon-name {
  font-weight: bold;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dungeon-entry.cleared > .dungeon-row .dungeon-name,
.wing-row.cleared .dungeon-name {
  color: var(--text-secondary);
}

.dungeon-level {
  font-size: 10px;
  color: var(--text-secondary);
}

.expand-icon {
  font-size: 10px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.wing-list {
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  margin-left: 12px;
}

.wing-boss-count {
  font-size: 10px;
  color: var(--secondary-gold);
  flex-shrink: 0;
}

/* Detail panel */
.dungeon-detail {
  padding-left: 8px;
  padding-right: 10px;
  min-width: 0;
  overflow: hidden;
}

.empty-detail {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-hint {
  color: var(--text-secondary);
  font-size: var(--fs-xs);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.detail-emoji {
  font-size: 24px;
  flex-shrink: 0;
}

.detail-name {
  font-size: var(--fs-xs);
  font-weight: bold;
  color: var(--accent-gold);
}

.detail-level {
  font-size: 10px;
  color: var(--text-secondary);
}

.detail-description {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.3;
  margin-bottom: 8px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.detail-stats {
  margin-bottom: 10px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
  font-size: 11px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-label {
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.stat-value {
  color: var(--text-primary);
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-locked { color: #ff6b6b; }
.status-developing { color: #ffa94d; }
.status-cleared { color: #69db7c; }
.status-available { color: var(--accent-gold); }

.enter-btn {
  width: 100%;
  padding: 6px;
  font-size: 11px;
}

.enter-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  padding-top: 10px;
}
</style>
