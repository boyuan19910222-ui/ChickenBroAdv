<template>
  <div class="container d-flex align-items-center justify-content-center" style="min-height: 100vh;">
    <div class="card shadow" style="max-width: 400px; width: 100%;">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">GM 管理面板登录</h5>
      </div>
      <div class="card-body">
        <div v-if="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="username" class="form-label">用户名</label>
            <input
              type="text"
              class="form-control"
              id="username"
              v-model="username"
              required
              placeholder="请输入用户名"
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">密码</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="password"
              required
              placeholder="请输入密码"
            />
          </div>
          <div class="mb-3 form-check">
            <input
              type="checkbox"
              class="form-check-input"
              id="autoLogin"
              v-model="autoLogin"
            />
            <label class="form-check-label" for="autoLogin">
              保持登录状态
            </label>
          </div>
          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            <span v-if="loading">
              <span class="spinner-border spinner-border-sm me-2"></span>
              登录中...
            </span>
            <span v-else>登录</span>
          </button>
        </form>
        <div class="mt-3 text-center">
          <a href="/" class="text-decoration-none">返回游戏</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const autoLogin = ref(true)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
        auto_login: autoLogin.value ? 1 : 0
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || '登录失败')
    }

    // Check if user is admin
    if (!data.user.is_admin) {
      error.value = '您没有管理员权限，无法访问管理面板'
      loading.value = false
      return
    }

    // Store token and user info
    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin_user', JSON.stringify(data.user))

    // Redirect to home
    router.push('/home')
  } catch (err) {
    error.value = err.message || '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
