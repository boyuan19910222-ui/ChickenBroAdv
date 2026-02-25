<template>
  <div v-if="visible" class="summon-overlay" @click.self="close">
    <div class="summon-panel">
      <div class="summon-title">{{ title }}</div>
      <div class="summon-list">
        <div
          v-for="summon in summons"
          :key="summon.id"
          class="summon-item"
          :class="{ locked: !summon.unlocked, selected: selectedId === summon.id }"
          @click="select(summon)"
        >
          <div class="summon-emoji">{{ summon.emoji }}</div>
          <div class="summon-info">
            <div class="summon-name">{{ summon.name }}</div>
            <div class="summon-role">{{ summon.roleDescription }}</div>
          </div>
          <div v-if="!summon.unlocked" class="summon-lock">
            🔒 Lv.{{ summon.unlockLevel }}
          </div>
        </div>
      </div>
      <div class="summon-actions">
        <button class="pixel-btn" @click="close">取消</button>
        <button class="pixel-btn summon-confirm" :disabled="!selectedId" @click="confirm">召唤</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '选择召唤物' },
  summons: { type: Array, default: () => [] }
})

const emit = defineEmits(['select', 'close'])

const selectedId = ref(null)

function select(summon) {
  if (!summon.unlocked) return
  selectedId.value = summon.id
}

function confirm() {
  if (selectedId.value) {
    emit('select', selectedId.value)
    selectedId.value = null
  }
}

function close() {
  selectedId.value = null
  emit('close')
}
</script>

<style scoped>
.summon-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.summon-panel {
  background: var(--bg-surface, #1a1a2e);
  border: 2px solid var(--border-primary, #444);
  border-radius: 8px;
  padding: 16px;
  min-width: 280px;
  max-width: 360px;
}

.summon-title {
  font-size: var(--fs-md, 16px);
  font-weight: bold;
  color: var(--text-primary, #fff);
  text-align: center;
  margin-bottom: 12px;
}

.summon-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.summon-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--border-primary, #444);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.summon-item:hover:not(.locked) {
  border-color: var(--color-buff, #4caf50);
  background: rgba(76, 175, 80, 0.1);
}

.summon-item.selected {
  border-color: var(--color-buff, #4caf50);
  background: rgba(76, 175, 80, 0.2);
}

.summon-item.locked {
  opacity: 0.4;
  cursor: not-allowed;
}

.summon-emoji {
  font-size: 24px;
  flex-shrink: 0;
}

.summon-info {
  flex: 1;
  min-width: 0;
}

.summon-name {
  font-weight: bold;
  color: var(--text-primary, #fff);
  font-size: var(--fs-sm, 13px);
}

.summon-role {
  color: var(--text-secondary, #aaa);
  font-size: var(--fs-xs, 11px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summon-lock {
  color: var(--text-muted, #666);
  font-size: var(--fs-xs, 11px);
  flex-shrink: 0;
}

.summon-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.summon-confirm {
  background: var(--color-buff, #4caf50) !important;
  color: #fff !important;
}

.summon-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
