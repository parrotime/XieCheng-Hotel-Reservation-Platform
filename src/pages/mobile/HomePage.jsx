import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  SearchBar, 
  Swiper, 
  Button, 
  DatePicker,
  Selector,
  Tag,
  Toast
} from 'antd-mobile'
import { EnvironmentOutline, CalendarOutline } from 'antd-mobile-icons'
import { hotCities } from '../../data/cities'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  
  // 状态管理
  const [searchKey, setSearchKey] = useState('')
  const [selectedCity, setSelectedCity] = useState('上海')
  const [checkInDate, setCheckInDate] = useState(null)
  const [checkOutDate, setCheckOutDate] = useState(null)
  const [selectedStar, setSelectedStar] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [priceRange, setPriceRange] = useState([])
  
  // 日期选择器可见性控制
  const [checkInVisible, setCheckInVisible] = useState(false)
  const [checkOutVisible, setCheckOutVisible] = useState(false)
  
  // Banner 数据
  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=400&fit=crop',
      title: '春节特惠',
      hotelId: 1
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&h=400&fit=crop',
      title: '豪华酒店',
      hotelId: 2
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=400&fit=crop',
      title: '度假首选',
      hotelId: 3
    }
  ]
  
  // 快捷标签
  const quickTags = [
    { label: '如家', value: '如家' },
    { label: '豪华', value: '豪华' },
    { label: '免费早餐', value: '免费早餐' },
    { label: '免费取消', value: '免费取消' },
    { label: '游泳池', value: '游泳池' },
    { label: '健身房', value: '健身房' }
  ]
  
  // 星级选项
  const starOptions = [
    { label: '⭐⭐⭐⭐⭐ 五星', value: 5 },
    { label: '⭐⭐⭐⭐ 四星', value: 4 },
    { label: '⭐⭐⭐ 三星', value: 3 }
  ]
  
  // 价格区间选项
  const priceOptions = [
    { label: '¥0-300', value: '0-300' },
    { label: '¥300-600', value: '300-600' },
    { label: '¥600-1000', value: '600-1000' },
    { label: '¥1000-2000', value: '1000-2000' },
    { label: '¥2000以上', value: '2000-99999' }
  ]
  
  // 格式化日期显示
  const formatDate = (date) => {
    if (!date) return null
    const d = new Date(date)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }
  
  // 入住日期确认
  const handleCheckInConfirm = (value) => {
    const selectedDate = new Date(value)
    
    // 如果已选退房日期，检查是否合法
    if (checkOutDate) {
      const checkOut = new Date(checkOutDate)
      if (selectedDate >= checkOut) {
        Toast.show({
          icon: 'fail',
          content: '入住日期必须早于退房日期',
        })
        return
      }
    }
    
    setCheckInDate(selectedDate)
    Toast.show({
      icon: 'success',
      content: '入住日期已选择',
    })
  }
  
  // 退房日期确认
  const handleCheckOutConfirm = (value) => {
    const selectedDate = new Date(value)
    
    // 检查退房日期必须晚于入住日期
    if (checkInDate) {
      const checkIn = new Date(checkInDate)
      if (selectedDate <= checkIn) {
        Toast.show({
          icon: 'fail',
          content: '退房日期必须晚于入住日期',
        })
        return
      }
    }
    
    setCheckOutDate(selectedDate)
    Toast.show({
      icon: 'success',
      content: '退房日期已选择',
    })
  }
  
  // 快捷标签点击
  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag.value)) {
      setSelectedTags(selectedTags.filter(t => t !== tag.value))
    } else {
      setSelectedTags([...selectedTags, tag.value])
    }
  }
  
  // 搜索处理
  const handleSearch = () => {
    const cityToUse = selectedCity || '上海'
    
    if (!selectedCity) {
      Toast.show({
        icon: 'info',
        content: '未选择城市，默认搜索上海地区',
      })
    }
    
    const params = new URLSearchParams()
    params.append('city', cityToUse)
    if (searchKey) params.append('keyword', searchKey)
    if (checkInDate) params.append('checkIn', checkInDate.toLocaleDateString('zh-CN'))
    if (checkOutDate) params.append('checkOut', checkOutDate.toLocaleDateString('zh-CN'))
    if (selectedStar.length > 0) params.append('star', selectedStar.join(','))
    if (selectedTags.length > 0) params.append('tags', selectedTags.join(','))
    if (priceRange.length > 0) params.append('price', priceRange.join(','))
    
    // 保存搜索历史
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]')
    const newSearch = {
      city: cityToUse,
      keyword: searchKey,
      date: new Date().toLocaleString('zh-CN'),
      timestamp: Date.now()
    }
    searchHistory.unshift(newSearch)
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 5)))
    
    navigate(`/list?${params.toString()}`)
  }
  
  // Banner 点击
  const handleBannerClick = (hotelId) => {
    navigate(`/detail/${hotelId}`)
  }

  return (
    <div className="home-page">
      {/* 顶部 Banner */}
      <div className="banner-section">
        <Swiper
          autoplay
          loop
          style={{
            '--border-radius': '8px',
          }}
        >
          {banners.map(banner => (
            <Swiper.Item key={banner.id}>
              <div 
                className="banner-item"
                onClick={() => handleBannerClick(banner.hotelId)}
              >
                <img src={banner.image} alt={banner.title} />
                <div className="banner-title">{banner.title}</div>
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
      </div>

      {/* 核心查询区域 */}
      <div className="search-section">
        <h2>查找酒店</h2>
        
        {/* 城市选择 */}
        <div className="search-item">
          <div className="search-label">
            <EnvironmentOutline /> 当前地点
          </div>
          <Selector
            options={hotCities.map(city => ({
              label: city.name,
              value: city.name
            }))}
            value={[selectedCity]}
            onChange={(arr) => setSelectedCity(arr[0])}
            style={{ '--border-radius': '8px' }}
          />
        </div>

        {/* 关键字搜索 */}
        <div className="search-item">
          <SearchBar
            placeholder="搜索酒店名称或地标"
            value={searchKey}
            onChange={setSearchKey}
            style={{ '--border-radius': '8px' }}
          />
        </div>

        {/* 入住日期 */}
        <div className="search-item">
          <div className="search-label">
            <CalendarOutline /> 入住日期
          </div>
          <div className="date-picker-row">
            <Button
              size="large"
              fill="outline"
              onClick={() => setCheckInVisible(true)}
            >
              {checkInDate ? formatDate(checkInDate) : '入住日期'}
            </Button>
            <span style={{ margin: '0 10px' }}>-</span>
            <Button
              size="large"
              fill="outline"
              onClick={() => setCheckOutVisible(true)}
            >
              {checkOutDate ? formatDate(checkOutDate) : '退房日期'}
            </Button>
          </div>
        </div>
        
        {/* 入住日期选择器 */}
        <DatePicker
          visible={checkInVisible}
          onClose={() => setCheckInVisible(false)}
          onConfirm={handleCheckInConfirm}
          min={new Date()}
          precision='day'
          title="选择入住日期"
        />
        
        {/* 退房日期选择器 */}
        <DatePicker
          visible={checkOutVisible}
          onClose={() => setCheckOutVisible(false)}
          onConfirm={handleCheckOutConfirm}
          min={checkInDate ? new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000) : new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
          precision='day'
          title="选择退房日期"
        />

        {/* 筛选条件 - 星级 */}
        <div className="search-item">
          <div className="search-label">星级筛选</div>
          <Selector
            options={starOptions}
            multiple
            value={selectedStar}
            onChange={setSelectedStar}
            style={{ '--border-radius': '8px' }}
          />
        </div>

        {/* 价格区间 */}
        <div className="search-item">
          <div className="search-label">价格区间</div>
          <Selector
            options={priceOptions}
            multiple
            value={priceRange}
            onChange={setPriceRange}
            style={{ '--border-radius': '8px' }}
          />
        </div>

        {/* 快捷标签 */}
        <div className="search-item">
          <div className="search-label">快捷标签（可多选）</div>
          <div className="tags-container">
            {quickTags.map(tag => (
              <Tag
                key={tag.value}
                color={selectedTags.includes(tag.value) ? 'primary' : 'default'}
                fill={selectedTags.includes(tag.value) ? 'solid' : 'outline'}
                style={{ 
                  marginRight: '8px', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
                onClick={() => handleTagClick(tag)}
              >
                {tag.label}
              </Tag>
            ))}
          </div>
        </div>

        {/* 搜索按钮 */}
        <Button
          block
          color="primary"
          size="large"
          onClick={handleSearch}
          style={{ marginTop: '20px' }}
        >
          查询酒店
        </Button>
      </div>
    </div>
  )
}

export default HomePage