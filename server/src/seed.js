require('dotenv').config()

const bcrypt = require('bcryptjs')
const pool = require('./config/db')

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 更新 role 约束，加入 developer
    console.log('更新 role 约束...')
    await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check
        CHECK (role IN ('guest', 'hotel_admin', 'system_admin', 'staff', 'developer'));
    `)

    console.log('清理旧数据...')
    await client.query('DELETE FROM reviews')
    await client.query('DELETE FROM room_inventory')
    await client.query('DELETE FROM orders')
    await client.query('DELETE FROM room_types')
    await client.query('DELETE FROM hotels')
    await client.query('DELETE FROM users')

    // ========== 用户 ==========
    console.log('插入用户...')
    const hash = await bcrypt.hash('123456', 10)

    const users = await client.query(
      `INSERT INTO users (username, email, password_hash, role, full_name) VALUES
        ('admin',    'admin@hotel.com',    $1, 'system_admin', '系统管理员'),
        ('merchant', 'merchant@hotel.com', $1, 'hotel_admin',  '商户张三'),
        ('guest',    'guest@hotel.com',    $1, 'guest',        '旅客李四'),
        ('merchant2','merchant2@hotel.com',$1, 'hotel_admin',  '商户王五'),
        ('dev',      'dev@hotel.com',      $1, 'developer',    '开发者')
       RETURNING id, username, role`,
      [hash]
    )
    console.log('用户:', users.rows.map(u => `${u.username}(${u.role})`).join(', '))

    const merchantId = users.rows.find(u => u.username === 'merchant').id
    const merchant2Id = users.rows.find(u => u.username === 'merchant2').id

    // ========== 酒店 ==========
    console.log('插入酒店...')
    const hotelsData = [
      {
        name: '上海外滩华尔道夫酒店', name_en: 'Waldorf Astoria Shanghai on the Bund',
        star: 5, address: '上海市黄浦区中山东一路2号', city: '上海', province: '上海',
        desc: '坐落于外滩的传奇酒店，尽享浦江两岸壮丽景色',
        facilities: ['免费WiFi','停车场','游泳池','健身房','SPA','餐厅','会议室'],
        images: [
          {url:'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',desc:'外观',is_main:true},
          {url:'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',desc:'大堂'}
        ],
        status: 'approved', owner: merchantId
      },
      {
        name: '北京王府井希尔顿酒店', name_en: 'Hilton Beijing Wangfujing',
        star: 5, address: '北京市东城区王府井东街8号', city: '北京', province: '北京',
        desc: '位于王府井商业区核心地段，毗邻故宫和天安门广场',
        facilities: ['免费WiFi','停车场','游泳池','健身房','餐厅','商务中心'],
        images: [
          {url:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',desc:'外观',is_main:true}
        ],
        status: 'approved', owner: merchantId
      },
      {
        name: '杭州西湖国宾馆', name_en: 'West Lake State Guest House',
        star: 5, address: '杭州市西湖区杨公堤18号', city: '杭州', province: '浙江',
        desc: '西湖畔的园林式国宾馆，曾接待多国元首',
        facilities: ['免费WiFi','停车场','游泳池','花园','餐厅','茶室'],
        images: [
          {url:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',desc:'外观',is_main:true}
        ],
        status: 'approved', owner: merchant2Id
      },
      {
        name: '成都太古里博舍酒店', name_en: 'The Temple House Chengdu',
        star: 5, address: '成都市锦江区笔帖式街81号', city: '成都', province: '四川',
        desc: '融合古今的精品酒店，坐落于太古里商业区',
        facilities: ['免费WiFi','游泳池','健身房','SPA','餐厅','酒吧'],
        images: [
          {url:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',desc:'外观',is_main:true}
        ],
        status: 'approved', owner: merchant2Id
      },
      {
        name: '三亚亚特兰蒂斯酒店', name_en: 'Atlantis Sanya',
        star: 5, address: '三亚市海棠区海棠北路36号', city: '三亚', province: '海南',
        desc: '集水族馆、水上乐园于一体的海滨度假胜地',
        facilities: ['免费WiFi','停车场','水上乐园','水族馆','沙滩','餐厅','SPA'],
        images: [
          {url:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',desc:'外观',is_main:true}
        ],
        status: 'approved', owner: merchantId
      },
      {
        name: '深圳湾万丽酒店', name_en: 'Renaissance Shenzhen Bay',
        star: 4, address: '深圳市南山区后海滨路3398号', city: '深圳', province: '广东',
        desc: '深圳湾畔的商务酒店，俯瞰深圳湾大桥',
        facilities: ['免费WiFi','停车场','健身房','餐厅','会议室'],
        images: [
          {url:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',desc:'外观',is_main:true}
        ],
        status: 'pending', owner: merchant2Id
      }
    ]

    const hotelIds = []
    for (const h of hotelsData) {
      const r = await client.query(
        `INSERT INTO hotels (name, name_en, star_rating, address, city, province,
          description, facilities, images, status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [h.name, h.name_en, h.star, h.address, h.city, h.province,
         h.desc, JSON.stringify(h.facilities), JSON.stringify(h.images),
         h.status, h.owner]
      )
      hotelIds.push(r.rows[0].id)
    }
    console.log(`插入 ${hotelIds.length} 家酒店`)

    // ========== 房型 ==========
    console.log('插入房型...')
    const roomTypesData = [
      // 华尔道夫
      { hotel: 0, name: '豪华大床房', bed: '1张特大床', guests: 2, area: 45, price: 1888, stock: 8 },
      { hotel: 0, name: '外滩江景套房', bed: '1张特大床', guests: 2, area: 72, price: 3688, stock: 3 },
      { hotel: 0, name: '双床房', bed: '2张单人床', guests: 2, area: 42, price: 1688, stock: 10 },
      // 希尔顿
      { hotel: 1, name: '高级大床房', bed: '1张大床', guests: 2, area: 38, price: 1288, stock: 12 },
      { hotel: 1, name: '行政套房', bed: '1张特大床', guests: 3, area: 65, price: 2588, stock: 4 },
      // 西湖国宾馆
      { hotel: 2, name: '园景大床房', bed: '1张大床', guests: 2, area: 50, price: 1588, stock: 6 },
      { hotel: 2, name: '湖景套房', bed: '1张特大床', guests: 2, area: 80, price: 3288, stock: 2 },
      // 博舍
      { hotel: 3, name: '庭院房', bed: '1张大床', guests: 2, area: 55, price: 1388, stock: 7 },
      { hotel: 3, name: '传承套房', bed: '1张特大床', guests: 2, area: 90, price: 2888, stock: 3 },
      // 亚特兰蒂斯
      { hotel: 4, name: '海景大床房', bed: '1张特大床', guests: 2, area: 48, price: 1988, stock: 15 },
      { hotel: 4, name: '水底套房', bed: '1张特大床', guests: 2, area: 100, price: 8888, stock: 2 },
      { hotel: 4, name: '家庭房', bed: '2张大床', guests: 4, area: 60, price: 2688, stock: 5 },
      // 万丽
      { hotel: 5, name: '标准大床房', bed: '1张大床', guests: 2, area: 35, price: 688, stock: 20 },
      { hotel: 5, name: '海景双床房', bed: '2张单人床', guests: 2, area: 38, price: 788, stock: 15 },
    ]

    for (const rt of roomTypesData) {
      await client.query(
        `INSERT INTO room_types (hotel_id, name, bed_type, max_guests, area_sqm, default_price, stock)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [hotelIds[rt.hotel], rt.name, rt.bed, rt.guests, rt.area, rt.price, rt.stock]
      )
    }
    console.log(`插入 ${roomTypesData.length} 个房型`)

    await client.query('COMMIT')
    console.log('种子数据插入完成！')
    console.log('\n测试账号（密码均为 123456）:')
    console.log('  管理员:   admin')
    console.log('  商户:     merchant / merchant2')
    console.log('  旅客:     guest')
    console.log('  开发者:   dev')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('种子数据插入失败:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
