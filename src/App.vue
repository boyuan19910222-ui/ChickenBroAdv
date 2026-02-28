<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  
  <!-- 死亡跑尸覆盖层 - 最高层级确保覆盖所有内容 -->
  <DeathGhostOverlay />
</template>

<script setup>
import '@/core/globals.js'
import DeathGhostOverlay from '@/components/modals/DeathGhostOverlay.vue'
</script>

<style>
/* 全局过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
