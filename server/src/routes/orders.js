const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { createOrder, getOrders, getOrderById, payOrder, cancelOrder } = require('../controllers/orderController')

// 所有订单接口都需要登录
router.use(authenticate)

router.post('/', createOrder)
router.get('/', getOrders)
router.get('/:id', getOrderById)
router.put('/:id/pay', payOrder)
router.put('/:id/cancel', cancelOrder)

module.exports = router
