<template>
  <div class="character-select-scene">
    <!-- 右上角反馈二维码 + 退出登录 -->
    <div class="top-right">
      <button class="feedback-btn" @click="showChangelog = true" style="margin-right: 8px;">
        <span>📜</span>
        <span>更新日志</span>
      </button>

      <div class="feedback-btn-wrapper">
        <button class="feedback-btn" @mouseenter="showQrcode = true" @mouseleave="showQrcode = false">
          <span>💬</span>
          <span>反馈</span>
        </button>
        <div v-if="showQrcode" class="feedback-qrcode">
          <img src="/images/feedback_qrcode.jpg" alt="扫码反馈" />
          <p>扫码反馈</p>
        </div>
      </div>
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>

    <div class="character-select-container pixel-panel">
      <h1 class="page-title">选择角色</h1>
      <p class="page-subtitle">角色上限: {{ characters.length }}/5</p>

      <!-- 加载中 -->
      <div v-if="loading" class="loading">加载中...</div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-msg">{{ error }}</div>

      <!-- 角色列表 -->
      <div v-if="!loading && characters.length > 0" class="character-grid">
        <!-- 角色卡片 -->
        <div
          v-for="char in characters"
          :key="char.id"
          class="character-card"
          @click="selectCharacter(char)"
        >
          <div class="char-icon">{{ classIcon(char.class) }}</div>
          <div class="char-info">
            <div class="char-name">{{ char.name }}</div>
            <div class="char-class">Lv.{{ char.level }} {{ className(char.class) }}</div>
            <div class="char-time">{{ formatTime(char.last_played_at || char.created_at) }}</div>
          </div>
          <button class="delete-btn" @click.stop="confirmDelete(char)">🗑️</button>
        </div>

        <!-- 创建角色卡片 -->
        <div v-if="characters.length < 5" class="character-card create-card" @click="goCreate">
          <div class="create-icon">+</div>
          <div class="create-text">创建角色</div>
        </div>
      </div>

      <!-- 无角色提示 -->
      <div v-if="!loading && characters.length === 0" class="no-characters">
        <div class="character-grid">
          <div class="character-card create-card" @click="goCreate">
            <div class="create-icon">+</div>
            <div class="create-text">创建角色</div>
          </div>
        </div>
        <p class="no-characters-text">还没有角色，点击上方创建你的第一个角色吧！</p>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal-panel pixel-panel">
        <h3>确认删除</h3>
        <p>确定要删除角色 "{{ characterToDelete?.name }}" 吗？</p>
        <p class="warning">此操作不可恢复！</p>
        <div class="modal-buttons">
          <button class="pixel-btn" @click="showDeleteConfirm = false">取消</button>
          <button class="pixel-btn danger" @click="doDelete">确认删除</button>
        </div>
      </div>
    </div>
    
    <ChangelogModal :show="showChangelog" @close="showChangelog = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { useMultiplayerStore } from '@/stores/multiplayerStore.js'
import { characterApi } from '@/services/api.js'
import ChangelogModal from '@/components/modals/ChangelogModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()
const mpStore = useMultiplayerStore()

const showChangelog = ref(false)
const showQrcode = ref(false)
const loading = ref(true)
const error = ref(null)
const characters = ref([])
const showDeleteConfirm = ref(false)
const characterToDelete = ref(null)

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

function formatTime(timestamp) {
  if (!timestamp) return '新角色'
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function loadCharacters() {
  loading.value = true
  error.value = null
  try {
    const data = await characterApi.getAll()
    characters.value = data.characters || []
  } catch (err) {
    error.value = err.message || '加载角色失败'
  } finally {
    loading.value = false
  }
}

async function selectCharacter(char) {
  try {
    console.log('选择角色', char)
    error.value = null
    const data = await characterApi.getById(char.id)
    
    // 加载角色到 gameStore
    // API 返回 { character: { game_state: ... } }
    const character = data.character || data
    gameStore.loadCharacter(char.id, character.game_state)
    
    // 跳转到游戏页面
    router.push('/game')
  } catch (err) {
    error.value = err.message || '加载角色失败'
  }
}

function goCreate() {
  router.push('/create')
}

function confirmDelete(char) {
  characterToDelete.value = char
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!characterToDelete.value) return
  
  try {
    await characterApi.delete(characterToDelete.value.id)
    showDeleteConfirm.value = false
    characterToDelete.value = null
    // 刷新列表
    await loadCharacters()
  } catch (err) {
    error.value = err.message || '删除失败'
    showDeleteConfirm.value = false
  }
}

async function handleLogout() {
  // 断开多人连接
  mpStore.disconnect()
  
  // 清除角色数据
  gameStore.clearCharacter()
  
  // 登出
  await authStore.logout()
  
  // 跳转到登录页
  router.push('/')
}

onMounted(() => {
  loadCharacters()
})
</script>

<style scoped>
.character-select-scene {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-surface) 50%, var(--bg-primary) 100%);
  position: relative;
}

/* 右上角操作区 */
.top-right {
  position: fixed;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

/* 反馈按钮 */
.feedback-btn-wrapper {
  position: relative;
}

.feedback-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.feedback-btn:hover {
  border-color: var(--primary-gold);
  color: var(--primary-gold);
}

.feedback-qrcode {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--primary-gold);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: fadeIn 0.2s ease-out;
}

.feedback-qrcode img {
  width: 200px;
  height: auto;
  border-radius: 4px;
}

.feedback-qrcode p {
  margin: 8px 0 0 0;
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
}

/* 退出登录按钮 */
.logout-btn {
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  border-color: var(--color-hP);
  color: var(--color-hP);
}

/* 主容器 */
.character-select-container {
  width: 600px;
  max-width: 90vw;
  padding: 24px;
  animation: fadeIn 0.5s ease-out;
}

.page-title {
  font-family: var(--pixel-font);
  font-size: var(--fs-md);
  color: var(--primary-gold);
  text-shadow: 2px 2px 0 var(--dark-gold);
  text-align: center;
  margin-bottom: 4px;
}

.page-subtitle {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 20px;
}

/* 加载和错误 */
.loading {
  text-align: center;
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  padding: 40px 0;
}

.error-msg {
  background: rgba(255, 68, 68, 0.15);
  border: 1px solid var(--color-hP);
  color: var(--color-hP);
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  padding: 8px 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  text-align: center;
}

/* 角色网格 */
.character-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* 角色卡片 */
.character-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.character-card:hover {
  border-color: var(--primary-gold);
  transform: translateY(-2px);
}

.char-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 24px;
}

.char-info {
  flex: 1;
  min-width: 0;
}

.char-name {
  font-family: var(--pixel-font);
  font-size: var(--fs-sm);
  color: var(--text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.char-class {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  margin-bottom: 2px;
}

.char-time {
  font-family: var(--pixel-font);
  font-size: 10px;
  color: var(--text-muted);
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  font-size: 14px;
  z-index: 10;
}

.delete-btn:hover {
  opacity: 1;
}

/* 创建角色卡片 */
.create-card {
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  padding: 24px 12px;
  border-style: dashed;
  grid-column: 1 / -1;
}

.create-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 32px;
  color: var(--text-muted);
}

.create-text {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.create-card:hover .create-icon,
.create-card:hover .create-text {
  color: var(--primary-gold);
}

/* 无角色提示 */
.no-characters {
  text-align: center;
}

.no-characters-text {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-muted);
  margin-top: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-panel {
  width: 320px;
  max-width: 90vw;
  padding: 24px;
  text-align: center;
  animation: fadeIn 0.2s ease-out;
}

.modal-panel h3 {
  font-family: var(--pixel-font);
  font-size: var(--fs-sm);
  color: var(--primary-gold);
  margin-bottom: 12px;
}

.modal-panel p {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-primary);
  margin-bottom: 8px;
}

.modal-panel .warning {
  color: var(--color-hP);
}

.modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-buttons .pixel-btn {
  flex: 1;
}

.modal-buttons .pixel-btn.danger {
  background: var(--color-hP);
  border-color: var(--color-hP);
}

.modal-buttons .pixel-btn.danger:hover {
  background: #cc3333;
}
</style>
