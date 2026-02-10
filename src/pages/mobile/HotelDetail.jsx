import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  NavBar,
  Swiper,
  Tag,
  Card,
  Button,
  Toast,
  Divider,
  Collapse
} from 'antd-mobile'
import {
  LeftOutline,
  EnvironmentOutline,
  PhoneFill,
  CheckCircleFill
} from 'antd-mobile-icons'
import { getHotelById } from '../../data/hotels'
import { useDateRange } from '../../hooks/useDateRange'
import { formatDate } from '../../utils/dateUtils'
import StarRating from '../../components/StarRating'
import RatingDisplay from '../../components/RatingDisplay'
import DatePickerRow from '../../components/DatePickerRow'
import './HotelDetail.css'

function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dateRange = useDateRange()

  // 状态管理
  const [hotel, setHotel] = useState(null)

  // 自定义对话框状态
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [confirmData, setConfirmData] = useState(null)

  // 加载酒店数据
  useEffect(() => {
    const hotelData = getHotelById(id)
    if (hotelData) {
      setHotel(hotelData)
    } else {
      Toast.show({ icon: 'fail', content: '酒店不存在' })
      setTimeout(() => navigate('/list'), 1500)
    }
  }, [id, navigate])

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

  // 地图导航
  const handleMap = () => {
    Toast.show({ content: '打开地图功能（实际项目中调用地图API）' })
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

    const totalPrice = room.price * dateRange.nights

    setConfirmData({
      hotelName: hotel.name,
      roomType: room.type,
      checkIn: formatDate(dateRange.checkInDate),
      checkOut: formatDate(dateRange.checkOutDate),
      nights: dateRange.nights,
      totalPrice: totalPrice,
      isWarning: false
    })
    setConfirmVisible(true)
  }

  // 确认预订
  const handleConfirmBook = () => {
    setConfirmVisible(false)
    Toast.show({ icon: 'success', content: '预订成功！（演示功能）', duration: 2000 })
  }

  // 取消预订
  const handleCancelBook = () => {
    setConfirmVisible(false)
  }

  // 如果数据还没加载
  if (!hotel) {
    return (
      <div className="hotel-detail-page">
        <NavBar onBack={handleBack}>加载中...</NavBar>
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          加载中...
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
                  <div style={{ height: '1px', background: '#f0f0f0', margin: '16px 0' }} />
                  <p style={{ color: '#ff6b6b', fontSize: '20px', fontWeight: 'bold' }}>
                    总价：¥{confirmData.totalPrice}
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
                  <button className="modal-btn modal-btn-confirm" onClick={handleConfirmBook}>
                    确认预订
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
          {hotel.images.map((img, index) => (
            <Swiper.Item key={index}>
              <div className="swiper-image-container">
                <img src={img} alt={`${hotel.name}-${index + 1}`} />
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
      </div>

      {/* 酒店基本信息 */}
      <Card className="info-card">
        <div className="hotel-header-info">
          <div className="title-row">
            <h1 className="hotel-title">{hotel.name}</h1>
            <div className="hotel-star-badge">
              <StarRating star={hotel.star} />
            </div>
          </div>

          <p className="hotel-subtitle">{hotel.nameEn}</p>

          <RatingDisplay
            rating={hotel.rating}
            reviewCount={hotel.reviewCount}
            className="rating-lg"
          />

          <div className="tags-row">
            {hotel.tags.map((tag, index) => (
              <Tag key={index} color="primary" fill="outline">
                {tag}
              </Tag>
            ))}
          </div>

          {hotel.promotion && (
            <div className="promotion-banner">
              <span className="promotion-icon">🎁</span>
              <span className="promotion-text">{hotel.promotion.description}</span>
            </div>
          )}
        </div>
      </Card>

      {/* 位置信息 */}
      <Card className="location-card">
        <div className="location-info">
          <div className="location-row">
            <EnvironmentOutline style={{ fontSize: '18px', color: '#1677ff' }} />
            <div className="location-text">
              <p className="location-address">{hotel.address}</p>
              <p className="location-district">{hotel.location.district} · {hotel.location.subway}</p>
            </div>
          </div>

          <div className="location-actions">
            <Button size="small" color="primary" fill="outline" onClick={handleMap}>
              查看地图
            </Button>
            <Button
              size="small"
              color="primary"
              fill="outline"
              onClick={handleCall}
              style={{ marginLeft: '8px' }}
            >
              <PhoneFill /> 电话
            </Button>
          </div>
        </div>

        {hotel.location.nearbyAttractions.length > 0 && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <div className="nearby-attractions">
              <h4>周边景点</h4>
              <div className="attraction-tags">
                {hotel.location.nearbyAttractions.map((attraction, index) => (
                  <Tag key={index} color="default" style={{ margin: '4px' }}>
                    📍 {attraction}
                  </Tag>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>

      {/* 日期选择 */}
      <Card className="date-section">
        <h3 className="section-title">选择入住日期</h3>
        <DatePickerRow dateRange={dateRange} separator="→" />

        {dateRange.nights > 0 && (
          <div className="nights-info">
            共 <span className="nights-number">{dateRange.nights}</span> 晚
          </div>
        )}
      </Card>

      {/* 房型列表 */}
      <Card className="rooms-section">
        <h3 className="section-title">选择房型</h3>
        {hotel.rooms.map((room) => (
          <div key={room.id} className="room-card">
            <div className="room-info">
              <h4 className="room-type">{room.type}</h4>
              <div className="room-details">
                <span>🛏️ {room.bedType}</span>
                <span>📏 {room.size}</span>
                <span>👥 最多{room.maxGuests}人</span>
              </div>

              <div className="room-features">
                {room.breakfast && (
                  <Tag color="success" fill="outline" style={{ fontSize: '12px' }}>
                    <CheckCircleFill /> 含早餐
                  </Tag>
                )}
                {room.wifi && (
                  <Tag color="primary" fill="outline" style={{ fontSize: '12px' }}>
                    <CheckCircleFill /> 免费WiFi
                  </Tag>
                )}
                <Tag color="default" fill="outline" style={{ fontSize: '12px' }}>
                  {room.cancelPolicy}
                </Tag>
              </div>

              <div className="room-stock">
                仅剩 <span className="stock-number">{room.stock}</span> 间
              </div>
            </div>

            <div className="room-price-action">
              <div className="room-price">
                {room.originalPrice > room.price && (
                  <div className="original-price">¥{room.originalPrice}</div>
                )}
                <div className="current-price">
                  <span className="price-symbol">¥</span>
                  <span className="price-value">{room.price}</span>
                  <span className="price-unit">/晚</span>
                </div>
                {dateRange.nights > 0 && (
                  <div className="total-price">
                    共¥{room.price * dateRange.nights}
                  </div>
                )}
              </div>

              <Button
                color="primary"
                size="middle"
                onClick={() => handleBookRoom(room)}
                disabled={room.stock === 0}
                style={{ marginTop: '8px', width: '100%' }}
              >
                {room.stock === 0 ? '已售罄' : '预订'}
              </Button>
            </div>
          </div>
        ))}
      </Card>

      {/* 酒店设施 */}
      <Card className="facilities-section">
        <h3 className="section-title">酒店设施</h3>
        <div className="facilities-grid">
          {hotel.facilities.map((facility, index) => (
            <div key={index} className="facility-item">
              <span className="facility-icon">✓</span>
              <span className="facility-name">{facility}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 酒店详情 */}
      <Card className="details-section">
        <Collapse>
          <Collapse.Panel key="1" title="酒店介绍">
            <p>开业时间：{hotel.openDate}</p>
            <p>联系电话：{hotel.phone}</p>
            <p>酒店地址：{hotel.address}</p>
          </Collapse.Panel>
          <Collapse.Panel key="2" title="入住政策">
            <p>入住时间：14:00以后</p>
            <p>退房时间：12:00之前</p>
            <p>押金：需要信用卡预授权</p>
            <p>儿童政策：12岁以下儿童可免费入住</p>
          </Collapse.Panel>
          <Collapse.Panel key="3" title="取消政策">
            <p>入住前24小时可免费取消</p>
            <p>入住前24小时内取消需收取一晚房费</p>
            <p>No-show将收取全额房费</p>
          </Collapse.Panel>
        </Collapse>
      </Card>
    </div>
  )
}

export default HotelDetail
