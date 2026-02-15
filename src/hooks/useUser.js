import { useState, useCallback } from 'react'

/**
 * 通用用户状态 Hook
 * 集中管理 localStorage 中的 token / userInfo，消除各页面散落的读写
 * @returns {{ token, userInfo, isLoggedIn, login, logout }}
 */
export function useUser() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || 'null')
    } catch {
      return null
    }
  })

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('userInfo', JSON.stringify(newUser))
    setToken(newToken)
    setUserInfo(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    setToken(null)
    setUserInfo(null)
  }, [])

  return {
    token,
    userInfo,
    isLoggedIn: !!token,
    login,
    logout,
  }
}
