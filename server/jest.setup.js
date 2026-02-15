// 在所有测试前设置环境变量
process.env.JWT_SECRET = 'test-secret-key'
process.env.JWT_EXPIRES_IN = '1h'
process.env.NODE_ENV = 'test'
