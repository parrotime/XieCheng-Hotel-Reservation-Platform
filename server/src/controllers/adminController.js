const pool = require('../config/db')
const { success } = require('../utils/response')

// GET /api/admin/dashboard
async function getDashboard(req, res) {
  const [users, hotels, orders, reviews] = await Promise.all([
    pool.query(`
      SELECT count(*)::int AS total,
        count(*) FILTER (WHERE role = 'guest')::int        AS guests,
        count(*) FILTER (WHERE role = 'hotel_admin')::int   AS merchants,
        count(*) FILTER (WHERE role = 'system_admin')::int  AS admins,
        count(*) FILTER (WHERE role = 'staff')::int         AS staff,
        count(*) FILTER (WHERE role = 'developer')::int     AS developers
      FROM users
    `),
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
        count(*) FILTER (WHERE status = 'pending')::int    AS pending,
        count(*) FILTER (WHERE status = 'paid')::int       AS paid,
        count(*) FILTER (WHERE status = 'checked_in')::int AS checked_in,
        count(*) FILTER (WHERE status = 'completed')::int  AS completed,
        count(*) FILTER (WHERE status = 'cancelled')::int  AS cancelled
      FROM orders
    `),
    pool.query(`
      SELECT count(*)::int AS total,
        round(avg(rating), 1)::float AS avg_rating
      FROM reviews
    `),
  ])

  success(res, {
    users: users.rows[0],
    hotels: hotels.rows[0],
    orders: orders.rows[0],
    reviews: reviews.rows[0],
  })
}

// GET /api/admin/users
async function getUsers(req, res) {
  const { role } = req.query
  let sql = `
    SELECT u.id, u.username, u.email, u.role, u.full_name, u.phone, u.is_active, u.created_at,
      (SELECT count(*)::int FROM orders o WHERE o.user_id = u.id) AS order_count
    FROM users u
  `
  const params = []
  if (role && role !== 'all') {
    sql += ' WHERE u.role = $1'
    params.push(role)
  }
  sql += ' ORDER BY u.created_at DESC'

  const result = await pool.query(sql, params)
  success(res, result.rows)
}

// GET /api/admin/orders-list
async function getOrders(req, res) {
  const { status } = req.query
  let sql = `
    SELECT o.id, o.order_no, o.status, o.total_price, o.check_in, o.check_out,
      o.contact_name, o.contact_phone, o.created_at,
      u.username AS user_name,
      h.name AS hotel_name,
      rt.name AS room_type_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    LEFT JOIN hotels h ON h.id = o.hotel_id
    LEFT JOIN room_types rt ON rt.id = o.room_type_id
  `
  const params = []
  if (status && status !== 'all') {
    sql += ' WHERE o.status = $1'
    params.push(status)
  }
  sql += ' ORDER BY o.created_at DESC LIMIT 100'

  const result = await pool.query(sql, params)
  success(res, result.rows)
}

// GET /api/admin/reviews-list
async function getReviews(req, res) {
  const result = await pool.query(`
    SELECT r.id, r.rating, r.content, r.reply_content, r.reply_at, r.created_at,
      u.username AS user_name, u.full_name AS user_full_name,
      h.name AS hotel_name
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN hotels h ON h.id = r.hotel_id
    ORDER BY r.created_at DESC
    LIMIT 100
  `)
  success(res, result.rows)
}

module.exports = { getDashboard, getUsers, getOrders, getReviews }
