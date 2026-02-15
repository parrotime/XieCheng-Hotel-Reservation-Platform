require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const path = require('path')
const logger = require('./utils/logger')

const authRoutes = require('./routes/auth')
const hotelRoutes = require('./routes/hotels')
const devRoutes = require('./routes/dev')
const orderRoutes = require('./routes/orders')
const uploadRoutes = require('./routes/upload')
const adminRoutes = require('./routes/admin')
const pool = require('./config/db')
const { startScheduler } = require('./scheduler')
const { initSocket } = require('./websocket')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('short', { stream: logger.stream }))

// 接口限流：每个 IP 15 分钟内最多 100 次请求
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, data: null, message: '请求过于频繁，请稍后再试' },
})
app.use('/api/', apiLimiter)

// 登录/注册更严格限流：每个 IP 15 分钟内最多 20 次
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, data: null, message: '登录尝试过于频繁，请稍后再试' },
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// 静态文件：上传的图片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/hotels', hotelRoutes)
app.use('/api/dev', devRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({ code: 0, data: { status: 'ok', db_time: result.rows[0].now }, message: 'ok' })
  } catch (err) {
    res.status(500).json({ code: 500, data: null, message: err.message })
  }
})

// 全局错误处理
app.use((err, req, res, next) => {
  const statusCode = err.status || 500
  logger.error('请求异常', { method: req.method, url: req.originalUrl, status: statusCode, error: err.message, stack: err.stack })
  res.status(statusCode).json({
    code: statusCode,
    data: null,
    message: err.message || '服务器内部错误'
  })
})

// 导出 app 供测试使用
module.exports = app

// 仅在直接运行时启动服务器（非测试环境）
if (require.main === module) {
  const http = require('http')
  const server = http.createServer(app)
  initSocket(server)
  server.listen(PORT, () => {
    logger.info(`后端服务已启动: http://localhost:${PORT}`)
    logger.info(`健康检查: http://localhost:${PORT}/api/health`)
    startScheduler()
  })
}
