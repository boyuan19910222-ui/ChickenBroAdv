<template>
  <div class="create-scene">
    <div class="create-container pixel-panel">
      <h2 class="create-title">✨ 创建角色</h2>

      <!-- 角色名输入 -->
      <div class="name-input-group">
        <label>角色名称</label>
        <input
          v-model="characterName"
          type="text"
          maxlength="12"
          placeholder="输入角色名..."
          class="pixel-input"
        />
      </div>

      <!-- 职业选择 -->
      <div class="class-selection">
        <h3>选择职业</h3>
        <div class="class-grid">
          <div
            v-for="cls in classList"
            :key="cls.id"
            class="class-card"
            :class="{ selected: selectedClass === cls.id }"
            @click="selectClass(cls.id)"
          >
            <div class="class-emoji"><PixelIcon :src="cls.icon" :size="48" /></div>
            <div class="class-name">{{ cls.name }}</div>
            <div class="class-desc">{{ cls.description }}</div>
          </div>
        </div>
      </div>

      <!-- 职业预览 -->
      <div v-if="selectedClassData" class="class-preview pixel-panel">
        <h3><PixelIcon :src="selectedClassData.icon" :size="24" /> {{ selectedClassData.name }}</h3>
        <p class="preview-desc">{{ selectedClassData.description }}</p>
        <div class="preview-stats">
          <div class="stat-row" v-for="(value, key) in selectedClassData.baseStats" :key="key">
            <span class="stat-label">{{ statLabels[key] || key }}</span>
            <span class="stat-value">{{ value }}</span>
            <div class="stat-bar-bg">
              <div class="stat-bar-fill" :style="{ width: (value / 20 * 100) + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="preview-info">
          <div>资源类型: <span class="gold-text">{{ resourceLabels[selectedClassData.resourceType] }}</span></div>
          <div>角色定位: <span class="gold-text">{{ selectedClassData.role.map(r => roleLabels[r]).join(' / ') }}</span></div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="createError" class="error-message">
        {{ createError }}
      </div>

      <!-- 按钮 -->
      <div class="create-buttons">
        <button class="pixel-btn" @click="goBack" :disabled="isCreating">
          <span>← 返回</span>
        </button>
        <button
          class="pixel-btn primary"
          :disabled="!canCreate || isCreating"
          @click="createCharacter"
        >
          <span>{{ isCreating ? '创建中...' : '开始冒险 ⚔️' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore.js'
import { useAuthStore } from '@/stores/authStore.js'
import { characterApi } from '@/services/api.js'
import { GameData } from '@/data/GameData.js'
import PixelIcon from '@/components/common/PixelIcon.vue'

const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()

// 创建中状态（防止重复提交）
const isCreating = ref(false)
const createError = ref(null)

// 确保引擎已初始化（用户可能直接刷新此页面）
onMounted(() => {
  if (!gameStore.engine) {
    gameStore.initEngine()
  }
})

const characterName = ref('')
const selectedClass = ref(null)

const statLabels = {
  health: '❤️ 生命',
  mana: '💧 法力',
  strength: '💪 力量',
  agility: '🏃 敏捷',
  stamina: '🛡️ 耐力',
  intellect: '🧠 智力',
  spirit: '✨ 精神'
}

const resourceLabels = {
  rage: '💢 怒气',
  mana: '💧 法力',
  energy: '⚡ 能量'
}

const roleLabels = {
  tank: '坦克',
  healer: '治疗',
  dps: '输出'
}

const classList = computed(() => {
  return Object.values(GameData.classes).map(cls => ({
    id: cls.id,
    name: cls.name,
    icon: cls.icon,
    description: cls.description
  }))
})

const selectedClassData = computed(() => {
  if (!selectedClass.value) return null
  return GameData.classes[selectedClass.value]
})

const canCreate = computed(() => {
  return characterName.value.trim().length > 0 && selectedClass.value
})

function selectClass(classId) {
  selectedClass.value = classId
}

function goBack() {
  router.push('/characters')
}

async function createCharacter() {
  if (!canCreate.value || isCreating.value) return

  // 检查认证状态
  if (!authStore.isLoggedIn) {
    createError.value = '请先登录后再创建角色'
    router.push('/login')
    return
  }

  isCreating.value = true
  createError.value = null

  try {
    // 1. 调用云端 API 创建角色
    const response = await characterApi.create(
      characterName.value.trim(),
      selectedClass.value
    )

    // 2. 加载角色到 gameStore
    gameStore.loadCharacter(response.character.id, response.character.game_state)

    // 3. 跳转到游戏
    router.push('/game')
  } catch (error) {
    console.error('创建角色失败:', error)
    createError.value = error.message || '创建角色失败，请重试'
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
.create-scene {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.create-container {
  max-width: 900px;
  width: 100%;
  padding: 20px;
  animation: fadeIn 0.5s ease-out;
}

.create-title {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  text-align: center;
  margin-bottom: 20px;
}

.name-input-group {
  margin-bottom: 20px;
}

.name-input-group label {
  display: block;
  font-size: var(--fs-xs);
  color: var(--secondary-gold);
  margin-bottom: 6px;
}

.pixel-input {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  border-radius: 4px;
}

.pixel-input:focus {
  outline: none;
  border-color: var(--primary-gold);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.class-selection h3 {
  font-size: var(--fs-xs);
  color: var(--secondary-gold);
  margin-bottom: 12px;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.class-card {
  background: linear-gradient(180deg, rgba(36, 52, 71, 0.6), rgba(13, 27, 42, 0.8));
  border: 2px solid var(--border-primary);
  border-radius: 6px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.class-card:hover {
  border-color: var(--secondary-gold);
  transform: translateY(-2px);
}

.class-card.selected {
  border-color: var(--primary-gold);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
  background: linear-gradient(180deg, rgba(36, 52, 71, 0.8), rgba(21, 34, 50, 0.9));
}

.class-emoji {
  font-size: 28px;
  margin-bottom: 6px;
}

.class-name {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  margin-bottom: 4px;
}

.class-desc {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  opacity: 0.7;
  line-height: 1.4;
}

.class-preview {
  padding: 15px;
  margin-bottom: 20px;
}

.class-preview h3 {
  font-size: var(--fs-xs);
  color: var(--primary-gold);
  margin-bottom: 8px;
}

.preview-desc {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.6;
}

.preview-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-xs);
}

.stat-label {
  min-width: 60px;
  color: var(--text-primary);
}

.stat-value {
  min-width: 20px;
  color: var(--accent-gold);
  text-align: right;
}

.stat-bar-bg {
  flex: 1;
  height: 4px;
  background: var(--bg-primary);
  border-radius: 2px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--dark-gold), var(--primary-gold));
  border-radius: 2px;
  transition: width 0.3s;
}

.preview-info {
  font-size: var(--fs-xs);
  color: var(--text-primary);
  display: flex;
  gap: 20px;
}

.gold-text {
  color: var(--primary-gold);
}

.create-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.create-buttons .pixel-btn {
  flex-direction: row;
  font-size: var(--fs-xs);
  padding: 10px 20px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
