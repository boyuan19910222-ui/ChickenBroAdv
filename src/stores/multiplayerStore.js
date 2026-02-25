/**
 * 联机多人游戏 Store
 * 管理 Socket.IO 连接、房间、战斗和聊天
 * 注：认证功能已迁移至 authStore
 */
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

// 动态获取 API 地址
const API_HOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:3001'
    : `http://${window.location.hostname}:3001`
const API_BASE = API_HOST

export const useMultiplayerStore = defineStore('multiplayer', {
    state: () => ({
        // 连接状态
        socket: null,
        connected: false,

        // 认证
        token: localStorage.getItem('mp_token') || null,
        user: JSON.parse(localStorage.getItem('mp_user') || 'null'),

        // 大厅
        rooms: [],
        currentRoom: null,

        // 战斗
        battleState: 'idle', // 'idle' | 'in_progress' | 'finished'
        battleInitData: null,  // battle:init 数据（dungeonId, seed, snapshots, roomId）
        battleResult: null,
        lootItems: [],

        // 旧版字段（保留兼容，已不再使用）
        battleEvents: [],
        battleParty: [],
        battleDungeon: null,

        // 聊天
        lobbyMessages: [],
        roomMessages: [],

        // UI 状态
        error: null,
        loading: false,
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        isInRoom: (state) => !!state.currentRoom,
        isInBattle: (state) => state.battleState === 'in_progress',
        isRoomHost: (state) => {
            if (!state.currentRoom || !state.user) return false
            return state.currentRoom.hostId === state.user.id
        },
        myRoomPlayer: (state) => {
            if (!state.currentRoom || !state.user) return null
            return state.currentRoom.players.find(p => p.userId === state.user.id)
        },
    },

    actions: {
        // ── 认证（已迁移至 authStore）──────────────────────
        // token 和 user 由 authStore 设置，本 store 仅读取
        // logout() 保留以清理 Socket 连接和本地状态
        logout() {
            this.disconnect()
            this.token = null
            this.user = null
            this.currentRoom = null
            this.rooms = []
            this.battleState = 'idle'
            this.battleInitData = null
            this.battleResult = null
            this.lootItems = []
            this.battleEvents = []
            this.battleParty = []
            this.battleDungeon = null
            this.lobbyMessages = []
            this.roomMessages = []
            localStorage.removeItem('mp_token')
            localStorage.removeItem('mp_user')
        },

        // ── Socket.IO ────────────────────────────────────
        connect() {
            if (this.socket?.connected) return

            // 从 localStorage 获取 token（可能与 authStore 同步）
            const token = this.token || localStorage.getItem('mp_token')
            if (!token) return

            this.socket = io(API_BASE, {
                auth: { token: token },
            })

            this.socket.on('connect', () => {
                this.connected = true
            })

            this.socket.on('disconnect', () => {
                this.connected = false
            })

            this.socket.on('connect_error', (err) => {
                this.connected = false
                this.error = '连接服务器失败: ' + err.message
            })

            this.setupSocketListeners()
        },

        disconnect() {
            if (this.socket) {
                this.socket.disconnect()
                this.socket = null
            }
            this.connected = false
        },

        // ── 房间操作 ────────────────────────────────────
        createRoom(dungeonId, dungeonName, playerSnapshot) {
            return new Promise((resolve) => {
                if (!this.socket) return resolve({ error: 'NOT_CONNECTED' })
                this.socket.emit('room:create', { dungeonId, dungeonName, playerSnapshot }, (res) => {
                    if (res.error) {
                        this.error = res.message
                        return resolve(res)
                    }
                    this.currentRoom = res.room
                    resolve(res)
                })
            })
        },

        joinRoom(roomId, playerSnapshot) {
            return new Promise((resolve) => {
                if (!this.socket) return resolve({ error: 'NOT_CONNECTED' })
                this.socket.emit('room:join', { roomId, playerSnapshot }, (res) => {
                    if (res.error) {
                        this.error = res.message
                        return resolve(res)
                    }
                    this.currentRoom = res.room
                    resolve(res)
                })
            })
        },

        leaveRoom() {
            return new Promise((resolve) => {
                if (!this.socket || !this.currentRoom) return resolve({ error: 'NOT_IN_ROOM' })
                this.socket.emit('room:leave', { roomId: this.currentRoom.id }, (res) => {
                    // 无论服务端是否报错（如房间已销毁），都清理本地状态
                    this.currentRoom = null
                    this.roomMessages = []
                    this.battleState = 'idle'
                    this.battleInitData = null
                    this.battleResult = null
                    this.lootItems = []
                    this.battleEvents = []
                    this.battleParty = []
                    this.battleDungeon = null
                    resolve(res)
                })
            })
        },

        startBattle() {
            return new Promise((resolve) => {
                if (!this.socket || !this.currentRoom) return resolve({ error: 'NOT_IN_ROOM' })
                this.socket.emit('room:start', { roomId: this.currentRoom.id }, (res) => {
                    if (res.error) {
                        this.error = res.message
                        return resolve(res)
                    }
                    resolve(res)
                })
            })
        },

        refreshRoomList() {
            return new Promise((resolve) => {
                if (!this.socket) return resolve([])
                this.socket.emit('room:list', null, (rooms) => {
                    this.rooms = rooms || []
                    resolve(this.rooms)
                })
            })
        },

        // ── 聊天 ─────────────────────────────────────────
        sendChat(type, content) {
            return new Promise((resolve) => {
                if (!this.socket) return resolve({ error: 'NOT_CONNECTED' })
                const data = { type, content }
                if (type === 'room' && this.currentRoom) {
                    data.roomId = this.currentRoom.id
                }
                this.socket.emit('chat:send', data, (res) => {
                    if (res?.error) {
                        this.error = res.message
                    }
                    resolve(res)
                })
            })
        },

        // ── 事件监听 ────────────────────────────────────
        setupSocketListeners() {
            if (!this.socket) return

            // 房间列表更新
            this.socket.on('room:list_updated', (rooms) => {
                this.rooms = rooms || []
            })

            // 房间状态更新
            this.socket.on('room:updated', ({ room }) => {
                if (this.currentRoom && room.id === this.currentRoom.id) {
                    this.currentRoom = room
                }
            })

            // 战斗开始（房间状态变更）
            this.socket.on('room:battle_start', ({ room }) => {
                if (this.currentRoom && room.id === this.currentRoom.id) {
                    this.currentRoom = room
                    this.battleState = 'in_progress'
                    this.battleResult = null
                    this.lootItems = []
                }
            })

            // 新版：接收战斗初始化数据（客户端本地执行战斗）
            this.socket.on('battle:init', (data) => {
                console.log('[mpStore] battle:init received', data.dungeonId, 'seed=', data.seed)
                this.battleInitData = data
                // 确保 battleState 为 in_progress（可能在 room:battle_start 中已设置）
                if (this.battleState !== 'in_progress') {
                    this.battleState = 'in_progress'
                }
                this.battleResult = null
                this.lootItems = []
            })

            // 服务端结算完成
            this.socket.on('battle:finished_server', ({ result, roomId }) => {
                console.log('[mpStore] battle:finished_server', result)
                this.battleState = 'finished'
                this.battleResult = { result }
            })

            // 旧版战斗事件流（保留兼容，不再主动使用）
            this.socket.on('battle:event', ({ event, data }) => {
                this.battleEvents.push({ event, data, timestamp: Date.now() })
            })

            // 掉落
            this.socket.on('battle:loot', ({ userId, items }) => {
                if (this.user && userId === this.user.id) {
                    this.lootItems = items || []
                }
            })

            // 战斗错误
            this.socket.on('battle:error', ({ message }) => {
                this.error = message
                this.battleState = 'idle'
            })

            // 聊天历史
            this.socket.on('chat:history', ({ lobby }) => {
                this.lobbyMessages = lobby || []
            })

            // 聊天消息
            this.socket.on('chat:message', (msg) => {
                if (msg.type === 'room') {
                    this.roomMessages.push(msg)
                    if (this.roomMessages.length > 100) {
                        this.roomMessages = this.roomMessages.slice(-100)
                    }
                } else {
                    this.lobbyMessages.push(msg)
                    if (this.lobbyMessages.length > 100) {
                        this.lobbyMessages = this.lobbyMessages.slice(-100)
                    }
                }
            })
        },

        clearError() {
            this.error = null
        },
    },
})
