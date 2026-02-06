// 城市数据
export const cities = [
  { id: 1, name: "上海", code: "SH", hot: true },
  { id: 2, name: "北京", code: "BJ", hot: true },
  { id: 3, name: "杭州", code: "HZ", hot: true },
  { id: 4, name: "成都", code: "CD", hot: true },
  { id: 5, name: "广州", code: "GZ", hot: true },
  { id: 6, name: "深圳", code: "SZ", hot: true },
  { id: 7, name: "南京", code: "NJ", hot: false },
  { id: 8, name: "苏州", code: "SZ", hot: false },
  { id: 9, name: "西安", code: "XA", hot: false },
  { id: 10, name: "重庆", code: "CQ", hot: false }
]

// 热门城市
export const hotCities = cities.filter(city => city.hot)