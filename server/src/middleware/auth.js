const jwt = require('jsonwebtoken')
const { fail } = require('../utils/response')

// 验证 JWT token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, '未提供认证令牌', 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return fail(res, '令牌无效或已过期', 401)
  }
}

// 角色权限校验
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return fail(res, '未认证', 401)
    }
    if (req.user.role !== 'developer' && !roles.includes(req.user.role)) {
      return fail(res, '权限不足', 403)
    }
    next()
  }
}

// 可选认证：有 token 就解析，没有也放行
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      // token 无效时忽略，当作未登录
    }
  }
  next()
}

module.exports = { authenticate, authorize, optionalAuth }
