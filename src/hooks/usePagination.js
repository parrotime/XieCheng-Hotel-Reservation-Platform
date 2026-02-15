import { useState, useRef, useCallback } from 'react'

/**
 * 通用分页加载 Hook（配合 antd-mobile InfiniteScroll 使用）
 * @param {Function} fetchFn - 数据请求函数，签名: (params) => Promise<{ list, total }>
 * @param {Object} options
 * @param {number}  options.pageSize  - 每页条数，默认 10
 * @param {Object}  options.extraParams - 额外请求参数（如 status 筛选）
 * @returns {{ list, loading, hasMore, loadMore, refresh, total }}
 */
export function usePagination(fetchFn, { pageSize = 10, extraParams = {} } = {}) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const pageRef = useRef(1)
  const extraRef = useRef(extraParams)
  extraRef.current = extraParams

  // 加载第一页（下拉刷新 / 筛选条件变化时调用）
  const refresh = useCallback(async () => {
    setLoading(true)
    pageRef.current = 1
    try {
      const data = await fetchFn({ ...extraRef.current, page: 1, limit: pageSize })
      const items = data.list ?? data.orders ?? []
      const t = data.total ?? 0
      setList(items)
      setTotal(t)
      setHasMore(items.length >= pageSize && items.length < t)
    } catch {
      setList([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, pageSize])

  // 加载下一页（InfiniteScroll 触发）
  const loadMore = useCallback(async () => {
    const nextPage = pageRef.current + 1
    try {
      const data = await fetchFn({ ...extraRef.current, page: nextPage, limit: pageSize })
      const items = data.list ?? data.orders ?? []
      setList(prev => [...prev, ...items])
      pageRef.current = nextPage
      setHasMore(items.length >= pageSize)
    } catch {
      setHasMore(false)
    }
  }, [fetchFn, pageSize])

  return { list, loading, hasMore, loadMore, refresh, total }
}
