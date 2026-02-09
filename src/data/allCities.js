// 中国主要城市列表（扩充版）
export const allCities = [
  // 直辖市
  { id: 1, name: "北京", province: "北京市", hot: true },
  { id: 2, name: "上海", province: "上海市", hot: true },
  { id: 3, name: "天津", province: "天津市", hot: false },
  { id: 4, name: "重庆", province: "重庆市", hot: true },
  
  // 广东省
  { id: 5, name: "广州", province: "广东省", hot: true },
  { id: 6, name: "深圳", province: "广东省", hot: true },
  { id: 7, name: "珠海", province: "广东省", hot: false },
  { id: 8, name: "东莞", province: "广东省", hot: false },
  { id: 9, name: "佛山", province: "广东省", hot: false },
  { id: 10, name: "中山", province: "广东省", hot: false },
  
  // 浙江省
  { id: 11, name: "杭州", province: "浙江省", hot: true },
  { id: 12, name: "宁波", province: "浙江省", hot: false },
  { id: 13, name: "温州", province: "浙江省", hot: false },
  { id: 14, name: "绍兴", province: "浙江省", hot: false },
  
  // 江苏省
  { id: 15, name: "南京", province: "江苏省", hot: true },
  { id: 16, name: "苏州", province: "江苏省", hot: true },
  { id: 17, name: "无锡", province: "江苏省", hot: false },
  { id: 18, name: "常州", province: "江苏省", hot: false },
  
  // 四川省
  { id: 19, name: "成都", province: "四川省", hot: true },
  { id: 20, name: "绵阳", province: "四川省", hot: false },
  
  // 湖北省
  { id: 21, name: "武汉", province: "湖北省", hot: true },
  
  // 陕西省
  { id: 22, name: "西安", province: "陕西省", hot: true },
  
  // 福建省
  { id: 23, name: "厦门", province: "福建省", hot: true },
  { id: 24, name: "福州", province: "福建省", hot: false },
  
  // 山东省
  { id: 25, name: "青岛", province: "山东省", hot: false },
  { id: 26, name: "济南", province: "山东省", hot: false },
  
  // 辽宁省
  { id: 27, name: "大连", province: "辽宁省", hot: false },
  { id: 28, name: "沈阳", province: "辽宁省", hot: false },
  
  // 河南省
  { id: 29, name: "郑州", province: "河南省", hot: false },
  
  // 湖南省
  { id: 30, name: "长沙", province: "湖南省", hot: false },
  
  // 云南省
  { id: 31, name: "昆明", province: "云南省", hot: false },
  { id: 32, name: "丽江", province: "云南省", hot: false },
  
  // 海南省
  { id: 33, name: "海口", province: "海南省", hot: false },
  { id: 34, name: "三亚", province: "海南省", hot: true },
  
  // 黑龙江省
  { id: 35, name: "哈尔滨", province: "黑龙江省", hot: false },
  
  // 吉林省
  { id: 36, name: "长春", province: "吉林省", hot: false },
  
  // 河北省
  { id: 37, name: "石家庄", province: "河北省", hot: false },
  
  // 山西省
  { id: 38, name: "太原", province: "山西省", hot: false },
  
  // 安徽省
  { id: 39, name: "合肥", province: "安徽省", hot: false },
  
  // 江西省
  { id: 40, name: "南昌", province: "江西省", hot: false },
  
  // 贵州省
  { id: 41, name: "贵阳", province: "贵州省", hot: false },
  
  // 甘肃省
  { id: 42, name: "兰州", province: "甘肃省", hot: false },
]

export const hotCities = allCities.filter(city => city.hot)