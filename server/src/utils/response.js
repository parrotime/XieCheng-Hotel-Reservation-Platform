/**
 * 统一响应格式工具
 * 所有接口返回 { code, data, message } 结构
 */

function success(res, data = null, message = 'ok', statusCode = 200) {
  return res.status(statusCode).json({ code: 0, data, message })
}

function fail(res, message = '请求失败', statusCode = 400) {
  return res.status(statusCode).json({ code: statusCode, data: null, message })
}

module.exports = { success, fail }
