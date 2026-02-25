<template>
  <div class="target-confirm-overlay" @click.self="$emit('cancel')">
    <div class="target-confirm-panel">
      <div class="target-confirm-header">
        <h3>🎯 确认行动</h3>
      </div>
      <div class="target-confirm-content">
        <div class="target-confirm-action">
          使用 <span class="action-name">{{ action.actionName }}</span>
        </div>
        <div class="target-confirm-target">
          <span class="target-emoji">
            <PixelIcon v-if="action.target?.icon" :src="action.target.icon" :size="32" :fallback="action.target?.emoji || '👹'" />
            <span v-else>{{ action.target?.emoji || '👹' }}</span>
          </span>
          <div class="target-info">
            <div class="target-name">{{ action.target?.name || '未知目标' }}</div>
            <div class="target-hp">HP: {{ action.target?.currentHp || 0 }}/{{ action.target?.maxHp || 0 }}</div>
          </div>
        </div>
        <div class="target-confirm-damage-preview">
          {{ damagePreview }}
        </div>
        <div v-if="splashTargetNames.length > 0" class="target-confirm-splash">
          🔥 波及: {{ splashTargetNames.join('、') }}
        </div>
        <div class="target-confirm-buttons">
          <button class="pixel-btn confirm" @click="$emit('confirm', action)">
            ✔️ 确认
          </button>
          <button class="pixel-btn cancel" @click="$emit('cancel')">
            ✖️ 取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'
import { GameData } from '@/data/GameData.js'
import { PositioningSystem } from '@/systems/PositioningSystem.js'
import PixelIcon from '@/components/common/PixelIcon.vue'

const props = defineProps({
  action: {
    type: Object,
    required: true
  }
})

defineEmits(['confirm', 'cancel'])

const gameStore = useGameStore()

const damagePreview = computed(() => {
  const dungeonSystem = gameStore.dungeonCombatSystem
  const attacker = dungeonSystem?.currentActingUnit

  if (props.action.type === 'attack') {
    const damage = attacker?.stats?.strength || attacker?.stats?.agility || 20
    return `预计伤害: ~${damage}`
  }

  if (props.action.type === 'skill' && props.action.skillId) {
    const skill = GameData.skills[props.action.skillId]
    if (skill?.damage) {
      const statValue = attacker?.stats?.[skill.damage.stat] || 10
      const damage = Math.floor(skill.damage.base + (statValue * skill.damage.scaling))
      return `预计伤害: ~${damage}`
    }
    if (skill?.heal) {
      const statValue = attacker?.stats?.[skill.heal.stat] || 10
      const healAmount = Math.floor(skill.heal.base + (statValue * skill.heal.scaling))
      return `预计治疗: ~${healAmount}`
    }
    return '效果类技能'
  }

  return ''
})

const splashTargetNames = computed(() => {
  if (props.action.type !== 'skill' || !props.action.skillId || !props.action.targetId) return []
  const skill = GameData.skills[props.action.skillId]
  if (!skill || skill.targetType !== 'cleave_3') return []
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (!dungeonSystem?.battlefield) return []
  const { splash } = PositioningSystem.getAdjacentTargets(dungeonSystem.battlefield, 'enemy', props.action.targetId)
  return splash.map(u => u.name)
})
</script>

<style scoped>
.target-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2500;
  display: flex;
  justify-content: center;
  align-items: center;
}

.target-confirm-panel {
  width: 350px;
  max-width: 90vw;
  background: linear-gradient(145deg, var(--bg-secondary), var(--bg-primary));
  border: 3px solid var(--primary-gold);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8), 0 0 20px var(--primary-gold);
  animation: popIn 0.2s ease-out;
}

@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.target-confirm-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 15px;
  background: linear-gradient(90deg, var(--secondary-gold), var(--primary-gold));
  border-bottom: 2px solid var(--dark-gold);
}

.target-confirm-header h3 {
  font-size: var(--fs-xs);
  color: var(--bg-primary);
  margin: 0;
}

.target-confirm-content {
  padding: 20px;
  text-align: center;
}

.target-confirm-action {
  font-size: var(--fs-xs);
  color: var(--accent-gold);
  margin-bottom: 10px;
}

.target-confirm-action .action-name {
  color: var(--primary-gold);
  font-weight: bold;
}

.target-confirm-target {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: linear-gradient(145deg, var(--bg-tertiary), var(--bg-secondary));
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  margin-bottom: 15px;
}

.target-confirm-target .target-emoji {
  font-size: 32px;
}

.target-confirm-target .target-info {
  text-align: left;
}

.target-confirm-target .target-name {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  font-weight: bold;
}

.target-confirm-target .target-hp {
  font-size: var(--fs-xs);
  color: var(--color-friendly);
}

.target-confirm-damage-preview {
  font-size: var(--fs-xs);
  color: var(--color-debuff);
  margin-bottom: 15px;
  padding: 8px;
  background: rgba(248, 113, 113, 0.1); /* --color-debuff */
  border: 1px solid rgba(248, 113, 113, 0.3); /* --color-debuff */
  border-radius: 4px;
}

.target-confirm-splash {
  font-size: var(--fs-xs);
  color: var(--class-druid); /* 橙色 */
  margin-bottom: 15px;
  padding: 8px;
  background: rgba(255, 125, 10, 0.1); /* --class-druid */
  border: 1px solid rgba(255, 125, 10, 0.3); /* --class-druid */
  border-radius: 4px;
}

.target-confirm-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.target-confirm-buttons .pixel-btn {
  flex: 1;
  max-width: 120px;
}

.target-confirm-buttons .pixel-btn.confirm {
  background: linear-gradient(145deg, var(--bg-tertiary), var(--bg-surface));
}

.target-confirm-buttons .pixel-btn.cancel {
  background: linear-gradient(145deg, var(--bg-tertiary), var(--bg-secondary));
}
</style>
