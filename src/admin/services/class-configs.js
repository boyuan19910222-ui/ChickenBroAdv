// Admin API service for class configs
const API_BASE = '/api/admin'
const AUTH_HEADER_KEY = 'admin_token'

// Helper to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem(AUTH_HEADER_KEY)
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

// Get class configs list
export async function getClassConfigs() {
  const response = await fetch(`${API_BASE}/class-configs`, {
    headers: getAuthHeaders()
  })
  return response.json()
}

// Get single class config by ID
export async function getClassConfigById(id) {
  const response = await fetch(`${API_BASE}/class-configs/${id}`, {
    headers: getAuthHeaders()
  })
  return response.json()
}

// Create class config
export async function createClassConfig(data) {
  const response = await fetch(`${API_BASE}/class-configs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  return response.json()
}

// Update class config
export async function updateClassConfig(id, data) {
  const response = await fetch(`${API_BASE}/class-configs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  return response.json()
}

// Delete class config
export async function deleteClassConfig(id) {
  const response = await fetch(`${API_BASE}/class-configs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return response
}

// Reload class configs
export async function reloadClassConfigs() {
  const response = await fetch(`${API_BASE}/class-configs/reload`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  return response.json()
}
