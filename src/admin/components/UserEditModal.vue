<template>
  <div class="modal fade" :class="{ show: show }" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ user?.id ? '编辑用户' : '新建用户' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="username" class="form-label">用户名</label>
              <input
                type="text"
                class="form-control"
                id="username"
                v-model="formData.username"
                :disabled="!!user?.id"
                required
              />
              <small class="form-text text-muted">用户名创建后不可修改</small>
            </div>
            <div class="mb-3">
              <label for="nickname" class="form-label">昵称</label>
              <input
                type="text"
                class="form-control"
                id="nickname"
                v-model="formData.nickname"
                required
              />
            </div>
            <div class="mb-3" v-if="!user?.id">
              <label for="password" class="form-label">密码</label>
              <input
                type="password"
                class="form-control"
                id="password"
                v-model="formData.password"
                required
              />
            </div>
            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="is_admin"
                v-model="formData.is_admin"
              />
              <label class="form-check-label" for="is_admin">
                管理员
              </label>
              <small class="form-text text-muted">
                勾选后该用户将拥有管理面板访问权限
              </small>
            </div>
            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="auto_login"
                v-model="formData.auto_login"
              />
              <label class="form-check-label" for="auto_login">
                保持登录状态
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="loading">
            <span v-if="loading">
              <span class="spinner-border spinner-border-sm me-2"></span>
              保存中...
            </span>
            <span v-else>保存</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  user: Object
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  username: '',
  nickname: '',
  password: '',
  is_admin: false,
  auto_login: true
})

const loading = ref(false)
const error = ref('')

// Initialize form data when user prop changes
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      username: newUser.username,
      nickname: newUser.nickname,
      password: '',
      is_admin: !!newUser.is_admin,
      auto_login: !!newUser.auto_login
    }
  } else {
    formData.value = {
      username: '',
      nickname: '',
      password: '',
      is_admin: false,
      auto_login: true
    }
  }
  error.value = ''
}, { immediate: true })

async function handleSubmit() {
  loading.value = true
  error.value = ''

  // Validate
  if (!formData.value.username || !formData.value.nickname) {
    error.value = '请填写用户名和昵称'
    loading.value = false
    return
  }

  if (!props.user?.id && !formData.value.password) {
    error.value = '请填写密码'
    loading.value = false
    return
  }

  try {
    emit('save', formData.value)
  } catch (err) {
    error.value = err.message || '保存失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}
</style>
