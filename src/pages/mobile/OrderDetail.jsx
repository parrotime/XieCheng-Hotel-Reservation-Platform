import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { NavBar, Toast, Skeleton } from 'antd-mobile'
import { LeftOutline, EnvironmentOutline, PhoneFill } from 'antd-mobile-icons'
import { getOrderById, cancelOrder } from '../../api/orders'
import './OrderDetail.css'

const STATUS_MAP = {
  pending:    { label: '待支付', color: '#ff6b35', icon: '🕐' },
  paid:       { label: '已支付', color: '#1677ff', icon: '✅' },
  cancelled:  { label: '已取消', color: '#999',    icon: '❌' },
  checked_in: { label: '已入住', color: '#52c41a', icon: '🏨' },
  completed:  { label: '已完成', color: '#52c41a', icon: '🎉' },
}

// 状态流转顺序
const STATUS_FLOW = ['pending', 'paid', 'checked_in', 'completed']

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getOrderById(id)
      .then(setOrder)
      .catch((err) => {
        Toast.show({ icon: 'fail', content: err.message || '订单不存在' })
        navigate('/orders')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleCancel = async () => {
    try {
      await cancelOrder(id)
      Toast.show({ content: '订单已取消' })
      navigate('/orders')
    } catch (err) {
      Toast.show({ icon: 'fail', content: err.message || '取消失败' })
    }
  }

  // 获取时间线步骤的激活状态
  const getTimelineStatus = (step) => {
    if (!order) return 'inactive'
    if (order.status === 'cancelled') {
      return step === 'pending' ? 'done' : step === 'cancelled' ? 'active' : 'inactive'
    }
    const currentIdx = STATUS_FLOW.indexOf(order.status)
    const stepIdx = STATUS_FLOW.indexOf(step)
    if (stepIdx < currentIdx) return 'done'
    if (stepIdx === currentIdx) return 'active'
    return 'inactive'
  }

  if (loading) {
    return (
      <div className="order-detail-page">
        <NavBar onBack={() => navigate(-1)} backArrow={<LeftOutline />}>订单详情</NavBar>
        <div style={{ padding: 16 }}>
          <Skeleton animated style={{ width: '100%', height: 80, borderRadius: 12, marginBottom: 12 }} />
          <Skeleton animated style={{ width: '100%', height: 160, borderRadius: 12, marginBottom: 12 }} />
          <Skeleton animated style={{ width: '100%', height: 120, borderRadius: 12 }} />
        </div>
      </div>
    )
  }

  if (!order) return null

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#999', icon: '📋' }
  const hotelImage = order.hotel_images?.[0]
  const imageUrl = typeof hotelImage === 'string' ? hotelImage : hotelImage?.url

  return (
    <div className="order-detail-page">
      <NavBar onBack={() => navigate(-1)} backArrow={<LeftOutline />}>订单详情</NavBar>

      {/* 状态头部 */}
      <div className="od-status-header" style={{ background: statusInfo.color }}>
        <span className="od-status-icon">{statusInfo.icon}</span>
        <span className="od-status-label">{statusInfo.label}</span>
        {order.status === 'pending' && (
          <span className="od-status-hint">请尽快完成支付</span>
        )}
      </div>

      {/* 酒店信息卡片 */}
      <div className="od-card od-hotel-card" onClick={() => navigate(`/detail/${order.hotel_id}`)}>
        {imageUrl && <img className="od-hotel-img" src={imageUrl} alt={order.hotel_name} />}
        <div className="od-hotel-info">
          <h3 className="od-hotel-name">{order.hotel_name}</h3>
          <p className="od-room-name">{order.room_name} · {order.bed_type}</p>
          {order.hotel_address && (
            <p className="od-hotel-addr">
              <EnvironmentOutline style={{ marginRight: 4 }} />
              {order.hotel_address}
            </p>
          )}
        </div>
      </div>

      {/* 入住信息 */}
      <div className="od-card">
        <h4 className="od-card-title">入住信息</h4>
        <div className="od-date-row">
          <div className="od-date-block">
            <span className="od-date-label">入住</span>
            <span className="od-date-value">{order.check_in?.slice(0, 10)}</span>
          </div>
          <div className="od-date-nights">
            <span>{order.nights}晚</span>
            <span className="od-date-arrow">→</span>
          </div>
          <div className="od-date-block">
            <span className="od-date-label">退房</span>
            <span className="od-date-value">{order.check_out?.slice(0, 10)}</span>
          </div>
        </div>
        {(order.contact_name || order.contact_phone) && (
          <div className="od-contact-row">
            {order.contact_name && <span>入住人：{order.contact_name}</span>}
            {order.contact_phone && <span>电话：{order.contact_phone}</span>}
          </div>
        )}
      </div>

      {/* 费用明细 */}
      <div className="od-card">
        <h4 className="od-card-title">费用明细</h4>
        <div className="od-fee-row">
          <span>{order.room_name} × {order.nights}晚{order.room_count > 1 ? ` × ${order.room_count}间` : ''}</span>
          <span>¥{Number(order.total_price).toFixed(2)}</span>
        </div>
        <div className="od-fee-total">
          <span>合计</span>
          <span className="od-total-price">¥{Number(order.total_price).toFixed(2)}</span>
        </div>
      </div>

      {/* 订单状态时间线 */}
      <div className="od-card">
        <h4 className="od-card-title">订单状态</h4>
        <div className="od-timeline">
          {(order.status === 'cancelled'
            ? [
                { key: 'pending', label: '提交订单', time: order.created_at },
                { key: 'cancelled', label: '已取消', time: order.updated_at },
              ]
            : [
                { key: 'pending', label: '提交订单', time: order.created_at },
                { key: 'paid', label: '支付成功', time: order.status !== 'pending' ? order.updated_at : null },
                { key: 'checked_in', label: '已入住', time: order.status === 'checked_in' || order.status === 'completed' ? order.updated_at : null },
                { key: 'completed', label: '已完成', time: order.status === 'completed' ? order.updated_at : null },
              ]
          ).map((step, idx, arr) => {
            const status = getTimelineStatus(step.key)
            return (
              <div key={step.key} className={`od-timeline-item od-timeline-${status}`}>
                <div className="od-timeline-dot" />
                {idx < arr.length - 1 && <div className="od-timeline-line" />}
                <div className="od-timeline-content">
                  <span className="od-timeline-label">{step.label}</span>
                  {step.time && status !== 'inactive' && (
                    <span className="od-timeline-time">
                      {new Date(step.time).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 订单信息 */}
      <div className="od-card">
        <h4 className="od-card-title">订单信息</h4>
        <div className="od-info-row">
          <span className="od-info-label">订单号</span>
          <span className="od-info-value">{order.order_no}</span>
        </div>
        <div className="od-info-row">
          <span className="od-info-label">下单时间</span>
          <span className="od-info-value">{new Date(order.created_at).toLocaleString('zh-CN')}</span>
        </div>
      </div>

      {/* 底部操作 */}
      {(order.status === 'pending' || order.status === 'paid') && (
        <div className="od-bottom-bar">
          {order.status === 'pending' && (
            <>
              <button className="od-btn od-btn-cancel" onClick={handleCancel}>取消订单</button>
              <button className="od-btn od-btn-pay" onClick={() => navigate(`/pay/${order.id}`)}>去支付</button>
            </>
          )}
          {order.status === 'paid' && (
            <button className="od-btn od-btn-cancel" onClick={handleCancel}>取消订单</button>
          )}
          {order.hotel_phone && (
            <a className="od-btn od-btn-call" href={`tel:${order.hotel_phone}`}>
              <PhoneFill /> 联系酒店
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default OrderDetail
