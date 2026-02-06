import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
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
        
        {/* 导航菜单 - 方便测试 */}
        <nav style={{ margin: '20px', padding: '10px', background: '#f0f0f0' }}>
          <h3>移动端页面：</h3>
          <Link to="/" style={{ margin: '0 10px' }}>首页</Link>
          <Link to="/list" style={{ margin: '0 10px' }}>列表</Link>
          <Link to="/detail/1" style={{ margin: '0 10px' }}>详情</Link>
          
          <h3>PC端页面：</h3>
          <Link to="/login" style={{ margin: '0 10px' }}>登录</Link>
          <Link to="/manage" style={{ margin: '0 10px' }}>管理</Link>
          <Link to="/audit" style={{ margin: '0 10px' }}>审核</Link>
        </nav>

        {/* 路由配置 */}
        <Routes>
          {/* 移动端路由 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/list" element={<HotelList />} />
          <Route path="/detail/:id" element={<HotelDetail />} />
          
          {/* PC端路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/manage" element={<HotelManage />} />
          <Route path="/audit" element={<HotelAudit />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App