import request from './request'

export function getDevStats() {
  return request.get('/dev/stats')
}

export function impersonate(username) {
  return request.post('/dev/impersonate', { username })
}
