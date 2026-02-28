<template>
  <div class="modal fade" :class="{ show: show }" tabindex="-1" style="display: block;" v-if="show">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">角色详情 - {{ character?.name }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal-body" v-if="character">
          <!-- 基本信息 -->
          <div class="row mb-3">
            <div class="col-md-6">
              <h6 class="text-muted">基本信息</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td class="text-muted">ID:</td>
                    <td>{{ character.id }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">角色名:</td>
                    <td>{{ character.name }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">职业:</td>
                    <td>
                      <span class="badge bg-info">{{ getClassName(character.class) }}</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="text-muted">等级:</td>
                    <td>
                      <span class="badge bg-primary">{{ character.level }}</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="text-muted">所属用户:</td>
                    <td>{{ character.user?.nickname || character.user?.username || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-md-6">
              <h6 class="text-muted">时间信息</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td class="text-muted">创建时间:</td>
                    <td>{{ formatDate(character.created_at) }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">更新时间:</td>
                    <td>{{ formatDate(character.updated_at) }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">最后游玩:</td>
                    <td>{{ formatDate(character.last_played_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 游戏状态 -->
          <div v-if="character.game_state && character.game_state.player">
            <h6 class="text-muted mb-2">玩家状态</h6>
            <div class="row">
              <div class="col-md-4">
                <div class="card mb-2">
                  <div class="card-body py-2">
                    <small class="text-muted">生命值</small>
                    <div class="progress mt-1">
                      <div class="progress-bar bg-danger" :style="{ width: hpPercent + '%' }">
                        {{ character.game_state.player.currentHp }} / {{ character.game_state.player.maxHp }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card mb-2">
                  <div class="card-body py-2">
                    <small class="text-muted">经验值</small>
                    <div class="progress mt-1">
                      <div class="progress-bar bg-warning" :style="{ width: expPercent + '%' }">
                        {{ character.game_state.player.experience }} / {{ character.game_state.player.experienceToNext }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card mb-2">
                  <div class="card-body py-2">
                    <small class="text-muted">金币</small>
                    <div class="fs-5 text-warning">{{ formatNumber(character.game_state.player.gold) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 属性 -->
            <h6 class="text-muted mb-2 mt-3">基础属性</h6>
            <div class="row" v-if="character.game_state.player.stats">
              <div class="col-md-3 col-6 mb-2" v-for="(value, key) in statsDisplay" :key="key">
                <div class="card">
                  <div class="card-body py-2 text-center">
                    <small class="text-muted d-block">{{ value.label }}</small>
                    <span class="fs-5">{{ value.value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 技能 -->
            <h6 class="text-muted mb-2 mt-3">已学技能</h6>
            <div v-if="character.game_state.player.skills && character.game_state.player.skills.length > 0">
              <span v-for="skill in character.game_state.player.skills" :key="skill" class="badge bg-secondary me-1 mb-1">
                {{ skill }}
              </span>
            </div>
            <div v-else class="text-muted">暂无技能</div>

            <!-- 统计数据 -->
            <h6 class="text-muted mb-2 mt-3">游戏统计</h6>
            <div class="row" v-if="character.game_state.player.statistics">
              <div class="col-md-3 col-6 mb-2" v-for="(value, key) in statisticsDisplay" :key="key">
                <div class="card">
                  <div class="card-body py-2 text-center">
                    <small class="text-muted d-block">{{ value.label }}</small>
                    <span class="fs-6">{{ formatNumber(value.value) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="alert alert-warning">
            无法解析游戏状态数据
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">关闭</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="show"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  character: Object
})

defineEmits(['close'])

// 职业名称映射
const CLASS_NAMES = {
  warrior: '战士',
  paladin: '圣骑士',
  hunter: '猎人',
  rogue: '盗贼',
  priest: '牧师',
  shaman: '萨满祭司',
  mage: '法师',
  warlock: '术士',
  druid: '德鲁伊'
}

// 属性显示映射
const STATS_LABELS = {
  health: '生命',
  mana: '法力',
  strength: '力量',
  agility: '敏捷',
  intellect: '智力',
  stamina: '耐力',
  spirit: '精神'
}

// 统计数据显示映射
const statisticsDisplay = computed(() => {
  const stats = props.character?.game_state?.player?.statistics || {}
  return {
    monstersKilled: { label: '击杀怪物', value: stats.monstersKilled || 0 },
    damageDealt: { label: '造成伤害', value: stats.damageDealt || 0 },
    damageTaken: { label: '承受伤害', value: stats.damageTaken || 0 },
    healingDone: { label: '治疗量', value: stats.healingDone || 0 },
    goldEarned: { label: '获得金币', value: stats.goldEarned || 0 },
    questsCompleted: { label: '完成任务', value: stats.questsCompleted || 0 }
  }
})

// 属性显示
const statsDisplay = computed(() => {
  const stats = props.character?.game_state?.player?.stats || {}
  const result = {}
  for (const [key, label] of Object.entries(STATS_LABELS)) {
    if (stats[key] !== undefined) {
      result[key] = { label, value: stats[key] }
    }
  }
  return result
})

// 生命值百分比
const hpPercent = computed(() => {
  const player = props.character?.game_state?.player
  if (!player || !player.maxHp) return 0
  return Math.round((player.currentHp / player.maxHp) * 100)
})

// 经验值百分比
const expPercent = computed(() => {
  const player = props.character?.game_state?.player
  if (!player || !player.experienceToNext) return 0
  return Math.round((player.experience / player.experienceToNext) * 100)
})

function getClassName(classId) {
  return CLASS_NAMES[classId] || classId
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

function formatNumber(num) {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString()
}
</script>

<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.5);
}
</style>
