import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Users from '../views/Users.vue'
import Characters from '../views/Characters.vue'
import ClassConfigs from '../views/ClassConfigs.vue'
import { setupRouterGuards } from './guards.js'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAuth: true }
  },
  {
    path: '/characters',
    name: 'Characters',
    component: Characters,
    meta: { requiresAuth: true }
  },
  {
    path: '/class-configs',
    name: 'ClassConfigs',
    component: ClassConfigs,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory('/admin.html'),
  routes
})

// 设置路由守卫
setupRouterGuards(router)

export default router

