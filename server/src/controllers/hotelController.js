const pool = require('../config/db')
const { AppError } = require('../middleware/errorHandler')
const { success } = require('../utils/response')

// GET /api/hotels — 酒店列表（支持筛选、分页）
async function getHotels(req, res) {
  const {
    city, star, min_price, max_price,
    status = 'approved',
    sort = 'created_at', order = 'DESC',
    page = 1, limit = 20,
    keyword
  } = req.query

  const conditions = []
  const params = []
  let idx = 1

  if (req.user?.role === 'system_admin') {
    if (status !== 'all') {
      conditions.push(`h.status = $${idx++}`)
      params.push(status)
    }
  } else {
    conditions.push(`h.status = 'approved'`)
  }

  if (city) {
    conditions.push(`h.city = $${idx++}`)
    params.push(city)
  }
  if (star) {
    conditions.push(`h.star_rating = $${idx++}`)
    params.push(Number(star))
  }
  if (keyword) {
    conditions.push(`(h.name ILIKE $${idx} OR h.name_en ILIKE $${idx})`)
    params.push(`%${keyword}%`)
    idx++
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
  const offset = (Number(page) - 1) * Number(limit)

  const allowedSort = ['created_at', 'star_rating', 'name']
  const sortCol = allowedSort.includes(sort) ? sort : 'created_at'
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

  const sql = `
    SELECT h.*,
           u.username AS created_by_name,
           (SELECT MIN(rt.default_price) FROM room_types rt WHERE rt.hotel_id = h.id) AS min_price
    FROM hotels h
    LEFT JOIN users u ON h.created_by = u.id
    ${where}
    ORDER BY h.${sortCol} ${sortOrder}
    LIMIT $${idx++} OFFSET $${idx++}
  `
  params.push(Number(limit), offset)

  const [hotelsResult, countResult] = await Promise.all([
    pool.query(sql, params),
    pool.query(`SELECT COUNT(*) FROM hotels h ${where}`, params.slice(0, params.length - 2))
  ])

  success(res, {
    hotels: hotelsResult.rows,
    total: Number(countResult.rows[0].count),
    page: Number(page),
    limit: Number(limit)
  })
}

// GET /api/hotels/:id — 酒店详情（含房型）
async function getHotelById(req, res) {
  const { id } = req.params

  const hotelResult = await pool.query(
    `SELECT h.*, u.username AS created_by_name
     FROM hotels h LEFT JOIN users u ON h.created_by = u.id
     WHERE h.id = $1`,
    [id]
  )
  if (hotelResult.rows.length === 0) {
    throw new AppError('酒店不存在', 404)
  }

  const roomsResult = await pool.query(
    'SELECT * FROM room_types WHERE hotel_id = $1 ORDER BY default_price ASC',
    [id]
  )

  const reviewsResult = await pool.query(
    `SELECT r.*, u.username FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.hotel_id = $1 ORDER BY r.created_at DESC LIMIT 10`,
    [id]
  )

  success(res, {
    ...hotelResult.rows[0],
    rooms: roomsResult.rows,
    reviews: reviewsResult.rows
  })
}

// POST /api/hotels — 商户创建酒店
async function createHotel(req, res) {
  const {
    name, name_en, star_rating, address, city, province,
    description, facilities, images, phone,
    district, subway, nearby_attractions, open_date, tags,
    latitude, longitude,
    rooms = []
  } = req.body

  if (!name || !address) {
    throw new AppError('酒店名称和地址为必填项', 400)
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const hotelResult = await client.query(
      `INSERT INTO hotels (name, name_en, star_rating, address, city, province,
        description, facilities, images, phone, district, subway,
        nearby_attractions, open_date, tags, latitude, longitude, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'pending',$18)
       RETURNING *`,
      [name, name_en, star_rating, address, city || null, province || null,
       description || null,
       facilities ? JSON.stringify(facilities) : null,
       images ? JSON.stringify(images) : null,
       phone || null, district || null, subway || null,
       nearby_attractions ? JSON.stringify(nearby_attractions) : null,
       open_date || null,
       tags ? JSON.stringify(tags) : null,
       latitude || null, longitude || null,
       req.user.id]
    )
    const hotel = hotelResult.rows[0]

    for (const room of rooms) {
      await client.query(
        `INSERT INTO room_types (hotel_id, name, bed_type, max_guests, area_sqm, default_price, stock, facilities)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [hotel.id, room.type || room.name, room.bedType || room.bed_type,
         room.maxGuests || room.max_guests || 2,
         room.size ? parseInt(room.size) : room.area_sqm || null,
         room.price || room.default_price,
         room.stock || 10,
         room.facilities ? JSON.stringify(room.facilities) : null]
      )
    }

    await client.query('COMMIT')
    success(res, hotel, '酒店创建成功', 201)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// PUT /api/hotels/:id — 商户编辑酒店
async function updateHotel(req, res) {
  const { id } = req.params
  const {
    name, name_en, star_rating, address, city, province,
    description, facilities, images, phone,
    district, subway, nearby_attractions, open_date, tags,
    latitude, longitude,
    rooms
  } = req.body

  const check = await pool.query(
    'SELECT id, created_by, status FROM hotels WHERE id = $1',
    [id]
  )
  if (check.rows.length === 0) {
    throw new AppError('酒店不存在', 404)
  }
  if (check.rows[0].created_by !== req.user.id && req.user.role !== 'system_admin') {
    throw new AppError('无权编辑此酒店', 403)
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const result = await client.query(
      `UPDATE hotels SET
         name = COALESCE($1, name),
         name_en = COALESCE($2, name_en),
         star_rating = COALESCE($3, star_rating),
         address = COALESCE($4, address),
         city = COALESCE($5, city),
         province = COALESCE($6, province),
         description = COALESCE($7, description),
         facilities = COALESCE($8, facilities),
         images = COALESCE($9, images),
         phone = COALESCE($10, phone),
         district = COALESCE($11, district),
         subway = COALESCE($12, subway),
         nearby_attractions = COALESCE($13, nearby_attractions),
         open_date = COALESCE($14, open_date),
         tags = COALESCE($15, tags),
         latitude = COALESCE($16, latitude),
         longitude = COALESCE($17, longitude),
         updated_at = NOW()
       WHERE id = $18
       RETURNING *`,
      [name, name_en, star_rating, address, city, province,
       description,
       facilities ? JSON.stringify(facilities) : null,
       images ? JSON.stringify(images) : null,
       phone, district, subway,
       nearby_attractions ? JSON.stringify(nearby_attractions) : null,
       open_date || null,
       tags ? JSON.stringify(tags) : null,
       latitude || null, longitude || null,
       id]
    )

    if (rooms && Array.isArray(rooms)) {
      await client.query('DELETE FROM room_types WHERE hotel_id = $1', [id])
      for (const room of rooms) {
        await client.query(
          `INSERT INTO room_types (hotel_id, name, bed_type, max_guests, area_sqm, default_price, stock, facilities)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [id, room.type || room.name, room.bedType || room.bed_type,
           room.maxGuests || room.max_guests || 2,
           room.size ? parseInt(room.size) : room.area_sqm || null,
           room.price || room.default_price,
           room.stock || 10,
           room.facilities ? JSON.stringify(room.facilities) : null]
        )
      }
    }

    await client.query('COMMIT')
    success(res, result.rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// PATCH /api/hotels/:id/status — 管理员审核
async function updateHotelStatus(req, res) {
  const { id } = req.params
  const { status, reject_reason } = req.body

  const allowed = ['approved', 'rejected', 'offline']
  if (!allowed.includes(status)) {
    throw new AppError('无效的状态值', 400)
  }
  if (status === 'rejected' && !reject_reason) {
    throw new AppError('拒绝时必须填写原因', 400)
  }

  const result = await pool.query(
    `UPDATE hotels SET status = $1, reject_reason = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [status, status === 'rejected' ? reject_reason : null, id]
  )
  if (result.rows.length === 0) {
    throw new AppError('酒店不存在', 404)
  }

  success(res, result.rows[0])
}

// GET /api/hotels/merchant/my
async function getMyHotels(req, res) {
  const hotelsResult = await pool.query(
    `SELECT h.*,
       (SELECT MIN(rt.default_price) FROM room_types rt WHERE rt.hotel_id = h.id) AS min_price,
       (SELECT COUNT(*) FROM room_types rt WHERE rt.hotel_id = h.id) AS room_count
     FROM hotels h WHERE h.created_by = $1 ORDER BY h.created_at DESC`,
    [req.user.id]
  )

  const hotels = []
  for (const hotel of hotelsResult.rows) {
    const roomsResult = await pool.query(
      'SELECT * FROM room_types WHERE hotel_id = $1 ORDER BY default_price ASC',
      [hotel.id]
    )
    hotels.push({ ...hotel, rooms: roomsResult.rows })
  }

  success(res, hotels)
}

// DELETE /api/hotels/:id
async function deleteHotel(req, res) {
  const { id } = req.params

  const check = await pool.query(
    'SELECT created_by FROM hotels WHERE id = $1', [id]
  )
  if (check.rows.length === 0) {
    throw new AppError('酒店不存在', 404)
  }
  if (check.rows[0].created_by !== req.user.id && req.user.role !== 'system_admin') {
    throw new AppError('无权删除此酒店', 403)
  }

  await pool.query('DELETE FROM hotels WHERE id = $1', [id])
  success(res, null, '删除成功')
}

// GET /api/hotels/merchant/orders
async function getMerchantOrders(req, res) {
  const { status, hotel_id, page = 1, limit = 20 } = req.query
  const conditions = ['h.created_by = $1']
  const params = [req.user.id]
  let idx = 2

  if (status && status !== 'all') {
    conditions.push(`o.status = $${idx++}`)
    params.push(status)
  }
  if (hotel_id) {
    conditions.push(`o.hotel_id = $${idx++}`)
    params.push(Number(hotel_id))
  }

  const where = 'WHERE ' + conditions.join(' AND ')
  const offset = (Number(page) - 1) * Number(limit)

  const sql = `
    SELECT o.*, h.name AS hotel_name, rt.name AS room_name, rt.bed_type,
           u.username AS guest_name, u.full_name AS guest_full_name
    FROM orders o
    JOIN hotels h ON o.hotel_id = h.id
    JOIN room_types rt ON o.room_type_id = rt.id
    JOIN users u ON o.user_id = u.id
    ${where}
    ORDER BY o.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `
  params.push(Number(limit), offset)

  const countParams = params.slice(0, idx - 3)
  const [ordersResult, countResult] = await Promise.all([
    pool.query(sql, params),
    pool.query(`SELECT COUNT(*) FROM orders o JOIN hotels h ON o.hotel_id = h.id ${where}`, countParams)
  ])

  success(res, {
    orders: ordersResult.rows,
    total: Number(countResult.rows[0].count),
    page: Number(page),
    limit: Number(limit)
  })
}

// GET /api/hotels/merchant/stats
async function getMerchantStats(req, res) {
  const userId = req.user.id

  const [
    hotelCount,
    orderStats,
    revenueResult,
    recentOrders,
    roomCount
  ] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM hotels WHERE created_by = $1', [userId]),
    pool.query(
      `SELECT o.status, COUNT(*) AS count
       FROM orders o JOIN hotels h ON o.hotel_id = h.id
       WHERE h.created_by = $1
       GROUP BY o.status`,
      [userId]
    ),
    pool.query(
      `SELECT COALESCE(SUM(o.total_price), 0) AS total_revenue
       FROM orders o JOIN hotels h ON o.hotel_id = h.id
       WHERE h.created_by = $1 AND o.status IN ('paid', 'completed')`,
      [userId]
    ),
    pool.query(
      `SELECT DATE(o.created_at) AS date, COUNT(*) AS count
       FROM orders o JOIN hotels h ON o.hotel_id = h.id
       WHERE h.created_by = $1 AND o.created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(o.created_at)
       ORDER BY date`,
      [userId]
    ),
    pool.query(
      `SELECT COUNT(*) FROM room_types rt
       JOIN hotels h ON rt.hotel_id = h.id
       WHERE h.created_by = $1`,
      [userId]
    )
  ])

  const statusCounts = {}
  for (const row of orderStats.rows) {
    statusCounts[row.status] = Number(row.count)
  }

  success(res, {
    hotel_count: Number(hotelCount.rows[0].count),
    room_count: Number(roomCount.rows[0].count),
    total_orders: Object.values(statusCounts).reduce((a, b) => a + b, 0),
    order_status: statusCounts,
    total_revenue: Number(revenueResult.rows[0].total_revenue),
    recent_daily_orders: recentOrders.rows
  })
}

// PUT /api/hotels/merchant/inventory
async function updateInventory(req, res) {
  const { room_type_id, dates } = req.body

  if (!room_type_id || !dates || !Array.isArray(dates)) {
    throw new AppError('参数不完整', 400)
  }

  const check = await pool.query(
    `SELECT rt.id, rt.stock FROM room_types rt
     JOIN hotels h ON rt.hotel_id = h.id
     WHERE rt.id = $1 AND h.created_by = $2`,
    [room_type_id, req.user.id]
  )
  if (check.rows.length === 0) {
    throw new AppError('房型不存在或无权操作', 403)
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const { date, available } of dates) {
      await client.query(
        `INSERT INTO room_inventory (room_type_id, date, available)
         VALUES ($1, $2, $3)
         ON CONFLICT (room_type_id, date)
         DO UPDATE SET available = $3`,
        [room_type_id, date, available]
      )
    }
    await client.query('COMMIT')
    success(res, null, '库存更新成功')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// GET /api/hotels/merchant/inventory
async function getInventory(req, res) {
  const { room_type_id, start_date, end_date } = req.query

  if (!room_type_id) throw new AppError('缺少 room_type_id', 400)

  const check = await pool.query(
    `SELECT rt.id, rt.stock AS default_stock FROM room_types rt
     JOIN hotels h ON rt.hotel_id = h.id
     WHERE rt.id = $1 AND h.created_by = $2`,
    [room_type_id, req.user.id]
  )
  if (check.rows.length === 0) {
    throw new AppError('房型不存在或无权操作', 403)
  }

  const defaultStock = check.rows[0].default_stock

  const result = await pool.query(
    `SELECT date::text AS date, available FROM room_inventory
     WHERE room_type_id = $1 AND date >= $2 AND date <= $3
     ORDER BY date`,
    [room_type_id, start_date || new Date().toISOString().slice(0, 10), end_date || '2099-12-31']
  )

  success(res, {
    default_stock: defaultStock,
    inventory: result.rows
  })
}

module.exports = {
  getHotels, getHotelById, createHotel,
  updateHotel, updateHotelStatus,
  getMyHotels, deleteHotel,
  getMerchantOrders, getMerchantStats,
  updateInventory, getInventory
}
