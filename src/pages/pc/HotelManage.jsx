import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  getMyHotels, createHotel as createHotelApi,
  updateHotel as updateHotelApi, deleteHotel as deleteHotelApi,
  getMerchantOrders, getMerchantStats,
  getInventory, updateInventory as updateInventoryApi,
  uploadImage
} from '../../api/hotels'
import StarRating from '../../components/StarRating'
import StatusTag from '../../components/StatusTag'
import { MapPicker } from '../../components/AMapComponents'
import './HotelManage.css'

// ========== 经营概览 Tab ==========
function StatsPanel({ stats, loading }) {
  if (loading) return <div className="manage-loading">加载中...</div>
  if (!stats) return (
    <div className="stats-empty">
      暂无经营数据
      <p>创建酒店并获得订单后，这里将展示经营统计</p>
    </div>
  )

  const cards = [
    { label: '酒店数', value: stats.hotel_count, color: '#1890ff' },
    { label: '房型数', value: stats.room_count, color: '#52c41a' },
    { label: '总订单', value: stats.total_orders, color: '#faad14' },
    { label: '总收入', value: `¥${stats.total_revenue?.toLocaleString() || 0}`, color: '#f5222d' },
  ]

  const statusLabels = {
    pending: '待支付', paid: '已支付', cancelled: '已取消', completed: '已完成'
  }

  return (
    <div className="stats-panel">
      <div className="stats-cards">
        {cards.map(c => (
          <div key={c.label} className="stat-card" style={{ borderTopColor: c.color }}>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="stats-detail">
        <h3>订单状态分布</h3>
        <div className="status-bars">
          {Object.entries(statusLabels).map(([key, label]) => {
            const count = stats.order_status?.[key] || 0
            const pct = stats.total_orders ? Math.round(count / stats.total_orders * 100) : 0
            return (
              <div key={key} className="status-bar-row">
                <span className="status-bar-label">{label}</span>
                <div className="status-bar-track">
                  <div className="status-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="status-bar-count">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
      {stats.recent_daily_orders?.length > 0 && (
        <div className="stats-detail">
          <h3>近7天订单趋势</h3>
          <div className="daily-orders">
            {stats.recent_daily_orders.map(d => (
              <div key={d.date} className="daily-bar">
                <div className="daily-bar-fill" style={{
                  height: `${Math.max(20, d.count * 30)}px`
                }}>{d.count}</div>
                <div className="daily-bar-date">{d.date.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ========== 订单管理 Tab ==========
function OrdersPanel({ hotels }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ status: 'all', hotel_id: '' })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [detailOrder, setDetailOrder] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (filter.status !== 'all') params.status = filter.status
      if (filter.hotel_id) params.hotel_id = filter.hotel_id
      const res = await getMerchantOrders(params)
      setOrders(res.data.orders)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const statusMap = {
    pending: { text: '待支付', cls: 'pending' },
    paid: { text: '已支付', cls: 'paid' },
    cancelled: { text: '已取消', cls: 'cancelled' },
    completed: { text: '已完成', cls: 'completed' },
  }

  return (
    <div className="orders-panel">
      <div className="orders-filters">
        <select value={filter.status} onChange={e => { setFilter(f => ({ ...f, status: e.target.value })); setPage(1) }}>
          <option value="all">全部状态</option>
          <option value="pending">待支付</option>
          <option value="paid">已支付</option>
          <option value="cancelled">已取消</option>
          <option value="completed">已完成</option>
        </select>
        <select value={filter.hotel_id} onChange={e => { setFilter(f => ({ ...f, hotel_id: e.target.value })); setPage(1) }}>
          <option value="">全部酒店</option>
          {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <span className="orders-total">共 {total} 条</span>
      </div>

      {loading ? <div className="manage-loading">加载中...</div> : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>订单号</th>
                <th>酒店</th>
                <th>房型</th>
                <th>客人</th>
                <th>入住</th>
                <th>离店</th>
                <th>间数</th>
                <th>金额</th>
                <th>状态</th>
                <th>下单时间</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="order-row-clickable" onClick={() => setDetailOrder(o)}>
                  <td className="order-no">{o.order_no}</td>
                  <td>{o.hotel_name}</td>
                  <td>{o.room_name}</td>
                  <td>{o.contact_name || o.guest_name || '-'}</td>
                  <td>{o.check_in?.slice(0, 10)}</td>
                  <td>{o.check_out?.slice(0, 10)}</td>
                  <td>{o.room_count || 1}</td>
                  <td className="order-price">¥{o.total_price}</td>
                  <td><span className={`order-status ${statusMap[o.status]?.cls || ''}`}>{statusMap[o.status]?.text || o.status}</span></td>
                  <td>{new Date(o.created_at).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="10" className="empty-row">暂无订单</td></tr>}
            </tbody>
          </table>
          {total > 15 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</button>
              <span>第 {page} 页 / 共 {Math.ceil(total / 15)} 页</span>
              <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>下一页</button>
            </div>
          )}
        </div>
      )}

      {/* 订单详情弹窗 */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal-large order-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>订单详情</h2>
              <button className="modal-close" onClick={() => setDetailOrder(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-status">
                <span className={`order-status-lg ${statusMap[detailOrder.status]?.cls || ''}`}>
                  {statusMap[detailOrder.status]?.text || detailOrder.status}
                </span>
              </div>
              <div className="order-detail-grid">
                <div className="order-detail-item">
                  <span className="detail-label">订单号</span>
                  <span className="detail-value mono">{detailOrder.order_no}</span>
                </div>
                <div className="order-detail-item">
                  <span className="detail-label">下单时间</span>
                  <span className="detail-value">{new Date(detailOrder.created_at).toLocaleString('zh-CN')}</span>
                </div>
                <div className="order-detail-item">
                  <span className="detail-label">酒店</span>
                  <span className="detail-value">{detailOrder.hotel_name}</span>
                </div>
                <div className="order-detail-item">
                  <span className="detail-label">房型</span>
                  <span className="detail-value">{detailOrder.room_name}</span>
                </div>
                <div className="order-detail-item">
                  <span className="detail-label">入住日期</span>
                  <span className="detail-value">{detailOrder.check_in?.slice(0, 10)}</span>
                </div>
                <div className="order-detail-item">
                  <span className="detail-label">离店日期</span>
                  <span className="detail-value">{detailOrder.check_out?.slice(0, 10)}</span>
                </div>
                <div className="order-detail-item">
                  <span className="detail-label">间数</span>
                  <span className="detail-value">{detailOrder.room_count || 1} 间</span>
                </div>
                <div className="order-detail-item">
                  <span className="detail-label">入住天数</span>
                  <span className="detail-value">
                    {detailOrder.check_in && detailOrder.check_out
                      ? Math.ceil((new Date(detailOrder.check_out) - new Date(detailOrder.check_in)) / 86400000)
                      : '-'} 晚
                  </span>
                </div>
                <div className="order-detail-item">
                  <span className="detail-label">联系人</span>
                  <span className="detail-value">{detailOrder.contact_name || detailOrder.guest_name || '-'}</span>
                </div>
                <div className="order-detail-item">
                  <span className="detail-label">联系电话</span>
                  <span className="detail-value">{detailOrder.contact_phone || detailOrder.guest_phone || '-'}</span>
                </div>
                <div className="order-detail-item total">
                  <span className="detail-label">订单金额</span>
                  <span className="detail-value price">¥{detailOrder.total_price}</span>
                </div>
              </div>
              {detailOrder.remark && (
                <div className="order-detail-remark">
                  <span className="detail-label">备注</span>
                  <p>{detailOrder.remark}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDetailOrder(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ========== 主组件 ==========
function HotelManage() {
  const { userInfo, handleLogout } = useAuth('hotel_admin', '请先登录商户账号')
  const [activeTab, setActiveTab] = useState('hotels')
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // 酒店表单弹窗
  const [showModal, setShowModal] = useState(false)
  const [editingHotel, setEditingHotel] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formDirty, setFormDirty] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // 库存弹窗
  const [showInventory, setShowInventory] = useState(false)
  const [inventoryRoom, setInventoryRoom] = useState(null)
  const [inventoryData, setInventoryData] = useState([])
  const [inventoryLoading, setInventoryLoading] = useState(false)

  // 表单状态
  const emptyForm = {
    name: '', name_en: '', star_rating: 4, address: '', city: '', province: '',
    description: '', phone: '', district: '', subway: '',
    latitude: null, longitude: null,
    images: [''], tags: [], rooms: []
  }
  const [formData, _setFormData] = useState(emptyForm)
  const setFormData = (updater) => {
    _setFormData(updater)
    setFormDirty(true)
  }

  const fetchHotels = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyHotels()
      setHotels(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await getMerchantStats()
      setStats(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userInfo) {
      fetchHotels()
      fetchStats()
    }
  }, [userInfo, fetchHotels, fetchStats])

  // 打开新建
  const handleCreate = () => {
    setEditingHotel(null)
    setFormData(emptyForm)
    setFormDirty(false)
    setShowModal(true)
  }

  // 打开编辑
  const handleEdit = (hotel) => {
    setEditingHotel(hotel)
    const imgs = hotel.images ? (typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images) : ['']
    const tgs = hotel.tags ? (typeof hotel.tags === 'string' ? JSON.parse(hotel.tags) : hotel.tags) : []
    setFormData({
      name: hotel.name || '', name_en: hotel.name_en || '',
      star_rating: hotel.star_rating || 4,
      address: hotel.address || '', city: hotel.city || '',
      province: hotel.province || '', description: hotel.description || '',
      phone: hotel.phone || '', district: hotel.district || '',
      subway: hotel.subway || '',
      latitude: hotel.latitude ? Number(hotel.latitude) : null,
      longitude: hotel.longitude ? Number(hotel.longitude) : null,
      images: imgs.length > 0 ? imgs : [''],
      tags: tgs,
      rooms: (hotel.rooms || []).map(r => ({
        name: r.name, bed_type: r.bed_type || '', max_guests: r.max_guests || 2,
        area_sqm: r.area_sqm || '', default_price: r.default_price || '',
        stock: r.stock || 10
      }))
    })
    setFormDirty(false)
    setShowModal(true)
  }

  // 关闭弹窗（带未保存提醒）
  const handleCloseModal = () => {
    if (formDirty && !window.confirm('有未保存的修改，确定关闭？')) return
    setShowModal(false)
  }

  // 删除
  const handleDelete = async (id) => {
    if (!window.confirm('确定删除该酒店？此操作不可恢复。')) return
    setDeletingId(id)
    try {
      await deleteHotelApi(id)
      fetchHotels()
      fetchStats()
    } catch (err) {
      alert(err.response?.data?.error || '删除失败')
    } finally {
      setDeletingId(null)
    }
  }

  // 保存（新建/编辑）
  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      alert('酒店名称和地址为必填项')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...formData,
        images: formData.images.filter(u => u.trim()),
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        rooms: formData.rooms.map(r => ({
          name: r.name, bed_type: r.bed_type, max_guests: Number(r.max_guests) || 2,
          area_sqm: Number(r.area_sqm) || null, default_price: Number(r.default_price),
          stock: Number(r.stock) || 10
        }))
      }
      if (editingHotel) {
        await updateHotelApi(editingHotel.id, payload)
      } else {
        await createHotelApi(payload)
      }
      setShowModal(false)
      fetchHotels()
      fetchStats()
    } catch (err) {
      alert(err.response?.data?.error || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 房型操作
  const addRoom = () => {
    setFormData(f => ({
      ...f,
      rooms: [...f.rooms, { name: '', bed_type: '大床', max_guests: 2, area_sqm: '', default_price: '', stock: 10 }]
    }))
  }
  const removeRoom = (idx) => {
    setFormData(f => ({ ...f, rooms: f.rooms.filter((_, i) => i !== idx) }))
  }
  const updateRoom = (idx, field, value) => {
    setFormData(f => {
      const rooms = [...f.rooms]
      rooms[idx] = { ...rooms[idx], [field]: value }
      return { ...f, rooms }
    })
  }

  // 标签操作
  const presetTags = ['免费WiFi', '含早餐', '免费停车', '健身房', '游泳池', '商务中心', '机场接送', '宠物友好', '无烟房', '行政酒廊']
  const [customTag, setCustomTag] = useState('')
  const toggleTag = (tag) => {
    setFormData(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }))
  }
  const addCustomTag = () => {
    const t = customTag.trim()
    if (t && !formData.tags.includes(t)) {
      setFormData(f => ({ ...f, tags: [...f.tags, t] }))
    }
    setCustomTag('')
  }

  // 图片操作
  const fileInputRef = useRef(null)
  const [uploadingIdx, setUploadingIdx] = useState(-1)
  const addImage = () => setFormData(f => ({ ...f, images: [...f.images, ''] }))
  const removeImage = (idx) => setFormData(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  const moveImage = (idx, dir) => {
    setFormData(f => {
      const imgs = [...f.images]
      const target = idx + dir
      if (target < 0 || target >= imgs.length) return f
      ;[imgs[idx], imgs[target]] = [imgs[target], imgs[idx]]
      return { ...f, images: imgs }
    })
  }
  const updateImage = (idx, val) => {
    setFormData(f => {
      const images = [...f.images]
      images[idx] = val
      return { ...f, images }
    })
  }
  const handleFileUpload = async (idx, file) => {
    if (!file) return
    setUploadingIdx(idx)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await uploadImage(form)
      updateImage(idx, res.data.url)
    } catch (err) {
      alert('图片上传失败: ' + (err.response?.data?.error || err.message))
    } finally {
      setUploadingIdx(-1)
    }
  }

  // 库存管理
  const openInventory = async (room, hotelName) => {
    setInventoryRoom({ ...room, hotelName })
    setShowInventory(true)
    setInventoryLoading(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const end = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
      const res = await getInventory({ room_type_id: room.id, start_date: today, end_date: end })
      const invMap = new Map(res.data.inventory.map(r => [r.date, r.available]))
      const days = []
      const d = new Date(today)
      const endD = new Date(end)
      while (d <= endD) {
        const ds = d.toISOString().slice(0, 10)
        days.push({ date: ds, available: invMap.has(ds) ? invMap.get(ds) : res.data.default_stock })
        d.setDate(d.getDate() + 1)
      }
      setInventoryData(days)
    } catch (err) {
      console.error(err)
    } finally {
      setInventoryLoading(false)
    }
  }

  const updateInvDay = (idx, val) => {
    setInventoryData(prev => {
      const arr = [...prev]
      arr[idx] = { ...arr[idx], available: Number(val) }
      return arr
    })
  }

  // 库存批量操作
  const [batchMode, setBatchMode] = useState('all') // all | weekday | weekend
  const [batchValue, setBatchValue] = useState('')
  const applyBatch = () => {
    const val = Number(batchValue)
    if (isNaN(val) || val < 0) { alert('请输入有效数量'); return }
    setInventoryData(prev => prev.map(d => {
      const day = new Date(d.date).getDay()
      const isWeekend = day === 0 || day === 6
      if (batchMode === 'all') return { ...d, available: val }
      if (batchMode === 'weekend' && isWeekend) return { ...d, available: val }
      if (batchMode === 'weekday' && !isWeekend) return { ...d, available: val }
      return d
    }))
    setBatchValue('')
  }

  const saveInventory = async () => {
    try {
      await updateInventoryApi({
        room_type_id: inventoryRoom.id,
        dates: inventoryData.map(d => ({ date: d.date, available: d.available }))
      })
      alert('库存更新成功')
      setShowInventory(false)
    } catch (err) {
      alert(err.response?.data?.error || '更新失败')
    }
  }

  if (!userInfo) return null

  const tabs = [
    { key: 'stats', label: '经营概览' },
    { key: 'hotels', label: '酒店管理' },
    { key: 'orders', label: '订单管理' },
  ]

  return (
    <div className="manage-page">
      <div className="manage-header">
        <h2>酒店管理后台</h2>
        <div className="manage-header-right">
          <span className="manage-header-user">商户：{userInfo?.username}</span>
          <button className="manage-header-logout" onClick={handleLogout}>退出登录</button>
        </div>
      </div>

      <div className="manage-tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className="manage-content">
        {/* 经营概览 */}
        {activeTab === 'stats' && <StatsPanel stats={stats} loading={statsLoading} />}

        {/* 酒店管理 */}
        {activeTab === 'hotels' && (
          <div className="hotels-panel">
            <div className="panel-header">
              <h2>我的酒店 ({hotels.length})</h2>
              <button className="btn-primary" onClick={handleCreate}>+ 新建酒店</button>
            </div>

            {loading ? <div className="manage-loading">加载中...</div> : (
              <div className="hotel-cards">
                {hotels.map(hotel => {
                  const imgs = hotel.images ? (typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images) : []
                  return (
                    <div key={hotel.id} className="hotel-card">
                      <div className="hotel-card-img">
                        <img src={imgs[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'} alt={hotel.name} />
                        <StatusTag status={hotel.status} />
                      </div>
                      <div className="hotel-card-body">
                        <h3>{hotel.name}</h3>
                        <div className="hotel-card-meta">
                          <StarRating rating={hotel.star_rating} />
                          <span>{hotel.room_count || hotel.rooms?.length || 0} 个房型</span>
                          {hotel.min_price && <span className="min-price">¥{hotel.min_price}起</span>}
                        </div>
                        <p className="hotel-card-addr">{hotel.address}</p>

                        {hotel.status === 'rejected' && hotel.reject_reason && (
                          <div className="reject-reason">拒绝原因：{hotel.reject_reason}</div>
                        )}

                        {/* 房型列表 */}
                        {hotel.rooms?.length > 0 && (
                          <div className="room-list-mini">
                            {hotel.rooms.map(r => (
                              <div key={r.id} className="room-mini-item">
                                <span className="room-mini-name">{r.name}</span>
                                <span>¥{r.default_price}/晚</span>
                                <span>库存{r.stock}</span>
                                <button className="btn-link" onClick={() => openInventory(r, hotel.name)}>日历库存</button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="hotel-card-actions">
                          <button className="btn-edit" onClick={() => handleEdit(hotel)}>编辑</button>
                          <button className="btn-danger" onClick={() => handleDelete(hotel.id)} disabled={deletingId === hotel.id}>
                            {deletingId === hotel.id ? '删除中...' : '删除'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {hotels.length === 0 && <div className="empty-state">还没有酒店，点击上方按钮创建</div>}
              </div>
            )}
          </div>
        )}

        {/* 订单管理 */}
        {activeTab === 'orders' && <OrdersPanel hotels={hotels} />}
      </div>

      {/* ===== 酒店编辑弹窗 ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingHotel ? '编辑酒店' : '新建酒店'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {/* 基本信息 */}
              <fieldset className="form-section">
                <legend>基本信息</legend>
                <div className="form-grid">
                  <label>酒店名称 *
                    <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                  </label>
                  <label>英文名
                    <input value={formData.name_en} onChange={e => setFormData(f => ({ ...f, name_en: e.target.value }))} />
                  </label>
                  <label>星级
                    <select value={formData.star_rating} onChange={e => setFormData(f => ({ ...f, star_rating: Number(e.target.value) }))}>
                      {[3, 4, 5].map(s => <option key={s} value={s}>{s}星</option>)}
                    </select>
                  </label>
                  <label>电话
                    <input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                  </label>
                  <label>地址 *
                    <input value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} />
                  </label>
                  <label>城市
                    <input value={formData.city} onChange={e => setFormData(f => ({ ...f, city: e.target.value }))} />
                  </label>
                  <label>区域
                    <input value={formData.district} onChange={e => setFormData(f => ({ ...f, district: e.target.value }))} />
                  </label>
                  <label>地铁
                    <input value={formData.subway} onChange={e => setFormData(f => ({ ...f, subway: e.target.value }))} />
                  </label>
                  <label>省份
                    <input value={formData.province} onChange={e => setFormData(f => ({ ...f, province: e.target.value }))} />
                  </label>
                </div>
                <label className="form-full">描述
                  <textarea rows={3} value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
                </label>
              </fieldset>

              {/* 地图选点 */}
              <fieldset className="form-section">
                <legend>地图定位</legend>
                <MapPicker
                  value={formData.latitude ? { latitude: formData.latitude, longitude: formData.longitude } : null}
                  onChange={({ latitude, longitude }) => setFormData(f => ({ ...f, latitude, longitude }))}
                  address={formData.address}
                />
              </fieldset>

              {/* 标签管理 */}
              <fieldset className="form-section">
                <legend>标签管理 ({formData.tags.length})</legend>
                <div className="tags-preset">
                  {presetTags.map(tag => (
                    <span key={tag} className={`tag-chip ${formData.tags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleTag(tag)}>{tag}</span>
                  ))}
                </div>
                {formData.tags.filter(t => !presetTags.includes(t)).length > 0 && (
                  <div className="tags-custom">
                    <span className="tags-custom-label">自定义：</span>
                    {formData.tags.filter(t => !presetTags.includes(t)).map(tag => (
                      <span key={tag} className="tag-chip active" onClick={() => toggleTag(tag)}>{tag} ×</span>
                    ))}
                  </div>
                )}
                <div className="tag-add-row">
                  <input type="text" placeholder="输入自定义标签" value={customTag}
                    onChange={e => setCustomTag(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag() } }} />
                  <button type="button" className="btn-sm" onClick={addCustomTag}>添加</button>
                </div>
              </fieldset>

              {/* 图片管理 */}
              <fieldset className="form-section">
                <legend>图片管理</legend>
                {formData.images.map((url, i) => (
                  <div key={i} className="image-row">
                    <span className="image-idx">{i === 0 ? '封面' : `#${i + 1}`}</span>
                    <input type="text" placeholder="图片URL" value={url} onChange={e => updateImage(i, e.target.value)} />
                    <label className="image-upload-btn">
                      {uploadingIdx === i ? '上传中...' : '本地上传'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} ref={i === 0 ? fileInputRef : undefined}
                        onChange={e => { handleFileUpload(i, e.target.files[0]); e.target.value = '' }} />
                    </label>
                    {url && <img src={url} alt="" className="image-preview" onError={e => e.target.style.display = 'none'} />}
                    <div className="image-move-btns">
                      <button className="btn-move" disabled={i === 0} onClick={() => moveImage(i, -1)} title="上移">↑</button>
                      <button className="btn-move" disabled={i === formData.images.length - 1} onClick={() => moveImage(i, 1)} title="下移">↓</button>
                    </div>
                    <button className="btn-sm-danger" onClick={() => removeImage(i)}>删除</button>
                  </div>
                ))}
                <button className="btn-sm" onClick={addImage}>+ 添加图片</button>
              </fieldset>

              {/* 房型管理 */}
              <fieldset className="form-section">
                <legend>房型管理 ({formData.rooms.length})</legend>
                {formData.rooms.map((room, i) => (
                  <div key={i} className="room-edit-card">
                    <div className="room-edit-header">
                      <span>房型 #{i + 1}</span>
                      <button className="btn-sm-danger" onClick={() => removeRoom(i)}>删除</button>
                    </div>
                    <div className="form-grid">
                      <label>名称
                        <input value={room.name} onChange={e => updateRoom(i, 'name', e.target.value)} />
                      </label>
                      <label>床型
                        <select value={room.bed_type} onChange={e => updateRoom(i, 'bed_type', e.target.value)}>
                          <option value="大床">大床</option>
                          <option value="双床">双床</option>
                          <option value="单床">单床</option>
                        </select>
                      </label>
                      <label>最大入住
                        <input type="number" min={1} value={room.max_guests} onChange={e => updateRoom(i, 'max_guests', e.target.value)} />
                      </label>
                      <label>面积(㎡)
                        <input type="number" value={room.area_sqm} onChange={e => updateRoom(i, 'area_sqm', e.target.value)} />
                      </label>
                      <label>价格(¥/晚)
                        <input type="number" min={1} value={room.default_price} onChange={e => updateRoom(i, 'default_price', e.target.value)} />
                      </label>
                      <label>默认库存
                        <input type="number" min={0} value={room.stock} onChange={e => updateRoom(i, 'stock', e.target.value)} />
                      </label>
                    </div>
                  </div>
                ))}
                <button className="btn-sm" onClick={addRoom}>+ 添加房型</button>
              </fieldset>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>取消</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 库存管理弹窗 ===== */}
      {showInventory && inventoryRoom && (
        <div className="modal-overlay" onClick={() => setShowInventory(false)}>
          <div className="modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{inventoryRoom.hotelName} - {inventoryRoom.name} 日历库存</h2>
              <button className="modal-close" onClick={() => setShowInventory(false)}>×</button>
            </div>
            <div className="modal-body">
              {inventoryLoading ? <div className="manage-loading">加载中...</div> : (
                <>
                  <div className="inv-batch">
                    <span className="inv-batch-label">批量设置：</span>
                    <select value={batchMode} onChange={e => setBatchMode(e.target.value)}>
                      <option value="all">全部日期</option>
                      <option value="weekday">仅工作日</option>
                      <option value="weekend">仅周末</option>
                    </select>
                    <input type="number" min={0} placeholder="库存数量" value={batchValue}
                      onChange={e => setBatchValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') applyBatch() }} />
                    <button className="btn-primary" onClick={applyBatch}>应用</button>
                  </div>
                  <div className="inventory-grid">
                    {inventoryData.map((d, i) => {
                      const isWeekend = [0, 6].includes(new Date(d.date).getDay())
                      return (
                        <div key={d.date} className={`inv-cell ${isWeekend ? 'weekend' : ''} ${d.available <= 0 ? 'sold-out' : ''}`}>
                          <div className="inv-date">{d.date.slice(5)}</div>
                          <input type="number" min={0} value={d.available}
                            onChange={e => updateInvDay(i, e.target.value)} className="inv-input" />
                          <div className="inv-label">可售</div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowInventory(false)}>取消</button>
              <button className="btn-primary" onClick={saveInventory}>保存库存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HotelManage
