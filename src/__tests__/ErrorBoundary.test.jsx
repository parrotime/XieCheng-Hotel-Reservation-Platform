import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeAll, afterAll } from 'vitest'
import ErrorBoundary from '../components/ErrorBoundary'

// 故意抛错的子组件
function BrokenChild() {
  throw new Error('测试错误')
}

function GoodChild() {
  return <div>正常内容</div>
}

describe('ErrorBoundary 组件', () => {
  // 抑制 React 的 console.error（ErrorBoundary 会触发）
  const originalError = console.error
  beforeAll(() => { console.error = vi.fn() })
  afterAll(() => { console.error = originalError })

  test('正常渲染子组件', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    )
    expect(screen.getByText('正常内容')).toBeInTheDocument()
  })

  test('子组件抛错时显示降级 UI', () => {
    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>
    )
    expect(screen.getByText('页面出了点问题')).toBeInTheDocument()
    expect(screen.getByText('测试错误')).toBeInTheDocument()
    expect(screen.getByText('重试')).toBeInTheDocument()
  })

  test('点击重试按钮后重新渲染子组件', () => {
    let shouldThrow = true
    function MaybeBreak() {
      if (shouldThrow) throw new Error('首次错误')
      return <div>恢复正常</div>
    }

    render(
      <ErrorBoundary>
        <MaybeBreak />
      </ErrorBoundary>
    )
    expect(screen.getByText('页面出了点问题')).toBeInTheDocument()

    // 修复后点击重试
    shouldThrow = false
    fireEvent.click(screen.getByText('重试'))
    expect(screen.getByText('恢复正常')).toBeInTheDocument()
  })
})
