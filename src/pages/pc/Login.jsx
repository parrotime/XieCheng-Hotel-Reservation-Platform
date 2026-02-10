import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Radio, Tabs, Card, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { login as loginApi, register as registerApi } from '../../api/auth'
import './Login.css'

// 前端角色 → 后端角色映射
const roleMap = { merchant: 'hotel_admin', admin: 'system_admin' }

function Login() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)

  // 登录处理
  const handleLogin = async (values) => {
    const { username, password } = values
    setLoading(true)
    try {
      const { token, user } = await loginApi(username, password)
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(user))
      message.success('登录成功！')

      // 根据后端返回的角色跳转
      if (user.role === 'hotel_admin') {
        navigate('/manage')
      } else if (user.role === 'system_admin') {
        navigate('/audit')
      } else {
        navigate('/')
      }
    } catch (err) {
      message.error(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  // 注册处理
  const handleRegister = async (values) => {
    const { username, email, password, confirmPassword, role } = values

    if (password !== confirmPassword) {
      message.error('两次密码不一致')
      return
    }
    if (password.length < 6) {
      message.error('密码至少6位')
      return
    }

    setLoading(true)
    try {
      await registerApi({
        username,
        email,
        password,
        role: roleMap[role] || 'guest',
      })
      message.success('注册成功！请登录')
      setActiveTab('login')
    } catch (err) {
      message.error(err.message || '注册失败')
    } finally {
      setLoading(false)
    }
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
                    size="large"
                  >
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
                      <Button type="primary" htmlType="submit" block loading={loading}>
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
                      name="email"
                      rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '邮箱格式不正确' }
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="邮箱"
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
                      <Button type="primary" htmlType="submit" block loading={loading}>
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