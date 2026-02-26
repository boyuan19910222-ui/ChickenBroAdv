/**
 * ChatManager — 聊天系统
 *
 * 功能：
 *   - 大厅聊天（所有在线玩家可见）
 *   - 房间聊天（仅房间内玩家可见）
 *   - 消息验证：200 字符限制、频率限制 2条/秒
 *   - HTML 转义防止 XSS
 */

const MAX_MESSAGE_LENGTH = 200
const MAX_LOBBY_MESSAGES = 50
const RATE_LIMIT_WINDOW = 1000   // 1 second
const RATE_LIMIT_MAX = 2         // max 2 messages per window

export class ChatManager {
    constructor(options = {}) {
        /** @type {Array<Object>} 最近大厅消息 */
        this.lobbyMessages = []
        this.maxLobbyMessages = MAX_LOBBY_MESSAGES

        /** @type {Map<string, Array<Object>>} roomId → messages */
        this.roomMessages = new Map()

        /** @type {Map<string|number, Array<number>>} userId → [timestamp, ...] */
        this._rateLimits = new Map()

        /** @type {object|null} Statement adapters for DB persistence (optional) */
        this._stmts = options.stmts || null
    }

    /**
     * 处理聊天消息发送
     * @param {Object} socket - Socket.IO socket（必须含 socket.user）
     * @param {Object} data - { type: 'lobby'|'room', roomId?, content }
     * @param {import('socket.io').Server} io
     * @param {import('./rooms.js').RoomManager} roomManager
     * @returns {{ error?: string, message?: string } | null} 错误对象或 null
     */
    handleSend(socket, data, io, roomManager) {
        const user = socket.user
        if (!user) return { error: 'NOT_AUTHENTICATED', message: '未认证' }

        // 验证消息内容
        const validation = this._validateMessage(data.content, user.id)
        if (validation) return validation

        // 构造消息对象
        const sanitized = this._escapeHtml(data.content)
        const msg = {
            id: `${Date.now()}_${user.id}`,
            userId: user.id,
            nickname: user.nickname || user.username,
            content: sanitized,
            timestamp: Date.now(),
            type: data.type || 'lobby',
        }

        if (data.type === 'room' && data.roomId) {
            // 房间聊天
            const room = roomManager?.getRoom(data.roomId)
            if (!room) return { error: 'ROOM_NOT_FOUND', message: '房间不存在' }

            // 检查用户是否在房间中
            const inRoom = room.players.some(p => p.userId === user.id)
            if (!inRoom) return { error: 'NOT_IN_ROOM', message: '你不在该房间中' }

            this._addRoomMessage(data.roomId, msg)
            io.to(data.roomId).emit('chat:message', msg)

            // Write-behind: 异步写入数据库，失败不阻断广播
            if (this._stmts) {
                this._stmts.insertChatMessage.run(
                    user.id, msg.nickname, msg.content, 'room', data.roomId, msg.timestamp
                ).catch(err => console.error('[chat] Failed to persist room message:', err))
            }
        } else {
            // 大厅聊天
            this._addLobbyMessage(msg)
            io.emit('chat:message', msg)

            // Write-behind: 异步写入数据库，失败不阻断广播
            if (this._stmts) {
                this._stmts.insertChatMessage.run(
                    user.id, msg.nickname, msg.content, 'lobby', null, msg.timestamp
                ).catch(err => console.error('[chat] Failed to persist lobby message:', err))
            }
        }

        return null
    }

    /**
     * 获取大厅聊天历史
     * @returns {Array<Object>}
     */
    getLobbyHistory() {
        return [...this.lobbyMessages]
    }

    /**
     * 获取房间聊天历史
     * @param {string} roomId
     * @returns {Array<Object>}
     */
    getRoomHistory(roomId) {
        return [...(this.roomMessages.get(roomId) || [])]
    }

    /**
     * 清除房间聊天历史（房间销毁时调用）
     * @param {string} roomId
     */
    clearRoomHistory(roomId) {
        this.roomMessages.delete(roomId)
    }

    /**
     * 从数据库预加载大厅聊天历史到内存缓存。
     * 服务启动时在 app.listen 前调用。
     * @param {object} stmts
     */
    async loadHistory(stmts) {
        try {
            const rows = await stmts.getLobbyHistory.all(this.maxLobbyMessages)
            this.lobbyMessages = rows.map(r => ({
                id:        `${r.timestamp}_${r.user_id}`,
                userId:    r.user_id,
                nickname:  r.nickname,
                content:   r.content,
                timestamp: Number(r.timestamp),
                type:      r.type,
            }))
            console.log(`[chat] Loaded ${this.lobbyMessages.length} lobby messages from DB.`)
        } catch (err) {
            console.error('[chat] Failed to load chat history from DB:', err)
        }
    }

    // ────────────────────────────────────────────────────
    // Internal
    // ────────────────────────────────────────────────────

    _validateMessage(content, userId) {
        if (content === null || content === undefined || typeof content !== 'string') {
            return { error: 'INVALID_MESSAGE', message: '消息内容无效' }
        }

        if (content.length === 0) {
            return { error: 'EMPTY_MESSAGE', message: '消息不能为空' }
        }

        if (content.length > MAX_MESSAGE_LENGTH) {
            return { error: 'MESSAGE_TOO_LONG', message: `消息不能超过${MAX_MESSAGE_LENGTH}个字符` }
        }

        // 频率限制
        if (this._isRateLimited(userId)) {
            return { error: 'RATE_LIMITED', message: '发送消息太快，请稍后再试' }
        }

        return null
    }

    _isRateLimited(userId) {
        const now = Date.now()
        let timestamps = this._rateLimits.get(userId)

        if (!timestamps) {
            timestamps = []
            this._rateLimits.set(userId, timestamps)
        }

        // 清除过期时间戳
        const cutoff = now - RATE_LIMIT_WINDOW
        while (timestamps.length > 0 && timestamps[0] <= cutoff) {
            timestamps.shift()
        }

        if (timestamps.length >= RATE_LIMIT_MAX) {
            return true
        }

        timestamps.push(now)
        return false
    }

    _escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
    }

    _addLobbyMessage(msg) {
        this.lobbyMessages.push(msg)
        while (this.lobbyMessages.length > this.maxLobbyMessages) {
            this.lobbyMessages.shift()
        }
    }

    _addRoomMessage(roomId, msg) {
        if (!this.roomMessages.has(roomId)) {
            this.roomMessages.set(roomId, [])
        }
        const messages = this.roomMessages.get(roomId)
        messages.push(msg)
        // 房间消息也限制 50 条
        while (messages.length > 50) {
            messages.shift()
        }
    }
}

/**
 * 将 ChatManager 集成到 Socket.IO
 * @param {import('socket.io').Server} io
 * @param {import('./rooms.js').RoomManager} roomManager
 * @param {ChatManager} chatManager
 */
export function setupChat(io, roomManager, chatManager) {
    io.on('connection', (socket) => {
        // 进入大厅时发送聊天历史
        socket.emit('chat:history', {
            lobby: chatManager.getLobbyHistory(),
        })

        // 监听聊天消息
        socket.on('chat:send', (data, callback) => {
            const error = chatManager.handleSend(socket, data, io, roomManager)
            if (error) {
                return callback?.({ error: error.error, message: error.message })
            }
            callback?.({ ok: true })
        })
    })
}
