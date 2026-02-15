const Joi = require('joi')

const createOrderSchema = Joi.object({
  room_type_id: Joi.number().integer().positive().required()
    .messages({ 'any.required': '房型ID为必填项' }),
  hotel_id: Joi.number().integer().positive().required()
    .messages({ 'any.required': '酒店ID为必填项' }),
  check_in: Joi.date().iso().required()
    .messages({ 'any.required': '入住日期为必填项', 'date.format': '日期格式不正确' }),
  check_out: Joi.date().iso().greater(Joi.ref('check_in')).required()
    .messages({ 'any.required': '退房日期为必填项', 'date.greater': '退房日期必须晚于入住日期' }),
  room_count: Joi.number().integer().min(1).max(10).default(1)
    .messages({ 'number.min': '房间数量至少为1', 'number.max': '房间数量最多为10' }),
  contact_name: Joi.string().max(50).allow('', null),
  contact_phone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('', null)
    .messages({ 'string.pattern.base': '联系电话格式不正确' }),
})

const orderQuerySchema = Joi.object({
  status: Joi.string().valid('all', 'pending', 'paid', 'checked_in', 'completed', 'cancelled'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
})

module.exports = { createOrderSchema, orderQuerySchema }
