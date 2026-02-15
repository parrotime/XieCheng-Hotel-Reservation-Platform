import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar, Tabs, Empty, Toast, PullToRefresh, InfiniteScroll } from 'antd-mobile'
import { useUser } from '../../hooks/useUser'
import { usePagination } from '../../hooks/usePagination'
import { getOrders, cancelOrder } from '../../api/orders'
import './OrdersPage.css'

const STATUS_MAP = {
  pending: { label: '待支付', color: '#ff6b35' },
  paid: { label: '已支付', color: '#1677ff' },
  cancelled: { label: '已取消', color: '#999' },
  checked_in: { label: '已入住', color: '#52c41a' },
  completed: { label: '已完成', color: '#52c41a' },
}

const TABS = [
  { key: 'all', title: '全部' },
  { key: 'pending', title: '待支付' },
  { key: 'paid', title: '已支付' },
  { key: 'completed', title: '已完成' },
]

function OrdersPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useUser()
  const [activeTab, setActiveTab] = useState('all')

  const extraParams = useMemo(
    () => ({ status: activeTab === 'all' ? undefined : activeTab }),
    [activeTab]
  )

  const fetchFn = useCallback((params) => getOrders(params), [])

  const { list: orders, loading, hasMore, loadMore, refresh } = usePagination(fetchFn, {
    pageSize: 10,
    extraParams,
  })

  // 切换 tab 或首次加载时刷新
  useEffect(() => {
    if (isLoggedIn) refresh()
  }, [activeTab, isLoggedIn, refresh])

  const handleCancel = async (orderId) => {
    try {
      await cancelOrder(orderId)
      Toast.show({ content: '订单已取消' })
      refresh()
    } catch (err) {
      Toast.show({ icon: 'fail', content: err.message || '取消失败' })
    }
  }

  const handlePay = (orderId) => {
    navigate(`/pay/${orderId}`)
  }

  return (
    <div className="orders-page">
      <NavBar backArrow={false}>我的订单</NavBar>

      {!isLoggedIn ? (
        <div className="orders-empty">
          <Empty description="请先登录" />
          <button className="orders-login-btn" onClick={() => navigate('/login')}>
            去登录
          </button>
        </div>
      ) : (
        <>
          <Tabs activeKey={activeTab} onChange={setActiveTab} className="orders-tabs">
            {TABS.map(tab => (
              <Tabs.Tab key={tab.key} title={tab.title} />
            ))}
          </Tabs>

          <PullToRefresh onRefresh={refresh}>
            <div className="orders-list">
              {loading && orders.length === 0 ? (
                <div className="orders-loading">加载中...</div>
              ) : orders.length === 0 ? (
                <div className="orders-empty">
                  <Empty description="暂无订单" />
                  <p className="orders-tip">预订酒店后，订单会显示在这里</p>
                </div>
              ) : (
                <>
                  {orders.map(order => (
                    <div key={order.id} className="order-card" onClick={() => {
                      if (order.status === 'pending') {
                        navigate(`/pay/${order.id}`)
                      } else {
                        navigate(`/order/${order.id}`)
                      }
                    }}>
                      <div className="order-card-header">
                        <span className="order-hotel-name">{order.hotel_name}</span>
                        <span className="order-status" style={{ color: STATUS_MAP[order.status]?.color }}>
                          {STATUS_MAP[order.status]?.label || order.status}
                        </span>
                      </div>

                      <div className="order-card-body">
                        <div className="order-room-info">
                          <span className="order-room-name">{order.room_name}</span>
                          <span className="order-dates">
                            {order.check_in?.slice(0, 10)} → {order.check_out?.slice(0, 10)}
                          </span>
                          <span className="order-nights">{order.nights}晚</span>
                        </div>
                        <div className="order-price">
                          <span className="order-price-symbol">¥</span>
                          <span className="order-price-value">{Number(order.total_price).toFixed(0)}</span>
                        </div>
                      </div>

                      <div className="order-card-footer">
                        <span className="order-no">订单号：{order.order_no}</span>
                        <div className="order-actions" onClick={e => e.stopPropagation()}>
                          {order.status === 'pending' && (
                            <>
                              <button className="order-btn order-btn-cancel" onClick={() => handleCancel(order.id)}>
                                取消
                              </button>
                              <button className="order-btn order-btn-pay" onClick={() => handlePay(order.id)}>
                                去支付
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
                </>
              )}
            </div>
          </PullToRefresh>
        </>
      )}
    </div>
  )
}

export default OrdersPage
