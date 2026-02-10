/**
 * 格式化日期为中文月日格式，如 "3月15日"
 * @param {Date|null} date
 * @returns {string|null}
 */
export const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 计算两个日期之间的天数（入住晚数）
 * @param {Date} checkIn - 入住日期
 * @param {Date} checkOut - 退房日期
 * @returns {number} 入住晚数，无效返回 0
 */
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  const diffTime = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}
