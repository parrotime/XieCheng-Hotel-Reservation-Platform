const { Router } = require('express')
const { getStats, impersonate } = require('../controllers/devController')
const { authenticate, authorize } = require('../middleware/auth')

const router = Router()

router.get('/stats', authenticate, authorize('developer'), getStats)
router.post('/impersonate', authenticate, authorize('developer'), impersonate)

module.exports = router
