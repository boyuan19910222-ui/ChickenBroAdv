<template>
  <div class="login-scene">
    <!-- 右上角反馈二维码 -->
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

    <div class="login-container pixel-panel">
      <h1 class="login-title">鸡哥大冒险</h1>
      <p class="login-subtitle">登录以开始游戏</p>

      <!-- 标签切换 -->
      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >登录</button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >注册</button>
      </div>

      <!-- 错误提示 -->
      <div v-if="authStore.error" class="error-msg">
        {{ authStore.error }}
      </div>

      <!-- 登录表单 -->
      <form v-if="activeTab === 'login'" class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="loginForm.username"
            type="text"
            class="form-input"
            placeholder="输入用户名"
            autocomplete="username"
            data-testid="login-username"
          />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="loginForm.password"
            type="password"
            class="form-input"
            placeholder="输入密码"
            autocomplete="current-password"
            data-testid="login-password"
          />
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="loginForm.autoLogin" />
            <span>自动登录（30天内免登录）</span>
          </label>
        </div>
        <button
          type="submit"
          class="pixel-btn primary submit-btn"
          :disabled="authStore.loading"
          data-testid="login-submit"
        >
          <span>{{ authStore.loading ? '登录中...' : '登录' }}</span>
        </button>
      </form>

      <!-- 注册表单 -->
      <form v-if="activeTab === 'register'" class="login-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="registerForm.username"
            type="text"
            class="form-input"
            placeholder="3-20位字母、数字或下划线"
            autocomplete="username"
            data-testid="reg-username"
          />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="registerForm.password"
            type="password"
            class="form-input"
            placeholder="6-32位密码"
            autocomplete="new-password"
            data-testid="reg-password"
          />
        </div>
        <div class="form-group">
          <label class="form-label">昵称</label>
          <input
            v-model="registerForm.nickname"
            type="text"
            class="form-input"
            placeholder="2-12个字符"
            data-testid="reg-nickname"
          />
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="registerForm.autoLogin" />
            <span>自动登录（30天内免登录）</span>
          </label>
        </div>
        <button
          type="submit"
          class="pixel-btn primary submit-btn"
          :disabled="authStore.loading"
          data-testid="reg-submit"
        >
          <span>{{ authStore.loading ? '注册中...' : '注册' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import { useMultiplayerStore } from '@/stores/multiplayerStore.js'

const router = useRouter()
const authStore = useAuthStore()
const mpStore = useMultiplayerStore()

const showQrcode = ref(false)
const activeTab = ref('login')

const loginForm = ref({ username: '', password: '', autoLogin: false })
const registerForm = ref({ username: '', password: '', nickname: '', autoLogin: false })

async function handleLogin() {
  authStore.clearError()
  const success = await authStore.login(
    loginForm.value.username,
    loginForm.value.password,
    loginForm.value.autoLogin
  )
  if (success) {
    mpStore.connect()
    router.push('/characters')
  }
}

async function handleRegister() {
  authStore.clearError()
  const success = await authStore.register(
    registerForm.value.username,
    registerForm.value.password,
    registerForm.value.nickname,
    registerForm.value.autoLogin
  )
  if (success) {
    mpStore.connect()
    router.push('/characters')
  }
}

onUnmounted(() => {
  authStore.clearError()
})
</script>

<style scoped>
.login-scene {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-surface) 50%, var(--bg-primary) 100%);
  position: relative;
}

.login-container {
  width: 360px;
  max-width: 90vw;
  padding: 30px 24px;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

.login-title {
  font-family: var(--pixel-font);
  font-size: var(--fs-md);
  color: var(--primary-gold);
  text-shadow: 2px 2px 0 var(--dark-gold);
  margin-bottom: 4px;
}

.login-subtitle {
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--border-primary);
  padding-bottom: 4px;
}

.tab-btn {
  flex: 1;
  background: none;
  border: 2px solid transparent;
  border-bottom: none;
  color: var(--text-secondary);
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  padding: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn.active {
  color: var(--primary-gold);
  border-color: var(--primary-gold);
  border-bottom: none;
  background: var(--bg-tertiary);
}

.tab-btn:hover:not(.active) {
  color: var(--text-primary);
}

.error-msg {
  background: rgba(255, 68, 68, 0.15);
  border: 1px solid var(--color-hP);
  color: var(--color-hP);
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  padding: 8px 12px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  text-align: left;
}

.form-label {
  display: block;
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  background: var(--bg-primary);
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  padding: 8px 10px;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus {
  border-color: var(--primary-gold);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--pixel-font);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.submit-btn {
  width: 100%;
  margin-top: 4px;
  flex-direction: row;
  justify-content: center;
  padding: 10px;
}

/* 反馈按钮 */
.feedback-btn-wrapper {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
