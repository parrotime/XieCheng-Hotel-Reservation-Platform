const { Router } = require('express')
const { authenticate, authorize, optionalAuth } = require('../middleware/auth')
const {
  getHotels, getHotelById, createHotel,
  updateHotel, updateHotelStatus,
  getMyHotels, deleteHotel
} = require('../controllers/hotelController')

const router = Router()

// 公开接口
router.get('/', optionalAuth, getHotels)

// 商户接口（具体路径必须在 /:id 之前）
router.get('/merchant/my', authenticate, authorize('hotel_admin'), getMyHotels)
router.post('/', authenticate, authorize('hotel_admin'), createHotel)

// 参数化路由
router.get('/:id', getHotelById)
router.put('/:id', authenticate, authorize('hotel_admin'), updateHotel)
router.delete('/:id', authenticate, authorize('hotel_admin'), deleteHotel)

// 管理员接口
router.patch('/:id/status', authenticate, authorize('system_admin'), updateHotelStatus)

module.exports = router
