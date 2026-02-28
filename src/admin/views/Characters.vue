<template>
  <div class="container-fluid mt-4">
    <h2 class="mb-4">角色管理</h2>

    <!-- Search and Actions -->
    <div class="row mb-3">
      <div class="col-md-6">
        <input
          type="text"
          class="form-control"
          placeholder="搜索角色名..."
          v-model="searchQuery"
          @input="debouncedSearch"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
      <p class="mt-2">加载中...</p>
    </div>

    <!-- Characters Table -->
    <div v-else-if="characters.length > 0" class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>角色名</th>
            <th>职业</th>
            <th>等级</th>
            <th>所属用户</th>
            <th>最后游玩</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="char in characters" :key="char.id">
            <td>{{ char.id }}</td>
            <td>{{ char.name }}</td>
            <td>
              <span class="badge bg-info">{{ getClassName(char.class) }}</span>
            </td>
            <td>
              <span class="badge bg-primary">{{ char.level }}</span>
            </td>
            <td>
              <span v-if="char.user">{{ char.user.nickname || char.user.username }}</span>
              <span v-else class="text-muted">-</span>
            </td>
            <td>{{ char.last_played_at ? formatDate(char.last_played_at) : '-' }}</td>
            <td>
              <button class="btn btn-sm btn-outline-info me-1" @click="viewCharacter(char)">
                详情
              </button>
              <button class="btn btn-sm btn-primary me-1" @click="editCharacter(char)">
                编辑
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="confirmDelete(char)"
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
      未找到匹配的角色
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

    <!-- Character Detail Modal -->
    <CharacterDetailModal
      :show="showDetailModal"
      :character="currentCharacter"
      @close="showDetailModal = false"
    />

    <!-- Character Edit Modal -->
    <CharacterEditModal
      :show="showEditModal"
      :character="currentCharacter"
      @close="showEditModal = false"
      @save="handleCharacterSave"
    />

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" :class="{ show: showDeleteModal }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认删除角色</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p>确认删除角色 <strong>{{ currentCharacter?.name }}</strong>？</p>
            <p class="text-danger">此操作无法撤销！</p>
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
import { getCharacters, getCharacterById, updateCharacter, deleteCharacter } from '../services/characters.js'
import CharacterDetailModal from '../components/CharacterDetailModal.vue'
import CharacterEditModal from '../components/CharacterEditModal.vue'

// 职业名称映射
const CLASS_NAMES = {
  warrior: '战士',
  paladin: '圣骑士',
  hunter: '猎人',
  rogue: '盗贼',
  priest: '牧师',
  shaman: '萨满祭司',
  mage: '法师',
  warlock: '术士',
  druid: '德鲁伊'
}

const characters = ref([])
const pagination = ref({ total: 0, page: 1, pageSize: 20, totalPages: 0 })
const loading = ref(false)
const searchQuery = ref('')
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const currentCharacter = ref(null)
const deleting = ref(false)

let searchTimeout = null

onMounted(() => {
  loadCharacters()
})

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadCharacters(1)
  }, 500)
}

async function loadCharacters(page = pagination.value.page) {
  loading.value = true
  try {
    const result = await getCharacters({ page, pageSize: pagination.value.pageSize, search: searchQuery.value })
    characters.value = result.data || []
    pagination.value = result.pagination || pagination.value
  } catch (err) {
    console.error('Failed to load characters:', err)
    alert('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.totalPages) {
    loadCharacters(page)
  }
}

async function viewCharacter(char) {
  try {
    const result = await getCharacterById(char.id)
    currentCharacter.value = result.data
    showDetailModal.value = true
  } catch (err) {
    console.error('Failed to load character details:', err)
    alert('加载角色详情失败')
  }
}

function editCharacter(char) {
  currentCharacter.value = { ...char }
  showEditModal.value = true
}

function confirmDelete(char) {
  currentCharacter.value = char
  showDeleteModal.value = true
}

async function handleCharacterSave(characterData) {
  loading.value = true
  try {
    await updateCharacter(characterData.id, characterData)
    showEditModal.value = false
    await loadCharacters(pagination.value.page)
  } catch (err) {
    console.error('Failed to update character:', err)
    alert('更新角色失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await deleteCharacter(currentCharacter.value.id)
    showDeleteModal.value = false
    await loadCharacters(pagination.value.page)
  } catch (err) {
    console.error('Failed to delete character:', err)
    alert('删除角色失败')
  } finally {
    deleting.value = false
  }
}

function getClassName(classId) {
  return CLASS_NAMES[classId] || classId
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
