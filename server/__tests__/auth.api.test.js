const request = require('supertest')
const jwt = require('jsonwebtoken')

// Mock pg pool — 必须在 require app 之前
jest.mock('../src/config/db', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    on: jest.fn(),
  }
  return mockPool
})

// Mock scheduler
jest.mock('../src/scheduler', () => ({
  startScheduler: jest.fn(),
}))

process.env.JWT_SECRET = 'test-secret-key'
process.env.JWT_EXPIRES_IN = '1h'

const app = require('../src/app')
const pool = require('../src/config/db')

// 工具：生成测试 token
function makeToken(payload = { id: 1, username: 'testuser', role: 'guest' }) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
}

afterEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/auth/register', () => {
  test('参数校验：缺少字段 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test' })
    expect(res.status).toBe(400)
    expect(res.body.message).toBeDefined()
  })

  test('参数校验：邮箱格式错误 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test', email: 'bad', password: '123456' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/邮箱/)
  })

  test('用户名已存在 → 409', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // exists check
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'existing', email: 'new@test.com', password: '123456' })
    expect(res.status).toBe(409)
  })

  test('注册成功 → 201 + token', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // exists check: no conflict
      .mockResolvedValueOnce({
        rows: [{ id: 1, username: 'newuser', email: 'new@test.com', role: 'guest' }],
      })
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', email: 'new@test.com', password: '123456' })
    expect(res.status).toBe(201)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.username).toBe('newuser')
  })
})

describe('POST /api/auth/login', () => {
  test('参数校验：缺少密码 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test' })
    expect(res.status).toBe(400)
  })

  test('用户不存在 → 401', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: '123456' })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  test('无 token → 401', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  test('有效 token → 返回用户信息', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, username: 'testuser', email: 'test@test.com', role: 'guest' }],
    })
    const token = makeToken()
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.username).toBe('testuser')
  })
})

describe('GET /api/health', () => {
  test('数据库正常 → 返回 ok', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ now: new Date().toISOString() }] })
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('ok')
  })

  test('数据库异常 → 返回 500', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(500)
    expect(res.body.message).toMatch(/connection refused/)
  })
})
