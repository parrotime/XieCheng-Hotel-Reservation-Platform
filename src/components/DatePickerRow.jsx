import React from 'react'
import { Button, DatePicker } from 'antd-mobile'
import { formatDate } from '../utils/dateUtils'

/**
 * 日期选择行组件（移动端，antd-mobile）
 * 配合 useDateRange Hook 使用
 * @param {Object} dateRange - useDateRange() 返回值
 * @param {string} [separator] - 分隔符，默认 "-"
 */
export default function DatePickerRow({ dateRange, separator = '-' }) {
  const {
    checkInDate,
    checkOutDate,
    checkInVisible,
    checkOutVisible,
    setCheckInVisible,
    setCheckOutVisible,
    handleCheckInConfirm,
    handleCheckOutConfirm,
  } = dateRange

  return (
    <>
      <div className="date-picker-row">
        <Button
          size="large"
          fill="outline"
          onClick={() => setCheckInVisible(true)}
          style={{ flex: 1 }}
        >
          {checkInDate ? formatDate(checkInDate) : '入住日期'}
        </Button>
        <span style={{ margin: '0 10px', fontSize: '18px', color: '#999' }}>
          {separator}
        </span>
        <Button
          size="large"
          fill="outline"
          onClick={() => setCheckOutVisible(true)}
          style={{ flex: 1 }}
        >
          {checkOutDate ? formatDate(checkOutDate) : '退房日期'}
        </Button>
      </div>

      <DatePicker
        visible={checkInVisible}
        onClose={() => setCheckInVisible(false)}
        onConfirm={handleCheckInConfirm}
        min={new Date()}
        precision="day"
        title="选择入住日期"
      />

      <DatePicker
        visible={checkOutVisible}
        onClose={() => setCheckOutVisible(false)}
        onConfirm={handleCheckOutConfirm}
        min={
          checkInDate
            ? new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)
            : new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        }
        precision="day"
        title="选择退房日期"
      />
    </>
  )
}
