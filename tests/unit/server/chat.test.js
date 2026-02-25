import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChatManager } from '../../../server/chat.js'

// Helper: mock socket
function mockSocket(userId, username, nickname) {
    return {
        user: { id: userId, username: username || `user${userId}`, nickname: nickname || `Player${userId}` },
        emit: vi.fn(),
    }
}

// Helper: mock Socket.IO server
function mockIo() {
    const emitted = []
    const roomEmitted = {}
    return {
        emit: vi.fn((...args) => emitted.push(args)),
        to: vi.fn((roomId) => ({
            emit: vi.fn((...args) => {
                if (!roomEmitted[roomId]) roomEmitted[roomId] = []
                roomEmitted[roomId].push(args)
            }),
        })),
        _emitted: emitted,
        _roomEmitted: roomEmitted,
    }
}

// Helper: mock RoomManager
function mockRoomManager(rooms = {}) {
    return {
        getRoom: vi.fn((id) => rooms[id] || null),
    }
}

describe('ChatManager', () => {
    let chat
    let io
    let socket
    let rm

    beforeEach(() => {
        chat = new ChatManager()
        io = mockIo()
        socket = mockSocket(1, 'alice', 'Alice')
        rm = mockRoomManager()
    })

    // ── Message sending ──────────────────────────────

    describe('handleSend - lobby', () => {
        it('should broadcast a lobby message', () => {
            const err = chat.handleSend(socket, { type: 'lobby', content: 'Hello!' }, io, rm)

            expect(err).toBeNull()
            expect(io.emit).toHaveBeenCalledTimes(1)
            const call = io.emit.mock.calls[0]
            expect(call[0]).toBe('chat:message')
            expect(call[1].content).toBe('Hello!')
            expect(call[1].userId).toBe(1)
            expect(call[1].nickname).toBe('Alice')
        })

        it('should store the message in lobby history', () => {
            chat.handleSend(socket, { type: 'lobby', content: 'msg1' }, io, rm)

            const history = chat.getLobbyHistory()
            expect(history).toHaveLength(1)
            expect(history[0].content).toBe('msg1')
        })
    })

    describe('handleSend - room', () => {
        it('should broadcast to the room', () => {
            const room = { id: 'room-1', players: [{ userId: 1 }] }
            rm = mockRoomManager({ 'room-1': room })

            const err = chat.handleSend(
                socket,
                { type: 'room', roomId: 'room-1', content: 'In room!' },
                io,
                rm,
            )

            expect(err).toBeNull()
            expect(io.to).toHaveBeenCalledWith('room-1')
        })

        it('should reject if room not found', () => {
            const err = chat.handleSend(
                socket,
                { type: 'room', roomId: 'nonexistent', content: 'test' },
                io,
                rm,
            )

            expect(err.error).toBe('ROOM_NOT_FOUND')
        })

        it('should reject if user is not in the room', () => {
            const room = { id: 'room-1', players: [{ userId: 999 }] }
            rm = mockRoomManager({ 'room-1': room })

            const err = chat.handleSend(
                socket,
                { type: 'room', roomId: 'room-1', content: 'test' },
                io,
                rm,
            )

            expect(err.error).toBe('NOT_IN_ROOM')
        })

        it('should store room messages separately', () => {
            const room = { id: 'room-2', players: [{ userId: 1 }] }
            rm = mockRoomManager({ 'room-2': room })

            chat.handleSend(socket, { type: 'room', roomId: 'room-2', content: 'room msg' }, io, rm)

            expect(chat.getRoomHistory('room-2')).toHaveLength(1)
            expect(chat.getLobbyHistory()).toHaveLength(0)
        })
    })

    // ── 200 character limit ──────────────────────────

    describe('message length validation', () => {
        it('should accept a message of exactly 200 characters', () => {
            const content = 'a'.repeat(200)
            const err = chat.handleSend(socket, { type: 'lobby', content }, io, rm)
            expect(err).toBeNull()
        })

        it('should reject a message over 200 characters', () => {
            const content = 'b'.repeat(201)
            const err = chat.handleSend(socket, { type: 'lobby', content }, io, rm)
            expect(err.error).toBe('MESSAGE_TOO_LONG')
        })

        it('should reject empty messages', () => {
            const err = chat.handleSend(socket, { type: 'lobby', content: '' }, io, rm)
            expect(err.error).toBe('EMPTY_MESSAGE')
        })

        it('should reject null/undefined content', () => {
            const err = chat.handleSend(socket, { type: 'lobby', content: null }, io, rm)
            expect(err.error).toBe('INVALID_MESSAGE')
        })
    })

    // ── Rate limiting ────────────────────────────────

    describe('rate limiting', () => {
        it('should allow 2 messages within 1 second', () => {
            const err1 = chat.handleSend(socket, { type: 'lobby', content: 'msg1' }, io, rm)
            const err2 = chat.handleSend(socket, { type: 'lobby', content: 'msg2' }, io, rm)

            expect(err1).toBeNull()
            expect(err2).toBeNull()
        })

        it('should reject the 3rd message within 1 second', () => {
            chat.handleSend(socket, { type: 'lobby', content: 'msg1' }, io, rm)
            chat.handleSend(socket, { type: 'lobby', content: 'msg2' }, io, rm)
            const err3 = chat.handleSend(socket, { type: 'lobby', content: 'msg3' }, io, rm)

            expect(err3.error).toBe('RATE_LIMITED')
        })

        it('should allow messages again after the rate limit window passes', () => {
            // Send 2 messages
            chat.handleSend(socket, { type: 'lobby', content: 'msg1' }, io, rm)
            chat.handleSend(socket, { type: 'lobby', content: 'msg2' }, io, rm)

            // Manually expire the timestamps
            const timestamps = chat._rateLimits.get(1)
            timestamps[0] = Date.now() - 2000  // expired
            timestamps[1] = Date.now() - 2000  // expired

            const err = chat.handleSend(socket, { type: 'lobby', content: 'msg3' }, io, rm)
            expect(err).toBeNull()
        })

        it('should track rate limits per user', () => {
            const socket2 = mockSocket(2, 'bob', 'Bob')

            chat.handleSend(socket, { type: 'lobby', content: 'msg1' }, io, rm)
            chat.handleSend(socket, { type: 'lobby', content: 'msg2' }, io, rm)

            // User 1 is rate limited, but user 2 should not be
            const err1 = chat.handleSend(socket, { type: 'lobby', content: 'msg3' }, io, rm)
            const err2 = chat.handleSend(socket2, { type: 'lobby', content: 'msg1' }, io, rm)

            expect(err1.error).toBe('RATE_LIMITED')
            expect(err2).toBeNull()
        })
    })

    // ── HTML escaping ────────────────────────────────

    describe('HTML escaping', () => {
        it('should escape < and > tags', () => {
            chat.handleSend(socket, { type: 'lobby', content: '<script>alert(1)</script>' }, io, rm)

            const history = chat.getLobbyHistory()
            expect(history[0].content).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
        })

        it('should escape & characters', () => {
            chat.handleSend(socket, { type: 'lobby', content: 'a & b' }, io, rm)

            const history = chat.getLobbyHistory()
            expect(history[0].content).toBe('a &amp; b')
        })

        it('should escape quotes', () => {
            chat.handleSend(socket, { type: 'lobby', content: 'say "hello" & \'bye\'' }, io, rm)

            const history = chat.getLobbyHistory()
            expect(history[0].content).toBe('say &quot;hello&quot; &amp; &#x27;bye&#x27;')
        })
    })

    // ── Lobby history (max 50) ───────────────────────

    describe('lobby history limit', () => {
        it('should keep at most 50 messages', () => {
            for (let i = 0; i < 60; i++) {
                // Reset rate limits each time
                chat._rateLimits.clear()
                chat.handleSend(
                    mockSocket(i + 100, `user${i}`, `User${i}`),
                    { type: 'lobby', content: `msg ${i}` },
                    io,
                    rm,
                )
            }

            const history = chat.getLobbyHistory()
            expect(history).toHaveLength(50)
            // The first 10 should have been evicted
            expect(history[0].content).toBe('msg 10')
            expect(history[49].content).toBe('msg 59')
        })
    })

    // ── Room history ─────────────────────────────────

    describe('room history', () => {
        it('should return empty array for unknown rooms', () => {
            expect(chat.getRoomHistory('unknown')).toEqual([])
        })

        it('should clear room history', () => {
            const room = { id: 'room-x', players: [{ userId: 1 }] }
            rm = mockRoomManager({ 'room-x': room })

            chat.handleSend(socket, { type: 'room', roomId: 'room-x', content: 'hi' }, io, rm)
            expect(chat.getRoomHistory('room-x')).toHaveLength(1)

            chat.clearRoomHistory('room-x')
            expect(chat.getRoomHistory('room-x')).toEqual([])
        })
    })

    // ── Authentication ───────────────────────────────

    describe('authentication', () => {
        it('should reject messages from unauthenticated sockets', () => {
            const badSocket = { user: null }
            const err = chat.handleSend(badSocket, { type: 'lobby', content: 'nope' }, io, rm)
            expect(err.error).toBe('NOT_AUTHENTICATED')
        })
    })
})
