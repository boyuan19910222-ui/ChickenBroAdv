/**
 * Users Management Script
 * Handles user listing, viewing, editing, and deletion
 */

const API_BASE = '/api/admin'
let currentPage = 1
const PAGE_SIZE = 20
let users = []
let availableClasses = []

// Initialize token from URL parameter (for cross-origin access)
function initToken() {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (token) {
        // Store token in localStorage
        localStorage.setItem('mp_token', token)
        console.log('[Admin] Token initialized from URL')
        // Clean URL (remove token parameter)
        const url = new URL(window.location)
        url.searchParams.delete('token')
        window.history.replaceState({}, '', url)
    }
}

// Initialize on page load (before any API calls)
document.addEventListener('DOMContentLoaded', () => {
    initToken()
    loadUsers(1)
})
let currentPage = 1
const PAGE_SIZE = 20
let users = []
let availableClasses = []

// Get auth token (use same key as main game)
function getAuthHeaders() {
    const token = localStorage.getItem('mp_token')
    console.log('[Admin] Token from localStorage:', token ? `${token.substring(0, 10)}...` : 'null')
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    }
}

// Show toast notification
function showToast(title, message, type = 'info') {
    const toastTitle = document.getElementById('toastTitle')
    const toastMessage = document.getElementById('toastMessage')
    const toast = document.getElementById('toast')
    const toastEl = new bootstrap.Toast(toast)

    toastTitle.textContent = title
    toastMessage.textContent = message

    toast.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-warning')
    toast.classList.add(`text-bg-${type}`)

    toastEl.show()
}

// Load users with pagination
async function loadUsers(page = 1) {
    try {
        const headers = getAuthHeaders()
        console.log('[Admin] Fetching users with headers:', headers)
        const response = await fetch(`${API_BASE}/users?page=${page}&limit=${PAGE_SIZE}`, {
            headers: headers,
        })

        if (!response.ok) {
            throw new Error('Failed to load users')
        }

        const data = await response.json()
        users = data.users || []
        currentPage = page

        renderUsers()
        renderPagination(data.total, data.page, data.limit)
        updateClassSelect()

        document.getElementById('loading').classList.add('d-none')
        document.getElementById('userTableContainer').classList.remove('d-none')
    } catch (error) {
        console.error('Error loading users:', error)
        showToast('错误', '加载用户列表失败', 'danger')
    }
}

// Render users table
function renderUsers() {
    const tbody = document.getElementById('userTableBody')
    tbody.innerHTML = ''

    users.forEach(user => {
        const row = document.createElement('tr')
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.nickname)}</td>
            <td><span class="badge bg-secondary">${user.characterCount || 0}</span></td>
            <td>${formatDate(user.created_at)}</td>
            <td>${user.last_login ? formatDate(user.last_login) : '<span class="text-muted">从未登录</span>'}</td>
            <td>
                <div class="btn-group btn-group-sm table-actions">
                    <button class="btn btn-info btn-sm" onclick="viewUser(${user.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="editUser(${user.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id}, '${escapeHtml(user.username)}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `
        tbody.appendChild(row)
    })
}

// Render pagination
function renderPagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit)
    const pagination = document.getElementById('pagination')
    pagination.innerHTML = ''

    // Previous button
    const prevLi = document.createElement('li')
    prevLi.className = `page-item ${page === 1 ? 'disabled' : ''}`
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="${page > 1 ? `loadUsers(${page - 1})` : ''}">上一页</a>
    `
    pagination.appendChild(prevLi)

    // Page numbers
    const startPage = Math.max(1, page - 2)
    const endPage = Math.min(totalPages, page + 2)

    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li')
        li.className = `page-item ${i === page ? 'active' : ''}`
        li.innerHTML = `<a class="page-link" href="#" onclick="loadUsers(${i})">${i}</a>`
        pagination.appendChild(li)
    }

    // Next button
    const nextLi = document.createElement('li')
    nextLi.className = `page-item ${page === totalPages ? 'disabled' : ''}`
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="${page < totalPages ? `loadUsers(${page + 1})` : ''}">下一页</a>
    `
    pagination.appendChild(nextLi)
}

// View user details
async function viewUser(userId) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Failed to load user details')
        }

        const user = await response.json()
        renderUserDetails(user)
        new bootstrap.Modal(document.getElementById('userDetailModal')).show()
    } catch (error) {
        console.error('Error loading user details:', error)
        showToast('错误', '加载用户详情失败', 'danger')
    }
}

// Render user details
function renderUserDetails(user) {
    const content = document.getElementById('userDetailContent')
    const latestChar = user.latestCharacter || {}

    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="mb-3">基本信息</h6>
                <table class="table table-sm">
                    <tr><td><strong>ID:</strong></td><td>${user.id}</td></tr>
                    <tr><td><strong>用户名:</strong></td><td>${escapeHtml(user.username)}</td></tr>
                    <tr><td><strong>昵称:</strong></td><td>${escapeHtml(user.nickname)}</td></tr>
                    <tr><td><strong>管理员:</strong></td><td>${user.isAdmin ? '<span class="badge bg-danger">是</span>' : '<span class="badge bg-secondary">否</span>'}</td></tr>
                    <tr><td><strong>角色数:</strong></td><td>${user.characterCount || 0}</td></tr>
                    <tr><td><strong>注册时间:</strong></td><td>${formatDate(user.created_at)}</td></tr>
                    <tr><td><strong>最后登录:</strong></td><td>${user.last_login ? formatDate(user.last_login) : '从未登录'}</td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6 class="mb-3">最新角色</h6>
                ${latestChar.id ? `
                    <table class="table table-sm">
                        <tr><td><strong>ID:</strong></td><td>${latestChar.id}</td></tr>
                        <tr><td><strong>名称:</strong></td><td>${escapeHtml(latestChar.name)}</td></tr>
                        <tr><td><strong>职业:</strong></td><td>${escapeHtml(latestChar.class)}</td></tr>
                        <tr><td><strong>等级:</strong></td><td>${latestChar.level}</td></tr>
                        <tr><td><strong>最后游玩:</strong></td><td>${latestChar.last_played_at ? formatDate(latestChar.last_played_at) : '从未游玩'}</td></tr>
                    </table>
                ` : '<p class="text-muted">暂无角色</p>'}
            </div>
        </div>
    `
}

// Edit user
async function editUser(userId) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Failed to load user details')
        }

        const user = await response.json()
        const latestChar = user.latestCharacter || {}

        document.getElementById('editUserId').value = userId
        document.getElementById('editClass').value = latestChar.class || ''
        document.getElementById('editLevel').value = latestChar.level || 1

        // Parse game_state for experience
        if (latestChar.game_state) {
            try {
                const gameState = JSON.parse(latestChar.game_state)
                document.getElementById('editExperience').value = gameState.player?.experience || 0
            } catch (e) {
                document.getElementById('editExperience').value = 0
            }
        } else {
            document.getElementById('editExperience').value = 0
        }

        new bootstrap.Modal(document.getElementById('editUserModal')).show()
    } catch (error) {
        console.error('Error loading user for edit:', error)
        showToast('错误', '加载用户信息失败', 'danger')
    }
}

// Save user changes
async function saveUserChanges() {
    try {
        const userId = parseInt(document.getElementById('editUserId').value)
        const classId = document.getElementById('editClass').value
        const level = parseInt(document.getElementById('editLevel').value)
        const experience = parseInt(document.getElementById('editExperience').value)

        if (classId) {
            const response = await fetch(`${API_BASE}/users/${userId}/class`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ classId }),
            })
            if (!response.ok) throw new Error('Failed to update class')
        }

        if (level) {
            const response = await fetch(`${API_BASE}/users/${userId}/level`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ level }),
            })
            if (!response.ok) throw new Error('Failed to update level')
        }

        if (experience >= 0) {
            const response = await fetch(`${API_BASE}/users/${userId}/experience`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ experience }),
            })
            if (!response.ok) throw new Error('Failed to update experience')
        }

        bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide()
        showToast('成功', '用户信息已更新', 'success')
        await loadUsers(currentPage)
    } catch (error) {
        console.error('Error saving user:', error)
        showToast('错误', '保存用户信息失败', 'danger')
    }
}

// Delete user
function deleteUser(userId, username) {
    document.getElementById('deleteUserId').value = userId
    new bootstrap.Modal(document.getElementById('deleteConfirmModal')).show()
}

// Confirm delete
async function confirmDelete() {
    try {
        const userId = parseInt(document.getElementById('deleteUserId').value)
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Failed to delete user')
        }

        bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide()
        showToast('成功', '用户已删除', 'success')
        await loadUsers(currentPage)
    } catch (error) {
        console.error('Error deleting user:', error)
        showToast('错误', '删除用户失败', 'danger')
    }
}

// Load available classes from admin API
async function updateClassSelect() {
    try {
        const response = await fetch(`${API_BASE}/class-config`, {
            headers: getAuthHeaders(),
        })
        if (!response.ok) return

        const data = await response.json()
        const configs = data.configs || []

        const select = document.getElementById('editClass')
        select.innerHTML = '<option value="">选择职业...</option>'
        configs.forEach(config => {
            select.innerHTML += `<option value="${config.classId}">${escapeHtml(config.name)}</option>`
        })
    } catch (error) {
        console.error('Error loading classes:', error)
    }
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Helper: Format date
function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
}
