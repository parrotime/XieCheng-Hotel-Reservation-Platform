import request from './request'

// 创建订单
export function createOrder(data) {
  return request.post('/orders', data)
}

// 我的订单列表
export function getOrders(params) {
  return request.get('/orders', { params })
}

// 订单详情
export function getOrderById(id) {
  return request.get(`/orders/${id}`)
}

// 模拟支付
export function payOrder(id) {
  return request.put(`/orders/${id}/pay`)
}

// 取消订单
export function cancelOrder(id) {
  return request.put(`/orders/${id}/cancel`)
}
