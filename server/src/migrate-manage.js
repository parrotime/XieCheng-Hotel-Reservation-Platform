require('dotenv').config()
const pool = require('./config/db')

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    console.log('添加 hotels 表缺失字段...')
    await client.query(`
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS district VARCHAR(100);
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS subway VARCHAR(200);
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS nearby_attractions JSONB;
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS open_date DATE;
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS tags JSONB;
      ALTER TABLE hotels ADD COLUMN IF NOT EXISTS reject_reason TEXT;
    `)

    await client.query('COMMIT')
    console.log('迁移完成！')
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
