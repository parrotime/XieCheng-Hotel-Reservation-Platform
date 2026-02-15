import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'

/**
 * PC 端页面鉴权 Hook
 * 检查 localStorage 中的 JWT token 和用户信息
 * @param {string} requiredRole - 要求的角色：'hotel_admin' 或 'system_admin'
 * @param {string} errorMessage - 鉴权失败时的提示信息
 * @returns {{ userInfo: Object|null, handleLogout: Function }}
 */
export function useAuth(requiredRole, errorMessage) {
  const navigate = useNavigate()
  const [userInfo] = useState(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null')
    if (token && user && (user.role === requiredRole || user.role === 'developer')) {
      return user
    }
    return null
  })

  useEffect(() => {
    if (!userInfo) {
      message.error(errorMessage)
      navigate('/login')
    }
  }, [userInfo, navigate, errorMessage])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    message.success('已退出登录')
    navigate('/login')
  }

  return { userInfo, handleLogout }
}
