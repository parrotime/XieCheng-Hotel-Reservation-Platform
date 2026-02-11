const pool = require('../config/db')

// 生成订单号
function generateOrderNo() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD${date}${rand}`
}

// POST /api/orders — 创建订单（事务 + 行锁）
async function createOrder(req, res) {
  const { room_type_id, hotel_id, check_in, check_out, contact_name, contact_phone } = req.body

  if (!room_type_id || !hotel_id || !check_in || !check_out) {
    return res.status(400).json({ error: '缺少必填参数' })
  }

  const checkInDate = new Date(check_in)
  const checkOutDate = new Date(check_out)
  const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))

  if (nights <= 0) {
    return res.status(400).json({ error: '退房日期必须晚于入住日期' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 行锁：锁定房型记录，防止并发超卖
    const roomResult = await client.query(
      'SELECT id, name, default_price, stock FROM room_types WHERE id = $1 AND hotel_id = $2 FOR UPDATE',
      [room_type_id, hotel_id]
    )

    if (roomResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: '房型不存在' })
    }

    const room = roomResult.rows[0]

    if (room.stock <= 0) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: '该房型已售罄' })
    }

    // 扣减库存
    await client.query(
      'UPDATE room_types SET stock = stock - 1 WHERE id = $1',
      [room_type_id]
    )

    // 创建订单
    const totalPrice = room.default_price * nights
    const orderNo = generateOrderNo()

    const orderResult = await client.query(
      `INSERT INTO orders (order_no, user_id, hotel_id, room_type_id, check_in, check_out, nights, total_price, contact_name, contact_phone, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')
       RETURNING *`,
      [orderNo, req.user.id, hotel_id, room_type_id, check_in, check_out, nights, totalPrice, contact_name || null, contact_phone || null]
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

  const [ordersResult, countResult] = await Promise.all([
    pool.query(sql, params),
    pool.query(`SELECT COUNT(*) FROM orders o ${where}`, params.slice(0, status && status !== 'all' ? 2 : 1))
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
            h.images AS hotel_images, h.phone AS hotel_phone,
            rt.name AS room_name, rt.bed_type, rt.area_sqm, rt.max_guests
     FROM orders o
     JOIN hotels h ON o.hotel_id = h.id
     JOIN room_types rt ON o.room_type_id = rt.id
     WHERE o.id = $1 AND o.user_id = $2`,
    [req.params.id, req.user.id]
  )

  if (result.rows.length === 0) {
    return res.status(404).json({ error: '订单不存在' })
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
    return res.status(400).json({ error: '订单不存在或状态不允许支付' })
  }
  res.json(result.rows[0])
}

// PUT /api/orders/:id/cancel — 取消订单（恢复库存）
async function cancelOrder(req, res) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const orderResult = await client.query(
      `SELECT id, room_type_id, status FROM orders
       WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [req.params.id, req.user.id]
    )

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: '订单不存在' })
    }

    const order = orderResult.rows[0]
    if (!['pending', 'paid'].includes(order.status)) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: '当前状态不允许取消' })
    }

    // 恢复库存
    await client.query(
      'UPDATE room_types SET stock = stock + 1 WHERE id = $1',
      [order.room_type_id]
    )

    const updated = await client.query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW()
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
