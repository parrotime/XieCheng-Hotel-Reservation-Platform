const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

// 生成 JWT
function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}

// POST /api/auth/register
async function register(req, res) {
  const { username, email, password, role = 'guest', full_name, phone } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ error: '用户名、邮箱和密码为必填项' })
  }

  // 检查用户名/邮箱是否已存在
  const exists = await pool.query(
    'SELECT id FROM users WHERE username = $1 OR email = $2',
    [username, email]
  )
  if (exists.rows.length > 0) {
    return res.status(409).json({ error: '用户名或邮箱已被注册' })
  }

  const password_hash = await bcrypt.hash(password, 10)

  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, role, full_name, phone)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, username, email, role, full_name, phone, created_at`,
    [username, email, password_hash, role, full_name || null, phone || null]
  )

  const user = result.rows[0]
  const token = signToken(user)

  res.status(201).json({ token, user })
}

// POST /api/auth/login
async function login(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码为必填项' })
  }

  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1 AND is_active = true',
    [username]
  )
  if (result.rows.length === 0) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const user = result.rows[0]
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const token = signToken(user)
  const { password_hash, ...userInfo } = user

  res.json({ token, user: userInfo })
}

// GET /api/auth/me — 获取当前用户信息
async function getMe(req, res) {
  const result = await pool.query(
    'SELECT id, username, email, role, full_name, phone, created_at FROM users WHERE id = $1',
    [req.user.id]
  )
  if (result.rows.length === 0) {
    return res.status(404).json({ error: '用户不存在' })
  }
  res.json(result.rows[0])
}

module.exports = { register, login, getMe }
