<template>
  <header class="game-header">
    <div class="header-left">
      <span style="font-size: 24px;">🐔</span>
      <h1>鸡哥大冒险</h1>
    </div>
    <div class="header-center">
      <button class="header-btn" @click="$emit('open-areas')">
        <span class="btn-icon">🗺️</span>
        <span>开放区域</span>
      </button>
      <button class="header-btn" @click="$emit('open-dungeon')">
        <span class="btn-icon">🏰</span>
        <span>副本</span>
      </button>
      <button class="header-btn" @click="$emit('open-talents')">
        <span class="btn-icon">⭐</span>
        <span>天赋</span>
      </button>
    </div>
    <div class="header-right">
      <button class="header-btn" @click="$emit('open-lobby')">
        <span class="btn-icon">🪨</span>
        <span>集合石</span>
      </button>
      <div class="test-tools-wrapper">
        <button class="header-btn system-btn debug-btn" @click="$emit('open-test-tools')">
          <span class="btn-icon">🧪</span>
          <span>测试工具</span>
        </button>
        <div v-if="showTestTools" class="test-tools-dropdown" @mouseleave="$emit('close-test-tools')">
          <div class="test-tools-buttons">
            <button class="test-tool-btn" @click="$emit('debug-levelup'); $emit('close-test-tools')">
              <span class="btn-icon">⬆️</span>
              <span>测试升级</span>
            </button>
            <button 
              class="test-tool-btn test-death-btn" 
              :class="{ disabled: !isInCombat }"
              :disabled="!isInCombat"
              :title="!isInCombat ? '战斗中可用' : ''"
              @click="$emit('debug-death'); $emit('close-test-tools')"
            >
              <span class="btn-icon">💀</span>
              <span>测试死亡</span>
            </button>
          </div>
        </div>
      </div>
      <a v-if="isAdmin" href="/admin.html" class="header-btn system-btn" target="_blank">
        <span class="btn-icon">⚙️</span>
        <span>管理面板</span>
      </a>
      <button class="header-btn system-btn" @click="$emit('save-game')">
        <span class="btn-icon">💾</span>
        <span>保存</span>
      </button>
      <button class="header-btn system-btn" @click="$emit('exit-game')">
        <span class="btn-icon">🚪</span>
        <span>退出</span>
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isAdmin: {
    type: Boolean,
    default: false
  },
  showTestTools: {
    type: Boolean,
    default: false
  },
  isInCombat: {
    type: Boolean,
    default: false
  }
})
defineEmits(['open-areas', 'open-dungeon', 'open-talents', 'open-lobby', 'save-game', 'exit-game', 'debug-levelup', 'debug-death', 'open-test-tools', 'close-test-tools'])
</script>

<style scoped>
.test-tools-wrapper {
  position: relative;
}

.test-tools-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  z-index: 100;
}

.test-tools-buttons {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: var(--bg-surface, #1a1a2e);
  border: 2px solid var(--border-color, #3d3d5c);
  border-radius: 4px;
}

.test-tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 12px;
  background: var(--bg-primary, #16213e);
  border: 1px solid var(--border-color, #3d3d5c);
  border-radius: 4px;
  color: var(--text-primary, #eee);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.test-tool-btn .btn-icon {
  font-size: 16px;
  line-height: 1;
}

.test-tool-btn:hover {
  background: var(--bg-hover, #1f3460);
}

.test-death-btn {
  color: #ff6b6b;
}

.test-death-btn:hover:not(.disabled) {
  background: rgba(255, 107, 107, 0.2);
}

.test-death-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
