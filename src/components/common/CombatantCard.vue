<template>
  <div class="unit-wrapper" :class="[sizeClass, { 'is-boss': isBoss }]">
    <div
      class="combatant-card"
      :class="[sideClass, sizeClass, shakeClass, highlightClass, deathAnimClass, {
        'selectable': selectable,
        'selected': selected,
        'dead': dead && !deathAnim,
        'is-boss': isBoss
      }]"
      :style="cardStyle"
      @click="onClick"
    >
      <!-- Floating damage numbers -->
      <div class="floating-numbers">
        <transition-group name="dmg-float">
          <span
            v-for="num in floats"
            :key="num.key"
            class="floating-number"
            :class="{ crit: num.isCrit, heal: num.isHeal }"
          >
            <span v-if="num.skillName" class="float-skill-name">{{ num.skillName }}</span>
            <span class="float-damage-value">{{ num.text }}</span>
            <span v-if="num.isCrit && !num.isHeal" class="float-crit-label">暴击</span>
          </span>
        </transition-group>
      </div>

      <!-- Normal size layout (wild combat) -->
      <template v-if="size === 'normal'">
        <div class="combatant-sprite">
          <PixelIcon v-if="unit.icon" :src="unit.icon" :size="42" :fallback="unit.emoji || '❓'" />
          <span v-else>{{ unit.emoji || '❓' }}</span>
        </div>
        <div class="combatant-name">{{ unit.name || '未知' }}</div>
        <ResourceBar
          :current="unit.currentHp || 0"
          :max="unit.maxHp || 1"
          type="hp"
          showValue="below"
          size="normal"
        />
        <ResourceBar
          v-if="unit.resource"
          :current="unit.resource.current || 0"
          :max="unit.resource.max || 1"
          :type="unit.resource.type || 'mana'"
          showValue="below"
          size="normal"
        />
        <!-- Combo points -->
        <div v-if="unit.comboPoints" class="combo-display">
          {{ comboStars }}
        </div>
        <!-- Placeholder bars for alignment -->
        <div v-if="showPlaceholder" class="placeholder-spacer">
          <ResourceBar :current="0" :max="1" type="mana" showValue="below" size="normal" style="visibility: hidden;" />
        </div>
      </template>

      <!-- Compact size layout (dungeon combat) -->
      <template v-else>
        <div class="unit-avatar">
          <PixelIcon v-if="unit.icon" :src="unit.icon" :size="22" :fallback="unit.emoji || '❓'" />
          <span v-else>{{ unit.emoji || '❓' }}</span>
        </div>
        <div class="unit-info">
          <div class="unit-name">{{ unit.name || '未知' }}</div>
          <div class="unit-bar-group">
            <ResourceBar
              :current="unit.currentHp || 0"
              :max="unit.maxHp || 1"
              type="hp"
              showValue="overlay"
              size="compact"
            />
            <ResourceBar
              v-if="unit.resource"
              :current="unit.resource.current || 0"
              :max="unit.resource.max || 1"
              :type="unit.resource.type || 'mana'"
              showValue="overlay"
              size="compact"
            />
            <!-- 敌方无资源时也显示占位条保持高度一致 -->
            <div v-else class="resource-placeholder"></div>
          </div>
        </div>
      </template>
    </div>

    <!-- Effects below card (buffs + debuffs, always reserve space) -->
    <div class="effect-slot effect-slot-below" :class="sizeClass">
      <EffectIcons v-if="buffs.length > 0" :effects="buffs" :size="effectIconSize" position="below" />
      <EffectIcons v-if="debuffs.length > 0" :effects="debuffs" :size="effectIconSize" position="below" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ResourceBar from './ResourceBar.vue'
import EffectIcons from './EffectIcons.vue'
import PixelIcon from './PixelIcon.vue'
import { EffectSystem } from '@/systems/EffectSystem.js'
import { GameData } from '@/data/GameData.js'

const props = defineProps({
  unit: { type: Object, required: true },
  size: { type: String, default: 'normal' },       // 'normal' | 'compact'
  side: { type: String, default: 'player' },        // 'player' | 'enemy'
  floats: { type: Array, default: () => [] },
  shaking: { type: [String, Boolean], default: false }, // false | 'hit' | 'crit'
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  dead: { type: Boolean, default: false },
  deathAnim: { type: String, default: '' },  // 'dying-enemy' | 'dying-player' | 'dead' | ''
  highlightClass: { type: [String, Object], default: '' },
  isBoss: { type: Boolean, default: false },
  showPlaceholder: { type: Boolean, default: false }
})

const emit = defineEmits(['click'])

const sizeClass = computed(() => `size-${props.size}`)
const sideClass = computed(() => `side-${props.side}`)

const effectIconSize = computed(() => props.size === 'compact' ? 'small' : 'normal')

const shakeClass = computed(() => {
  if (props.shaking === 'crit') return 'crit-shake'
  if (props.shaking === 'hit' || props.shaking === true) return 'hit-shake'
  return ''
})

const deathAnimClass = computed(() => {
  if (props.deathAnim === 'dying-enemy') return 'dying-enemy'
  if (props.deathAnim === 'dying-player') return 'dying-player'
  if (props.deathAnim === 'dead') return 'dead'
  return ''
})

// Effects from unit
const unitEffects = computed(() => {
  if (!props.unit) return []
  return EffectSystem.getActiveEffects(props.unit)
})
const buffs = computed(() => unitEffects.value.filter(e => e.isPositive))
const debuffs = computed(() => unitEffects.value.filter(e => !e.isPositive))

// Combo points
const comboStars = computed(() => {
  const cp = props.unit?.comboPoints
  if (!cp) return ''
  return '⭐'.repeat(cp.current) + '☆'.repeat(cp.max - cp.current)
})

// 职业配色（友方卡片底色）
const classColor = computed(() => {
  if (props.side !== 'player') return null
  const classId = props.unit?.classId || props.unit?.class
  if (!classId) return null
  return GameData.classes[classId]?.color || null
})

const cardStyle = computed(() => {
  if (!classColor.value) return {}
  const c = classColor.value
  return {
    background: `linear-gradient(180deg, ${c}55, ${c}25)`,
    borderColor: `${c}BB`
  }
})

function onClick() {
  emit('click', props.unit)
}
</script>

<style scoped>
/* ===== Wrapper ===== */
.unit-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.unit-wrapper.size-compact {
  min-width: 0;
  align-items: stretch;
}

/* ===== Effect Slots (fixed height to prevent layout shift) ===== */
.effect-slot {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1px;
}

.effect-slot.size-normal {
  min-height: 22px;
}

.effect-slot.size-compact {
  min-height: 18px;
}

/* ===== Card Base ===== */
.combatant-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
}

/* ===== Normal Size (Wild Combat) ===== */
.combatant-card.size-normal {
  text-align: center;
  min-width: 130px;
}

.combatant-card.size-normal .combatant-sprite {
  font-size: 42px;
  margin-bottom: 6px;
  transition: transform 0.15s ease;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.combatant-card.size-normal .combatant-name {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  margin-bottom: 4px;
  height: 14px;
  line-height: 14px;
}

.combatant-card.size-normal .combo-display {
  font-size: var(--fs-xs);
  margin-top: 4px;
  color: var(--primary-gold);
}

.placeholder-spacer {
  width: 100%;
}

/* ===== Compact Size (Dungeon Combat) ===== */
.combatant-card.size-compact {
  gap: 5px;
  padding: 8px 6px;
  border: 2px solid var(--border-primary);
  border-radius: 6px;
  cursor: pointer;
  overflow: visible;
}

.combatant-card.size-compact.side-player {
  background: linear-gradient(180deg, var(--bg-tertiary), var(--bg-primary));
  border-color: var(--border-primary);
}

.combatant-card.size-compact.side-enemy {
  background: linear-gradient(180deg, #2a1a1a, #1b0d0d); /* 敌方深红底色 */
  border-color: #5a3a3a; /* 敌方暗红边框 */
}

.combatant-card.size-compact.side-enemy:hover {
  border-color: var(--primary-gold);
  transform: scale(1.05);
}

/* Boss variant */
.combatant-card.size-compact.is-boss {
  border-color: var(--color-hp);
  background: rgba(139, 0, 0, 0.15);
  box-shadow: 0 0 8px rgba(139, 0, 0, 0.3);
}

.combatant-card.size-compact.is-boss .unit-avatar {
  font-size: 32px;
}

.combatant-card.size-compact.is-boss .unit-name {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  font-weight: bold;
}

/* Unit avatar (compact) */
.unit-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.combatant-card.side-player .unit-avatar {
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
  border: 2px solid var(--border-primary);
}

.combatant-card.side-enemy .unit-avatar {
  background: linear-gradient(135deg, #3a2a2a, #2a1a1a); /* 敌方深红底色 */
  border: 2px solid var(--color-hp);
}

.unit-info {
  text-align: center;
  width: 100%;
}

.unit-name {
  font-size: var(--fs-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.combatant-card.size-compact.side-player .unit-name {
  color: var(--color-friendly);
}

.combatant-card.size-compact.side-enemy .unit-name {
  color: var(--color-debuff);
}

.unit-bar-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* 敌方无资源时的占位条，保持与我方卡片高度一致 */
.resource-placeholder {
  height: 13px;
  width: 100%;
}

/* ===== Interaction States ===== */
.combatant-card.selected {
  border-color: var(--primary-gold);
  box-shadow: 0 0 15px var(--primary-gold);
  transform: scale(1.08);
}

.combatant-card.dead {
  opacity: 0.3;
  filter: grayscale(0.9);
  pointer-events: none;
}

/* ===== Death Animations ===== */
.combatant-card.dying-enemy {
  animation: enemyDeath 0.8s ease-out forwards;
  pointer-events: none;
}

.combatant-card.dying-player {
  animation: playerDeath 0.8s ease-out forwards;
  pointer-events: none;
}

/* ===== Floating Numbers ===== */
.floating-numbers {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.floating-number {
  font-weight: bold;
  font-size: var(--fs-xs);
  color: var(--color-damage);
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8), 1px 1px 0 #000;
  white-space: nowrap;
  animation: damageFloat 0.8s ease-out forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.float-skill-name {
  font-size: 10px;
  opacity: 0.85;
  font-weight: normal;
  color: inherit;
  letter-spacing: 0.5px;
}

.float-damage-value {
  font-weight: bold;
  font-size: inherit;
}

.float-crit-label {
  font-size: 10px;
  color: var(--primary-gold);
  font-weight: bold;
  text-shadow: 0 0 4px #ff6600, 1px 1px 0 #000;
  letter-spacing: 1px;
}

.floating-number.crit {
  font-size: var(--fs-md);
  color: var(--primary-gold);
  text-shadow: 0 0 8px #ff6600, 0 0 16px #ff3300, 0 0 24px var(--color-damage), 1px 1px 0 #000;
  animation: critDamageFloat 1.2s ease-out forwards;
}

.floating-number.heal {
  color: var(--color-heal);
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8), 0 0 8px var(--color-heal), 1px 1px 0 #000;
  animation: healFloat 0.8s ease-out forwards;
}

/* transition-group */
.dmg-float-enter-active { transition: none; }
.dmg-float-leave-active { position: absolute; }

/* ===== Shake Animations ===== */
.combatant-card.hit-shake {
  animation: hitShake 0.3s ease-out;
}

.combatant-card.crit-shake {
  animation: critHitShake 0.6s ease-out;
}

/* ===== Keyframes ===== */
@keyframes hitShake {
  0% { transform: translateX(0); }
  15% { transform: translateX(-4px) rotate(-1deg); }
  30% { transform: translateX(4px) rotate(1deg); }
  45% { transform: translateX(-3px); }
  60% { transform: translateX(3px); }
  75% { transform: translateX(-1px); }
  100% { transform: translateX(0); }
}

@keyframes critHitShake {
  0% { transform: translateX(0) scale(1); }
  8% { transform: translateX(-8px) rotate(-3deg) scale(1.05); }
  16% { transform: translateX(8px) rotate(3deg) scale(1.08); }
  24% { transform: translateX(-6px) rotate(-2deg) scale(1.04); }
  32% { transform: translateX(6px) rotate(2deg) scale(1.06); }
  44% { transform: translateX(-4px) rotate(-1deg); }
  56% { transform: translateX(4px) rotate(1deg); }
  68% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
  100% { transform: translateX(0) scale(1); }
}

@keyframes damageFloat {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  20% { opacity: 1; transform: translateY(-10px) scale(1.1); }
  100% { opacity: 0; transform: translateY(-45px) scale(0.8); }
}

@keyframes critDamageFloat {
  0% { opacity: 1; transform: translateY(0) scale(0.5); }
  8% { opacity: 1; transform: translateY(-5px) scale(1.6); }
  20% { opacity: 1; transform: translateY(-12px) scale(1.3); }
  100% { opacity: 0; transform: translateY(-65px) scale(0.7); }
}

@keyframes healFloat {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  20% { opacity: 1; transform: translateY(-8px) scale(1.1); }
  100% { opacity: 0; transform: translateY(-35px) scale(0.9); }
}

@keyframes enemyDeath {
  0% { opacity: 1; transform: scale(1); filter: brightness(1); }
  10% { opacity: 1; transform: scale(1.1); filter: brightness(2) saturate(2) hue-rotate(-10deg); box-shadow: 0 0 20px rgba(255, 60, 60, 0.8); }
  20% { opacity: 1; transform: scale(1.05) rotate(2deg); filter: brightness(1.5) saturate(1.5); }
  30% { opacity: 1; transform: scale(1.08) rotate(-2deg); filter: brightness(2) saturate(2); box-shadow: 0 0 15px rgba(255, 100, 0, 0.6); }
  45% { opacity: 0.9; transform: scale(0.9) rotate(1deg); filter: brightness(1.2) grayscale(0.3); }
  60% { opacity: 0.6; transform: scale(0.7); filter: brightness(0.8) grayscale(0.6); }
  80% { opacity: 0.3; transform: scale(0.4) translateY(8px); filter: grayscale(0.9); }
  100% { opacity: 0; transform: scale(0.2) translateY(12px); filter: grayscale(1); }
}

@keyframes playerDeath {
  0% { opacity: 1; transform: scale(1) rotate(0); filter: brightness(1); }
  10% { opacity: 1; transform: scale(1.02); filter: brightness(1.5) saturate(1.5) sepia(0.3); }
  20% { opacity: 1; transform: translateX(-3px) rotate(-1deg); filter: brightness(1.2); }
  30% { opacity: 1; transform: translateX(3px) rotate(1deg); filter: brightness(0.9); }
  40% { opacity: 0.9; transform: translateX(-2px) rotate(-1deg); filter: grayscale(0.2); }
  55% { opacity: 0.7; transform: rotate(8deg) translateY(3px); filter: grayscale(0.5); }
  70% { opacity: 0.5; transform: rotate(15deg) translateY(6px); filter: grayscale(0.7); }
  85% { opacity: 0.35; transform: rotate(20deg) translateY(8px); filter: grayscale(0.85); }
  100% { opacity: 0.3; transform: rotate(22deg) translateY(10px); filter: grayscale(0.9); }
}
</style>
