export default {
    port: process.env.PORT || 3001,
    jwtSecret: process.env.JWT_SECRET || 'chicken-bro-dev-secret-key',
    jwtExpiresIn: '7d',              // 普通登录 token 有效期
    jwtExpiresInAutoLogin: '30d',    // 自动登录 token 有效期
    bcryptRounds: 12,
    dbPath: process.env.DB_PATH || './data/chickenBro.db',
    maxRoomWaitTime: 120000,  // 2 minutes
    maxPlayersPerRoom: 5,
}
