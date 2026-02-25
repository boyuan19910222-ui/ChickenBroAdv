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
defineEmits(['open-areas', 'open-dungeon', 'open-talents', 'open-lobby', 'save-game', 'exit-game', 'debug-levelup'])
</script>
