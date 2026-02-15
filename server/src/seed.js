require('dotenv').config()
const bcrypt = require('bcryptjs')
const pool = require('./config/db')

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 更新 role 约束
    console.log('更新 role 约束...')
    await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check
        CHECK (role IN ('guest', 'hotel_admin', 'system_admin', 'staff', 'developer'));
    `)

    // 补建 order_items 表（如不存在）
    console.log('检查并创建缺失表...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id              BIGSERIAL PRIMARY KEY,
        order_id        BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        room_type_id    BIGINT NOT NULL REFERENCES room_types(id),
        room_id         BIGINT REFERENCES rooms(id),
        check_in_date   DATE NOT NULL,
        check_out_date  DATE NOT NULL,
        quantity        SMALLINT NOT NULL DEFAULT 1,
        price_per_night NUMERIC(10,2) NOT NULL,
        subtotal        NUMERIC(12,2) GENERATED ALWAYS AS (quantity * price_per_night * (check_out_date - check_in_date)) STORED,
        guest_names     TEXT[],
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    console.log('清理旧数据...')
    await client.query('DELETE FROM reviews')
    await client.query('DELETE FROM order_items')
    await client.query('DELETE FROM room_inventory')
    await client.query('DELETE FROM orders')
    await client.query('DELETE FROM room_type_prices')
    await client.query('DELETE FROM rooms')
    await client.query('DELETE FROM room_types')
    await client.query('DELETE FROM hotels')
    await client.query('DELETE FROM users')

    // ==================== 用户 ====================
    console.log('插入用户...')
    const hash = await bcrypt.hash('123456', 10)

    const users = await client.query(
      `INSERT INTO users (username, email, password_hash, role, full_name, phone) VALUES
        ('admin',     'admin@hotel.com',     $1, 'system_admin', '系统管理员',   '13800000001'),
        ('merchant',  'merchant@hotel.com',  $1, 'hotel_admin',  '商户张三',     '13800000002'),
        ('merchant2', 'merchant2@hotel.com', $1, 'hotel_admin',  '商户王五',     '13800000003'),
        ('guest',     'guest@hotel.com',     $1, 'guest',        '旅客李四',     '13800000004'),
        ('guest2',    'guest2@hotel.com',    $1, 'guest',        '旅客赵六',     '13800000005'),
        ('guest3',    'guest3@hotel.com',    $1, 'guest',        '旅客孙七',     '13800000006'),
        ('guest4',    'guest4@hotel.com',    $1, 'guest',        '旅客周八',     '13800000007'),
        ('guest5',    'guest5@hotel.com',    $1, 'guest',        '旅客吴九',     '13800000008'),
        ('staff1',    'staff1@hotel.com',    $1, 'staff',        '前台小刘',     '13800000009'),
        ('dev',       'dev@hotel.com',       $1, 'developer',    '开发者',       '13800000010')
       RETURNING id, username, role`,
      [hash]
    )
    console.log('用户:', users.rows.map(u => `${u.username}(${u.role})`).join(', '))

    const uid = (name) => users.rows.find(u => u.username === name).id
    const merchantId = uid('merchant')
    const merchant2Id = uid('merchant2')

    // ==================== 酒店 ====================
    console.log('插入酒店...')
    const hotelsData = [
      // ---- 上海 (5) ----
      { name: '上海外滩华尔道夫酒店', name_en: 'Waldorf Astoria Shanghai on the Bund', star: 5,
        address: '上海市黄浦区中山东一路2号', city: '上海', province: '上海',
        lat: 31.2397, lng: 121.4900,
        desc: '坐落于外滩的传奇酒店，尽享浦江两岸壮丽景色。电话: 021-63229988',
        facilities: ['免费WiFi','停车场','游泳池','健身房','SPA','餐厅','会议室'],
        images: [{url:'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',desc:'外观',is_main:true},{url:'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',desc:'大堂',is_main:false}],
        status: 'approved', owner: merchantId },
      { name: '上海浦东丽思卡尔顿酒店', name_en: 'The Ritz-Carlton Shanghai Pudong', star: 5,
        address: '上海市浦东新区世纪大道8号', city: '上海', province: '上海',
        lat: 31.2352, lng: 121.5010,
        desc: '位于陆家嘴金融中心，俯瞰浦江天际线。电话: 021-20201888',
        facilities: ['免费WiFi','停车场','游泳池','健身房','米其林餐厅','SPA'],
        images: [{url:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      { name: '上海如家快捷酒店(人民广场店)', name_en: 'Home Inn Shanghai Peoples Square', star: 3,
        address: '上海市黄浦区福州路88号', city: '上海', province: '上海',
        lat: 31.2330, lng: 121.4760,
        desc: '地铁直达，交通便利，经济实惠之选。电话: 021-63514567',
        facilities: ['免费WiFi','24小时前台','行李寄存'],
        images: [{url:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      { name: '上海锦江之星(南京路店)', name_en: 'Jinjiang Inn Shanghai Nanjing Road', star: 3,
        address: '上海市黄浦区南京东路650号', city: '上海', province: '上海',
        lat: 31.2342, lng: 121.4798,
        desc: '南京路步行街旁，购物出行两不误。电话: 021-63218888',
        facilities: ['免费WiFi','免费早餐','停车场'],
        images: [{url:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      { name: '上海维也纳酒店(虹桥机场店)', name_en: 'Vienna Hotel Shanghai Hongqiao Airport', star: 4,
        address: '上海市闵行区虹桥路2588号', city: '上海', province: '上海',
        lat: 31.1886, lng: 121.3957,
        desc: '紧邻虹桥枢纽，商旅出行首选。电话: 021-64681234',
        facilities: ['免费WiFi','机场接送','健身房','餐厅'],
        images: [{url:'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      // ---- 北京 (3) ----
      { name: '北京王府井希尔顿酒店', name_en: 'Hilton Beijing Wangfujing', star: 5,
        address: '北京市东城区王府井大街8号', city: '北京', province: '北京',
        lat: 39.9139, lng: 116.4074,
        desc: '毗邻故宫与天安门广场，尽享皇城风韵。电话: 010-58128888',
        facilities: ['免费WiFi','停车场','游泳池','健身房','餐厅'],
        images: [{url:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      { name: '北京如家酒店(天安门店)', name_en: 'Home Inn Beijing Tiananmen', star: 3,
        address: '北京市东城区前门大街20号', city: '北京', province: '北京',
        lat: 39.8998, lng: 116.3974,
        desc: '前门大街核心位置，步行可达天安门。电话: 010-67024567',
        facilities: ['免费WiFi','24小时前台'],
        images: [{url:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      { name: '北京国贸大酒店', name_en: 'China World Hotel Beijing', star: 5,
        address: '北京市朝阳区建国门外大街1号', city: '北京', province: '北京',
        lat: 39.9088, lng: 116.4582,
        desc: 'CBD核心地标，顶级商务体验。电话: 010-65052266',
        facilities: ['免费WiFi','停车场','健身房','游泳池','SPA','米其林餐厅'],
        images: [{url:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      // ---- 杭州 (3) ----
      { name: '杭州西湖凯悦酒店', name_en: 'Hyatt Regency Hangzhou', star: 5,
        address: '浙江省杭州市上城区湖滨路28号', city: '杭州', province: '浙江',
        lat: 30.2489, lng: 120.1363,
        desc: '西湖湖畔，推窗即景，尽享湖光山色。电话: 0571-87791234',
        facilities: ['免费WiFi','停车场','游泳池','健身房','茶室','SPA'],
        images: [{url:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      { name: '杭州维也纳酒店(武林广场店)', name_en: 'Vienna Hotel Hangzhou Wulin Square', star: 4,
        address: '浙江省杭州市下城区武林路168号', city: '杭州', province: '浙江',
        lat: 30.2785, lng: 120.1632,
        desc: '武林商圈核心，出行购物皆便利。电话: 0571-87065432',
        facilities: ['免费WiFi','免费早餐','健身房'],
        images: [{url:'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      { name: '杭州如家酒店(西湖店)', name_en: 'Home Inn Hangzhou West Lake', star: 3,
        address: '浙江省杭州市西湖区学士路28号', city: '杭州', province: '浙江',
        lat: 30.2567, lng: 120.1398,
        desc: '近西湖景区，性价比之选。电话: 0571-87013456',
        facilities: ['免费WiFi','24小时前台'],
        images: [{url:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      // ---- 成都 (3) ----
      { name: '成都太古里万豪酒店', name_en: 'Chengdu Marriott Hotel', star: 4,
        address: '四川省成都市锦江区中纱帽街8号', city: '成都', province: '四川',
        lat: 30.6598, lng: 104.0633,
        desc: '太古里商圈，感受成都慢生活。电话: 028-86538888',
        facilities: ['免费WiFi','停车场','健身房','餐厅'],
        images: [{url:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      { name: '成都宽窄巷子亚朵酒店', name_en: 'Atour Hotel Chengdu Kuanzhai Alley', star: 4,
        address: '四川省成都市青羊区长顺上街127号', city: '成都', province: '四川',
        lat: 30.6712, lng: 104.0485,
        desc: '宽窄巷子旁的人文酒店，书香与茶香交融。电话: 028-86249999',
        facilities: ['免费WiFi','免费早餐','健身房','图书馆'],
        images: [{url:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      { name: '成都如家酒店(春熙路店)', name_en: 'Home Inn Chengdu Chunxi Road', star: 3,
        address: '四川省成都市锦江区总府路15号', city: '成都', province: '四川',
        lat: 30.6625, lng: 104.0789,
        desc: '春熙路商圈，吃喝玩乐一站搞定。电话: 028-86752345',
        facilities: ['免费WiFi','24小时前台'],
        images: [{url:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      // ---- 广州 (3) ----
      { name: '广州珠江新城柏悦酒店', name_en: 'Park Hyatt Guangzhou', star: 5,
        address: '广州市天河区珠江东路12号', city: '广州', province: '广东',
        lat: 23.1200, lng: 113.3240,
        desc: '珠江新城地标，俯瞰广州塔与花城广场。电话: 020-38966888',
        facilities: ['免费WiFi','停车场','无边泳池','健身房','米其林餐厅','SPA'],
        images: [{url:'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      { name: '广州维也纳酒店(天河路店)', name_en: 'Vienna Hotel Guangzhou Tianhe Road', star: 4,
        address: '广州市天河区天河路228号', city: '广州', province: '广东',
        lat: 23.1367, lng: 113.3251,
        desc: '天河商圈，购物天堂。电话: 020-38745678',
        facilities: ['免费WiFi','免费早餐','健身房'],
        images: [{url:'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      { name: '广州如家酒店(北京路步行街店)', name_en: 'Home Inn Guangzhou Beijing Road', star: 3,
        address: '广州市越秀区北京路168号', city: '广州', province: '广东',
        lat: 23.1291, lng: 113.2644,
        desc: '千年商道北京路，老广州风情。电话: 020-83334567',
        facilities: ['免费WiFi','24小时前台'],
        images: [{url:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      // ---- 深圳 (3) ----
      { name: '深圳四季酒店', name_en: 'Four Seasons Hotel Shenzhen', star: 5,
        address: '深圳市福田区福华三路138号', city: '深圳', province: '广东',
        lat: 22.5329, lng: 114.0579,
        desc: '福田CBD核心，顶级奢华体验。电话: 0755-82226666',
        facilities: ['免费WiFi','停车场','游泳池','健身房','SPA','米其林餐厅'],
        images: [{url:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      { name: '深圳维也纳酒店(科技园店)', name_en: 'Vienna Hotel Shenzhen Hi-Tech Park', star: 4,
        address: '深圳市南山区科技园南区科苑路15号', city: '深圳', province: '广东',
        lat: 22.5385, lng: 113.9531,
        desc: '科技园核心区域，商务出差首选。电话: 0755-26551234',
        facilities: ['免费WiFi','免费早餐','健身房','会议室'],
        images: [{url:'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      { name: '深圳如家酒店(罗湖口岸店)', name_en: 'Home Inn Shenzhen Luohu Port', star: 3,
        address: '深圳市罗湖区建设路1088号', city: '深圳', province: '广东',
        lat: 22.5368, lng: 114.1189,
        desc: '罗湖口岸旁，过关购物超方便。电话: 0755-82331234',
        facilities: ['免费WiFi','24小时前台','行李寄存'],
        images: [{url:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      // ---- 南京 ----
      { name: '南京金陵饭店', name_en: 'Jinling Hotel Nanjing', star: 5,
        address: '江苏省南京市鼓楼区汉中路2号', city: '南京', province: '江苏',
        lat: 32.0465, lng: 118.7780,
        desc: '中国首家由国人自行管理的五星级酒店，南京地标。电话: 025-84711888',
        facilities: ['免费WiFi','停车场','健身房','餐厅'],
        images: [{url:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      // ---- 苏州 ----
      { name: '苏州金鸡湖凯宾斯基大酒店', name_en: 'Kempinski Hotel Suzhou', star: 5,
        address: '江苏省苏州市工业园区湖东路288号', city: '苏州', province: '江苏',
        lat: 31.3157, lng: 120.6891,
        desc: '金鸡湖畔，尽享园林城市的现代与古典。电话: 0512-62888888',
        facilities: ['免费WiFi','停车场','游泳池','健身房','SPA'],
        images: [{url:'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      // ---- 西安 ----
      { name: '西安威斯汀大酒店', name_en: 'The Westin Xian', star: 5,
        address: '陕西省西安市雁塔区雁塔路66号', city: '西安', province: '陕西',
        lat: 34.2228, lng: 108.9531,
        desc: '大雁塔旁，千年古都的现代奢华。电话: 029-87686688',
        facilities: ['免费WiFi','停车场','健身房','餐厅','会议室'],
        images: [{url:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      // ---- 厦门 ----
      { name: '厦门海悦山庄酒店', name_en: 'Xiamen Seaview Resort', star: 5,
        address: '福建省厦门市思明区环岛南路2688号', city: '厦门', province: '福建',
        lat: 24.4426, lng: 118.0936,
        desc: '环岛路海滨度假胜地，私人沙滩与无敌海景。电话: 0592-2099888',
        facilities: ['免费WiFi','停车场','私人沙滩','游泳池','健身房','SPA'],
        images: [{url:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchantId },
      // ---- 武汉 ----
      { name: '武汉万达瑞华酒店', name_en: 'Wanda Reign Wuhan', star: 5,
        address: '湖北省武汉市武昌区临江大道96号', city: '武汉', province: '湖北',
        lat: 30.5561, lng: 114.2937,
        desc: '长江之畔，黄鹤楼下，江城顶级奢华体验。电话: 027-82605888',
        facilities: ['免费WiFi','停车场','健身房','游泳池','餐厅'],
        images: [{url:'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',desc:'外观',is_main:true}],
        status: 'approved', owner: merchant2Id },
      // ---- 待审核酒店 ----
      { name: '深圳湾万丽酒店', name_en: 'Renaissance Shenzhen Bay', star: 4,
        address: '深圳市南山区后海滨路3398号', city: '深圳', province: '广东',
        lat: 22.5170, lng: 113.9380,
        desc: '深圳湾畔的商务酒店，俯瞰深圳湾大桥。电话: 0755-86608888',
        facilities: ['免费WiFi','停车场','健身房','餐厅','会议室'],
        images: [{url:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',desc:'外观',is_main:true}],
        status: 'pending', owner: merchant2Id },
    ]

    const hotelIds = []
    for (const h of hotelsData) {
      const r = await client.query(
        `INSERT INTO hotels (name, name_en, star_rating, address, city, province,
          latitude, longitude, description, facilities, images, status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
        [h.name, h.name_en, h.star, h.address, h.city, h.province,
         h.lat, h.lng, h.desc, JSON.stringify(h.facilities), JSON.stringify(h.images),
         h.status, h.owner]
      )
      hotelIds.push(r.rows[0].id)
    }
    console.log(`插入 ${hotelIds.length} 家酒店`)

    // ==================== 房型 ====================
    console.log('插入房型...')
    const roomTypesData = [
      // 0-华尔道夫
      { h: 0, name: '豪华大床房', name_en: 'Deluxe King', bed: '1张特大床', guests: 2, area: 45, price: 1688, stock: 5 },
      { h: 0, name: '外滩江景套房', name_en: 'Bund River Suite', bed: '1张特大床', guests: 2, area: 72, price: 3688, stock: 3 },
      // 1-丽思卡尔顿
      { h: 1, name: '豪华客房', name_en: 'Deluxe Room', bed: '1张特大床', guests: 2, area: 50, price: 2088, stock: 8 },
      { h: 1, name: '行政套房', name_en: 'Executive Suite', bed: '1张特大床', guests: 3, area: 85, price: 3888, stock: 3 },
      // 2-如家人民广场
      { h: 2, name: '标准大床房', name_en: 'Standard King', bed: '1张大床', guests: 2, area: 18, price: 259, stock: 10 },
      { h: 2, name: '标准双床房', name_en: 'Standard Twin', bed: '2张单人床', guests: 2, area: 20, price: 279, stock: 8 },
      // 3-锦江之星
      { h: 3, name: '商务大床房', name_en: 'Business King', bed: '1张大床', guests: 2, area: 20, price: 299, stock: 12 },
      { h: 3, name: '商务双床房', name_en: 'Business Twin', bed: '2张单人床', guests: 2, area: 22, price: 319, stock: 10 },
      // 4-维也纳虹桥
      { h: 4, name: '高级大床房', name_en: 'Superior King', bed: '1张大床', guests: 2, area: 28, price: 458, stock: 6 },
      { h: 4, name: '商务双床房', name_en: 'Business Twin', bed: '2张单人床', guests: 2, area: 30, price: 498, stock: 5 },
      // 5-希尔顿王府井
      { h: 5, name: '高级大床房', name_en: 'Superior King', bed: '1张大床', guests: 2, area: 35, price: 988, stock: 8 },
      { h: 5, name: '行政套房', name_en: 'Executive Suite', bed: '1张特大床', guests: 3, area: 65, price: 2288, stock: 4 },
      // 6-如家天安门
      { h: 6, name: '标准大床房', name_en: 'Standard King', bed: '1张大床', guests: 2, area: 18, price: 279, stock: 15 },
      { h: 6, name: '标准双床房', name_en: 'Standard Twin', bed: '2张单人床', guests: 2, area: 20, price: 299, stock: 12 },
      // 7-国贸大酒店
      { h: 7, name: '豪华客房', name_en: 'Deluxe Room', bed: '1张特大床', guests: 2, area: 42, price: 1588, stock: 5 },
      { h: 7, name: '总统套房', name_en: 'Presidential Suite', bed: '1张特大床', guests: 4, area: 120, price: 5888, stock: 2 },
      // 8-凯悦杭州
      { h: 8, name: '湖景大床房', name_en: 'Lake View King', bed: '1张大床', guests: 2, area: 38, price: 1288, stock: 6 },
      { h: 8, name: '湖景套房', name_en: 'Lake View Suite', bed: '1张特大床', guests: 2, area: 68, price: 2888, stock: 3 },
      // 9-维也纳武林
      { h: 9, name: '商务大床房', name_en: 'Business King', bed: '1张大床', guests: 2, area: 26, price: 399, stock: 8 },
      { h: 9, name: '商务双床房', name_en: 'Business Twin', bed: '2张单人床', guests: 2, area: 28, price: 429, stock: 6 },
      // 10-如家西湖
      { h: 10, name: '标准大床房', name_en: 'Standard King', bed: '1张大床', guests: 2, area: 20, price: 269, stock: 12 },
      { h: 10, name: '标准双床房', name_en: 'Standard Twin', bed: '2张单人床', guests: 2, area: 22, price: 289, stock: 10 },
      // 11-万豪成都
      { h: 11, name: '高级客房', name_en: 'Superior Room', bed: '1张大床', guests: 2, area: 32, price: 688, stock: 10 },
      { h: 11, name: '豪华套房', name_en: 'Deluxe Suite', bed: '1张特大床', guests: 3, area: 58, price: 1388, stock: 4 },
      // 12-亚朵宽窄
      { h: 12, name: '雅致大床房', name_en: 'Elegant King', bed: '1张大床', guests: 2, area: 28, price: 488, stock: 7 },
      { h: 12, name: '雅致双床房', name_en: 'Elegant Twin', bed: '2张单人床', guests: 2, area: 30, price: 528, stock: 5 },
      // 13-如家春熙路
      { h: 13, name: '标准大床房', name_en: 'Standard King', bed: '1张大床', guests: 2, area: 18, price: 249, stock: 14 },
      { h: 13, name: '标准双床房', name_en: 'Standard Twin', bed: '2张单人床', guests: 2, area: 20, price: 269, stock: 10 },
      // 14-柏悦广州
      { h: 14, name: '柏悦大床房', name_en: 'Park King', bed: '1张特大床', guests: 2, area: 55, price: 1988, stock: 4 },
      { h: 14, name: '柏悦套房', name_en: 'Park Suite', bed: '1张特大床', guests: 3, area: 88, price: 3888, stock: 2 },
      // 15-维也纳天河
      { h: 15, name: '商务大床房', name_en: 'Business King', bed: '1张大床', guests: 2, area: 28, price: 428, stock: 9 },
      { h: 15, name: '商务双床房', name_en: 'Business Twin', bed: '2张单人床', guests: 2, area: 30, price: 468, stock: 7 },
      // 16-如家北京路
      { h: 16, name: '标准大床房', name_en: 'Standard King', bed: '1张大床', guests: 2, area: 20, price: 289, stock: 11 },
      { h: 16, name: '标准双床房', name_en: 'Standard Twin', bed: '2张单人床', guests: 2, area: 22, price: 309, stock: 8 },
      // 17-四季深圳
      { h: 17, name: '豪华客房', name_en: 'Deluxe Room', bed: '1张特大床', guests: 2, area: 48, price: 1688, stock: 6 },
      { h: 17, name: '四季套房', name_en: 'Four Seasons Suite', bed: '1张特大床', guests: 3, area: 95, price: 4288, stock: 2 },
      // 18-维也纳科技园
      { h: 18, name: '高级大床房', name_en: 'Superior King', bed: '1张大床', guests: 2, area: 30, price: 468, stock: 8 },
      { h: 18, name: '高级双床房', name_en: 'Superior Twin', bed: '2张单人床', guests: 2, area: 32, price: 498, stock: 6 },
      // 19-如家罗湖
      { h: 19, name: '标准大床房', name_en: 'Standard King', bed: '1张大床', guests: 2, area: 18, price: 269, stock: 13 },
      { h: 19, name: '标准双床房', name_en: 'Standard Twin', bed: '2张单人床', guests: 2, area: 20, price: 289, stock: 10 },
      // 20-金陵饭店
      { h: 20, name: '豪华客房', name_en: 'Deluxe Room', bed: '1张大床', guests: 2, area: 38, price: 888, stock: 8 },
      { h: 20, name: '行政套房', name_en: 'Executive Suite', bed: '1张特大床', guests: 3, area: 70, price: 1888, stock: 3 },
      // 21-凯宾斯基
      { h: 21, name: '湖景大床房', name_en: 'Lake View King', bed: '1张特大床', guests: 2, area: 45, price: 1188, stock: 6 },
      { h: 21, name: '湖景套房', name_en: 'Lake View Suite', bed: '1张特大床', guests: 3, area: 78, price: 2688, stock: 3 },
      // 22-威斯汀西安
      { h: 22, name: '豪华客房', name_en: 'Deluxe Room', bed: '1张大床', guests: 2, area: 42, price: 788, stock: 10 },
      { h: 22, name: '行政套房', name_en: 'Executive Suite', bed: '1张特大床', guests: 3, area: 68, price: 1688, stock: 4 },
      // 23-海悦厦门
      { h: 23, name: '海景大床房', name_en: 'Sea View King', bed: '1张大床', guests: 2, area: 42, price: 1288, stock: 6 },
      { h: 23, name: '海景套房', name_en: 'Sea View Suite', bed: '1张特大床+客厅', guests: 3, area: 68, price: 1888, stock: 4 },
      // 24-万达武汉
      { h: 24, name: '行政大床房', name_en: 'Executive King', bed: '1张特大床', guests: 2, area: 48, price: 988, stock: 7 },
      { h: 24, name: '江景套房', name_en: 'River View Suite', bed: '1张特大床', guests: 3, area: 75, price: 2188, stock: 3 },
      // 25-万丽深圳湾(pending)
      { h: 25, name: '标准大床房', name_en: 'Standard King', bed: '1张大床', guests: 2, area: 35, price: 688, stock: 20 },
      { h: 25, name: '海景双床房', name_en: 'Sea View Twin', bed: '2张单人床', guests: 2, area: 38, price: 788, stock: 15 },
    ]

    const roomTypeIds = []
    for (const rt of roomTypesData) {
      const r = await client.query(
        `INSERT INTO room_types (hotel_id, name, name_en, bed_type, max_guests, area_sqm, default_price, stock)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [hotelIds[rt.h], rt.name, rt.name_en, rt.bed, rt.guests, rt.area, rt.price, rt.stock]
      )
      roomTypeIds.push({ id: r.rows[0].id, stock: rt.stock, hotelIdx: rt.h })
    }
    console.log(`插入 ${roomTypeIds.length} 个房型`)

    // ==================== 订单 ====================
    console.log('插入订单...')
    const guestId = uid('guest')
    const guest2Id = uid('guest2')
    const guest3Id = uid('guest3')
    const guest4Id = uid('guest4')
    const guest5Id = uid('guest5')

    // 辅助: 获取房型id (roomTypesData 索引)
    const rtId = (idx) => roomTypeIds[idx].id
    // 辅助: 获取酒店id (hotelsData 索引)
    const hId = (idx) => hotelIds[idx]

    let orderSeq = 1
    const genOrderNo = (dateStr) => {
      const d = dateStr.replace(/-/g, '')
      return `ORD${d}${String(orderSeq++).padStart(4, '0')}`
    }

    const ordersData = [
      // guest - 已退房(华尔道夫豪华大床房)
      { user: guestId, hotel: hId(0), rt: rtId(0), ci: '2025-12-20', co: '2025-12-22', nights: 2, rooms: 1,
        price: 3376, status: 'completed', contact: '李四', phone: '13800000004', cancel: null },
      // guest - 已支付(凯悦杭州湖景大床房)
      { user: guestId, hotel: hId(8), rt: rtId(16), ci: '2026-03-15', co: '2026-03-17', nights: 2, rooms: 1,
        price: 2576, status: 'paid', contact: '李四', phone: '13800000004', cancel: null },
      // guest - 待支付(四季深圳豪华客房)
      { user: guestId, hotel: hId(17), rt: rtId(34), ci: '2026-04-01', co: '2026-04-03', nights: 2, rooms: 1,
        price: 3376, status: 'pending', contact: '李四', phone: '13800000004', cancel: null },
      // guest - 已取消(如家人民广场)
      { user: guestId, hotel: hId(2), rt: rtId(4), ci: '2026-01-10', co: '2026-01-12', nights: 2, rooms: 1,
        price: 518, status: 'cancelled', contact: '李四', phone: '13800000004', cancel: '行程临时取消' },
      // guest2 - 已退房(希尔顿王府井)
      { user: guest2Id, hotel: hId(5), rt: rtId(10), ci: '2025-11-05', co: '2025-11-08', nights: 3, rooms: 1,
        price: 2964, status: 'completed', contact: '赵六', phone: '13800000005', cancel: null },
      // guest2 - 已退房(万豪成都)
      { user: guest2Id, hotel: hId(11), rt: rtId(22), ci: '2025-12-25', co: '2025-12-28', nights: 3, rooms: 1,
        price: 2064, status: 'completed', contact: '赵六', phone: '13800000005', cancel: null },
      // guest2 - 已支付(海悦厦门)
      { user: guest2Id, hotel: hId(23), rt: rtId(47), ci: '2026-05-01', co: '2026-05-04', nights: 3, rooms: 1,
        price: 5664, status: 'paid', contact: '赵六', phone: '13800000005', cancel: null },
      // guest3 - 已退房(柏悦广州)
      { user: guest3Id, hotel: hId(14), rt: rtId(28), ci: '2025-10-01', co: '2025-10-03', nights: 2, rooms: 1,
        price: 3976, status: 'completed', contact: '孙七', phone: '13800000006', cancel: null },
      // guest3 - 已入住(金陵饭店)
      { user: guest3Id, hotel: hId(20), rt: rtId(40), ci: '2026-02-12', co: '2026-02-14', nights: 2, rooms: 1,
        price: 1776, status: 'checked_in', contact: '孙七', phone: '13800000006', cancel: null },
      // guest3 - 已取消(万达武汉)
      { user: guest3Id, hotel: hId(24), rt: rtId(48), ci: '2026-03-01', co: '2026-03-03', nights: 2, rooms: 1,
        price: 1976, status: 'cancelled', contact: '孙七', phone: '13800000006', cancel: '房间维修中，无法接待' },
      // guest4 - 已退房(威斯汀西安)
      { user: guest4Id, hotel: hId(22), rt: rtId(44), ci: '2025-09-15', co: '2025-09-18', nights: 3, rooms: 1,
        price: 2364, status: 'completed', contact: '周八', phone: '13800000007', cancel: null },
      // guest4 - 已确认(凯宾斯基苏州)
      { user: guest4Id, hotel: hId(21), rt: rtId(42), ci: '2026-04-10', co: '2026-04-12', nights: 2, rooms: 1,
        price: 2376, status: 'paid', contact: '周八', phone: '13800000007', cancel: null },
      // guest5 - 已退房(亚朵宽窄)
      { user: guest5Id, hotel: hId(12), rt: rtId(24), ci: '2025-08-10', co: '2025-08-12', nights: 2, rooms: 1,
        price: 976, status: 'completed', contact: '吴九', phone: '13800000008', cancel: null },
      // guest5 - 已退房(如家天安门)
      { user: guest5Id, hotel: hId(6), rt: rtId(12), ci: '2025-07-20', co: '2025-07-22', nights: 2, rooms: 1,
        price: 558, status: 'completed', contact: '吴九', phone: '13800000008', cancel: null },
    ]

    const orderIds = []
    for (const o of ordersData) {
      const r = await client.query(
        `INSERT INTO orders (order_no, user_id, hotel_id, room_type_id, check_in, check_out,
          nights, room_count, total_price, contact_name, contact_phone, status, cancel_reason)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
        [genOrderNo(o.ci), o.user, o.hotel, o.rt, o.ci, o.co,
         o.nights, o.rooms, o.price, o.contact, o.phone, o.status, o.cancel]
      )
      orderIds.push(r.rows[0].id)
    }
    console.log(`插入 ${orderIds.length} 个订单`)

    // ==================== 评价 ====================
    console.log('插入评价...')
    const reviewsData = [
      // 订单0: guest@华尔道夫 - 5星
      { order: 0, user: guestId, hotel: hId(0), rating: 5,
        content: '外滩景色绝美，服务一流，房间宽敞舒适，下次还来！',
        reply: '感谢您的好评，期待您再次光临华尔道夫！', replyAt: '2025-12-24 10:00:00' },
      // 订单4: guest2@希尔顿 - 4星
      { order: 4, user: guest2Id, hotel: hId(5), rating: 4,
        content: '位置很好，离故宫很近，早餐丰富。隔音稍差扣一星。',
        reply: '感谢您的反馈，我们会改进隔音设施。', replyAt: '2025-11-12 09:00:00' },
      // 订单5: guest2@万豪成都 - 5星
      { order: 5, user: guest2Id, hotel: hId(11), rating: 5,
        content: '太古里就在楼下，逛街吃饭超方便，房间设计感很强。',
        reply: null, replyAt: null },
      // 订单7: guest3@柏悦广州 - 5星
      { order: 7, user: guest3Id, hotel: hId(14), rating: 5,
        content: '无边泳池太赞了，广州塔夜景尽收眼底，米其林早餐惊艳。',
        reply: '感谢您的认可，欢迎下次体验我们的SPA服务！', replyAt: '2025-10-08 14:00:00' },
      // 订单10: guest4@威斯汀西安 - 4星
      { order: 10, user: guest4Id, hotel: hId(22), rating: 4,
        content: '大雁塔就在旁边，夜景很美。酒店设施略显老旧但服务很好。',
        reply: '感谢您的宝贵意见，我们正在进行翻新升级。', replyAt: '2025-09-22 11:00:00' },
      // 订单12: guest5@亚朵宽窄 - 5星
      { order: 12, user: guest5Id, hotel: hId(12), rating: 5,
        content: '亚朵的服务一如既往地好，图书馆很有特色，宽窄巷子步行5分钟。',
        reply: null, replyAt: null },
      // 订单13: guest5@如家天安门 - 3星
      { order: 13, user: guest5Id, hotel: hId(6), rating: 3,
        content: '位置不错，价格实惠，但房间偏小，设施比较旧。',
        reply: '感谢您的入住，我们会持续改善住宿体验。', replyAt: '2025-07-28 16:00:00' },
    ]

    for (const rv of reviewsData) {
      await client.query(
        `INSERT INTO reviews (order_id, user_id, hotel_id, rating, content, reply_content, reply_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [orderIds[rv.order], rv.user, rv.hotel, rv.rating, rv.content, rv.reply, rv.replyAt]
      )
    }
    console.log(`插入 ${reviewsData.length} 条评价`)

    await client.query('COMMIT')
    console.log('种子数据插入完成！')
    console.log('\n测试账号（密码均为 123456）:')
    console.log('  管理员:   admin')
    console.log('  商户:     merchant / merchant2')
    console.log('  旅客:     guest / guest2 / guest3 / guest4 / guest5')
    console.log('  前台:     staff1')
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
