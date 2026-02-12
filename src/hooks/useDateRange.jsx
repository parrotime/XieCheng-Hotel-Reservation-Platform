import { useState, useContext, createContext } from 'react'
import { Toast } from 'antd-mobile'
import { formatDate, calculateNights } from '../utils/dateUtils'

const DateRangeContext = createContext(null)

/**
 * 日期状态 Provider — 在 App 顶层包裹一次，所有页面共享同一份日期
 */
export function DateRangeProvider({ children }) {
  const [checkInDate, setCheckInDate] = useState(null)
  const [checkOutDate, setCheckOutDate] = useState(null)
  const [checkInVisible, setCheckInVisible] = useState(false)
  const [checkOutVisible, setCheckOutVisible] = useState(false)

  const nights = calculateNights(checkInDate, checkOutDate)

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

  const value = {
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

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  )
}

/**
 * 入住/退房日期选择 Hook
 * 从 Context 读取共享日期状态，首页/列表页/详情页自动同步
 */
export function useDateRange() {
  const ctx = useContext(DateRangeContext)
  if (!ctx) {
    throw new Error('useDateRange must be used within a DateRangeProvider')
  }
  return ctx
}
