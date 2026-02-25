<template>
  <div class="waiting-scene">
    <div class="waiting-container pixel-panel">
      <h1>{{ mpStore.currentRoom?.dungeonName || '等待房间' }}</h1>
      <p class="room-id">房间: {{ roomId }}</p>

      <!-- 队伍成员 -->
      <div class="team-section">
        <h3>队伍成员 ({{ members.length }}/{{ maxPlayers }})</h3>
        <div class="member-list">
          <div v-for="member in members" :key="member.userId" class="member-card">
            <span class="member-icon">{{ classIcon(member.classId) }}</span>
            <span class="member-name">{{ member.nickname }}</span>
            <span class="member-level">Lv.{{ member.level }}</span>
            <span class="member-class">{{ className(member.classId) }}</span>
            <span class="member-status" :class="member.isOnline ? 'online' : 'offline'">
              {{ member.isOnline ? '在线' : '离线' }}
            </span>
            <span v-if="member.isHost" class="host-badge">房主</span>
          </div>
        </div>
      </div>

      <!-- 等待状态 -->
      <div class="waiting-status">
        <p v-if="countdown > 0">战斗将在 {{ countdown }} 秒后开始...</p>
        <p v-else-if="mpStore.currentRoom?.status === 'waiting'">等待其他玩家加入...</p>
        <p v-else>战斗即将开始！</p>
      </div>

      <!-- 连接状态 -->
      <div v-if="!mpStore.connected" class="connection-status">
        正在连接服务器...
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- 按钮区域 -->
      <div class="button-area">
        <!-- 房主可以立即开始战斗 -->
        <button
          v-if="canStartBattle"
          class="pixel-btn primary start-btn"
          :disabled="!mpStore.connected || isStarting"
          @click="startBattle"
        >
          {{ isStarting ? '开始中...' : '立即开始' }}
        </button>
        
        <button class="pixel-btn leave-btn" @click="leaveRoom">离开房间</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMultiplayerStore } from '@/stores/multiplayerStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { useAuthStore } from '@/stores/authStore.js'

const router = useRouter()
const route = useRoute()
const mpStore = useMultiplayerStore()
const gameStore = useGameStore()
const authStore = useAuthStore()

const countdown = ref(0)
const error = ref(null)
const isStarting = ref(false)
let countdownInterval = null

const classEmojis = {
    warrior: '⚔️',
    paladin: '🛡️',
    rogue: '🗡️',
    hunter: '🏹',
    mage: '🔮',
    warlock: '👿',
    priest: '✨',
    shaman: '⚡',
    druid: '🌿',
}

const classNames = {
    warrior: '战士',
    paladin: '圣骑士',
    rogue: '盗贼',
    hunter: '猎人',
    mage: '法师',
    warlock: '术士',
    priest: '牧师',
    shaman: '萨满',
    druid: '德鲁伊',
}

const maxPlayers = computed(() => mpStore.currentRoom?.maxPlayers || 5)

const roomId = computed(() => {
    // 优先从 URL 获取房间 ID
    return route.params.roomId || mpStore.currentRoom?.id || '---'
})

const members = computed(() => {
    return mpStore.currentRoom?.players || []
})

const isHost = computed(() => {
    const userId = authStore.user?.id
    const hostId = mpStore.currentRoom?.hostId
    if (userId == null || hostId == null) return false
    // 宽松比较以处理 number vs string 类型不一致
    return String(userId) === String(hostId)
})

const canStartBattle = computed(() => {
    if (!isHost.value) return false
    const status = mpStore.currentRoom?.status
    // 房间处于 waiting 状态时，房主可以随时立即开始
    return status === 'waiting'
})

function classIcon(classId) {
    return classEmojis[classId] || '⚔️'
}

function className(classId) {
    return classNames[classId] || '未知'
}

async function ensureConnection() {
    // 确保 Socket 连接
    if (!mpStore.connected) {
        mpStore.connect()
        // 等待连接
        let attempts = 0
        while (!mpStore.connected && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100))
            attempts++
        }
        
        if (!mpStore.connected) {
            error.value = '无法连接到服务器'
            return false
        }
    }
    return true
}

async function rejoinRoom() {
    const roomUuid = route.params.roomId
    if (!roomUuid) {
        error.value = '无效的房间ID'
        router.push('/game')
        return
    }
    
    // 如果已经有房间信息且 ID 匹配，不需要重新加入
    if (mpStore.currentRoom?.id === roomUuid) {
        return
    }
    
    // 检查登录状态
    if (!authStore.isLoggedIn) {
        error.value = '请先登录'
        router.push('/')
        return
    }
    
    // 构建玩家快照
    const player = gameStore.player
    const playerSnapshot = {
        name: player?.name || 'Unknown',
        classId: player?.class || 'warrior',
        level: player?.level || 1,
        currentHp: player?.currentHp || 100,
        maxHp: player?.maxHp || 100,
        currentMana: player?.resource?.current || 0,
        maxMana: player?.resource?.max || 0,
        stats: player?.stats || {},
        skills: player?.skills || [],
        talents: player?.talents || {},
        equipment: player?.equipment || {}
    }
    
    // 尝试加入房间
    try {
        const res = await mpStore.joinRoom(roomUuid, playerSnapshot)
        if (res.error) {
            error.value = res.message || '加入房间失败'
            router.push('/game')
        }
    } catch (err) {
        error.value = err.message || '加入房间失败'
        router.push('/game')
    }
}

async function startBattle() {
    if (!mpStore.connected || isStarting.value) return
    
    isStarting.value = true
    error.value = null
    
    try {
        const res = await mpStore.startBattle()
        if (res.error) {
            error.value = res.message || '开始战斗失败'
        }
    } catch (err) {
        error.value = err.message || '开始战斗失败'
    } finally {
        isStarting.value = false
    }
}

async function leaveRoom() {
    await mpStore.leaveRoom()
    router.push('/game')
}

function startCountdown() {
    const room = mpStore.currentRoom
    if (!room?.createdAt) return

    const createdTime = new Date(room.createdAt).getTime()
    const endTime = createdTime + 120000 // 2 minutes

    const updateCountdown = () => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
        countdown.value = remaining
        if (remaining <= 0 && countdownInterval) {
            clearInterval(countdownInterval)
        }
    }

    updateCountdown()
    countdownInterval = setInterval(updateCountdown, 1000)
}

onMounted(async () => {
    // 确保连接
    const connected = await ensureConnection()
    if (!connected) return
    
    // 如果没有房间信息，尝试重新加入
    if (!mpStore.currentRoom) {
        await rejoinRoom()
    }
    
    // 如果还是没有房间，返回游戏页面
    if (!mpStore.currentRoom) {
        router.push('/game')
        return
    }
    
    // 启动倒计时
    startCountdown()
})

onUnmounted(() => {
    if (countdownInterval) {
        clearInterval(countdownInterval)
    }
})

// 监听战斗开始 — 导航到游戏页面的副本场景（而非旧版 /battle 路由）
watch(
    () => mpStore.battleState,
    (state) => {
        if (state === 'in_progress' && mpStore.currentRoom) {
            // 切换到游戏页面 + 副本场景，由 DungeonCombatView 接管多人战斗
            gameStore.changeScene('dungeon')
            router.push('/game')
        }
    },
)

// 监听房间状态变化
watch(
    () => mpStore.currentRoom?.status,
    (status) => {
        if (status === 'in_battle' && mpStore.battleState === 'in_progress') {
            gameStore.changeScene('dungeon')
            router.push('/game')
        }
    },
)
</script>

<style scoped>
.waiting-scene {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
}

.waiting-container {
    width: 100%;
    max-width: 500px;
    padding: 24px;
    text-align: center;
}

.waiting-container h1 {
    font-family: var(--pixel-font);
    font-size: var(--fs-lg);
    color: var(--primary-gold);
    margin-bottom: 8px;
}

.room-id {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--text-secondary);
    margin-bottom: 20px;
    word-break: break-all;
}

/* 队伍区域 */
.team-section {
    margin-bottom: 20px;
}

.team-section h3 {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--primary-gold);
    margin-bottom: 12px;
}

.member-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.member-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border: 2px solid var(--border-primary);
    border-radius: 4px;
}

.member-icon {
    font-size: 20px;
    min-width: 28px;
    text-align: center;
}

.member-name {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--text-primary);
    flex: 1;
    text-align: left;
}

.member-level {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--text-secondary);
}

.member-class {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--accent-gold);
    min-width: 40px;
}

.member-status {
    font-family: var(--pixel-font);
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 2px;
}

.member-status.online {
    color: #4ade80;
    background: rgba(74, 222, 128, 0.1);
}

.member-status.offline {
    color: var(--color-hP);
    background: rgba(239, 68, 68, 0.1);
}

.host-badge {
    font-family: var(--pixel-font);
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 2px;
    background: rgba(255, 215, 0, 0.2);
    color: var(--primary-gold);
}

/* 等待状态 */
.waiting-status {
    margin-bottom: 20px;
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--text-secondary);
}

.waiting-status p {
    animation: pulse 2s ease-in-out infinite;
}

/* 连接状态 */
.connection-status {
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
    color: var(--accent-gold);
    margin-bottom: 16px;
    animation: pulse 1s ease-in-out infinite;
}

/* 错误提示 */
.error-message {
    margin-bottom: 16px;
    padding: 8px 12px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--color-hP);
    border-radius: 4px;
    color: var(--color-hP);
    font-family: var(--pixel-font);
    font-size: var(--fs-xs);
}

/* 按钮区域 */
.button-area {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}

.start-btn {
    padding: 12px 40px;
    font-size: var(--fs-xs);
    background: var(--primary-gold);
    border-color: var(--dark-gold);
    color: var(--bg-primary);
}

.start-btn:hover:not(:disabled) {
    background: var(--secondary-gold);
}

.start-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.leave-btn {
    padding: 12px 40px;
    font-size: var(--fs-xs);
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
</style>
