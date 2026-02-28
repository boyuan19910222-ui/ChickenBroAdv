/**
 * Admin Panel Router Guards
 * 管理面板路由守卫 - 验证登录状态和管理员权限
 */

/**
 * 获取存储的管理员信息
 * @returns {object|null}
 */
function getAdminInfo() {
    try {
        const token = localStorage.getItem('admin_token')
        const userStr = localStorage.getItem('admin_user')
        if (!token || !userStr) return null
        return {
            token,
            user: JSON.parse(userStr)
        }
    } catch {
        return null
    }
}

/**
 * 检查是否已登录且为管理员
 * @returns {boolean}
 */
export function isAdminAuthenticated() {
    const adminInfo = getAdminInfo()
    if (!adminInfo) return false
    return adminInfo.user && adminInfo.user.is_admin === 1
}

/**
 * 获取当前管理员 token
 * @returns {string|null}
 */
export function getAdminToken() {
    const adminInfo = getAdminInfo()
    return adminInfo ? adminInfo.token : null
}

/**
 * 获取当前管理员用户信息
 * @returns {object|null}
 */
export function getAdminUser() {
    const adminInfo = getAdminInfo()
    return adminInfo ? adminInfo.user : null
}

/**
 * 清除管理员登录状态
 */
export function clearAdminAuth() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
}

/**
 * 创建路由守卫
 * @param {Router} router - Vue Router 实例
 */
export function setupRouterGuards(router) {
    router.beforeEach((to, from, next) => {
        const isAuthenticated = isAdminAuthenticated()

        // 需要认证的路由
        const authRequiredRoutes = ['/', '/home', '/users', '/characters', '/class-configs']

        // 如果路由需要认证
        if (authRequiredRoutes.includes(to.path)) {
            if (!isAuthenticated) {
                // 未登录，重定向到登录页
                return next({
                    path: '/login',
                    query: { redirect: to.fullPath }
                })
            }
        }

        // 如果已登录访问登录页，重定向到首页
        if (to.path === '/login' && isAuthenticated) {
            return next({ path: '/home' })
        }

        // 默认路由（/）重定向到首页或登录页
        if (to.path === '/' && !to.matched.length) {
            return next(isAuthenticated ? '/home' : '/login')
        }

        next()
    })
}

export default {
    isAdminAuthenticated,
    getAdminToken,
    getAdminUser,
    clearAdminAuth,
    setupRouterGuards
}
