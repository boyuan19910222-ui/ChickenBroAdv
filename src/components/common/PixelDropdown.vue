<template>
  <div
    ref="dropdownRef"
    class="pixel-dropdown"
    :class="{ open: isOpen, disabled: disabled }"
  >
    <!-- 触发器 -->
    <div class="dropdown-trigger" @click="toggle">
      <template v-if="selectedOption">
        <span v-if="selectedOption.emoji" class="option-emoji">{{ selectedOption.emoji }}</span>
        <span class="option-label">{{ selectedOption.label }}</span>
        <span v-if="selectedOption.sublabel" class="option-sublabel">{{ selectedOption.sublabel }}</span>
      </template>
      <span v-else class="placeholder">{{ placeholder }}</span>
      <span class="dropdown-arrow">▼</span>
    </div>

    <!-- 下拉列表 -->
    <div v-if="isOpen" class="dropdown-list">
      <div
        v-for="option in options"
        :key="option.value"
        class="dropdown-option"
        :class="{ selected: option.value === modelValue }"
        @click="selectOption(option)"
      >
        <span v-if="option.emoji" class="option-emoji">{{ option.emoji }}</span>
        <span class="option-label">{{ option.label }}</span>
        <span v-if="option.sublabel" class="option-sublabel">{{ option.sublabel }}</span>
        <span v-if="option.value === modelValue" class="option-check">✓</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择...' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const dropdownRef = ref(null)
const isOpen = ref(false)

// 当前选中的 option
const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return props.options.find(opt => opt.value === props.modelValue) || null
})

// 切换展开/收起
function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

// 选择选项
function selectOption(option) {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

// 点击外部关闭
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.pixel-dropdown {
  position: relative;
  width: 100%;
}

/* 触发器 */
.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s;
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-primary);
}

.dropdown-trigger:hover {
  border-color: var(--primary-gold);
}

.pixel-dropdown.open .dropdown-trigger {
  border-color: var(--primary-gold);
}

.pixel-dropdown.disabled .dropdown-trigger {
  opacity: 0.5;
  cursor: not-allowed;
}

.pixel-dropdown.disabled .dropdown-trigger:hover {
  border-color: var(--border-primary);
}

.placeholder {
  color: var(--text-muted);
  flex: 1;
}

.dropdown-arrow {
  margin-left: auto;
  font-size: 10px;
  color: var(--text-secondary);
  transition: transform 0.15s;
}

.pixel-dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

/* 下拉列表 */
.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--bg-tertiary);
  border: 1px solid var(--primary-gold);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* 选项 */
.dropdown-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.15s;
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-primary);
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover {
  background: rgba(255, 215, 0, 0.1);
}

.dropdown-option.selected {
  background: rgba(255, 215, 0, 0.15);
}

/* 选项内容 */
.option-emoji {
  flex-shrink: 0;
  font-size: 14px;
}

.option-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option-sublabel {
  color: var(--primary-gold);
  font-size: 10px;
  flex-shrink: 0;
}

.option-check {
  color: var(--color-friendly);
  font-size: 12px;
  flex-shrink: 0;
}
</style>
