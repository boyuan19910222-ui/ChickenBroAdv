// Admin API service for characters
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

// Get characters list with pagination and search
export async function getCharacters({ page = 1, pageSize = 20, search = '', userId } = {}) {
  const params = new URLSearchParams({ page, pageSize, search, ...(userId && { userId }) })
  const response = await fetch(`${API_BASE}/characters?${params}`, {
    headers: getAuthHeaders()
  })
  return response.json()
}

// Get single character by ID
export async function getCharacterById(id) {
  const response = await fetch(`${API_BASE}/characters/${id}`, {
    headers: getAuthHeaders()
  })
  return response.json()
}

// Update character
export async function updateCharacter(id, data) {
  const response = await fetch(`${API_BASE}/characters/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  return response.json()
}

// Delete character
export async function deleteCharacter(id) {
  const response = await fetch(`${API_BASE}/characters/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return response
}
