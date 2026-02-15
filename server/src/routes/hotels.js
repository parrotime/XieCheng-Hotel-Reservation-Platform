const { Router } = require('express')
const { authenticate, authorize, optionalAuth } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const { validate } = require('../middleware/validate')
const { createHotelSchema, updateHotelStatusSchema, inventoryUpdateSchema } = require('../validators/hotel')
const {
  getHotels, getHotelById, createHotel,
  updateHotel, updateHotelStatus,
  getMyHotels, deleteHotel,
  getMerchantOrders, getMerchantStats,
  updateInventory, getInventory
} = require('../controllers/hotelController')

const router = Router()

// 公开接口
router.get('/', optionalAuth, asyncHandler(getHotels))

// 商户接口（具体路径必须在 /:id 之前）
router.get('/merchant/my', authenticate, authorize('hotel_admin'), asyncHandler(getMyHotels))
router.get('/merchant/orders', authenticate, authorize('hotel_admin'), asyncHandler(getMerchantOrders))
router.get('/merchant/stats', authenticate, authorize('hotel_admin'), asyncHandler(getMerchantStats))
router.get('/merchant/inventory', authenticate, authorize('hotel_admin'), asyncHandler(getInventory))
router.put('/merchant/inventory', authenticate, authorize('hotel_admin'), validate(inventoryUpdateSchema), asyncHandler(updateInventory))
router.post('/', authenticate, authorize('hotel_admin'), validate(createHotelSchema), asyncHandler(createHotel))

// 参数化路由
router.get('/:id', asyncHandler(getHotelById))
router.put('/:id', authenticate, authorize('hotel_admin'), asyncHandler(updateHotel))
router.delete('/:id', authenticate, authorize('hotel_admin'), asyncHandler(deleteHotel))

// 管理员接口
router.patch('/:id/status', authenticate, authorize('system_admin'), validate(updateHotelStatusSchema), asyncHandler(updateHotelStatus))

module.exports = router
