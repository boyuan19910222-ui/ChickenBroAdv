<template>
  <div class="container-fluid mt-4">
    <h2 class="mb-4">职业配置管理</h2>

    <!-- Actions -->
    <div class="row mb-3">
      <div class="col-md-6">
        <button class="btn btn-success" @click="showCreateModal = true">
          <i class="bi bi-plus-lg me-2"></i>新建职业配置
        </button>
      </div>
      <div class="col-md-6 text-end">
        <button class="btn btn-warning" @click="handleReload" :disabled="reloading">
          <span v-if="reloading">重载中...</span>
          <span v-else>热重载配置</span>
        </button>
      </div>
    </div>

    <!-- Success Alert -->
    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''"></button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
      <p class="mt-2">加载中...</p>
    </div>

    <!-- Class Configs Table -->
    <div v-else-if="configs.length > 0" class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>职业ID</th>
            <th>职业名称</th>
            <th>资源类型</th>
            <th>资源上限</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="config in configs" :key="config.id">
            <td>{{ config.id }}</td>
            <td><code>{{ config.class_id }}</code></td>
            <td>{{ config.name }}</td>
            <td>
              <span class="badge" :class="getResourceBadgeClass(config.resource_type)">
                {{ getResourceTypeName(config.resource_type) }}
              </span>
            </td>
            <td>{{ config.resource_max }}</td>
            <td>{{ formatDate(config.updated_at) }}</td>
            <td>
              <button class="btn btn-sm btn-primary me-1" @click="editConfig(config)">
                编辑
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="confirmDelete(config)"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- No Results -->
    <div v-else class="alert alert-info" role="alert">
      暂无职业配置数据
    </div>

    <!-- Edit/Create Modal -->
    <ClassConfigEditModal
      :show="showEditModal || showCreateModal"
      :config="currentConfig"
      :isCreate="showCreateModal"
      @close="closeModals"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" :class="{ show: showDeleteModal }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认删除职业配置</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>确认删除职业配置 <strong>{{ currentConfig?.name }}</strong>（{{ currentConfig?.class_id }}）？</p>
            <p class="text-danger">此操作无法撤销！删除后需要重新创建配置。</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
              取消
            </button>
            <button type="button" class="btn btn-danger" @click="handleDelete" :disabled="deleting">
              <span v-if="deleting">删除中...</span>
              <span v-else>确认删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getClassConfigs,
  createClassConfig,
  updateClassConfig,
  deleteClassConfig,
  reloadClassConfigs
} from '../services/class-configs.js'
import ClassConfigEditModal from '../components/ClassConfigEditModal.vue'

// 资源类型映射
const RESOURCE_TYPES = {
  mana: { name: '法力', badge: 'bg-primary' },
  rage: { name: '怒气', badge: 'bg-danger' },
  energy: { name: '能量', badge: 'bg-warning' }
}

const configs = ref([])
const loading = ref(false)
const reloading = ref(false)
const deleting = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const currentConfig = ref(null)
const successMessage = ref('')

onMounted(() => {
  loadConfigs()
})

async function loadConfigs() {
  loading.value = true
  try {
    const result = await getClassConfigs()
    configs.value = result.data || []
  } catch (err) {
    console.error('Failed to load class configs:', err)
    alert('加载职业配置列表失败')
  } finally {
    loading.value = false
  }
}

function editConfig(config) {
  currentConfig.value = { ...config }
  showEditModal.value = true
}

function confirmDelete(config) {
  currentConfig.value = config
  showDeleteModal.value = true
}

function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  currentConfig.value = null
}

async function handleSave(configData) {
  loading.value = true
  try {
    if (showCreateModal.value) {
      await createClassConfig(configData)
      successMessage.value = '职业配置创建成功'
    } else {
      await updateClassConfig(configData.id, configData)
      successMessage.value = '职业配置更新成功'
    }
    closeModals()
    await loadConfigs()
    // 3秒后清除成功消息
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (err) {
    console.error('Failed to save class config:', err)
    const errorData = await err.response?.json() || {}
    alert(errorData.message || '保存职业配置失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await deleteClassConfig(currentConfig.value.id)
    showDeleteModal.value = false
    successMessage.value = '职业配置删除成功'
    await loadConfigs()
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (err) {
    console.error('Failed to delete class config:', err)
    alert('删除职业配置失败')
  } finally {
    deleting.value = false
  }
}

async function handleReload() {
  reloading.value = true
  try {
    const result = await reloadClassConfigs()
    if (result.success) {
      successMessage.value = result.message || '职业配置已热重载'
      setTimeout(() => { successMessage.value = '' }, 3000)
    } else {
      alert(result.message || '热重载失败')
    }
  } catch (err) {
    console.error('Failed to reload class configs:', err)
    alert('热重载失败')
  } finally {
    reloading.value = false
  }
}

function getResourceTypeName(type) {
  return RESOURCE_TYPES[type]?.name || type
}

function getResourceBadgeClass(type) {
  return RESOURCE_TYPES[type]?.badge || 'bg-secondary'
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
