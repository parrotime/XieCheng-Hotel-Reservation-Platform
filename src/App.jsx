import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// 全局组件（首屏必需，同步加载）
import LoginExpiredModal from './components/LoginExpiredModal'
import { DateRangeProvider } from './hooks/useDateRange.jsx'
import MobileLayout from './components/MobileLayout'
import ErrorBoundary from './components/ErrorBoundary'

// 路由级懒加载 — 按需加载，减小首屏 bundle
const HomePage = React.lazy(() => import('./pages/mobile/HomePage'))
const HotelList = React.lazy(() => import('./pages/mobile/HotelList'))
const HotelDetail = React.lazy(() => import('./pages/mobile/HotelDetail'))
const CitySelect = React.lazy(() => import('./pages/mobile/CitySelect'))
const OrdersPage = React.lazy(() => import('./pages/mobile/OrdersPage'))
const ProfilePage = React.lazy(() => import('./pages/mobile/ProfilePage'))
const PayPage = React.lazy(() => import('./pages/mobile/PayPage'))
const PaySuccess = React.lazy(() => import('./pages/mobile/PaySuccess'))
const OrderDetail = React.lazy(() => import('./pages/mobile/OrderDetail'))

const Login = React.lazy(() => import('./pages/pc/Login'))
const HotelManage = React.lazy(() => import('./pages/pc/HotelManage'))
const HotelAudit = React.lazy(() => import('./pages/pc/HotelAudit'))

// 开发者页面（仅开发环境）
const DevDashboard = import.meta.env.DEV
  ? React.lazy(() => import('./pages/pc/DevDashboard'))
  : null

// 路由加载占位
const PageLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#999' }}>
    加载中...
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <DateRangeProvider>
      <LoginExpiredModal />
      <ErrorBoundary>
      <div className="App">
        <Suspense fallback={<PageLoading />}>
        {/* 路由配置 */}
        <Routes>
            {/* 移动端路由 - 带底部 TabBar */}
            <Route element={<MobileLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/list" element={<HotelList />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* 移动端子页面 - 不带 TabBar */}
            <Route path="/detail/:id" element={<HotelDetail />} />
            <Route path="/city-select" element={<CitySelect />} />
            <Route path="/pay/:id" element={<PayPage />} />
            <Route path="/pay-success" element={<PaySuccess />} />
            <Route path="/order/:id" element={<OrderDetail />} />

            {/* PC端路由 */}
            <Route path="/login" element={<Login />} />
            <Route path="/manage" element={<HotelManage />} />
            <Route path="/audit" element={<HotelAudit />} />

            {/* 开发者路由（仅开发环境） */}
            {DevDashboard && (
              <Route path="/dev" element={<DevDashboard />} />
            )}

            {/* 404 重定向到首页 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </div>
      </ErrorBoundary>
      </DateRangeProvider>
    </BrowserRouter>
  )
}

export default App