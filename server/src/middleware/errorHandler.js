// 自定义业务错误
class AppError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

// 异步路由包装器：自动捕获 async 错误，传给全局错误处理
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = { AppError, asyncHandler }
