const jwt = require('jsonwebtoken')
const { authenticate, authorize, optionalAuth } = require('../src/middleware/auth')

// 设置测试环境变量
process.env.JWT_SECRET = 'test-secret-key'

// 工具：创建 mock req/res/next
function mockReqResNext(overrides = {}) {
  const req = { headers: {}, ...overrides }
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(data) { this.body = data; return this },
  }
  const next = jest.fn()
  return { req, res, next }
}

describe('authenticate 中间件', () => {
  test('无 Authorization 头 → 401', () => {
    const { req, res, next } = mockReqResNext()
    authenticate(req, res, next)
    expect(res.statusCode).toBe(401)
    expect(res.body.message).toMatch(/未提供认证令牌/)
    expect(next).not.toHaveBeenCalled()
  })

  test('格式错误的 Authorization 头 → 401', () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: 'InvalidToken' },
    })
    authenticate(req, res, next)
    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('无效 token → 401', () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: 'Bearer invalid.token.here' },
    })
    authenticate(req, res, next)
    expect(res.statusCode).toBe(401)
    expect(res.body.message).toMatch(/令牌无效/)
    expect(next).not.toHaveBeenCalled()
  })

  test('有效 token → 解析 user 并调用 next()', () => {
    const payload = { id: 1, username: 'testuser', role: 'guest' }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    })
    authenticate(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.user).toMatchObject({ id: 1, username: 'testuser', role: 'guest' })
  })

  test('过期 token → 401', () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '-1s' })
    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    })
    authenticate(req, res, next)
    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })
})

describe('authorize 中间件', () => {
  test('无 user → 401', () => {
    const middleware = authorize('admin')
    const { req, res, next } = mockReqResNext()
    middleware(req, res, next)
    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('角色不匹配 → 403', () => {
    const middleware = authorize('system_admin')
    const { req, res, next } = mockReqResNext()
    req.user = { id: 1, role: 'guest' }
    middleware(req, res, next)
    expect(res.statusCode).toBe(403)
    expect(res.body.message).toMatch(/权限不足/)
  })

  test('角色匹配 → next()', () => {
    const middleware = authorize('hotel_admin')
    const { req, res, next } = mockReqResNext()
    req.user = { id: 1, role: 'hotel_admin' }
    middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('developer 角色可以绕过权限检查', () => {
    const middleware = authorize('system_admin')
    const { req, res, next } = mockReqResNext()
    req.user = { id: 1, role: 'developer' }
    middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})

describe('optionalAuth 中间件', () => {
  test('无 token → 正常放行，不设置 user', () => {
    const { req, res, next } = mockReqResNext()
    optionalAuth(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.user).toBeUndefined()
  })

  test('有效 token → 解析 user 并放行', () => {
    const token = jwt.sign({ id: 1, role: 'guest' }, process.env.JWT_SECRET)
    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    })
    optionalAuth(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.user).toMatchObject({ id: 1, role: 'guest' })
  })

  test('无效 token → 忽略错误，正常放行', () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: 'Bearer bad.token' },
    })
    optionalAuth(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.user).toBeUndefined()
  })
})
