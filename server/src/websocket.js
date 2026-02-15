const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const logger = require('./utils/logger')

// userId -> Set<socketId> 映射
const userSockets = new Map()

let io = null

/**
 * 初始化 Socket.IO 服务，绑定到 HTTP server
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/socket.io',
  })

  // JWT 鉴权中间件
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('未提供认证令牌'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = decoded
      next()
    } catch {
      next(new Error('令牌无效或已过期'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.user.id
    logger.info('WebSocket 连接', { userId, socketId: socket.id })

    // 注册 userId -> socket 映射
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set())
    }
    userSockets.get(userId).add(socket.id)

    // 加入用户专属房间，方便定向推送
    socket.join(`user:${userId}`)

    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) userSockets.delete(userId)
      }
      logger.info('WebSocket 断开', { userId, socketId: socket.id })
    })
  })

  logger.info('Socket.IO 已初始化')
  return io
}

/**
 * 向指定用户推送事件
 */
function notifyUser(userId, event, data) {
  if (!io) return
  io.to(`user:${userId}`).emit(event, data)
}

/**
 * 获取在线用户数
 */
function getOnlineCount() {
  return userSockets.size
}

module.exports = { initSocket, notifyUser, getOnlineCount }
