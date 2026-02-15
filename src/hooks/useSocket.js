import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { Toast } from 'antd-mobile'

const STATUS_LABEL = {
  paid: '已支付',
  cancelled: '已取消',
  checked_in: '已入住',
  completed: '已完成',
}

/**
 * WebSocket 实时通知 Hook
 * 登录后自动连接，监听订单状态变更并弹 Toast
 */
export function useSocket() {
  const socketRef = useRef(null)

  const connect = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token || socketRef.current?.connected) return

    const socket = io(window.location.origin, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    })

    socket.on('connect', () => {
      console.log('[WS] 已连接', socket.id)
    })

    // 商户收到新订单
    socket.on('order:new', (data) => {
      Toast.show({ icon: 'success', content: `新订单 ${data.order_no}，¥${data.total_price}` })
    })

    // 商户收到支付通知
    socket.on('order:paid', (data) => {
      Toast.show({ icon: 'success', content: `订单 ${data.order_no} 已支付 ¥${data.total_price}` })
    })

    // 商户收到取消通知
    socket.on('order:cancelled', (data) => {
      Toast.show({ content: `订单 ${data.order_no} 已被取消` })
    })

    // 用户收到订单状态更新
    socket.on('order:update', (data) => {
      const label = STATUS_LABEL[data.status] || data.status
      Toast.show({ content: data.message || `订单${label}` })
    })

    socket.on('connect_error', (err) => {
      console.warn('[WS] 连接失败', err.message)
    })

    socketRef.current = socket
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { connect, disconnect }
}
