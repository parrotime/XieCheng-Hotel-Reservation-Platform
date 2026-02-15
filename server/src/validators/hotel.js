const Joi = require('joi')

const roomSchema = Joi.object({
  name: Joi.string().max(50),
  type: Joi.string().max(50),
  bed_type: Joi.string().max(30),
  bedType: Joi.string().max(30),
  max_guests: Joi.number().integer().min(1).max(20),
  maxGuests: Joi.number().integer().min(1).max(20),
  area_sqm: Joi.number().positive(),
  size: Joi.alternatives().try(Joi.number(), Joi.string()),
  default_price: Joi.number().positive(),
  price: Joi.number().positive(),
  stock: Joi.number().integer().min(0).max(999),
  facilities: Joi.array().items(Joi.string()),
}).or('name', 'type')  // 至少有 name 或 type

const createHotelSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({ 'any.required': '酒店名称为必填项' }),
  name_en: Joi.string().max(100).allow('', null),
  star_rating: Joi.number().integer().min(1).max(5).allow(null),
  address: Joi.string().min(2).max(200).required()
    .messages({ 'any.required': '地址为必填项' }),
  city: Joi.string().max(50).allow('', null),
  province: Joi.string().max(50).allow('', null),
  description: Joi.string().max(2000).allow('', null),
  facilities: Joi.array().items(Joi.string()).allow(null),
  images: Joi.array().items(Joi.string().uri({ allowRelative: true })).allow(null),
  phone: Joi.string().max(30).allow('', null),
  district: Joi.string().max(50).allow('', null),
  subway: Joi.string().max(100).allow('', null),
  nearby_attractions: Joi.array().items(Joi.string()).allow(null),
  open_date: Joi.string().allow('', null),
  tags: Joi.array().items(Joi.string()).allow(null),
  rooms: Joi.array().items(roomSchema).default([]),
})

const updateHotelStatusSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected', 'offline').required()
    .messages({ 'any.required': '状态为必填项', 'any.only': '无效的状态值' }),
  reject_reason: Joi.string().max(500).when('status', {
    is: 'rejected',
    then: Joi.required().messages({ 'any.required': '拒绝时必须填写原因' }),
    otherwise: Joi.allow('', null),
  }),
})

const inventoryUpdateSchema = Joi.object({
  room_type_id: Joi.number().integer().positive().required()
    .messages({ 'any.required': '房型ID为必填项' }),
  dates: Joi.array().items(Joi.object({
    date: Joi.date().iso().required(),
    available: Joi.number().integer().min(0).required(),
  })).min(1).required()
    .messages({ 'any.required': '日期库存数据为必填项', 'array.min': '至少包含一条库存数据' }),
})

module.exports = { createHotelSchema, updateHotelStatusSchema, inventoryUpdateSchema }
