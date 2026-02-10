import React from 'react'
import { Tag } from 'antd'
import { statusMap } from '../constants/filterOptions'

/**
 * 酒店状态标签组件（PC 端，基于 antd Tag）
 * @param {string} status - 状态值：'pending' | 'approved' | 'rejected' | 'offline'
 */
export default function StatusTag({ status }) {
  const s = statusMap[status] || statusMap.pending
  return <Tag color={s.color}>{s.text}</Tag>
}
