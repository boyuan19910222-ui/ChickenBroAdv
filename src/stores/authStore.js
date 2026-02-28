/**
 * 认证 Store
 * 独立管理用户认证状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 动态获取 API 地址
const API_BASE = ""

export const useAuthStore = defineStore('auth', () => {
    // State
    const token = ref(localStorage.getItem('mp_token'))
    const user = ref(JSON.parse(localStorage.getItem('mp_user') || 'null'))
    const autoLogin = ref(localStorage.getItem('mp_autoLogin') === 'true')
    const loading = ref(false)
    const error = ref(null)

    // Getters
    const isLoggedIn = computed(() => !!token.value && !!user.value)
    const isAdmin = computed(() => {
        const stored = localStorage.getItem('mp_is_admin')
        return stored === '1' || stored === 1
    })

    // Actions
    async function login(username, password, autoLoginFlag = false) {
        loading.value = true
        error.value = null
        try {
            const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    auto_login: autoLoginFlag
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                error.value = data.message || '登录失败'
                return false
            }
            token.value = data.token
            user.value = data.user
            autoLogin.value = autoLoginFlag
            localStorage.setItem('mp_token', data.token)
            localStorage.setItem('mp_user', JSON.stringify(data.user))
            localStorage.setItem('mp_autoLogin', autoLoginFlag.toString())
            // Store is_admin for admin panel access check
            localStorage.setItem('mp_is_admin', (data.user.is_admin || 0).toString())
            return true
        } catch (err) {
            error.value = '网络错误，请检查服务器连接'
            return false
        } finally {
            loading.value = false
        }
    }

    async function register(username, password, nickname, autoLoginFlag = false) {
        loading.value = true
        error.value = null
        try {
            const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    nickname,
                    auto_login: autoLoginFlag
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                error.value = data.message || '注册失败'
                return false
            }
            // 注册成功后自动登录
            token.value = data.token
            user.value = data.user
            autoLogin.value = autoLoginFlag
            localStorage.setItem('mp_token', data.token)
            localStorage.setItem('mp_user', JSON.stringify(data.user))
            localStorage.setItem('mp_autoLogin', autoLoginFlag.toString())
            // Store is_admin for admin panel access check
            localStorage.setItem('mp_is_admin', (data.user.is_admin || 0).toString())
            return true
        } catch (err) {
            error.value = '网络错误，请检查服务器连接'
            return false
        } finally {
            loading.value = false
        }
    }

    async function logout() {
        loading.value = true
        error.value = null
        try {
            await fetch(`${API_BASE}/api/v1/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.value}`
                },
            })
        } catch (err) {
            // 即使服务器请求失败，也继续清除本地状态
            console.warn('Logout request failed:', err)
        } finally {
            // 清除 localStorage
            localStorage.removeItem('mp_token')
            localStorage.removeItem('mp_user')
            localStorage.removeItem('mp_autoLogin')
            // 重置 state
            token.value = null
            user.value = null
            autoLogin.value = false
            loading.value = false
        }
    }

    function clearError() {
        error.value = null
    }

    function checkAuth() {
        // 检查本地 token 是否有效
        return !!token.value && !!user.value
    }

    return {
        // State
        token,
        user,
        autoLogin,
        loading,
        error,
        // Getters
        isLoggedIn,
        isAdmin,
        // Actions
        login,
        register,
        logout,
        clearError,
        checkAuth
    }
})
