<template>
  <div class="lobby-overlay" @click.self="$emit('close')">
    <div class="lobby-modal pixel-panel">
      <!-- 头部 -->
      <div class="lobby-header">
        <h2>集合石</h2>
        <button class="close-btn" @click="$emit('close')">&#10005;</button>
      </div>

      <!-- 当前角色信息 -->
      <div class="current-character">
        <span class="char-icon">{{ classIcon(player?.class) }}</span>
        <span class="char-name">{{ player?.name }}</span>
        <span class="char-level">Lv.{{ player?.level }}</span>
        <span class="char-class">{{ className(player?.class) }}</span>
      </div>

      <!-- 主内容区 -->
      <div class="lobby-content">
        <!-- 左侧：房间列表 -->
        <div class="room-list-section">
          <div class="section-header">
            <h3>房间列表</h3>
            <button class="refresh-btn" @click="refreshRooms" :disabled="loading">&#128260;</button>
          </div>
          <div class="room-list">
            <div v-if="loading" class="loading">加载中...</div>
            <div v-else-if="rooms.length === 0" class="empty">暂无等待中的房间</div>
            <div
              v-for="room in rooms"
              :key="room.id"
              class="room-item"
              :class="{ full: room.playerCount >= room.maxPlayers }"
            >
              <div class="room-info">
                <span class="room-dungeon">{{ room.dungeonName }}</span>
                <span class="room-level">Lv.{{ formatLevelRange(room.levelRange) }}</span>
              </div>
              <div class="room-meta">
                <span class="room-players">{{ room.playerCount }}/{{ room.maxPlayers }}</span>
                <span class="room-host">房主: {{ room.hostName }}</span>
                <span class="room-status" :class="room.status">{{ statusText(room.status) }}</span>
              </div>
              <button
                class="join-btn pixel-btn"
                :disabled="room.status !== 'waiting' || room.playerCount >= room.maxPlayers"
                @click="joinRoom(room)"
              >
                加入
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧：创建房间 -->
        <div class="create-room-section">
          <h3>创建房间</h3>
          <div class="dungeon-select">
            <PixelDropdown
              v-model="selectedDungeon"
              :options="dungeonOptions"
              placeholder="选择副本..."
            />
          </div>
          <button
            class="pixel-btn primary create-btn"
            :disabled="!selectedDungeon || creating"
            @click="createRoom"
          >
            {{ creating ? '创建中...' : '创建房间' }}
          </button>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore.js'
import { useMultiplayerStore } from '@/stores/multiplayerStore.js'
import { useAuthStore } from '@/stores/authStore.js'
import { DungeonRegistry } from '@/data/dungeons/DungeonRegistry.js'
import PixelDropdown from '@/components/common/PixelDropdown.vue'

const emit = defineEmits(['close'])
const router = useRouter()
const gameStore = useGameStore()
const mpStore = useMultiplayerStore()
const authStore = useAuthStore()

// 职业图标和名称映射
const CLASS_ICONS = {
  warrior: '⚔️', paladin: '🛡️', hunter: '🏹', rogue: '🗡️',
  priest: '✨', shaman: '⚡', mage: '🔮', warlock: '💀', druid: '🌿'
}

const CLASS_NAMES = {
  warrior: '战士', paladin: '圣骑士', hunter: '猎人', rogue: '盗贼',
  priest: '牧师', shaman: '萨满', mage: '法师', warlock: '术士', druid: '德鲁伊'
}

function classIcon(cls) {
  return CLASS_ICONS[cls] || '❓'
}

function className(cls) {
  return CLASS_NAMES[cls] || cls
}

// 状态
const selectedDungeon = ref('')
const loading = ref(false)
const creating = ref(false)

// 玩家数据
const player = computed(() => gameStore.player)

// 房间列表
const rooms = computed(() => mpStore.rooms)

// 错误信息
const error = computed(() => mpStore.error)

// 筛选玩家等级可参与的副本
const availableDungeons = computed(() => {
  const playerLevel = player.value?.level || 1
  const result = []

  for (const dungeon of Object.values(DungeonRegistry)) {
    // 跳过多翼副本主入口
    if (dungeon.type === 'multi-wing') {
      // 展开各翼
      if (dungeon.wings) {
        for (const wing of dungeon.wings) {
          if (playerLevel >= wing.levelRange.min && playerLevel <= wing.levelRange.max) {
            result.push({
              id: wing.id,
              name: `${dungeon.name} - ${wing.name}`,
              emoji: wing.emoji || dungeon.emoji,
              levelRange: wing.levelRange
            })
          }
        }
      }
    } else {
      // 标准副本
      if (playerLevel >= dungeon.levelRange.min && playerLevel <= dungeon.levelRange.max) {
        result.push({
          id: dungeon.id,
          name: dungeon.name,
          emoji: dungeon.emoji,
          levelRange: dungeon.levelRange
        })
      }
    }
  }

  // 按等级排序
  return result.sort((a, b) => a.levelRange.min - b.levelRange.min)
})

// 转换为 PixelDropdown 需要的 options 格式
const dungeonOptions = computed(() => {
  return availableDungeons.value.map(d => ({
    value: d.id,
    label: d.name,
    emoji: d.emoji,
    sublabel: `Lv.${d.levelRange.min}-${d.levelRange.max}`
  }))
})

// 格式化等级范围
function formatLevelRange(levelRange) {
  if (!levelRange) return '-'
  if (levelRange.min === levelRange.max) return levelRange.min
  return `${levelRange.min}-${levelRange.max}`
}

// 状态文本
function statusText(status) {
  const map = {
    waiting: '等待中',
    in_progress: '进行中',
    finished: '已完成'
  }
  return map[status] || status
}

// 刷新房间列表
async function refreshRooms() {
  if (!mpStore.connected) {
    mpStore.connect()
    // 等待连接
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  loading.value = true
  try {
    await mpStore.refreshRoomList()
  } finally {
    loading.value = false
  }
}

// 创建房间
async function createRoom() {
  if (!selectedDungeon.value || creating.value) return

  // 检查登录状态（使用 authStore）
  if (!authStore.isLoggedIn) {
    mpStore.error = '请先登录多人游戏账号'
    return
  }

  // 确保 Socket 已连接
  if (!mpStore.connected) {
    mpStore.connect()
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  creating.value = true
  try {
    const dungeon = availableDungeons.value.find(d => d.id === selectedDungeon.value)
    if (!dungeon) return

    // 构建玩家快照
    const playerSnapshot = {
      name: player.value?.name || 'Unknown',
      classId: player.value?.class || 'warrior',
      level: player.value?.level || 1,
      currentHp: player.value?.currentHp || 100,
      maxHp: player.value?.maxHp || 100,
      currentMana: player.value?.currentMana || 0,
      maxMana: player.value?.maxMana || 0,
      stats: player.value?.stats || {},
      skills: player.value?.skills || [],
      talents: player.value?.talents || {},
      equipment: player.value?.equipment || {}
    }

    const res = await mpStore.createRoom(selectedDungeon.value, dungeon.name, playerSnapshot)

    if (res.error) {
      // 错误已在 store 中设置
      return
    }

    // 成功创建（或重新加入已有房间），跳转到等待房间
    emit('close')
    router.push(`/waiting/${res.room.id}`)
  } finally {
    creating.value = false
  }
}

// 加入房间
async function joinRoom(room) {
  // 检查房间状态
  if (room.status !== 'waiting' || room.playerCount >= room.maxPlayers) {
    return
  }

  // 检查登录状态（使用 authStore）
  if (!authStore.isLoggedIn) {
    mpStore.error = '请先登录多人游戏账号'
    return
  }

  // 确保 Socket 已连接
  if (!mpStore.connected) {
    mpStore.connect()
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // 等级验证（前端）
  const playerLevel = player.value?.level || 1
  if (room.levelRange) {
    if (playerLevel < room.levelRange.min || playerLevel > room.levelRange.max) {
      mpStore.error = `等级不符合要求 (需要 Lv.${room.levelRange.min}-${room.levelRange.max})`
      return
    }
  }

  // 构建玩家快照
  const playerSnapshot = {
    name: player.value?.name || 'Unknown',
    classId: player.value?.class || 'warrior',
    level: player.value?.level || 1,
    currentHp: player.value?.currentHp || 100,
    maxHp: player.value?.maxHp || 100,
    currentMana: player.value?.currentMana || 0,
    maxMana: player.value?.maxMana || 0,
    stats: player.value?.stats || {},
    skills: player.value?.skills || [],
    talents: player.value?.talents || {},
    equipment: player.value?.equipment || {}
  }

  try {
    const res = await mpStore.joinRoom(room.id, playerSnapshot)

    if (res.error) {
      // 错误已在 store 中设置
      return
    }

    // 成功加入，跳转到等待房间
    emit('close')
    router.push(`/waiting/${res.room.id}`)
  } catch (err) {
    mpStore.error = err.message || '加入房间失败'
  }
}

// 组件挂载时加载房间列表
onMounted(() => {
  refreshRooms()
})

// 清除错误
onUnmounted(() => {
  mpStore.clearError()
})
</script>

<style scoped>
.lobby-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.lobby-modal {
  width: 700px;
  max-width: 95vw;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 头部 */
.lobby-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 2px solid var(--border-primary);
}

.lobby-header h2 {
  font-family: var(--pixel-font);
  font-size: var(--fs-sm);
  color: var(--primary-gold);
  margin: 0;
}

.close-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  border-color: var(--color-hP);
  color: var(--color-hP);
}

/* 当前角色信息 */
.current-character {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--border-primary);
}

.char-icon {
  font-size: 20px;
}

.char-name {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-primary);
  font-weight: bold;
}

.char-level {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--primary-gold);
}

.char-class {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}

/* 主内容区 */
.lobby-content {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 12px;
  padding: 12px 16px;
  flex: 1;
  min-height: 0;
}

/* 房间列表区域 */
.room-list-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-header h3 {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-primary);
  margin: 0;
}

.refresh-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  border-color: var(--primary-gold);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 房间列表 */
.room-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.15);
  min-height: 200px;
}

.loading,
.empty {
  text-align: center;
  padding: 40px 20px;
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

/* 房间项 */
.room-item {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 4px 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-primary);
  transition: background 0.2s;
}

.room-item:last-child {
  border-bottom: none;
}

.room-item:hover {
  background: rgba(255, 215, 0, 0.05);
}

.room-item.full {
  opacity: 0.5;
}

.room-info {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.room-dungeon {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-primary);
  font-weight: bold;
}

.room-level {
  font-family: var(--pixel-font);
  font-size: 10px;
  color: var(--primary-gold);
}

.room-meta {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 10px;
}

.room-players {
  color: var(--text-secondary);
}

.room-host {
  color: var(--text-muted);
}

.room-status {
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.room-status.waiting {
  background: rgba(0, 255, 0, 0.15);
  color: var(--color-friendly);
}

.room-status.in_progress {
  background: rgba(255, 165, 0, 0.15);
  color: #ffa500;
}

.room-status.finished {
  background: rgba(128, 128, 128, 0.15);
  color: var(--text-muted);
}

.join-btn {
  grid-column: 2;
  grid-row: 1 / 3;
  align-self: center;
  padding: 6px 16px;
  font-size: var(--fs-xs);
}

.join-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 创建房间区域 */
.create-room-section {
  display: flex;
  flex-direction: column;
  padding-left: 12px;
  border-left: 1px solid var(--border-primary);
}

.create-room-section h3 {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.dungeon-select {
  margin-bottom: 8px;
}

.create-btn {
  width: 100%;
  padding: 10px;
  font-size: var(--fs-xs);
}

.create-btn.primary {
  background: var(--primary-gold);
  border-color: var(--dark-gold);
  color: var(--bg-primary);
}

.create-btn.primary:hover:not(:disabled) {
  background: var(--secondary-gold);
}

.create-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 错误提示 */
.error-msg {
  margin: 12px 16px;
  padding: 8px 12px;
  background: rgba(255, 68, 68, 0.15);
  border: 1px solid var(--color-hP);
  border-radius: 4px;
  color: var(--color-hP);
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  text-align: center;
}
</style>
