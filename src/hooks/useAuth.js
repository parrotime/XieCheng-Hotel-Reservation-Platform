import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'

/**
 * PC 端页面鉴权 Hook
 * 检查 localStorage 中的用户信息，不符合角色要求则跳转登录页
 * @param {string} requiredRole - 要求的角色：'merchant' 或 'admin'
 * @param {string} errorMessage - 鉴权失败时的提示信息
 * @returns {{ userInfo: Object|null, handleLogout: Function }}
 */
export function useAuth(requiredRole, errorMessage) {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null')
    if (!user || user.role !== requiredRole) {
      message.error(errorMessage)
      navigate('/login')
      return
    }
    setUserInfo(user)
  }, [navigate, requiredRole, errorMessage])

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    message.success('已退出登录')
    navigate('/login')
  }

  return { userInfo, handleLogout }
}
