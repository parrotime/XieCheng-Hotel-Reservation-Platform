const pool = require('../config/db')

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

  // 默认只返回已上线酒店（管理员可查看全部）
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

  // 允许的排序字段白名单
  const allowedSort = ['created_at', 'star_rating', 'name']
  const sortCol = allowedSort.includes(sort) ? sort : 'created_at'
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

  // 查询酒店列表（附带最低房价）
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

  res.json({
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
    return res.status(404).json({ error: '酒店不存在' })
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

  res.json({
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
    rooms = []
  } = req.body

  if (!name || !address) {
    return res.status(400).json({ error: '酒店名称和地址为必填项' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const hotelResult = await client.query(
      `INSERT INTO hotels (name, name_en, star_rating, address, city, province,
        description, facilities, images, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10)
       RETURNING *`,
      [name, name_en, star_rating, address, city || null, province || null,
       description || null,
       facilities ? JSON.stringify(facilities) : null,
       images ? JSON.stringify(images) : null,
       req.user.id]
    )
    const hotel = hotelResult.rows[0]

    // 批量插入房型
    for (const room of rooms) {
      await client.query(
        `INSERT INTO room_types (hotel_id, name, bed_type, max_guests, area_sqm, default_price, facilities)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [hotel.id, room.type || room.name, room.bedType || room.bed_type,
         room.maxGuests || room.max_guests || 2,
         room.size ? parseInt(room.size) : room.area_sqm || null,
         room.price || room.default_price,
         room.facilities ? JSON.stringify(room.facilities) : null]
      )
    }

    await client.query('COMMIT')

    res.status(201).json(hotel)
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
    description, facilities, images
  } = req.body

  // 验证所有权
  const check = await pool.query(
    'SELECT id, created_by, status FROM hotels WHERE id = $1',
    [id]
  )
  if (check.rows.length === 0) {
    return res.status(404).json({ error: '酒店不存在' })
  }
  if (check.rows[0].created_by !== req.user.id && req.user.role !== 'system_admin') {
    return res.status(403).json({ error: '无权编辑此酒店' })
  }

  const result = await pool.query(
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
       updated_at = NOW()
     WHERE id = $10
     RETURNING *`,
    [name, name_en, star_rating, address, city, province,
     description,
     facilities ? JSON.stringify(facilities) : null,
     images ? JSON.stringify(images) : null,
     id]
  )

  res.json(result.rows[0])
}

// PATCH /api/hotels/:id/status — 管理员审核
async function updateHotelStatus(req, res) {
  const { id } = req.params
  const { status, reject_reason } = req.body

  const allowed = ['approved', 'rejected', 'offline']
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: '无效的状态值' })
  }
  if (status === 'rejected' && !reject_reason) {
    return res.status(400).json({ error: '拒绝时必须填写原因' })
  }

  const result = await pool.query(
    `UPDATE hotels SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  )
  if (result.rows.length === 0) {
    return res.status(404).json({ error: '酒店不存在' })
  }

  res.json(result.rows[0])
}

// GET /api/hotels/merchant/my — 商户获取自己的酒店
async function getMyHotels(req, res) {
  const result = await pool.query(
    `SELECT h.*,
       (SELECT MIN(rt.default_price) FROM room_types rt WHERE rt.hotel_id = h.id) AS min_price
     FROM hotels h WHERE h.created_by = $1 ORDER BY h.created_at DESC`,
    [req.user.id]
  )
  res.json(result.rows)
}

// DELETE /api/hotels/:id — 商户删除酒店
async function deleteHotel(req, res) {
  const { id } = req.params

  const check = await pool.query(
    'SELECT created_by FROM hotels WHERE id = $1', [id]
  )
  if (check.rows.length === 0) {
    return res.status(404).json({ error: '酒店不存在' })
  }
  if (check.rows[0].created_by !== req.user.id && req.user.role !== 'system_admin') {
    return res.status(403).json({ error: '无权删除此酒店' })
  }

  await pool.query('DELETE FROM hotels WHERE id = $1', [id])
  res.json({ message: '删除成功' })
}

module.exports = {
  getHotels, getHotelById, createHotel,
  updateHotel, updateHotelStatus,
  getMyHotels, deleteHotel
}
