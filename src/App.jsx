import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// 移动端布局
import MobileLayout from './components/MobileLayout'

// 移动端页面
import HomePage from './pages/mobile/HomePage'
import HotelList from './pages/mobile/HotelList'
import HotelDetail from './pages/mobile/HotelDetail'
import CitySelect from './pages/mobile/CitySelect'
import OrdersPage from './pages/mobile/OrdersPage'
import ProfilePage from './pages/mobile/ProfilePage'
import PayPage from './pages/mobile/PayPage'

// PC端页面
import Login from './pages/pc/Login'
import HotelManage from './pages/pc/HotelManage'
import HotelAudit from './pages/pc/HotelAudit'

// 开发者页面（仅开发环境）
const DevDashboard = import.meta.env.DEV
  ? React.lazy(() => import('./pages/pc/DevDashboard'))
  : null

function App() {
  return (
    <BrowserRouter>
      <div className="App">
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
            
            {/* PC端路由 */}
            <Route path="/login" element={<Login />} />
            <Route path="/manage" element={<HotelManage />} />
            <Route path="/audit" element={<HotelAudit />} />

            {/* 开发者路由（仅开发环境） */}
            {DevDashboard && (
              <Route path="/dev" element={
                <Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}>加载中...</div>}>
                  <DevDashboard />
                </Suspense>
              } />
            )}
            
            {/* 404 重定向到首页 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App