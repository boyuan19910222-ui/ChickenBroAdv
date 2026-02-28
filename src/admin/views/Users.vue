<template>
  <div class="container-fluid mt-4">
    <h2 class="mb-4">用户管理</h2>

    <!-- Search and Actions -->
    <div class="row mb-3">
      <div class="col-md-6">
        <input
          type="text"
          class="form-control"
          placeholder="搜索用户名或昵称..."
          v-model="searchQuery"
          @input="debouncedSearch"
        />
      </div>
      <div class="col-md-6 text-end">
        <button class="btn btn-success" @click="showCreateModal = true">
          <i class="bi bi-plus-lg me-2"></i>新建用户
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
      <p class="mt-2">加载中...</p>
    </div>

    <!-- Users Table -->
    <div v-else-if="users.length > 0" class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>管理员</th>
            <th>创建时间</th>
            <th>最后登录</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.nickname }}</td>
            <td>
              <span v-if="user.is_admin" class="badge bg-success">是</span>
              <span v-else class="badge bg-secondary">否</span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>{{ user.last_login ? formatDate(user.last_login) : '-' }}</td>
            <td>
              <button class="btn btn-sm btn-primary me-1" @click="editUser(user)">
                编辑
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="confirmDelete(user)"
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
      未找到匹配的用户
    </div>

    <!-- Pagination -->
    <nav v-if="pagination.totalPages > 1" class="mt-3">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: pagination.page === 1 }">
          <a class="page-link" href="#" @click.prevent="changePage(1)">首页</a>
        </li>
        <li class="page-item" :class="{ disabled: pagination.page === 1 }">
          <a class="page-link" href="#" @click.prevent="changePage(pagination.page - 1)">
            上一页
          </a>
        </li>
        <li class="page-item active">
          <span class="page-link">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        </li>
        <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
          <a class="page-link" href="#" @click.prevent="changePage(pagination.page + 1)">
            下一页
          </a>
        </li>
        <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
          <a class="page-link" href="#" @click.prevent="changePage(pagination.totalPages)">
            尾页
          </a>
        </li>
      </ul>
    </nav>

    <!-- Edit User Modal -->
    <UserEditModal
      :show="showEditModal"
      :user="currentUser"
      @close="showEditModal = false"
      @save="handleUserSave"
    />

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" :class="{ show: showDeleteModal }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认删除用户</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>确认删除用户 <strong>{{ currentUser?.username }}</strong>？</p>
            <p class="text-danger">此操作将同时删除该用户的所有角色，且无法撤销！</p>
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
import { useRouter } from 'vue-router'
import { getUsers, updateUser, deleteUser } from '../services/users.js'
import UserEditModal from '../components/UserEditModal.vue'

const router = useRouter()

const users = ref([])
const pagination = ref({ total: 0, page: 1, pageSize: 20, totalPages: 0 })
const loading = ref(false)
const searchQuery = ref('')
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const currentUser = ref(null)
const deleting = ref(false)

let searchTimeout = null

onMounted(() => {
  loadUsers()
})

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadUsers(1)
  }, 500)
}

async function loadUsers(page = pagination.value.page) {
  loading.value = true
  try {
    const result = await getUsers({ page, pageSize: pagination.value.pageSize, search: searchQuery.value })
    users.value = result.data || []
    pagination.value = result.pagination || pagination.value
  } catch (err) {
    console.error('Failed to load users:', err)
    alert('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.totalPages) {
    loadUsers(page)
  }
}

function editUser(user) {
  currentUser.value = { ...user }
  showEditModal.value = true
}

function confirmDelete(user) {
  currentUser.value = user
  showDeleteModal.value = true
}

async function handleUserSave(userData) {
  loading.value = true
  try {
    await updateUser(userData.id, userData)
    showEditModal.value = false
    await loadUsers(pagination.value.page)
  } catch (err) {
    console.error('Failed to update user:', err)
    alert('更新用户失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await deleteUser(currentUser.value.id)
    showDeleteModal.value = false
    await loadUsers(pagination.value.page)
  } catch (err) {
    console.error('Failed to delete user:', err)
    alert('删除用户失败')
  } finally {
    deleting.value = false
  }
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
