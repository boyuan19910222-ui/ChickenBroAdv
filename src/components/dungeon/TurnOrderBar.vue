<template>
  <div class="turn-order-bar">
    <span class="label">⚡ 行动顺序</span>
    <div
      v-for="entry in turnOrder"
      :key="entry.unitId || entry.name"
      class="turn-order-unit"
      :class="{
        'player-side': entry.side === 'player',
        'enemy-side': entry.side !== 'player',
        'my-character': entry.isPlayer,
        current: entry.isCurrent,
        acted: entry.hasActed,
        hovered: hoveredUnitId === entry.unitId
      }"
      @mouseenter="onHoverUnit(entry)"
      @mouseleave="onLeaveUnit"
    >
      <div v-if="entry.isPlayer" class="my-char-badge">🎮</div>
      <div class="unit-emoji">
        <PixelIcon v-if="entry.icon" :src="entry.icon" :size="18" :fallback="entry.emoji" />
        <span v-else>{{ entry.emoji }}</span>
      </div>
      <!-- Tooltip -->
      <div v-if="hoveredUnitId === entry.unitId && hoverPreview" class="action-tooltip">
        <!-- 玩家角色已部署行动 -->
        <template v-if="hoverPreview.isPlayerControlled && hoverPreview.hasPlannedAction">
          <span class="tooltip-planned-badge">📌 已部署</span>
          <template v-if="hoverPreview.isDefend">
            <span class="tooltip-text">
              🛡️ <span class="tooltip-player-name">{{ hoverPreview.attackerName }}</span> 将进入防御姿态
            </span>
          </template>
          <template v-else-if="hoverPreview.isHeal">
            <span class="tooltip-text">
              ✨ <span class="tooltip-player-name">{{ hoverPreview.attackerName }}</span> 将会对
              <span class="tooltip-target">{{ hoverPreview.targetName }}</span>
              使用 <span class="tooltip-skill">{{ hoverPreview.skillName }}</span>，预计产生
              <span class="tooltip-heal">{{ hoverPreview.amount }}</span> 治疗
            </span>
          </template>
          <template v-else>
            <span class="tooltip-text">
              ⚔️ <span class="tooltip-player-name">{{ hoverPreview.attackerName }}</span> 将会对
              <span class="tooltip-target">{{ hoverPreview.targetName }}</span>
              使用 <span class="tooltip-skill">{{ hoverPreview.skillName }}</span>，预计造成
              <span class="tooltip-damage">{{ hoverPreview.amount }}</span> 伤害
            </span>
          </template>
        </template>
        <!-- 玩家角色未部署行动 -->
        <template v-else-if="hoverPreview.isPlayerControlled">
          <span class="tooltip-text">🎮 {{ hoverPreview.attackerName }}（由你操控）</span>
          <span class="tooltip-hint">尚未部署行动</span>
        </template>
        <template v-else-if="hoverPreview.isHeal">
          <span class="tooltip-text">
            ✨ {{ hoverPreview.attackerName }} 将会对
            <span class="tooltip-target">{{ hoverPreview.targetName }}</span>
            使用 <span class="tooltip-skill">{{ hoverPreview.skillName }}</span>，预计产生
            <span class="tooltip-heal">{{ hoverPreview.amount }}</span> 治疗
          </span>
        </template>
        <template v-else>
          <span class="tooltip-text">
            ⚔️ {{ hoverPreview.attackerName }} 将会对
            <span class="tooltip-target">{{ hoverPreview.targetName }}</span>
            使用 <span class="tooltip-skill">{{ hoverPreview.skillName }}</span>，预计造成
            <span class="tooltip-damage">{{ hoverPreview.amount }}</span> 伤害
          </span>
        </template>
      </div>
    </div>
    <span class="round-counter">回合 {{ currentRound }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PixelIcon from '@/components/common/PixelIcon.vue'

const props = defineProps({
  turnOrder: {
    type: Array,
    default: () => []
  },
  currentRound: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['hover-unit', 'leave-unit'])

const hoveredUnitId = ref(null)
const hoverPreview = ref(null)

function onHoverUnit(entry) {
  hoveredUnitId.value = entry.unitId
  emit('hover-unit', entry.unitId)
}

function onLeaveUnit() {
  hoveredUnitId.value = null
  hoverPreview.value = null
  emit('leave-unit')
}

// 父组件通过此方法设置预览数据
function setPreview(preview) {
  hoverPreview.value = preview
}

defineExpose({ setPreview })
</script>

<style scoped>
.turn-order-bar {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  background: var(--bg-primary);
  border: 2px solid var(--border-primary);
  overflow: visible;
  position: relative;
  z-index: 20;
}

.turn-order-bar .label {
  font-size: var(--fs-xs);
  color: var(--secondary-gold);
  margin-right: 8px;
  white-space: nowrap;
}

.turn-order-unit {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px 6px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  min-width: 36px;
  transition: all 0.2s;
  cursor: pointer;
}

.turn-order-unit:hover {
  transform: scale(1.1);
  z-index: 10;
}

.turn-order-unit.hovered {
  border-color: var(--primary-gold);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
}

.turn-order-unit.current {
  border-color: var(--primary-gold);
  background: linear-gradient(135deg, var(--secondary-gold), var(--dark-gold));
  transform: scale(1.1);
}

.turn-order-unit.acted {
  opacity: 0.4;
}

.turn-order-unit.player-side {
  border-top: 2px solid var(--color-friendly);
}

.turn-order-unit.enemy-side {
  border-top: 2px solid var(--color-hp);
}

/* 我的角色特殊标记 */
.turn-order-unit.my-character {
  border: 2px solid var(--primary-gold);
  border-top: 3px solid var(--primary-gold);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), var(--bg-secondary));
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.25);
  position: relative;
}

.turn-order-unit.my-character:not(.acted) {
  animation: myCharGlow 2s ease-in-out infinite;
}

.turn-order-unit.my-character.current {
  border-color: var(--primary-gold);
  box-shadow: 0 0 16px rgba(255, 215, 0, 0.6);
}

.my-char-badge {
  position: absolute;
  top: -8px;
  right: -6px;
  font-size: var(--fs-xs);
  z-index: 5;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
}

@keyframes myCharGlow {
  0%, 100% { box-shadow: 0 0 6px rgba(255, 215, 0, 0.2); }
  50% { box-shadow: 0 0 12px rgba(255, 215, 0, 0.4); }
}

.turn-order-unit .unit-emoji {
  font-size: 15px;
}

/* Tooltip */
.action-tooltip {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(13, 27, 42, 0.95);
  border: 2px solid var(--primary-gold);
  border-radius: 6px;
  padding: 8px 12px;
  min-width: 200px;
  max-width: 300px;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  animation: tooltipFadeIn 0.15s ease-out;
}

.action-tooltip::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: var(--primary-gold);
}

.tooltip-text {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  line-height: 1.6;
  white-space: normal;
  word-break: break-all;
}

.tooltip-target {
  color: var(--class-druid); /* 橙色 */
  font-weight: bold;
}

.tooltip-skill {
  color: var(--class-mage);
  font-weight: bold;
}

.tooltip-damage {
  color: var(--color-damage);
  font-weight: bold;
}

.tooltip-heal {
  color: var(--color-heal);
  font-weight: bold;
}

.tooltip-planned-badge {
  display: block;
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  font-weight: bold;
  margin-bottom: 4px;
  padding-bottom: 3px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
}

.tooltip-player-name {
  color: var(--primary-gold);
  font-weight: bold;
}

.tooltip-hint {
  display: block;
  font-size: var(--fs-xs);
  color: var(--class-druid); /* 橙色提示 */
  margin-top: 3px;
  opacity: 0.8;
}

@keyframes tooltipFadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.round-counter {
  margin-left: auto;
  font-size: var(--fs-xs);
  color: var(--secondary-gold);
  white-space: nowrap;
  padding: 4px 8px;
  background: rgba(255, 215, 0, 0.1); /* --primary-gold */
  border: 1px solid rgba(255, 215, 0, 0.2); /* --primary-gold */
}
</style>
