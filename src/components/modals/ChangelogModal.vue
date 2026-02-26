<template>
  <transition name="fade">
    <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
      <div class="modal-content pixel-panel changelog-modal">
        <div class="modal-header">
          <h2 class="modal-title">📜 更新日志</h2>
          <button class="close-btn pixel-btn" @click="$emit('close')">X</button>
        </div>
        <div class="changelog-list custom-scrollbar">
          <div v-for="log in logs" :key="log.version" class="changelog-item">
            <div class="log-header">
              <span class="log-version">{{ log.version }}</span>
              <span class="log-date">{{ log.date }}</span>
            </div>
            <div v-if="log.commit" class="log-commit">提交: {{ log.commit }}</div>
            <div class="log-title">{{ log.title }}</div>
            <ul class="log-content">
              <li v-for="(item, index) in log.content" :key="index">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { changelogs } from '@/data/ChangelogData.js';

defineProps({
  show: Boolean
});

defineEmits(['close']);

const logs = changelogs;
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.changelog-modal {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: var(--color-bg-panel, #2c1810);
  border: 3px solid var(--color-border-light, #8b7355);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--color-border-dark, #3d2f1f);
  padding-bottom: 10px;
}

.modal-title {
  color: var(--color-text-gold, #ffd700);
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  margin: 0;
  text-shadow: 2px 2px 0 #000;
}

.close-btn {
  background: var(--color-btn-danger, #d32f2f);
  color: white;
  border: 2px solid #8b0000;
  font-family: 'Press Start 2P', monospace;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
}
.close-btn:hover {
  background: #b71c1c;
}

.changelog-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1a1a1a;
  border: 1px solid #3d2f1f;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #8b7355;
  border: 1px solid #ffd700;
}

.changelog-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed var(--color-border-dark, #3d2f1f);
}

.changelog-item:last-child {
  border-bottom: none;
}

.log-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
}

.log-version {
  color: var(--color-text-gold, #ffd700);
}

.log-date {
  color: var(--color-text-muted, #888);
}

.log-title {
  color: var(--color-text-highlight, #fff);
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 14px;
}

.log-commit {
  color: var(--color-text-muted, #888);
  font-size: 10px;
  margin-bottom: 8px;
}

.log-content {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
}

.log-content li {
  color: var(--color-text-normal, #ddd);
  margin-bottom: 5px;
  line-height: 1.5;
  font-size: 12px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
