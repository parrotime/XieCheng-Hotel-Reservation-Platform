const { fail } = require('../utils/response')

/**
 * 通用 Joi 校验中间件工厂
 * @param {import('joi').Schema} schema  Joi schema
 * @param {'body'|'query'|'params'} source  校验来源，默认 body
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,   // 返回所有错误
      stripUnknown: true,  // 去除未定义字段
    })
    if (error) {
      const messages = error.details.map(d => d.message).join('; ')
      return fail(res, messages, 400)
    }
    req[source] = value  // 用校验后的值替换原始值
    next()
  }
}

module.exports = { validate }
