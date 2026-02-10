import { useState } from 'react'
import { Toast } from 'antd-mobile'
import { formatDate, calculateNights } from '../utils/dateUtils'

/**
 * 入住/退房日期选择 Hook（移动端专用）
 * 封装日期状态、弹窗可见性、校验逻辑和入住天数计算
 * @returns {Object} 日期相关状态和操作方法
 */
export function useDateRange() {
  const [checkInDate, setCheckInDate] = useState(null)
  const [checkOutDate, setCheckOutDate] = useState(null)
  const [checkInVisible, setCheckInVisible] = useState(false)
  const [checkOutVisible, setCheckOutVisible] = useState(false)

  // 自动计算入住晚数
  const nights = calculateNights(checkInDate, checkOutDate)

  // 入住日期确认（含校验）
  const handleCheckInConfirm = (value) => {
    const selectedDate = new Date(value)

    if (checkOutDate) {
      const checkOut = new Date(checkOutDate)
      if (selectedDate >= checkOut) {
        Toast.show({ icon: 'fail', content: '入住日期必须早于退房日期' })
        return
      }
    }

    setCheckInDate(selectedDate)
    Toast.show({ icon: 'success', content: '入住日期已选择' })
  }

  // 退房日期确认（含校验）
  const handleCheckOutConfirm = (value) => {
    const selectedDate = new Date(value)

    if (checkInDate) {
      const checkIn = new Date(checkInDate)
      if (selectedDate <= checkIn) {
        Toast.show({ icon: 'fail', content: '退房日期必须晚于入住日期' })
        return
      }
    }

    setCheckOutDate(selectedDate)
    Toast.show({ icon: 'success', content: '退房日期已选择' })
  }

  return {
    checkInDate,
    checkOutDate,
    checkInVisible,
    checkOutVisible,
    setCheckInVisible,
    setCheckOutVisible,
    nights,
    handleCheckInConfirm,
    handleCheckOutConfirm,
    formatDate,
  }
}
