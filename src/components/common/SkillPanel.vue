<template>
  <!-- 副本模式：全屏弹窗列表 -->
  <div v-if="mode === 'overlay'" class="skills-overlay" @click.self="$emit('close')">
    <div class="skills-panel">
      <div class="skills-header">
        <h3>⚡ 技能选择</h3>
        <button class="skills-close" @click="$emit('close')">✕</button>
      </div>
      <div class="skills-body">
        <!-- 资源状态 -->
        <div class="resource-status">
          <div class="resource-status-text">
            {{ resourceLabel }}: <span class="resource-value">{{ currentResource }}/{{ maxResource }}</span>
          </div>
          <div v-if="comboPoints" class="combo-text">
            连击点: <span class="combo-stars">{{ comboDisplay }}</span> ({{ comboPoints.current }}/{{ comboPoints.max }})
          </div>
        </div>

        <!-- 技能列表 -->
        <div
          v-for="item in skillItems"
          :key="item.id"
          class="skill-list-item"
          :class="{ disabled: item.isDisabled, 'skill-locked': item.isLocked }"
          @click="!item.isDisabled && $emit('use-skill', item.id)"
        >
          <div class="skill-list-icon">
            <img v-if="item.iconUrl" :src="item.iconUrl" class="skill-icon-img" :alt="item.name" />
            <span v-else>{{ item.icon }}</span>
          </div>
          <div class="skill-list-info">
            <div class="skill-list-name">
              <span v-if="item.emoji" class="skill-emoji-tag">{{ item.emoji }}</span>
              {{ item.name }}
              <span v-if="item.category === 'builder'" class="skill-tag builder">[连击]</span>
              <span v-else-if="item.category === 'finisher'" class="skill-tag finisher">[终结]</span>
              <span v-if="item.damageTypeLabel" class="skill-dmg-tag">{{ item.damageTypeLabel }}</span>
              <span v-if="item.isLocked" class="skill-lock-icon">🔒Lv.{{ item.unlockLevel }}</span>
            </div>
            <div class="skill-list-desc">{{ item.description }}</div>
          </div>
          <div class="skill-list-cost">
            <div class="skill-list-resource" :class="item.resourceType">{{ item.resourceLabel }}: {{ item.resourceCostValue }}</div>
            <div v-if="showActionPoints" class="skill-list-ap">⚡{{ item.apCost }}点</div>
            <div v-if="item.cooldownText" class="skill-list-cooldown">{{ item.cooldownText }}</div>
            <div v-if="item.needsComboPoints" class="combo-required">需要连击点</div>
          </div>
        </div>

        <div v-if="skillItems.length === 0" class="no-skills">没有可用技能</div>
      </div>
    </div>
  </div>

  <!-- 野外模式：内联按钮面板 -->
  <div v-else class="skills-inline">
    <div class="skills-inline-label">技能</div>
    <button
      v-for="item in skillItems"
      :key="item.id"
      class="skill-btn pixel-btn"
      :class="{
        'on-cooldown': item.isOnCooldown,
        'no-resource': !item.hasEnoughResource,
        'needs-combo': item.needsComboPoints,
        'skill-locked': item.isLocked,
        'auto-disabled': !item.isLocked && props.disabled && !item.isOnCooldown
      }"
      :disabled="item.isDisabled"
      title=""
      @click="$emit('use-skill', item.id)"
      @mouseenter="onSkillHover(item, $event)"
      @mouseleave="onSkillLeave"
    >
      <img v-if="item.iconUrl" :src="item.iconUrl" class="skill-btn-icon" :alt="item.name" />
      <span v-else class="skill-emoji">{{ item.emoji || '' }}</span>
      <span class="skill-name">{{ item.name }}</span>
      <span v-if="item.isLocked" class="skill-sub-info">Lv.{{ item.unlockLevel }}</span>
      <!-- 锁定遮罩层 -->
      <span class="skill-lock-overlay" v-if="item.isLocked">🔒</span>
    </button>
  </div>

  <!-- 技能悬浮 Tooltip -->
  <Teleport to="body">
    <div
      v-if="skillTooltip.visible"
      class="skill-hover-tooltip"
      :style="{ left: skillTooltip.x + 'px', top: skillTooltip.y + 'px' }"
    >
      {{ skillTooltip.text }}
    </div>
  </Teleport>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'
import { GameData } from '@/data/GameData.js'

const props = defineProps({
  /** 'inline' = 野外按钮行, 'overlay' = 副本弹窗列表 */
  mode: {
    type: String,
    default: 'inline',
    validator: v => ['inline', 'overlay'].includes(v)
  },
  /** 当前行动单位（副本模式需要，野外模式用 gameStore.player） */
  unit: {
    type: Object,
    default: null
  },
  /** 是否显示行动点消耗（副本模式） */
  showActionPoints: {
    type: Boolean,
    default: false
  },
  /** 外部传入的禁用状态（如野外 !isPlayerTurn） */
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'use-skill'])

const gameStore = useGameStore()

// ===== 技能 Hover Tooltip =====
const skillTooltip = reactive({ visible: false, x: 0, y: 0, text: '' })

function onSkillHover(item, event) {
  const rect = event.currentTarget.getBoundingClientRect()
  skillTooltip.x = rect.left + rect.width / 2
  skillTooltip.y = rect.top - 6
  skillTooltip.text = item.tooltipText
  skillTooltip.visible = true
}

function onSkillLeave() {
  skillTooltip.visible = false
}

// ===== 资源 =====

function getResourceLabel(resourceType) {
  const labels = { mana: '💧法力', rage: '💢怒气', energy: '⚡能量' }
  return labels[resourceType] || '消耗'
}

const resourceEmojiMap = { mana: '💧', rage: '💢', energy: '⚡' }

function getCurrentResource(unit, resourceType) {
  if (unit.resource && unit.resource.type === resourceType) {
    return unit.resource.current ?? 0
  }
  if (resourceType === 'mana') return unit.currentMp ?? unit.resource?.current ?? unit.stats?.mana ?? 100
  if (resourceType === 'rage') return unit.currentRage ?? unit.resource?.current ?? 0
  if (resourceType === 'energy') return unit.currentEnergy ?? unit.resource?.current ?? 100
  return 100
}

// ===== 当前单位 =====
const activeUnit = computed(() => props.unit || gameStore.player)

const classData = computed(() => {
  const u = activeUnit.value
  if (!u) return null
  const classId = u.classId || u.class
  return classId ? GameData.classes[classId] : null
})

const resourceType = computed(() => classData.value?.resourceType || 'mana')
const resourceLabel = computed(() => getResourceLabel(resourceType.value))
const resourceEmoji = computed(() => resourceEmojiMap[resourceType.value] || '💧')
const maxResource = computed(() => activeUnit.value?.resource?.max || 100)
const currentResource = computed(() => {
  if (!activeUnit.value) return 0
  return Math.floor(getCurrentResource(activeUnit.value, resourceType.value))
})

const comboPoints = computed(() => activeUnit.value?.comboPoints || null)
const comboDisplay = computed(() => {
  if (!comboPoints.value) return ''
  const current = comboPoints.value.current || 0
  const max = comboPoints.value.max || 5
  return '⭐'.repeat(current) + '☆'.repeat(max - current)
})

// ===== 技能辅助 =====

function getSkillIcon(skill) {
  if (skill.emoji) return skill.emoji
  if (skill.heal) return '💚'
  if (skill.effects?.some(e => e.type === 'buff')) return '✨'
  if (skill.effects?.some(e => e.type === 'debuff')) return '💀'
  if (skill.effects?.some(e => e.type === 'dot')) return '🔥'
  if (skill.effects?.some(e => e.type === 'summon')) return '👻'
  if (skill.effects?.some(e => e.type === 'cc')) return '💫'
  if (skill.effect?.type === 'buff') return '✨'
  if (skill.effect?.type === 'debuff') return '💀'
  if (skill.effect?.type === 'dot') return '🔥'
  if (skill.effect?.type === 'summon') return '👻'
  if (skill.effect?.name === 'stun') return '💫'
  if (skill.damage) return '⚔️'
  return '⚡'
}

function getSkillApCost(skill) {
  if (skill.actionPoints !== undefined && skill.actionPoints !== null) return skill.actionPoints
  if (skill.heal) return 2
  if (skill.effect?.type === 'buff' || skill.effect?.type === 'debuff') return 2
  if (skill.damage) return 2
  return 1
}

function getDamageTypeLabel(damageType) {
  if (!damageType || damageType === 'physical') return ''
  const labels = {
    fire: '🔥火焰',
    frost: '❄️冰霜',
    nature: '🌿自然',
    arcane: '✨奥术',
    holy: '✝️神圣',
    shadow: '🌑暗影'
  }
  return labels[damageType] || damageType
}

function isSkillUnlocked(skill) {
  if (!skill.unlockLevel) return true
  const playerLevel = activeUnit.value?.level || 1
  return playerLevel >= skill.unlockLevel
}

function isComboRequired(skill) {
  return skill.comboPoints?.requires || skill.requiresComboPoints
}

function hasEnoughResource(skill) {
  const cost = skill.resourceCost
  if (!cost || cost.value <= 0) return true
  const r = activeUnit.value?.resource
  if (!r) return true
  if (cost.type && cost.type !== r.type) return true
  return r.current >= cost.value
}

function getSkillTooltip(skill, cooldownRemaining = 0) {
  const resourceNames = { mana: '法力', rage: '怒气', energy: '能量' }
  let tip = `${skill.name}: ${skill.description || ''}`
  const cost = skill.resourceCost
  if (cost && cost.value > 0) {
    const resName = resourceNames[cost.type] || '资源'
    tip += `\n消耗 ${cost.value} ${resName}`
  }
  if (skill.cooldown > 0) {
    tip += `\n冷却时间: ${cooldownRemaining}/${skill.cooldown}`
  }
  if (skill.damageType && skill.damageType !== 'physical') {
    const labels = { fire: '火焰', frost: '冰霜', nature: '自然', arcane: '奥术', holy: '神圣', shadow: '暗影' }
    tip += `\n伤害类型: ${labels[skill.damageType] || skill.damageType}`
  }
  if (!isSkillUnlocked(skill)) {
    tip += `\n需要等级 ${skill.unlockLevel}`
  }
  return tip
}

function getCooldownRemaining(skillId) {
  return activeUnit.value?.skillCooldowns?.[skillId] || 0
}

// ===== 技能列表 =====

const skillItems = computed(() => {
  const u = activeUnit.value
  if (!u) return []

  // 技能来源：unit.skills 数组 或 classData.skills 数组
  const skillIds = u.skills || classData.value?.skills || []

  const dungeonSystem = gameStore.dungeonCombatSystem
  const apState = dungeonSystem?.actionPointStates?.[u.id]

  return skillIds.map(skillId => {
    const skill = GameData.skills[skillId]
    if (!skill) return null

    const skillResourceType = skill.resourceCost?.type || 'mana'
    const resourceCostValue = skill.resourceCost?.value || skill.manaCost || 0
    const skillResourceLabel = getResourceLabel(skillResourceType)

    const apCost = getSkillApCost(skill)
    const cooldownText = skill.cooldown > 0 ? `CD: ${skill.cooldown}回合` : ''
    const cooldownRemaining = getCooldownRemaining(skillId)
    const isOnCooldown = cooldownRemaining > 0

    const enoughResource = hasEnoughResource(skill)

    // 兼容新旧 combo schema
    let needsComboPoints = false
    if (isComboRequired(skill)) {
      needsComboPoints = (u.comboPoints?.current || 0) <= 0
    }

    const isLocked = !isSkillUnlocked(skill)

    // AP 检查（仅副本）
    let canUseAp = true
    if (props.showActionPoints && apState && typeof window !== 'undefined' && window.ActionPointSystem) {
      const result = window.ActionPointSystem.canUseSkill(apState, skillId)
      canUseAp = result.canUse
    }

    const isDisabled = props.disabled || isLocked || !canUseAp || !enoughResource || needsComboPoints || isOnCooldown

    return {
      id: skillId,
      name: skill.name,
      description: skill.description,
      emoji: skill.emoji || '',
      icon: getSkillIcon(skill),
      iconUrl: skill.icon || null,
      resourceType: skillResourceType,
      resourceLabel: skillResourceLabel,
      resourceCostValue,
      apCost,
      cooldownText,
      cooldownRemaining,
      isOnCooldown,
      hasEnoughResource: enoughResource,
      needsComboPoints,
      isDisabled,
      isLocked,
      unlockLevel: skill.unlockLevel || 0,
      category: skill.category,
      damageTypeLabel: getDamageTypeLabel(skill.damageType),
      tooltipText: getSkillTooltip(skill, cooldownRemaining)
    }
  }).filter(Boolean)
})
</script>

<style scoped>
/* ═══════════════════════════════════════════
   共通样式
   ═══════════════════════════════════════════ */

.skill-tag {
  font-size: var(--fs-xs);
}
.skill-tag.builder {
  color: var(--color-friendly);
}
.skill-tag.finisher {
  color: var(--class-druid); /* #FF7D0A 橙色 */
}

.combo-required {
  font-size: var(--fs-xs);
  color: var(--color-debuff);
}

.skill-emoji-tag {
  font-size: var(--fs-xs);
  margin-right: 2px;
}

.skill-dmg-tag {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  margin-left: 4px;
}

.skill-lock-icon {
  font-size: var(--fs-xs);
  color: var(--color-debuff);
  margin-left: 4px;
}

.no-skills {
  text-align: center;
  padding: 20px;
  color: var(--text-primary);
  font-size: var(--fs-xs);
}

/* ═══════════════════════════════════════════
   Overlay 模式（副本弹窗列表）
   ═══════════════════════════════════════════ */

.skills-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.skills-panel {
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  background: linear-gradient(145deg, var(--bg-secondary), var(--bg-primary));
  border: 3px solid var(--primary-gold);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8), 0 0 15px var(--primary-gold);
}

.skills-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: linear-gradient(90deg, var(--secondary-gold), var(--primary-gold));
  border-bottom: 2px solid var(--dark-gold);
}

.skills-header h3 {
  font-size: var(--fs-xs);
  color: var(--bg-primary);
  margin: 0;
}

.skills-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--bg-primary);
  padding: 4px;
  font-family: var(--pixel-font);
}

.skills-body {
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-status {
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.resource-status-text {
  font-size: var(--fs-xs);
  color: var(--text-primary);
}

.resource-value {
  color: var(--accent-gold);
}

.combo-text {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  margin-top: 5px;
}

.combo-stars {
  color: var(--primary-gold);
}

/* 技能列表项 */
.skill-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: linear-gradient(145deg, var(--bg-tertiary), var(--bg-secondary));
  border: 2px solid var(--border-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-list-item:hover:not(.disabled):not(.skill-locked) {
  border-color: var(--primary-gold);
  background: linear-gradient(145deg, var(--bg-tertiary), var(--bg-tertiary));
  transform: translateY(-2px);
}

.skill-list-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.skill-list-item.skill-locked {
  opacity: 0.35;
  border-color: var(--border-primary);
  cursor: not-allowed;
}

.skill-list-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-surface));
  border: 2px solid var(--secondary-gold);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  overflow: hidden;
}

.skill-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.skill-list-info {
  flex: 1;
}

.skill-list-name {
  font-size: var(--fs-xs);
  color: var(--accent-gold);
  margin-bottom: 3px;
}

.skill-list-desc {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  opacity: 0.8;
}

.skill-list-cost {
  text-align: right;
  flex-shrink: 0;
}

.skill-list-resource {
  font-size: var(--fs-xs);
  color: var(--color-mana);
  margin-bottom: 2px;
}
.skill-list-resource.rage { color: var(--color-rage); }
.skill-list-resource.energy { color: var(--color-energy); }
.skill-list-resource.mana { color: var(--color-mana); }

.skill-list-ap {
  font-size: var(--fs-xs);
  color: var(--secondary-gold);
}

.skill-list-cooldown {
  font-size: var(--fs-xs);
  color: var(--color-debuff);
  margin-top: 2px;
}

/* ═══════════════════════════════════════════
   Inline 模式（野外按钮行）
   ═══════════════════════════════════════════ */

.skills-inline {
  background: var(--bg-surface);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 62px;
}

.skills-inline-label {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  font-weight: bold;
  flex-shrink: 0;
}

.skill-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 10px;
  font-size: var(--fs-xs);
  min-width: 70px;
  height: 52px;
  overflow: hidden;
  position: relative;
}

/* --- 状态：已解锁但禁用（自动战斗/非玩家回合） --- */
.skill-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* --- 状态：自动战斗中已解锁的技能，保留颜色辨识度 --- */
.skill-btn.auto-disabled {
  opacity: 0.6;
  border-color: var(--border-primary);
}

.skill-btn.on-cooldown {
  border-color: var(--text-muted);
}

.skill-btn.no-resource {
  border-color: var(--color-hp);
}

.skill-btn.needs-combo {
  border-color: var(--text-muted);
}

/* --- 状态：锁定（未解锁）— 明显区别于已解锁技能 --- */
.skill-btn.skill-locked {
  opacity: 0.25;
  border-color: var(--text-muted);
  filter: grayscale(100%) brightness(0.6);
  background: rgba(0, 0, 0, 0.4);
}

.skill-btn.skill-locked .skill-emoji {
  opacity: 0.4;
}

.skill-btn.skill-locked .skill-name {
  color: var(--text-muted, #666);
}

.skill-btn.skill-locked .skill-sub-info {
  color: var(--text-muted, #666);
}

.skill-name {
  font-weight: bold;
  color: var(--text-primary);
  white-space: nowrap;
  font-size: 10px;
}

.skill-sub-info {
  font-size: var(--fs-xs);
  color: var(--secondary-gold);
  height: 1.2em;
}

.skill-btn.on-cooldown .skill-sub-info {
  color: var(--color-debuff);
}

.skill-emoji {
  font-size: 20px;
}

.skill-btn-icon {
  width: 28px;
  height: 28px;
  object-fit: cover;
  image-rendering: pixelated;
  border-radius: 3px;
  flex-shrink: 0;
}

/* --- 锁定遮罩层：居中大锁头 + 半透明背景 --- */
.skill-lock-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: rgba(0, 0, 0, 0.45);
  border-radius: inherit;
  pointer-events: none;
}
</style>

<!-- 非 scoped：Teleport 到 body 的技能 tooltip -->
<style>
.skill-hover-tooltip {
  position: fixed;
  z-index: 9999;
  transform: translate(-50%, -100%);
  background: var(--bg-primary, #0D1B2A);
  border: 1px solid var(--secondary-gold, #C9A227);
  border-radius: 4px;
  padding: 6px 10px;
  max-width: 320px;
  font-size: var(--fs-xs, 12px);
  color: var(--text-primary, #e8d5b0);
  font-family: var(--pixel-font, monospace);
  line-height: 1.5;
  pointer-events: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
  white-space: pre-wrap;
  animation: skillTipIn 0.1s ease;
}

@keyframes skillTipIn {
  from { opacity: 0; transform: translate(-50%, calc(-100% + 4px)); }
  to   { opacity: 1; transform: translate(-50%, -100%); }
}
</style>
