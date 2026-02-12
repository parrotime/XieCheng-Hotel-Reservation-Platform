import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { NavBar } from 'antd-mobile'
import './PaySuccess.css'

function PaySuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const order = location.state?.order
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    // 触发入场动画
    const timer = setTimeout(() => setShowCheck(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="pay-success-page">
      <NavBar backArrow={false} right={
        <span className="ps-close" onClick={() => navigate('/orders')}>完成</span>
      }>支付结果</NavBar>

      {/* 成功动画 */}
      <div className="ps-result-area">
        <div className={`ps-check-circle ${showCheck ? 'ps-check-animate' : ''}`}>
          <svg viewBox="0 0 52 52" className="ps-check-svg">
            <circle className="ps-check-bg" cx="26" cy="26" r="25" fill="none" />
            <path className="ps-check-mark" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h2 className="ps-title">支付成功</h2>
        {order && (
          <p className="ps-amount">
            <span className="ps-amount-symbol">¥</span>
            <span className="ps-amount-value">{Number(order.total_price).toFixed(2)}</span>
          </p>
        )}
      </div>

      {/* 订单摘要 */}
      {order && (
        <div className="ps-summary-card">
          <div className="ps-summary-row">
            <span className="ps-summary-label">酒店</span>
            <span className="ps-summary-value">{order.hotel_name || '—'}</span>
          </div>
          <div className="ps-summary-row">
            <span className="ps-summary-label">房型</span>
            <span className="ps-summary-value">{order.room_name || '—'}</span>
          </div>
          <div className="ps-summary-row">
            <span className="ps-summary-label">入住</span>
            <span className="ps-summary-value">{order.check_in?.slice(0, 10)}</span>
          </div>
          <div className="ps-summary-row">
            <span className="ps-summary-label">退房</span>
            <span className="ps-summary-value">{order.check_out?.slice(0, 10)}</span>
          </div>
          <div className="ps-summary-row">
            <span className="ps-summary-label">订单号</span>
            <span className="ps-summary-value ps-order-no">{order.order_no}</span>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="ps-actions">
        <button className="ps-btn ps-btn-primary" onClick={() => navigate(`/order/${order?.id || ''}`)}>
          查看订单
        </button>
        <button className="ps-btn ps-btn-ghost" onClick={() => navigate('/')}>
          返回首页
        </button>
      </div>
    </div>
  )
}

export default PaySuccess
