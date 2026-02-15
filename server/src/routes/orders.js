const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { asyncHandler } = require('../middleware/errorHandler')
const { validate } = require('../middleware/validate')
const { createOrderSchema, orderQuerySchema } = require('../validators/order')
const { createOrder, getOrders, getOrderById, payOrder, cancelOrder } = require('../controllers/orderController')

// 所有订单接口都需要登录
router.use(authenticate)

router.post('/', validate(createOrderSchema), asyncHandler(createOrder))
router.get('/', validate(orderQuerySchema, 'query'), asyncHandler(getOrders))
router.get('/:id', asyncHandler(getOrderById))
router.put('/:id/pay', asyncHandler(payOrder))
router.put('/:id/cancel', asyncHandler(cancelOrder))

module.exports = router
