import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截器：自动附加 JWT token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：解包统一格式 { code, data, message }
request.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    const { status, data } = error.response || {}

    if (status === 401) {
      // token 过期或无效，清除登录状态
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      // 派发自定义事件，由 LoginExpiredModal 监听并弹窗提示
      if (!window.location.pathname.includes('/login')) {
        window.dispatchEvent(new CustomEvent('auth:expired'))
      }
    }

    const message = data?.message || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export default request
