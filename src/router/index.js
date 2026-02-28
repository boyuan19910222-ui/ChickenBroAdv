import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'

const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/characters',
    name: 'characters',
    component: () => import('@/views/CharacterSelectView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('@/views/CreateCharacterView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('@/views/GameView.vue'),
    meta: { requiresAuth: true, requiresCharacter: true },
  },
  {
    path: '/waiting/:roomId',
    name: 'waiting',
    component: () => import('@/views/WaitingRoomView.vue'),
    meta: { requiresAuth: true },
  },
  // /battle/:roomId 路由已废弃，重定向到游戏页面
  {
    path: '/battle/:roomId',
    redirect: '/game',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 已登录用户访问登录页，重定向到角色选择
  if (to.path === '/' && authStore.isLoggedIn) {
    return next('/characters')
  }

  // 需要认证的页面
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next('/')
  }

  // 需要选择角色的页面（可选，后续实现）
  if (to.meta.requiresCharacter) {
    // 检查是否有选中的角色
    // 暂时跳过，后续在 gameStore 中实现
  }

  next()
})

export default router
