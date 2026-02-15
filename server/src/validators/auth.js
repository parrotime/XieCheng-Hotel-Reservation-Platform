const Joi = require('joi')

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(2).max(30).required()
    .messages({ 'any.required': '用户名为必填项', 'string.min': '用户名至少2个字符' }),
  email: Joi.string().email().required()
    .messages({ 'any.required': '邮箱为必填项', 'string.email': '邮箱格式不正确' }),
  password: Joi.string().min(6).max(50).required()
    .messages({ 'any.required': '密码为必填项', 'string.min': '密码至少6个字符' }),
  role: Joi.string().valid('guest', 'hotel_admin', 'system_admin', 'staff', 'developer').default('guest'),
  full_name: Joi.string().max(50).allow('', null),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('', null)
    .messages({ 'string.pattern.base': '手机号格式不正确' }),
})

const loginSchema = Joi.object({
  username: Joi.string().required()
    .messages({ 'any.required': '用户名为必填项' }),
  password: Joi.string().required()
    .messages({ 'any.required': '密码为必填项' }),
})

module.exports = { registerSchema, loginSchema }
