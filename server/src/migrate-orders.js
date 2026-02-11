require('dotenv').config()
const pool = require('./config/db')

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // room_types 加 stock 字段
    await client.query(`
      ALTER TABLE room_types ADD COLUMN IF NOT EXISTS stock INT DEFAULT 10
    `)

    // 删除旧 orders 表（含依赖），重建正确结构
    await client.query('DROP TABLE IF EXISTS order_items CASCADE')
    await client.query('DROP TABLE IF EXISTS orders CASCADE')

    await client.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        order_no VARCHAR(32) UNIQUE NOT NULL,
        user_id INT NOT NULL REFERENCES users(id),
        hotel_id INT NOT NULL REFERENCES hotels(id),
        room_type_id INT NOT NULL REFERENCES room_types(id),
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        nights INT NOT NULL,
        room_count INT DEFAULT 1,
        total_price NUMERIC(10,2) NOT NULL,
        contact_name VARCHAR(50),
        contact_phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'pending'
          CHECK (status IN ('pending','paid','cancelled','checked_in','completed')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // 索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_no ON orders(order_no);
    `)

    await client.query('COMMIT')
    console.log('订单表迁移完成！')
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
