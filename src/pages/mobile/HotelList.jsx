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
import { getHotels } from '../../api/hotels'
import { starOptions, priceOptions, sortOptions } from '../../constants/filterOptions'
import HotelCard from '../../components/HotelCard'
import './HotelList.css'

function HotelList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // 状态管理
  const [allHotels, setAllHotels] = useState([])
  const [hotels, setHotels] = useState([])
  const [searchKey, setSearchKey] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedStar, setSelectedStar] = useState([])
  const [priceRange, setPriceRange] = useState([])
  const [sortType, setSortType] = useState('default')
  const [loading, setLoading] = useState(true)

  // 从 API 加载酒店数据
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await getHotels({ limit: 200 })
        setAllHotels(data.hotels)
      } catch (err) {
        console.error('加载酒店失败:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHotels()
  }, [])

  // 从 URL 参数初始化筛选条件
  useEffect(() => {
    const city = searchParams.get('city') || ''
    const keyword = searchParams.get('keyword') || ''
    const star = searchParams.get('star') || ''
    const price = searchParams.get('price') || ''

    setSelectedCity(city)
    setSearchKey(keyword)
    if (star) setSelectedStar(star.split(',').map(Number))
    if (price) setPriceRange(price.split(','))
  }, [searchParams])

  // 监听筛选条件变化，自动重新筛选
  useEffect(() => {
    if (allHotels.length === 0 && loading) return
    filterData()
  }, [allHotels, selectedCity, searchKey, selectedStar, priceRange, sortType])

  // 筛选数据（基于 API 返回的数据做客户端筛选）
  const filterData = () => {
    let result = [...allHotels]

    if (selectedCity) {
      result = result.filter(h => h.city === selectedCity || h.address?.includes(selectedCity))
    }
    if (searchKey) {
      const key = searchKey.toLowerCase()
      result = result.filter(h =>
        h.name?.includes(searchKey) ||
        h.name_en?.toLowerCase().includes(key)
      )
    }
    if (selectedStar.length > 0) {
      result = result.filter(h => selectedStar.includes(h.star_rating))
    }
    if (priceRange.length > 0) {
      result = result.filter(h => {
        const price = Number(h.min_price) || 0
        return priceRange.some(range => {
          const [min, max] = range.split('-').map(Number)
          return price >= min && price <= max
        })
      })
    }

    result = sortHotels(result, sortType)
    setHotels(result)
  }

  // 排序函数
  const sortHotels = (data, type) => {
    const sorted = [...data]
    switch(type) {
      case 'price-asc':
        return sorted.sort((a, b) => Number(a.min_price || 0) - Number(b.min_price || 0))
      case 'price-desc':
        return sorted.sort((a, b) => Number(b.min_price || 0) - Number(a.min_price || 0))
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'star':
        return sorted.sort((a, b) => (b.star_rating || 0) - (a.star_rating || 0))
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
