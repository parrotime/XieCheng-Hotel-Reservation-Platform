import React from 'react'
import { Layout, Button } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'

const { Header } = Layout

/**
 * PC 端页面头部组件
 * @param {string} title - 页面标题
 * @param {string} roleLabel - 角色标签，如 "商户" 或 "管理员"
 * @param {string} username - 当前用户名
 * @param {Function} onLogout - 登出回调
 * @param {string} [className] - Header 的 CSS 类名
 */
export default function PageHeader({ title, roleLabel, username, onLogout, className = '' }) {
  return (
    <Header className={className}>
      <div className="header-content">
        <h2>{title}</h2>
        <div className="header-actions">
          <span className="user-info">{roleLabel}：{username}</span>
          <Button icon={<LogoutOutlined />} onClick={onLogout}>
            退出登录
          </Button>
        </div>
      </div>
    </Header>
  )
}
