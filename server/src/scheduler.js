const pool = require('./config/db')

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

// 自动取消超时未支付订单（每分钟执行一次）
async function cancelExpiredOrders() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 查找超过15分钟未支付的 pending 订单
    const expired = await client.query(
      `SELECT id, room_type_id, room_count, check_in, check_out
       FROM orders
       WHERE status = 'pending' AND created_at < NOW() - INTERVAL '15 minutes'
       FOR UPDATE`
    )

    if (expired.rows.length === 0) {
      await client.query('COMMIT')
      return
    }

    for (const order of expired.rows) {
      // 按日期恢复库存
      const dates = getDateRange(order.check_in, order.check_out)
      for (const dateStr of dates) {
        await client.query(
          `UPDATE room_inventory SET available = available + $1
           WHERE room_type_id = $2 AND date = $3`,
          [order.room_count, order.room_type_id, dateStr]
        )
      }

      await client.query(
        `UPDATE orders SET status = 'cancelled', cancel_reason = 'timeout', updated_at = NOW()
         WHERE id = $1`,
        [order.id]
      )
    }

    await client.query('COMMIT')
    console.log(`[Scheduler] 自动取消 ${expired.rows.length} 个超时订单`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[Scheduler] 自动取消订单失败:', err.message)
  } finally {
    client.release()
  }
}

// 启动定时任务
let timer = null

function startScheduler() {
  // 每60秒执行一次
  timer = setInterval(cancelExpiredOrders, 60 * 1000)
  console.log('[Scheduler] 订单超时自动取消任务已启动（每60秒检查一次）')
}

function stopScheduler() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

module.exports = { startScheduler, stopScheduler }
