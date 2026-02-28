// Admin API service for users
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

// Get users list with pagination and search
export async function getUsers({ page = 1, pageSize = 20, search = '' } = {}) {
  const params = new URLSearchParams({ page, pageSize, search })
  const response = await fetch(`${API_BASE}/users?${params}`, {
    headers: getAuthHeaders()
  })
  return response.json()
}

// Get single user by ID
export async function getUserById(id) {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    headers: getAuthHeaders()
  })
  return response.json()
}

// Update user
export async function updateUser(id, data) {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  return response.json()
}

// Delete user
export async function deleteUser(id) {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return response
}
