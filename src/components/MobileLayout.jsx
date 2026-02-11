import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { TabBar } from 'antd-mobile'
import {
  AppOutline,
  SearchOutline,
  FileOutline,
  UserOutline,
} from 'antd-mobile-icons'
import './MobileLayout.css'

const tabs = [
  { key: '/', title: '首页', icon: <AppOutline /> },
  { key: '/list', title: '搜索', icon: <SearchOutline /> },
  { key: '/orders', title: '订单', icon: <FileOutline /> },
  { key: '/profile', title: '我的', icon: <UserOutline /> },
]

function MobileLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeKey = tabs.find(t => t.key === location.pathname)?.key || '/'

  return (
    <div className="mobile-layout">
      <div className="mobile-content">
        <Outlet />
      </div>
      <div className="mobile-tabbar">
        <TabBar
          activeKey={activeKey}
          onChange={key => navigate(key)}
        >
          {tabs.map(tab => (
            <TabBar.Item
              key={tab.key}
              icon={tab.icon}
              title={tab.title}
            />
          ))}
        </TabBar>
      </div>
    </div>
  )
}

export default MobileLayout
