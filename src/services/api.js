// 动态获取 API 地址：本地开发用 localhost，生产环境用当前域名
const API_HOST = ""
const API_BASE = `${API_HOST}/api/v1`

/**
 * 工具函数：获取认证头
 */
function getAuthHeaders() {
  const token = localStorage.getItem('mp_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * 通用请求函数
 */
async function request(endpoint, options = {}) {
  const url = API_BASE + endpoint
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }))
    throw new Error(error.message || error.error || '请求失败')
  }

  return response.json()
}

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {boolean} autoLogin - 是否自动登录（30天有效）
   */
  login: (username, password, autoLogin = false) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, auto_login: autoLogin }),
    }),

  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} nickname - 昵称
   * @param {boolean} autoLogin - 是否自动登录
   */
  register: (username, password, nickname, autoLogin = false) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, nickname, auto_login: autoLogin }),
    }),

  /**
   * 用户登出
   */
  logout: () => request('/auth/logout', { method: 'POST' }),

  /**
   * 获取当前用户信息
   */
  getMe: () => request('/me'),
}

/**
 * 角色相关 API
 */
export const characterApi = {
  /**
   * 获取当前用户的所有角色
   */
  getAll: () => request('/characters'),

  /**
   * 获取单个角色详情
   * @param {number} id - 角色ID
   */
  getById: (id) => request(`/characters/${id}`),

  /**
   * 创建新角色
   * @param {string} name - 角色名
   * @param {string} characterClass - 职业ID
   */
  create: (name, characterClass) =>
    request('/characters', {
      method: 'POST',
      body: JSON.stringify({ name, class: characterClass }),
    }),

  /**
   * 更新角色（存档同步）
   * @param {number} id - 角色ID
   * @param {object} gameState - 完整游戏状态
   * @param {number} level - 角色等级（可选）
   */
  update: (id, gameState, level = null) => {
    const body = { game_state: gameState }
    if (level !== null) body.level = level
    return request(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  /**
   * 删除角色
   * @param {number} id - 角色ID
   */
  delete: (id) => request(`/characters/${id}`, { method: 'DELETE' }),
}

export default { authApi, characterApi }
