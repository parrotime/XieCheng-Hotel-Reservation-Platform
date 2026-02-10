import React from 'react'
import './RatingDisplay.css'

/**
 * 评分展示组件（移动端）
 * @param {number} rating - 评分，如 4.8
 * @param {number} reviewCount - 评论数
 * @param {string} [ratingText] - 评分文字描述，默认 "很棒"
 * @param {string} [className] - 额外 CSS 类名（用于不同尺寸）
 */
export default function RatingDisplay({ rating, reviewCount, ratingText = '很棒', className = '' }) {
  return (
    <div className={`rating-display ${className}`}>
      <span className="rating-score">{rating}</span>
      <span className="rating-text">{ratingText}</span>
      <span className="review-count">({reviewCount}条评论)</span>
    </div>
  )
}
