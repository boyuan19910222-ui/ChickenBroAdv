<template>
  <div>
    <!-- Navbar -->
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
                  <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                    退出登录
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">用户管理</h5>
            </div>
            <div class="card-body">
              <p class="card-text">管理系统用户，包括查看、编辑、删除用户以及设置管理员权限。</p>
              <RouterLink class="btn btn-primary" to="/users">
                进入用户管理
              </RouterLink>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">角色管理</h5>
            </div>
            <div class="card-body">
              <p class="card-text">管理游戏角色，查看角色详情、编辑角色属性、删除角色。</p>
              <RouterLink class="btn btn-primary" to="/characters">
                进入角色管理
              </RouterLink>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">职业配置</h5>
            </div>
            <div class="card-body">
              <p class="card-text">管理职业配置，包括创建、编辑、删除职业配置以及热重载配置。</p>
              <RouterLink class="btn btn-primary" to="/class-configs">
                进入职业配置
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">快速操作</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <RouterLink class="btn btn-outline-primary w-100 mb-2" to="/users">
                    <i class="bi bi-people-fill me-2"></i>用户列表
                  </RouterLink>
                  <RouterLink class="btn btn-outline-success w-100" to="/characters">
                    <i class="bi bi-person-fill me-2"></i>角色列表
                  </RouterLink>
                </div>
                <div class="col-md-6">
                  <RouterLink class="btn btn-outline-warning w-100 mb-2" to="/class-configs">
                    <i class="bi bi-gear-fill me-2"></i>职业配置
                  </RouterLink>
                  <RouterLink class="btn btn-outline-info w-100" to="/">
                    <i class="bi bi-house-fill me-2"></i>返回游戏
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref(null)

function handleLogout() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  router.push('/login')
}

onMounted(() => {
  // Load user info from localStorage
  const userStr = localStorage.getItem('admin_user')
  if (userStr) {
    currentUser.value = JSON.parse(userStr)
  }
})
</script>
