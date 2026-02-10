import React from 'react'
import { renderStarText } from '../utils/hotelUtils'
import './StarRating.css'

/**
 * 星级展示组件（通用，无框架依赖）
 * @param {number} star - 星级数
 * @param {string} [className] - 额外 CSS 类名
 */
export default function StarRating({ star, className = '' }) {
  return (
    <span className={`star-rating ${className}`}>
      {renderStarText(star)}
    </span>
  )
}
