const jwt = require('jsonwebtoken')
const pool = require('../config/db')
const { success, fail } = require('../utils/response')

// POST /api/dev/impersonate
async function impersonate(req, res) {
  const { username } = req.body
  if (!username) {
    return fail(res, '请指定要模拟的用户名', 400)
  }

  const result = await pool.query(
    'SELECT id, username, email, role, full_name, phone, created_at FROM users WHERE username = $1 AND is_active = true',
    [username]
  )
  if (result.rows.length === 0) {
    return fail(res, '用户不存在', 404)
  }

  const user = result.rows[0]
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  success(res, { token, user })
}

// GET /api/dev/stats
async function getStats(req, res) {
  const [hotels, users, orders, rooms, reviews] = await Promise.all([
    pool.query(`
      SELECT count(*)::int AS total,
        count(*) FILTER (WHERE status = 'approved')::int  AS approved,
        count(*) FILTER (WHERE status = 'pending')::int   AS pending,
        count(*) FILTER (WHERE status = 'rejected')::int  AS rejected,
        count(*) FILTER (WHERE status = 'offline')::int   AS offline
      FROM hotels
    `),
    pool.query(`
      SELECT count(*)::int AS total,
        json_object_agg(role, cnt) AS by_role
      FROM (SELECT role, count(*)::int AS cnt FROM users GROUP BY role) t
    `),
    pool.query(`
      SELECT count(*)::int AS total,
        json_object_agg(coalesce(status,'unknown'), cnt) AS by_status
      FROM (SELECT status, count(*)::int AS cnt FROM orders GROUP BY status) t
    `),
    pool.query(`SELECT count(*)::int AS total FROM rooms`),
    pool.query(`SELECT count(*)::int AS total FROM reviews`),
  ])

  success(res, {
    hotels: hotels.rows[0],
    users: users.rows[0],
    orders: orders.rows[0].total > 0 ? orders.rows[0] : { total: 0, by_status: {} },
    rooms: { total: rooms.rows[0].total },
    reviews: { total: reviews.rows[0].total },
  })
}

module.exports = { getStats, impersonate }
