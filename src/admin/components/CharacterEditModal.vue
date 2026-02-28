<template>
  <div class="modal fade" :class="{ show: show }" tabindex="-1" style="display: block;" v-if="show">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">编辑角色</h5>
          <button type="button" class="btn-close" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal-body" v-if="form">
          <form @submit.prevent="handleSave">
            <!-- 角色名 -->
            <div class="mb-3">
              <label class="form-label">角色名</label>
              <input
                type="text"
                class="form-control"
                v-model="form.name"
                placeholder="2-12位中文、字母、数字或下划线"
              />
              <div class="form-text">角色名须为2-12位中文、字母、数字或下划线</div>
            </div>

            <!-- 等级 -->
            <div class="mb-3">
              <label class="form-label">等级</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.level"
                min="1"
                max="60"
              />
              <div class="form-text">等级范围：1-60</div>
            </div>

            <!-- 金币（如果有 game_state） -->
            <div class="mb-3" v-if="form.game_state && form.game_state.player">
              <label class="form-label">金币</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.game_state.player.gold"
                min="0"
              />
            </div>

            <!-- 当前 HP（如果有 game_state） -->
            <div class="mb-3" v-if="form.game_state && form.game_state.player">
              <label class="form-label">当前生命值</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.game_state.player.currentHp"
                min="0"
                :max="form.game_state.player.maxHp"
              />
              <div class="form-text">最大生命值: {{ form.game_state.player.maxHp }}</div>
            </div>

            <!-- 经验值（如果有 game_state） -->
            <div class="mb-3" v-if="form.game_state && form.game_state.player">
              <label class="form-label">经验值</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.game_state.player.experience"
                min="0"
              />
              <div class="form-text">升级所需: {{ form.game_state.player.experienceToNext }}</div>
            </div>

            <!-- 只读信息 -->
            <div class="mb-3">
              <label class="form-label text-muted">职业</label>
              <input
                type="text"
                class="form-control"
                :value="getClassName(character?.class)"
                disabled
              />
            </div>

            <div class="mb-3">
              <label class="form-label text-muted">所属用户</label>
              <input
                type="text"
                class="form-control"
                :value="character?.user?.nickname || character?.user?.username || '-'"
                disabled
              />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">取消</button>
          <button type="button" class="btn btn-primary" @click="handleSave" :disabled="saving">
            <span v-if="saving">保存中...</span>
            <span v-else>保存</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="show"></div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  character: Object
})

const emit = defineEmits(['close', 'save'])

const form = ref(null)
const saving = ref(false)

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

// 监听 character 变化，初始化表单
watch(() => props.character, (newChar) => {
  if (newChar) {
    form.value = {
      id: newChar.id,
      name: newChar.name,
      level: newChar.level,
      game_state: newChar.game_state ? JSON.parse(JSON.stringify(newChar.game_state)) : null
    }
  }
}, { immediate: true })

function getClassName(classId) {
  return CLASS_NAMES[classId] || classId
}

async function handleSave() {
  // 验证角色名
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,12}$/
  if (!nameRegex.test(form.value.name)) {
    alert('角色名须为2-12位中文、字母、数字或下划线')
    return
  }

  // 验证等级
  if (form.value.level < 1 || form.value.level > 60) {
    alert('等级必须在1-60之间')
    return
  }

  saving.value = true
  try {
    const saveData = {
      id: form.value.id,
      name: form.value.name,
      level: form.value.level
    }

    // 如果有 game_state 修改，则传递
    if (form.value.game_state) {
      saveData.game_state = form.value.game_state
    }

    emit('save', saveData)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.5);
}
</style>
