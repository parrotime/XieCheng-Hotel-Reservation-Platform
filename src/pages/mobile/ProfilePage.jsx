import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar, List, Avatar, Toast, Dialog, Tag } from 'antd-mobile'
import {
  SetOutline,
  UserOutline,
  FileOutline,
  RightOutline,
} from 'antd-mobile-icons'
import { useUser } from '../../hooks/useUser'
import { getOrders } from '../../api/orders'
import './ProfilePage.css'

const ROLE_MAP = {
  guest: { label: '普通用户', color: '#1677ff' },
  hotel_admin: { label: '酒店管理员', color: '#ff6b35' },
  system_admin: { label: '系统管理员', color: '#e02020' },
  staff: { label: '员工', color: '#52c41a' },
  developer: { label: '开发者', color: '#722ed1' },
}

function ProfilePage() {
  const navigate = useNavigate()
  const { userInfo, isLoggedIn, logout } = useUser()
  const [orderStats, setOrderStats] = useState({ pending: 0, paid: 0, completed: 0, total: 0 })

  useEffect(() => {
    if (!isLoggedIn) return

    async function fetchStats() {
      try {
        const [all, pending, paid, completed] = await Promise.all([
          getOrders({ page: 1, limit: 1 }),
          getOrders({ status: 'pending', page: 1, limit: 1 }),
          getOrders({ status: 'paid', page: 1, limit: 1 }),
          getOrders({ status: 'completed', page: 1, limit: 1 }),
        ])
        setOrderStats({
          total: all.total || 0,
          pending: pending.total || 0,
          paid: paid.total || 0,
          completed: completed.total || 0,
        })
      } catch {
        // 静默失败
      }
    }
    fetchStats()
  }, [isLoggedIn])

  const handleLogout = async () => {
    const confirmed = await Dialog.confirm({
      content: '确定要退出登录吗？',
    })
    if (confirmed) {
      logout()
      Toast.show({ content: '已退出登录' })
      navigate('/login')
    }
  }

  // 未登录状态
  if (!isLoggedIn) {
    return (
      <div className="profile-page">
        <NavBar backArrow={false}>我的</NavBar>
        <div className="profile-header" onClick={() => navigate('/login')}>
          <Avatar
            src=""
            style={{ '--size': '64px', '--border-radius': '50%' }}
          />
          <div className="profile-info">
            <div className="profile-name">未登录</div>
            <div className="profile-desc">点击登录，享受更多服务 <RightOutline /></div>
          </div>
        </div>
      </div>
    )
  }

  const roleInfo = ROLE_MAP[userInfo?.role] || ROLE_MAP.guest

  return (
    <div className="profile-page">
      <NavBar backArrow={false}>我的</NavBar>

      {/* 用户信息头部 */}
      <div className="profile-header">
        <Avatar
          src=""
          style={{ '--size': '64px', '--border-radius': '50%', '--background': '#1677ff' }}
        />
        <div className="profile-info">
          <div className="profile-name">
            {userInfo?.full_name || userInfo?.username || '用户'}
            <Tag color={roleInfo.color} fill="outline" className="profile-role-tag">
              {roleInfo.label}
            </Tag>
          </div>
          <div className="profile-desc">{userInfo?.email || ''}</div>
          {userInfo?.phone && <div className="profile-desc">{userInfo.phone}</div>}
        </div>
      </div>

      {/* 订单统计 */}
      <div className="profile-order-stats" onClick={() => navigate('/orders')}>
        <div className="profile-order-stats-title">
          <span>我的订单</span>
          <span className="profile-order-stats-link">查看全部 <RightOutline fontSize={12} /></span>
        </div>
        <div className="profile-order-stats-grid">
          <div className="profile-stat-item" onClick={(e) => { e.stopPropagation(); navigate('/orders') }}>
            <span className="profile-stat-num">{orderStats.total}</span>
            <span className="profile-stat-label">全部</span>
          </div>
          <div className="profile-stat-item" onClick={(e) => { e.stopPropagation(); navigate('/orders') }}>
            <span className="profile-stat-num" style={{ color: '#ff6b35' }}>{orderStats.pending}</span>
            <span className="profile-stat-label">待支付</span>
          </div>
          <div className="profile-stat-item" onClick={(e) => { e.stopPropagation(); navigate('/orders') }}>
            <span className="profile-stat-num" style={{ color: '#1677ff' }}>{orderStats.paid}</span>
            <span className="profile-stat-label">已支付</span>
          </div>
          <div className="profile-stat-item" onClick={(e) => { e.stopPropagation(); navigate('/orders') }}>
            <span className="profile-stat-num" style={{ color: '#52c41a' }}>{orderStats.completed}</span>
            <span className="profile-stat-label">已完成</span>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <List className="profile-menu">
        <List.Item prefix={<UserOutline />} onClick={() => {}}>
          个人信息
        </List.Item>
        <List.Item prefix={<FileOutline />} onClick={() => navigate('/orders')}>
          我的订单
        </List.Item>
        <List.Item prefix={<SetOutline />} onClick={() => {}}>
          设置
        </List.Item>
      </List>

      {/* 退出登录 */}
      <div className="profile-logout" onClick={handleLogout}>
        退出登录
      </div>
    </div>
  )
}

export default ProfilePage
