import request from './request'

// 酒店列表（公开）
export function getHotels(params) {
  return request.get('/hotels', { params })
}

// 酒店详情（公开）
export function getHotelById(id) {
  return request.get(`/hotels/${id}`)
}

// 商户：我的酒店
export function getMyHotels() {
  return request.get('/hotels/merchant/my')
}

// 商户：创建酒店
export function createHotel(data) {
  return request.post('/hotels', data)
}

// 商户：编辑酒店
export function updateHotel(id, data) {
  return request.put(`/hotels/${id}`, data)
}

// 商户：删除酒店
export function deleteHotel(id) {
  return request.delete(`/hotels/${id}`)
}

// 管理员：审核/上下线
export function updateHotelStatus(id, data) {
  return request.patch(`/hotels/${id}/status`, data)
}

// 商户：订单列表
export function getMerchantOrders(params) {
  return request.get('/hotels/merchant/orders', { params })
}

// 商户：经营统计
export function getMerchantStats() {
  return request.get('/hotels/merchant/stats')
}

// 商户：查询日期库存
export function getInventory(params) {
  return request.get('/hotels/merchant/inventory', { params })
}

// 商户：更新日期库存
export function updateInventory(data) {
  return request.put('/hotels/merchant/inventory', data)
}

// 商户：上传图片
export function uploadImage(formData) {
  return request.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
