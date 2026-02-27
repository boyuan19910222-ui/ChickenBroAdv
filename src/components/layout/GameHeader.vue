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
      <!-- GM 面板按钮（仅管理员可见） -->
      <button v-if="isAdmin" class="header-btn gm-panel-btn" @click="openAdminPanel">
        <span class="btn-icon">🛡️</span>
        <span>GM 面板</span>
      </button>
      <button class="header-btn" @click="$emit('open-lobby')">
        <span class="btn-icon">🪨</span>
        <span>集合石</span>
      </button>
      <button class="header-btn system-btn debug-btn" @click="$emit('debug-levelup')">
        <span class="btn-icon">⬆️</span>
        <span>测试升级</span>
      </button>
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
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin === true)

// 动态获取后端地址（与 authStore 保持一致）
const API_HOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:3001'
    : `http://${window.location.hostname}:3001`

function openAdminPanel() {
  // 在新标签页打开 GM 面板（使用完整的后端 URL）
  // 传递 token 作为 URL 参数，因为跨域 localStorage 不共享
  const token = authStore.token || ''
  const url = `${API_HOST}/admin/index.html?token=${encodeURIComponent(token)}`
  window.open(url, '_blank')
}

defineEmits(['open-areas', 'open-dungeon', 'open-talents', 'open-lobby', 'save-game', 'exit-game', 'debug-levelup'])
</script>

<style scoped>
/* GM 面板按钮样式 */
.gm-panel-btn {
  background: linear-gradient(145deg, #8b0000, #5c0000);
  border-color: #ff6b6b;
  color: #ffd700;
}

.gm-panel-btn:hover {
  background: linear-gradient(145deg, #a00000, #700000);
  border-color: #ff8787;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

.gm-panel-btn .btn-icon {
  filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.8));
}
</style>
