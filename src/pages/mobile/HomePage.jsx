import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SearchBar, Swiper, Button, Toast } from 'antd-mobile'
import { RightOutline, LeftOutline } from 'antd-mobile-icons'
import { useDateRange } from '../../hooks/useDateRange'
import DatePickerRow from '../../components/DatePickerRow'
import './HomePage.css'

// 热门目的地数据
const destinations = [
  { name: '上海', image: 'https://images.unsplash.com/photo-1537531383496-f4749b802760?w=400&h=300&fit=crop', tag: '魔都' },
  { name: '北京', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop', tag: '首都' },
  { name: '杭州', image: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=400&h=300&fit=crop', tag: '西湖' },
  { name: '成都', image: 'https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=400&h=300&fit=crop', tag: '美食' },
  { name: '三亚', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop', tag: '海滩' },
  { name: '深圳', image: 'https://images.unsplash.com/photo-1533655481794-20a3cf4fc3d0?w=400&h=300&fit=crop', tag: '科技' },
]

// 快捷入口数据
const quickEntries = [
  { icon: '\u{1F31F}', label: '高星推荐', params: { star: '5' } },
  { icon: '\u{1F4B0}', label: '特价优惠', params: { price: '0-300' } },
  { icon: '\u2705', label: '免费取消', params: { tags: '免费取消' } },
  { icon: '\u{1F3E8}', label: '全部酒店', params: {} },
]

// Banner 数据
const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=400&fit=crop',
    title: '上海外滩华尔道夫酒店',
    subtitle: '外滩江景 · 奢华体验',
    hotelId: 7
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&h=400&fit=crop',
    title: '北京王府井希尔顿酒店',
    subtitle: '王府井商圈 · 高端商务',
    hotelId: 8
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=400&fit=crop',
    title: '三亚亚特兰蒂斯酒店',
    subtitle: '海棠湾畔 · 度假首选',
    hotelId: 11
  }
]

function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dateRange = useDateRange()

  const [searchKey, setSearchKey] = useState('')
  const swiperRef = useRef(null)
  const [selectedCity, setSelectedCity] = useState(
    () => sessionStorage.getItem('selectedCity') || '上海'
  )
  const [searchHistory, setSearchHistory] = useState([])

  // 从城市选择页返回时接收选中的城市
  useEffect(() => {
    if (location.state?.selectedCity) {
      setSelectedCity(location.state.selectedCity)
      sessionStorage.setItem('selectedCity', location.state.selectedCity)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // 加载搜索历史
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
    setSearchHistory(history)
  }, [])

  // 搜索处理
  const handleSearch = () => {
    const params = new URLSearchParams()
    params.append('city', selectedCity)
    if (searchKey) params.append('keyword', searchKey)
    if (dateRange.checkInDate) params.append('checkIn', dateRange.checkInDate.toLocaleDateString('zh-CN'))
    if (dateRange.checkOutDate) params.append('checkOut', dateRange.checkOutDate.toLocaleDateString('zh-CN'))

    // 保存搜索历史
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
    const newSearch = {
      city: selectedCity,
      keyword: searchKey,
      date: new Date().toLocaleString('zh-CN'),
      timestamp: Date.now()
    }
    history.unshift(newSearch)
    localStorage.setItem('searchHistory', JSON.stringify(history.slice(0, 5)))
    setSearchHistory(history.slice(0, 5))

    navigate(`/list?${params.toString()}`)
  }

  // 快捷入口点击
  const handleQuickEntry = (entry) => {
    const params = new URLSearchParams({ city: selectedCity, ...entry.params })
    navigate(`/list?${params.toString()}`)
  }

  // 热门目的地点击
  const handleDestination = (cityName) => {
    navigate(`/list?city=${cityName}`)
  }

  // 历史记录点击
  const handleHistoryClick = (item) => {
    const params = new URLSearchParams()
    params.append('city', item.city)
    if (item.keyword) params.append('keyword', item.keyword)
    navigate(`/list?${params.toString()}`)
  }

  // 清除搜索历史
  const clearHistory = () => {
    localStorage.removeItem('searchHistory')
    setSearchHistory([])
    Toast.show({ content: '已清除搜索历史' })
  }

  return (
    <div className="home-page">
      {/* 顶部渐变背景区 */}
      <div className="home-header">
        <div className="header-title">住哪儿</div>
        <div className="header-subtitle">发现全球优质酒店</div>
      </div>

      {/* 核心搜索卡片 */}
      <div className="search-card">
        {/* 城市选择行 */}
        <div className="city-row" onClick={() => navigate('/city-select')}>
          <div className="city-left">
            <span className="city-icon">{'\u{1F4CD}'}</span>
            <span className="city-name">{selectedCity}</span>
          </div>
          <RightOutline className="city-arrow" />
        </div>

        <div className="card-divider" />

        {/* 日期选择行 */}
        <div className="date-row">
          <DatePickerRow dateRange={dateRange} separator="→" />
          {dateRange.nights > 0 && (
            <div className="nights-badge">共{dateRange.nights}晚</div>
          )}
        </div>

        <div className="card-divider" />

        {/* 关键词搜索 */}
        <div className="keyword-row">
          <SearchBar
            placeholder="搜索酒店名称或地标"
            value={searchKey}
            onChange={setSearchKey}
            style={{ '--border-radius': '8px', '--background': '#f5f5f5' }}
          />
        </div>

        {/* 搜索按钮 */}
        <Button
          block
          color="primary"
          size="large"
          className="search-btn"
          onClick={handleSearch}
        >
          搜索酒店
        </Button>
      </div>

      {/* 快捷功能入口 */}
      <div className="quick-entries">
        {quickEntries.map((entry, index) => (
          <div
            key={index}
            className="quick-entry-item"
            onClick={() => handleQuickEntry(entry)}
          >
            <div className="entry-icon">{entry.icon}</div>
            <div className="entry-label">{entry.label}</div>
          </div>
        ))}
      </div>

      {/* Banner 轮播 */}
      <div className="banner-section">
        <div className="banner-wrapper">
          <Swiper
            ref={swiperRef}
            autoplay={{ delay: 3000 }}
            loop
            style={{ '--border-radius': '12px' }}
            indicator={(total, current) => (
              <div className="custom-indicator">{current + 1} / {total}</div>
            )}
          >
            {banners.map(banner => (
              <Swiper.Item key={banner.id}>
                <div className="banner-item" onClick={() => navigate(`/detail/${banner.hotelId}`)}>
                  <img src={banner.image} alt={banner.title} />
                  <div className="banner-overlay">
                    <div className="banner-title">{banner.title}</div>
                    <div className="banner-subtitle">{banner.subtitle}</div>
                  </div>
                </div>
              </Swiper.Item>
            ))}
          </Swiper>
          <div className="banner-nav banner-prev" onClick={() => swiperRef.current?.swipePrev()}>
            <LeftOutline />
          </div>
          <div className="banner-nav banner-next" onClick={() => swiperRef.current?.swipeNext()}>
            <RightOutline />
          </div>
        </div>
      </div>

      {/* 热门目的地 */}
      <div className="section-block">
        <div className="section-header">
          <span className="section-title">热门目的地</span>
        </div>
        <div className="destination-grid">
          {destinations.map((dest, index) => (
            <div
              key={index}
              className="destination-card"
              onClick={() => handleDestination(dest.name)}
            >
              <img src={dest.image} alt={dest.name} />
              <div className="dest-info">
                <span className="dest-name">{dest.name}</span>
                <span className="dest-tag">{dest.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 最近搜索 */}
      {searchHistory.length > 0 && (
        <div className="section-block">
          <div className="section-header">
            <span className="section-title">最近搜索</span>
            <span className="section-action" onClick={clearHistory}>清除</span>
          </div>
          <div className="history-list">
            {searchHistory.map((item, index) => (
              <div
                key={index}
                className="history-item"
                onClick={() => handleHistoryClick(item)}
              >
                <span className="history-city">{item.city}</span>
                {item.keyword && <span className="history-keyword">{item.keyword}</span>}
                <span className="history-date">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: '20px' }} />
    </div>
  )
}

export default HomePage
