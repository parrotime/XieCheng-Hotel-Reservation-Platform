import React from 'react'
import { Card, Image, Tag } from 'antd-mobile'
import StarRating from './StarRating'
import RatingDisplay from './RatingDisplay'
import PriceDisplay from './PriceDisplay'
import { getMinPrice } from '../utils/hotelUtils'
import './HotelCard.css'

/**
 * 酒店列表卡片组件（移动端）
 * @param {Object} hotel - 酒店数据对象
 * @param {Function} onClick - 点击回调，接收 hotel.id
 */
export default function HotelCard({ hotel, onClick }) {
  return (
    <Card
      className="hotel-card"
      onClick={() => onClick(hotel.id)}
    >
      <div className="card-content">
        {/* 左侧图片 */}
        <div className="hotel-image">
          <Image
            src={hotel.images[0]}
            fit="cover"
            style={{ borderRadius: '8px' }}
          />
          {hotel.promotion && (
            <div className="promotion-badge">
              {hotel.promotion.type}
            </div>
          )}
        </div>

        {/* 右侧信息 */}
        <div className="hotel-info">
          <div className="hotel-header">
            <h3 className="hotel-name">{hotel.name}</h3>
            <StarRating star={hotel.star} className="hotel-stars" />
          </div>

          <div className="hotel-location">
            📍 {hotel.location.district} · {hotel.location.subway}
          </div>

          <div className="hotel-tags">
            {hotel.tags.slice(0, 3).map((tag, index) => (
              <Tag key={index} color="primary" fill="outline" style={{ fontSize: '12px' }}>
                {tag}
              </Tag>
            ))}
          </div>

          <div className="hotel-footer">
            <RatingDisplay
              rating={hotel.rating}
              reviewCount={hotel.reviewCount}
            />
            <PriceDisplay price={getMinPrice(hotel)} />
          </div>
        </div>
      </div>
    </Card>
  )
}
