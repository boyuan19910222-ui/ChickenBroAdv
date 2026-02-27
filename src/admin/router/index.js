import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Users from '../views/Users.vue'
import Characters from '../views/Characters.vue'
import ClassConfigs from '../views/ClassConfigs.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  },
  {
    path: '/characters',
    name: 'Characters',
    component: Characters
  },
  {
    path: '/class-configs',
    name: 'ClassConfigs',
    component: ClassConfigs
  }
]

const router = createRouter({
  history: createWebHistory('/admin.html'),
  routes
})

// TODO: Add navigation guard to check login status and admin permission

export default router

