<template>
  <div class="combat-view">
    <!-- 战斗信息栏 -->
    <div class="combat-info-bar">
      <span class="turn-info">⚔️ 第 {{ turnCount }} 回合</span>
      <span class="turn-indicator" :class="{ 'player-turn': isPlayerTurn, 'enemy-turn': !isPlayerTurn }">
        {{ isPlayerTurn ? '🟢 你的回合' : '🔴 敌人回合' }}
      </span>
    </div>

    <!-- 战斗区域 -->
    <div class="combat-arena">
      <!-- 玩家侧 -->
      <div class="player-side">
        <!-- 玩家 -->
        <CombatantCard
          :unit="playerUnit"
          size="normal"
          side="player"
          :floats="combatFloats.getFloatingNumbers('player')"
          :shaking="combatFloats.isShaking('player')"
          :showPlaceholder="!gameStore.player?.resource && !!enemy?.resource"
        />
        <!-- 宠物附属小卡片 -->
        <div v-if="activePet" class="pet-card" :class="{ 'pet-dead': !activePet.isAlive }">
          <div class="pet-header">
            <span class="pet-emoji">{{ activePet.emoji }}</span>
            <span class="pet-name">{{ activePet.displayName }}</span>
          </div>
          <div class="pet-hp-bar">
            <div class="pet-hp-fill" :style="{ width: petHpPercent + '%' }"></div>
          </div>
          <div class="pet-hp-text">{{ activePet.currentHp }}/{{ activePet.maxHp }}</div>
        </div>
      </div>

      <div class="vs-indicator">VS</div>

      <!-- 敌人 -->
      <CombatantCard
        v-if="enemy"
        :unit="enemy"
        size="normal"
        side="enemy"
        :floats="combatFloats.getFloatingNumbers('enemy')"
        :shaking="combatFloats.isShaking('enemy')"
        :showPlaceholder="!enemy?.resource && !!gameStore.player?.resource"
      />
    </div>

    <!-- 技能面板 -->
    <SkillPanel
      v-if="hasSkills"
      mode="inline"
      :disabled="!isPlayerTurn || isAutoBattle"
      @use-skill="useSkill"
    />

    <!-- 基础操作 -->
    <div class="combat-actions">
      <button class="pixel-btn action-btn" @click="attack" :disabled="!isPlayerTurn || isAutoBattle">
        <span class="btn-icon">⚔️</span>
        <span>攻击</span>
      </button>
      <button class="pixel-btn action-btn" @click="defend" :disabled="!isPlayerTurn || isAutoBattle">
        <span class="btn-icon">🛡️</span>
        <span>防御</span>
      </button>
      <button class="pixel-btn action-btn" @click="flee" :disabled="!isPlayerTurn || isAutoBattle">
        <span class="btn-icon">🏃</span>
        <span>逃跑</span>
      </button>
      <button
        class="pixel-btn action-btn"
        :class="{ 'auto-active': isAutoBattle }"
        @click="toggleAutoBattle"
      >
        <span class="btn-icon">{{ isAutoBattle ? '⏹️' : '🤖' }}</span>
        <span>{{ isAutoBattle ? '停止' : '自动' }}</span>
      </button>
    </div>

    <!-- 召唤选择面板 -->
    <SummonPanel
      :visible="showSummonPanel"
      :title="summonPanelTitle"
      :summons="summonPanelList"
      @select="onSummonSelect"
      @close="closeSummonPanel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'
import SkillPanel from '@/components/common/SkillPanel.vue'
import CombatantCard from '@/components/common/CombatantCard.vue'
import SummonPanel from '@/components/modals/SummonPanel.vue'
import { useCombatFloats } from '@/composables/useCombatFloats.js'
import { GameData } from '@/data/GameData.js'

const gameStore = useGameStore()
const combatFloats = useCombatFloats()

const enemy = ref(null)
const turnCount = ref(1)
const isPlayerTurn = ref(true)
const activePet = ref(null)

// 召唤面板
const showSummonPanel = ref(false)
const summonPanelTitle = ref('选择召唤物')
const summonPanelList = ref([])
let summonCallback = null

function onSummonSelect(selectedId) {
  showSummonPanel.value = false
  if (summonCallback) {
    summonCallback(selectedId)
    summonCallback = null
  }
}

function closeSummonPanel() {
  showSummonPanel.value = false
  summonCallback = null
}

// 宠物血量百分比
const petHpPercent = computed(() => {
  if (!activePet.value || !activePet.value.maxHp) return 0
  return Math.max(0, Math.round((activePet.value.currentHp / activePet.value.maxHp) * 100))
})

// ==================== 自动战斗 ====================
const isAutoBattle = ref(false)
let autoBattleTimer = null

function toggleAutoBattle() {
  isAutoBattle.value = !isAutoBattle.value
  if (isAutoBattle.value) {
    gameStore.addLog('🤖 开启自动战斗', 'system')
    const combat = gameStore.stateManager?.get('combat')
    if (combat && combat.turn === 'player') {
      scheduleAutoBattleAction()
    }
  } else {
    gameStore.addLog('⏹️ 关闭自动战斗', 'system')
    // 同时关闭自动探索的自动战斗标记，防止战斗结束后继续自动探索循环
    gameStore.autoBattleEnabled = false
    if (autoBattleTimer) {
      clearTimeout(autoBattleTimer)
      autoBattleTimer = null
    }
  }
}

function scheduleAutoBattleAction() {
  if (!isAutoBattle.value) return
  if (autoBattleTimer) {
    clearTimeout(autoBattleTimer)
  }
  autoBattleTimer = setTimeout(() => doAutoBattleAction(), 600)
}

function doAutoBattleAction() {
  if (!isAutoBattle.value) return

  const combat = gameStore.stateManager?.get('combat')
  if (!combat || !combat.inCombat || combat.turn !== 'player') return

  const player = gameStore.stateManager?.get('player')
  if (!player) return

  try {
    const decision = pickPlayerAction(player)

    if (decision.type === 'skill') {
      isPlayerTurn.value = false
      gameStore.eventBus?.emit('combat:playerAction', { type: 'skill', skillId: decision.skillId })
    } else {
      isPlayerTurn.value = false
      gameStore.eventBus?.emit('combat:playerAction', { type: 'attack' })
    }
  } catch (e) {
    console.error('[AutoBattle] error:', e)
  }
}

/**
 * 为玩家自动选择最优行动
 * 优先级：可用技能（按伤害/效用排序）> 普通攻击
 */
function pickPlayerAction(player) {
  const skills = player.skills || []
  const cooldowns = player.skillCooldowns || {}
  const resource = player.resource
  const comboPoints = player.comboPoints

  // 筛选可用技能
  const usableSkills = []
  const playerLevel = player.level || 1
  for (const skillId of skills) {
    const skill = GameData.skills[skillId]
    if (!skill) continue
    if (skill.skillType === 'passive') continue

    // 等级解锁检查
    if (skill.unlockLevel && playerLevel < skill.unlockLevel) continue

    // 冷却检查
    if (cooldowns[skillId] && cooldowns[skillId] > 0) continue

    // 资源检查（resourceCost 可能是对象 {type, value} 或数字）
    if (skill.resourceCost && resource) {
      const cost = typeof skill.resourceCost === 'object' ? skill.resourceCost.value : skill.resourceCost
      if (cost && resource.current < cost) continue
    }

    // 连击点检查（终结技需要连击点）
    if (skill.comboPointType === 'finisher') {
      if (!comboPoints || comboPoints.current < 1) continue
    }

    usableSkills.push({ skillId, skill })
  }

  if (usableSkills.length === 0) {
    return { type: 'attack' }
  }

  // 低血量时优先治疗
  const hpPercent = player.maxHp > 0 ? player.currentHp / player.maxHp : 1
  if (hpPercent < 0.4) {
    const healSkill = usableSkills.find(s =>
      s.skill.targetType === 'self' && (s.skill.healing || s.skill.healPercent)
    )
    if (healSkill) return { type: 'skill', skillId: healSkill.skillId }
  }

  // 没有宠物时优先召唤
  if (!activePet.value || !activePet.value.isAlive) {
    const summonSkill = usableSkills.find(s => s.skill.skillType === 'summon')
    if (summonSkill) return { type: 'skill', skillId: summonSkill.skillId }
  }

  // 有连击点>=4时优先终结技
  if (comboPoints && comboPoints.current >= 4) {
    const finisher = usableSkills.find(s => s.skill.comboPointType === 'finisher')
    if (finisher) return { type: 'skill', skillId: finisher.skillId }
  }

  // 优先 builder 技能（积累连击点）
  if (comboPoints && comboPoints.current < comboPoints.max) {
    const builder = usableSkills.find(s => s.skill.comboPointType === 'builder')
    if (builder) return { type: 'skill', skillId: builder.skillId }
  }

  // 优先高伤害技能
  const damageSkills = usableSkills.filter(s =>
    (s.skill.damage || s.skill.targetType === 'enemy') && s.skill.skillType !== 'summon'
  )
  if (damageSkills.length > 0) {
    // 选伤害最高的（安全处理 damage 为 null 的情况）
    damageSkills.sort((a, b) => {
      const getDmg = (s) => {
        if (!s.skill.damage) return 0
        if (typeof s.skill.damage === 'object') return s.skill.damage.base || 0
        return s.skill.damage || 0
      }
      return getDmg(b) - getDmg(a)
    })
    return { type: 'skill', skillId: damageSkills[0].skillId }
  }

  // 其他可用技能
  if (usableSkills.length > 0) {
    return { type: 'skill', skillId: usableSkills[0].skillId }
  }

  return { type: 'attack' }
}

// Wrap player as a reactive unit for CombatantCard
const playerUnit = computed(() => {
  const p = gameStore.player
  if (!p) return { name: '玩家', icon: '', emoji: '🐔', currentHp: 0, maxHp: 1 }
  return p
})

// 从 combat state 同步敌人数据
function syncCombatState() {
  const combat = gameStore.stateManager?.get('combat')
  if (combat) {
    enemy.value = combat.enemy ? { ...combat.enemy } : null
    turnCount.value = combat.turnCount || 1
    isPlayerTurn.value = combat.turn === 'player'
    activePet.value = combat.pet ? { ...combat.pet } : null
  }
}

// 玩家是否有技能
const hasSkills = computed(() => {
  return (gameStore.player?.skills || []).length > 0
})

// 监听战斗事件
let listeners = []
onMounted(() => {
  syncCombatState()

  // 挂载时立即检查：如果自动探索开启了自动战斗标记，直接进入自动战斗
  if (gameStore.autoBattleEnabled && !isAutoBattle.value) {
    isAutoBattle.value = true
    scheduleAutoBattleAction()
  }

  const eventBus = gameStore.eventBus
  if (!eventBus) return

  const onStarted = () => {
    syncCombatState()
    // 如果自动探索开启了自动战斗标记，自动启用
    if (gameStore.autoBattleEnabled && !isAutoBattle.value) {
      isAutoBattle.value = true
    }
    // 自动战斗：战斗开始时触发（新战斗默认 player 先手）
    if (isAutoBattle.value) {
      scheduleAutoBattleAction()
    }
  }

  const onTurnChange = (data) => {
    isPlayerTurn.value = data.turn === 'player'
    turnCount.value = data.turnCount || turnCount.value
    syncCombatState()
    // 自动战斗：玩家回合自动行动
    if (data.turn === 'player' && isAutoBattle.value) {
      scheduleAutoBattleAction()
    }
  }

  const onPlayerAttack = (data) => {
    combatFloats.spawnFloatingNumber('enemy', data.damage, data.isCrit, false, data.skillName || '普通攻击')
    syncCombatState()
  }

  const onSkillUsed = (data) => {
    if (data.damage > 0) {
      combatFloats.spawnFloatingNumber('enemy', data.damage, data.isCrit, false, data.skillName || data.skill?.name)
    }
    syncCombatState()
  }

  const onEnemyAttack = (data) => {
    if (data.target === 'pet') {
      combatFloats.spawnFloatingNumber('pet', data.damage, data.isCrit)
    } else {
      combatFloats.spawnFloatingNumber('player', data.damage, data.isCrit)
    }
    syncCombatState()
  }

  const onPetAttack = () => {
    syncCombatState()
  }

  const onUpdate = () => syncCombatState()

  eventBus.on('combat:started', onStarted)
  eventBus.on('combat:turnChange', onTurnChange)
  eventBus.on('combat:playerAttack', onPlayerAttack)
  eventBus.on('combat:skillUsed', onSkillUsed)
  eventBus.on('combat:enemyAttack', onEnemyAttack)
  eventBus.on('combat:petAttack', onPetAttack)
  eventBus.on('combat:petSummoned', onPetAttack)
  eventBus.on('combat:petDied', onPetAttack)
  eventBus.on('state:change', onUpdate)

  const onShowSummonPanel = (data) => {
    const player = gameStore.stateManager?.get('player')
    const classId = player?.class || player?.classId
    summonPanelTitle.value = classId === 'warlock' ? '选择恶魔' : '选择野兽'
    summonPanelList.value = data.summons || []
    summonCallback = data.callback || null
    showSummonPanel.value = true
  }
  eventBus.on('combat:showSummonPanel', onShowSummonPanel)

  listeners = [
    ['combat:started', onStarted],
    ['combat:turnChange', onTurnChange],
    ['combat:playerAttack', onPlayerAttack],
    ['combat:skillUsed', onSkillUsed],
    ['combat:enemyAttack', onEnemyAttack],
    ['combat:petAttack', onPetAttack],
    ['combat:petSummoned', onPetAttack],
    ['combat:petDied', onPetAttack],
    ['state:change', onUpdate],
    ['combat:showSummonPanel', onShowSummonPanel],
  ]

  // 键盘快捷键
  const onShortcutAttack = () => { if (!isAutoBattle.value) attack() }
  const onShortcutDefend = () => { if (!isAutoBattle.value) defend() }
  const onShortcutFlee = () => { if (!isAutoBattle.value) flee() }
  const onShortcutAuto = () => toggleAutoBattle()
  const onShortcutSkill = ({ index }) => {
    if (isAutoBattle.value) return
    const skills = gameStore.player?.skills || []
    if (index < skills.length) useSkill(skills[index])
  }
  eventBus.on('shortcut:attack', onShortcutAttack)
  eventBus.on('shortcut:defend', onShortcutDefend)
  eventBus.on('shortcut:flee', onShortcutFlee)
  eventBus.on('shortcut:autoBattle', onShortcutAuto)
  eventBus.on('shortcut:useSkill', onShortcutSkill)
  listeners.push(
    ['shortcut:attack', onShortcutAttack],
    ['shortcut:defend', onShortcutDefend],
    ['shortcut:flee', onShortcutFlee],
    ['shortcut:autoBattle', onShortcutAuto],
    ['shortcut:useSkill', onShortcutSkill],
  )
})

onUnmounted(() => {
  const eventBus = gameStore.eventBus
  if (eventBus) {
    listeners.forEach(([event, fn]) => eventBus.off(event, fn))
  }
  combatFloats.cleanup()
  if (autoBattleTimer) {
    clearTimeout(autoBattleTimer)
    autoBattleTimer = null
  }
})

// 操作
function attack() {
  if (!isPlayerTurn.value) return
  isPlayerTurn.value = false
  gameStore.eventBus?.emit('combat:playerAction', { type: 'attack' })
}

function useSkill(skillId) {
  if (!isPlayerTurn.value) return
  isPlayerTurn.value = false
  gameStore.eventBus?.emit('combat:playerAction', { type: 'skill', skillId })
}

function defend() {
  if (!isPlayerTurn.value) return
  isPlayerTurn.value = false
  gameStore.eventBus?.emit('combat:playerAction', { type: 'defend' })
}

function flee() {
  if (!isPlayerTurn.value) return
  isPlayerTurn.value = false
  gameStore.eventBus?.emit('combat:flee')
}
</script>

<style scoped>
.combat-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.combat-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  font-size: var(--fs-xs);
}

.turn-info {
  color: var(--text-primary);
}

.turn-indicator {
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 3px;
}
.player-turn { color: var(--color-buff); }
.enemy-turn { color: var(--color-debuff); }

.combat-arena {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 30px;
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  min-height: 210px;
}

.player-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.vs-indicator {
  font-size: var(--fs-md);
  color: var(--color-hostile);
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.5); /* --color-damage */
  align-self: center;
  padding-top: 20px;
}

/* ===== 宠物附属小卡片 ===== */
.pet-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  background: linear-gradient(180deg, var(--bg-tertiary), var(--bg-primary));
  border: 1px solid var(--class-warlock);
  border-radius: 4px;
  min-width: 90px;
  animation: petAppear 0.4s ease-out;
}

.pet-card.pet-dead {
  opacity: 0.35;
  filter: grayscale(0.8);
  border-color: var(--border-primary);
}

.pet-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pet-emoji {
  font-size: var(--fs-xs);
}

.pet-name {
  font-size: var(--fs-xs);
  color: var(--class-warlock);
  font-weight: bold;
}

.pet-hp-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-primary);
  border-radius: 2px;
  overflow: hidden;
}

.pet-hp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-buff), var(--color-heal));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.pet-hp-text {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}

@keyframes petAppear {
  0% { opacity: 0; transform: translateY(10px) scale(0.8); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* ===== 基础操作 ===== */
.combat-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  min-width: 80px;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 自动战斗 */
.auto-active {
  border-color: var(--color-buff) !important;
  background: rgba(74, 222, 128, 0.15) !important; /* --color-buff */
  color: var(--color-buff) !important;
  animation: autoPulse 1.5s ease-in-out infinite;
}

@keyframes autoPulse {
  0%, 100% { box-shadow: 0 0 4px rgba(74, 222, 128, 0.2); /* --color-buff */ }
  50% { box-shadow: 0 0 12px rgba(74, 222, 128, 0.5); /* --color-buff */ }
}
</style>
