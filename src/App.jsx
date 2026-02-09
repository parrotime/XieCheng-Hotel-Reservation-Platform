import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// 移动端页面
import HomePage from './pages/mobile/HomePage'
import HotelList from './pages/mobile/HotelList'
import HotelDetail from './pages/mobile/HotelDetail'

// PC端页面
import Login from './pages/pc/Login'
import HotelManage from './pages/pc/HotelManage'
import HotelAudit from './pages/pc/HotelAudit'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1>易宿酒店预订平台 🏨</h1>
        
        {/* 移除测试导航，让每个页面独立管理自己的导航 */}

        {/* 路由配置 */}
        <Routes>
            {/* 移动端路由 - 默认首页 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/list" element={<HotelList />} />
            <Route path="/detail/:id" element={<HotelDetail />} />
            
            {/* PC端路由 */}
            <Route path="/login" element={<Login />} />
            <Route path="/manage" element={<HotelManage />} />
            <Route path="/audit" element={<HotelAudit />} />
            
            {/* 404 重定向到首页 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App