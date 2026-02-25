<template>
  <div class="resource-bar-wrapper" :class="[sizeClass]">
    <div class="bar-container" :class="[barHeightClass]">
      <div class="bar-fill" :class="[typeClass]" :style="{ width: percent + '%' }"></div>
      <span v-if="showValue === 'overlay'" class="bar-value-overlay">{{ Math.floor(current) }}/{{ max }}</span>
    </div>
    <div v-if="showValue === 'below'" class="bar-value-below">
      {{ valueEmoji }} {{ Math.floor(current) }}/{{ max }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, default: 0 },
  max: { type: Number, default: 1 },
  type: { type: String, default: 'hp' },
  showValue: { type: String, default: 'none' },
  size: { type: String, default: 'normal' }
})

const percent = computed(() => {
  if (!props.max || props.max <= 0) return 0
  return Math.max(0, Math.min(100, (props.current / props.max) * 100))
})

const sizeClass = computed(() => `size-${props.size}`)

const typeClass = computed(() => `fill-${props.type}`)

const barHeightClass = computed(() => {
  if (props.type === 'hp') return 'bar-hp-height'
  return 'bar-resource-height'
})

const valueEmoji = computed(() => {
  const emojis = { hp: '❤️', mana: '💧', rage: '💢', energy: '⚡' }
  return emojis[props.type] || '❤️'
})
</script>

<style scoped>
.resource-bar-wrapper {
  width: 100%;
}

.bar-container {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-primary);
  border-radius: 2px;
  overflow: hidden;
  width: 100%;
}

.bar-hp-height { height: 14px; }
.bar-resource-height { height: 10px; }

.bar-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 1px;
}

/* Type-specific colors */
.fill-hp { background: linear-gradient(to right, #8b0000, var(--color-hp)); }
.fill-mana { background: linear-gradient(to right, #000066, var(--color-mana)); }
.fill-energy { background: linear-gradient(to right, #888800, var(--color-energy)); }
.fill-rage { background: linear-gradient(to right, #880000, var(--color-rage)); }

/* Overlay value */
.bar-value-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--fs-xs);
  color: var(--text-primary);
  text-shadow: 0 0 2px #000, 1px 1px 0 #000;
  white-space: nowrap;
  pointer-events: none;
  line-height: 1;
}

/* Below value */
.bar-value-below {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  margin-top: 2px;
  text-align: center;
}

/* Size: compact (dungeon) */
.size-compact .bar-container {
  border-radius: 3px;
}

.size-compact .bar-hp-height {
  height: 13px;
}

.size-compact .bar-resource-height {
  height: 11px;
}

.size-compact .bar-fill {
  border-radius: 2px;
}

/* Size: normal (wild) uses defaults above */
.size-normal .bar-container {
  width: 120px;
  margin: 0 auto;
}
</style>
