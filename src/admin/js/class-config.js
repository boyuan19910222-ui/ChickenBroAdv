/**
 * Class Config Management Script
 * Handles class configuration listing, creating, editing, and deletion
 */

const API_BASE = '/api/admin'
let configs = []

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

// Get auth token (use same key as main game)
function getAuthHeaders() {
    const token = localStorage.getItem('mp_token')
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

// Load all class configs
async function loadConfigs() {
    try {
        const response = await fetch(`${API_BASE}/class-config`, {
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Failed to load configs')
        }

        const data = await response.json()
        configs = data.configs || []
        renderConfigs()

        document.getElementById('loading').classList.add('d-none')
        document.getElementById('configTableContainer').classList.remove('d-none')
    } catch (error) {
        console.error('Error loading configs:', error)
        showToast('错误', '加载配置失败', 'danger')
    }
}

// Render configs table
function renderConfigs() {
    const tbody = document.getElementById('configTableBody')
    tbody.innerHTML = ''

    configs.forEach(config => {
        const row = document.createElement('tr')
        row.innerHTML = `
            <td>${config.id}</td>
            <td><code>${escapeHtml(config.class_id)}</code></td>
            <td>${escapeHtml(config.name)}</td>
            <td><span class="badge bg-info">${config.resource_type}</span></td>
            <td><code class="config-stats">${JSON.stringify(config.base_stats).substring(0, 50)}...</code></td>
            <td><code class="config-stats">${JSON.stringify(config.growth_per_level).substring(0, 30)}...</code></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-info btn-sm" onclick="viewConfig(${config.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="editConfig(${config.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteConfig(${config.id}, '${escapeHtml(config.name)}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `
        tbody.appendChild(row)
    })
}

// Create new config
function createConfig() {
    document.getElementById('configId').value = ''
    document.getElementById('configModalTitle').textContent = '新建职业配置'

    // Reset form
    document.getElementById('classId').value = ''
    document.getElementById('className').value = ''
    document.getElementById('resourceType').value = 'rage'
    document.getElementById('resourceMax').value = 100
    document.getElementById('baseStats').value = ''
    document.getElementById('growthPerLevel').value = ''
    document.getElementById('baseSkills').value = ''

    new bootstrap.Modal(document.getElementById('configModal')).show()
}

// View config
async function viewConfig(configId) {
    try {
        const response = await fetch(`${API_BASE}/class-config/${configId}`, {
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Failed to load config')
        }

        const config = await response.json()
        renderConfigDetails(config)
        new bootstrap.Modal(document.getElementById('configModal')).show()
    } catch (error) {
        console.error('Error loading config:', error)
        showToast('错误', '加载配置失败', 'danger')
    }
}

// Edit config
async function editConfig(configId) {
    try {
        const response = await fetch(`${API_BASE}/class-config/${configId}`, {
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            throw new Error('Failed to load config')
        }

        const config = await response.json()
        document.getElementById('configId').value = config.id
        document.getElementById('configModalTitle').textContent = '编辑职业配置'

        // Populate form
        document.getElementById('classId').value = config.class_id
        document.getElementById('className').value = config.name
        document.getElementById('resourceType').value = config.resource_type
        document.getElementById('resourceMax').value = config.resource_max
        document.getElementById('baseStats').value = JSON.stringify(config.base_stats, null, 2)
        document.getElementById('growthPerLevel').value = JSON.stringify(config.growth_per_level, null, 2)
        document.getElementById('baseSkills').value = JSON.stringify(config.base_skills || [], null, 2)

        new bootstrap.Modal(document.getElementById('configModal')).show()
    } catch (error) {
        console.error('Error loading config for edit:', error)
        showToast('错误', '加载配置失败', 'danger')
    }
}

// Save config (create or update)
async function saveConfig() {
    try {
        const configId = document.getElementById('configId').value

        // Validate form
        const classId = document.getElementById('classId').value.trim()
        const name = document.getElementById('className').value.trim()
        const resourceType = document.getElementById('resourceType').value
        const resourceMax = parseInt(document.getElementById('resourceMax').value)
        const baseStatsStr = document.getElementById('baseStats').value.trim()
        const growthPerLevelStr = document.getElementById('growthPerLevel').value.trim()
        const baseSkillsStr = document.getElementById('baseSkills').value.trim()

        if (!classId || !name || !baseStatsStr || !growthPerLevelStr) {
            showToast('错误', '请填写所有必填字段', 'warning')
            return
        }

        // Parse JSON fields
        let baseStats, growthPerLevel, baseSkills
        try {
            baseStats = JSON.parse(baseStatsStr)
            growthPerLevel = JSON.parse(growthPerLevelStr)
            baseSkills = baseSkillsStr ? JSON.parse(baseSkillsStr) : []
        } catch (e) {
            showToast('错误', 'JSON格式不正确', 'danger')
            return
        }

        const data = {
            classId,
            name,
            resourceType,
            resourceMax,
            baseStats,
            growthPerLevel,
            baseSkills,
        }

        let response
        if (configId) {
            // Update
            response = await fetch(`${API_BASE}/class-config/${configId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            })
        } else {
            // Create
            response = await fetch(`${API_BASE}/class-config`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            })
        }

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to save config')
        }

        bootstrap.Modal.getInstance(document.getElementById('configModal')).hide()
        showToast('成功', '配置已保存', 'success')
        await loadConfigs()
    } catch (error) {
        console.error('Error saving config:', error)
        showToast('错误', '保存配置失败: ' + error.message, 'danger')
    }
}

// Delete config
function deleteConfig(configId, name) {
    document.getElementById('deleteConfigId').value = configId
    new bootstrap.Modal(document.getElementById('deleteConfirmModal')).show()
}

// Confirm delete
async function confirmDelete() {
    try {
        const configId = parseInt(document.getElementById('deleteConfigId').value)
        const response = await fetch(`${API_BASE}/class-config/${configId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to delete config')
        }

        bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide()
        showToast('成功', '配置已删除', 'success')
        await loadConfigs()
    } catch (error) {
        console.error('Error deleting config:', error)
        showToast('错误', '删除配置失败: ' + error.message, 'danger')
    }
}

// Render config details (read-only view)
function renderConfigDetails(config) {
    document.getElementById('configId').value = config.id
    document.getElementById('configModalTitle').textContent = '职业配置详情'
    document.getElementById('classId').disabled = true
    document.getElementById('className').disabled = true
    document.getElementById('resourceType').disabled = true
    document.getElementById('resourceMax').disabled = true
    document.getElementById('baseStats').disabled = true
    document.getElementById('growthPerLevel').disabled = true
    document.getElementById('baseSkills').disabled = true

    document.getElementById('classId').value = config.class_id
    document.getElementById('className').value = config.name
    document.getElementById('resourceType').value = config.resource_type
    document.getElementById('resourceMax').value = config.resource_max
    document.getElementById('baseStats').value = JSON.stringify(config.base_stats, null, 2)
    document.getElementById('growthPerLevel').value = JSON.stringify(config.growth_per_level, null, 2)
    document.getElementById('baseSkills').value = JSON.stringify(config.base_skills || [], null, 2)
}

// Reset form to editable state
function resetFormEditable() {
    document.getElementById('configId').value = ''
    document.getElementById('classId').disabled = false
    document.getElementById('className').disabled = false
    document.getElementById('resourceType').disabled = false
    document.getElementById('resourceMax').disabled = false
    document.getElementById('baseStats').disabled = false
    document.getElementById('growthPerLevel').disabled = false
    document.getElementById('baseSkills').disabled = false
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initToken()  // Initialize token first
    loadConfigs()

    // Reset form when modal is hidden (except for view-only mode)
    document.getElementById('configModal').addEventListener('hidden.bs.modal', () => {
        resetFormEditable()
    })

    // Make new config button use createConfig
    document.querySelector('[data-bs-target="#createConfigModal"]')?.addEventListener('click', createConfig)
})
