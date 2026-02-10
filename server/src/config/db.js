const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// 连接测试
pool.on('connect', () => {
  console.log('[DB] PostgreSQL 连接成功')
})

pool.on('error', (err) => {
  console.error('[DB] PostgreSQL 连接异常:', err.message)
})

module.exports = pool
