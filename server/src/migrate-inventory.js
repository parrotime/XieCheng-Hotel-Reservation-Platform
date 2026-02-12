require('dotenv').config()
const pool = require('./config/db')

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 创建 room_inventory 表：按日期管理库存
    await client.query(`
      CREATE TABLE IF NOT EXISTS room_inventory (
        room_type_id INT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        available INT NOT NULL,
        PRIMARY KEY (room_type_id, date)
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_room_inv_date ON room_inventory(date)
    `)

    // 给 orders 表加 cancelled_reason 字段（区分手动取消和超时取消）
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(20) DEFAULT NULL
    `)

    await client.query('COMMIT')
    console.log('room_inventory 表迁移完成！')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('迁移失败:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
