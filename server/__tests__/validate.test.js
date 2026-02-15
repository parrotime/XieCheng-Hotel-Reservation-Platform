const { validate } = require('../src/middleware/validate')
const { registerSchema, loginSchema } = require('../src/validators/auth')
const { createOrderSchema } = require('../src/validators/order')
const { createHotelSchema, updateHotelStatusSchema } = require('../src/validators/hotel')

function mockReqResNext(body = {}, source = 'body') {
  const req = { body: {}, query: {}, params: {} }
  req[source] = body
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(data) { this.body = data; return this },
  }
  const next = jest.fn()
  return { req, res, next }
}

describe('validate 中间件 — 注册校验', () => {
  const mw = validate(registerSchema)

  test('合法数据 → 通过', () => {
    const { req, res, next } = mockReqResNext({
      username: 'testuser', email: 'test@example.com', password: '123456',
    })
    mw(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.body.role).toBe('guest') // 默认值
  })

  test('缺少 username → 400', () => {
    const { req, res, next } = mockReqResNext({
      email: 'test@example.com', password: '123456',
    })
    mw(req, res, next)
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/用户名/)
  })

  test('邮箱格式错误 → 400', () => {
    const { req, res, next } = mockReqResNext({
      username: 'testuser', email: 'not-an-email', password: '123456',
    })
    mw(req, res, next)
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/邮箱/)
  })

  test('密码太短 → 400', () => {
    const { req, res, next } = mockReqResNext({
      username: 'testuser', email: 'test@example.com', password: '123',
    })
    mw(req, res, next)
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/密码/)
  })

  test('手机号格式错误 → 400', () => {
    const { req, res, next } = mockReqResNext({
      username: 'testuser', email: 'test@example.com', password: '123456',
      phone: '12345',
    })
    mw(req, res, next)
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/手机号/)
  })

  test('stripUnknown 去除未定义字段', () => {
    const { req, res, next } = mockReqResNext({
      username: 'testuser', email: 'test@example.com', password: '123456',
      hackerField: 'malicious',
    })
    mw(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.body.hackerField).toBeUndefined()
  })
})

describe('validate 中间件 — 登录校验', () => {
  const mw = validate(loginSchema)

  test('合法数据 → 通过', () => {
    const { req, res, next } = mockReqResNext({ username: 'admin', password: '123456' })
    mw(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('缺少密码 → 400', () => {
    const { req, res, next } = mockReqResNext({ username: 'admin' })
    mw(req, res, next)
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/密码/)
  })
})

describe('validate 中间件 — 创建订单校验', () => {
  const mw = validate(createOrderSchema)

  test('合法数据 → 通过', () => {
    const { req, res, next } = mockReqResNext({
      room_type_id: 1, hotel_id: 1,
      check_in: '2026-03-01', check_out: '2026-03-03',
    })
    mw(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.body.room_count).toBe(1) // 默认值
  })

  test('退房日期早于入住 → 400', () => {
    const { req, res, next } = mockReqResNext({
      room_type_id: 1, hotel_id: 1,
      check_in: '2026-03-05', check_out: '2026-03-01',
    })
    mw(req, res, next)
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/退房日期/)
  })

  test('缺少 hotel_id → 400', () => {
    const { req, res, next } = mockReqResNext({
      room_type_id: 1, check_in: '2026-03-01', check_out: '2026-03-03',
    })
    mw(req, res, next)
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/酒店ID/)
  })
})

describe('validate 中间件 — 酒店审核状态校验', () => {
  const mw = validate(updateHotelStatusSchema)

  test('approved → 通过', () => {
    const { req, res, next } = mockReqResNext({ status: 'approved' })
    mw(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('rejected 无原因 → 400', () => {
    const { req, res, next } = mockReqResNext({ status: 'rejected' })
    mw(req, res, next)
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/拒绝/)
  })

  test('rejected 有原因 → 通过', () => {
    const { req, res, next } = mockReqResNext({ status: 'rejected', reject_reason: '信息不完整' })
    mw(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('无效状态值 → 400', () => {
    const { req, res, next } = mockReqResNext({ status: 'hacked' })
    mw(req, res, next)
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/无效的状态值/)
  })
})

describe('validate 中间件 — 创建酒店校验', () => {
  const mw = validate(createHotelSchema)

  test('合法数据 → 通过', () => {
    const { req, res, next } = mockReqResNext({
      name: '测试酒店', address: '测试地址',
    })
    mw(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('缺少名称 → 400', () => {
    const { req, res, next } = mockReqResNext({ address: '测试地址' })
    mw(req, res, next)
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/酒店名称/)
  })

  test('star_rating 超出范围 → 400', () => {
    const { req, res, next } = mockReqResNext({
      name: '测试酒店', address: '测试地址', star_rating: 6,
    })
    mw(req, res, next)
    expect(res.statusCode).toBe(400)
  })
})
