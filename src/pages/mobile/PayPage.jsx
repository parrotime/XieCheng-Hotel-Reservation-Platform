import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { NavBar, Toast } from 'antd-mobile'
import { LeftOutline } from 'antd-mobile-icons'
import { getOrderById, payOrder, cancelOrder } from '../../api/orders'
import './PayPage.css'

function PayPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [order, setOrder] = useState(location.state?.order || null)
  const [payMethod, setPayMethod] = useState('alipay')
  const [paying, setPaying] = useState(false)
  const [countdown, setCountdown] = useState(15 * 60) // 15分钟倒计时

  // 加载订单数据
  useEffect(() => {
    if (!order) {
      getOrderById(id).then(setOrder).catch(() => {
        Toast.show({ icon: 'fail', content: '订单不存在' })
        navigate('/orders')
      })
    }
  }, [id, order, navigate])

  // 倒计时
  useEffect(() => {
    if (!order || order.status !== 'pending') return
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [order])

  const handleTimeout = useCallback(async () => {
    try {
      await cancelOrder(id)
      Toast.show({ content: '订单已超时取消' })
      navigate('/orders')
    } catch {
      // ignore
    }
  }, [id, navigate])

  // 格式化倒计时
  const formatCountdown = (s) => {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // 确认支付
  const handlePay = async () => {
    setPaying(true)
    try {
      await payOrder(id)
      Toast.show({ icon: 'success', content: '支付成功' })
      navigate('/orders')
    } catch (err) {
      Toast.show({ icon: 'fail', content: err.response?.data?.error || '支付失败' })
    } finally {
      setPaying(false)
    }
  }

  // 取消订单
  const handleCancel = async () => {
    try {
      await cancelOrder(id)
      Toast.show({ content: '订单已取消' })
      navigate('/orders')
    } catch (err) {
      Toast.show({ icon: 'fail', content: '取消失败' })
    }
  }

  if (!order) return null

  const methods = [
    { key: 'alipay', label: '支付宝', icon: '💙' },
    { key: 'wechat', label: '微信支付', icon: '💚' },
    { key: 'card', label: '银行卡', icon: '💳' },
  ]

  return (
    <div className="pay-page">
      <NavBar onBack={() => navigate(-1)} backArrow={<LeftOutline />}>
        确认支付
      </NavBar>

      {/* 倒计时 */}
      <div className="pay-countdown">
        <span className="countdown-label">请在</span>
        <span className="countdown-time">{formatCountdown(countdown)}</span>
        <span className="countdown-label">内完成支付</span>
      </div>

      {/* 金额 */}
      <div className="pay-amount-card">
        <div className="pay-amount-label">支付金额</div>
        <div className="pay-amount">
          <span className="pay-symbol">¥</span>
          <span className="pay-value">{Number(order.total_price).toFixed(2)}</span>
        </div>
      </div>

      {/* 订单信息 */}
      <div className="pay-info-card">
        <div className="pay-info-row">
          <span className="pay-info-label">订单号</span>
          <span className="pay-info-value">{order.order_no}</span>
        </div>
        <div className="pay-info-row">
          <span className="pay-info-label">酒店</span>
          <span className="pay-info-value">{order.hotel_name || '—'}</span>
        </div>
        <div className="pay-info-row">
          <span className="pay-info-label">房型</span>
          <span className="pay-info-value">{order.room_name || '—'}</span>
        </div>
        <div className="pay-info-row">
          <span className="pay-info-label">入住</span>
          <span className="pay-info-value">{order.check_in?.slice(0, 10)}</span>
        </div>
        <div className="pay-info-row">
          <span className="pay-info-label">退房</span>
          <span className="pay-info-value">{order.check_out?.slice(0, 10)}</span>
        </div>
        <div className="pay-info-row">
          <span className="pay-info-label">晚数</span>
          <span className="pay-info-value">{order.nights}晚</span>
        </div>
      </div>

      {/* 支付方式 */}
      <div className="pay-methods-card">
        <h3 className="pay-methods-title">选择支付方式</h3>
        {methods.map(m => (
          <div
            key={m.key}
            className={`pay-method-item ${payMethod === m.key ? 'active' : ''}`}
            onClick={() => setPayMethod(m.key)}
          >
            <span className="method-icon">{m.icon}</span>
            <span className="method-label">{m.label}</span>
            <span className={`method-radio ${payMethod === m.key ? 'checked' : ''}`} />
          </div>
        ))}
      </div>

      {/* 底部操作 */}
      <div className="pay-bottom-bar">
        <button className="pay-cancel-btn" onClick={handleCancel}>取消订单</button>
        <button className="pay-confirm-btn" onClick={handlePay} disabled={paying}>
          {paying ? '支付中...' : `确认支付 ¥${Number(order.total_price).toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}

export default PayPage
