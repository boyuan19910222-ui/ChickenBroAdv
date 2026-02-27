<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" to="/home">GM 管理面板</RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/home">首页</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/users">用户管理</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/characters">角色管理</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/class-configs">职业配置</RouterLink>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
            >
              {{ currentUser?.nickname || '管理员' }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="/">返回游戏</a>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="$emit('logout')">
                  退出登录
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

defineEmits(['logout'])

const currentUser = ref(null)

onMounted(() => {
  // Load user info from localStorage
  const userStr = localStorage.getItem('admin_user')
  if (userStr) {
    currentUser.value = JSON.parse(userStr)
  }
})
</script>
