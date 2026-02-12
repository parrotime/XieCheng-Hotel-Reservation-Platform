import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './LoginExpiredModal.css'

function LoginExpiredModal() {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  const handleExpired = useCallback(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [handleExpired])

  if (!visible) return null

  const handleLogin = () => {
    setVisible(false)
    navigate('/login')
  }

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <div className="lem-overlay" onClick={handleClose}>
      <div className="lem-modal" onClick={e => e.stopPropagation()}>
        <div className="lem-icon">🔒</div>
        <h3 className="lem-title">登录已过期</h3>
        <p className="lem-desc">您的登录状态已失效，请重新登录</p>
        <div className="lem-actions">
          <button className="lem-btn lem-btn-ghost" onClick={handleClose}>稍后再说</button>
          <button className="lem-btn lem-btn-primary" onClick={handleLogin}>重新登录</button>
        </div>
      </div>
    </div>
  )
}

export default LoginExpiredModal
