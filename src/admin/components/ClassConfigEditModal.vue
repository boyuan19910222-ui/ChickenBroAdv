<template>
  <div class="modal fade" :class="{ show: show }" tabindex="-1" style="display: block;" v-if="show">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isCreate ? '新建职业配置' : '编辑职业配置' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSave">
            <!-- 基本信息 -->
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">职业 ID <span class="text-danger">*</span></label>
                <select
                  v-if="isCreate"
                  class="form-select"
                  v-model="form.class_id"
                  required
                >
                  <option value="">请选择职业</option>
                  <option v-for="cls in availableClasses" :key="cls.id" :value="cls.id">
                    {{ cls.name }} ({{ cls.id }})
                  </option>
                </select>
                <input
                  v-else
                  type="text"
                  class="form-control"
                  :value="form.class_id"
                  disabled
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">职业名称 <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.name"
                  required
                  placeholder="如：战士"
                />
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">资源类型 <span class="text-danger">*</span></label>
                <select class="form-select" v-model="form.resource_type" required>
                  <option value="">请选择资源类型</option>
                  <option value="mana">法力 (mana)</option>
                  <option value="rage">怒气 (rage)</option>
                  <option value="energy">能量 (energy)</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">资源上限 <span class="text-danger">*</span></label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="form.resource_max"
                  required
                  min="1"
                  placeholder="如：100"
                />
              </div>
            </div>

            <!-- 基础属性 -->
            <h6 class="text-muted mb-2">基础属性</h6>
            <div class="row">
              <div class="col-md-4 mb-2" v-for="(label, key) in statsLabels" :key="key">
                <label class="form-label small">{{ label }}</label>
                <input
                  type="number"
                  class="form-control form-control-sm"
                  v-model.number="form.base_stats[key]"
                  min="0"
                />
              </div>
            </div>

            <!-- 每级成长 -->
            <h6 class="text-muted mb-2 mt-3">每级成长</h6>
            <div class="row">
              <div class="col-md-4 mb-2" v-for="(label, key) in statsLabels" :key="key">
                <label class="form-label small">{{ label }}</label>
                <input
                  type="number"
                  class="form-control form-control-sm"
                  v-model.number="form.growth_per_level[key]"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <!-- 基础技能 -->
            <div class="mb-3 mt-3">
              <label class="form-label">基础技能（逗号分隔）</label>
              <input
                type="text"
                class="form-control"
                v-model="skillsString"
                placeholder="如：heroicStrike,charge,rend"
              />
              <div class="form-text">多个技能ID用英文逗号分隔</div>
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
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: Boolean,
  config: Object,
  isCreate: Boolean
})

const emit = defineEmits(['close', 'save'])

const saving = ref(false)

// 属性标签
const statsLabels = {
  health: '生命值',
  mana: '法力值',
  strength: '力量',
  agility: '敏捷',
  intellect: '智力',
  stamina: '耐力',
  spirit: '精神'
}

// 所有可用职业
const allClasses = [
  { id: 'warrior', name: '战士' },
  { id: 'paladin', name: '圣骑士' },
  { id: 'hunter', name: '猎人' },
  { id: 'rogue', name: '盗贼' },
  { id: 'priest', name: '牧师' },
  { id: 'shaman', name: '萨满祭司' },
  { id: 'mage', name: '法师' },
  { id: 'warlock', name: '术士' },
  { id: 'druid', name: '德鲁伊' }
]

// 表单数据
const form = ref({
  class_id: '',
  name: '',
  base_stats: { health: 100, mana: 50, strength: 10, agility: 10, intellect: 10, stamina: 5, spirit: 5 },
  growth_per_level: { health: 10, mana: 5, strength: 2, agility: 2, intellect: 2, stamina: 0.5, spirit: 0.5 },
  base_skills: [],
  resource_type: 'mana',
  resource_max: 100
})

// 技能字符串（用于显示和编辑）
const skillsString = computed({
  get: () => (form.value.base_skills || []).join(','),
  set: (val) => {
    form.value.base_skills = val.split(',').map(s => s.trim()).filter(s => s)
  }
})

// 可用职业列表（创建时过滤掉已存在的）
const availableClasses = computed(() => {
  return allClasses
})

// 监听 config 变化，初始化表单
watch(() => props.config, (newConfig) => {
  if (newConfig && !props.isCreate) {
    form.value = {
      id: newConfig.id,
      class_id: newConfig.class_id,
      name: newConfig.name,
      base_stats: { ...(newConfig.base_stats || {}) },
      growth_per_level: { ...(newConfig.growth_per_level || {}) },
      base_skills: [...(newConfig.base_skills || [])],
      resource_type: newConfig.resource_type,
      resource_max: newConfig.resource_max
    }
  } else if (props.isCreate) {
    // 重置为默认值
    form.value = {
      class_id: '',
      name: '',
      base_stats: { health: 100, mana: 50, strength: 10, agility: 10, intellect: 10, stamina: 5, spirit: 5 },
      growth_per_level: { health: 10, mana: 5, strength: 2, agility: 2, intellect: 2, stamina: 0.5, spirit: 0.5 },
      base_skills: [],
      resource_type: 'mana',
      resource_max: 100
    }
  }
}, { immediate: true })

async function handleSave() {
  // 验证必填字段
  if (!form.value.class_id || !form.value.name || !form.value.resource_type || !form.value.resource_max) {
    alert('请填写所有必填字段')
    return
  }

  saving.value = true
  try {
    const saveData = {
      class_id: form.value.class_id,
      name: form.value.name,
      base_stats: form.value.base_stats,
      growth_per_level: form.value.growth_per_level,
      base_skills: form.value.base_skills,
      resource_type: form.value.resource_type,
      resource_max: form.value.resource_max
    }

    if (!props.isCreate && props.config) {
      saveData.id = props.config.id
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
