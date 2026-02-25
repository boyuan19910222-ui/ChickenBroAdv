<template>
  <!-- @deprecated 此组件已废弃。多人战斗现在使用 DungeonCombatView（通过 multiplayerStore.isInBattle 自动切换模式）。 -->
  <div class="battle-scene">
    <!-- 顶部标题栏 -->
    <div class="game-header">
      <div class="header-left">
        <span style="font-size: 24px;">🐔</span>
        <h1>{{ mpStore.battleDungeon?.name || '联机战斗' }}</h1>
      </div>
      <div class="header-center">
        <span class="battle-status" :class="statusClass" data-testid="battle-status">
          {{ statusText }}
        </span>
      </div>
      <div class="header-right">
        <button class="header-btn" @click="handleBack">
          <span class="btn-icon">🚪</span>
          <span>退出</span>
        </button>
      </div>
    </div>

    <!-- 主游戏区域 -->
    <div class="game-container">
      <!-- 左侧 - 队伍状态面板 -->
      <aside class="party-panel pixel-panel">
        <div class="panel-header">
          <h3>队伍状态</h3>
        </div>
        <div class="party-members">
          <div
            v-for="unit in partyUnits"
            :key="unit.id"
            class="party-member"
            :class="{ dead: unit.currentHp <= 0 }"
          >
            <div class="member-avatar">
              <span class="member-icon">{{ unit.icon || '🐔' }}</span>
            </div>
            <div class="member-info">
              <div class="member-name">{{ unit.name }}</div>
              <div class="bar-container">
                <div class="bar-fill hp" :style="{ width: hpPercent(unit) + '%' }"></div>
              </div>
              <div class="member-hp-text">{{ unit.currentHp }}/{{ unit.maxHp }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中间 - 战斗区域 -->
      <div class="main-area">
        <div class="combat-view">
          <!-- 战斗信息栏 -->
          <div class="combat-info-bar">
            <span class="turn-info">⚔️ 第 {{ currentRound }} 回合</span>
            <span class="turn-indicator in-progress">
              {{ mpStore.battleState === 'in_progress' ? '🔴 战斗进行中' : (mpStore.battleResult?.result === 'victory' ? '✅ 胜利' : '❌ 战败') }}
            </span>
          </div>

          <!-- 战斗区域 - 显示队伍 vs 敌人 -->
          <div class="combat-arena">
            <!-- 玩家队伍侧 -->
            <div class="player-side">
              <CombatantCard
                v-for="unit in alivePartyUnits"
                :key="unit.id"
                :unit="unit"
                size="small"
                side="player"
              />
              <div v-if="alivePartyUnits.length === 0" class="no-units">
                全军覆没...
              </div>
            </div>

            <div class="vs-indicator">VS</div>

            <!-- 敌人侧 -->
            <div class="enemy-side">
              <CombatantCard
                v-for="enemy in aliveEnemies"
                :key="enemy.id"
                :unit="enemy"
                size="small"
                side="enemy"
              />
              <div v-if="aliveEnemies.length === 0" class="no-units">
                敌人已被消灭
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 - Tab 日志区域 -->
    <div class="message-log-container pixel-panel">
      <!-- Tab 切换 -->
      <div class="log-tabs">
        <button
          :class="{ active: activeLogTab === 'system' }"
          @click="activeLogTab = 'system'"
        >
          📋 系统日志
        </button>
        <button
          :class="{ active: activeLogTab === 'loot' }"
          @click="activeLogTab = 'loot'"
        >
          💰 掉落记录
        </button>
        <button
          v-if="isInMultiplayerBattle"
          :class="{ active: activeLogTab === 'chat' }"
          @click="activeLogTab = 'chat'"
        >
          💬 聊天
        </button>
      </div>

      <!-- Tab 内容 -->
      <div class="log-content">
        <!-- 系统日志 -->
        <div v-show="activeLogTab === 'system'" class="log-messages" ref="logRef">
          <div
            v-for="(entry, idx) in battleLog"
            :key="idx"
            class="log-entry"
            :class="entry.type"
          >
            {{ entry.text }}
          </div>
          <div v-if="battleLog.length === 0" class="log-empty">
            战斗即将开始...
          </div>
        </div>

        <!-- 掉落记录 -->
        <div v-show="activeLogTab === 'loot'" class="log-messages">
          <div
            v-for="(item, idx) in lootLog"
            :key="idx"
            class="log-entry loot"
          >
            🎁 {{ item.name }} x{{ item.quantity || 1 }}
          </div>
          <div v-if="lootLog.length === 0" class="log-empty">
            暂无掉落...
          </div>
        </div>

        <!-- 聊天消息 -->
        <div v-show="activeLogTab === 'chat'" class="log-messages chat-log">
          <div
            v-for="msg in mpStore.roomMessages"
            :key="msg.id"
            class="chat-msg"
          >
            <span class="chat-nick">{{ msg.nickname }}:</span>
            <span class="chat-text">{{ msg.content }}</span>
          </div>
          <div v-if="mpStore.roomMessages.length === 0" class="log-empty">
            暂无消息...
          </div>
          <div class="chat-input-row">
            <input
              v-model="chatInput"
              class="form-input chat-input"
              placeholder="输入消息..."
              @keydown.enter="handleSendChat"
            />
            <button class="pixel-btn" @click="handleSendChat">发送</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 战斗结果弹窗 -->
    <div v-if="showResult" class="modal-overlay show">
      <div class="modal-panel">
        <h3 class="modal-title" :class="resultClass" data-testid="battle-result">
          {{ mpStore.battleResult?.result === 'victory' ? '胜利！' : '战败...' }}
        </h3>
        <div class="result-stats">
          <p>回合数: {{ mpStore.battleResult?.stats?.rounds || 0 }}</p>
          <p>存活: {{ mpStore.battleResult?.stats?.partyAlive || 0 }}/{{ mpStore.battleResult?.stats?.partyTotal || 0 }}</p>
        </div>
        <div class="modal-buttons">
          <button class="pixel-btn primary" @click="handleBack" data-testid="back-to-lobby">
            返回大厅
          </button>
        </div>
      </div>
    </div>

    <!-- 掉落结算弹窗 -->
    <LootResultModal
      v-if="showLoot"
      :items="mpStore.lootItems"
      @confirm="handleLootConfirm"
    />
  </div>
</template>

<script setup>
/**
 * @deprecated 此组件已废弃。
 * 多人战斗现在使用 DungeonCombatView（autoPlayMode），不再使用独立的 BattleView。
 * 保留此文件仅为兼容可能的旧链接/书签，访问时会自动重定向。
 */
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMultiplayerStore } from '@/stores/multiplayerStore.js'
import LootResultModal from '@/components/LootResultModal.vue'
import CombatantCard from '@/components/common/CombatantCard.vue'

const router = useRouter()
const mpStore = useMultiplayerStore()

const chatInput = ref('')
const logRef = ref(null)
const showResult = ref(false)
const showLoot = ref(false)
const activeLogTab = ref('system')

const partyUnits = computed(() => mpStore.battleParty || [])

const isInMultiplayerBattle = computed(() => {
  return !!mpStore.currentRoom && mpStore.battleState !== 'idle'
})

const alivePartyUnits = computed(() => {
  return partyUnits.value.filter(u => u.currentHp > 0)
})

const aliveEnemies = computed(() => {
  // 从战斗事件中提取敌人信息，或使用存储的敌人数据
  return mpStore.battleEnemies?.filter(u => u.currentHp > 0) || []
})

const currentRound = computed(() => {
  for (const ev of [...mpStore.battleEvents].reverse()) {
    if (ev.event === 'battle:round') {
      return ev.data.roundNumber
    }
  }
  return 1
})

const statusText = computed(() => {
    if (mpStore.battleState === 'in_progress') return '战斗进行中...'
    if (mpStore.battleState === 'finished') {
        return mpStore.battleResult?.result === 'victory' ? '胜利！' : '战败'
    }
    return '等待中'
})

const statusClass = computed(() => {
    if (mpStore.battleResult?.result === 'victory') return 'victory'
    if (mpStore.battleResult?.result === 'defeat') return 'defeat'
    return 'in-progress'
})

const resultClass = computed(() => {
    return mpStore.battleResult?.result === 'victory' ? 'victory' : 'defeat'
})

// 从 battleEvents 生成日志条目
const battleLog = computed(() => {
    const logs = []
    for (const ev of mpStore.battleEvents) {
        const { event, data } = ev
        if (event === 'battle:round') {
            logs.push({ type: 'system', text: `── 第 ${data.roundNumber} 回合 ──` })
        } else if (event === 'battle:action') {
            if (data.type === 'damage') {
                const crit = data.isCrit ? ' (暴击!)' : ''
                logs.push({
                    type: 'combat',
                    text: `${data.actorName} 对 ${data.targetName} 造成 ${data.amount} 点伤害${crit}`,
                })
            } else if (data.type === 'heal') {
                logs.push({
                    type: 'heal',
                    text: `${data.actorName} 治疗 ${data.targetName} ${data.amount} 点生命值`,
                })
            }
        } else if (event === 'battle:unitDied') {
            logs.push({ type: 'system', text: `${data.unitName} 被击倒！` })
        } else if (event === 'battle:finished') {
            logs.push({
                type: 'system',
                text: data.result === 'victory' ? '战斗胜利！' : '战斗失败...',
            })
        } else if (event === 'battle:playerDisconnected') {
            logs.push({ type: 'system', text: `${data.nickname} 断线了` })
        }
    }
    return logs
})

// 掉落记录
const lootLog = computed(() => {
    return mpStore.lootItems || []
})

function hpPercent(unit) {
    if (!unit.maxHp) return 0
    return Math.max(0, Math.min(100, (unit.currentHp / unit.maxHp) * 100))
}

// 监听战斗结束
watch(
    () => mpStore.battleState,
    (state) => {
        if (state === 'finished') {
            showResult.value = true
        }
    },
)

// 监听掉落
watch(
    () => mpStore.lootItems.length,
    (len) => {
        if (len > 0) {
            showLoot.value = true
        }
    },
)

// 自动滚动日志
watch(
    () => battleLog.value.length,
    async () => {
        await nextTick()
        if (logRef.value) {
            logRef.value.scrollTop = logRef.value.scrollHeight
        }
    },
)

onMounted(() => {
    if (!mpStore.connected) {
        mpStore.connect()
    }
    // 如果没有在战斗中，回到大厅
    if (mpStore.battleState !== 'in_progress' && mpStore.battleState !== 'finished') {
        router.push('/lobby')
    }
})

async function handleSendChat() {
    const msg = chatInput.value.trim()
    if (!msg) return
    chatInput.value = ''
    await mpStore.sendChat('room', msg)
}

function handleLootConfirm() {
    showLoot.value = false
    // TODO: 将掉落物品写入本地存档（与单机存档系统集成）
}

function handleBack() {
    showResult.value = false
    mpStore.battleState = 'idle'
    mpStore.battleEvents = []
    mpStore.battleResult = null
    mpStore.battleParty = []
    mpStore.lootItems = []
    mpStore.currentRoom = null
    router.push('/lobby')
}
</script>

<style scoped>
.battle-scene {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
}

/* 顶部标题栏 */
.game-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-surface);
    border-bottom: 2px solid var(--border-primary);
    flex-shrink: 0;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-left h1 {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--primary-gold);
    margin: 0;
}

.header-center {
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.header-btn:hover {
    border-color: var(--primary-gold);
    color: var(--primary-gold);
}

.btn-icon {
    font-size: 14px;
}

.battle-status {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    padding: 4px 12px;
    border-radius: 4px;
}

.battle-status.in-progress {
    color: var(--accent-gold);
    animation: pulse 2s ease-in-out infinite;
}

.battle-status.victory {
    color: var(--color-friendly);
}

.battle-status.defeat {
    color: var(--color-hp);
}

/* 主游戏区域 */
.game-container {
    flex: 1;
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 0;
    overflow: hidden;
}

/* 左侧队伍面板 */
.party-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.panel-header {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-primary);
    flex-shrink: 0;
}

.panel-header h3 {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--primary-gold);
    margin: 0;
}

.party-members {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
}

.party-member {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    margin-bottom: 6px;
    transition: opacity 0.3s;
}

.party-member.dead {
    opacity: 0.4;
}

.member-avatar {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-primary));
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.member-icon {
    font-size: 20px;
}

.member-info {
    flex: 1;
    min-width: 0;
}

.member-name {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--text-primary);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.member-hp-text {
    font-family: var(--pixel-font);
    font-size: 10px;
    color: var(--text-secondary);
    text-align: right;
}

.bar-container {
    height: 6px;
    background: var(--bg-primary);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 2px;
}

.bar-fill.hp {
    height: 100%;
    background: linear-gradient(90deg, #c62828, var(--color-hp));
    transition: width 0.3s ease;
}

/* 中间战斗区域 */
.main-area {
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px;
    display: flex;
    flex-direction: column;
}

.main-area > * {
    flex: 1;
}

.combat-view {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border-primary);
    border-radius: 4px;
}

.combat-info-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    background: var(--bg-primary);
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

.turn-indicator.in-progress { color: var(--color-hostile); }
.turn-indicator.victory { color: var(--color-friendly); }
.turn-indicator.defeat { color: var(--color-hp); }

.combat-arena {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 20px;
    padding: 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    flex: 1;
    min-height: 180px;
}

.player-side,
.enemy-side {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
}

.vs-indicator {
    font-size: var(--fs-md);
    color: var(--color-hostile);
    font-weight: bold;
    text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
    align-self: center;
}

.no-units {
    font-size: var(--fs-xs);
    color: var(--text-muted);
    padding: 12px;
}

/* 底部 Tab 日志区域 */
.message-log-container {
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
    height: 140px;
    flex-shrink: 0;
}

.log-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border-primary);
    flex-shrink: 0;
}

.log-tabs button {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    padding: 6px 16px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.log-tabs button:hover {
    color: var(--text-primary);
    background: var(--bg-surface);
}

.log-tabs button.active {
    color: var(--primary-gold);
    border-bottom-color: var(--primary-gold);
    background: var(--bg-surface);
}

.log-content {
    flex: 1;
    overflow: hidden;
}

.log-messages {
    height: 100%;
    overflow-y: auto;
    padding: 6px 10px;
    background: var(--bg-primary);
}

.log-messages.chat-log {
    display: flex;
    flex-direction: column;
}

.log-entry {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    line-height: 1.6;
    padding: 1px 0;
}

.log-entry.system {
    color: var(--text-secondary);
}

.log-entry.combat {
    color: var(--color-damage);
}

.log-entry.heal {
    color: var(--color-heal);
}

.log-entry.loot {
    color: var(--accent-gold);
}

.log-empty {
    font-size: var(--fs-xs);
    color: var(--text-muted);
    text-align: center;
    padding: 12px;
}

/* 聊天样式（在底部 Tab 中） */
.chat-log .chat-msg {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    line-height: 1.8;
    padding: 2px 0;
}

.chat-nick {
    color: var(--accent-gold);
    margin-right: 4px;
}

.chat-text {
    color: var(--text-primary);
}

.chat-input-row {
    display: flex;
    gap: 4px;
    padding: 8px 0 0 0;
    margin-top: auto;
    flex-shrink: 0;
}

.chat-input {
    flex: 1;
}

.form-input {
    background: var(--bg-primary);
    border: 2px solid var(--border-primary);
    color: var(--text-primary);
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    padding: 8px 10px;
    border-radius: 4px;
    outline: none;
}

.form-input:focus {
    border-color: var(--primary-gold);
}

.form-input::placeholder {
    color: var(--text-muted);
}

/* 结果弹窗 */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-overlay.show {
    animation: fadeIn 0.2s ease-out;
}

.modal-panel {
    background: var(--bg-primary);
    border: 2px solid var(--primary-gold);
    border-radius: 8px;
    padding: 24px;
    min-width: 280px;
    text-align: center;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.modal-title {
    font-family: var(--pixel-font);
    font-size: var(--fs-md);
    margin-bottom: 16px;
}

.modal-title.victory {
    color: var(--color-friendly);
}

.modal-title.defeat {
    color: var(--color-hP);
}

.result-stats {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--text-primary);
    line-height: 2;
    margin-bottom: 16px;
}

.modal-buttons {
    display: flex;
    justify-content: center;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@media (max-width: 1024px) {
    .game-container {
        grid-template-columns: 200px 1fr;
    }
}

@media (max-width: 768px) {
    .game-container {
        grid-template-columns: 1fr;
    }

    .party-panel {
        display: none;
    }
}
</style>
