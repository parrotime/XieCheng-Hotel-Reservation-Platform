import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  NavBar,
  Swiper,
  Tag,
  Toast,
  Collapse,
  ImageViewer,
  Skeleton,
} from 'antd-mobile'
import {
  LeftOutline,
  EnvironmentOutline,
  PhoneFill,
  HeartOutline,
  HeartFill,
  StarFill,
  UploadOutline,
} from 'antd-mobile-icons'
import { getHotelById } from '../../api/hotels'
import { createOrder } from '../../api/orders'
import { useUser } from '../../hooks/useUser'
import { useDateRange } from '../../hooks/useDateRange.jsx'
import { formatDate } from '../../utils/dateUtils'
import StarRating from '../../components/StarRating'
import RatingDisplay from '../../components/RatingDisplay'
import DatePickerRow from '../../components/DatePickerRow'
import { MapDisplay } from '../../components/AMapComponents'
import './HotelDetail.css'

function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useUser()
  const dateRange = useDateRange()

  // 状态管理
  const [hotel, setHotel] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const roomsRef = useRef(null)

  // 自定义对话框状态
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [confirmData, setConfirmData] = useState(null)
  const [roomCount, setRoomCount] = useState(1)

  // 加载酒店数据
  const fetchHotel = useCallback(async (silent = false) => {
    try {
      const data = await getHotelById(id)
      setHotel(prev => {
        // 静默刷新时检测价格变化
        if (silent && prev?.rooms && data?.rooms) {
          const changed = data.rooms.some(r => {
            const old = prev.rooms.find(o => o.id === r.id)
            return old && (old.default_price !== r.default_price || old.stock !== r.stock)
          })
          if (changed) {
            Toast.show({ content: '房型价格/库存已更新', duration: 1500 })
          }
        }
        return data
      })
    } catch (err) {
      if (!silent) {
        Toast.show({ icon: 'fail', content: '酒店不存在' })
        setTimeout(() => navigate('/list'), 1500)
      }
    }
  }, [id, navigate])

  // 首次加载
  useEffect(() => {
    fetchHotel(false)
  }, [fetchHotel])

  // 实时轮询价格和库存（每 30 秒）
  useEffect(() => {
    const timer = setInterval(() => fetchHotel(true), 30000)
    return () => clearInterval(timer)
  }, [fetchHotel])

  // 返回列表
  const handleBack = () => {
    navigate(-1)
  }

  // 打电话
  const handleCall = () => {
    if (hotel) {
      window.location.href = `tel:${hotel.phone}`
    }
  }

  // 预订房间
  const handleBookRoom = (room) => {
    if (!dateRange.checkInDate || !dateRange.checkOutDate) {
      setConfirmData({
        hotelName: '提示',
        roomType: '',
        checkIn: '',
        checkOut: '',
        nights: 0,
        totalPrice: 0,
        isWarning: true
      })
      setConfirmVisible(true)
      return
    }

    if (dateRange.nights <= 0) {
      Toast.show({ icon: 'fail', content: '请选择有效的日期' })
      return
    }

    setRoomCount(1)
    setConfirmData({
      hotelName: hotel.name,
      roomType: room.name,
      roomTypeId: room.id,
      unitPrice: room.default_price,
      stock: room.stock,
      checkIn: formatDate(dateRange.checkInDate),
      checkOut: formatDate(dateRange.checkOutDate),
      checkInRaw: dateRange.checkInDate,
      checkOutRaw: dateRange.checkOutDate,
      nights: dateRange.nights,
      isWarning: false
    })
    setConfirmVisible(true)
  }

  // 确认预订 — 调用真实 API
  const [booking, setBooking] = useState(false)
  const handleConfirmBook = async () => {
    if (!isLoggedIn) {
      setConfirmVisible(false)
      Toast.show({ content: '请先登录' })
      navigate('/login')
      return
    }

    setBooking(true)
    try {
      const order = await createOrder({
        hotel_id: Number(id),
        room_type_id: confirmData.roomTypeId,
        check_in: confirmData.checkInRaw,
        check_out: confirmData.checkOutRaw,
        room_count: roomCount,
      })
      setConfirmVisible(false)
      Toast.show({ icon: 'success', content: '下单成功，请完成支付' })
      navigate(`/pay/${order.id}`, { state: { order } })
    } catch (err) {
      Toast.show({ icon: 'fail', content: err.message || '下单失败' })
    } finally {
      setBooking(false)
    }
  }

  // 取消预订
  const handleCancelBook = () => {
    setConfirmVisible(false)
  }

  // 最低房价
  const minPrice = useMemo(() => {
    if (!hotel?.rooms?.length) return 0
    return Math.min(...hotel.rooms.map(r => r.default_price))
  }, [hotel])

  // 滚动到房型区
  const scrollToRooms = () => {
    roomsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 图片列表
  const imageUrls = useMemo(() => {
    if (!hotel?.images) return []
    return hotel.images.map(img => typeof img === 'string' ? img : img.url)
  }, [hotel])

  // 如果数据还没加载 — 骨架屏
  if (!hotel) {
    return (
      <div className="hotel-detail-page">
        <NavBar onBack={handleBack}>酒店详情</NavBar>
        <Skeleton animated style={{ width: '100%', height: 240 }} />
        <div style={{ padding: '16px 12px' }}>
          <Skeleton animated style={{ width: '70%', height: 24, borderRadius: 4, marginBottom: 12 }} />
          <Skeleton animated style={{ width: '40%', height: 16, borderRadius: 4, marginBottom: 16 }} />
          <Skeleton animated style={{ width: '100%', height: 50, borderRadius: 10, marginBottom: 16 }} />
          <Skeleton animated style={{ width: '100%', height: 80, borderRadius: 12, marginBottom: 12 }} />
          <Skeleton animated style={{ width: '100%', height: 80, borderRadius: 12, marginBottom: 12 }} />
          <Skeleton animated style={{ width: '100%', height: 80, borderRadius: 12 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="hotel-detail-page">
      {/* 自定义确认对话框 */}
      {confirmVisible && confirmData && (
        <div className="custom-modal-overlay" onClick={handleCancelBook}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{confirmData.isWarning ? '⚠️ 温馨提示' : '确认预订'}</h3>
            </div>
            <div className="modal-content">
              {confirmData.isWarning ? (
                <p style={{ textAlign: 'center', fontSize: '16px', color: '#ff6b6b' }}>
                  请先选择入住和退房日期
                </p>
              ) : (
                <>
                  <p><strong>{confirmData.hotelName}</strong></p>
                  <p>房型：{confirmData.roomType}</p>
                  <p>入住：{confirmData.checkIn}</p>
                  <p>退房：{confirmData.checkOut}</p>
                  <p>共 {confirmData.nights} 晚</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '12px 0' }}>
                    <span>房间数</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        className="modal-btn"
                        style={{ width: 32, height: 32, borderRadius: '50%', padding: 0, fontSize: 18, background: '#f5f5f5', border: '1px solid #ddd' }}
                        onClick={() => setRoomCount(c => Math.max(1, c - 1))}
                        disabled={roomCount <= 1}
                      >−</button>
                      <span style={{ fontSize: 18, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{roomCount}</span>
                      <button
                        className="modal-btn"
                        style={{ width: 32, height: 32, borderRadius: '50%', padding: 0, fontSize: 18, background: '#f5f5f5', border: '1px solid #ddd' }}
                        onClick={() => setRoomCount(c => Math.min(confirmData.stock || 10, c + 1))}
                        disabled={roomCount >= (confirmData.stock || 10)}
                      >+</button>
                    </div>
                  </div>
                  <div style={{ height: '1px', background: '#f0f0f0', margin: '12px 0' }} />
                  <p style={{ color: '#ff6b6b', fontSize: '20px', fontWeight: 'bold' }}>
                    总价：¥{confirmData.unitPrice * confirmData.nights * roomCount}
                  </p>
                </>
              )}
            </div>
            <div className="modal-footer">
              {confirmData.isWarning ? (
                <button className="modal-btn modal-btn-confirm" onClick={handleCancelBook} style={{ width: '100%' }}>
                  知道了
                </button>
              ) : (
                <>
                  <button className="modal-btn modal-btn-cancel" onClick={handleCancelBook}>
                    再看看
                  </button>
                  <button className="modal-btn modal-btn-confirm" onClick={handleConfirmBook} disabled={booking}>
                    {booking ? '提交中...' : '确认预订'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 顶部导航 */}
      <NavBar
        onBack={handleBack}
        backArrow={<LeftOutline />}
        right={
          <div className="navbar-actions">
            <span
              className="navbar-icon"
              onClick={() => {
                setIsFavorite(!isFavorite)
                Toast.show({ content: isFavorite ? '已取消收藏' : '已收藏' })
              }}
            >
              {isFavorite ? <HeartFill style={{ color: '#ff4d4f' }} /> : <HeartOutline />}
            </span>
            <span
              className="navbar-icon"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: hotel.name, url: window.location.href })
                } else {
                  Toast.show({ content: '链接已复制' })
                }
              }}
            >
              <UploadOutline />
            </span>
          </div>
        }
        style={{
          '--height': '45px',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        酒店详情
      </NavBar>

      {/* 图片轮播 */}
      <div className="image-section">
        <Swiper
          loop
          autoplay
          indicator={(total, current) => (
            <div className="custom-indicator">
              {current + 1} / {total}
            </div>
          )}
        >
          {(hotel.images || []).map((img, index) => (
            <Swiper.Item key={index}>
              <div
                className="swiper-image-container"
                onClick={() => {
                  setImageViewerIndex(index)
                  setImageViewerVisible(true)
                }}
              >
                <img src={typeof img === 'string' ? img : img.url} alt={`${hotel.name}-${index + 1}`} loading="lazy" />
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
      </div>

      {/* 图片全屏查看 */}
      <ImageViewer.Multi
        images={imageUrls}
        visible={imageViewerVisible}
        defaultIndex={imageViewerIndex}
        onClose={() => setImageViewerVisible(false)}
      />

      {/* 酒店基本信息 */}
      <div className="info-card">
        <h1 className="hotel-title">{hotel.name}</h1>
        <div className="hotel-meta-row">
          <div className="hotel-star-badge">
            <StarRating star={hotel.star_rating} />
          </div>
          <span className="hotel-subtitle">{hotel.name_en}</span>
        </div>

        <div className="rating-block">
          <RatingDisplay
            rating={hotel.rating}
            reviewCount={hotel.review_count}
            className="rating-lg"
          />
        </div>

        {Array.isArray(hotel.facilities) && hotel.facilities.length > 0 && (
          <div className="tags-row">
            {hotel.facilities.slice(0, 5).map((tag, index) => (
              <Tag key={index} color="primary" fill="outline">
                {tag}
              </Tag>
            ))}
          </div>
        )}

        {hotel.promotion && (
          <div className="promotion-banner">
            <span className="promotion-icon">🎁</span>
            <span className="promotion-text">{hotel.promotion.description}</span>
          </div>
        )}
      </div>

      {/* 位置信息 */}
      <div className="section-card location-card">
        <div className="location-row">
          <EnvironmentOutline className="location-icon" />
          <div className="location-text">
            <p className="location-address">{hotel.address}</p>
            <p className="location-district">{hotel.city || ''} {hotel.province || ''}</p>
          </div>
        </div>
        {hotel.latitude && hotel.longitude && (
          <div style={{ margin: '10px 0' }}>
            <MapDisplay latitude={Number(hotel.latitude)} longitude={Number(hotel.longitude)} name={hotel.name} />
          </div>
        )}
        <div className="location-actions">
          <button className="action-chip" onClick={handleCall}>
            <PhoneFill /> 联系酒店
          </button>
          {hotel.latitude && hotel.longitude && (
            <button className="action-chip" onClick={() => {
              window.open(`https://uri.amap.com/marker?position=${hotel.longitude},${hotel.latitude}&name=${encodeURIComponent(hotel.name)}`, '_blank')
            }}>
              <EnvironmentOutline /> 导航前往
            </button>
          )}
        </div>
      </div>

      {/* 日期选择 */}
      <div className="section-card date-section">
        <h3 className="section-title">选择入住日期</h3>
        <DatePickerRow dateRange={dateRange} separator="→" />
        {dateRange.nights > 0 && (
          <div className="nights-info">
            共 <span className="nights-number">{dateRange.nights}</span> 晚
          </div>
        )}
      </div>

      {/* 房型列表 */}
      <div className="section-card rooms-section" ref={roomsRef}>
        <h3 className="section-title">选择房型</h3>
        {[...(hotel.rooms || [])].sort((a, b) => a.default_price - b.default_price).map((room) => (
          <div key={room.id} className="room-card">
            <div className="room-info">
              <h4 className="room-type">{room.name}</h4>
              <div className="room-details">
                <span className="room-detail-item">🛏️ {room.bed_type}</span>
                {room.area_sqm && <span className="room-detail-item">📐 {room.area_sqm}㎡</span>}
                <span className="room-detail-item">👤 最多{room.max_guests || 2}人</span>
              </div>
              <div className="room-features">
                <span className="feature-tag feature-primary">免费WiFi</span>
                {room.breakfast !== false && (
                  <span className="feature-tag feature-primary">含早餐</span>
                )}
                {room.default_price >= 800 ? (
                  <span className="feature-tag feature-free-cancel">免费取消</span>
                ) : room.default_price >= 400 ? (
                  <span className="feature-tag feature-limited-cancel">限时免费取消</span>
                ) : (
                  <span className="feature-tag feature-no-cancel">不可取消</span>
                )}
              </div>
              {room.stock && room.stock <= 5 && (
                <div className="room-urgency">仅剩{room.stock}间</div>
              )}
            </div>
            <div className="room-price-action">
              <div className="room-price">
                <div className="current-price">
                  <span className="price-symbol">¥</span>
                  <span className="price-value">{room.default_price}</span>
                  <span className="price-unit">/晚</span>
                </div>
                {dateRange.nights > 0 && (
                  <div className="total-price">
                    共¥{room.default_price * dateRange.nights}
                  </div>
                )}
              </div>
              <button
                className="book-btn"
                onClick={() => handleBookRoom(room)}
              >
                预订
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 酒店设施 */}
      <div className="section-card facilities-section">
        <h3 className="section-title">酒店设施</h3>
        <div className="facilities-grid">
          {(hotel.facilities || []).map((facility, index) => (
            <div key={index} className="facility-item">
              <span className="facility-name">{facility}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 住客评价（占位） */}
      <div className="section-card review-section">
        <h3 className="section-title">住客评价</h3>
        <div className="review-summary">
          <div className="review-score-big">
            <span className="score-number">{hotel.rating || '4.5'}</span>
            <span className="score-label">
              {hotel.rating >= 4.5 ? '很棒' : hotel.rating >= 4.0 ? '不错' : '还行'}
            </span>
          </div>
          <div className="review-meta">
            <span className="review-count-text">{hotel.review_count || 0}条评价</span>
            <div className="review-tags-mini">
              <span className="review-tag-mini">位置优越</span>
              <span className="review-tag-mini">服务热情</span>
              <span className="review-tag-mini">干净整洁</span>
            </div>
          </div>
        </div>
        <div className="review-placeholder">
          <div className="review-item-placeholder">
            <div className="reviewer-row">
              <div className="reviewer-avatar">用</div>
              <div className="reviewer-info">
                <span className="reviewer-name">用户***8</span>
                <span className="reviewer-date">2025-01</span>
              </div>
              <div className="reviewer-stars">
                {[1,2,3,4,5].map(i => <StarFill key={i} style={{ color: '#ffc107', fontSize: 12 }} />)}
              </div>
            </div>
            <p className="review-text">酒店位置很好，房间干净整洁，服务态度也很不错，下次还会再来。</p>
          </div>
          <div className="review-item-placeholder">
            <div className="reviewer-row">
              <div className="reviewer-avatar">旅</div>
              <div className="reviewer-info">
                <span className="reviewer-name">旅行者***2</span>
                <span className="reviewer-date">2025-01</span>
              </div>
              <div className="reviewer-stars">
                {[1,2,3,4,5].map(i => <StarFill key={i} style={{ color: '#ffc107', fontSize: 12 }} />)}
              </div>
            </div>
            <p className="review-text">设施齐全，早餐种类丰富，性价比很高，推荐入住。</p>
          </div>
        </div>
        <div className="review-more" onClick={() => Toast.show({ content: '评价系统开发中' })}>
          查看全部{hotel.review_count || 0}条评价 &gt;
        </div>
      </div>

      {/* 酒店详情 */}
      <div className="section-card details-section">
        <Collapse>
          <Collapse.Panel key="1" title="酒店介绍">
            <div className="collapse-content">
              {hotel.description && <p>{hotel.description}</p>}
              <p>联系电话：{hotel.phone || '-'}</p>
              <p>酒店地址：{hotel.address}</p>
            </div>
          </Collapse.Panel>
          <Collapse.Panel key="2" title="入住政策">
            <div className="collapse-content">
              <p>入住时间：14:00以后</p>
              <p>退房时间：12:00之前</p>
              <p>押金：需要信用卡预授权</p>
              <p>儿童政策：12岁以下儿童可免费入住</p>
            </div>
          </Collapse.Panel>
          <Collapse.Panel key="3" title="取消政策">
            <div className="collapse-content">
              <p>入住前24小时可免费取消</p>
              <p>入住前24小时内取消需收取一晚房费</p>
              <p>No-show将收取全额房费</p>
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>

      {/* 底部预订悬浮栏 */}
      <div className="bottom-booking-bar">
        <div className="bar-price">
          <span className="bar-price-label">最低</span>
          <span className="bar-price-symbol">¥</span>
          <span className="bar-price-value">{minPrice}</span>
          <span className="bar-price-unit">起/晚</span>
        </div>
        <button className="bar-book-btn" onClick={scrollToRooms}>
          选择房间
        </button>
      </div>
    </div>
  )
}

export default HotelDetail
