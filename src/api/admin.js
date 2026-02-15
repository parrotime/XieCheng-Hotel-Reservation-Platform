import request from './request'

export function getAdminDashboard() {
  return request.get('/admin/dashboard')
}

export function getAdminUsers(role) {
  return request.get('/admin/users', { params: { role } })
}

export function getAdminOrders(status) {
  return request.get('/admin/orders-list', { params: { status } })
}

export function getAdminReviews() {
  return request.get('/admin/reviews-list')
}
