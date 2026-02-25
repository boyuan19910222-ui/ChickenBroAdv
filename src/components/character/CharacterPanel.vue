<template>
  <aside class="character-panel pixel-panel">
    <div class="char-header">
      <div class="avatar" :style="{ borderColor: classColor, boxShadow: `0 0 6px ${classColor}40` }"><PixelIcon :src="player?.icon || ''" :size="42" fallback="🐔" /></div>
      <div class="char-info">
        <div class="char-name" :style="{ color: classColor }">{{ player?.name || '未知' }}</div>
        <div class="char-class">Lv.{{ player?.level || 1 }} {{ className }}</div>
      </div>
    </div>

    <!-- HP -->
    <div class="stat-bar-group">
      <div class="stat-label">
        <span>生命值</span>
        <span class="stat-numbers">{{ player?.currentHp || 0 }}/{{ player?.maxHp || 0 }}</span>
      </div>
      <div class="bar-container">
        <div class="bar-fill hp" :style="{ width: hpPercent + '%' }"></div>
      </div>
    </div>

    <!-- Resource (Mana/Energy/Rage) -->
    <div class="stat-bar-group">
      <div class="stat-label">
        <span>{{ resourceEmoji }} {{ resourceName }}</span>
        <span class="stat-numbers">{{ resourceCurrent }}/{{ resourceMax }}</span>
      </div>
      <div class="bar-container">
        <div class="bar-fill" :class="resourceClass" :style="{ width: resourcePercent + '%' }"></div>
      </div>
    </div>

    <!-- Combo Points (Rogue) -->
    <div v-if="player?.comboPoints" class="combo-points">
      <span>🗡️ 连击点</span>
      <span class="combo-display">{{ comboDisplay }}</span>
      <span class="combo-numbers">{{ player.comboPoints.current || 0 }}/{{ player.comboPoints.max || 5 }}</span>
    </div>

    <!-- Pet Status (Hunter/Warlock) -->
    <div v-if="isPetClass" class="pet-status" :class="{ 'pet-dead': petInfo && !petInfo.isAlive }">
      <div class="stat-label">
        <span>{{ petInfo ? petInfo.emoji : '🐾' }} 宠物</span>
        <span v-if="petInfo" class="stat-numbers">{{ petInfo.isAlive ? `${petInfo.currentHp}/${petInfo.maxHp}` : '已阵亡' }}</span>
        <span v-else class="stat-numbers pet-none">未召唤</span>
      </div>
      <div v-if="petInfo" class="bar-container">
        <div class="bar-fill pet-hp" :style="{ width: petHpPercent + '%' }"></div>
      </div>
      <div v-if="petInfo" class="pet-name">{{ petInfo.displayName || petInfo.name }}</div>
    </div>

    <!-- EXP -->
    <div class="stat-bar-group">
      <div class="stat-label">
        <span>经验值</span>
        <span class="stat-numbers" v-if="isMaxLevel">MAX</span>
        <span class="stat-numbers" v-else>{{ formatNumber(player?.experience || 0) }}/{{ formatNumber(expToNext) }}</span>
      </div>
      <div class="bar-container">
        <div class="bar-fill exp" :style="{ width: expPercent + '%' }"></div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-item" v-for="(label, key) in statLabels" :key="key">
        <span class="stat-name">{{ label }}</span>
        <span class="stat-val">{{ Math.floor(player?.stats?.[key] || 0) }}</span>
      </div>
    </div>

    <!-- Derived Stats -->
    <div class="derived-stats">
      <div class="derived-item">
        <span>攻击力</span>
        <span class="stat-val">{{ attackPower }}</span>
      </div>
      <div class="derived-item">
        <span>护甲</span>
        <span class="stat-val">{{ armor }}</span>
      </div>
      <div class="derived-item">
        <span>暴击</span>
        <span class="stat-val">{{ critChance }}%</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'
import { GameData } from '@/data/GameData.js'
import PixelIcon from '@/components/common/PixelIcon.vue'

const gameStore = useGameStore()

const player = computed(() => gameStore.player)
const className = computed(() => {
  const cls = GameData.classes[player.value?.classId || player.value?.class]
  return cls?.name || ''
})

const classColor = computed(() => {
  const cls = GameData.classes[player.value?.classId || player.value?.class]
  return cls?.color || '#FFD700'
})

const hpPercent = computed(() => {
  if (!player.value) return 0
  return (player.value.currentHp / player.value.maxHp) * 100
})

const resourceType = computed(() => player.value?.resource?.type || 'mana')
const resourceName = computed(() => {
  const names = { mana: '法力', rage: '怒气', energy: '能量' }
  return names[resourceType.value] || '法力'
})
const resourceEmoji = computed(() => {
  const emojis = { mana: '💧', rage: '💢', energy: '⚡' }
  return emojis[resourceType.value] || '💧'
})
const resourceClass = computed(() => resourceType.value)
const resourceCurrent = computed(() => Math.floor(player.value?.resource?.current ?? player.value?.currentMana ?? 0))
const resourceMax = computed(() => player.value?.resource?.max ?? player.value?.maxMana ?? 100)
const resourcePercent = computed(() => {
  if (resourceMax.value === 0) return 0
  return (resourceCurrent.value / resourceMax.value) * 100
})

const comboDisplay = computed(() => {
  if (!player.value?.comboPoints) return ''
  const current = player.value.comboPoints.current || 0
  const max = player.value.comboPoints.max || 5
  return '⭐'.repeat(current) + '☆'.repeat(max - current)
})

// 宠物相关
const PET_CLASSES = ['hunter', 'warlock']
const isPetClass = computed(() => {
  const classId = player.value?.classId || player.value?.class
  return PET_CLASSES.includes(classId)
})

const petInfo = computed(() => {
  const pet = player.value?.activePet
  if (!pet) return null
  return pet
})

const petHpPercent = computed(() => {
  if (!petInfo.value || !petInfo.value.isAlive) return 0
  return (petInfo.value.currentHp / petInfo.value.maxHp) * 100
})

const expToNext = computed(() => {
  const level = player.value?.level || 1
  if (level >= 60) return 0
  return GameData.expTable[level] || 999
})

const isMaxLevel = computed(() => (player.value?.level || 1) >= 60)

const expPercent = computed(() => {
  if (isMaxLevel.value || expToNext.value === 0) return 100
  return ((player.value?.experience || 0) / expToNext.value) * 100
})

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num
}

const statLabels = {
  strength: '💪 力量',
  agility: '🏃 敏捷',
  stamina: '🛡️ 耐力',
  intellect: '🧠 智力',
  spirit: '✨ 精神'
}

const attackPower = computed(() => {
  const stats = player.value?.stats
  if (!stats) return 0
  let ap = Math.max(stats.strength || 0, stats.agility || 0) * 2
  // 加入武器平均伤害
  const equip = player.value?.equipment
  if (equip) {
    const mainHand = equip.mainHand
    if (mainHand?.damage) {
      ap += Math.floor((mainHand.damage.min + mainHand.damage.max) / 2)
    }
    const offHand = equip.offHand
    if (offHand?.damage && offHand.category === 'weapon') {
      ap += Math.floor((offHand.damage.min + offHand.damage.max) / 2 * 0.5)
    }
  }
  return parseFloat(ap.toFixed(1))
})

const armor = computed(() => {
  return Math.floor((player.value?.stats?.stamina || 0) * 2 + (player.value?.stats?.agility || 0))
})

const critChance = computed(() => {
  const agi = player.value?.stats?.agility || 0
  return (agi * 0.05 + 5).toFixed(1)
})
</script>

<style scoped>
.character-panel {
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.char-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-primary);
}

.avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-primary));
  border: 2px solid var(--primary-gold);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.char-name {
  font-size: var(--fs-xs);
  font-weight: bold;
}

.char-class {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}

.stat-bar-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-xs);
  color: var(--text-primary);
}

.stat-numbers {
  color: var(--accent-gold);
}

.combo-points {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-xs);
  color: var(--text-primary);
}

.combo-display {
  color: var(--primary-gold);
  font-size: var(--fs-xs);
}

.combo-numbers {
  color: var(--accent-gold);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 10px 0;
  border-top: 1px solid var(--border-primary);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-xs);
  padding: 2px 0;
}

.stat-name {
  color: var(--text-primary);
}

.stat-val {
  color: var(--accent-gold);
  font-weight: bold;
}

.derived-stats {
  padding-top: 10px;
  border-top: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.derived-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-xs);
  color: var(--text-primary);
}

/* Pet Status */
.pet-status {
  padding: 8px 10px;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  background: rgba(74, 138, 90, 0.1);
}

.pet-status.pet-dead {
  background: rgba(255, 0, 0, 0.06);
  opacity: 0.6;
}

.pet-status .bar-container {
  margin-top: 4px;
}

.bar-fill.pet-hp {
  background: linear-gradient(90deg, #2E7D32, var(--color-friendly));
}

.pet-dead .bar-fill.pet-hp {
  background: var(--text-muted);
}

.pet-name {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  margin-top: 4px;
}

.pet-none {
  color: var(--text-muted);
}
</style>
