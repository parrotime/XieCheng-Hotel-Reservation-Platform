import React from 'react'
import './PriceDisplay.css'

/**
 * 价格展示组件（移动端）
 * @param {number} price - 价格
 * @param {string} [unit] - 单位文字，默认 "起"
 * @param {number} [originalPrice] - 原价（可选，显示划线价）
 * @param {string} [className] - 额外 CSS 类名
 */
export default function PriceDisplay({ price, unit = '起', originalPrice, className = '' }) {
  return (
    <div className={`price-display ${className}`}>
      {originalPrice && originalPrice > price && (
        <span className="original-price">¥{originalPrice}</span>
      )}
      <div className="current-price">
        <span className="price-label">¥</span>
        <span className="price-value">{price}</span>
        <span className="price-unit">{unit}</span>
      </div>
    </div>
  )
}
