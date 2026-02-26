<template>
  <div class="dungeon-combat-view">
    <!-- 副本信息栏（合并） -->
    <div class="dungeon-info-bar">
      <div class="dungeon-info-left">
        <span class="encounter-name">{{ encounterName }}</span>
      </div>
      <div class="dungeon-info-center">
        <span class="dungeon-icon">🏰</span>
        <span class="dungeon-name-text">{{ dungeonName }}</span>
        <span v-if="waveLabel" class="wave-progress-badge">{{ waveLabel }}</span>
      </div>
      <div class="dungeon-info-right">
        <button class="exit-dungeon-btn" @click="confirmExitDungeon">
          <span>退出副本</span>
          <span class="exit-icon">🚪</span>
        </button>
      </div>
    </div>

    <!-- 回合顺序条 -->
    <TurnOrderBar
      ref="turnOrderBarRef"
      :turnOrder="turnOrder"
      :currentRound="currentRound"
      @hover-unit="onHoverTurnUnit"
      @leave-unit="onLeaveTurnUnit"
    />

    <!-- 战场 -->
    <div class="dungeon-battlefield">
      <div class="battlefield-inner">
      <!-- 我方（按slot降序：坦克在右侧靠近战场中心，治疗在左侧后排） -->
      <div class="party-positions">
        <div v-for="member in sortedPartyMembers" :key="member.id" class="party-member-slot">
          <CombatantCard
            :unit="member"
            size="compact"
            side="player"
            :floats="combatFloats.getFloatingNumbers(member.id)"
            :shaking="combatFloats.isShaking(member.id)"
            :dead="member.currentHp <= 0"
            :deathAnim="combatFloats.getDeathState(member.id) || ''"
            :selectable="pendingSkillTargetMode === 'ally'"
            :selected="selectedTargetId === member.id"
            :highlightClass="getUnitHighlightClass(member.id, 'player', member.currentHp)"
            @click="selectAlly(member)"
          />
          <!-- 宠物附属小卡片 -->
          <div v-if="getPetForMember(member.id)" class="dungeon-pet-card" :class="{ 'pet-dead': !getPetForMember(member.id).isAlive }">
            <span class="dpet-emoji">{{ getPetForMember(member.id).emoji }}</span>
            <span class="dpet-name">{{ getPetForMember(member.id).name }}</span>
            <div class="dpet-hp-bar">
              <div class="dpet-hp-fill" :style="{ width: getPetForMember(member.id).hp?.percent + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="battlefield-center">
        <div class="vs-indicator">⚔️</div>
      </div>

      <!-- 敌方 -->
      <div class="enemy-positions">
        <CombatantCard
          v-for="enemy in enemies"
          :key="enemy.id"
          :unit="enemy"
          size="compact"
          side="enemy"
          :floats="combatFloats.getFloatingNumbers(enemy.id)"
          :shaking="combatFloats.isShaking(enemy.id)"
          :dead="enemy.currentHp <= 0"
          :deathAnim="combatFloats.getDeathState(enemy.id) || ''"
          :selectable="true"
          :selected="selectedTargetId === enemy.id"
          :isBoss="enemy.isBoss || enemy.type === 'boss'"
          :highlightClass="getUnitHighlightClass(enemy.id, 'enemy', enemy.currentHp)"
          @click="selectTarget(enemy)"
          @mouseenter="onHoverEnemy(enemy)"
          @mouseleave="onLeaveEnemy"
        />
      </div>
      </div>
    </div>

    <!-- 当前行动信息 -->
    <div class="acting-unit-bar">
      <template v-if="isPlanningPhase">
        <span>📋 规划阶段: </span>
        <span class="acting-name">{{ currentActingUnit?.name || '等待中' }}</span>
        <span class="planned-action-tag" v-if="plannedActionDesc">
          — 已部署: {{ plannedActionDesc }}
        </span>
        <span class="planned-action-tag not-ready" v-else>
          — 请选择行动
        </span>
      </template>
      <template v-else-if="isExecuting">
        <span>⚡ 结算中: </span>
        <span class="acting-name">{{ currentActingUnit?.name || '...' }}</span>
      </template>
      <template v-else>
        <span>🎯 当前行动: </span>
        <span class="acting-name">{{ currentActingUnit?.name || '等待中' }}</span>
      </template>
      <div class="action-points" v-if="actionPoints && isPlanningPhase">
        <span>行动点:</span>
        <span v-for="i in actionPoints.max" :key="i" class="ap-dot" :class="{ used: i > actionPoints.current }">●</span>
      </div>
    </div>

    <!-- 技能面板（inline 模式，与野外战斗统一） -->
    <SkillPanel
      v-if="hasSkills && !isMultiplayerMode"
      mode="inline"
      :unit="playerUnit"
      :show-action-points="true"
      :disabled="!isPlanningPhase || isAutoBattle"
      @use-skill="onUseSkill"
    />

    <!-- 操作按钮（始终显示，非规划阶段置灰） — 多人模式隐藏 -->
    <div class="combat-actions" v-if="!isMultiplayerMode">
      <button class="pixel-btn action-btn" @click="doAttack" :disabled="!isPlanningPhase || isAutoBattle">
        <span class="btn-icon">⚔️</span>
        <span>攻击</span>
      </button>
      <button class="pixel-btn action-btn" @click="doDefend" :disabled="!isPlanningPhase || isAutoBattle">
        <span class="btn-icon">🛡️</span>
        <span>防御</span>
      </button>
      <button
        class="pixel-btn action-btn execute-btn"
        :class="{ ready: !!plannedActionDesc && isPlanningPhase }"
        @click="startExecution"
        :disabled="!isPlanningPhase || !plannedActionDesc || isAutoBattle"
      >
        <span class="btn-icon">▶️</span>
        <span>开始结算</span>
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

    <!-- 短暂休息界面（多人模式下自动跳过，但仍显示状态） -->
    <div v-if="showRestPhase && !isMultiplayerMode" class="rest-phase-overlay">
      <div class="rest-phase-dialog">
        <div class="rest-phase-title">🎉 遭遇战胜利！</div>
        <div class="rest-phase-subtitle">
          {{ restHasNextEncounter ? `第 ${restEncounterProgress} 场战斗完成` : '最终战斗完成' }}
        </div>

        <!-- 队伍状态 -->
        <div class="rest-party-status">
          <div v-for="member in restPartyStatus" :key="member.id" class="rest-member-row">
            <span class="rest-member-name" :class="{ dead: member.currentHp <= 0 }">
              <PixelIcon v-if="member.icon" :src="member.icon" :size="16" :fallback="member.emoji || '⚔️'" />
              <span v-else>{{ member.emoji || '⚔️' }}</span> {{ member.name }}
            </span>
            <div class="rest-hp-bar-bg">
              <div class="rest-hp-bar-fill" :style="{ width: member.hpPercent + '%' }"></div>
              <span class="rest-hp-text">{{ member.currentHp }}/{{ member.maxHp }}</span>
            </div>
            <div v-if="member.hasResource" class="rest-resource-bar-bg">
              <div class="rest-resource-bar-fill" :style="{ width: member.resourcePercent + '%' }"></div>
              <span class="rest-resource-text">{{ member.resourceCurrent }}/{{ member.resourceMax }}</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="rest-phase-actions">
          <button
            class="pixel-btn rest-btn rest-heal-btn"
            @click="startResting"
            :disabled="isResting || isFullyRested"
          >
            <span>{{ isResting ? '恢复中...' : (isFullyRested ? '✅ 已满状态' : '🏕️ 休息恢复') }}</span>
          </button>
          <button
            v-if="restHasNextEncounter"
            class="pixel-btn rest-btn rest-continue-btn"
            @click="continueNextEncounter"
            :disabled="isResting"
          >
            <span>⚔️ 继续下一场</span>
          </button>
          <button
            v-else
            class="pixel-btn rest-btn rest-complete-btn"
            @click="continueNextEncounter"
            :disabled="isResting"
          >
            <span>🏆 完成副本</span>
          </button>
          <button
            class="pixel-btn rest-btn rest-exit-btn"
            @click="exitDungeon"
            :disabled="isResting"
          >
            <span>🚪 退出副本</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 目标确认弹窗（多人模式隐藏） -->
    <TargetConfirmDialog
      v-if="confirmAction && !isMultiplayerMode"
      :action="confirmAction"
      @confirm="onConfirmAction"
      @cancel="confirmAction = null; pendingSkillId = null; pendingSkillTargetMode = null; pendingAttack = false; selectedTargetId = null"
    />

    <!-- 退出副本确认弹窗 -->
    <div v-if="showExitConfirm" class="exit-confirm-overlay" @click.self="showExitConfirm = false">
      <div class="exit-confirm-dialog">
        <div class="exit-confirm-title">⚠️ 确认退出副本</div>
        <div class="exit-confirm-text">退出副本将放弃当前战斗进度，返回野外探索。</div>
        <div class="exit-confirm-buttons">
          <button class="pixel-btn exit-cancel-btn" @click="showExitConfirm = false">取消</button>
          <button class="pixel-btn exit-confirm-btn" @click="exitDungeon">确认退出</button>
        </div>
      </div>
    </div>

    <!-- 召唤选择面板 -->
    <SummonPanel
      :visible="showDungeonSummonPanel"
      :title="dungeonSummonTitle"
      :summons="dungeonSummonList"
      @select="onDungeonSummonSelect"
      @close="closeDungeonSummonPanel"
    />

    <!-- 多人模式：自动战斗提示条 -->
    <div v-if="isMultiplayerMode" class="multiplayer-auto-banner">
      <span>🤖 集合石模式 — AI 全自动战斗中</span>
      <span v-if="multiplayerBattleStatus" class="mp-status">{{ multiplayerBattleStatus }}</span>
    </div>

    <!-- 多人模式：可折叠聊天侧栏 -->
    <div v-if="isMultiplayerMode" class="mp-chat-sidebar" :class="{ collapsed: !showMpChat }">
      <button class="mp-chat-toggle" @click="showMpChat = !showMpChat">
        💬 {{ showMpChat ? '收起' : '聊天' }}
      </button>
      <div v-if="showMpChat" class="mp-chat-body">
        <div class="mp-chat-messages" ref="mpChatRef">
          <div v-for="(msg, idx) in mpChatMessages" :key="idx" class="mp-chat-msg">
            <span class="mp-chat-sender">{{ msg.nickname || msg.sender }}:</span>
            <span class="mp-chat-text">{{ msg.content }}</span>
          </div>
        </div>
        <div class="mp-chat-input-row">
          <input
            v-model="mpChatInput"
            class="mp-chat-input"
            placeholder="发消息..."
            @keyup.enter="sendMpChat"
          />
          <button class="mp-chat-send" @click="sendMpChat">发送</button>
        </div>
      </div>
    </div>

    <!-- 多人模式：掉落结果弹窗 -->
    <div v-if="showLootModal" class="loot-modal-overlay" @click.self="closeLootModal">
      <div class="loot-modal-dialog">
        <div class="loot-modal-title">🎁 通关奖励</div>
        <div class="loot-modal-items">
          <div v-for="(item, idx) in mpLootItems" :key="idx" class="loot-item-row">
            <span class="loot-item-icon">{{ item.emoji || '📦' }}</span>
            <span class="loot-item-name">{{ item.name }}</span>
            <span v-if="item.quantity > 1" class="loot-item-qty">x{{ item.quantity }}</span>
          </div>
          <div v-if="mpLootItems.length === 0" class="loot-empty">暂无掉落</div>
        </div>
        <div class="loot-modal-actions">
          <button class="pixel-btn loot-confirm-btn" @click="closeLootModal">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'
import { useMultiplayerStore } from '@/stores/multiplayerStore.js'
import { GameData } from '@/data/GameData.js'
import TurnOrderBar from './TurnOrderBar.vue'
import SkillPanel from '@/components/common/SkillPanel.vue'
import TargetConfirmDialog from './TargetConfirmDialog.vue'
import CombatantCard from '@/components/common/CombatantCard.vue'
import PixelIcon from '@/components/common/PixelIcon.vue'
import SummonPanel from '@/components/modals/SummonPanel.vue'
import { useCombatFloats } from '@/composables/useCombatFloats.js'
import { PositioningSystem } from '@/systems/PositioningSystem.js'

const gameStore = useGameStore()
const multiplayerStore = useMultiplayerStore()
const combatFloats = useCombatFloats()

// ==================== 多人模式 ====================
const isMultiplayerMode = computed(() => multiplayerStore.isInBattle)
const showMpChat = ref(false)
const mpChatInput = ref('')
const mpChatRef = ref(null)
const mpChatMessages = computed(() => multiplayerStore.roomMessages)
const showLootModal = ref(false)
const mpLootItems = ref([])
const multiplayerBattleStatus = ref('')
let multiplayerAdapter = null

const dungeonName = ref('')
const encounterName = ref('洞穴入口守卫')
// 波次进度：{ current: number, total: number }
const waveProgress = ref({ current: 0, total: 0 })
const waveLabel = computed(() => {
  const { current, total } = waveProgress.value
  if (!total) return ''
  return `第 ${current + 1} / ${total} 波`
})
const currentRound = ref(1)
const showExitConfirm = ref(false)
const turnOrder = ref([])
const partyMembers = ref([])
const enemies = ref([])
const selectedTargetId = ref(null)
const activePets = ref([]) // 副本宠物列表
const currentActingUnitId = ref(null)

// 召唤面板
const showDungeonSummonPanel = ref(false)
const dungeonSummonTitle = ref('选择召唤物')
const dungeonSummonList = ref([])
let dungeonSummonCallback = null

function onDungeonSummonSelect(selectedId) {
  showDungeonSummonPanel.value = false
  if (dungeonSummonCallback) {
    dungeonSummonCallback(selectedId)
    dungeonSummonCallback = null
  }
}

function closeDungeonSummonPanel() {
  showDungeonSummonPanel.value = false
  dungeonSummonCallback = null
}
const currentActingUnit = ref(null)
const actionPoints = ref(null)
const isPlayerTurn = ref(false)
const isPlanningPhase = ref(false)
const isExecuting = ref(false)
const plannedActionDesc = ref(null)
const confirmAction = ref(null)
const pendingSkillId = ref(null)
const pendingAttack = ref(false)
const pendingSkillTargetMode = ref(null) // 'enemy' | 'ally' | null
const plannedSplashIds = ref(new Set()) // 规划阶段的 cleave 溅射目标（持续显示直到结算）
const plannedPrimaryTargetId = ref(null) // 规划阶段的 cleave 主目标
const hoverEnemyId = ref(null) // 鼠标悬停的敌方目标 ID（用于 cleave 预览）

// ==================== 自动战斗 ====================
const isAutoBattle = ref(false)
let autoBattleTimer = null

// ==================== 短暂休息阶段 ====================
const showRestPhase = ref(false)
const restHasNextEncounter = ref(false)
const restEncounterProgress = ref('')
const isResting = ref(false)
const isFullyRested = ref(false)
const restPartyStatus = ref([])
let restInterval = null

// 行动高亮状态
const highlightTargetId = ref(null)
const highlightActorSide = ref(null) // 'player' | 'enemy' — 当前行动方阵营
const highlightTargetSide = ref(null) // 'player' | 'enemy' — 当前目标方阵营
const splashTargetIds = ref(new Set()) // AOE 溅射目标（区别于主目标的高亮）

// hover 预览高亮状态
const hoverHighlight = reactive({
  attackerId: null,
  attackerSide: null,
  targetId: null,
  targetSide: null,
  isPlayerControlled: false
})
const turnOrderBarRef = ref(null)

// 玩家是否有技能（始终基于玩家数据，不随当前行动单位变化）
const hasSkills = computed(() => {
  const player = gameStore.player
  return (player?.skills || []).length > 0
})

// 技能面板始终显示玩家的技能，不随当前行动单位（敌人）变化
const playerUnit = computed(() => {
  // 优先从队伍中找到玩家角色，否则用 gameStore.player
  return partyMembers.value.find(m => m.id === gameStore.player?.id) || gameStore.player
})

// 我方队伍按 slot 降序排列：治疗(slot5)在左 → 坦克(slot1)在右（靠近敌方）
const sortedPartyMembers = computed(() => {
  return [...partyMembers.value].sort((a, b) => (b.slot ?? 0) - (a.slot ?? 0))
})

// 根据主人 ID 查找宠物
function getPetForMember(memberId) {
  return activePets.value.find(p => p.ownerId === memberId)
}

// 计算近战技能可选的前2个存活敌人ID集合
const meleeSelectableEnemyIds = computed(() => {
  // 按 slot 升序排列存活敌人，取前2个
  const alive = enemies.value
    .filter(e => e.currentHp > 0)
    .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0))
  return new Set(alive.slice(0, 2).map(e => e.id))
})

// 计算当前待释放技能的可选目标ID集合
const selectableTargetIds = computed(() => {
  if (!pendingSkillId.value && !pendingAttack.value) return null

  if (pendingAttack.value) {
    // 普通攻击：当前按近战处理，前2个敌人
    return meleeSelectableEnemyIds.value
  }

  const skill = GameData.skills[pendingSkillId.value]
  if (!skill) return null

  if (pendingSkillTargetMode.value === 'ally') {
    // 治疗技能：所有存活友方（含自己）
    return new Set(partyMembers.value.filter(m => m.currentHp > 0).map(m => m.id))
  }

  if (pendingSkillTargetMode.value === 'enemy') {
    if (skill.skillType === 'melee') {
      return meleeSelectableEnemyIds.value
    }
    // ranged/spell：所有存活敌人
    return new Set(enemies.value.filter(e => e.currentHp > 0).map(e => e.id))
  }

  return null
})

// cleave_3 AOE 预览：悬停或选中目标时，计算左右溅射目标 ID
const cleavePreviewSplashIds = computed(() => {
  if (!pendingSkillId.value) return new Set()
  const skill = GameData.skills[pendingSkillId.value]
  if (!skill || skill.targetType !== 'cleave_3') return new Set()
  const previewTargetId = hoverEnemyId.value || selectedTargetId.value
  if (!previewTargetId) return new Set()
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (!dungeonSystem?.battlefield) return new Set()
  const { splash } = PositioningSystem.getAdjacentTargets(dungeonSystem.battlefield, 'enemy', previewTargetId)
  return new Set(splash.map(u => u.id))
})

// cleave_3 预览的主目标 ID（hover 优先于 selected）
const cleavePreviewPrimaryId = computed(() => {
  if (!pendingSkillId.value) return null
  const skill = GameData.skills[pendingSkillId.value]
  if (!skill || skill.targetType !== 'cleave_3') return null
  return hoverEnemyId.value || selectedTargetId.value
})

let unsubscribers = []

onMounted(() => {
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (!dungeonSystem) return

  const eventBus = gameStore.eventBus

  // 监听战斗开始（初始数据）
  unsubscribers.push(
    eventBus.on('dungeon:combatStart', (state) => {
      updateBattlefield(state)
    })
  )

  // 监听战斗更新
  unsubscribers.push(
    eventBus.on('dungeon:combatUpdate', (state) => {
      updateBattlefield(state)
    })
  )

  // 监听宠物事件
  unsubscribers.push(
    eventBus.on('dungeon:petSummoned', () => {
      // 宠物召唤后刷新显示状态
      const dungeonSystem = gameStore.dungeonCombatSystem
      if (dungeonSystem) {
        updateBattlefield(dungeonSystem.getCombatDisplayState())
      }
    })
  )

  // 监听召唤面板事件
  unsubscribers.push(
    eventBus.on('dungeon:showSummonPanel', (data) => {
      const player = gameStore.stateManager?.get('player')
      const classId = player?.class || player?.classId
      dungeonSummonTitle.value = classId === 'warlock' ? '选择恶魔' : '选择野兽'
      dungeonSummonList.value = data.summons || []
      dungeonSummonCallback = data.callback || null
      showDungeonSummonPanel.value = true
    })
  )

  unsubscribers.push(
    eventBus.on('dungeon:playerTurnStart', (data) => {
      currentActingUnit.value = data.member
      currentActingUnitId.value = data.member.id
      // 结算阶段不显示操作按钮
      if (!data.isExecuting) {
        isPlayerTurn.value = true
      }
      selectedTargetId.value = null
      pendingAttack.value = false
      pendingSkillId.value = null
      pendingSkillTargetMode.value = null
      plannedSplashIds.value = new Set()
      plannedPrimaryTargetId.value = null
      highlightActorSide.value = 'player'
      if (data.actionPoints) {
        actionPoints.value = {
          current: data.actionPoints.current,
          max: data.actionPoints.max
        }
      }
    })
  )

  unsubscribers.push(
    eventBus.on('dungeon:aiTurnStart', (data) => {
      currentActingUnit.value = data.member
      currentActingUnitId.value = data.member.id
      isPlayerTurn.value = false
      highlightActorSide.value = 'player'
    })
  )

  unsubscribers.push(
    eventBus.on('dungeon:actionPointsUpdated', (data) => {
      if (data.actionPoints) {
        actionPoints.value = {
          current: data.actionPoints.current,
          max: data.actionPoints.max
        }
      }
    })
  )

  // 监听伤害事件（对敌方造成伤害）
  unsubscribers.push(
    eventBus.on('dungeon:damageDealt', (data) => {
      if (data.target?.id && data.damage != null) {
        combatFloats.spawnFloatingNumber(data.target.id, data.damage, data.isCrit, false, data.skillName)
      }
    })
  )

  // 监听受伤事件（我方受到伤害）
  unsubscribers.push(
    eventBus.on('dungeon:damageReceived', (data) => {
      if (data.target?.id && data.damage != null) {
        combatFloats.spawnFloatingNumber(data.target.id, data.damage, data.isCrit, false, data.skillName)
      }
    })
  )

  // 监听治疗事件
  unsubscribers.push(
    eventBus.on('dungeon:healingDone', (data) => {
      if (data.target?.id && data.amount != null) {
        combatFloats.spawnFloatingNumber(data.target.id, data.amount, false, true, data.skillName)
      }
    })
  )

  // 监听单位死亡 — 触发死亡动画
  unsubscribers.push(
    eventBus.on('dungeon:unitDied', (data) => {
      if (data.unit?.id) {
        combatFloats.triggerDeath(data.unit.id, data.side)
      }
    })
  )

  // 监听敌方回合开始 — 高亮敌方行动单位
  unsubscribers.push(
    eventBus.on('dungeon:enemyTurnStart', (data) => {
      currentActingUnitId.value = data.unitId
      currentActingUnit.value = data.unit
      isPlayerTurn.value = false
      highlightTargetId.value = null
      highlightActorSide.value = 'enemy'
    })
  )

  // 监听单位锁定目标 — 高亮被攻击的目标
  unsubscribers.push(
    eventBus.on('dungeon:unitTargeting', (data) => {
      highlightTargetId.value = data.targetId
      highlightActorSide.value = data.attackerSide || highlightActorSide.value
      highlightTargetSide.value = data.targetSide || null
      splashTargetIds.value = new Set(data.splashTargetIds || [])
    })
  )

  // 监听规划阶段开始
  unsubscribers.push(
    eventBus.on('dungeon:planningPhaseStart', (data) => {
      isPlanningPhase.value = true
      isExecuting.value = false
      isPlayerTurn.value = true
      plannedActionDesc.value = null
      plannedSplashIds.value = new Set()
      plannedPrimaryTargetId.value = null
      if (data.member) {
        currentActingUnit.value = data.member
        currentActingUnitId.value = data.member.id
        highlightActorSide.value = 'player'
      }
      if (data.actionPoints) {
        actionPoints.value = {
          current: data.actionPoints.current,
          max: data.actionPoints.max
        }
      }
      if (data.currentRound) {
        currentRound.value = data.currentRound
      }
      // 清除上次选中的目标
      selectedTargetId.value = null
      pendingAttack.value = false
      pendingSkillId.value = null
      pendingSkillTargetMode.value = null

      // 自动战斗：规划阶段自动行动
      if (isAutoBattle.value) {
        scheduleAutoDungeonAction()
      }
    })
  )

  // 监听行动已部署
  unsubscribers.push(
    eventBus.on('dungeon:actionPlanned', (data) => {
      plannedActionDesc.value = data.description
    })
  )

  // 监听结算开始
  unsubscribers.push(
    eventBus.on('dungeon:executionStart', () => {
      isPlanningPhase.value = false
      isExecuting.value = true
      isPlayerTurn.value = false
      plannedActionDesc.value = null
      plannedSplashIds.value = new Set()
      plannedPrimaryTargetId.value = null
    })
  )

  // 监听遭遇战胜利 → 进入短暂休息
  unsubscribers.push(
    eventBus.on('dungeon:encounterVictory', (data) => {
      // 记住当前是否在自动战斗中
      const wasAutoBattle = isAutoBattle.value
      // 暂停自动战斗调度（但不关闭状态）
      if (autoBattleTimer) {
        clearTimeout(autoBattleTimer)
        autoBattleTimer = null
      }
      isPlanningPhase.value = false
      isExecuting.value = false
      isPlayerTurn.value = false

      // 清除死亡动画状态（复活后卡片不再灰色）
      combatFloats.cleanup()

      restHasNextEncounter.value = data.hasNextEncounter
      restEncounterProgress.value = `${data.encounterIndex}/${data.totalEncounters}`
      // 同步顶部波次进度
      waveProgress.value = { current: data.encounterIndex, total: data.totalEncounters }
      isResting.value = false
      isFullyRested.value = false
      updateRestPartyStatus()
      checkIfFullyRested()
      showRestPhase.value = true

      // 自动战斗模式：自动休息 → 回满后自动进入下一场
      if (wasAutoBattle) {
        isAutoBattle.value = true
        if (isFullyRested.value) {
          // 已经满状态，直接自动进入下一场
          setTimeout(() => autoNextAfterRest(), 800)
        } else {
          // 自动开始休息，休息完成后自动继续
          setTimeout(() => startRestingAuto(), 500)
        }
      }
    })
  )

  // 键盘快捷键
  if (eventBus) {
    const onShortcutAttack = () => { if (!isAutoBattle.value && isPlanningPhase.value) doAttack() }
    const onShortcutDefend = () => { if (!isAutoBattle.value && isPlanningPhase.value) doDefend() }
    const onShortcutExecute = () => { if (!isAutoBattle.value && isPlanningPhase.value && plannedActionDesc.value) startExecution() }
    const onShortcutAuto = () => toggleAutoBattle()
    const onShortcutExit = () => confirmExitDungeon()
    const onShortcutSkill = ({ index }) => {
      if (isAutoBattle.value || !isPlanningPhase.value) return
      const skills = gameStore.player?.skills || []
      if (index < skills.length) onUseSkill(skills[index])
    }
    eventBus.on('shortcut:attack', onShortcutAttack)
    eventBus.on('shortcut:defend', onShortcutDefend)
    eventBus.on('shortcut:execute', onShortcutExecute)
    eventBus.on('shortcut:autoBattle', onShortcutAuto)
    eventBus.on('shortcut:exitDungeon', onShortcutExit)
    eventBus.on('shortcut:useSkill', onShortcutSkill)
    unsubscribers.push(
      () => eventBus.off('shortcut:attack', onShortcutAttack),
      () => eventBus.off('shortcut:defend', onShortcutDefend),
      () => eventBus.off('shortcut:execute', onShortcutExecute),
      () => eventBus.off('shortcut:autoBattle', onShortcutAuto),
      () => eventBus.off('shortcut:exitDungeon', onShortcutExit),
      () => eventBus.off('shortcut:useSkill', onShortcutSkill),
    )
  }

  // 启动副本战斗
  if (isMultiplayerMode.value) {
    startDungeonMultiplayer()
  } else {
    startDungeon()
  }
})

onUnmounted(() => {
  unsubscribers.forEach(unsub => {
    if (typeof unsub === 'function') unsub()
  })
  combatFloats.cleanup()
  if (autoBattleTimer) {
    clearTimeout(autoBattleTimer)
    autoBattleTimer = null
  }
  if (restInterval) {
    clearInterval(restInterval)
    restInterval = null
  }
  // 多人模式清理
  if (multiplayerAdapter) {
    multiplayerAdapter.cleanup()
    multiplayerAdapter = null
  }
  // 确保战斗循环停止（无论单人/多人模式）
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (dungeonSystem && dungeonSystem.inDungeonCombat) {
    dungeonSystem.abortBattle()
  }
})

async function startDungeon() {
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (dungeonSystem && gameStore.player) {
    try {
      const dungeonId = gameStore.selectedDungeonId || 'wailing_caverns'
      await dungeonSystem.startDungeon(dungeonId, [gameStore.player])
      // 获取副本名称
      if (dungeonSystem.currentDungeon) {
        dungeonName.value = dungeonSystem.currentDungeon.name || '未知副本'
      }
    } catch (e) {
      console.error('启动副本失败:', e)
      gameStore.addLog('❌ 启动副本失败: ' + e.message, 'system')
    }
  }
}

/**
 * 多人模式启动副本
 */
async function startDungeonMultiplayer() {
  const { MultiplayerDungeonAdapter } = await import('@/systems/MultiplayerDungeonAdapter.js')
  
  // 从 multiplayerStore 获取 battle:init 数据
  // 可能 room:battle_start 先到导致跳转，battle:init 稍后到达，需要等待
  let initData = multiplayerStore.battleInitData
  if (!initData) {
    console.log('[DungeonCombatView] 等待 battle:init 数据...')
    multiplayerBattleStatus.value = '等待服务器数据...'
    // 最多等待 10 秒
    for (let i = 0; i < 100; i++) {
      await new Promise(r => setTimeout(r, 100))
      initData = multiplayerStore.battleInitData
      if (initData) break
    }
  }
  if (!initData) {
    console.error('[DungeonCombatView] 超时：无 battle:init 数据')
    gameStore.addLog('❌ 多人副本启动失败：缺少战斗初始化数据', 'system')
    multiplayerBattleStatus.value = '启动失败 — 未收到服务器数据'
    return
  }

  multiplayerBattleStatus.value = '正在初始化...'

  try {
    multiplayerAdapter = new MultiplayerDungeonAdapter()
    await multiplayerAdapter.start(initData)

    // 获取副本名称（多人模式加"集合石-"前缀）
    if (multiplayerAdapter.dungeonCombatSystem?.currentDungeon) {
      dungeonName.value = '集合石-' + (multiplayerAdapter.dungeonCombatSystem.currentDungeon.name || '未知副本')
    }
    multiplayerBattleStatus.value = '战斗进行中'

    // 监听多人模式特有事件
    const eventBus = gameStore.eventBus
    
    const onLootReceived = ({ items }) => {
      mpLootItems.value = items || []
      showLootModal.value = true
      multiplayerBattleStatus.value = '战斗结束 — 查看奖励'
    }
    const onBattleFinished = () => {
      multiplayerBattleStatus.value = '服务端结算完成'
      // 如果还没收到掉落，也弹出结算界面（空掉落）
      if (!showLootModal.value) {
        mpLootItems.value = []
        showLootModal.value = true
        multiplayerBattleStatus.value = '战斗结束 — 查看结算'
      }
    }
    
    // 同步其他成员上报的波次（multiplayer:waveUpdated 由 MultiplayerDungeonAdapter 转发）
    const onWaveUpdated = ({ waveIndex, totalWaves }) => {
      waveProgress.value = { current: waveIndex, total: totalWaves }
    }

    eventBus.on('multiplayer:lootReceived', onLootReceived)
    eventBus.on('multiplayer:battleFinished', onBattleFinished)
    eventBus.on('multiplayer:waveUpdated', onWaveUpdated)
    unsubscribers.push(
      () => eventBus.off('multiplayer:lootReceived', onLootReceived),
      () => eventBus.off('multiplayer:battleFinished', onBattleFinished),
      () => eventBus.off('multiplayer:waveUpdated', onWaveUpdated),
    )
  } catch (e) {
    console.error('多人副本启动失败:', e)
    gameStore.addLog('❌ 多人副本启动失败: ' + e.message, 'system')
    multiplayerBattleStatus.value = '启动失败'
  }
}

/**
 * 多人模式聊天
 */
function sendMpChat() {
  const content = mpChatInput.value.trim()
  if (!content) return
  multiplayerStore.sendChat('room', content)
  mpChatInput.value = ''
  nextTick(() => {
    if (mpChatRef.value) {
      mpChatRef.value.scrollTop = mpChatRef.value.scrollHeight
    }
  })
}

/**
 * 关闭掉落弹窗并返回大厅
 */
function closeLootModal() {
  // 将服务端下发的奖励写入本地存档背包
  if (mpLootItems.value.length > 0) {
    const slot = gameStore.engine?.currentSlot || 1
    const saved = gameStore.saveManager?.applyLootToSave(mpLootItems.value, slot)
    if (saved) {
      console.log(`[DungeonCombatView] 奖励已写入存档槽位 ${slot}，共 ${mpLootItems.value.length} 件`)
    } else {
      console.warn('[DungeonCombatView] 奖励写入存档失败，saveManager 不可用')
    }
  }
  mpLootItems.value = []
  showLootModal.value = false
  // 清理多人战斗状态并通知服务端离开房间
  multiplayerStore.battleState = 'idle'
  multiplayerStore.lootItems = []
  multiplayerStore.leaveRoom()
  // 返回大厅
  gameStore.changeScene('exploration')
}

function updateBattlefield(state) {
  if (!state) return
  if (state.encounterName) encounterName.value = state.encounterName
  if (state.currentRound) currentRound.value = state.currentRound

  // 同步波次进度
  if (state.totalEncounters > 0) {
    waveProgress.value = {
      current: state.encounterIndex ?? waveProgress.value.current,
      total:   state.totalEncounters,
    }
  }

  // 战场更新时清除目标高亮（回合已结束）
  highlightTargetId.value = null
  highlightActorSide.value = null
  highlightTargetSide.value = null
  splashTargetIds.value = new Set()

  if (state.party) {
    partyMembers.value = state.party.map(m => ({
      ...m,
      currentHp: m.hp?.current ?? m.currentHp ?? 0,
      maxHp: m.hp?.max ?? m.maxHp ?? 1
    }))
  }
  if (state.enemies) {
    enemies.value = state.enemies.map(e => ({
      ...e,
      currentHp: e.hp?.current ?? e.currentHp ?? 0,
      maxHp: e.hp?.max ?? e.maxHp ?? 1
    }))
  }
  if (state.turnOrder) {
    turnOrder.value = state.turnOrder
  }
  if (state.pets) {
    activePets.value = state.pets
  }
}

/**
 * 计算单位的高亮 class（合并战斗高亮和 hover 预览高亮）
 */
function getUnitHighlightClass(unitId, unitSide, currentHp) {
  const cls = {}

  // 目标选择模式下的高亮/灰化
  const hasTargetMode = pendingSkillId.value != null || pendingAttack.value
  const targetMode = pendingSkillTargetMode.value // 'enemy' | 'ally' | null
  const selectable = selectableTargetIds.value

  if (hasTargetMode && selectable && currentHp > 0) {
    if (selectable.has(unitId)) {
      cls['target-selectable'] = true
      cls['selected'] = selectedTargetId.value === unitId
      // cleave_3 预览：hover/选中的主目标用红色，溅射目标用橙色
      if (cleavePreviewPrimaryId.value === unitId) {
        cls['target-selectable'] = false
        cls['planned-primary-target'] = true
      } else if (cleavePreviewSplashIds.value.has(unitId)) {
        cls['target-selectable'] = false
        cls['target-splash-preview'] = true
      }
    } else {
      // cleave_3 溅射目标也不应灰化
      if (cleavePreviewSplashIds.value.has(unitId)) {
        cls['target-splash-preview'] = true
      } else {
        cls['target-dimmed'] = true
      }
    }
  } else if (hasTargetMode && !selectable) {
    // pendingAttack 没有明确限制时，敌方可选
    if (unitSide === 'enemy' && currentHp > 0) {
      cls['target-selectable'] = true
      cls['selected'] = selectedTargetId.value === unitId
    }
  } else {
    // 非目标选择模式：保留旧的选中状态
    if (unitSide === 'enemy') {
      cls['selected'] = selectedTargetId.value === unitId
    }
    // 规划阶段：cleave 技能已确认，持续显示溅射目标
    if (plannedSplashIds.value.size > 0 && unitSide === 'enemy' && currentHp > 0) {
      if (unitId === plannedPrimaryTargetId.value) {
        cls['planned-primary-target'] = true
      } else if (plannedSplashIds.value.has(unitId)) {
        cls['target-splash-preview'] = true
      }
    }
  }

  // hover 预览高亮（优先于规划阶段的当前行动高亮）
  const h = hoverHighlight
  const hasHoverPreview = !!(h.attackerId)

  if (hasHoverPreview) {
    // hover 预览模式：只显示预览中的攻击方和目标方高亮
    if (h.attackerId && !h.isPlayerControlled) {
      if (unitId === h.attackerId) {
        if (h.attackerSide === 'player') cls['acting-highlight-green'] = true
        else cls['acting-highlight-darkyellow'] = true
      }
      if (unitId === h.targetId) {
        if (h.attackerSide === h.targetSide) {
          if (h.attackerSide === 'player') cls['target-highlight-green'] = true
          else cls['target-highlight-darkyellow'] = true
        } else {
          cls['target-highlight-red'] = true
        }
      }
    }
    // hover 预览时，非预览角色不加任何战斗高亮
  } else {
    // 无 hover 预览：显示战斗中的实时高亮
    const isActing = unitId === currentActingUnitId.value
    const isTarget = unitId === highlightTargetId.value
    const isSplash = splashTargetIds.value.has(unitId)
    const actorSide = highlightActorSide.value

    if (isActing && actorSide) {
      cls['current-turn'] = true
      if (actorSide === 'player') cls['acting-highlight-green'] = true
      else cls['acting-highlight-darkyellow'] = true
    } else if (isTarget && actorSide) {
      const tgtSide = highlightTargetSide.value
      if (actorSide === tgtSide) {
        if (actorSide === 'player') cls['target-highlight-green'] = true
        else cls['target-highlight-darkyellow'] = true
      } else {
        cls['target-highlight-red'] = true
      }
    } else if (isSplash && actorSide) {
      cls['target-highlight-splash'] = true
    }

    // current-turn 基础样式
    if (unitId === currentActingUnitId.value && !cls['acting-highlight-green'] && !cls['acting-highlight-darkyellow']) {
      cls['current-turn'] = true
    }
  }

  return cls
}

/**
 * hover 回合顺序条中的单位
 */
function onHoverTurnUnit(unitId) {
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (!dungeonSystem) return

  const preview = dungeonSystem.getActionPreview(unitId)
  if (preview) {
    hoverHighlight.attackerId = preview.attackerId
    hoverHighlight.attackerSide = preview.attackerSide
    hoverHighlight.targetId = preview.targetId
    hoverHighlight.targetSide = preview.targetSide
    hoverHighlight.isPlayerControlled = !!preview.isPlayerControlled

    // 传递 tooltip 数据给 TurnOrderBar
    if (turnOrderBarRef.value) {
      turnOrderBarRef.value.setPreview(preview)
    }
  }
}

/**
 * 离开回合顺序条中的单位
 */
function onLeaveTurnUnit() {
  hoverHighlight.attackerId = null
  hoverHighlight.attackerSide = null
  hoverHighlight.targetId = null
  hoverHighlight.targetSide = null
  hoverHighlight.isPlayerControlled = false
}

function toggleAutoBattle() {
  isAutoBattle.value = !isAutoBattle.value
  if (isAutoBattle.value) {
    gameStore.addLog('🤖 开启副本自动战斗', 'system')
    // 如果当前是规划阶段，立即执行
    if (isPlanningPhase.value) {
      scheduleAutoDungeonAction()
    }
  } else {
    gameStore.addLog('⏹️ 关闭副本自动战斗', 'system')
    if (autoBattleTimer) {
      clearTimeout(autoBattleTimer)
      autoBattleTimer = null
    }
  }
}

function scheduleAutoDungeonAction() {
  if (!isAutoBattle.value) return
  autoBattleTimer = setTimeout(() => doAutoDungeonAction(), 500)
}

/**
 * 副本自动战斗：为玩家角色自动选择行动并触发结算
 */
function doAutoDungeonAction() {
  if (!isAutoBattle.value || !isPlanningPhase.value) return

  const unit = currentActingUnit.value
  if (!unit) return

  const playerData = gameStore.stateManager?.get('player')
  if (!playerData) return

  const skills = playerData.skills || []
  const cooldowns = playerData.skillCooldowns || {}
  const resource = playerData.resource
  const comboPoints = playerData.comboPoints

  // 找可用的敌方目标（前排优先）
  const aliveEnemies = enemies.value.filter(e => e.currentHp > 0)
  const frontEnemies = [...aliveEnemies].sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0)).slice(0, 2)
  const aliveAllies = partyMembers.value.filter(m => m.currentHp > 0)

  if (aliveEnemies.length === 0) return

  // 检查是否有队友需要治疗（低于30%血量）
  const lowHpAlly = aliveAllies.find(m => m.maxHp > 0 && m.currentHp / m.maxHp < 0.3)

  // 构建可用技能列表
  const usableSkills = []
  for (const skillId of skills) {
    const skill = GameData.skills[skillId]
    if (!skill || skill.skillType === 'passive') continue
    if (cooldowns[skillId] && cooldowns[skillId] > 0) continue
    if (skill.resourceCost && resource) {
      const cost = typeof skill.resourceCost === 'object' ? skill.resourceCost.value : skill.resourceCost
      if (cost && resource.current < cost) continue
    }
    if (skill.comboPointType === 'finisher' && (!comboPoints || comboPoints.current < 1)) continue

    // 行动点检查
    const apCost = skill.actionPointCost || 1
    if (actionPoints.value && actionPoints.value.current < apCost) continue

    usableSkills.push({ skillId, skill })
  }

  let chosenAction = null

  // 0. 没有宠物时优先召唤
  const hasPet = activePets.value.some(p => p.ownerId === unit.id && p.isAlive)
  if (!hasPet) {
    const summonSkill = usableSkills.find(s => s.skill.skillType === 'summon')
    if (summonSkill) {
      chosenAction = { type: 'skill', skillId: summonSkill.skillId, targetId: null }
    }
  }

  // 1. 低血量队友 + 有治疗技能 → 治疗
  if (!chosenAction && lowHpAlly) {
    const healSkill = usableSkills.find(s =>
      (s.skill.targetType === 'ally' || s.skill.targetType === 'all_allies') &&
      (s.skill.healing || s.skill.healPercent || s.skill.skillType === 'heal')
    )
    if (healSkill) {
      const isAoe = ['all_allies'].includes(healSkill.skill.targetType)
      if (isAoe) {
        chosenAction = { type: 'skill', skillId: healSkill.skillId, targetId: null }
      } else {
        chosenAction = { type: 'skill', skillId: healSkill.skillId, targetId: lowHpAlly.id }
      }
    }
  }

  // 2. 有连击点>=4 → 终结技
  if (!chosenAction && comboPoints && comboPoints.current >= 4) {
    const finisher = usableSkills.find(s => s.skill.comboPointType === 'finisher')
    if (finisher) {
      const target = frontEnemies[0] || aliveEnemies[0]
      chosenAction = { type: 'skill', skillId: finisher.skillId, targetId: target.id }
    }
  }

  // 3. Builder 技能
  if (!chosenAction && comboPoints && comboPoints.current < (comboPoints.max || 5)) {
    const builder = usableSkills.find(s => s.skill.comboPointType === 'builder')
    if (builder) {
      const target = frontEnemies[0] || aliveEnemies[0]
      chosenAction = { type: 'skill', skillId: builder.skillId, targetId: target.id }
    }
  }

  // 4. AOE 技能（多目标时优先）
  if (!chosenAction && aliveEnemies.length >= 2) {
    const aoeSkill = usableSkills.find(s =>
      ['all_enemies', 'front_2', 'front_3', 'random_3'].includes(s.skill.targetType)
    )
    if (aoeSkill) {
      chosenAction = { type: 'skill', skillId: aoeSkill.skillId, targetId: null }
    }
  }

  // 5. 高伤害单体技能
  if (!chosenAction) {
    const dmgSkills = usableSkills.filter(s =>
      s.skill.targetType === 'enemy' && (s.skill.damage || s.skill.damageTable) && s.skill.skillType !== 'summon'
    )
    if (dmgSkills.length > 0) {
      dmgSkills.sort((a, b) => {
        const getDmg = (s) => {
          if (!s.skill.damage) return 0
          if (typeof s.skill.damage === 'object') return s.skill.damage.base || 0
          return s.skill.damage || 0
        }
        return getDmg(b) - getDmg(a)
      })
      const target = frontEnemies[0] || aliveEnemies[0]
      chosenAction = { type: 'skill', skillId: dmgSkills[0].skillId, targetId: target.id }
    }
  }

  // 6. 降级：普通攻击
  if (!chosenAction) {
    const target = frontEnemies[0] || aliveEnemies[0]
    chosenAction = { type: 'attack', targetId: target.id }
  }

  // 执行行动
  gameStore.eventBus.emit('dungeon:playerAction', {
    type: chosenAction.type,
    skillId: chosenAction.skillId || null,
    targetId: chosenAction.targetId,
    autoEndTurn: true
  })

  // 等待行动被部署后自动触发结算
  setTimeout(() => {
    if (isAutoBattle.value && plannedActionDesc.value) {
      gameStore.eventBus.emit('dungeon:startExecution')
    }
  }, 300)
}

function onHoverEnemy(enemy) {
  if (enemy.currentHp <= 0) return
  hoverEnemyId.value = enemy.id
}

function onLeaveEnemy() {
  hoverEnemyId.value = null
}

function selectTarget(enemy) {
  if (enemy.currentHp <= 0) return

  // 如果当前是"选友方"模式，点击敌人无效
  if (pendingSkillTargetMode.value === 'ally') {
    gameStore.addLog('💡 当前技能需要选择友方目标', 'system')
    return
  }

  // 检查近战技能的前排限制
  if (pendingSkillId.value) {
    const skill = GameData.skills[pendingSkillId.value]
    if (skill && skill.skillType === 'melee' && skill.targetType === 'enemy') {
      if (!meleeSelectableEnemyIds.value.has(enemy.id)) {
        gameStore.addLog('⚠️ 近战技能无法攻击后排目标', 'system')
        return
      }
    }
  }

  selectedTargetId.value = enemy.id

  // 如果有待释放技能，弹出确认框
  if (pendingSkillId.value) {
    const skill = GameData.skills[pendingSkillId.value]
    if (skill) {
      confirmAction.value = {
        type: 'skill',
        actionName: `${skill.name}`,
        targetId: enemy.id,
        target: enemy,
        skillId: pendingSkillId.value
      }
      // cleave_3 不立即清空 pendingSkillId，让溅射预览保持显示
      if (skill.targetType !== 'cleave_3') {
        pendingSkillId.value = null
        pendingSkillTargetMode.value = null
      }
    } else {
      pendingSkillId.value = null
      pendingSkillTargetMode.value = null
    }
    return
  }

  // 如果有待执行的普通攻击，弹出确认框
  if (pendingAttack.value) {
    // 普通攻击也按近战限制
    if (!meleeSelectableEnemyIds.value.has(enemy.id)) {
      gameStore.addLog('⚠️ 普通攻击无法攻击后排目标', 'system')
      return
    }
    pendingAttack.value = false
    confirmAction.value = {
      type: 'attack',
      actionName: '⚔️ 普通攻击',
      targetId: enemy.id,
      target: enemy,
      skillId: null
    }
  }
}

function selectAlly(member) {
  if (member.currentHp <= 0) return

  // 只有在"选友方"模式下才能点击友方
  if (pendingSkillTargetMode.value !== 'ally') return

  const skill = GameData.skills[pendingSkillId.value]
  if (!skill) return

  selectedTargetId.value = member.id
  confirmAction.value = {
    type: 'skill',
    actionName: `${skill.name}`,
    targetId: member.id,
    target: member,
    skillId: pendingSkillId.value
  }
  pendingSkillId.value = null
  pendingSkillTargetMode.value = null
}

function doAttack() {
  // 如果已有选中的目标，检查前排限制后弹确认
  if (selectedTargetId.value) {
    if (!meleeSelectableEnemyIds.value.has(selectedTargetId.value)) {
      gameStore.addLog('⚠️ 普通攻击无法攻击后排目标，请重新选择前排目标', 'system')
      pendingAttack.value = true
      pendingSkillId.value = null
      pendingSkillTargetMode.value = 'enemy'
      selectedTargetId.value = null
      return
    }
    const target = enemies.value.find(e => e.id === selectedTargetId.value)
    confirmAction.value = {
      type: 'attack',
      actionName: '⚔️ 普通攻击',
      targetId: selectedTargetId.value,
      target,
      skillId: null
    }
    return
  }
  
  // 没有选中目标，进入目标选择模式
  pendingAttack.value = true
  pendingSkillId.value = null
  pendingSkillTargetMode.value = 'enemy'
  gameStore.addLog('💡 请选择一个前排敌方目标进行攻击', 'system')
}

function doDefend() {
  gameStore.eventBus.emit('dungeon:playerAction', { type: 'defend' })
}

function endTurn() {
  gameStore.eventBus.emit('dungeon:playerAction', { type: 'endTurn' })
}

function onUseSkill(skillId) {
  const skill = GameData.skills[skillId]
  if (!skill) return

  // self 类技能直接释放
  if (skill.targetType === 'self') {
    gameStore.eventBus.emit('dungeon:playerAction', {
      type: 'skill',
      skillId,
      targetId: null,
      autoEndTurn: true
    })
    return
  }

  // AOE 类技能（all_enemies, all_allies, front_2, front_3, random_3）直接释放，无需选目标
  if (['all_enemies', 'all_allies', 'front_2', 'front_3', 'random_3'].includes(skill.targetType)) {
    gameStore.eventBus.emit('dungeon:playerAction', {
      type: 'skill',
      skillId,
      targetId: null,
      autoEndTurn: true
    })
    return
  }

  // 治疗单体技能 → 选友方模式
  if (skill.skillType === 'heal' && skill.targetType === 'ally') {
    pendingSkillId.value = skillId
    pendingSkillTargetMode.value = 'ally'
    pendingAttack.value = false
    selectedTargetId.value = null
    gameStore.addLog(`💚 请选择友方目标来施放 ${skill.name}`, 'system')
    return
  }

  // 敌方单体技能 / cleave_3（需选目标的AOE）→ 选敌方模式
  if (skill.targetType === 'enemy' || skill.targetType === 'cleave_3') {
    // 如果已有选中的敌方目标，检查是否满足限制
    if (selectedTargetId.value) {
      const target = enemies.value.find(e => e.id === selectedTargetId.value)
      if (target && target.currentHp > 0) {
        // 近战技能需检查前排限制
        if (skill.skillType === 'melee' && !meleeSelectableEnemyIds.value.has(target.id)) {
          gameStore.addLog('⚠️ 近战技能无法攻击后排目标，请重新选择前排目标', 'system')
          pendingSkillId.value = skillId
          pendingSkillTargetMode.value = 'enemy'
          pendingAttack.value = false
          selectedTargetId.value = null
          return
        }
        confirmAction.value = {
          type: 'skill',
          actionName: `${skill.name}`,
          targetId: selectedTargetId.value,
          target,
          skillId
        }
        // cleave_3: 设置 pendingSkillId 让溅射预览显示
        if (skill.targetType === 'cleave_3') {
          pendingSkillId.value = skillId
          pendingSkillTargetMode.value = 'enemy'
        }
        return
      }
    }

    pendingSkillId.value = skillId
    pendingSkillTargetMode.value = 'enemy'
    pendingAttack.value = false
    selectedTargetId.value = null

    if (skill.skillType === 'melee') {
      gameStore.addLog(`⚔️ 请选择前排目标来施放 ${skill.name}`, 'system')
    } else {
      gameStore.addLog(`💡 请选择目标来施放 ${skill.name}`, 'system')
    }
    return
  }

  // 其他情况（ally 但非 heal，如 buff）：后续单独处理，暂按友方模式
  pendingSkillId.value = skillId
  pendingSkillTargetMode.value = 'ally'
  pendingAttack.value = false
  selectedTargetId.value = null
  gameStore.addLog(`💡 请选择友方目标来施放 ${skill.name}`, 'system')
}

function onConfirmAction(action) {
  // cleave_3 确认时：保存溅射目标到规划状态，持续高亮到结算
  if (action.skillId) {
    const skill = GameData.skills[action.skillId]
    if (skill && skill.targetType === 'cleave_3' && action.targetId) {
      const dungeonSystem = gameStore.dungeonCombatSystem
      if (dungeonSystem?.battlefield) {
        const { splash } = PositioningSystem.getAdjacentTargets(dungeonSystem.battlefield, 'enemy', action.targetId)
        plannedSplashIds.value = new Set(splash.map(u => u.id))
        plannedPrimaryTargetId.value = action.targetId
      }
    }
  }

  confirmAction.value = null
  selectedTargetId.value = null
  pendingSkillId.value = null
  pendingSkillTargetMode.value = null
  gameStore.eventBus.emit('dungeon:playerAction', {
    type: action.type,
    targetId: action.targetId,
    skillId: action.skillId,
    autoEndTurn: true
  })
}

function startExecution() {
  if (!plannedActionDesc.value) return
  gameStore.eventBus.emit('dungeon:startExecution')
}

function confirmExitDungeon() {
  showExitConfirm.value = true
}

function exitDungeon() {
  showExitConfirm.value = false
  showRestPhase.value = false
  if (restInterval) {
    clearInterval(restInterval)
    restInterval = null
  }
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (dungeonSystem) {
    dungeonSystem.abortBattle()
    dungeonSystem.addLog('🚪 你离开了副本，返回野外...', 'system')
    dungeonSystem.resetPlayerStateAfterDungeon()
    dungeonSystem.engine.eventBus.emit('dungeon:exit')
  }
  // 多人模式：通知服务端离开房间
  if (isMultiplayerMode.value) {
    multiplayerStore.leaveRoom()
  }
  gameStore.changeScene('exploration')
}

// ==================== 短暂休息功能 ====================

function updateRestPartyStatus() {
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (!dungeonSystem?.partyState?.members) return
  restPartyStatus.value = dungeonSystem.partyState.members.map(m => {
    const hasResource = m.resource && m.resource.type !== 'rage' && m.resource.max > 0
    return {
      id: m.id,
      name: m.name,
      icon: m.icon || '',
      emoji: m.emoji || '⚔️',
      currentHp: m.currentHp,
      maxHp: m.maxHp,
      hpPercent: m.maxHp > 0 ? Math.floor((m.currentHp / m.maxHp) * 100) : 0,
      hasResource,
      resourceCurrent: hasResource ? m.resource.current : 0,
      resourceMax: hasResource ? m.resource.max : 0,
      resourcePercent: hasResource && m.resource.max > 0 ? Math.floor((m.resource.current / m.resource.max) * 100) : 0
    }
  })
}

function checkIfFullyRested() {
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (!dungeonSystem?.partyState?.members) return
  const allFull = dungeonSystem.partyState.members.every(m => {
    if (m.currentHp < m.maxHp) return false
    if (m.resource && m.resource.type !== 'rage' && m.resource.current < m.resource.max) return false
    return true
  })
  isFullyRested.value = allFull
}

function startResting() {
  if (isResting.value || isFullyRested.value) return
  isResting.value = true
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (!dungeonSystem) return
  restInterval = dungeonSystem.startShortRest(
    () => {
      updateRestPartyStatus()
    },
    () => {
      isResting.value = false
      isFullyRested.value = true
      restInterval = null
    }
  )
}

function continueNextEncounter() {
  if (isResting.value) return
  showRestPhase.value = false
  combatFloats.cleanup() // 清除死亡动画状态，避免复活后仍显示阵亡
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (!dungeonSystem) return
  dungeonSystem.proceedToNextEncounter()
}

/**
 * 自动战斗模式下自动开始休息，恢复完毕后自动进入下一场
 */
function startRestingAuto() {
  if (!isAutoBattle.value) return
  if (isResting.value || isFullyRested.value) {
    if (isFullyRested.value) autoNextAfterRest()
    return
  }
  isResting.value = true
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (!dungeonSystem) return
  restInterval = dungeonSystem.startShortRest(
    () => {
      updateRestPartyStatus()
    },
    () => {
      isResting.value = false
      isFullyRested.value = true
      restInterval = null
      // 恢复完毕，自动进入下一场
      if (isAutoBattle.value) {
        setTimeout(() => autoNextAfterRest(), 500)
      }
    }
  )
}

/**
 * 自动战斗模式下恢复完毕后自动继续下一场或完成副本
 */
function autoNextAfterRest() {
  if (!isAutoBattle.value) return
  if (isResting.value) return
  showRestPhase.value = false
  combatFloats.cleanup()
  const dungeonSystem = gameStore.dungeonCombatSystem
  if (!dungeonSystem) return
  dungeonSystem.proceedToNextEncounter()
}
</script>

<style scoped>
.dungeon-combat-view {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
  height: 100%;
}

/* 副本信息栏（合并） */
.dungeon-info-bar {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: linear-gradient(90deg, rgba(139, 0, 0, 0.3), var(--bg-secondary), var(--bg-secondary));
  border-left: 3px solid var(--color-hp);
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  position: relative;
}

.dungeon-info-left {
  flex-shrink: 0;
  min-width: 0;
}

.dungeon-info-right {
  margin-left: auto;
  flex-shrink: 0;
}

.encounter-name {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  font-weight: bold;
}

.dungeon-info-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: none;
}

.dungeon-icon {
  font-size: var(--fs-xs);
}

.dungeon-name-text {
  font-size: var(--fs-xs);
  color: var(--secondary-gold);
  white-space: nowrap;
}

/* 当前波次徽章 */
.wave-progress-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  font-size: var(--fs-xs);
  color: #fff;
  background: rgba(255, 180, 0, 0.18);
  border: 1px solid rgba(255, 180, 0, 0.45);
  border-radius: 10px;
  white-space: nowrap;
  letter-spacing: 0.04em;
}

.exit-dungeon-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  font-size: var(--fs-xs);
  color: var(--text-primary);
  background: rgba(139, 0, 0, 0.3);
  border: 1px solid rgba(139, 0, 0, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.exit-dungeon-btn:hover {
  color: var(--color-debuff);
  background: rgba(139, 0, 0, 0.5);
  border-color: rgba(248, 113, 113, 0.6); /* --color-debuff */
}

.exit-icon {
  font-size: var(--fs-xs);
}

/* 退出确认弹窗 */
.exit-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.exit-confirm-dialog {
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
  border: 2px solid rgba(255, 215, 0, 0.4);
  padding: 20px;
  min-width: 280px;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.exit-confirm-title {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  margin-bottom: 12px;
  font-weight: bold;
}

.exit-confirm-text {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.exit-confirm-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.exit-cancel-btn {
  font-size: var(--fs-xs);
  padding: 5px 16px;
  background: rgba(100, 100, 100, 0.3);
  border: 1px solid rgba(150, 150, 150, 0.4);
  color: var(--text-primary);
}

.exit-confirm-btn {
  font-size: var(--fs-xs);
  padding: 5px 16px;
  background: rgba(139, 0, 0, 0.4);
  border: 1px solid rgba(248, 113, 113, 0.5); /* --color-debuff */
  color: var(--color-debuff);
}

.exit-confirm-btn:hover {
  background: rgba(139, 0, 0, 0.6);
  color: var(--color-debuff);
}

.dungeon-battlefield {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 2px;
  background: linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1));
  border-radius: 6px;
  overflow: visible;
  flex: 1;
}

.battlefield-inner {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
}

.party-positions, .enemy-positions {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
  flex: 1;
  align-items: start;
  min-width: 0;
}

/* 队员槽位 */
.party-member-slot {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  min-width: 0;
}

/* 副本宠物附属小卡片 */
.dungeon-pet-card {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 1px 4px;
  background: linear-gradient(180deg, var(--bg-tertiary), var(--bg-primary));
  border: 1px solid var(--class-warlock);
  border-radius: 3px;
  max-width: 100%;
  width: 100%;
  animation: dpetAppear 0.4s ease-out;
}

.dungeon-pet-card.pet-dead {
  opacity: 0.3;
  filter: grayscale(0.8);
  border-color: var(--border-primary);
}

.dpet-emoji { font-size: var(--fs-xs); }
.dpet-name { font-size: var(--fs-xs); color: var(--class-warlock); font-weight: bold; white-space: nowrap; }

.dpet-hp-bar {
  flex: 1;
  height: 3px;
  background: var(--bg-primary);
  border-radius: 2px;
  overflow: hidden;
  min-width: 20px;
}

.dpet-hp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-buff), var(--color-heal));
  border-radius: 2px;
  transition: width 0.3s ease;
}

@keyframes dpetAppear {
  0% { opacity: 0; transform: translateY(5px) scale(0.8); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* 敌方BOSS占2个槽位 */
.enemy-positions :deep(.unit-wrapper.size-compact.is-boss) {
  grid-column: span 2;
}

.battlefield-center {
  display: flex;
  align-items: center;
  padding: 0 4px;
  flex-shrink: 0;
  /* 对齐到卡片的视觉中心 */
  align-self: center;
}

.vs-indicator {
  font-size: var(--fs-md);
}

/* Highlight classes */
:deep(.combatant-card.target-selectable) {
  border-color: var(--color-friendly);
  box-shadow: 0 0 20px var(--color-friendly);
  animation: targetPulse 1s ease-in-out infinite;
  cursor: pointer;
}

:deep(.combatant-card.target-selectable:hover) {
  border-color: var(--color-heal);
  transform: scale(1.05);
}

:deep(.combatant-card.target-splash-preview) {
  border-color: var(--class-druid); /* 橙色溅射 */
  box-shadow: 0 0 16px var(--class-druid);
  animation: splashPreviewPulse 1s ease-in-out infinite;
  opacity: 0.9;
}

:deep(.combatant-card.planned-primary-target) {
  border-color: var(--color-damage);
  box-shadow: 0 0 16px var(--color-damage), 0 0 24px rgba(255, 68, 68, 0.4);
  animation: plannedPrimaryPulse 1s ease-in-out infinite;
}

:deep(.combatant-card.target-dimmed) {
  opacity: 0.35;
  filter: grayscale(0.6);
  pointer-events: none;
  transform: scale(0.95);
}

:deep(.combatant-card.current-turn) {
  box-shadow: 0 0 15px var(--primary-gold);
  transform: scale(1.05);
}

:deep(.combatant-card.acting-highlight-green) {
  border-color: var(--color-heal);
  box-shadow: 0 0 12px var(--color-heal), 0 0 24px rgba(68, 255, 136, 0.3);
  transform: scale(1.08);
  animation: actingPulseGreen 1.2s ease-in-out infinite;
}

:deep(.combatant-card.acting-highlight-darkyellow) {
  border-color: var(--secondary-gold);
  box-shadow: 0 0 12px var(--secondary-gold), 0 0 24px rgba(201, 162, 39, 0.3);
  transform: scale(1.08);
  animation: actingPulseDarkYellow 1.2s ease-in-out infinite;
}

:deep(.combatant-card.target-highlight-red) {
  border-color: var(--color-damage);
  box-shadow: 0 0 12px var(--color-damage), 0 0 24px rgba(255, 68, 68, 0.4);
  transform: scale(1.06);
  animation: targetFlashRed 0.6s ease-in-out infinite;
}

:deep(.combatant-card.target-highlight-green) {
  border-color: var(--color-heal);
  box-shadow: 0 0 12px var(--color-heal), 0 0 24px rgba(68, 255, 136, 0.4);
  transform: scale(1.06);
  animation: targetFlashGreen 0.6s ease-in-out infinite;
}

:deep(.combatant-card.target-highlight-darkyellow) {
  border-color: var(--secondary-gold);
  box-shadow: 0 0 12px var(--secondary-gold), 0 0 24px rgba(201, 162, 39, 0.4);
  transform: scale(1.06);
  animation: targetFlashDarkYellow 0.6s ease-in-out infinite;
}

:deep(.combatant-card.target-highlight-splash) {
  border-color: var(--class-druid);
  box-shadow: 0 0 12px var(--class-druid), 0 0 24px rgba(255, 125, 10, 0.4);
  transform: scale(1.04);
  animation: targetFlashSplash 0.6s ease-in-out infinite;
}

@keyframes targetPulse {
  0%, 100% { box-shadow: 0 0 12px var(--color-friendly); }
  50% { box-shadow: 0 0 24px var(--color-friendly), 0 0 36px rgba(0, 255, 136, 0.3); }
}

@keyframes actingPulseGreen {
  0%, 100% { box-shadow: 0 0 12px #44ff88, 0 0 24px rgba(68, 255, 136, 0.3); }
  50% { box-shadow: 0 0 20px #44ff88, 0 0 36px rgba(68, 255, 136, 0.5); }
}

@keyframes actingPulseDarkYellow {
  0%, 100% { box-shadow: 0 0 12px var(--secondary-gold), 0 0 24px rgba(201, 162, 39, 0.3); }
  50% { box-shadow: 0 0 20px var(--secondary-gold), 0 0 36px rgba(201, 162, 39, 0.5); }
}

@keyframes targetFlashRed {
  0%, 100% { box-shadow: 0 0 12px var(--color-damage), 0 0 24px rgba(255, 68, 68, 0.4); border-color: var(--color-damage); }
  50% { box-shadow: 0 0 20px var(--color-damage), 0 0 32px rgba(255, 68, 68, 0.6); border-color: var(--color-damage); }
}

@keyframes targetFlashGreen {
  0%, 100% { box-shadow: 0 0 12px var(--color-heal), 0 0 24px rgba(68, 255, 136, 0.4); border-color: var(--color-heal); }
  50% { box-shadow: 0 0 20px var(--color-heal), 0 0 32px rgba(68, 255, 136, 0.6); border-color: var(--color-heal); }
}

@keyframes targetFlashDarkYellow {
  0%, 100% { box-shadow: 0 0 12px var(--secondary-gold), 0 0 24px rgba(201, 162, 39, 0.4); border-color: var(--secondary-gold); }
  50% { box-shadow: 0 0 20px var(--secondary-gold), 0 0 32px rgba(201, 162, 39, 0.6); border-color: var(--secondary-gold); }
}

@keyframes targetFlashSplash {
  0%, 100% { box-shadow: 0 0 12px var(--class-druid), 0 0 24px rgba(255, 125, 10, 0.4); border-color: var(--class-druid); }
  50% { box-shadow: 0 0 20px var(--class-druid), 0 0 32px rgba(255, 125, 10, 0.6); border-color: var(--class-druid); }
}

@keyframes splashPreviewPulse {
  0%, 100% { box-shadow: 0 0 12px var(--class-druid); }
  50% { box-shadow: 0 0 20px var(--class-druid), 0 0 32px rgba(255, 125, 10, 0.3); }
}

@keyframes plannedPrimaryPulse {
  0%, 100% { box-shadow: 0 0 12px var(--color-damage), 0 0 24px rgba(255, 68, 68, 0.4); border-color: var(--color-damage); }
  50% { box-shadow: 0 0 20px var(--color-damage), 0 0 32px rgba(255, 68, 68, 0.6); border-color: var(--color-damage); }
}

.acting-unit-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: var(--bg-primary);
  border: 2px solid var(--border-primary);
  border-radius: 4px;
  font-size: var(--fs-xs);
  min-height: 32px;
}

.acting-name {
  color: var(--primary-gold);
  font-weight: bold;
}

.action-points {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ap-dot {
  color: var(--primary-gold);
  font-size: var(--fs-xs);
}

.ap-dot.used {
  color: var(--border-primary);
}

/* 规划阶段提示标签 */
.planned-action-tag {
  color: var(--color-heal);
  font-size: var(--fs-xs);
}

.planned-action-tag.not-ready {
  color: var(--class-druid); /* 橙色提示 */
  animation: notReadyPulse 1.5s ease-in-out infinite;
}

@keyframes notReadyPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* 开始结算按钮 */
.execute-btn {
  border-color: var(--text-muted) !important;
  opacity: 0.5;
  cursor: not-allowed;
}

.execute-btn.ready {
  border-color: var(--color-heal) !important;
  background: rgba(68, 255, 136, 0.15) !important;
  opacity: 1;
  cursor: pointer;
  animation: executeReady 1.2s ease-in-out infinite;
}

.execute-btn.ready:hover {
  background: rgba(68, 255, 136, 0.3) !important;
  box-shadow: 0 0 12px rgba(68, 255, 136, 0.4);
}

@keyframes executeReady {
  0%, 100% { box-shadow: 0 0 6px rgba(68, 255, 136, 0.2); }
  50% { box-shadow: 0 0 14px rgba(68, 255, 136, 0.5); }
}

/* 操作按钮 */
.combat-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-bottom: 0;
  margin-top: auto;
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
  background: rgba(74, 222, 128, 0.15) !important;
  color: var(--color-buff) !important;
  animation: autoPulse 1.5s ease-in-out infinite;
}

@keyframes autoPulse {
  0%, 100% { box-shadow: 0 0 4px rgba(74, 222, 128, 0.2); }
  50% { box-shadow: 0 0 12px rgba(74, 222, 128, 0.5); }
}

/* ==================== 短暂休息界面 ==================== */
.rest-phase-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.rest-phase-dialog {
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
  border: 2px solid rgba(255, 215, 0, 0.4);
  padding: 24px;
  min-width: 340px;
  max-width: 460px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(255, 215, 0, 0.1);
}

.rest-phase-title {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  font-weight: bold;
  text-align: center;
  margin-bottom: 6px;
}

.rest-phase-subtitle {
  font-size: var(--fs-xs);
  color: var(--secondary-gold);
  text-align: center;
  margin-bottom: 16px;
}

.rest-party-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.rest-member-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.1);
}

.rest-member-name {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  min-width: 70px;
  white-space: nowrap;
}

.rest-member-name.dead {
  color: var(--text-muted);
  text-decoration: line-through;
}

.rest-hp-bar-bg,
.rest-resource-bar-bg {
  flex: 1;
  height: 14px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(100, 100, 100, 0.3);
  position: relative;
  min-width: 80px;
}

.rest-hp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b0000, var(--color-hp));
  transition: width 0.3s ease;
}

.rest-resource-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #000066, var(--color-mana));
  transition: width 0.3s ease;
}

.rest-hp-text,
.rest-resource-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--fs-xs);
  color: var(--text-primary);
  text-shadow: 0 0 2px #000;
  white-space: nowrap;
}

.rest-phase-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.rest-btn {
  font-size: var(--fs-xs);
  padding: 6px 14px;
  min-width: 90px;
}

.rest-heal-btn {
  background: rgba(68, 255, 136, 0.15);
  border: 1px solid rgba(68, 255, 136, 0.4);
  color: var(--color-heal);
}

.rest-heal-btn:hover:not(:disabled) {
  background: rgba(68, 255, 136, 0.3);
  box-shadow: 0 0 10px rgba(68, 255, 136, 0.3);
}

.rest-heal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rest-continue-btn {
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid rgba(255, 215, 0, 0.4);
  color: var(--primary-gold);
}

.rest-continue-btn:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.rest-complete-btn {
  background: rgba(100, 200, 255, 0.15);
  border: 1px solid rgba(100, 200, 255, 0.4);
  color: var(--class-mage);
}

.rest-complete-btn:hover:not(:disabled) {
  background: rgba(100, 200, 255, 0.3);
  box-shadow: 0 0 10px rgba(100, 200, 255, 0.3);
}

.rest-exit-btn {
  background: rgba(139, 0, 0, 0.3);
  border: 1px solid rgba(248, 113, 113, 0.4); /* --color-debuff */
  color: var(--color-debuff);
}

.rest-exit-btn:hover:not(:disabled) {
  background: rgba(139, 0, 0, 0.5);
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
}

.rest-exit-btn:disabled,
.rest-continue-btn:disabled,
.rest-complete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==================== 多人模式 UI ==================== */

.multiplayer-auto-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background: rgba(255, 200, 0, 0.15);
  border: 1px solid rgba(255, 200, 0, 0.3);
  border-radius: 4px;
  font-size: var(--fs-sm);
  color: #ffd700;
  margin: 4px 0;
}

.mp-status {
  font-size: var(--fs-xs);
  color: rgba(255, 255, 255, 0.7);
}

/* 聊天侧栏 */
.mp-chat-sidebar {
  position: fixed;
  right: 4px;
  bottom: 60px;
  width: 240px;
  z-index: 50;
  transition: all 0.2s;
}

.mp-chat-sidebar.collapsed {
  width: auto;
}

.mp-chat-toggle {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 200, 0, 0.3);
  color: #ffd700;
  padding: 4px 10px;
  font-size: var(--fs-xs);
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  width: 100%;
}

.mp-chat-body {
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid rgba(255, 200, 0, 0.2);
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  display: flex;
  flex-direction: column;
}

.mp-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 4px 6px;
  max-height: 150px;
  font-size: var(--fs-xs);
}

.mp-chat-msg {
  margin-bottom: 2px;
  line-height: 1.4;
}

.mp-chat-sender {
  color: #ffd700;
  margin-right: 4px;
}

.mp-chat-text {
  color: rgba(255, 255, 255, 0.8);
}

.mp-chat-input-row {
  display: flex;
  border-top: 1px solid rgba(255, 200, 0, 0.2);
}

.mp-chat-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  padding: 4px 6px;
  font-size: var(--fs-xs);
  outline: none;
}

.mp-chat-send {
  background: rgba(255, 200, 0, 0.2);
  border: none;
  color: #ffd700;
  padding: 4px 8px;
  font-size: var(--fs-xs);
  cursor: pointer;
}

.mp-chat-send:hover {
  background: rgba(255, 200, 0, 0.4);
}

/* 掉落弹窗 */
.loot-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loot-modal-dialog {
  background: var(--bg-primary);
  border: 2px solid #ffd700;
  border-radius: 8px;
  padding: 20px;
  min-width: 280px;
  max-width: 400px;
}

.loot-modal-title {
  text-align: center;
  font-size: var(--fs-lg);
  color: #ffd700;
  margin-bottom: 12px;
}

.loot-modal-items {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.loot-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.loot-item-icon {
  font-size: 1.2em;
}

.loot-item-name {
  flex: 1;
  color: var(--text-primary);
}

.loot-item-qty {
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--fs-sm);
}

.loot-empty {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 20px;
}

.loot-modal-actions {
  text-align: center;
}

.loot-confirm-btn {
  background: rgba(255, 200, 0, 0.2);
  border: 1px solid #ffd700;
  color: #ffd700;
  padding: 6px 24px;
  cursor: pointer;
}

.loot-confirm-btn:hover {
  background: rgba(255, 200, 0, 0.4);
}

</style>
