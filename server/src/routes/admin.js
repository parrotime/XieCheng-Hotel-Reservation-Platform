const { Router } = require('express')
const { getDashboard, getUsers, getOrders, getReviews } = require('../controllers/adminController')
const { authenticate, authorize } = require('../middleware/auth')

const router = Router()

router.get('/dashboard', authenticate, authorize('developer'), getDashboard)
router.get('/users',     authenticate, authorize('developer'), getUsers)
router.get('/orders-list',  authenticate, authorize('developer'), getOrders)
router.get('/reviews-list', authenticate, authorize('developer'), getReviews)

module.exports = router
