import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, Card, Button, message, Tag, Spin } from 'antd'
import {
  MobileOutlined,
  DesktopOutlined,
  UserSwitchOutlined,
  DatabaseOutlined,
  ReloadOutlined,

} from '@ant-design/icons'
import { getDevStats, impersonate } from '../../api/dev'
import PageHeader from '../../components/PageHeader'
import './DevDashboard.css'

const { Content } = Layout

// 预设测试账号
const TEST_ACCOUNTS = [
  { username: 'dev', role: 'developer', label: '开发者', color: 'purple' },
  { username: 'admin', role: 'system_admin', label: '管理员', color: 'red' },
  { username: 'merchant', role: 'hotel_admin', label: '商户', color: 'blue' },
  { username: 'guest', role: 'guest', label: '旅客', color: 'green' },
]

export default function DevDashboard() {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [switching, setSwitching] = useState(false)

  // 进入页面时：尝试恢复 dev 凭证
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null')
    const token = localStorage.getItem('token')

    if (token && user?.role === 'developer') {
      // 当前就是 dev 身份，直接用
      setUserInfo(user)
      return
    }

    // 当前不是 dev，尝试从备份恢复
    const devToken = localStorage.getItem('devToken')
    const devUser = JSON.parse(localStorage.getItem('devUserInfo') || 'null')

    if (devToken && devUser) {
      localStorage.setItem('token', devToken)
      localStorage.setItem('userInfo', JSON.stringify(devUser))
      setUserInfo(devUser)
      return
    }

    // 都没有，跳登录
    message.error('请先登录开发者账号')
    navigate('/login')
  }, [navigate])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await getDevStats()
      setStats(data)
    } catch (err) {
      message.error('加载统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userInfo) loadStats()
  }, [userInfo])

  // 快速切换角色：通过 impersonate 接口直接签发 token
  const handleSwitchRole = async (account) => {
    setSwitching(true)
    try {
      // 备份当前 dev 凭证（切换前保存）
      const curUser = JSON.parse(localStorage.getItem('userInfo') || 'null')
      if (curUser?.role === 'developer') {
        localStorage.setItem('devToken', localStorage.getItem('token'))
        localStorage.setItem('devUserInfo', localStorage.getItem('userInfo'))
      }

      // 如果切回 dev，直接从备份恢复，不需要调接口
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
      message.success(`已切换为 ${account.label}（${account.username}）`)

      if (account.role === 'system_admin') navigate('/audit')
      else if (account.role === 'hotel_admin') navigate('/manage')
      else navigate('/')
    } catch (err) {
      message.error('切换失败: ' + err.message)
    } finally {
      setSwitching(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('devToken')
    localStorage.removeItem('devUserInfo')
    message.success('已退出登录')
    navigate('/login')
  }

  return (
    <Layout className="dev-page">
      <PageHeader
        title="Dev Dashboard"
        roleLabel="开发者"
        username={userInfo?.username}
        onLogout={handleLogout}
        className="dev-header"
      />

      <Content className="dev-content">
        {/* 数据库统计 */}
        <Card
          title={<span><DatabaseOutlined /> 数据库概览</span>}
          extra={<Button icon={<ReloadOutlined />} onClick={loadStats} loading={loading}>刷新</Button>}
          style={{ marginBottom: 24 }}
        >
          {loading && !stats ? <Spin /> : stats && (
            <>
              <div className="dev-stats">
                <StatCard label="酒店" value={stats.hotels.total} color="#1890ff" />
                <StatCard label="用户" value={stats.users.total} color="#52c41a" />
                <StatCard label="订单" value={stats.orders.total} color="#fa8c16" />
                <StatCard label="房间" value={stats.rooms.total} color="#722ed1" />
                <StatCard label="评价" value={stats.reviews.total} color="#eb2f96" />
              </div>
              <div className="sub-stats">
                {stats.hotels.approved > 0 && <div className="sub-stat-item">已上线酒店<span>{stats.hotels.approved}</span></div>}
                {stats.hotels.pending > 0 && <div className="sub-stat-item">待审核酒店<span>{stats.hotels.pending}</span></div>}
                {stats.users.by_role && Object.entries(stats.users.by_role).map(([role, cnt]) => (
                  <div key={role} className="sub-stat-item">{role}<span>{cnt}</span></div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* 快速切换角色 */}
        <Card
          title={<span><UserSwitchOutlined /> 快速切换角色</span>}
          style={{ marginBottom: 24 }}
        >
          <div className="role-switch-buttons">
            {TEST_ACCOUNTS.map(account => (
              <Button
                key={account.username}
                type={userInfo?.role === account.role ? 'primary' : 'default'}
                loading={switching}
                onClick={() => handleSwitchRole(account)}
              >
                <Tag color={account.color} style={{ marginRight: 4 }}>{account.label}</Tag>
                {account.username}
              </Button>
            ))}
          </div>
          <div style={{ marginTop: 12, color: '#999', fontSize: 13 }}>
            密码均为 123456，开发者可直接切换身份，无需密码
          </div>
        </Card>

        {/* 页面入口 */}
        <Card title="页面导航" style={{ marginBottom: 24 }}>
          <div className="route-group">
            <h4><MobileOutlined /> 移动端</h4>
            <div className="route-links">
              <a href="/" className="dev-route-link">首页 /</a>
              <a href="/list" className="dev-route-link">酒店列表 /list</a>
              <a href="/detail/1" className="dev-route-link">酒店详情 /detail/:id</a>
              <a href="/city-select" className="dev-route-link">城市选择 /city-select</a>
            </div>
          </div>
          <div className="route-group">
            <h4><DesktopOutlined /> PC 端</h4>
            <div className="route-links">
              <a href="/login" className="dev-route-link">登录 /login</a>
              <a href="/manage" className="dev-route-link">酒店管理 /manage</a>
              <a href="/audit" className="dev-route-link">酒店审核 /audit</a>
              <a href="/dev" className="dev-route-link">开发者面板 /dev</a>
            </div>
          </div>
        </Card>

        {/* API 文档入口 */}
        <Card title="API 文档" style={{ marginBottom: 24 }}>
          <Button
            type="dashed"
            href="http://localhost:3000/api-docs"
            target="_blank"
            disabled
          >
            Swagger UI（尚未集成）
          </Button>
          <span style={{ marginLeft: 12, color: '#999', fontSize: 13 }}>
            后续可通过 swagger-jsdoc + swagger-ui-express 集成
          </span>
        </Card>
      </Content>
    </Layout>
  )
}

function StatCard({ label, value, color }) {
  return (
    <Card className="dev-stat-card" size="small">
      <div className="dev-stat-value" style={{ color }}>{value}</div>
      <div className="dev-stat-label">{label}</div>
    </Card>
  )
}
