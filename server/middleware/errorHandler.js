/**
 * Error Handler Middleware
 * 全局错误处理中间件
 */

/**
 * Global Express error handler.
 * Must be registered AFTER all routes with app.use(globalErrorHandler).
 *
 * - Sequelize connection / timeout errors  → HTTP 503
 * - Everything else                        → HTTP 500
 * Raw database stack traces are never exposed to the client.
 */
export function globalErrorHandler(err, req, res, _next) {
    const isSequelizeConnectionError =
        err.name === 'SequelizeConnectionError' ||
        err.name === 'SequelizeConnectionRefusedError' ||
        err.name === 'SequelizeHostNotFoundError' ||
        err.name === 'SequelizeAccessDeniedError' ||
        err.name === 'SequelizeConnectionTimedOutError'

    if (isSequelizeConnectionError) {
        console.error('[db] Connection error:', err.message)
        return res.status(503).json({
            error:   'SERVICE_UNAVAILABLE',
            message: '数据库暂时不可用，请稍后重试',
        })
    }

    console.error('[server] Unhandled error:', err)
    return res.status(500).json({
        error:   'INTERNAL_ERROR',
        message: '服务器内部错误',
    })
}
