<template>
  <img
    v-if="!loadError"
    :src="src"
    :style="{ width: size + 'px', height: size + 'px' }"
    class="pixel-icon"
    @error="onError"
  />
  <span
    v-else
    class="pixel-icon-fallback"
    :style="{ width: size + 'px', height: size + 'px', fontSize: (size * 0.7) + 'px', lineHeight: size + 'px' }"
  >{{ fallback }}</span>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  src: { type: String, required: true },
  size: { type: Number, default: 24 },
  fallback: { type: String, default: '' }
})

const loadError = ref(false)

function onError() {
  loadError.value = true
}
</script>

<style scoped>
.pixel-icon {
  display: inline-block;
  vertical-align: middle;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  object-fit: contain;
}
.pixel-icon-fallback {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
}
</style>
