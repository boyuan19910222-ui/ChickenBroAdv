<template>
  <aside class="system-panel pixel-panel">
    <div class="system-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.name }}
      </button>
    </div>

    <div class="tab-content">
      <!-- ==================== 装备面板（WoW布局） ==================== -->
      <div v-if="activeTab === 'equipment'" class="equipment-tab">
        <div class="equipment-wow-layout">
          <!-- 左列：护甲 -->
          <div class="equip-col equip-col-left">
            <div
              v-for="slotId in leftSlots"
              :key="slotId"
              class="equip-slot"
              :class="equipSlotClasses(slotId)"
              :style="slotBorderStyle(slotId)"
              title=""
              @mouseenter="onEquipSlotHover(slotId, $event)"
              @mouseleave="onEquipSlotLeave"
              @contextmenu.prevent="onEquipSlotRightClick(slotId)"
            >
              <span class="slot-icon">{{ EQUIPMENT_SLOTS[slotId].icon }}</span>
              <span
                v-if="getEquipment(slotId)"
                class="slot-name"
                :style="{ color: getItemQualityColor(getEquipment(slotId)) }"
              >{{ getEquipment(slotId).name }}</span>
              <span v-else class="slot-name slot-empty-label">{{ EQUIPMENT_SLOTS[slotId].label }}</span>
            </div>
          </div>

          <!-- 中列：角色信息 + 总护甲 -->
          <div class="equip-col equip-col-center">
            <div class="char-portrait">
              <div class="char-class-icon"><PixelIcon :src="player?.icon || ''" :size="48" fallback="🧑" /></div>
              <div class="char-name">{{ player?.name || '冒险者' }}</div>
              <div class="char-level">Lv.{{ player?.level || 1 }}</div>
            </div>
            <div class="armor-stat">
              <span class="armor-label">⚔️ 装备等级</span>
              <span class="armor-value">{{ avgItemLevelDisplay }}</span>
            </div>
          </div>

          <!-- 右列：饰品 -->
          <div class="equip-col equip-col-right">
            <div
              v-for="slotId in rightSlots"
              :key="slotId"
              class="equip-slot"
              :class="equipSlotClasses(slotId)"
              :style="slotBorderStyle(slotId)"
              title=""
              @mouseenter="onEquipSlotHover(slotId, $event)"
              @mouseleave="onEquipSlotLeave"
              @contextmenu.prevent="onEquipSlotRightClick(slotId)"
            >
              <span class="slot-icon">{{ EQUIPMENT_SLOTS[slotId].icon }}</span>
              <span
                v-if="getEquipment(slotId)"
                class="slot-name"
                :style="{ color: getItemQualityColor(getEquipment(slotId)) }"
              >{{ getEquipment(slotId).name }}</span>
              <span v-else class="slot-name slot-empty-label">{{ EQUIPMENT_SLOTS[slotId].label }}</span>
            </div>
          </div>
        </div>

        <!-- 底部：武器栏 -->
        <div class="equip-weapon-row">
          <div
            v-for="slotId in weaponSlots"
            :key="slotId"
            class="equip-slot weapon-slot"
            :class="equipSlotClasses(slotId)"
            :style="slotBorderStyle(slotId)"
            title=""
            @mouseenter="onEquipSlotHover(slotId, $event)"
            @mouseleave="onEquipSlotLeave"
            @contextmenu.prevent="onEquipSlotRightClick(slotId)"
          >
            <span class="slot-icon">{{ EQUIPMENT_SLOTS[slotId].icon }}</span>
            <span
              v-if="getEquipment(slotId)"
              class="slot-name"
              :style="{ color: getItemQualityColor(getEquipment(slotId)) }"
            >{{ getEquipment(slotId).name }}</span>
            <span v-else class="slot-name slot-empty-label">{{ EQUIPMENT_SLOTS[slotId].label }}</span>
            <!-- 双手武器锁定副手图标 -->
            <span v-if="slotId === 'offHand' && isOffHandLocked" class="lock-icon">🔒</span>
          </div>
        </div>

        <!-- 套装效果 -->
        <div v-if="activeSetBonuses.length > 0" class="set-bonus-section">
          <div class="section-title">套装效果</div>
          <div v-for="set in activeSetBonuses" :key="set.setId" class="set-info">
            <span class="set-name">{{ set.setName }} ({{ set.equippedCount }}/{{ set.totalPieces }})</span>
            <div v-for="bonus in set.activeBonuses" :key="bonus.name" class="set-bonus active">
              {{ bonus.name }}: {{ bonus.description }}
            </div>
          </div>
        </div>

      </div>

      <!-- ==================== 背包（40格） ==================== -->
      <div v-if="activeTab === 'inventory'" class="inventory-tab">
        <div class="inventory-grid">
          <div
            v-for="(item, idx) in inventorySlots"
            :key="idx"
            class="inv-slot"
            :class="{
              empty: !item,
              equipment: item?.type === 'equipment',
            }"
            :style="item?.type === 'equipment' ? invSlotBorderStyle(item) : {}"
            title=""
            @mouseenter="onInvSlotHover(idx, $event)"
            @mouseleave="onInvSlotLeave"
            @contextmenu.prevent="onInvSlotRightClick(idx)"
          >
            <template v-if="item">
              <span class="inv-item-icon">{{ item.emoji || '📦' }}</span>
              <span
                class="inv-item-name"
                :style="{ color: item.type === 'equipment' ? getItemQualityColor(item) : 'var(--text-primary)' }"
              >{{ item.name }}</span>
            </template>
          </div>
        </div>
        <div class="inv-count">{{ inventoryCount }}/{{ BAG_CAPACITY }}</div>
        <div class="inv-actions">
          <button class="pixel-btn btn-small btn-inv-action" @click="doRepairAll" title="一键修理全部装备">
            🔧 一键修理 ({{ totalRepairCost }}G)
          </button>
          <button class="pixel-btn btn-small btn-inv-action btn-sell-junk" @click="doSellAllJunk" title="一键出售所有白色和灰色品质物品">
            💰 一键出售
          </button>
        </div>
      </div>

      <!-- ==================== 技能 ==================== -->
      <div v-if="activeTab === 'skills'" class="skills-list">
        <div v-for="skillId in player?.skills || []" :key="skillId" class="skill-item">
          <span class="skill-icon">
            <img v-if="getSkillIconUrl(skillId)" :src="getSkillIconUrl(skillId)" class="skill-icon-img" :alt="getSkillName(skillId)" />
            <span v-else>{{ getSkillIcon(skillId) }}</span>
          </span>
          <div class="skill-info">
            <div class="skill-name">{{ getSkillName(skillId) }}</div>
            <div class="skill-desc">{{ getSkillDesc(skillId) }}</div>
          </div>
        </div>
      </div>

      <!-- ==================== 任务 ==================== -->
      <div v-if="activeTab === 'quests'" class="quests-tab">
        <div class="quest-sub-tabs">
          <button
            v-for="st in questSubTabs"
            :key="st.id"
            class="quest-sub-tab"
            :class="{ active: questSubTab === st.id }"
            @click="questSubTab = st.id"
          >
            {{ st.icon }} {{ st.name }}
            <span v-if="st.count > 0" class="quest-count">{{ st.count }}</span>
          </button>
        </div>

        <!-- 可接取任务列表 -->
        <div v-if="questSubTab === 'available'" class="quest-list">
          <div v-if="availableQuests.length === 0" class="empty-text">暂无可接取的任务</div>
          <div
            v-for="quest in availableQuests"
            :key="quest.id"
            class="quest-item quest-available"
            :class="{ selected: selectedQuestId === quest.id }"
            @click="selectedQuestId = selectedQuestId === quest.id ? null : quest.id"
          >
            <div class="quest-header">
              <span class="quest-type-badge" :style="{ color: questTypeColor(quest) }">
                {{ questTypeEmoji(quest) }}
              </span>
              <span class="quest-name">{{ quest.name }}</span>
              <span class="quest-level">Lv{{ quest.requiredLevel }}</span>
            </div>
            <div v-if="selectedQuestId === quest.id" class="quest-details">
              <div class="quest-desc">{{ quest.description }}</div>
              <div class="quest-objectives-preview">
                <div v-for="(obj, i) in quest.objectives" :key="i" class="quest-obj-text">
                  ○ {{ obj.description }}
                </div>
              </div>
              <div class="quest-reward-line">
                <span v-if="quest.rewards.exp">✨{{ quest.rewards.exp }}经验</span>
                <span v-if="quest.rewards.gold">💰{{ quest.rewards.gold }}金币</span>
              </div>
              <button class="pixel-btn btn-small btn-accept" @click.stop="doAcceptQuest(quest.id)">
                接取任务
              </button>
            </div>
          </div>
        </div>

        <!-- 进行中任务列表 -->
        <div v-if="questSubTab === 'active'" class="quest-list">
          <div v-if="activeQuests.length === 0" class="empty-text">没有进行中的任务</div>
          <div
            v-for="aq in activeQuests"
            :key="aq.questId"
            class="quest-item quest-active"
            :class="{ 'quest-complete': aq.isComplete, selected: selectedQuestId === aq.questId }"
            @click="selectedQuestId = selectedQuestId === aq.questId ? null : aq.questId"
          >
            <div class="quest-header">
              <span class="quest-type-badge" :style="{ color: aq.typeConfig?.color || '#ccc' }">
                {{ aq.typeConfig?.emoji || '📜' }}
              </span>
              <span class="quest-name">{{ aq.questDef.name }}</span>
              <span v-if="aq.isComplete" class="quest-complete-badge">✅</span>
            </div>
            <div class="quest-objectives">
              <div
                v-for="obj in aq.objectives"
                :key="obj.index"
                class="quest-obj"
                :class="{ done: obj.completed }"
              >
                <span class="obj-check">{{ obj.completed ? '☑' : '☐' }}</span>
                <span class="obj-text">{{ getObjText(obj, aq.questDef) }}</span>
                <div v-if="!obj.completed && obj.target > 1" class="obj-progress-bar">
                  <div class="obj-progress-fill" :style="{ width: (obj.current / obj.target * 100) + '%' }"></div>
                </div>
              </div>
            </div>
            <div v-if="selectedQuestId === aq.questId" class="quest-details">
              <div class="quest-hint">💡 {{ aq.questDef.hint }}</div>
              <div class="quest-reward-line">
                <span v-if="aq.questDef.rewards.exp">✨{{ aq.questDef.rewards.exp }}经验</span>
                <span v-if="aq.questDef.rewards.gold">💰{{ aq.questDef.rewards.gold }}金币</span>
              </div>
              <div class="quest-action-btns">
                <button
                  v-if="aq.isComplete"
                  class="pixel-btn btn-small btn-turnin"
                  @click.stop="doTurnInQuest(aq.questId)"
                >
                  交付任务
                </button>
                <button
                  v-if="aq.questDef.type !== 'main'"
                  class="pixel-btn btn-small btn-abandon"
                  @click.stop="doAbandonQuest(aq.questId)"
                >
                  放弃
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 已完成任务 -->
        <div v-if="questSubTab === 'completed'" class="quest-list">
          <div v-if="completedQuestList.length === 0" class="empty-text">尚未完成任何任务</div>
          <div
            v-for="quest in completedQuestList"
            :key="quest.id"
            class="quest-item quest-done"
          >
            <div class="quest-header">
              <span class="quest-type-badge" :style="{ color: questTypeColor(quest) }">
                {{ questTypeEmoji(quest) }}
              </span>
              <span class="quest-name">{{ quest.name }}</span>
              <span class="quest-done-badge">✔️</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ==================== 悬浮 Tooltip (Teleport to body) ==================== -->
    <Teleport to="body">
      <div
        v-if="hoverTooltip.visible"
        class="item-hover-tooltip"
        :style="{ left: hoverTooltip.x + 'px', top: hoverTooltip.y + 'px', borderColor: getItemQualityColor(hoverTooltip.item) }"
        @mouseenter="onTooltipEnter"
        @mouseleave="onTooltipLeave"
      >
        <ItemTooltip :item="hoverTooltip.item" :compare-to="hoverTooltip.compareTo" />
        <!-- 对比当前装备 -->
        <div v-if="hoverTooltip.compareTo" class="comparison-tooltip">
          <div class="comparison-header">当前装备</div>
          <ItemTooltip :item="hoverTooltip.compareTo" :compare-to="hoverTooltip.item" />
        </div>
        <!-- 操作按钮 -->
        <div class="hover-tooltip-actions">
          <button
            v-if="hoverTooltip.mode === 'equip' && hoverTooltip.slotId"
            class="pixel-btn btn-small btn-unequip"
            @click="doUnequip(hoverTooltip.slotId)"
          >卸下装备</button>
          <button
            v-if="hoverTooltip.mode === 'inv' && hoverTooltip.item?.type === 'equipment'"
            class="pixel-btn btn-small btn-equip"
            @click="doEquipFromInvByItem(hoverTooltip.item)"
          >穿戴装备</button>
          <button
            v-if="hoverTooltip.mode === 'inv' && hoverTooltip.item?.sellPrice"
            class="pixel-btn btn-small btn-sell"
            @click="doSellItemByItem(hoverTooltip.item)"
          >出售 ({{ hoverTooltip.item.sellPrice }}G)</button>
        </div>
      </div>
    </Teleport>
    <!-- 槽位选择弹窗 -->
    <Teleport to="body">
      <div v-if="slotChoiceDialog.visible" class="slot-choice-overlay" @click.self="slotChoiceDialog.visible = false">
        <div class="slot-choice-dialog pixel-panel">
          <div class="slot-choice-title">选择装备槽位</div>
          <div class="slot-choice-item-name">{{ slotChoiceDialog.item?.name }}</div>
          <div class="slot-choice-options">
            <button
              v-for="s in slotChoiceDialog.slots"
              :key="s.id"
              class="pixel-btn slot-choice-btn"
              @click="onSlotChoiceConfirm(s.id)"
            >
              <span class="slot-choice-label">{{ s.label }}</span>
              <span v-if="s.current" class="slot-choice-current">替换: {{ s.current.name }}</span>
              <span v-else class="slot-choice-current slot-empty">空槽位</span>
            </button>
          </div>
          <button class="pixel-btn btn-small slot-choice-cancel" @click="slotChoiceDialog.visible = false">取消</button>
        </div>
      </div>
    </Teleport>
  </aside>
</template>

<script setup>
import { ref, reactive, computed, defineComponent, h, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore.js'
import { GameData } from '@/data/GameData.js'
import { EQUIPMENT_SLOTS, SLOT_IDS, QualityConfig, SetBonuses, DurabilityConfig, BAG_CAPACITY, WeaponSlotMap, INNATE_DUAL_WIELD_CLASSES } from '@/data/EquipmentData.js'
import { QuestDatabase, QuestTypeConfig, QuestType, ObjectiveType } from '@/data/QuestData.js'
import PixelIcon from '@/components/common/PixelIcon.vue'

const gameStore = useGameStore()
const player = computed(() => gameStore.player)
const activeTab = ref('equipment')

// 键盘快捷键标签切换
let switchTabHandler = null
onMounted(() => {
  const eventBus = gameStore.eventBus
  if (eventBus) {
    switchTabHandler = (tabId) => {
      const validTabs = ['equipment', 'inventory', 'quests', 'skills']
      if (validTabs.includes(tabId)) activeTab.value = tabId
    }
    eventBus.on('ui:switchTab', switchTabHandler)
  }
})
onUnmounted(() => {
  const eventBus = gameStore.eventBus
  if (eventBus && switchTabHandler) {
    eventBus.off('ui:switchTab', switchTabHandler)
  }
})
const selectedQuestId = ref(null)
const questSubTab = ref('active')

// ==================== Hover Tooltip 状态 ====================
const hoverTooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  item: null,
  compareTo: null,
  mode: '', // 'equip' | 'inv'
  slotId: null,
  invIndex: null,
})
let hoverTimer = null
let isOverTooltip = false

const tabs = [
  { id: 'equipment', name: '装备', icon: '🛡️' },
  { id: 'inventory', name: '背包', icon: '🎒' },
  { id: 'quests', name: '任务', icon: '📜' },
  { id: 'skills', name: '技能', icon: '⚡' },
]

// ==================== WoW 布局槽位分组（Task 6.1）====================
// 左列（7格）：头→项链→肩→胸→手腕→手→披风
const leftSlots = ['head', 'neck', 'shoulders', 'chest', 'wrists', 'hands', 'back']
// 右列（7格）：腰→腿→脚→戒指1→戒指2→饰品1→饰品2
const rightSlots = ['waist', 'legs', 'feet', 'finger1', 'finger2', 'trinket1', 'trinket2']
// 底部：主手 + 副手
const weaponSlots = ['mainHand', 'offHand']

// ==================== 装备面板 ====================

function getEquipment(slotId) {
  return player.value?.equipment?.[slotId] || null
}

function getItemQualityColor(item) {
  if (!item?.quality) return '#9d9d9d'
  return QualityConfig[item.quality]?.color || '#9d9d9d'
}

function isItemBroken(item) {
  return item?.durability && item.durability.current <= 0
}

function durabilityPercent(item) {
  if (!item?.durability || !item.durability.max) return 100
  return Math.round((item.durability.current / item.durability.max) * 100)
}

function durabilityClass(item) {
  const pct = durabilityPercent(item) / 100
  if (pct <= 0) return 'broken'
  if (pct <= DurabilityConfig.warningThreshold) return 'critical'
  if (pct <= 0.5) return 'warning'
  return 'good'
}

// 品质边框颜色（Task 6.7）
function slotBorderStyle(slotId) {
  const item = getEquipment(slotId)
  if (!item?.quality) return {}
  const color = QualityConfig[item.quality]?.color
  if (!color || item.quality === 'common') return {}
  return { borderColor: color, boxShadow: `0 0 4px ${color}44` }
}

function invSlotBorderStyle(item) {
  if (!item?.quality) return {}
  const color = QualityConfig[item.quality]?.color
  if (!color || item.quality === 'common') return {}
  return { borderColor: color, boxShadow: `0 0 3px ${color}44` }
}

function equipSlotClasses(slotId) {
  return {
    empty: !getEquipment(slotId),
    broken: isItemBroken(getEquipment(slotId)),
    locked: slotId === 'offHand' && isOffHandLocked.value,
  }
}

// 双手武器锁定副手（Task 6.4）
const isOffHandLocked = computed(() => {
  const mainHand = player.value?.equipment?.mainHand
  return mainHand && mainHand.weaponHand === 'two_hand'
})

// 平均装备等级
const avgItemLevelDisplay = computed(() => {
  const p = player.value
  if (!p?.equipment) return 0
  let total = 0
  let count = 0
  for (const slotId of SLOT_IDS) {
    const item = p.equipment[slotId]
    if (item && item.itemLevel) {
      total += item.itemLevel
      count++
    }
  }
  if (count === 0) return 0
  return Math.round(total / count)
})

// ==================== Hover Tooltip 逻辑 ====================

function showTooltip(item, event, mode, extra = {}) {
  if (!item) return
  const rect = event.currentTarget.getBoundingClientRect()
  // tooltip 显示在目标左侧（因为装备栏在右侧面板）
  hoverTooltip.x = rect.left - 8
  hoverTooltip.y = rect.top
  hoverTooltip.item = item
  hoverTooltip.mode = mode
  hoverTooltip.slotId = extra.slotId || null
  hoverTooltip.invIndex = extra.invIndex ?? null
  hoverTooltip.compareTo = extra.compareTo || null
  hoverTooltip.visible = true
}

function hideTooltip() {
  hoverTimer = setTimeout(() => {
    if (!isOverTooltip) {
      hoverTooltip.visible = false
      hoverTooltip.item = null
      hoverTooltip.compareTo = null
    }
  }, 100)
}

function onTooltipEnter() {
  isOverTooltip = true
  clearTimeout(hoverTimer)
}

function onTooltipLeave() {
  isOverTooltip = false
  hideTooltip()
}

// 装备槽 hover
function onEquipSlotHover(slotId, event) {
  clearTimeout(hoverTimer)
  isOverTooltip = false
  const item = getEquipment(slotId)
  if (!item) return
  showTooltip(item, event, 'equip', { slotId })
}

function onEquipSlotLeave() {
  hideTooltip()
}

// 背包槽 hover
function onInvSlotHover(idx, event) {
  clearTimeout(hoverTimer)
  isOverTooltip = false
  const item = inventorySlots.value[idx]
  if (!item) return
  // 如果是装备类型，找到对比装备
  let compareTo = null
  if (item.type === 'equipment') {
    const targetSlot = getTargetSlot(item)
    if (targetSlot) {
      compareTo = player.value?.equipment?.[targetSlot] || null
    }
  }
  showTooltip(item, event, 'inv', { invIndex: idx, compareTo })
}

function onInvSlotLeave() {
  hideTooltip()
}

// 右键装备槽 → 卸下（Task 6.2）
function onEquipSlotRightClick(slotId) {
  if (getEquipment(slotId)) {
    doUnequip(slotId)
  }
}

function doUnequip(slotId) {
  const equipSystem = gameStore.equipmentSystem
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!equipSystem || !enginePlayer) return

  const result = equipSystem.unequipItem(enginePlayer, slotId)
  if (!result.success) {
    gameStore.addLog(`❌ ${result.reason}`, 'system')
    return
  }

  gameStore.addLog(`🛡️ 卸下了 ${result.unequippedItem.name}`, 'system')
  hoverTooltip.visible = false
  gameStore.syncFromEngine()
}

// 套装效果
const activeSetBonuses = computed(() => {
  const equipSystem = gameStore.equipmentSystem
  const p = player.value
  if (!equipSystem || !p) return []
  return equipSystem.getActiveSetBonuses(p)
})

// 修理
const totalRepairCost = computed(() => {
  const equipSystem = gameStore.equipmentSystem
  const p = player.value
  if (!equipSystem || !p) return 0
  let cost = 0
  for (const slotId of SLOT_IDS) {
    const item = p.equipment?.[slotId]
    if (item) cost += equipSystem.getRepairCost(item)
  }
  return cost
})

function doRepairAll() {
  const equipSystem = gameStore.equipmentSystem
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!equipSystem || !enginePlayer) return

  const result = equipSystem.repairAll(enginePlayer)
  if (!result.success) {
    gameStore.addLog(`❌ ${result.reason}`, 'system')
    return
  }
  gameStore.addLog(`🔧 修理了 ${result.repairedCount} 件装备`, 'system')
  gameStore.addLootLog(`💸 -${result.totalCost} 金币（修理装备）`)
  gameStore.syncFromEngine()
}

function doSellAllJunk() {
  const equipSystem = gameStore.equipmentSystem
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!equipSystem || !enginePlayer) return

  const junkItems = (enginePlayer.inventory || []).filter(
    item => item && item.sellPrice && (item.quality === 'poor' || item.quality === 'common')
  )

  if (junkItems.length === 0) {
    gameStore.addLog('📦 背包中没有可出售的灰色/白色物品', 'system')
    return
  }

  let totalGold = 0
  let soldCount = 0
  for (const item of [...junkItems]) {
    const result = equipSystem.sellItem(enginePlayer, item)
    if (result.success) {
      totalGold += result.gold
      soldCount++
    }
  }

  gameStore.addLog(`💰 一键出售了 ${soldCount} 件物品，获得 ${totalGold} 金币`, 'system')
  gameStore.syncFromEngine()
}

// ==================== 背包面板（40格 Task 6.8）====================

const inventorySlots = computed(() => {
  const items = player.value?.inventory || []
  const slots = new Array(BAG_CAPACITY).fill(null)
  items.forEach((item, i) => { if (i < BAG_CAPACITY) slots[i] = item })
  return slots
})

const inventoryCount = computed(() => {
  return (player.value?.inventory || []).length
})

/**
 * 智能选择双槽位（戒指/饰品）
 * 返回: 具体槽位名 | null（需要玩家选择）
 */
function _pickDualSlot(slot1, slot2) {
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!enginePlayer) return slot1
  const eq = enginePlayer.equipment || {}
  if (!eq[slot1]) return slot1
  if (!eq[slot2]) return slot2
  return null // 两个都满，需要选择
}

function getTargetSlot(item) {
  if (!item) return null
  if (item.slot) {
    // 戒指双槽位智能选择
    if (item.slot === 'finger1' || item.slot === 'finger2') {
      return _pickDualSlot('finger1', 'finger2')
    }
    // 饰品双槽位智能选择
    if (item.slot === 'trinket1' || item.slot === 'trinket2') {
      return _pickDualSlot('trinket1', 'trinket2')
    }
    return item.slot
  }
  if (item.weaponType) {
    // 盾牌固定副手
    if (item.weaponType === 'shield') return 'offHand'
    // 单手武器双持逻辑
    if (item.weaponHand === 'one_hand') {
      const enginePlayer = gameStore.engine?.stateManager?.get('player')
      if (enginePlayer) {
        const mainHandItem = enginePlayer.equipment?.mainHand
        const offHandItem = enginePlayer.equipment?.offHand
        const allowedSlots = WeaponSlotMap[item.weaponType] || ['mainHand']
        const canDual = INNATE_DUAL_WIELD_CLASSES.includes(enginePlayer.class) ||
          (enginePlayer.class === 'shaman' && enginePlayer.talents?.enhancement?.dualWield > 0)
        if (canDual && allowedSlots.includes('offHand')) {
          // 主手空 → 主手
          if (!mainHandItem) return 'mainHand'
          // 副手空 → 副手
          if (!offHandItem) return 'offHand'
          // 都满 → 弹窗选择
          return null
        }
      }
    }
    return 'mainHand'
  }
  return null
}

// 右键背包装备 → 直接穿戴（Task 6.2）
function onInvSlotRightClick(idx) {
  const item = inventorySlots.value[idx]
  if (item && item.type === 'equipment') {
    doEquipFromInvByItem(item)
  }
}

// 槽位选择弹窗状态
const slotChoiceDialog = reactive({
  visible: false,
  item: null,
  slots: [],   // [{ id: 'finger1', label: '戒指1', current: item|null }, ...]
})

function showSlotChoice(item, slot1, slot2) {
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  const eq = enginePlayer?.equipment || {}
  const s1Info = EQUIPMENT_SLOTS[slot1]
  const s2Info = EQUIPMENT_SLOTS[slot2]
  slotChoiceDialog.item = item
  slotChoiceDialog.slots = [
    { id: slot1, label: s1Info?.label || slot1, current: eq[slot1] },
    { id: slot2, label: s2Info?.label || slot2, current: eq[slot2] },
  ]
  slotChoiceDialog.visible = true
}

function onSlotChoiceConfirm(slotId) {
  slotChoiceDialog.visible = false
  const item = slotChoiceDialog.item
  if (!item || !slotId) return
  _doEquipToSlot(item, slotId)
}

function _doEquipToSlot(item, targetSlot) {
  const equipSystem = gameStore.equipmentSystem
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!equipSystem || !enginePlayer) return

  const result = equipSystem.equipItem(enginePlayer, item, targetSlot)
  if (!result.success) {
    gameStore.addLog(`❌ ${result.reason}`, 'system')
    return
  }

  gameStore.addLog(`⚔️ 装备了 ${item.name}`, 'system')
  if (result.unequippedItem) {
    gameStore.addLog(`🔄 ${result.unequippedItem.name} 放入背包`, 'system')
  }
  hoverTooltip.visible = false
  gameStore.syncFromEngine()
}

function doEquipFromInvByItem(item) {
  if (!item || item.type !== 'equipment') return

  const equipSystem = gameStore.equipmentSystem
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!equipSystem || !enginePlayer) return

  const targetSlot = getTargetSlot(item)

  // null 表示双槽位都满，需要选择
  if (targetSlot === null) {
    const slot = item.slot
    if (slot === 'finger1' || slot === 'finger2') {
      showSlotChoice(item, 'finger1', 'finger2')
    } else if (slot === 'trinket1' || slot === 'trinket2') {
      showSlotChoice(item, 'trinket1', 'trinket2')
    } else if (item.weaponType && item.weaponHand === 'one_hand') {
      showSlotChoice(item, 'mainHand', 'offHand')
    }
    return
  }

  _doEquipToSlot(item, targetSlot)
}

function doSellItemByItem(item) {
  if (!item) return

  const equipSystem = gameStore.equipmentSystem
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!equipSystem || !enginePlayer) return

  const result = equipSystem.sellItem(enginePlayer, item)
  if (!result.success) {
    gameStore.addLog(`❌ ${result.reason}`, 'system')
    return
  }
  gameStore.addLog(`💰 出售 ${item.name}，获得 ${result.gold} 金币`, 'system')
  gameStore.addLootLog(`💰 +${result.gold} 金币（出售 ${item.name}）`)
  hoverTooltip.visible = false
  gameStore.syncFromEngine()
}

// ==================== 技能面板 ====================

function getSkillName(skillId) {
  return GameData.skills[skillId]?.name || skillId
}

function getSkillDesc(skillId) {
  return GameData.skills[skillId]?.description || ''
}

function getSkillIcon(skillId) {
  const skill = GameData.skills[skillId]
  if (!skill) return '❓'
  if (skill.heal) return '💚'
  if (skill.damage) return '⚔️'
  if (skill.effect?.type === 'buff') return '🛡️'
  if (skill.effect?.type === 'debuff') return '💀'
  return '✨'
}

function getSkillIconUrl(skillId) {
  return GameData.skills[skillId]?.icon || null
}

// ==================== 任务面板 ====================

const questSystem = computed(() => gameStore.questSystem)

const availableQuests = computed(() => {
  const qs = questSystem.value
  const p = player.value
  if (!qs || !p) return []
  return qs.getAvailableQuests(p)
})

const activeQuests = computed(() => {
  const qs = questSystem.value
  const p = player.value
  if (!qs || !p) return []
  return qs.getActiveQuestsWithDetails(p)
})

const completedQuestList = computed(() => {
  const qs = questSystem.value
  const p = player.value
  if (!qs || !p) return []
  return qs.getCompletedQuests(p)
})

const questSubTabs = computed(() => [
  { id: 'active', name: '进行中', icon: '📌', count: activeQuests.value.length },
  { id: 'available', name: '可接取', icon: '📋', count: availableQuests.value.length },
  { id: 'completed', name: '已完成', icon: '✅', count: completedQuestList.value.length },
])

function questTypeColor(quest) {
  return QuestTypeConfig[quest.type]?.color || '#ccc'
}

function questTypeEmoji(quest) {
  return QuestTypeConfig[quest.type]?.emoji || '📜'
}

function getObjText(objective, questDef) {
  const qs = questSystem.value
  if (!qs) return ''
  return qs.getObjectiveText(objective, questDef)
}

function doAcceptQuest(questId) {
  const qs = questSystem.value
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!qs || !enginePlayer) return

  const result = qs.acceptQuest(enginePlayer, questId)
  if (!result.success) {
    gameStore.addLog(`❌ ${result.reason}`, 'system')
    return
  }
  const quest = QuestDatabase[questId]
  gameStore.addLog(`📜 接取任务: ${quest?.name || questId}`, 'system')
  selectedQuestId.value = null
  gameStore.syncFromEngine()
}

function doTurnInQuest(questId) {
  const qs = questSystem.value
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!qs || !enginePlayer) return

  const result = qs.turnInQuest(enginePlayer, questId)
  if (!result.success) {
    gameStore.addLog(`❌ ${result.reason}`, 'system')
    return
  }
  const quest = QuestDatabase[questId]
  gameStore.addLog(`🎉 完成任务: ${quest?.name || questId}`, 'system')
  if (result.rewards) {
    if (result.rewards.exp) gameStore.addLog(`✨ 获得 ${result.rewards.exp} 经验`, 'system')
    if (result.rewards.gold) gameStore.addLootLog(`💰 +${result.rewards.gold} 金币（任务: ${quest?.name || questId}）`)
  }
  selectedQuestId.value = null
  gameStore.syncFromEngine()
}

function doAbandonQuest(questId) {
  const qs = questSystem.value
  const enginePlayer = gameStore.engine?.stateManager?.get('player')
  if (!qs || !enginePlayer) return

  const result = qs.abandonQuest(enginePlayer, questId)
  if (!result.success) {
    gameStore.addLog(`❌ ${result.reason}`, 'system')
    return
  }
  const quest = QuestDatabase[questId]
  gameStore.addLog(`🗑️ 放弃任务: ${quest?.name || questId}`, 'system')
  selectedQuestId.value = null
  gameStore.syncFromEngine()
}

// ==================== 物品提示组件（含对比 Task 6.5, 6.6）====================

const ItemTooltip = defineComponent({
  props: {
    item: Object,
    compareTo: Object, // 用于对比的物品
  },
  setup(props) {
    return () => {
      const item = props.item
      if (!item) return null

      const children = []
      const qualityColor = getItemQualityColor(item)
      const qualityName = QualityConfig[item.quality]?.name || ''

      // 名称
      children.push(h('div', { class: 'tooltip-name', style: { color: qualityColor } }, item.name))

      // 品质 + 类型
      if (qualityName || item.armorType || item.weaponType) {
        const parts = []
        if (qualityName) parts.push(qualityName)
        if (item.armorType) parts.push(armorTypeName(item.armorType))
        if (item.weaponType) parts.push(weaponTypeName(item.weaponType))
        if (item.weaponHand) parts.push(item.weaponHand === 'two_hand' ? '双手' : '单手')
        children.push(h('div', { class: 'tooltip-quality' }, parts.join(' · ')))
      }

      // 物品等级 + 需求等级
      if (item.itemLevel) {
        children.push(h('div', { class: 'tooltip-ilvl' }, `物品等级 ${item.itemLevel}`))
      }
      if (item.requiredLevel) {
        const meetsReq = !player.value || player.value.level >= item.requiredLevel
        children.push(h('div', {
          class: 'tooltip-req',
          style: { color: meetsReq ? 'var(--text-primary)' : 'var(--color-damage)' }
        }, `需要等级 ${item.requiredLevel}`))
      }

      // 武器伤害
      if (item.damage) {
        children.push(h('div', { class: 'tooltip-damage' }, `${item.damage.min} - ${item.damage.max} 伤害`))
      }

      // 护甲值（Task 6.5）
      if (item.armorValue) {
        children.push(h('div', { class: 'tooltip-armor' }, `${item.armorValue} 护甲`))
      }

      // 属性（含对比 Task 6.6）
      if (item.stats) {
        const compareItem = props.compareTo
        for (const [stat, value] of Object.entries(item.stats)) {
          let diffText = ''
          if (compareItem && compareItem.stats) {
            const compareVal = compareItem.stats[stat] || 0
            const diff = value - compareVal
            if (diff > 0) {
              diffText = ` (▲${diff})`
            } else if (diff < 0) {
              diffText = ` (▼${Math.abs(diff)})`
            }
          }
          const diffClass = diffText.includes('▲') ? 'stat-up' : diffText.includes('▼') ? 'stat-down' : ''
          children.push(h('div', { class: `tooltip-stat ${diffClass}` }, `+${value} ${statName(stat)}${diffText}`))
        }
        // 显示对比物品有但当前物品没有的属性
        if (compareItem && compareItem.stats) {
          for (const [stat, compareVal] of Object.entries(compareItem.stats)) {
            if (!item.stats[stat]) {
              children.push(h('div', { class: 'tooltip-stat stat-down' }, `+0 ${statName(stat)} (▼${compareVal})`))
            }
          }
        }
      }

      // 唯一
      if (item.unique) {
        children.push(h('div', { class: 'tooltip-unique' }, '唯一'))
      }

      // 套装
      if (item.setId && SetBonuses[item.setId]) {
        const setDef = SetBonuses[item.setId]
        children.push(h('div', { class: 'tooltip-set-name' }, setDef.name))
      }

      // 耐久度
      if (item.durability) {
        children.push(h('div', { class: 'tooltip-dura' },
          `耐久度 ${item.durability.current}/${item.durability.max}`
        ))
      }

      // 描述
      if (item.description) {
        children.push(h('div', { class: 'tooltip-desc' }, `"${item.description}"`))
      }

      // 出售价格
      if (item.sellPrice) {
        children.push(h('div', { class: 'tooltip-price' }, `出售价格: ${item.sellPrice}G`))
      }

      return h('div', { class: 'item-tooltip-content' }, children)
    }
  }
})

function statName(stat) {
  const names = {
    strength: '力量', agility: '敏捷', intellect: '智力',
    stamina: '耐力', spirit: '精神', health: '生命值',
    mana: '法力值',
  }
  return names[stat] || stat
}

function armorTypeName(type) {
  const names = { cloth: '布甲', leather: '皮甲', mail: '锁甲', plate: '板甲' }
  return names[type] || type
}

function weaponTypeName(type) {
  const names = {
    sword: '剑', axe: '斧', mace: '锤', dagger: '匕首', fist: '拳套',
    polearm: '长柄', staff: '法杖', wand: '魔杖', bow: '弓',
    crossbow: '弩', gun: '枪械', shield: '盾牌',
  }
  return names[type] || type
}
</script>

<style scoped>
.system-panel {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.system-tabs {
  display: flex;
  border-bottom: 2px solid var(--border-primary);
}

.tab-btn {
  flex: 1;
  padding: 8px 4px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-primary);
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  background: rgba(255, 215, 0, 0.1);
}

.tab-btn.active {
  border-bottom-color: var(--primary-gold);
  color: var(--primary-gold);
  background: rgba(255, 215, 0, 0.05);
}

.tab-content {
  flex: 1;
  padding: 6px;
  overflow-y: auto;
  min-height: 0;
}

.equipment-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ==================== WoW 装备布局 ==================== */

.equipment-wow-layout {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 4px;
  flex: 1;
  min-height: 0;
}

.equip-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.equip-col-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 2px 4px;
}

.char-portrait {
  text-align: center;
  margin-bottom: 2px;
}

.char-class-icon {
  font-size: 24px;
  margin-bottom: 1px;
}

.char-name {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  font-weight: bold;
}

.char-level {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  opacity: 0.7;
}

.armor-stat {
  text-align: center;
  font-size: var(--fs-xs);
  color: var(--class-mage);
}

.armor-label {
  display: block;
  margin-bottom: 1px;
}

.armor-value {
  font-size: var(--fs-xs);
  font-weight: bold;
  color: var(--class-mage);
}

.armor-reduction {
  display: block;
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}

.equip-weapon-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-top: 2px;
}

/* 装备格子 */
.equip-slot {
  background: var(--bg-primary);
  border: 2px solid var(--border-primary);
  border-radius: 4px;
  padding: 2px 4px;
  text-align: center;
  font-size: var(--fs-xs);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.equip-slot:hover {
  border-color: var(--primary-gold);
  background: rgba(255, 215, 0, 0.05);
}

.equip-slot.empty {
  opacity: 0.5;
}

.equip-slot.empty:hover {
  opacity: 0.8;
}

.equip-slot.broken {
  border-color: var(--color-damage);
  opacity: 0.6;
}

.equip-slot.locked {
  opacity: 0.4;
  pointer-events: none;
  background: rgba(80, 80, 80, 0.3);
}

.lock-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 8px;
}

.slot-icon {
  font-size: 12px;
  line-height: 1;
}

.slot-name {
  font-size: var(--fs-xs);
  line-height: 1.2;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slot-empty-label {
  color: var(--text-secondary);
}

.weapon-slot {
  min-height: 36px;
}

/* 按钮通用 */
.btn-small {
  padding: 4px 8px;
  font-size: var(--fs-xs);
  margin-top: 6px;
}

.btn-unequip {
  background: var(--bg-tertiary);
  color: var(--class-warrior);
  border: 1px solid var(--border-primary);
  width: 100%;
}

.btn-unequip:hover {
  background: var(--bg-secondary);
}

/* 套装效果 */
.set-bonus-section {
  margin-top: 4px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

.section-title {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  margin-bottom: 4px;
}

.set-name {
  font-size: var(--fs-xs);
  color: var(--color-friendly);
}

.set-bonus {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  padding-left: 8px;
}

.set-bonus.active {
  color: var(--color-friendly);
}

/* ==================== 背包面板 ==================== */

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
}

.inv-slot {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 3px;
  padding: 3px;
  min-height: 36px;
  font-size: var(--fs-xs);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  gap: 1px;
}

.inv-slot:hover:not(.empty) {
  border-color: var(--primary-gold);
  background: rgba(255, 215, 0, 0.05);
}

.inv-slot.empty {
  opacity: 0.3;
}

.inv-item-icon {
  font-size: 12px;
}

.inv-item-name {
  font-size: var(--fs-xs);
  line-height: 1.1;
  word-break: break-all;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inv-count {
  text-align: right;
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  padding-top: 4px;
}

.inv-actions {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.btn-inv-action {
  flex: 1;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  padding: 4px 6px;
  font-size: var(--fs-xs);
  color: var(--color-heal);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-inv-action:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-gold);
}

.btn-sell-junk {
  color: var(--primary-gold);
}

/* ==================== 技能面板 ==================== */

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skill-item {
  display: flex;
  gap: 8px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  align-items: center;
}

.skill-icon {
  font-size: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--secondary-gold);
  border-radius: 4px;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-surface));
  overflow: hidden;
}

.skill-icon .skill-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.skill-name {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
}

.skill-desc {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  opacity: 0.7;
}

/* ==================== 任务面板 ==================== */

.empty-text {
  text-align: center;
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  padding: 20px;
}

.quest-sub-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
}

.quest-sub-tab {
  flex: 1;
  padding: 4px 2px;
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: 3px;
  color: var(--text-primary);
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  position: relative;
}

.quest-sub-tab:hover {
  background: rgba(255, 215, 0, 0.08);
}

.quest-sub-tab.active {
  border-color: var(--primary-gold);
  color: var(--primary-gold);
  background: rgba(255, 215, 0, 0.05);
}

.quest-count {
  display: inline-block;
  min-width: 12px;
  padding: 0 2px;
  background: var(--primary-gold);
  color: var(--text-dark);
  border-radius: 6px;
  font-size: var(--fs-xs);
  margin-left: 2px;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quest-item {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.quest-item:hover {
  border-color: var(--border-accent);
  background: rgba(0, 0, 0, 0.3);
}

.quest-item.selected {
  border-color: var(--primary-gold);
  background: rgba(255, 215, 0, 0.05);
}

.quest-item.quest-complete {
  border-color: var(--color-buff);
  background: rgba(74, 222, 128, 0.05);
}

.quest-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.quest-type-badge {
  font-size: 10px;
}

.quest-name {
  flex: 1;
  font-size: var(--fs-xs);
  color: var(--text-primary);
  font-weight: bold;
}

.quest-level {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}

.quest-complete-badge,
.quest-done-badge {
  font-size: 8px;
}

.quest-details {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--border-primary);
}

.quest-desc {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  opacity: 0.8;
  margin-bottom: 4px;
  line-height: 1.4;
}

.quest-hint {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  margin-bottom: 4px;
}

.quest-objectives-preview {
  margin: 4px 0;
}

.quest-obj-text {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  padding: 1px 0;
}

.quest-objectives {
  margin-top: 4px;
}

.quest-obj {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fs-xs);
  padding: 2px 0;
  flex-wrap: wrap;
}

.quest-obj.done {
  color: var(--color-buff);
}

.quest-obj:not(.done) {
  color: var(--text-primary);
}

.obj-check {
  font-size: var(--fs-xs);
}

.obj-text {
  flex: 1;
}

.obj-progress-bar {
  width: 100%;
  height: 3px;
  background: var(--bg-primary);
  border-radius: 1px;
  margin-top: 1px;
  overflow: hidden;
}

.obj-progress-fill {
  height: 100%;
  background: var(--class-mage);
  transition: width 0.3s ease;
}

.quest-reward-line {
  display: flex;
  gap: 8px;
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  margin: 4px 0;
}

.quest-action-btns {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.btn-accept {
  width: 100%;
  background: var(--bg-tertiary);
  color: var(--class-mage);
  border: 1px solid var(--border-primary);
  margin-top: 4px;
}

.btn-accept:hover {
  background: var(--bg-secondary);
}

.btn-turnin {
  flex: 1;
  background: var(--bg-tertiary);
  color: var(--color-heal);
  border: 1px solid var(--border-primary);
}

.btn-turnin:hover {
  background: var(--bg-secondary);
}

.btn-abandon {
  background: var(--bg-tertiary);
  color: var(--color-debuff);
  border: 1px solid var(--border-primary);
}

.btn-abandon:hover {
  background: var(--bg-secondary);
}

.quest-done {
  opacity: 0.7;
}

.quest-done .quest-name {
  text-decoration: line-through;
  color: var(--text-secondary);
}
</style>

<!-- 非 scoped 样式：Teleport 到 body 的悬浮 tooltip -->
<style>
.item-hover-tooltip {
  position: fixed;
  z-index: 9999;
  transform: translate(-100%, 0);
  background: var(--bg-primary, #0D1B2A);
  border: 1px solid var(--border-primary, #3d5a80);
  border-radius: 4px;
  padding: 10px;
  min-width: 180px;
  max-width: 260px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.85);
  font-family: var(--pixel-font);
  pointer-events: auto;
  animation: tooltipFadeIn 0.15s ease;
}

@keyframes tooltipFadeIn {
  from { opacity: 0; transform: translate(-100%, 4px); }
  to   { opacity: 1; transform: translate(-100%, 0); }
}

.item-hover-tooltip .item-tooltip-content {
  font-size: var(--fs-xs, 12px);
  line-height: 1.4;
}

.item-hover-tooltip .tooltip-name {
  font-size: var(--fs-xs, 12px);
  font-weight: bold;
  margin-bottom: 2px;
}

.item-hover-tooltip .tooltip-quality {
  font-size: var(--fs-xs, 12px);
  color: var(--text-secondary, #8a8a6a);
  margin-bottom: 2px;
}

.item-hover-tooltip .tooltip-ilvl {
  color: var(--primary-gold, #FFD700);
  font-size: var(--fs-xs, 12px);
}

.item-hover-tooltip .tooltip-req {
  font-size: var(--fs-xs, 12px);
}

.item-hover-tooltip .tooltip-damage {
  color: var(--text-primary, #F5F5DC);
  font-size: var(--fs-xs, 12px);
  margin-top: 2px;
}

.item-hover-tooltip .tooltip-armor {
  color: var(--color-neutral, #facc15);
  font-size: var(--fs-xs, 12px);
}

.item-hover-tooltip .tooltip-stat {
  color: var(--color-friendly, #00FF00);
  font-size: var(--fs-xs, 12px);
}

.item-hover-tooltip .tooltip-stat.stat-up {
  color: var(--color-friendly, #00FF00);
}

.item-hover-tooltip .tooltip-stat.stat-down {
  color: var(--color-damage, #ff4444);
}

.item-hover-tooltip .tooltip-unique {
  color: var(--primary-gold, #FFD700);
  font-size: var(--fs-xs, 12px);
  margin-top: 2px;
}

.item-hover-tooltip .tooltip-set-name {
  color: var(--primary-gold, #FFD700);
  font-size: var(--fs-xs, 12px);
  margin-top: 3px;
}

.item-hover-tooltip .tooltip-dura {
  color: var(--text-secondary, #8a8a6a);
  font-size: var(--fs-xs, 12px);
  margin-top: 2px;
}

.item-hover-tooltip .tooltip-desc {
  color: var(--primary-gold, #FFD700);
  font-style: italic;
  font-size: var(--fs-xs, 12px);
  margin-top: 3px;
}

.item-hover-tooltip .tooltip-price {
  color: var(--text-secondary, #8a8a6a);
  font-size: var(--fs-xs, 12px);
  margin-top: 2px;
}

.item-hover-tooltip .comparison-tooltip {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed var(--text-muted, #5a5a4a);
}

.item-hover-tooltip .comparison-header {
  font-size: var(--fs-xs, 12px);
  color: var(--text-secondary, #8a8a6a);
  margin-bottom: 4px;
  text-align: center;
}

.hover-tooltip-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid var(--border-primary, #3d5a80);
}

.hover-tooltip-actions .btn-small {
  padding: 4px 8px;
  font-size: var(--fs-xs, 12px);
  font-family: var(--pixel-font);
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s;
  margin-top: 0;
  flex: 1;
  text-align: center;
}

.hover-tooltip-actions .btn-unequip {
  background: var(--bg-tertiary, #243447);
  color: var(--class-warrior, #C79C6E);
  border: 1px solid var(--border-primary, #3d5a80);
}

.hover-tooltip-actions .btn-unequip:hover {
  background: var(--bg-secondary, #1B2838);
}

.hover-tooltip-actions .btn-equip {
  background: var(--bg-tertiary, #243447);
  color: var(--class-mage, #69CCF0);
  border: 1px solid var(--border-primary, #3d5a80);
}

.hover-tooltip-actions .btn-equip:hover {
  background: var(--bg-secondary, #1B2838);
}

.hover-tooltip-actions .btn-sell {
  background: var(--bg-tertiary, #243447);
  color: var(--class-warrior, #C79C6E);
  border: 1px solid var(--border-primary, #3d5a80);
}

.hover-tooltip-actions .btn-sell:hover {
  background: var(--bg-secondary, #1B2838);
}

/* 槽位选择弹窗 */
.slot-choice-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.slot-choice-dialog {
  min-width: 260px;
  max-width: 340px;
  padding: 16px;
  text-align: center;
}
.slot-choice-title {
  font-size: var(--fs-sm, 13px);
  color: var(--accent-gold, #FFD700);
  margin-bottom: 6px;
  font-weight: bold;
}
.slot-choice-item-name {
  font-size: var(--fs-xs, 12px);
  color: var(--text-primary, #ddd);
  margin-bottom: 12px;
}
.slot-choice-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.slot-choice-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  font-size: var(--fs-xs, 12px);
  cursor: pointer;
}
.slot-choice-btn:hover {
  border-color: var(--accent-gold, #FFD700);
}
.slot-choice-label {
  color: var(--accent-gold, #FFD700);
  font-weight: bold;
  margin-bottom: 2px;
}
.slot-choice-current {
  font-size: 11px;
  color: var(--text-secondary, #999);
}
.slot-choice-current.slot-empty {
  color: var(--text-positive, #4CAF50);
}
.slot-choice-cancel {
  margin-top: 4px;
}
</style>
