import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'

// Mock antd-mobile 组件
vi.mock('antd-mobile', () => ({
  Card: ({ children, onClick, className }) => (
    <div data-testid="hotel-card" className={className} onClick={onClick}>{children}</div>
  ),
  Image: ({ src }) => <img src={src} data-testid="hotel-image" />,
  Tag: ({ children }) => <span data-testid="hotel-tag">{children}</span>,
}))

// Mock 子组件
vi.mock('../components/StarRating', () => ({
  default: ({ star }) => <span data-testid="star-rating">{star}星</span>,
}))
vi.mock('../components/RatingDisplay', () => ({
  default: ({ rating }) => <span data-testid="rating-display">{rating || '-'}</span>,
}))
vi.mock('../components/PriceDisplay', () => ({
  default: ({ price }) => <span data-testid="price-display">¥{price}</span>,
}))
vi.mock('../components/HotelCard.css', () => ({}))

import HotelCard from '../components/HotelCard'

const mockHotel = {
  id: 1,
  name: '测试大酒店',
  star_rating: 5,
  city: '上海',
  address: '浦东新区陆家嘴环路1000号',
  min_price: 688,
  facilities: ['WiFi', '停车场', '游泳池', '健身房'],
  images: ['https://example.com/hotel.jpg'],
  rating: 4.8,
  review_count: 120,
}

describe('HotelCard 组件', () => {
  test('渲染酒店名称和星级', () => {
    render(<HotelCard hotel={mockHotel} onClick={() => {}} />)
    expect(screen.getByText('测试大酒店')).toBeInTheDocument()
    expect(screen.getByTestId('star-rating')).toHaveTextContent('5星')
  })

  test('渲染价格', () => {
    render(<HotelCard hotel={mockHotel} onClick={() => {}} />)
    expect(screen.getByTestId('price-display')).toHaveTextContent('¥688')
  })

  test('最多显示 3 个设施标签', () => {
    render(<HotelCard hotel={mockHotel} onClick={() => {}} />)
    const tags = screen.getAllByTestId('hotel-tag')
    expect(tags).toHaveLength(3)
    expect(tags[0]).toHaveTextContent('WiFi')
  })

  test('点击触发 onClick 回调并传入 hotel.id', () => {
    const handleClick = vi.fn()
    render(<HotelCard hotel={mockHotel} onClick={handleClick} />)
    screen.getByTestId('hotel-card').click()
    expect(handleClick).toHaveBeenCalledWith(1)
  })

  test('无图片时使用默认图片', () => {
    const hotelNoImage = { ...mockHotel, images: [] }
    render(<HotelCard hotel={hotelNoImage} onClick={() => {}} />)
    const img = screen.getByTestId('hotel-image')
    expect(img.getAttribute('src')).toContain('unsplash')
  })

  test('图片为对象数组格式时正确提取 url', () => {
    const hotelObjImages = {
      ...mockHotel,
      images: [{ url: 'https://example.com/obj.jpg', desc: '大堂' }],
    }
    render(<HotelCard hotel={hotelObjImages} onClick={() => {}} />)
    const img = screen.getByTestId('hotel-image')
    expect(img.getAttribute('src')).toBe('https://example.com/obj.jpg')
  })
})
