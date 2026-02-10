// 中国主要城市列表（扩充版，2026年参考，聚焦常用城市）
export const allCities = [
  // 直辖市 (4个)
  { id: 1, name: "北京", province: "北京市", hot: true },
  { id: 2, name: "上海", province: "上海市", hot: true },
  { id: 3, name: "天津", province: "天津市", hot: true },
  { id: 4, name: "重庆", province: "重庆市", hot: true },

  // 河北省
  { id: 1001, name: "石家庄", province: "河北省", hot: true },   // 省会
  { id: 1002, name: "唐山", province: "河北省", hot: false },
  { id: 1003, name: "秦皇岛", province: "河北省", hot: false },
  { id: 1004, name: "保定", province: "河北省", hot: false },
  { id: 1005, name: "廊坊", province: "河北省", hot: false },

  // 山西省
  { id: 1101, name: "太原", province: "山西省", hot: true },    // 省会
  { id: 1102, name: "大同", province: "山西省", hot: false },

  // 内蒙古自治区
  { id: 1201, name: "呼和浩特", province: "内蒙古自治区", hot: true }, // 首府
  { id: 1202, name: "包头", province: "内蒙古自治区", hot: false },
  { id: 1203, name: "鄂尔多斯", province: "内蒙古自治区", hot: false },

  // 辽宁省
  { id: 1301, name: "沈阳", province: "辽宁省", hot: true },    // 省会
  { id: 1302, name: "大连", province: "辽宁省", hot: true },
  { id: 1303, name: "鞍山", province: "辽宁省", hot: false },

  // 吉林省
  { id: 1401, name: "长春", province: "吉林省", hot: true },    // 省会

  // 黑龙江省
  { id: 1501, name: "哈尔滨", province: "黑龙江省", hot: true }, // 省会

  // 江苏省
  { id: 1601, name: "南京", province: "江苏省", hot: true },    // 省会
  { id: 1602, name: "苏州", province: "江苏省", hot: true },
  { id: 1603, name: "无锡", province: "江苏省", hot: true },
  { id: 1604, name: "常州", province: "江苏省", hot: false },
  { id: 1605, name: "南通", province: "江苏省", hot: false },
  { id: 1606, name: "徐州", province: "江苏省", hot: false },

  // 浙江省
  { id: 1701, name: "杭州", province: "浙江省", hot: true },    // 省会
  { id: 1702, name: "宁波", province: "浙江省", hot: true },
  { id: 1703, name: "温州", province: "浙江省", hot: false },
  { id: 1704, name: "绍兴", province: "浙江省", hot: false },
  { id: 1705, name: "台州", province: "浙江省", hot: false },

  // 安徽省
  { id: 1801, name: "合肥", province: "安徽省", hot: true },    // 省会
  { id: 1802, name: "芜湖", province: "安徽省", hot: false },

  // 福建省
  { id: 1901, name: "福州", province: "福建省", hot: true },    // 省会
  { id: 1902, name: "厦门", province: "福建省", hot: true },
  { id: 1903, name: "泉州", province: "福建省", hot: false },

  // 江西省
  { id: 2001, name: "南昌", province: "江西省", hot: true },    // 省会

  // 山东省
  { id: 2101, name: "济南", province: "山东省", hot: true },    // 省会
  { id: 2102, name: "青岛", province: "山东省", hot: true },
  { id: 2103, name: "烟台", province: "山东省", hot: false },
  { id: 2104, name: "潍坊", province: "山东省", hot: false },
  { id: 2105, name: "临沂", province: "山东省", hot: false },

  // 河南省
  { id: 2201, name: "郑州", province: "河南省", hot: true },    // 省会
  { id: 2202, name: "洛阳", province: "河南省", hot: false },

  // 湖北省
  { id: 2301, name: "武汉", province: "湖北省", hot: true },    // 省会

  // 湖南省
  { id: 2401, name: "长沙", province: "湖南省", hot: true },    // 省会

  // 广东省
  { id: 2501, name: "广州", province: "广东省", hot: true },    // 省会
  { id: 2502, name: "深圳", province: "广东省", hot: true },
  { id: 2503, name: "珠海", province: "广东省", hot: true },
  { id: 2504, name: "佛山", province: "广东省", hot: true },
  { id: 2505, name: "东莞", province: "广东省", hot: true },
  { id: 2506, name: "中山", province: "广东省", hot: false },
  { id: 2507, name: "惠州", province: "广东省", hot: false },

  // 广西壮族自治区
  { id: 2601, name: "南宁", province: "广西壮族自治区", hot: true }, // 首府
  { id: 2602, name: "桂林", province: "广西壮族自治区", hot: true },

  // 海南省
  { id: 2701, name: "海口", province: "海南省", hot: true },
  { id: 2702, name: "三亚", province: "海南省", hot: true },

  // 四川省
  { id: 2801, name: "成都", province: "四川省", hot: true },    // 省会
  { id: 2802, name: "绵阳", province: "四川省", hot: false },

  // 贵州省
  { id: 2901, name: "贵阳", province: "贵州省", hot: true },    // 省会

  // 云南省
  { id: 3001, name: "昆明", province: "云南省", hot: true },    // 省会
  { id: 3002, name: "丽江", province: "云南省", hot: true },
  { id: 3003, name: "大理", province: "云南省", hot: false },

  // 西藏自治区
  { id: 3101, name: "拉萨", province: "西藏自治区", hot: true }, // 首府

  // 陕西省
  { id: 3201, name: "西安", province: "陕西省", hot: true },    // 省会

  // 甘肃省
  { id: 3301, name: "兰州", province: "甘肃省", hot: true },    // 省会

  // 青海省
  { id: 3401, name: "西宁", province: "青海省", hot: true },    // 省会

  // 宁夏回族自治区
  { id: 3501, name: "银川", province: "宁夏回族自治区", hot: true }, // 首府

  // 新疆维吾尔自治区
  { id: 3601, name: "乌鲁木齐", province: "新疆维吾尔自治区", hot: true }, // 首府
];

export const hotCities = allCities.filter(city => city.hot);