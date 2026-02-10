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

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { status, data } = error.response || {}

    if (status === 401) {
      // token 过期或无效，清除登录状态
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      // 如果不在登录页，跳转到登录页
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    const message = data?.error || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export default request
