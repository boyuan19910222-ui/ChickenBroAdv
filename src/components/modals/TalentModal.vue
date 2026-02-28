<template>
  <div class="modal-overlay show" @click.self="$emit('close')">
    <div class="modal-content pixel-panel talent-modal">
      <div class="modal-header">
        <div class="modal-title">⭐ 天赋</div>
        <div class="talent-points-info">
          <span class="points-available" :class="{ 'has-points': availablePoints > 0 }">
            可用点数: {{ availablePoints }}
          </span>
          <span class="points-total">
            ({{ usedPoints }}/{{ totalPoints }})
          </span>
        </div>
      </div>

      <!-- 等级不足提示 -->
      <div v-if="!hasAccess" class="talent-locked">
        <div class="lock-icon">🔒</div>
        <div class="lock-text">天赋系统在10级解锁</div>
        <div class="lock-sub">当前等级: {{ player?.level || 1 }}</div>
      </div>

      <!-- 天赋树选择器 -->
      <div v-else class="talent-content">
        <div class="tree-tabs">
          <button
            v-for="(tree, treeKey) in classTrees"
            :key="treeKey"
            class="tree-tab"
            :class="{ active: activeTree === treeKey }"
            @click="activeTree = treeKey"
          >
            <span class="tree-icon">{{ tree.icon }}</span>
            <span class="tree-name">{{ tree.name }}</span>
            <span class="tree-points">({{ getPointsInTree(treeKey) }})</span>
          </button>
        </div>

        <!-- 天赋树描述 -->
        <div v-if="currentTree" class="tree-description">
          {{ currentTree.description }}
        </div>

        <!-- 天赋图标网格（WoW风格） -->
        <div v-if="currentTree" class="talent-tree">
          <div
            v-for="tier in tierGroups"
            :key="tier.tier"
            class="talent-tier"
          >
            <div class="tier-label">第{{ tier.tier }}层</div>
            <div class="tier-icons">
              <div
                v-for="talent in tier.talents"
                :key="talent.id"
                class="talent-icon-wrapper"
                :class="{
                  maxed: getTalentPoints(talent.id) >= talent.maxPoints,
                  available: canAllocate(talent.id),
                  locked: !isTierUnlocked(tier.tier),
                  partial: getTalentPoints(talent.id) > 0 && getTalentPoints(talent.id) < talent.maxPoints,
                }"
                @click="allocate(talent.id)"
                @contextmenu.prevent="deallocate(talent.id)"
                @mouseenter="onTalentHover(talent, $event)"
                @mouseleave="onTalentLeave"
              >
                <div class="talent-icon-box">
                  <span class="talent-emoji">{{ getTalentIcon(talent) }}</span>
                </div>
                <span class="talent-point-badge">{{ getTalentPoints(talent.id) }}/{{ talent.maxPoints }}</span>
                <span v-if="talent.requires" class="talent-arrow">↑</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="talent-actions">
          <button
            class="pixel-btn btn-reset-tree"
            @click="resetCurrentTree"
            :disabled="getPointsInTree(activeTree) === 0"
          >
            重置当前天赋树
          </button>
          <button
            class="pixel-btn btn-reset-all"
            @click="resetAll"
            :disabled="usedPoints === 0"
          >
            重置全部 ({{ resetCost }}G)
          </button>
        </div>
      </div>

      <div class="modal-buttons">
        <button class="pixel-btn" @click="$emit('close')">关闭</button>
      </div>
    </div>

    <!-- 天赋悬浮 Tooltip -->
    <Teleport to="body">
      <div
        v-if="talentTooltip.visible"
        class="talent-tooltip"
        :style="{ left: talentTooltip.x + 'px', top: talentTooltip.y + 'px' }"
      >
        <div class="tt-header">
          <span class="tt-icon">{{ getTalentIcon(talentTooltip.talent) }}</span>
          <span class="tt-name" :class="talentTooltipNameClass">{{ talentTooltip.talent?.name }}</span>
          <span class="tt-rank">{{ getTalentPoints(talentTooltip.talent?.id) }}/{{ talentTooltip.talent?.maxPoints }}</span>
        </div>
        <div class="tt-tier">第{{ talentTooltip.talent?.tier }}层天赋 (需投入{{ (talentTooltip.talent?.tier - 1) * 5 }}点)</div>
        <div class="tt-desc">{{ formatDescription(talentTooltip.talent) }}</div>
        <div v-if="talentTooltip.talent?.requires" class="tt-req">
          需要: {{ getRequiredTalentName(talentTooltip.talent.requires) }}
        </div>
        <div class="tt-hint">
          <span v-if="canAllocate(talentTooltip.talent?.id)" class="tt-hint-add">左键点击学习</span>
          <span v-else-if="getTalentPoints(talentTooltip.talent?.id) >= talentTooltip.talent?.maxPoints" class="tt-hint-max">已满级</span>
          <span v-else class="tt-hint-locked">不可学习</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'
import { TalentData } from '@/data/TalentData.js'

const emit = defineEmits(['close'])
const gameStore = useGameStore()
const player = computed(() => gameStore.player)

const activeTree = ref(null)

// 天赋图标映射（根据效果类型 + 天赋ID）
const TALENT_ICONS = {
  // 通用效果类型映射
  stat: '📊', unlock_skill: '⚡', skill_enhance: '🔧',
  crit_bonus: '💥', dot_enhance: '🩸', resource_bonus: '🔋',
  resource_gen: '⚡', dual_wield: '⚔️', buff_enhance: '📯',
  on_crit: '💢', on_hit: '🔄', heal_enhance: '💚',
  mana_refund: '💎', mana_reduce: '💧', pet_stat: '🐾',
  damage_with_pet: '🐺', aura_enhance: '🌀', cooldown_reduce: '⏱️',
  threat: '😤', pushback_resist: '🧘',
  // 特定天赋ID映射（优先级更高）
  twoHandSpec: '🗡️', improvedHeroicStrike: '⚔️', improvedRend: '🩸',
  cleave: '🌪️', mightyChop: '💪', impale: '🗡️',
  deepWounds: '💉', improvedCleave: '🌊', heroicLeap: '🦅',
  mortalStrike: '💀', cruelty: '😈', unbridledWrath: '🔥',
  dualWieldSpec: '⚔️', improvedBattleShout: '📯', enrage: '😡',
  bloodCraze: '🩸', execute: '⚰️', battleResilience: '🛡️',
  bloodthirst: '🧛', shieldSpec: '🛡️', anticipation: '👁️',
  shieldBlock: '🛡️', toughness: '💪', taunt: '😤',
  revenge: '⚡', toughAsNails: '🔩', lastStand: '🦁',
  shieldWall: '🏰', divineIntellect: '📖',
  healingLight: '💛', spiritualFocus: '🧘', sealOfLightTalent: '🌅',
  illumination: '🌟', blessingOfProtectionTalent: '🛡️',
  holyPower: '✨', holyShockTalent: '⚡', layOnHandsTalent: '🤲',
  redoubt: '🛡️', toughness: '💪',
  improvedRighteousFury: '😤', hammerOfJusticeTalent: '🔨',
  consecrationTalent: '☀️', holyResilience: '🛡️',
  unbreakable: '🔩', divineShieldTalent: '🌈', holyWrathTalent: '💢',
  benediction: '🙏',
  conviction: '🔥', improvedJudgement: '⚖️', sealOfCommandTalent: '🗡️',
  vengeance: '💢', holyWrit: '⚡',
  twoHandSpecialization: '⚔️', crusaderAuraTalent: '⚔️', hammerOfWrathTalent: '🔱',
  improvedAspectOfTheHawk: '🦅', enduranceTraining: '💪',
  focusedFire: '🎯', unleashFury: '🐾', ferocity: '🐯',
  animalHandler: '🐾', ferociousInspiration: '🔥',
  killCommandTalent: '🐾', beastMasteryTalent: '🦁', intimidationTalent: '😱',
  lethalShots: '💀',
  efficiency: '💎', improvedHuntersMark: '🎯', aimedShotTalent: '🎯',
  mortalShots: '🏹', carefulAim: '👁️',
  rangedWeaponSpec: '🏹', multiShotTalent: '🎆', trueshotAuraTalent: '📯',
  deflection: '🛡️', survivalist: '💪',
  trapMastery: '💣', explosiveTrapTalent: '💥',
  savageStrikes: '⚔️', surefooted: '🦶',
  killerInstinct: '🔪', wyvernStingTalent: '🐉', mongooseBiteTalent: '🦡',
}

function getTalentIcon(talent) {
  if (!talent) return '❓'
  return TALENT_ICONS[talent.id] || TALENT_ICONS[talent.effect?.type] || '⭐'
}

// Tooltip 状态
const talentTooltip = reactive({
  visible: false,
  talent: null,
  x: 0,
  y: 0,
})

function onTalentHover(talent, event) {
  const rect = event.target.closest('.talent-icon-wrapper').getBoundingClientRect()
  talentTooltip.talent = talent
  talentTooltip.x = rect.right + 8
  talentTooltip.y = rect.top

  // 防止超出右侧屏幕
  if (talentTooltip.x + 260 > window.innerWidth) {
    talentTooltip.x = rect.left - 268
  }
  // 防止超出底部
  if (talentTooltip.y + 200 > window.innerHeight) {
    talentTooltip.y = window.innerHeight - 210
  }
  talentTooltip.visible = true
}

function onTalentLeave() {
  talentTooltip.visible = false
}

const talentTooltipNameClass = computed(() => {
  if (!talentTooltip.talent) return ''
  const pts = getTalentPoints(talentTooltip.talent.id)
  if (pts >= talentTooltip.talent.maxPoints) return 'tt-name-maxed'
  if (pts > 0) return 'tt-name-partial'
  return ''
})

// 基础计算
const hasAccess = computed(() => (player.value?.level || 1) >= 10)
const classId = computed(() => player.value?.class || '')
const classTrees = computed(() => TalentData[classId.value] || {})

// 初始化激活的天赋树
if (!activeTree.value) {
  const trees = Object.keys(classTrees.value)
  if (trees.length > 0) activeTree.value = trees[0]
}

const currentTree = computed(() => classTrees.value[activeTree.value] || null)

const totalPoints = computed(() => {
  return gameStore.talentSystem?.calculateTotalTalentPoints(player.value) || 0
})

const usedPoints = computed(() => {
  return gameStore.talentSystem?.getUsedTalentPoints(player.value) || 0
})

const availablePoints = computed(() => {
  return gameStore.talentSystem?.getAvailableTalentPoints(player.value) || 0
})

// 重置费用（每次重置费用递增）
const resetCost = computed(() => {
  const base = 10
  const resets = player.value?.talentResets || 0
  return base * Math.pow(2, Math.min(resets, 5))
})

// 天赋按层级分组
const tierGroups = computed(() => {
  if (!currentTree.value?.talents) return []
  const groups = {}
  for (const talent of currentTree.value.talents) {
    if (!groups[talent.tier]) groups[talent.tier] = { tier: talent.tier, talents: [] }
    groups[talent.tier].talents.push(talent)
  }
  return Object.values(groups).sort((a, b) => a.tier - b.tier)
})

function getPointsInTree(treeKey) {
  return gameStore.talentSystem?.getPointsInTree(player.value, treeKey) || 0
}

function getTalentPoints(talentId) {
  return gameStore.talentSystem?.getTalentPoints(player.value, activeTree.value, talentId) || 0
}

function isTierUnlocked(tier) {
  const pointsInTree = getPointsInTree(activeTree.value)
  return pointsInTree >= (tier - 1) * 5
}

function canAllocate(talentId) {
  if (!gameStore.talentSystem) return false
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!enginePlayer) return false
  const result = gameStore.talentSystem.canAllocateTalent(enginePlayer, classId.value, activeTree.value, talentId)
  return result.valid
}

function allocate(talentId) {
  if (!gameStore.talentSystem) return
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!enginePlayer) return

  const result = gameStore.talentSystem.allocateTalent(enginePlayer, classId.value, activeTree.value, talentId)
  if (result.success) {
    gameStore.characterSystem?.recalculateStats(enginePlayer)
    gameStore.syncFromEngine()
    gameStore.saveGame()  // 立即保存天赋
  } else {
    gameStore.addLog(`❌ ${result.reason}`, 'system')
  }
}

function deallocate(talentId) {
  // 右键点击暂不支持单点回退，提示用户使用重置
}

function resetCurrentTree() {
  if (!gameStore.talentSystem) return
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!enginePlayer) return

  const result = gameStore.talentSystem.resetTree(enginePlayer, activeTree.value)
  if (result.success) {
    gameStore.characterSystem?.recalculateStats(enginePlayer)
    gameStore.syncFromEngine()
    gameStore.saveGame()  // 立即保存天赋
    gameStore.addLog(`⭐ 已重置天赋树，返还 ${result.refundedPoints} 点`, 'system')
  }
}

function resetAll() {
  if (!gameStore.talentSystem) return
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!enginePlayer) return

  const cost = resetCost.value
  if (enginePlayer.gold < cost) {
    gameStore.addLog(`❌ 金币不足（需要 ${cost}G）`, 'system')
    return
  }

  enginePlayer.gold -= cost
  enginePlayer.talentResets = (enginePlayer.talentResets || 0) + 1

  const result = gameStore.talentSystem.resetAllTalents(enginePlayer)
  if (result.success) {
    gameStore.characterSystem?.recalculateStats(enginePlayer)
    gameStore.syncFromEngine()
    gameStore.saveGame()  // 立即保存天赋
    gameStore.addLog(`⭐ 已重置全部天赋，返还 ${result.refundedPoints} 点`, 'system')
    gameStore.addLootLog(`💸 -${cost} 金币（重置天赋）`)
  }
}

function formatDescription(talent) {
  if (!talent?.description) return ''
  let desc = talent.description
  const points = getTalentPoints(talent.id) || 1
  if (talent.effect?.bonus) {
    const value = talent.effect.bonus * points
    desc = desc.replace('{bonus*100}', Math.round(value * 100))
    desc = desc.replace('{bonus}', value)
  }
  return desc
}

function getRequiredTalentName(reqId) {
  if (!currentTree.value?.talents) return reqId
  const t = currentTree.value.talents.find(t => t.id === reqId)
  return t?.name || reqId
}
</script>

<style scoped>
.talent-modal {
  max-width: 520px;
  width: 95vw;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 2px solid var(--border-primary);
}

.modal-title {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
}

.points-available {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}

.points-available.has-points {
  color: var(--color-friendly);
  text-shadow: 0 0 4px rgba(0, 255, 0, 0.4);
}

.points-total {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  margin-left: 4px;
}

/* 锁定状态 */
.talent-locked {
  text-align: center;
  padding: 40px 20px;
}

.lock-icon { font-size: 48px; margin-bottom: 10px; }
.lock-text { font-size: var(--fs-xs); color: var(--primary-gold); margin-bottom: 8px; }
.lock-sub { font-size: var(--fs-xs); color: var(--text-secondary); }

/* 天赋树标签 */
.tree-tabs {
  display: flex;
  border-bottom: 2px solid var(--border-primary);
}

.tree-tab {
  flex: 1;
  padding: 8px 6px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-primary);
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s;
}

.tree-tab:hover { background: rgba(255, 215, 0, 0.08); }
.tree-tab.active {
  border-bottom-color: var(--primary-gold);
  color: var(--primary-gold);
  background: rgba(255, 215, 0, 0.05);
}

.tree-icon { font-size: 14px; }
.tree-points { font-size: var(--fs-xs); color: var(--text-secondary); }

.tree-description {
  padding: 6px 10px;
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid var(--border-primary);
}

/* ==================== WoW 风格天赋图标网格 ==================== */
.talent-tree {
  padding: 10px;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%);
}

.talent-tier {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.talent-tier:last-child {
  margin-bottom: 0;
}

.tier-label {
  font-size: 10px;
  color: var(--text-muted);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  white-space: nowrap;
  width: 14px;
  flex-shrink: 0;
  text-align: center;
}

.tier-icons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
  justify-content: center;
}

/* 天赋图标容器 */
.talent-icon-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.15s;
}

.talent-icon-wrapper:hover {
  transform: scale(1.1);
}

.talent-icon-wrapper.locked {
  opacity: 0.35;
  cursor: not-allowed;
  filter: grayscale(0.6);
}

.talent-icon-wrapper.locked:hover {
  transform: none;
}

/* 图标框 */
.talent-icon-box {
  width: 48px;
  height: 48px;
  border: 2px solid var(--border-primary);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
}

.talent-emoji {
  font-size: 22px;
  line-height: 1;
}

/* 可分配状态：绿色边框 + 呼吸光效 */
.talent-icon-wrapper.available .talent-icon-box {
  border-color: var(--color-friendly);
  box-shadow: 0 0 6px rgba(0, 255, 0, 0.3), inset 0 0 8px rgba(0, 255, 0, 0.08);
  animation: talent-pulse 2s ease-in-out infinite;
}

@keyframes talent-pulse {
  0%, 100% { box-shadow: 0 0 4px rgba(0, 255, 0, 0.2), inset 0 0 6px rgba(0, 255, 0, 0.05); }
  50% { box-shadow: 0 0 10px rgba(0, 255, 0, 0.5), inset 0 0 12px rgba(0, 255, 0, 0.12); }
}

/* 部分投入：金色边框 */
.talent-icon-wrapper.partial .talent-icon-box {
  border-color: var(--primary-gold);
  background: rgba(255, 215, 0, 0.08);
  box-shadow: 0 0 4px rgba(255, 215, 0, 0.2);
}

/* 满级：明亮金色 + 光晕 */
.talent-icon-wrapper.maxed .talent-icon-box {
  border-color: var(--primary-gold);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 200, 0, 0.08) 100%);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 215, 0, 0.1);
}

/* 点数徽章 */
.talent-point-badge {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 2px;
  font-family: var(--pixel-font);
  line-height: 1;
}

.talent-icon-wrapper.partial .talent-point-badge {
  color: var(--color-friendly);
}

.talent-icon-wrapper.maxed .talent-point-badge {
  color: var(--primary-gold);
  text-shadow: 0 0 4px rgba(255, 215, 0, 0.5);
}

/* 前置箭头 */
.talent-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1;
}

.talent-icon-wrapper.partial .talent-arrow,
.talent-icon-wrapper.maxed .talent-arrow {
  color: var(--primary-gold);
}

/* ==================== Tooltip ==================== */
.talent-tooltip {
  position: fixed;
  z-index: 99999;
  width: 260px;
  background: rgba(10, 10, 20, 0.96);
  border: 2px solid var(--border-accent);
  border-radius: 6px;
  padding: 10px;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
}

.tt-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.tt-icon {
  font-size: 18px;
}

.tt-name {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  flex: 1;
}

.tt-name-maxed {
  color: var(--primary-gold);
}

.tt-name-partial {
  color: var(--color-friendly);
}

.tt-rank {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}

.tt-tier {
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.tt-desc {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 4px;
}

.tt-req {
  font-size: var(--fs-xs);
  color: var(--color-debuff);
  margin-bottom: 4px;
}

.tt-hint {
  font-size: 10px;
  margin-top: 6px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.tt-hint-add { color: var(--color-friendly); }
.tt-hint-max { color: var(--primary-gold); }
.tt-hint-locked { color: var(--text-muted); }

/* ==================== 操作按钮 ==================== */
.talent-actions {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  border-top: 1px solid var(--border-primary);
}

.btn-reset-tree {
  flex: 1;
  padding: 5px 8px;
  font-size: var(--fs-xs);
  background: var(--bg-tertiary);
  color: var(--class-warrior);
  border: 1px solid var(--border-primary);
}

.btn-reset-tree:hover:not(:disabled) { background: var(--bg-secondary); }
.btn-reset-tree:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-reset-all {
  flex: 1;
  padding: 5px 8px;
  font-size: var(--fs-xs);
  background: var(--bg-tertiary);
  color: var(--color-debuff);
  border: 1px solid var(--border-primary);
}

.btn-reset-all:hover:not(:disabled) { background: var(--bg-secondary); }
.btn-reset-all:disabled { opacity: 0.4; cursor: not-allowed; }

.modal-buttons {
  display: flex;
  justify-content: center;
  padding: 8px 10px;
  border-top: 1px solid var(--border-primary);
}
</style>
