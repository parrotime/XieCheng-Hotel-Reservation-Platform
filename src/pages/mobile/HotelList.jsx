import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  SearchBar,
  Selector,
  Dropdown,
  Empty,
  NavBar
} from 'antd-mobile'
import { LeftOutline } from 'antd-mobile-icons'
import { hotelsData } from '../../data/hotels'
import { starOptions, priceOptions, sortOptions } from '../../constants/filterOptions'
import { getMinPrice } from '../../utils/hotelUtils'
import HotelCard from '../../components/HotelCard'
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

  // 监听筛选条件变化，自动重新筛选
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
        const minRoomPrice = getMinPrice(hotel)
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
        return sorted.sort((a, b) => getMinPrice(a) - getMinPrice(b))
      case 'price-desc':
        return sorted.sort((a, b) => getMinPrice(b) - getMinPrice(a))
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
            onSearch={() => {}}
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
                  onChange={setSelectedStar}
                />
              </div>
            </Dropdown.Item>

            <Dropdown.Item key="price" title="价格区间">
              <div style={{ padding: '12px' }}>
                <Selector
                  options={priceOptions}
                  multiple
                  value={priceRange}
                  onChange={setPriceRange}
                />
              </div>
            </Dropdown.Item>

            <Dropdown.Item key="sort" title={sortOptions.find(s => s.key === sortType)?.title || '排序'}>
              <div style={{ padding: '12px' }}>
                {sortOptions.map(option => (
                  <div
                    key={option.key}
                    className={`sort-option ${sortType === option.key ? 'active' : ''}`}
                    onClick={() => setSortType(option.key)}
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
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onClick={handleHotelClick}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default HotelList
