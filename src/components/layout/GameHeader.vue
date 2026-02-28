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
            <button class="test-tool-btn" @click="$emit('debug-levelup')">
              <span class="btn-icon">⬆️</span>
              <span>测试升级</span>
            </button>
            <button 
              class="test-tool-btn test-death-btn" 
              :class="{ disabled: !isInCombat }"
              :disabled="!isInCombat"
              :title="!isInCombat ? '战斗中可用' : ''"
              @click="$emit('debug-death')"
            >
              <span class="btn-icon">💀</span>
              <span>测试死亡</span>
            </button>
            <button class="test-tool-btn" @click="$emit('debug-get-equipment')">
              <span class="btn-icon">⚔️</span>
              <span>获取装备</span>
            </button>
            <button class="test-tool-btn" @click="$emit('debug-get-item')">
              <span class="btn-icon">📦</span>
              <span>获取物品</span>
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
defineEmits(['open-areas', 'open-dungeon', 'open-talents', 'open-lobby', 'save-game', 'exit-game', 'debug-levelup', 'debug-death', 'debug-get-equipment', 'debug-get-item', 'open-test-tools', 'close-test-tools'])
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 6px;
  background: linear-gradient(145deg, var(--bg-primary), #060e18);
  border: 2px solid var(--border-primary);
}

.test-tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 16px;
  background: linear-gradient(145deg, var(--bg-secondary), var(--bg-primary));
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  cursor: pointer;
  white-space: nowrap;
  min-height: 36px;
}

.test-tool-btn .btn-icon {
  font-size: 16px;
}

.test-tool-btn:hover {
  background: linear-gradient(145deg, var(--bg-tertiary), var(--bg-secondary));
  border-color: var(--primary-gold);
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
