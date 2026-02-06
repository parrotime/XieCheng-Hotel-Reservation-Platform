import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  SearchBar, 
  Selector,
  Dropdown,
  Card,
  Image,
  Tag,
  Button,
  Empty,
  NavBar
} from 'antd-mobile'
import { FilterOutline, LeftOutline } from 'antd-mobile-icons'
import { hotelsData, filterHotels } from '../../data/hotels'
import './HotelList.css'

function HotelList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // 状态管理
  const [hotels, setHotels] = useState([])
  const [searchKey, setSearchKey] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedStar, setSelectedStar] = useState([])
  const [priceRange, setPriceRange] = useState([])
  const [sortType, setSortType] = useState('default')
  
  // 从 URL 参数初始化筛选条件（只在首次加载时执行）
  useEffect(() => {
    const city = searchParams.get('city') || '上海'
    const keyword = searchParams.get('keyword') || ''
    const star = searchParams.get('star') || ''
    const price = searchParams.get('price') || ''
    
    setSelectedCity(city)
    setSearchKey(keyword)
    
    if (star) {
      setSelectedStar(star.split(',').map(Number))
    }
    
    if (price) {
      setPriceRange(price.split(','))
    }
  }, [searchParams])
  
  // 关键修改：监听筛选条件变化，自动重新筛选
  useEffect(() => {
    filterData()
  }, [selectedCity, searchKey, selectedStar, priceRange, sortType])
  
  // 筛选数据
  const filterData = () => {
    let result = [...hotelsData]
    
    // 按城市筛选
    if (selectedCity) {
      result = result.filter(hotel => hotel.address.includes(selectedCity))
    }
    
    // 按关键字筛选
    if (searchKey) {
      result = result.filter(hotel => 
        hotel.name.includes(searchKey) || 
        hotel.nameEn.toLowerCase().includes(searchKey.toLowerCase()) ||
        hotel.tags.some(tag => tag.includes(searchKey))
      )
    }
    
    // 按星级筛选
    if (selectedStar.length > 0) {
      result = result.filter(hotel => selectedStar.includes(hotel.star))
    }
    
    // 按价格筛选
    if (priceRange.length > 0) {
      result = result.filter(hotel => {
        const minRoomPrice = Math.min(...hotel.rooms.map(r => r.price))
        return priceRange.some(range => {
          const [min, max] = range.split('-').map(Number)
          return minRoomPrice >= min && minRoomPrice <= max
        })
      })
    }
    
    // 排序
    result = sortHotels(result, sortType)
    
    setHotels(result)
  }
  
  // 排序函数
  const sortHotels = (data, type) => {
    const sorted = [...data]
    
    switch(type) {
      case 'price-asc':
        return sorted.sort((a, b) => {
          const priceA = Math.min(...a.rooms.map(r => r.price))
          const priceB = Math.min(...b.rooms.map(r => r.price))
          return priceA - priceB
        })
      case 'price-desc':
        return sorted.sort((a, b) => {
          const priceA = Math.min(...a.rooms.map(r => r.price))
          const priceB = Math.min(...b.rooms.map(r => r.price))
          return priceB - priceA
        })
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating)
      case 'star':
        return sorted.sort((a, b) => b.star - a.star)
      default:
        return sorted
    }
  }
  
  // 跳转到详情页
  const handleHotelClick = (hotelId) => {
    navigate(`/detail/${hotelId}`)
  }
  
  // 返回首页
  const handleBack = () => {
    navigate('/')
  }
  
  // 获取最低价格
  const getMinPrice = (hotel) => {
    return Math.min(...hotel.rooms.map(r => r.price))
  }
  
  // 星级选项
  const starOptions = [
    { label: '⭐⭐⭐⭐⭐ 五星', value: 5 },
    { label: '⭐⭐⭐⭐ 四星', value: 4 },
    { label: '⭐⭐⭐ 三星', value: 3 }
  ]
  
  // 价格选项
  const priceOptions = [
    { label: '¥0-300', value: '0-300' },
    { label: '¥300-600', value: '300-600' },
    { label: '¥600-1000', value: '600-1000' },
    { label: '¥1000-2000', value: '1000-2000' },
    { label: '¥2000以上', value: '2000-99999' }
  ]
  
  // 排序选项
  const sortOptions = [
    { key: 'default', title: '默认排序' },
    { key: 'price-asc', title: '价格从低到高' },
    { key: 'price-desc', title: '价格从高到低' },
    { key: 'rating', title: '评分最高' },
    { key: 'star', title: '星级最高' }
  ]

  return (
    <div className="hotel-list-page">
      {/* 顶部导航 */}
      <NavBar 
        onBack={handleBack}
        backArrow={<LeftOutline />}
        style={{ 
          '--height': '45px',
          '--border-bottom': '1px solid #f0f0f0'
        }}
      >
        酒店列表
      </NavBar>
      
      {/* 搜索和筛选区域 */}
      <div className="filter-section">
        {/* 搜索框 */}
        <div className="search-box">
          <SearchBar
            placeholder={`在${selectedCity}搜索酒店`}
            value={searchKey}
            onChange={setSearchKey}
            onSearch={() => {}} // 不需要手动触发，useEffect会自动处理
            style={{ '--border-radius': '20px' }}
          />
        </div>
        
        {/* 筛选条件 */}
        <div className="filter-bar">
          <Dropdown>
            <Dropdown.Item key="star" title="星级筛选">
              <div style={{ padding: '12px' }}>
                <Selector
                  options={starOptions}
                  multiple
                  value={selectedStar}
                  onChange={setSelectedStar} // 直接设置状态，useEffect会自动触发筛选
                />
              </div>
            </Dropdown.Item>
            
            <Dropdown.Item key="price" title="价格区间">
              <div style={{ padding: '12px' }}>
                <Selector
                  options={priceOptions}
                  multiple
                  value={priceRange}
                  onChange={setPriceRange} // 直接设置状态，useEffect会自动触发筛选
                />
              </div>
            </Dropdown.Item>
            
            <Dropdown.Item key="sort" title={sortOptions.find(s => s.key === sortType)?.title || '排序'}>
              <div style={{ padding: '12px' }}>
                {sortOptions.map(option => (
                  <div
                    key={option.key}
                    className={`sort-option ${sortType === option.key ? 'active' : ''}`}
                    onClick={() => setSortType(option.key)} // 直接设置状态，useEffect会自动触发
                  >
                    {option.title}
                  </div>
                ))}
              </div>
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>
      
      {/* 筛选结果提示 */}
      <div className="result-tip">
        找到 <span className="highlight">{hotels.length}</span> 家酒店
        {selectedCity && ` · ${selectedCity}`}
        {selectedStar.length > 0 && ` · ${selectedStar.map(s => s + '星').join('、')}`}
        {priceRange.length > 0 && ` · ${priceRange.length}个价格区间`}
      </div>
      
      {/* 酒店列表 */}
      <div className="hotel-list">
        {hotels.length === 0 ? (
          <Empty 
            description="暂无符合条件的酒店"
            style={{ marginTop: '60px' }}
          />
        ) : (
          hotels.map(hotel => (
            <Card
              key={hotel.id}
              className="hotel-card"
              onClick={() => handleHotelClick(hotel.id)}
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
                    <div className="hotel-stars">
                      {'⭐'.repeat(hotel.star)}
                    </div>
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
                    <div className="rating-section">
                      <span className="rating-score">{hotel.rating}</span>
                      <span className="rating-text">很棒</span>
                      <span className="review-count">({hotel.reviewCount}条评论)</span>
                    </div>
                    
                    <div className="price-section">
                      <span className="price-label">¥</span>
                      <span className="price-value">{getMinPrice(hotel)}</span>
                      <span className="price-unit">起</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default HotelList