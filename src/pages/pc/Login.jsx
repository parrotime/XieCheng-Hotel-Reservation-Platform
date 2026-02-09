import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Radio, Tabs, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('login')
  
  // 登录处理
  const handleLogin = (values) => {
    const { username, password, role } = values
    
    // 模拟登录验证
    if (!username || !password) {
      message.error('请填写完整信息')
      return
    }
    
    // 保存用户信息到 localStorage
    const userInfo = {
      username,
      role,
      loginTime: new Date().toISOString()
    }
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    
    message.success('登录成功！')
    
    // 根据角色跳转
    if (role === 'merchant') {
      navigate('/manage')
    } else {
      navigate('/audit')
    }
  }
  
  // 注册处理
  const handleRegister = (values) => {
    const { username, password, confirmPassword, role } = values
    
    if (!username || !password || !confirmPassword) {
      message.error('请填写完整信息')
      return
    }
    
    if (password !== confirmPassword) {
      message.error('两次密码不一致')
      return
    }
    
    if (password.length < 6) {
      message.error('密码至少6位')
      return
    }
    
    // 模拟注册成功，保存用户信息
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // 检查用户名是否已存在
    if (users.some(u => u.username === username)) {
      message.error('用户名已存在')
      return
    }
    
    users.push({ username, password, role })
    localStorage.setItem('users', JSON.stringify(users))
    
    message.success('注册成功！请登录')
    setActiveTab('login')
  }
  
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🏨 易宿酒店管理系统</h1>
          <p>Hotel Management System</p>
        </div>
        
        <Card className="login-card">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'login',
                label: '登录',
                children: (
                  <Form
                    name="login"
                    onFinish={handleLogin}
                    initialValues={{ role: 'merchant' }}
                    size="large"
                  >
                    <Form.Item
                      name="role"
                      label="账户类型"
                      rules={[{ required: true, message: '请选择账户类型' }]}
                    >
                      <Radio.Group>
                        <Radio value="merchant">商户</Radio>
                        <Radio value="admin">管理员</Radio>
                      </Radio.Group>
                    </Form.Item>
                    
                    <Form.Item
                      name="username"
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        placeholder="用户名" 
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />} 
                        placeholder="密码" 
                      />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" htmlType="submit" block>
                        登录
                      </Button>
                    </Form.Item>
                    
                    <div className="login-tips">
                      <p>💡 演示账号：</p>
                      <p>商户 - 用户名: merchant / 密码: 123456</p>
                      <p>管理员 - 用户名: admin / 密码: 123456</p>
                    </div>
                  </Form>
                )
              },
              {
                key: 'register',
                label: '注册',
                children: (
                  <Form
                    name="register"
                    onFinish={handleRegister}
                    initialValues={{ role: 'merchant' }}
                    size="large"
                  >
                    <Form.Item
                      name="role"
                      label="账户类型"
                      rules={[{ required: true, message: '请选择账户类型' }]}
                    >
                      <Radio.Group>
                        <Radio value="merchant">商户</Radio>
                        <Radio value="admin">管理员</Radio>
                      </Radio.Group>
                    </Form.Item>
                    
                    <Form.Item
                      name="username"
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        placeholder="用户名" 
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: '请输入密码' }]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />} 
                        placeholder="密码（至少6位）" 
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="confirmPassword"
                      rules={[{ required: true, message: '请确认密码' }]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />} 
                        placeholder="确认密码" 
                      />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" htmlType="submit" block>
                        注册
                      </Button>
                    </Form.Item>
                  </Form>
                )
              }
            ]}
          />
        </Card>
      </div>
    </div>
  )
}

export default Login