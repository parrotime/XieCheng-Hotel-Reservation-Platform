// 酒店Mock数据 - 扩充版
export const hotelsData = [
  {
    id: 1,
    name: "上海外滩华尔道夫酒店",
    nameEn: "Waldorf Astoria Shanghai on the Bund",
    address: "上海市黄浦区中山东一路2号",
    star: 5,
    rating: 4.8,
    reviewCount: 2580,
    openDate: "2011-05-08",
    phone: "021-63229988",
    location: {
      lat: 31.2397,
      lng: 121.4900,
      district: "黄浦区",
      subway: "地铁2号线/10号线南京东路站",
      nearbyAttractions: ["外滩", "南京路步行街", "豫园"]
    },
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
    ],
    rooms: [
      {
        id: 101,
        type: "豪华大床房",
        size: "40㎡",
        bedType: "1张特大床",
        maxGuests: 2,
        price: 1688,
        originalPrice: 2088,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 5
      },
      {
        id: 102,
        type: "行政双床房",
        size: "45㎡",
        bedType: "2张单人床",
        maxGuests: 2,
        price: 1888,
        originalPrice: 2388,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 3
      }
    ],
    facilities: ["免费WiFi", "停车场", "游泳池", "健身房", "餐厅", "会议室", "SPA"],
    tags: ["豪华", "外滩", "江景", "历史建筑"],
    promotion: {
      type: "春节特惠",
      discount: 0.8,
      description: "春节特惠，全场8折"
    },
    status: "approved"
  },
  
  {
    id: 2,
    name: "上海浦东丽思卡尔顿酒店",
    nameEn: "The Ritz-Carlton Shanghai, Pudong",
    address: "上海市浦东新区世纪大道8号",
    star: 5,
    rating: 4.9,
    reviewCount: 3210,
    openDate: "2010-03-20",
    phone: "021-20201888",
    location: {
      lat: 31.2352,
      lng: 121.5010,
      district: "浦东新区",
      subway: "地铁2号线陆家嘴站",
      nearbyAttractions: ["东方明珠", "上海中心", "环球金融中心"]
    },
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"
    ],
    rooms: [
      {
        id: 201,
        type: "豪华客房",
        size: "50㎡",
        bedType: "1张特大床",
        maxGuests: 2,
        price: 2088,
        originalPrice: 2588,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 8
      }
    ],
    facilities: ["免费WiFi", "停车场", "游泳池", "健身房", "米其林餐厅", "SPA"],
    tags: ["奢华", "陆家嘴", "高层景观"],
    promotion: null,
    status: "approved"
  },

  {
    id: 3,
    name: "上海如家快捷酒店(人民广场店)",
    nameEn: "Home Inn Shanghai People's Square",
    address: "上海市黄浦区福州路88号",
    star: 3,
    rating: 4.2,
    reviewCount: 1580,
    openDate: "2008-06-15",
    phone: "021-63514567",
    location: {
      lat: 31.2330,
      lng: 121.4760,
      district: "黄浦区",
      subway: "地铁1号线/2号线/8号线人民广场站",
      nearbyAttractions: ["人民广场", "南京路", "外滩"]
    },
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
    ],
    rooms: [
      {
        id: 301,
        type: "标准大床房",
        size: "18㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 259,
        originalPrice: 299,
        breakfast: false,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 10
      }
    ],
    facilities: ["免费WiFi", "24小时前台", "行李寄存"],
    tags: ["如家", "经济实惠", "地铁沿线"],
    promotion: {
      type: "会员优惠",
      discount: 0.9,
      description: "会员享9折"
    },
    status: "approved"
  },

  {
    id: 4,
    name: "上海锦江之星(南京路店)",
    nameEn: "Jinjiang Inn Shanghai Nanjing Road",
    address: "上海市黄浦区南京东路650号",
    star: 3,
    rating: 4.1,
    reviewCount: 1234,
    openDate: "2009-08-10",
    phone: "021-63218888",
    location: {
      lat: 31.2342,
      lng: 121.4798,
      district: "黄浦区",
      subway: "地铁2号线南京东路站",
      nearbyAttractions: ["南京路步行街", "外滩", "人民广场"]
    },
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"
    ],
    rooms: [
      {
        id: 401,
        type: "商务大床房",
        size: "20㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 299,
        originalPrice: 359,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 12
      }
    ],
    facilities: ["免费WiFi", "免费早餐", "停车场"],
    tags: ["经济型", "商务", "免费早餐"],
    promotion: null,
    status: "approved"
  },

  {
    id: 5,
    name: "上海维也纳酒店(虹桥机场店)",
    nameEn: "Vienna Hotel Shanghai Hongqiao Airport",
    address: "上海市闵行区虹桥路2588号",
    star: 4,
    rating: 4.5,
    reviewCount: 2100,
    openDate: "2016-05-20",
    phone: "021-64681234",
    location: {
      lat: 31.1886,
      lng: 121.3957,
      district: "闵行区",
      subway: "地铁10号线虹桥火车站",
      nearbyAttractions: ["虹桥机场", "虹桥火车站", "国家会展中心"]
    },
    images: [
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800"
    ],
    rooms: [
      {
        id: 501,
        type: "高级大床房",
        size: "28㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 458,
        originalPrice: 558,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 6
      }
    ],
    facilities: ["免费WiFi", "机场接送", "健身房", "餐厅"],
    tags: ["商务", "机场附近", "免费早餐"],
    promotion: null,
    status: "approved"
  },

  // 北京酒店
  {
    id: 6,
    name: "北京王府井希尔顿酒店",
    nameEn: "Hilton Beijing Wangfujing",
    address: "北京市东城区王府井大街8号",
    star: 5,
    rating: 4.6,
    reviewCount: 1823,
    openDate: "2015-03-15",
    phone: "010-58128888",
    location: {
      lat: 39.9139,
      lng: 116.4074,
      district: "东城区",
      subway: "地铁1号线王府井站",
      nearbyAttractions: ["故宫", "天安门", "王府井步行街"]
    },
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"
    ],
    rooms: [
      {
        id: 601,
        type: "高级大床房",
        size: "35㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 988,
        originalPrice: 1288,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 8
      }
    ],
    facilities: ["免费WiFi", "停车场", "游泳池", "健身房", "餐厅"],
    tags: ["商务", "市中心", "地铁沿线"],
    promotion: null,
    status: "approved"
  },

  {
    id: 7,
    name: "北京如家酒店(天安门店)",
    nameEn: "Home Inn Beijing Tiananmen",
    address: "北京市东城区前门大街20号",
    star: 3,
    rating: 4.3,
    reviewCount: 2456,
    openDate: "2007-04-10",
    phone: "010-67024567",
    location: {
      lat: 39.8998,
      lng: 116.3974,
      district: "东城区",
      subway: "地铁2号线前门站",
      nearbyAttractions: ["天安门", "故宫", "前门大街"]
    },
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
    ],
    rooms: [
      {
        id: 701,
        type: "标准大床房",
        size: "18㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 279,
        originalPrice: 329,
        breakfast: false,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 15
      }
    ],
    facilities: ["免费WiFi", "24小时前台"],
    tags: ["如家", "经济型", "天安门附近"],
    promotion: {
      type: "早鸟优惠",
      discount: 0.85,
      description: "提前7天预订享85折"
    },
    status: "approved"
  },

  {
    id: 8,
    name: "北京国贸大酒店",
    nameEn: "China World Hotel Beijing",
    address: "北京市朝阳区建国门外大街1号",
    star: 5,
    rating: 4.7,
    reviewCount: 1987,
    openDate: "2010-09-01",
    phone: "010-65052266",
    location: {
      lat: 39.9088,
      lng: 116.4582,
      district: "朝阳区",
      subway: "地铁1号线/10号线国贸站",
      nearbyAttractions: ["国贸商城", "CBD", "央视大楼"]
    },
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
    ],
    rooms: [
      {
        id: 801,
        type: "豪华客房",
        size: "42㎡",
        bedType: "1张特大床",
        maxGuests: 2,
        price: 1588,
        originalPrice: 1988,
        breakfast: true,
        wifi: true,
        cancelPolicy: "入住前24小时免费取消",
        stock: 5
      }
    ],
    facilities: ["免费WiFi", "停车场", "健身房", "游泳池", "SPA", "米其林餐厅"],
    tags: ["豪华", "商务", "CBD"],
    promotion: null,
    status: "approved"
  },

  // 杭州酒店
  {
    id: 9,
    name: "杭州西湖凯悦酒店",
    nameEn: "Hyatt Regency Hangzhou",
    address: "浙江省杭州市上城区湖滨路28号",
    star: 5,
    rating: 4.7,
    reviewCount: 3156,
    openDate: "2008-06-20",
    phone: "0571-87791234",
    location: {
      lat: 30.2489,
      lng: 120.1363,
      district: "上城区",
      subway: "地铁1号线龙翔桥站",
      nearbyAttractions: ["西湖", "雷峰塔", "断桥"]
    },
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
    ],
    rooms: [
      {
        id: 901,
        type: "湖景大床房",
        size: "38㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 1288,
        originalPrice: 1588,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 6
      }
    ],
    facilities: ["免费WiFi", "停车场", "游泳池", "健身房", "茶室", "SPA"],
    tags: ["湖景", "度假", "风景优美"],
    promotion: {
      type: "连住优惠",
      discount: 0.85,
      description: "连住2晚及以上享85折"
    },
    status: "approved"
  },

  {
    id: 10,
    name: "杭州维也纳酒店(武林广场店)",
    nameEn: "Vienna Hotel Hangzhou Wulin Square",
    address: "浙江省杭州市下城区武林路168号",
    star: 4,
    rating: 4.4,
    reviewCount: 1678,
    openDate: "2014-07-15",
    phone: "0571-87065432",
    location: {
      lat: 30.2785,
      lng: 120.1632,
      district: "下城区",
      subway: "地铁1号线武林广场站",
      nearbyAttractions: ["武林广场", "西湖", "杭州大厦"]
    },
    images: [
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800"
    ],
    rooms: [
      {
        id: 1001,
        type: "商务大床房",
        size: "26㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 399,
        originalPrice: 499,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 8
      }
    ],
    facilities: ["免费WiFi", "免费早餐", "健身房"],
    tags: ["商务", "市中心", "免费早餐"],
    promotion: null,
    status: "approved"
  },

  {
    id: 11,
    name: "杭州如家酒店(西湖店)",
    nameEn: "Home Inn Hangzhou West Lake",
    address: "浙江省杭州市西湖区学士路28号",
    star: 3,
    rating: 4.2,
    reviewCount: 2134,
    openDate: "2009-03-10",
    phone: "0571-87013456",
    location: {
      lat: 30.2567,
      lng: 120.1398,
      district: "西湖区",
      subway: "地铁1号线凤起路站",
      nearbyAttractions: ["西湖", "岳庙", "苏堤"]
    },
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
    ],
    rooms: [
      {
        id: 1101,
        type: "标准大床房",
        size: "20㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 269,
        originalPrice: 319,
        breakfast: false,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 12
      }
    ],
    facilities: ["免费WiFi", "24小时前台"],
    tags: ["如家", "经济型", "西湖附近"],
    promotion: null,
    status: "approved"
  },

  // 成都酒店
  {
    id: 12,
    name: "成都太古里万豪酒店",
    nameEn: "Chengdu Marriott Hotel",
    address: "四川省成都市锦江区中纱帽街8号",
    star: 4,
    rating: 4.5,
    reviewCount: 1456,
    openDate: "2018-09-10",
    phone: "028-86538888",
    location: {
      lat: 30.6598,
      lng: 104.0633,
      district: "锦江区",
      subway: "地铁2号线/3号线春熙路站",
      nearbyAttractions: ["太古里", "春熙路", "大慈寺"]
    },
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
    ],
    rooms: [
      {
        id: 1201,
        type: "高级客房",
        size: "32㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 688,
        originalPrice: 888,
        breakfast: false,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 10
      }
    ],
    facilities: ["免费WiFi", "停车场", "健身房", "餐厅"],
    tags: ["商务", "购物便利", "地铁沿线"],
    promotion: null,
    status: "approved"
  },

  {
    id: 13,
    name: "成都宽窄巷子亚朵酒店",
    nameEn: "Atour Hotel Chengdu Kuanzhai Alley",
    address: "四川省成都市青羊区长顺上街127号",
    star: 4,
    rating: 4.6,
    reviewCount: 1789,
    openDate: "2017-06-05",
    phone: "028-86249999",
    location: {
      lat: 30.6712,
      lng: 104.0485,
      district: "青羊区",
      subway: "地铁4号线宽窄巷子站",
      nearbyAttractions: ["宽窄巷子", "人民公园", "天府广场"]
    },
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"
    ],
    rooms: [
      {
        id: 1301,
        type: "雅致大床房",
        size: "28㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 488,
        originalPrice: 588,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 7
      }
    ],
    facilities: ["免费WiFi", "免费早餐", "健身房", "图书馆"],
    tags: ["设计感", "免费早餐", "宽窄巷子"],
    promotion: null,
    status: "approved"
  },

  {
    id: 14,
    name: "成都如家酒店(春熙路店)",
    nameEn: "Home Inn Chengdu Chunxi Road",
    address: "四川省成都市锦江区总府路15号",
    star: 3,
    rating: 4.1,
    reviewCount: 1923,
    openDate: "2008-11-20",
    phone: "028-86752345",
    location: {
      lat: 30.6625,
      lng: 104.0789,
      district: "锦江区",
      subway: "地铁2号线春熙路站",
      nearbyAttractions: ["春熙路", "IFS", "太古里"]
    },
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
    ],
    rooms: [
      {
        id: 1401,
        type: "标准大床房",
        size: "18㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 249,
        originalPrice: 299,
        breakfast: false,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 14
      }
    ],
    facilities: ["免费WiFi", "24小时前台"],
    tags: ["如家", "经济型", "购物中心"],
    promotion: {
      type: "会员优惠",
      discount: 0.9,
      description: "会员享9折"
    },
    status: "approved"
  },

  // 广州酒店
  {
    id: 15,
    name: "广州珠江新城柏悦酒店",
    nameEn: "Park Hyatt Guangzhou",
    address: "广州市天河区珠江东路12号",
    star: 5,
    rating: 4.9,
    reviewCount: 2034,
    openDate: "2012-08-18",
    phone: "020-38966888",
    location: {
      lat: 23.1200,
      lng: 113.3240,
      district: "天河区",
      subway: "地铁3号线珠江新城站",
      nearbyAttractions: ["广州塔", "花城广场", "海心沙"]
    },
    images: [
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800"
    ],
    rooms: [
      {
        id: 1501,
        type: "柏悦大床房",
        size: "55㎡",
        bedType: "1张特大床",
        maxGuests: 2,
        price: 1988,
        originalPrice: 2488,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 4
      }
    ],
    facilities: ["免费WiFi", "停车场", "无边泳池", "健身房", "米其林餐厅", "SPA"],
    tags: ["奢华", "高层景观", "米其林"],
    promotion: {
      type: "早鸟优惠",
      discount: 0.75,
      description: "提前30天预订享75折"
    },
    status: "approved"
  },

  {
    id: 16,
    name: "广州维也纳酒店(天河路店)",
    nameEn: "Vienna Hotel Guangzhou Tianhe Road",
    address: "广州市天河区天河路228号",
    star: 4,
    rating: 4.4,
    reviewCount: 1567,
    openDate: "2015-04-12",
    phone: "020-38745678",
    location: {
      lat: 23.1367,
      lng: 113.3251,
      district: "天河区",
      subway: "地铁1号线/3号线体育西路站",
      nearbyAttractions: ["天河城", "正佳广场", "太古汇"]
    },
    images: [
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800"
    ],
    rooms: [
      {
        id: 1601,
        type: "商务大床房",
        size: "28㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 428,
        originalPrice: 528,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 9
      }
    ],
    facilities: ["免费WiFi", "免费早餐", "健身房"],
    tags: ["商务", "购物便利", "地铁沿线"],
    promotion: null,
    status: "approved"
  },

  {
    id: 17,
    name: "广州如家酒店(北京路步行街店)",
    nameEn: "Home Inn Guangzhou Beijing Road",
    address: "广州市越秀区北京路168号",
    star: 3,
    rating: 4.2,
    reviewCount: 2345,
    openDate: "2007-09-15",
    phone: "020-83334567",
    location: {
      lat: 23.1291,
      lng: 113.2644,
      district: "越秀区",
      subway: "地铁6号线北京路站",
      nearbyAttractions: ["北京路步行街", "越秀公园", "中山纪念堂"]
    },
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
    ],
    rooms: [
      {
        id: 1701,
        type: "标准大床房",
        size: "20㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 289,
        originalPrice: 339,
        breakfast: false,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 11
      }
    ],
    facilities: ["免费WiFi", "24小时前台"],
    tags: ["如家", "经济型", "步行街"],
    promotion: null,
    status: "approved"
  },

  // 深圳酒店
  {
    id: 18,
    name: "深圳四季酒店",
    nameEn: "Four Seasons Hotel Shenzhen",
    address: "深圳市福田区福华三路138号",
    star: 5,
    rating: 4.8,
    reviewCount: 1876,
    openDate: "2013-11-25",
    phone: "0755-82226666",
    location: {
      lat: 22.5329,
      lng: 114.0579,
      district: "福田区",
      subway: "地铁1号线/2号线会展中心站",
      nearbyAttractions: ["会展中心", "市民中心", "莲花山公园"]
    },
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
    ],
    rooms: [
      {
        id: 1801,
        type: "豪华客房",
        size: "48㎡",
        bedType: "1张特大床",
        maxGuests: 2,
        price: 1688,
        originalPrice: 2088,
        breakfast: true,
        wifi: true,
        cancelPolicy: "入住前48小时免费取消",
        stock: 6
      }
    ],
    facilities: ["免费WiFi", "停车场", "游泳池", "健身房", "SPA", "米其林餐厅"],
    tags: ["豪华", "商务", "会展中心"],
    promotion: null,
    status: "approved"
  },

  {
    id: 19,
    name: "深圳维也纳酒店(科技园店)",
    nameEn: "Vienna Hotel Shenzhen Hi-Tech Park",
    address: "深圳市南山区科技园南区科苑路15号",
    star: 4,
    rating: 4.5,
    reviewCount: 1432,
    openDate: "2016-07-08",
    phone: "0755-26551234",
    location: {
      lat: 22.5385,
      lng: 113.9531,
      district: "南山区",
      subway: "地铁2号线科苑站",
      nearbyAttractions: ["科技园", "深圳湾公园", "海岸城"]
    },
    images: [
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800"
    ],
    rooms: [
      {
        id: 1901,
        type: "高级大床房",
        size: "30㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 468,
        originalPrice: 568,
        breakfast: true,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 8
      }
    ],
    facilities: ["免费WiFi", "免费早餐", "健身房", "会议室"],
    tags: ["商务", "科技园", "免费早餐"],
    promotion: null,
    status: "approved"
  },

  {
    id: 20,
    name: "深圳如家酒店(罗湖口岸店)",
    nameEn: "Home Inn Shenzhen Luohu Port",
    address: "深圳市罗湖区建设路1088号",
    star: 3,
    rating: 4.3,
    reviewCount: 2156,
    openDate: "2006-05-20",
    phone: "0755-82331234",
    location: {
      lat: 22.5368,
      lng: 114.1189,
      district: "罗湖区",
      subway: "地铁1号线罗湖站",
      nearbyAttractions: ["罗湖口岸", "东门步行街", "地王大厦"]
    },
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
    ],
    rooms: [
      {
        id: 2001,
        type: "标准大床房",
        size: "18㎡",
        bedType: "1张大床",
        maxGuests: 2,
        price: 269,
        originalPrice: 319,
        breakfast: false,
        wifi: true,
        cancelPolicy: "免费取消",
        stock: 13
      }
    ],
    facilities: ["免费WiFi", "24小时前台", "行李寄存"],
    tags: ["如家", "经济型", "口岸附近"],
    promotion: {
      type: "限时特惠",
      discount: 0.85,
      description: "本周特惠85折"
    },
    status: "approved"
  }
]

// 其他函数保持不变
export const getHotelById = (id) => {
  return hotelsData.find(hotel => hotel.id === parseInt(id))
}

export const filterHotels = (filters) => {
  let result = [...hotelsData]
  
  if (filters.city) {
    result = result.filter(hotel => hotel.address.includes(filters.city))
  }
  
  if (filters.star) {
    result = result.filter(hotel => hotel.star === filters.star)
  }
  
  if (filters.minPrice || filters.maxPrice) {
    result = result.filter(hotel => {
      const minRoomPrice = Math.min(...hotel.rooms.map(r => r.price))
      return (!filters.minPrice || minRoomPrice >= filters.minPrice) &&
             (!filters.maxPrice || minRoomPrice <= filters.maxPrice)
    })
  }
  
  return result
}