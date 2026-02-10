require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const authRoutes = require('./routes/auth')
const hotelRoutes = require('./routes/hotels')
const pool = require('./config/db')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/hotels', hotelRoutes)

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({ status: 'ok', db_time: result.rows[0].now })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
})

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack || err.message)
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误'
  })
})

app.listen(PORT, () => {
  console.log(`[Server] 后端服务已启动: http://localhost:${PORT}`)
  console.log(`[Server] 健康检查: http://localhost:${PORT}/api/health`)
})
