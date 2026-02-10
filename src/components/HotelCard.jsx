import React from 'react'
import { Card, Image, Tag } from 'antd-mobile'
import StarRating from './StarRating'
import RatingDisplay from './RatingDisplay'
import PriceDisplay from './PriceDisplay'
import './HotelCard.css'

/**
 * 酒店列表卡片组件（移动端）
 * @param {Object} hotel - 酒店数据对象（后端格式）
 * @param {Function} onClick - 点击回调，接收 hotel.id
 */
export default function HotelCard({ hotel, onClick }) {
  // 兼容图片格式：后端返回 [{url,desc}] 或旧格式字符串数组
  const firstImage = Array.isArray(hotel.images) && hotel.images.length > 0
    ? (typeof hotel.images[0] === 'string' ? hotel.images[0] : hotel.images[0].url)
    : 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400'

  const price = Number(hotel.min_price) || hotel.default_price || 0

  return (
    <Card
      className="hotel-card"
      onClick={() => onClick(hotel.id)}
    >
      <div className="card-content">
        <div className="hotel-image">
          <Image src={firstImage} fit="cover" style={{ borderRadius: '8px' }} />
        </div>

        <div className="hotel-info">
          <div className="hotel-header">
            <h3 className="hotel-name">{hotel.name}</h3>
            <StarRating star={hotel.star_rating || hotel.star} className="hotel-stars" />
          </div>

          <div className="hotel-location">
            📍 {hotel.city || ''} {hotel.address ? `· ${hotel.address.slice(0, 15)}` : ''}
          </div>

          {Array.isArray(hotel.facilities) && hotel.facilities.length > 0 && (
            <div className="hotel-tags">
              {hotel.facilities.slice(0, 3).map((tag, index) => (
                <Tag key={index} color="primary" fill="outline" style={{ fontSize: '12px' }}>
                  {tag}
                </Tag>
              ))}
            </div>
          )}

          <div className="hotel-footer">
            <RatingDisplay rating={hotel.rating} reviewCount={hotel.review_count} />
            <PriceDisplay price={price} />
          </div>
        </div>
      </div>
    </Card>
  )
}
