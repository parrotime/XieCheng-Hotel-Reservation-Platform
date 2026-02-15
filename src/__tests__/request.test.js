import { describe, test, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => {
  const interceptors = {
    request: { use: vi.fn(), handlers: [] },
    response: { use: vi.fn(), handlers: [] },
  }
  // 捕获拦截器回调
  interceptors.request.use.mockImplementation((fn) => {
    interceptors.request.handlers.push(fn)
  })
  interceptors.response.use.mockImplementation((onFulfilled, onRejected) => {
    interceptors.response.handlers.push({ onFulfilled, onRejected })
  })

  const instance = {
    interceptors,
    get: vi.fn(),
    post: vi.fn(),
  }
  return {
    default: { create: vi.fn(() => instance) },
  }
})

// 在 mock 之后 import
let request
let requestInterceptor
let responseSuccessHandler
let responseErrorHandler

beforeEach(async () => {
  vi.resetModules()
  // 清理 localStorage
  localStorage.clear()

  // 重新 import 以触发拦截器注册
  const mod = await import('../api/request')
  request = mod.default

  const instance = axios.create()
  requestInterceptor = instance.interceptors.request.handlers[0]
  const responseHandler = instance.interceptors.response.handlers[0]
  responseSuccessHandler = responseHandler?.onFulfilled
  responseErrorHandler = responseHandler?.onRejected
})

describe('请求拦截器', () => {
  test('有 token 时自动附加 Authorization 头', () => {
    localStorage.setItem('token', 'test-jwt-token')
    const config = { headers: {} }
    const result = requestInterceptor(config)
    expect(result.headers.Authorization).toBe('Bearer test-jwt-token')
  })

  test('无 token 时不附加 Authorization 头', () => {
    const config = { headers: {} }
    const result = requestInterceptor(config)
    expect(result.headers.Authorization).toBeUndefined()
  })
})

describe('响应拦截器', () => {
  test('成功响应 → 直接返回 response.data', () => {
    const response = { data: { id: 1, name: '测试酒店' }, status: 200 }
    const result = responseSuccessHandler(response)
    expect(result).toEqual({ id: 1, name: '测试酒店' })
  })

  test('401 错误 → 清除 token 并派发 auth:expired 事件', async () => {
    localStorage.setItem('token', 'old-token')
    localStorage.setItem('userInfo', '{}')

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    // 模拟当前路径不是 /login
    Object.defineProperty(window, 'location', {
      value: { pathname: '/orders' },
      writable: true,
    })

    const error = {
      response: { status: 401, data: { code: 401, data: null, message: '令牌已过期' } },
    }

    await expect(responseErrorHandler(error)).rejects.toThrow('令牌已过期')
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('userInfo')).toBeNull()
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent))

    dispatchSpy.mockRestore()
  })

  test('其他错误 → 返回错误消息', async () => {
    const error = {
      response: { status: 500, data: { code: 500, data: null, message: '服务器内部错误' } },
    }
    await expect(responseErrorHandler(error)).rejects.toThrow('服务器内部错误')
  })
})
