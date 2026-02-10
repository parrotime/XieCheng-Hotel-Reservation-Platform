import request from './request'

// 登录
export function login(username, password) {
  return request.post('/auth/login', { username, password })
}

// 注册
export function register(data) {
  return request.post('/auth/register', data)
}

// 获取当前用户信息
export function getMe() {
  return request.get('/auth/me')
}
