import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDevStats, impersonate } from '../../api/dev'
import { getAdminUsers, getAdminOrders, getAdminReviews } from '../../api/admin'
import './DevDashboard.css'

const orderStatusMap = {
  pending: '待支付', paid: '已支付', checked_in: '已入住',
  completed: '已完成', cancelled: '已取消',
}

const TEST_ACCOUNTS = [
  { username: 'dev',      role: 'developer',    label: '开发者', color: '#13c2c2' },
  { username: 'admin',    role: 'system_admin',  label: '管理员', color: '#eb2f96' },
  { username: 'merchant', role: 'hotel_admin',   label: '商户',   color: '#722ed1' },
  { username: 'guest',    role: 'guest',         label: '旅客',   color: '#52c41a' },
]

export default function DevDashboard() {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [switching, setSwitching] = useState(false)

  // 详情弹窗
  const [detailType, setDetailType] = useState(null)
  const [detailData, setDetailData] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)

  // 鉴权：恢复 dev 凭证
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null')
    const token = localStorage.getItem('token')

    if (token && user?.role === 'developer') {
      setUserInfo(user)
      return
    }
    const devToken = localStorage.getItem('devToken')
    const devUser = JSON.parse(localStorage.getItem('devUserInfo') || 'null')
    if (devToken && devUser) {
      localStorage.setItem('token', devToken)
      localStorage.setItem('userInfo', JSON.stringify(devUser))
      setUserInfo(devUser)
      return
    }
    alert('请先登录开发者账号')
    navigate('/login')
  }, [navigate])

  // 加载统计
  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDevStats()
      setStats(data)
    } catch {
      console.error('加载统计失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userInfo) loadStats()
  }, [userInfo, loadStats])

  // 角色切换
  const handleSwitchRole = async (account) => {
    setSwitching(true)
    try {
      const curUser = JSON.parse(localStorage.getItem('userInfo') || 'null')
      if (curUser?.role === 'developer') {
        localStorage.setItem('devToken', localStorage.getItem('token'))
        localStorage.setItem('devUserInfo', localStorage.getItem('userInfo'))
      }
      if (account.role === 'developer') {
        const devToken = localStorage.getItem('devToken')
        const devUser = localStorage.getItem('devUserInfo')
        if (devToken && devUser) {
          localStorage.setItem('token', devToken)
          localStorage.setItem('userInfo', devUser)
        }
        navigate(0)
        return
      }
      const data = await impersonate(account.username)
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(data.user))

      if (account.role === 'system_admin') navigate('/audit')
      else if (account.role === 'hotel_admin') navigate('/manage')
      else navigate('/')
    } catch (err) {
      alert('切换失败: ' + err.message)
    } finally {
      setSwitching(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('devToken')
    localStorage.removeItem('devUserInfo')
    navigate('/login')
  }

  // 点击面板 → 加载详情
  const openDetail = async (type) => {
    setDetailType(type)
    setDetailLoading(true)
    setDetailData([])
    try {
      let data
      if (type === 'users') data = await getAdminUsers('all')
      else if (type === 'merchants') data = await getAdminUsers('hotel_admin')
      else if (type === 'admins') data = await getAdminUsers('system_admin')
      else if (type === 'orders') data = await getAdminOrders('all')
      else if (type === 'reviews') data = await getAdminReviews()
      else data = []
      setDetailData(data)
    } catch {
      console.error('加载详情失败')
    } finally {
      setDetailLoading(false)
    }
  }
  const closeDetail = () => { setDetailType(null); setDetailData([]) }

  const detailTitles = {
    users: '全部用户', merchants: '商户列表', admins: '管理员列表',
    orders: '全部订单', reviews: '全部评价',
  }

  if (!userInfo) return null

  const statCards = stats ? [
    { key: 'users',     label: '用户总数',   value: stats.users.total,   color: '#1890ff', icon: '👥' },
    { key: 'merchants', label: '商户人数',   value: stats.users.by_role?.hotel_admin || 0, color: '#722ed1', icon: '🏪' },
    { key: 'admins',    label: '管理员人数', value: stats.users.by_role?.system_admin || 0, color: '#eb2f96', icon: '🛡️' },
    { key: 'orders',    label: '订单总数',   value: stats.orders.total,  color: '#fa8c16', icon: '📋' },
    { key: 'reviews',   label: '评价总数',   value: stats.reviews.total, color: '#13c2c2', icon: '💬' },
  ] : []

  return (
    <div className="dev-page">
      {/* 顶栏 */}
      <div className="dev-header">
        <div className="dev-header-left">
          <span className="dev-header-user">开发者：{userInfo.username}</span>
          <button className="dev-header-logout" onClick={handleLogout}>退出登录</button>
        </div>
        <h2>Dev Dashboard</h2>
      </div>

      <div className="dev-content">
        {/* ===== 数据库概览 ===== */}
        <div className="dev-section">
          <div className="dev-section-head">
            <h3>📊 数据库概览</h3>
            <button className="dev-refresh-btn" onClick={loadStats} disabled={loading}>
              {loading ? '刷新中...' : '↻ 刷新'}
            </button>
          </div>

          {loading && !stats ? (
            <div className="dev-loading">加载中...</div>
          ) : stats ? (
            <>
              <div className="dev-stat-cards">
                {statCards.map(c => (
                  <div
                    key={c.key}
                    className="dev-stat-card"
                    style={{ borderTopColor: c.color }}
                    onClick={() => openDetail(c.key)}
                  >
                    <div className="dev-stat-icon">{c.icon}</div>
                    <div className="dev-stat-value" style={{ color: c.color }}>{c.value}</div>
                    <div className="dev-stat-label">{c.label}</div>
                    <div className="dev-stat-hint">点击查看详情 →</div>
                  </div>
                ))}
              </div>

              {/* 酒店状态 */}
              <div className="dev-sub-stats">
                <span className="dev-sub-title">酒店状态：</span>
                <span className="dev-sub-item">总计 <strong>{stats.hotels.total}</strong></span>
                {stats.hotels.approved > 0 && <span className="dev-sub-item" style={{ color: '#52c41a' }}>已上线 <strong>{stats.hotels.approved}</strong></span>}
                {stats.hotels.pending > 0 && <span className="dev-sub-item" style={{ color: '#fa8c16' }}>待审核 <strong>{stats.hotels.pending}</strong></span>}
                {stats.hotels.rejected > 0 && <span className="dev-sub-item" style={{ color: '#f5222d' }}>已拒绝 <strong>{stats.hotels.rejected}</strong></span>}
                {stats.hotels.offline > 0 && <span className="dev-sub-item" style={{ color: '#8c8c8c' }}>已下线 <strong>{stats.hotels.offline}</strong></span>}
              </div>

              {/* 订单状态 */}
              {stats.orders.by_status && (
                <div className="dev-sub-stats">
                  <span className="dev-sub-title">订单状态：</span>
                  {Object.entries(stats.orders.by_status).map(([s, cnt]) => (
                    <span key={s} className="dev-sub-item">{orderStatusMap[s] || s} <strong>{cnt}</strong></span>
                  ))}
                </div>
              )}

              {/* 用户角色 */}
              {stats.users.by_role && (
                <div className="dev-sub-stats">
                  <span className="dev-sub-title">用户角色：</span>
                  {Object.entries(stats.users.by_role).map(([role, cnt]) => (
                    <span key={role} className="dev-sub-item">{
                      { guest: '旅客', hotel_admin: '商户', system_admin: '管理员', staff: '前台', developer: '开发者' }[role] || role
                    } <strong>{cnt}</strong></span>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* ===== 快速切换角色 ===== */}
        <div className="dev-section">
          <h3>🔄 快速切换角色</h3>
          <div className="dev-role-buttons">
            {TEST_ACCOUNTS.map(acc => (
              <button
                key={acc.username}
                className={`dev-role-btn ${userInfo?.role === acc.role ? 'active' : ''}`}
                style={{ '--btn-color': acc.color }}
                disabled={switching}
                onClick={() => handleSwitchRole(acc)}
              >
                <span className="dev-role-tag" style={{ background: acc.color }}>{acc.label}</span>
                {acc.username}
              </button>
            ))}
          </div>
          <div className="dev-role-hint">密码均为 123456，开发者可直接切换身份，无需密码</div>
        </div>

        {/* ===== 页面导航 ===== */}
        <div className="dev-section">
          <h3>🧭 页面导航</h3>
          <div className="dev-nav-group">
            <h4>📱 移动端</h4>
            <div className="dev-nav-links">
              <a href="/">首页 /</a>
              <a href="/list">酒店列表 /list</a>
              <a href="/detail/1">酒店详情 /detail/:id</a>
              <a href="/city-select">城市选择 /city-select</a>
              <a href="/orders">我的订单 /orders</a>
              <a href="/profile">我的 /profile</a>
            </div>
          </div>
          <div className="dev-nav-group">
            <h4>🖥️ PC 端</h4>
            <div className="dev-nav-links">
              <a href="/login">登录 /login</a>
              <a href="/manage">商户管理 /manage</a>
              <a href="/audit">酒店审核 /audit</a>
              <a href="/dev">开发者面板 /dev</a>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 详情弹窗 ===== */}
      {detailType && (
        <div className="dev-modal-overlay" onClick={closeDetail}>
          <div className="dev-modal" onClick={e => e.stopPropagation()}>
            <div className="dev-modal-header">
              <h2>{detailTitles[detailType] || '详情'}</h2>
              <button className="dev-modal-close" onClick={closeDetail}>×</button>
            </div>
            <div className="dev-modal-body">
              {detailLoading ? (
                <div className="dev-loading">加载中...</div>
              ) : detailData.length === 0 ? (
                <div className="dev-loading">暂无数据</div>
              ) : (
                <>
                  {/* 用户表格 */}
                  {(detailType === 'users' || detailType === 'merchants' || detailType === 'admins') && (
                    <table className="dev-detail-table">
                      <thead>
                        <tr>
                          <th>用户名</th><th>姓名</th><th>角色</th><th>邮箱</th><th>电话</th><th>订单数</th><th>注册时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.map(u => (
                          <tr key={u.id}>
                            <td>{u.username}</td>
                            <td>{u.full_name || '-'}</td>
                            <td><span className={`dev-role-label role-${u.role}`}>{
                              { guest: '旅客', hotel_admin: '商户', system_admin: '管理员', staff: '前台', developer: '开发者' }[u.role] || u.role
                            }</span></td>
                            <td>{u.email}</td>
                            <td>{u.phone || '-'}</td>
                            <td>{u.order_count}</td>
                            <td>{u.created_at ? new Date(u.created_at).toLocaleString('zh-CN') : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* 订单表格 */}
                  {detailType === 'orders' && (
                    <table className="dev-detail-table">
                      <thead>
                        <tr>
                          <th>订单号</th><th>用户</th><th>酒店</th><th>房型</th><th>入住</th><th>离店</th><th>金额</th><th>状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.map(o => (
                          <tr key={o.id}>
                            <td className="mono">{o.order_no}</td>
                            <td>{o.user_name}</td>
                            <td>{o.hotel_name}</td>
                            <td>{o.room_type_name || '-'}</td>
                            <td>{o.check_in?.slice(0, 10)}</td>
                            <td>{o.check_out?.slice(0, 10)}</td>
                            <td className="price">¥{o.total_price}</td>
                            <td><span className={`dev-status status-${o.status}`}>{orderStatusMap[o.status] || o.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* 评价列表 */}
                  {detailType === 'reviews' && (
                    <div className="dev-reviews">
                      {detailData.map(r => (
                        <div key={r.id} className="dev-review-item">
                          <div className="dev-review-head">
                            <span className="dev-review-user">{r.user_full_name || r.user_name}</span>
                            <span className="dev-review-hotel">{r.hotel_name}</span>
                            <span className="dev-review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                            <span className="dev-review-time">{r.created_at ? new Date(r.created_at).toLocaleString('zh-CN') : ''}</span>
                          </div>
                          <div className="dev-review-content">{r.content}</div>
                          {r.reply_content && (
                            <div className="dev-review-reply"><span className="reply-tag">酒店回复：</span>{r.reply_content}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="dev-modal-footer">
              <button className="dev-btn-close" onClick={closeDetail}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
