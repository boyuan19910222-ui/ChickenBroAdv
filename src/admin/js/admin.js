/**
 * Admin Panel Entry Script
 * Handles admin panel initialization and checks admin status
 */

const API_BASE = '/api/admin'

// Helper: Get game frontend URL
function getGameUrl() {
    const hostname = window.location.hostname
    return (hostname === 'localhost' || hostname === '127.0.0.1')
        ? 'http://localhost:5173'
        : `http://${hostname}:5173`
}

// Get auth token (use same key as main game)
function getAuthHeaders() {
    const token = localStorage.getItem('mp_token')
    console.log('[Admin] Token from localStorage:', token ? `${token.substring(0, 10)}...` : 'null')
    return {
        'Authorization': `Bearer ${token}`,
    }
}

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

// Check admin status on page load
async function checkAdminStatus() {
    try {
        initToken() // Initialize token from URL first

        const token = localStorage.getItem('mp_token')
        if (!token) {
            window.location.href = getGameUrl()
            return
        }

        const response = await fetch(`${API_BASE}/check`, {
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            window.location.href = getGameUrl()
            return
        }

        const data = await response.json()
        if (!data.isAdmin) {
            alert('您没有管理员权限')
            window.location.href = getGameUrl()
        }
    } catch (error) {
        console.error('Failed to check admin status:', error)
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', checkAdminStatus)
