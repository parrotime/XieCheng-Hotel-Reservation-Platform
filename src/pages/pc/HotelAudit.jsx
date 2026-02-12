import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getHotels as getHotelsApi, updateHotelStatus } from '../../api/hotels'
import StarRating from '../../components/StarRating'
import './HotelAudit.css'

// 状态配置
const statusConfig = {
  pending:  { text: '待审核', cls: 'pending' },
  approved: { text: '已上线', cls: 'approved' },
  rejected: { text: '已拒绝', cls: 'rejected' },
  offline:  { text: '已下线', cls: 'offline' },
}

// 拒绝原因模板
const rejectTemplates = [
  '酒店图片不清晰或与实际不符，请重新上传高清实拍图',
  '酒店地址信息不完整或有误，请核实后重新提交',
  '房型价格设置异常，请检查后重新提交',
  '酒店描述信息过于简单，请补充完善后重新提交',
  '缺少必要的经营资质信息，请补充后重新提交',
]

function HotelAudit() {
  const { userInfo, handleLogout } = useAuth('system_admin', '请先登录管理员账号')

  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [actionLoading, setActionLoading] = useState(null) // hotel id being acted on
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [batchLoading, setBatchLoading] = useState(false)
  const [sortKey, setSortKey] = useState('created_at') // created_at | status | name
  const [sortDir, setSortDir] = useState('desc') // asc | desc

  // 弹窗
  const [detailHotel, setDetailHotel] = useState(null)
  const [rejectHotel, setRejectHotel] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  // 加载数据
  const loadHotels = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getHotelsApi({ status: 'all', limit: 100 })
      setHotels(data.hotels || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userInfo) loadHotels()
  }, [userInfo, loadHotels])

  // 操作
  const doAction = async (hotelId, payload, confirmMsg) => {
    if (!window.confirm(confirmMsg)) return
    setActionLoading(hotelId)
    try {
      await updateHotelStatus(hotelId, payload)
      loadHotels()
    } catch (err) {
      alert(err.response?.data?.error || err.message || '操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  const handleApprove = (hotel) =>
    doAction(hotel.id, { status: 'approved' }, `确定通过「${hotel.name}」的审核？`)

  const handleOffline = (hotel) =>
    doAction(hotel.id, { status: 'offline' }, `确定将「${hotel.name}」下线？下线后用户将无法看到此酒店。`)

  const handleOnline = (hotel) =>
    doAction(hotel.id, { status: 'approved' }, `确定将「${hotel.name}」重新上线？`)

  const openReject = (hotel) => {
    setRejectHotel(hotel)
    setRejectReason('')
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert('请输入拒绝原因'); return }
    setActionLoading(rejectHotel.id)
    try {
      await updateHotelStatus(rejectHotel.id, { status: 'rejected', reject_reason: rejectReason })
      setRejectHotel(null)
      loadHotels()
    } catch (err) {
      alert(err.response?.data?.error || err.message || '操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  // 批量操作
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleSelectAll = (ids) => {
    setSelectedIds(prev => {
      const allSelected = ids.every(id => prev.has(id))
      if (allSelected) return new Set()
      return new Set(ids)
    })
  }
  const batchApprove = async () => {
    const pending = filtered.filter(h => h.status === 'pending' && selectedIds.has(h.id))
    if (pending.length === 0) { alert('请先勾选待审核的酒店'); return }
    if (!window.confirm(`确定批量通过 ${pending.length} 家酒店的审核？`)) return
    setBatchLoading(true)
    try {
      await Promise.all(pending.map(h => updateHotelStatus(h.id, { status: 'approved' })))
      setSelectedIds(new Set())
      loadHotels()
    } catch (err) {
      alert('部分操作失败，请刷新重试')
    } finally {
      setBatchLoading(false)
    }
  }
  const batchReject = () => {
    const pending = filtered.filter(h => h.status === 'pending' && selectedIds.has(h.id))
    if (pending.length === 0) { alert('请先勾选待审核的酒店'); return }
    // 用第一个作为 rejectHotel 触发弹窗，但实际批量处理
    setBatchRejectList(pending)
    setRejectReason('')
  }
  const [batchRejectList, setBatchRejectList] = useState(null)
  const handleBatchReject = async () => {
    if (!rejectReason.trim()) { alert('请输入拒绝原因'); return }
    setBatchLoading(true)
    try {
      await Promise.all(batchRejectList.map(h =>
        updateHotelStatus(h.id, { status: 'rejected', reject_reason: rejectReason })
      ))
      setBatchRejectList(null)
      setSelectedIds(new Set())
      loadHotels()
    } catch (err) {
      alert('部分操作失败，请刷新重试')
    } finally {
      setBatchLoading(false)
    }
  }

  // 排序
  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }
  const statusOrder = { pending: 0, approved: 1, offline: 2, rejected: 3 }

  // 筛选 + 排序
  const filtered = hotels
    .filter(h => filterStatus === 'all' || h.status === filterStatus)
    .filter(h => {
      if (!keyword.trim()) return true
      const kw = keyword.trim().toLowerCase()
      return (h.name || '').toLowerCase().includes(kw)
        || (h.address || '').toLowerCase().includes(kw)
        || (h.created_by_name || '').toLowerCase().includes(kw)
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === 'created_at') {
        cmp = new Date(a.created_at || 0) - new Date(b.created_at || 0)
      } else if (sortKey === 'status') {
        cmp = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
      } else if (sortKey === 'name') {
        cmp = (a.name || '').localeCompare(b.name || '', 'zh-CN')
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

  // 统计
  const stats = {
    total: hotels.length,
    pending: hotels.filter(h => h.status === 'pending').length,
    approved: hotels.filter(h => h.status === 'approved').length,
    rejected: hotels.filter(h => h.status === 'rejected').length,
    offline: hotels.filter(h => h.status === 'offline').length,
  }

  const statCards = [
    { key: 'all', label: '全部酒店', value: stats.total, color: '#1890ff', icon: '🏨' },
    { key: 'pending', label: '待审核', value: stats.pending, color: '#fa8c16', icon: '⏳' },
    { key: 'approved', label: '已上线', value: stats.approved, color: '#52c41a', icon: '✅' },
    { key: 'rejected', label: '已拒绝', value: stats.rejected, color: '#f5222d', icon: '❌' },
    { key: 'offline', label: '已下线', value: stats.offline, color: '#8c8c8c', icon: '⏸' },
  ]

  if (!userInfo) return null

  return (
    <div className="audit-page">
      {/* 顶栏 */}
      <div className="audit-header">
        <h2>酒店审核管理</h2>
        <div className="audit-header-right">
          <span className="audit-header-user">管理员：{userInfo?.username}</span>
          <button className="audit-header-logout" onClick={handleLogout}>退出登录</button>
        </div>
      </div>

      <div className="audit-content">
        {/* 统计卡片 */}
        <div className="audit-stats">
          {statCards.map(c => (
            <div
              key={c.key}
              className={`audit-stat-card ${filterStatus === c.key ? 'active' : ''}`}
              style={{ '--card-color': c.color }}
              onClick={() => setFilterStatus(c.key)}
            >
              <div className="audit-stat-icon">{c.icon}</div>
              <div className="audit-stat-value" style={{ color: c.color }}>{c.value}</div>
              <div className="audit-stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* 搜索和筛选栏 */}
        <div className="audit-toolbar">
          <div className="audit-toolbar-left">
            <input
              type="text"
              className="audit-search"
              placeholder="搜索酒店名称、地址、创建者..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
            <select
              className="audit-filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="pending">待审核</option>
              <option value="approved">已上线</option>
              <option value="rejected">已拒绝</option>
              <option value="offline">已下线</option>
            </select>
            <button className="audit-refresh-btn" onClick={loadHotels} disabled={loading}>
              ↻ 刷新
            </button>
          </div>
          <div className="audit-toolbar-right">
            {selectedIds.size > 0 && (
              <div className="batch-actions">
                <span className="batch-count">已选 {selectedIds.size} 项</span>
                <button className="act-btn act-approve" onClick={batchApprove} disabled={batchLoading}>
                  {batchLoading ? '处理中...' : '✓ 批量通过'}
                </button>
                <button className="act-btn act-reject" onClick={batchReject} disabled={batchLoading}>
                  ✕ 批量拒绝
                </button>
                <button className="batch-clear" onClick={() => setSelectedIds(new Set())}>取消选择</button>
              </div>
            )}
            <span className="audit-toolbar-count">
              共 {filtered.length} 条{filterStatus !== 'all' ? `（${statusConfig[filterStatus]?.text}）` : ''}
            </span>
          </div>
        </div>

        {/* 表格 */}
        {loading ? (
          <div className="audit-loading">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="audit-empty">
            <div className="audit-empty-icon">📋</div>
            <p>{keyword ? '没有找到匹配的酒店' : '暂无酒店数据'}</p>
          </div>
        ) : (
          <div className="audit-table-card">
            <table className="audit-table">
              <thead>
                <tr>
                  <th className="th-check">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every(h => selectedIds.has(h.id))}
                      onChange={() => toggleSelectAll(filtered.map(h => h.id))}
                    />
                  </th>
                  <th className="th-sortable" onClick={() => toggleSort('name')}>
                    酒店名称 {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th>星级</th>
                  <th>地址</th>
                  <th>创建者</th>
                  <th className="th-sortable" onClick={() => toggleSort('created_at')}>
                    创建时间 {sortKey === 'created_at' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="th-sortable" onClick={() => toggleSort('status')}>
                    状态 {sortKey === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(hotel => (
                  <tr key={hotel.id} className={selectedIds.has(hotel.id) ? 'row-selected' : ''}>
                    <td className="td-check">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(hotel.id)}
                        onChange={() => toggleSelect(hotel.id)}
                      />
                    </td>
                    <td className="audit-hotel-name" onClick={() => setDetailHotel(hotel)}>
                      {hotel.name}
                    </td>
                    <td><StarRating star={hotel.star_rating} /></td>
                    <td className="audit-addr">{hotel.address}</td>
                    <td>{hotel.created_by_name || '-'}</td>
                    <td className="audit-time">{hotel.created_at ? new Date(hotel.created_at).toLocaleString('zh-CN') : '-'}</td>
                    <td>
                      <span className={`audit-status ${statusConfig[hotel.status]?.cls || ''}`}>
                        {statusConfig[hotel.status]?.text || hotel.status}
                      </span>
                      {hotel.status === 'rejected' && hotel.reject_reason && (
                        <div className="audit-reject-hint" title={hotel.reject_reason}>
                          原因：{hotel.reject_reason.length > 15 ? hotel.reject_reason.slice(0, 15) + '...' : hotel.reject_reason}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="audit-actions">
                        <button className="act-btn act-view" onClick={() => setDetailHotel(hotel)}>
                          👁 查看
                        </button>
                        {hotel.status === 'pending' && (
                          <>
                            <button
                              className="act-btn act-approve"
                              onClick={() => handleApprove(hotel)}
                              disabled={actionLoading === hotel.id}
                            >
                              ✓ 通过
                            </button>
                            <button
                              className="act-btn act-reject"
                              onClick={() => openReject(hotel)}
                              disabled={actionLoading === hotel.id}
                            >
                              ✕ 拒绝
                            </button>
                          </>
                        )}
                        {hotel.status === 'approved' && (
                          <button
                            className="act-btn act-offline"
                            onClick={() => handleOffline(hotel)}
                            disabled={actionLoading === hotel.id}
                          >
                            ⏸ 下线
                          </button>
                        )}
                        {hotel.status === 'offline' && (
                          <button
                            className="act-btn act-online"
                            onClick={() => handleOnline(hotel)}
                            disabled={actionLoading === hotel.id}
                          >
                            ▶ 上线
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== 详情弹窗 ===== */}
      {detailHotel && (
        <div className="modal-overlay" onClick={() => setDetailHotel(null)}>
          <div className="modal-large audit-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>酒店详情</h2>
              <button className="modal-close" onClick={() => setDetailHotel(null)}>×</button>
            </div>
            <div className="modal-body">
              {/* 状态横幅 */}
              <div className="detail-status-banner">
                <span className={`audit-status-lg ${statusConfig[detailHotel.status]?.cls || ''}`}>
                  {statusConfig[detailHotel.status]?.text || detailHotel.status}
                </span>
                {detailHotel.status === 'rejected' && detailHotel.reject_reason && (
                  <span className="detail-reject-reason">拒绝原因：{detailHotel.reject_reason}</span>
                )}
              </div>

              {/* 基本信息 */}
              <fieldset className="detail-section">
                <legend>基本信息</legend>
                <div className="detail-grid">
                  <div className="detail-field">
                    <span className="detail-label">酒店名称</span>
                    <span className="detail-value">{detailHotel.name}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">英文名</span>
                    <span className="detail-value">{detailHotel.name_en || '-'}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">星级</span>
                    <span className="detail-value"><StarRating star={detailHotel.star_rating} /></span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">联系电话</span>
                    <span className="detail-value">{detailHotel.phone || '-'}</span>
                  </div>
                  <div className="detail-field full">
                    <span className="detail-label">详细地址</span>
                    <span className="detail-value">{detailHotel.address}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">城市</span>
                    <span className="detail-value">{detailHotel.city || '-'}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">省份</span>
                    <span className="detail-value">{detailHotel.province || '-'}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">创建者</span>
                    <span className="detail-value">{detailHotel.created_by_name || '-'}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">创建时间</span>
                    <span className="detail-value">{detailHotel.created_at ? new Date(detailHotel.created_at).toLocaleString('zh-CN') : '-'}</span>
                  </div>
                  {detailHotel.tags && (() => {
                    const tags = typeof detailHotel.tags === 'string' ? JSON.parse(detailHotel.tags) : detailHotel.tags
                    return tags.length > 0 ? (
                      <div className="detail-field full">
                        <span className="detail-label">酒店标签</span>
                        <span className="detail-value detail-tags">
                          {tags.map(t => <span key={t} className="detail-tag">{t}</span>)}
                        </span>
                      </div>
                    ) : null
                  })()}
                  <div className="detail-field full">
                    <span className="detail-label">酒店描述</span>
                    <span className="detail-value">{detailHotel.description || '-'}</span>
                  </div>
                </div>
              </fieldset>

              {/* 房型信息 */}
              {detailHotel.rooms?.length > 0 && (
                <fieldset className="detail-section">
                  <legend>房型信息 ({detailHotel.rooms.length})</legend>
                  <div className="detail-rooms">
                    {detailHotel.rooms.map(r => (
                      <div key={r.id} className="detail-room-card">
                        <div className="detail-room-name">{r.name}</div>
                        <div className="detail-room-meta">
                          <span>{r.bed_type || '-'}</span>
                          <span>{r.area_sqm ? `${r.area_sqm}㎡` : '-'}</span>
                          <span>最多{r.max_guests}人</span>
                          <span className="detail-room-price">¥{r.default_price}/晚</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </fieldset>
              )}

              {/* 酒店图片 */}
              {(() => {
                const imgs = detailHotel.images
                  ? (typeof detailHotel.images === 'string' ? JSON.parse(detailHotel.images) : detailHotel.images)
                  : []
                return imgs.length > 0 ? (
                  <fieldset className="detail-section">
                    <legend>酒店图片 ({imgs.length})</legend>
                    <div className="detail-images">
                      {imgs.map((img, i) => (
                        <div key={i} className="detail-img-item">
                          <img
                            src={typeof img === 'string' ? img : img.url}
                            alt={`${detailHotel.name} ${i + 1}`}
                            onError={e => e.target.style.display = 'none'}
                          />
                          {i === 0 && <span className="detail-img-cover">封面</span>}
                        </div>
                      ))}
                    </div>
                  </fieldset>
                ) : null
              })()}
            </div>

            {/* 底部操作 */}
            <div className="modal-footer">
              {detailHotel.status === 'pending' && (
                <>
                  <button className="act-btn act-approve" onClick={() => { setDetailHotel(null); handleApprove(detailHotel) }}>
                    ✓ 审核通过
                  </button>
                  <button className="act-btn act-reject" onClick={() => { setDetailHotel(null); openReject(detailHotel) }}>
                    ✕ 审核拒绝
                  </button>
                </>
              )}
              <button className="btn-cancel" onClick={() => setDetailHotel(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 拒绝原因弹窗 ===== */}
      {rejectHotel && (
        <div className="modal-overlay" onClick={() => setRejectHotel(null)}>
          <div className="modal-large audit-reject-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>审核拒绝 — {rejectHotel.name}</h2>
              <button className="modal-close" onClick={() => setRejectHotel(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="reject-templates">
                <div className="reject-templates-title">快捷选择拒绝原因：</div>
                {rejectTemplates.map((tpl, i) => (
                  <div
                    key={i}
                    className={`reject-tpl-item ${rejectReason === tpl ? 'active' : ''}`}
                    onClick={() => setRejectReason(tpl)}
                  >
                    {tpl}
                  </div>
                ))}
              </div>
              <div className="reject-custom">
                <label>拒绝原因（必填）：</label>
                <textarea
                  rows={4}
                  placeholder="请详细说明拒绝原因，以便商户修改..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setRejectHotel(null)}>取消</button>
              <button
                className="act-btn act-reject"
                onClick={handleReject}
                disabled={actionLoading === rejectHotel.id || !rejectReason.trim()}
              >
                {actionLoading === rejectHotel.id ? '提交中...' : '确认拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 批量拒绝弹窗 ===== */}
      {batchRejectList && (
        <div className="modal-overlay" onClick={() => setBatchRejectList(null)}>
          <div className="modal-large audit-reject-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>批量拒绝 — {batchRejectList.length} 家酒店</h2>
              <button className="modal-close" onClick={() => setBatchRejectList(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="batch-reject-list">
                {batchRejectList.map(h => (
                  <span key={h.id} className="batch-reject-name">{h.name}</span>
                ))}
              </div>
              <div className="reject-templates">
                <div className="reject-templates-title">快捷选择拒绝原因：</div>
                {rejectTemplates.map((tpl, i) => (
                  <div
                    key={i}
                    className={`reject-tpl-item ${rejectReason === tpl ? 'active' : ''}`}
                    onClick={() => setRejectReason(tpl)}
                  >
                    {tpl}
                  </div>
                ))}
              </div>
              <div className="reject-custom">
                <label>拒绝原因（必填，将应用于所有选中酒店）：</label>
                <textarea
                  rows={4}
                  placeholder="请详细说明拒绝原因..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setBatchRejectList(null)}>取消</button>
              <button
                className="act-btn act-reject"
                onClick={handleBatchReject}
                disabled={batchLoading || !rejectReason.trim()}
              >
                {batchLoading ? '处理中...' : `确认拒绝 ${batchRejectList.length} 家`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HotelAudit
