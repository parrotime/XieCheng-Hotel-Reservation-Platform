import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi, register as registerApi } from '../../api/auth'
import './Login.css'

// 前端角色 → 后端角色映射
const roleMap = { merchant: 'hotel_admin', admin: 'system_admin' }

function Login() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success'|'error', text }

  // 登录表单
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginErrors, setLoginErrors] = useState({})
  const [showLoginPwd, setShowLoginPwd] = useState(false)

  // 注册表单
  const [regForm, setRegForm] = useState({
    role: 'merchant', username: '', email: '', password: '', confirmPassword: ''
  })
  const [regErrors, setRegErrors] = useState({})
  const [showRegPwd, setShowRegPwd] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)

  // toast 提示
  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  // 登录
  const handleLogin = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!loginForm.username.trim()) errors.username = '请输入用户名'
    if (!loginForm.password) errors.password = '请输入密码'
    setLoginErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      const { token, user } = await loginApi(loginForm.username, loginForm.password)
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(user))
      showToast('success', '登录成功！')
      setTimeout(() => {
        if (user.role === 'hotel_admin') navigate('/manage')
        else if (user.role === 'system_admin') navigate('/audit')
        else navigate('/')
      }, 500)
    } catch (err) {
      showToast('error', err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  // 注册
  const handleRegister = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!regForm.username.trim()) errors.username = '请输入用户名'
    if (!regForm.email.trim()) errors.email = '请输入邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) errors.email = '邮箱格式不正确'
    if (!regForm.password) errors.password = '请输入密码'
    else if (regForm.password.length < 6) errors.password = '密码至少6位'
    if (!regForm.confirmPassword) errors.confirmPassword = '请确认密码'
    else if (regForm.password !== regForm.confirmPassword) errors.confirmPassword = '两次密码不一致'
    setRegErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      await registerApi({
        username: regForm.username,
        email: regForm.email,
        password: regForm.password,
        role: roleMap[regForm.role] || 'guest',
      })
      showToast('success', '注册成功！请登录')
      setActiveTab('login')
      setRegForm({ role: 'merchant', username: '', email: '', password: '', confirmPassword: '' })
      setRegErrors({})
    } catch (err) {
      showToast('error', err.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Toast */}
      {toast && (
        <div className={`login-toast ${toast.type}`}>
          <span className="login-toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.text}
        </div>
      )}

      <div className="login-container">
        {/* 左侧品牌区 */}
        <div className="login-brand">
          <div className="login-brand-content">
            <div className="login-brand-icon">🏨</div>
            <h1>易宿酒店管理系统</h1>
            <p className="login-brand-en">Hotel Management System</p>
            <div className="login-brand-features">
              <div className="login-brand-feature">
                <span className="feature-dot"></span>
                <span>商户入驻 · 酒店信息管理</span>
              </div>
              <div className="login-brand-feature">
                <span className="feature-dot"></span>
                <span>管理员审核 · 上下线管控</span>
              </div>
              <div className="login-brand-feature">
                <span className="feature-dot"></span>
                <span>订单管理 · 经营数据统计</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧表单区 */}
        <div className="login-form-side">
          <div className="login-card">
            {/* Tab 切换 */}
            <div className="login-tabs">
              <button
                className={`login-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => { setActiveTab('login'); setRegErrors({}) }}
              >
                登录
              </button>
              <button
                className={`login-tab ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => { setActiveTab('register'); setLoginErrors({}) }}
              >
                注册
              </button>
            </div>

            {/* 登录表单 */}
            {activeTab === 'login' && (
              <form className="login-form" onSubmit={handleLogin} noValidate>
                <div className={`form-field ${loginErrors.username ? 'has-error' : ''}`}>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      placeholder="用户名"
                      value={loginForm.username}
                      onChange={e => { setLoginForm(f => ({ ...f, username: e.target.value })); setLoginErrors(e2 => ({ ...e2, username: '' })) }}
                      autoComplete="username"
                    />
                  </div>
                  {loginErrors.username && <div className="field-error">{loginErrors.username}</div>}
                </div>

                <div className={`form-field ${loginErrors.password ? 'has-error' : ''}`}>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showLoginPwd ? 'text' : 'password'}
                      placeholder="密码"
                      value={loginForm.password}
                      onChange={e => { setLoginForm(f => ({ ...f, password: e.target.value })); setLoginErrors(e2 => ({ ...e2, password: '' })) }}
                      autoComplete="current-password"
                    />
                    <button type="button" className="pwd-toggle" onClick={() => setShowLoginPwd(v => !v)}>
                      {showLoginPwd ? '🙈' : '👁'}
                    </button>
                  </div>
                  {loginErrors.password && <div className="field-error">{loginErrors.password}</div>}
                </div>

                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? '登录中...' : '登 录'}
                </button>

                <div className="login-tips">
                  <div className="login-tips-title">演示账号</div>
                  <div className="login-tips-row">
                    <span className="tips-role merchant">商户</span>
                    <span>merchant / 123456</span>
                  </div>
                  <div className="login-tips-row">
                    <span className="tips-role admin">管理员</span>
                    <span>admin / 123456</span>
                  </div>
                </div>
              </form>
            )}

            {/* 注册表单 */}
            {activeTab === 'register' && (
              <form className="login-form" onSubmit={handleRegister} noValidate>
                <div className="form-field">
                  <label className="field-label">账户类型</label>
                  <div className="role-selector">
                    <label className={`role-option ${regForm.role === 'merchant' ? 'active' : ''}`}>
                      <input
                        type="radio" name="role" value="merchant"
                        checked={regForm.role === 'merchant'}
                        onChange={e => setRegForm(f => ({ ...f, role: e.target.value }))}
                      />
                      <span className="role-icon">🏪</span>
                      <span className="role-text">商户</span>
                      <span className="role-desc">上传管理酒店信息</span>
                    </label>
                    <label className={`role-option ${regForm.role === 'admin' ? 'active' : ''}`}>
                      <input
                        type="radio" name="role" value="admin"
                        checked={regForm.role === 'admin'}
                        onChange={e => setRegForm(f => ({ ...f, role: e.target.value }))}
                      />
                      <span className="role-icon">🛡</span>
                      <span className="role-text">管理员</span>
                      <span className="role-desc">审核发布酒店信息</span>
                    </label>
                  </div>
                </div>

                <div className={`form-field ${regErrors.username ? 'has-error' : ''}`}>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      type="text" placeholder="用户名"
                      value={regForm.username}
                      onChange={e => { setRegForm(f => ({ ...f, username: e.target.value })); setRegErrors(e2 => ({ ...e2, username: '' })) }}
                      autoComplete="username"
                    />
                  </div>
                  {regErrors.username && <div className="field-error">{regErrors.username}</div>}
                </div>

                <div className={`form-field ${regErrors.email ? 'has-error' : ''}`}>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      type="email" placeholder="邮箱"
                      value={regForm.email}
                      onChange={e => { setRegForm(f => ({ ...f, email: e.target.value })); setRegErrors(e2 => ({ ...e2, email: '' })) }}
                      autoComplete="email"
                    />
                  </div>
                  {regErrors.email && <div className="field-error">{regErrors.email}</div>}
                </div>

                <div className={`form-field ${regErrors.password ? 'has-error' : ''}`}>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showRegPwd ? 'text' : 'password'}
                      placeholder="密码（至少6位）"
                      value={regForm.password}
                      onChange={e => { setRegForm(f => ({ ...f, password: e.target.value })); setRegErrors(e2 => ({ ...e2, password: '' })) }}
                      autoComplete="new-password"
                    />
                    <button type="button" className="pwd-toggle" onClick={() => setShowRegPwd(v => !v)}>
                      {showRegPwd ? '🙈' : '👁'}
                    </button>
                  </div>
                  {regErrors.password && <div className="field-error">{regErrors.password}</div>}
                </div>

                <div className={`form-field ${regErrors.confirmPassword ? 'has-error' : ''}`}>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showRegConfirm ? 'text' : 'password'}
                      placeholder="确认密码"
                      value={regForm.confirmPassword}
                      onChange={e => { setRegForm(f => ({ ...f, confirmPassword: e.target.value })); setRegErrors(e2 => ({ ...e2, confirmPassword: '' })) }}
                      autoComplete="new-password"
                    />
                    <button type="button" className="pwd-toggle" onClick={() => setShowRegConfirm(v => !v)}>
                      {showRegConfirm ? '🙈' : '👁'}
                    </button>
                  </div>
                  {regErrors.confirmPassword && <div className="field-error">{regErrors.confirmPassword}</div>}
                </div>

                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? '注册中...' : '注 册'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
