/**
 * 获取酒店最低房价
 * @param {Object} hotel - 酒店对象，包含 rooms 数组
 * @returns {number} 最低价格
 */
export const getMinPrice = (hotel) => {
  if (!hotel.rooms || hotel.rooms.length === 0) return 0
  return Math.min(...hotel.rooms.map(r => r.price))
}

/**
 * 生成星级文本
 * @param {number} star - 星级数（3/4/5）
 * @returns {string} 星级 emoji 字符串
 */
export const renderStarText = (star) => {
  return '⭐'.repeat(star)
}
