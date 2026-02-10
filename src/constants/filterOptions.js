// 星级筛选选项（HomePage、HotelList 共用）
export const starOptions = [
  { label: '⭐⭐⭐⭐⭐ 五星', value: 5 },
  { label: '⭐⭐⭐⭐ 四星', value: 4 },
  { label: '⭐⭐⭐ 三星', value: 3 }
]

// 价格区间选项（HomePage、HotelList 共用）
export const priceOptions = [
  { label: '¥0-300', value: '0-300' },
  { label: '¥300-600', value: '300-600' },
  { label: '¥600-1000', value: '600-1000' },
  { label: '¥1000-2000', value: '1000-2000' },
  { label: '¥2000以上', value: '2000-99999' }
]

// 排序选项（HotelList 使用）
export const sortOptions = [
  { key: 'default', title: '默认排序' },
  { key: 'price-asc', title: '价格从低到高' },
  { key: 'price-desc', title: '价格从高到低' },
  { key: 'rating', title: '评分最高' },
  { key: 'star', title: '星级最高' }
]

// 快捷标签（HomePage 使用）
export const quickTags = [
  { label: '如家', value: '如家' },
  { label: '豪华', value: '豪华' },
  { label: '免费早餐', value: '免费早餐' },
  { label: '免费取消', value: '免费取消' },
  { label: '游泳池', value: '游泳池' },
  { label: '健身房', value: '健身房' }
]

// 酒店状态映射（HotelManage、HotelAudit 共用）
export const statusMap = {
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '已上线', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
  offline: { text: '已下线', color: 'default' }
}
