const pool = require('../config/db')
const { AppError } = require('../middleware/errorHandler')

// 生成订单号
function generateOrderNo() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD${date}${rand}`
}

// 工具：生成日期范围数组 [checkIn, checkOut)
function getDateRange(checkIn, checkOut) {
  const dates = []
  const d = new Date(checkIn)
  const end = new Date(checkOut)
  while (d < end) {
    dates.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

// POST /api/orders — 创建订单（按日期扣库存 + 支持 room_count）
async function createOrder(req, res) {
  const { room_type_id, hotel_id, check_in, check_out, room_count = 1, contact_name, contact_phone } = req.body

  if (!room_type_id || !hotel_id || !check_in || !check_out) {
    throw new AppError('缺少必填参数', 400)
  }

  const checkInDate = new Date(check_in)
  const checkOutDate = new Date(check_out)
  const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))

  if (nights <= 0) throw new AppError('退房日期必须晚于入住日期', 400)
  if (room_count < 1 || room_count > 10) throw new AppError('房间数量须在1-10之间', 400)

  const dates = getDateRange(checkInDate, checkOutDate)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. 行锁房型，获取默认库存和价格
    const roomResult = await client.query(
      'SELECT id, name, default_price, stock FROM room_types WHERE id = $1 AND hotel_id = $2 FOR UPDATE',
      [room_type_id, hotel_id]
    )
    if (roomResult.rows.length === 0) {
      throw new AppError('房型不存在', 404)
    }
    const room = roomResult.rows[0]
    const defaultStock = room.stock

    // 2. 锁定日期范围内已有的库存记录
    const invResult = await client.query(
      `SELECT date::text AS date, available FROM room_inventory
       WHERE room_type_id = $1 AND date >= $2 AND date < $3
       FOR UPDATE`,
      [room_type_id, check_in, check_out]
    )
    const invMap = new Map(invResult.rows.map(r => [r.date, r.available]))

    // 3. 检查每一天的可用库存
    for (const dateStr of dates) {
      const available = invMap.has(dateStr) ? invMap.get(dateStr) : defaultStock
      if (available < room_count) {
        throw new AppError(`${dateStr} 该房型仅剩 ${available} 间，无法预订 ${room_count} 间`, 409)
      }
    }

    // 4. 扣减每一天的库存（UPSERT）
    for (const dateStr of dates) {
      await client.query(
        `INSERT INTO room_inventory (room_type_id, date, available)
         VALUES ($1, $2, $3 - $4)
         ON CONFLICT (room_type_id, date)
         DO UPDATE SET available = room_inventory.available - $4`,
        [room_type_id, dateStr, defaultStock, room_count]
      )
    }

    // 5. 创建订单
    const totalPrice = room.default_price * nights * room_count
    const orderNo = generateOrderNo()

    const orderResult = await client.query(
      `INSERT INTO orders (order_no, user_id, hotel_id, room_type_id, check_in, check_out, nights, room_count, total_price, contact_name, contact_phone, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending')
       RETURNING *`,
      [orderNo, req.user.id, hotel_id, room_type_id, check_in, check_out, nights, room_count, totalPrice, contact_name || null, contact_phone || null]
    )

    await client.query('COMMIT')

    res.status(201).json({
      ...orderResult.rows[0],
      room_name: room.name,
      unit_price: room.default_price
    })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// GET /api/orders — 当前用户的订单列表
async function getOrders(req, res) {
  const { status, page = 1, limit = 20 } = req.query
  const conditions = ['o.user_id = $1']
  const params = [req.user.id]
  let idx = 2

  if (status && status !== 'all') {
    conditions.push(`o.status = $${idx++}`)
    params.push(status)
  }

  const where = 'WHERE ' + conditions.join(' AND ')
  const offset = (Number(page) - 1) * Number(limit)

  const sql = `
    SELECT o.*, h.name AS hotel_name, h.address AS hotel_address,
           h.images AS hotel_images, rt.name AS room_name, rt.bed_type
    FROM orders o
    JOIN hotels h ON o.hotel_id = h.id
    JOIN room_types rt ON o.room_type_id = rt.id
    ${where}
    ORDER BY o.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `
  params.push(Number(limit), offset)

  const countParams = params.slice(0, status && status !== 'all' ? 2 : 1)
  const [ordersResult, countResult] = await Promise.all([
    pool.query(sql, params),
    pool.query(`SELECT COUNT(*) FROM orders o ${where}`, countParams)
  ])

  res.json({
    orders: ordersResult.rows,
    total: Number(countResult.rows[0].count),
    page: Number(page),
    limit: Number(limit)
  })
}

// GET /api/orders/:id — 订单详情
async function getOrderById(req, res) {
  const result = await pool.query(
    `SELECT o.*, h.name AS hotel_name, h.address AS hotel_address,
            h.images AS hotel_images,
            rt.name AS room_name, rt.bed_type, rt.area_sqm, rt.max_guests
     FROM orders o
     JOIN hotels h ON o.hotel_id = h.id
     JOIN room_types rt ON o.room_type_id = rt.id
     WHERE o.id = $1 AND o.user_id = $2`,
    [req.params.id, req.user.id]
  )

  if (result.rows.length === 0) {
    throw new AppError('订单不存在', 404)
  }
  res.json(result.rows[0])
}

// PUT /api/orders/:id/pay — 模拟支付
async function payOrder(req, res) {
  const result = await pool.query(
    `UPDATE orders SET status = 'paid', updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND status = 'pending'
     RETURNING *`,
    [req.params.id, req.user.id]
  )

  if (result.rows.length === 0) {
    throw new AppError('订单不存在或状态不允许支付', 400)
  }
  res.json(result.rows[0])
}

// PUT /api/orders/:id/cancel — 取消订单（按日期恢复库存）
async function cancelOrder(req, res) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const orderResult = await client.query(
      `SELECT id, room_type_id, room_count, check_in, check_out, status
       FROM orders
       WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [req.params.id, req.user.id]
    )

    if (orderResult.rows.length === 0) {
      throw new AppError('订单不存在', 404)
    }

    const order = orderResult.rows[0]
    if (!['pending', 'paid'].includes(order.status)) {
      throw new AppError('当前状态不允许取消', 400)
    }

    // 按日期恢复库存
    const dates = getDateRange(order.check_in, order.check_out)
    for (const dateStr of dates) {
      await client.query(
        `UPDATE room_inventory SET available = available + $1
         WHERE room_type_id = $2 AND date = $3`,
        [order.room_count, order.room_type_id, dateStr]
      )
    }

    const updated = await client.query(
      `UPDATE orders SET status = 'cancelled', cancel_reason = 'user', updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [order.id]
    )

    await client.query('COMMIT')
    res.json(updated.rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

module.exports = { createOrder, getOrders, getOrderById, payOrder, cancelOrder }
