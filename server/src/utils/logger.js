const { createLogger, format, transports } = require('winston')
const path = require('path')

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

const logger = createLogger({
  level: isTest ? 'error' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    isProduction
      ? format.json()
      : format.combine(format.colorize(), format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
          return `${timestamp} [${level}] ${stack || message}${metaStr}`
        }))
  ),
  transports: [
    new transports.Console(),
    // 生产环境写入文件
    ...(isProduction ? [
      new transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
      }),
      new transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      }),
    ] : []),
  ],
})

// morgan 流式写入适配
logger.stream = {
  write(message) {
    logger.info(message.trim())
  },
}

module.exports = logger
