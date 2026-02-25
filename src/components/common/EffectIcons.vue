<template>
  <div class="effect-icons-wrapper" :class="[sizeClass, positionClass]">
    <!-- Buff 区域 -->
    <div v-if="buffs.length > 0" class="effects-row buffs-row">
      <div
        v-for="eff in buffs"
        :key="eff.name + eff.type"
        class="effect-badge positive"
        @mouseenter="showTooltip($event, eff)"
        @mouseleave="hideTooltip"
      >
        <span class="effect-emoji">{{ getEffectEmoji(eff) }}</span>
        <span v-if="eff.remainingDuration < 99" class="effect-dur">{{ eff.remainingDuration }}</span>
      </div>
    </div>

    <!-- Debuff 区域 -->
    <div v-if="debuffs.length > 0" class="effects-row debuffs-row">
      <div
        v-for="eff in debuffs"
        :key="eff.name + eff.type"
        class="effect-badge negative"
        @mouseenter="showTooltip($event, eff)"
        @mouseleave="hideTooltip"
      >
        <span class="effect-emoji">{{ getEffectEmoji(eff) }}</span>
        <span v-if="eff.remainingDuration < 99" class="effect-dur">{{ eff.remainingDuration }}</span>
      </div>
    </div>

    <!-- 自定义 Tooltip -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        class="effect-tooltip"
        :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      >
        <div class="tooltip-header" :class="{ 'is-positive': tooltip.effect?.isPositive, 'is-negative': !tooltip.effect?.isPositive }">
          {{ getEffectEmoji(tooltip.effect) }} {{ getEffectName(tooltip.effect) }}
        </div>
        <div class="tooltip-type">{{ getTypeName(tooltip.effect) }}</div>
        <div class="tooltip-desc">{{ getEffectDesc(tooltip.effect) }}</div>
        <div class="tooltip-duration">
          ⏱️ 剩余 {{ tooltip.effect?.remainingDuration >= 99 ? '永久' : tooltip.effect?.remainingDuration + ' 回合' }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  effects: { type: Array, default: () => [] },
  size: { type: String, default: 'normal' }, // 'normal' | 'small'
  position: { type: String, default: 'above' } // 'above' | 'below'
})

const sizeClass = computed(() => props.size === 'small' ? 'size-small' : 'size-normal')
const positionClass = computed(() => `pos-${props.position}`)

const buffs = computed(() => props.effects.filter(e => e.isPositive))
const debuffs = computed(() => props.effects.filter(e => !e.isPositive))

const tooltip = reactive({ visible: false, x: 0, y: 0, effect: null })

function showTooltip(event, eff) {
  const rect = event.target.getBoundingClientRect()
  tooltip.x = rect.left + rect.width / 2
  tooltip.y = rect.top - 8
  tooltip.effect = eff
  tooltip.visible = true
}

function hideTooltip() {
  tooltip.visible = false
}

const emojiMap = {
  dot: '☠️', hot: '💚', buff: '⬆️', debuff: '⬇️',
  shield: '🛡️', cc: '💫'
}

const typeNameMap = {
  dot: '持续伤害', hot: '持续治疗', buff: '增益效果',
  debuff: '减益效果', shield: '吸收护盾', cc: '控制效果'
}

const nameMap = {
  block: '格挡', defend: '防御', battleShout: '战斗怒吼',
  mortalWound: '致死打击', rend: '撕裂', sunder: '破甲',
  poison: '毒药', rupture: '割裂', backstabDebuff: '背刺虚弱',
  renew: '恢复', powerWordShield: '真言术：盾',
  arcaneBrilliance: '奥术光辉', frostbolt: '寒冰箭减速',
  ignite: '点燃', corruption: '腐蚀术', curseOfAgony: '痛苦诅咒',
  immolate: '献祭', stun: '昏迷', fear: '恐惧',
  freeze: '冰冻', slow: '减速', silence: '沉默',
  earthShield: '大地之盾', riptide: '激流',
  flameShock: '烈焰震击', heroism: '英勇',
  stoneSkin: '石肤术',
  huntersMark: '猎人印记', serpentSting: '毒蛇钉刺',
  trueshotAura: '强击光环', mongooseEvasion: '猫鼬闪避',
  intimidation: '恐吓', wyvernSting: '翼龙钉刺',
  summonPet: '召唤野兽', summonDemon: '召唤恶魔'
}

function getEffectEmoji(eff) {
  if (!eff) return '❓'
  return emojiMap[eff.type] || '❓'
}

function getEffectName(eff) {
  if (!eff) return ''
  return nameMap[eff.name] || eff.name || typeNameMap[eff.type] || eff.type
}

function getTypeName(eff) {
  if (!eff) return ''
  return typeNameMap[eff.type] || eff.type
}

function getEffectDesc(eff) {
  if (!eff) return ''
  const parts = []
  if (eff.stat) {
    const statNames = {
      damageReduction: '伤害减免', healingReceived: '治疗效果',
      armor: '护甲', attack: '攻击力', critChance: '暴击率',
      strength: '力量', agility: '敏捷', intellect: '智力',
      speed: '速度', allStats: '全属性'
    }
    const statName = statNames[eff.stat] || eff.stat
    const sign = eff.value > 0 ? '+' : ''
    const display = Math.abs(eff.value) < 1
      ? `${sign}${(eff.value * 100).toFixed(0)}%`
      : `${sign}${eff.value}`
    parts.push(`${statName} ${display}`)
  }
  if (eff.tickDamage) parts.push(`每回合 ${eff.tickDamage} 点${eff.damageType ? '(' + eff.damageType + ')' : ''}伤害`)
  if (eff.tickHeal) parts.push(`每回合恢复 ${eff.tickHeal} 点生命`)
  if (eff.absorbAmount) parts.push(`吸收 ${eff.absorbAmount} 点伤害`)
  if (eff.ccType) {
    const ccNames = { stun: '昏迷', fear: '恐惧', freeze: '冰冻', slow: '减速', silence: '沉默' }
    parts.push(ccNames[eff.ccType] || eff.ccType)
  }
  return parts.join('；') || '无详细描述'
}
</script>

<style>
/* Tooltip 使用全局样式（Teleport 到 body） */
.effect-tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
  z-index: 9999;
  background: var(--bg-primary, #0D1B2A);
  border: 1px solid var(--secondary-gold, #C9A227);
  border-radius: 4px;
  padding: 6px 10px;
  min-width: 140px;
  max-width: 220px;
  pointer-events: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
  font-family: var(--pixel-font, monospace);
}

.tooltip-header {
  font-size: var(--fs-xs, 12px);
  font-weight: bold;
  margin-bottom: 3px;
}

.tooltip-header.is-positive {
  color: var(--color-buff, #4ade80);
}

.tooltip-header.is-negative {
  color: var(--color-debuff, #f87171);
}

.tooltip-type {
  font-size: var(--fs-xs, 12px);
  color: var(--text-secondary, #8a8a6a);
  margin-bottom: 4px;
}

.tooltip-desc {
  font-size: var(--fs-xs, 12px);
  color: var(--text-primary, #e8d5b0);
  line-height: 1.4;
  margin-bottom: 3px;
}

.tooltip-duration {
  font-size: var(--fs-xs, 12px);
  color: var(--secondary-gold, #C9A227);
}
</style>

<style scoped>
.effect-icons-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
}

.effects-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  justify-content: flex-start;
  max-width: 100%;
}

.effect-badge {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  padding: 1px 3px;
  border-radius: 2px;
  border: 1px solid;
  cursor: default;
  line-height: 1;
  position: relative;
  flex: 0 0 auto;
}

.buffs-row {
  margin-bottom: 1px;
}

.debuffs-row {
  margin-top: 1px;
}

.effect-badge.positive {
  border-color: var(--color-buff);
  background: rgba(74, 222, 128, 0.15); /* --color-buff */
}

.effect-badge.negative {
  border-color: var(--color-debuff);
  background: rgba(248, 113, 113, 0.15); /* --color-debuff */
}

/* Normal size */
.size-normal .effect-emoji { font-size: var(--fs-xs); }
.size-normal .effect-dur { font-size: var(--fs-xs); color: var(--text-primary); }

/* Small size (dungeon) */
.size-small .effect-emoji { font-size: var(--fs-xs); }
.size-small .effect-dur { font-size: var(--fs-xs); color: var(--text-primary); }
</style>
