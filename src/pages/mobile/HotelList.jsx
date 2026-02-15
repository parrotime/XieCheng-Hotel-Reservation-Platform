import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  SearchBar,
  Dropdown,
  Empty,
  NavBar,
  Skeleton,
  Tag,
} from 'antd-mobile'
import { LeftOutline } from 'antd-mobile-icons'
import { getHotels } from '../../api/hotels'
import { starOptions, priceOptions, sortOptions, facilityOptions } from '../../constants/filterOptions'
import { useDateRange } from '../../hooks/useDateRange.jsx'
import DatePickerRow from '../../components/DatePickerRow'
import HotelCard from '../../components/HotelCard'
import './HotelList.css'

const ITEM_HEIGHT = 138  // 每个 HotelCard 的估算高度
const OVERSCAN = 5       // 视口外额外渲染的缓冲条数

function HotelList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dateRange = useDateRange()

  // 状态管理
  const [allHotels, setAllHotels] = useState([])
  const [filteredHotels, setFilteredHotels] = useState([])
  const [searchKey, setSearchKey] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedStar, setSelectedStar] = useState([])
  const [priceRange, setPriceRange] = useState([])
  const [selectedFacilities, setSelectedFacilities] = useState([])
  const [sortType, setSortType] = useState('default')
  const [loading, setLoading] = useState(true)

  // 虚拟滚动
  const listRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewHeight, setViewHeight] = useState(600)

  const { visibleItems, totalHeight, offsetTop } = useMemo(() => {
    const total = filteredHotels.length
    const totalH = total * ITEM_HEIGHT
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN)
    const end = Math.min(total, Math.ceil((scrollTop + viewHeight) / ITEM_HEIGHT) + OVERSCAN)
    return {
      visibleItems: filteredHotels.slice(start, end),
      totalHeight: totalH,
      offsetTop: start * ITEM_HEIGHT,
    }
  }, [filteredHotels, scrollTop, viewHeight])

  const handleListScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  // 监听容器尺寸
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    setViewHeight(el.clientHeight)
    const ro = new ResizeObserver(([entry]) => setViewHeight(entry.contentRect.height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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

  // 筛选数据（基于 API 返回的数据做客户端筛选）
  const filterData = useCallback(() => {
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
    if (selectedFacilities.length > 0) {
      result = result.filter(h =>
        Array.isArray(h.facilities) &&
        selectedFacilities.every(f => h.facilities.includes(f))
      )
    }

    result = sortHotels(result, sortType)
    setFilteredHotels(result)
  }, [allHotels, selectedCity, searchKey, selectedStar, priceRange, selectedFacilities, sortType])

  // 监听筛选条件变化，自动重新筛选
  useEffect(() => {
    if (allHotels.length === 0 && loading) return
    filterData()
    setScrollTop(0) // 筛选变化时重置滚动位置
    if (listRef.current) listRef.current.scrollTop = 0
  }, [filterData, loading, allHotels.length])

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

  // 筛选栏标题（带角标）
  const starTitle = selectedStar.length > 0 ? `星级(${selectedStar.length})` : '星级'
  const priceTitle = priceRange.length > 0 ? `价格(${priceRange.length})` : '价格'
  const facilityTitle = selectedFacilities.length > 0 ? `设施(${selectedFacilities.length})` : '设施'
  const sortTitle = sortOptions.find(s => s.key === sortType)?.title || '排序'

  return (
    <div className="hotel-list-page">
      {/* 顶部导航 */}
      <NavBar
        onBack={handleBack}
        backArrow={<LeftOutline />}
        style={{ '--height': '45px', '--border-bottom': '1px solid #f0f0f0' }}
      >
        酒店列表
      </NavBar>

      {/* 搜索和筛选区域 */}
      <div className="filter-section">
        {/* 城市 + 日期行 */}
        <div className="search-context-row">
          <div className="city-badge" onClick={() => navigate('/city-select', { state: { from: '/list' } })}>
            <span className="city-icon">📍</span>
            <span className="city-name">{selectedCity || '选择城市'}</span>
            <span className="city-arrow">›</span>
          </div>
          <div className="date-compact">
            <DatePickerRow dateRange={dateRange} separator="→" />
            {dateRange.nights > 0 && (
              <span className="nights-badge">共{dateRange.nights}晚</span>
            )}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="search-box">
          <SearchBar
            placeholder={selectedCity ? `在${selectedCity}搜索酒店` : '搜索酒店名称'}
            value={searchKey}
            onChange={setSearchKey}
            onSearch={() => {}}
            style={{ '--border-radius': '20px' }}
          />
        </div>

        {/* 筛选条件 */}
        <div className="filter-bar">
          <Dropdown>
            <Dropdown.Item key="star" title={starTitle}>
              <div className="filter-panel">
                {starOptions.map(opt => (
                  <Tag
                    key={opt.value}
                    className={`filter-chip ${selectedStar.includes(opt.value) ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedStar(prev =>
                        prev.includes(opt.value)
                          ? prev.filter(v => v !== opt.value)
                          : [...prev, opt.value]
                      )
                    }}
                  >
                    {opt.label}
                  </Tag>
                ))}
              </div>
            </Dropdown.Item>

            <Dropdown.Item key="price" title={priceTitle}>
              <div className="filter-panel">
                {priceOptions.map(opt => (
                  <Tag
                    key={opt.value}
                    className={`filter-chip ${priceRange.includes(opt.value) ? 'active' : ''}`}
                    onClick={() => {
                      setPriceRange(prev =>
                        prev.includes(opt.value)
                          ? prev.filter(v => v !== opt.value)
                          : [...prev, opt.value]
                      )
                    }}
                  >
                    {opt.label}
                  </Tag>
                ))}
              </div>
            </Dropdown.Item>

            <Dropdown.Item key="facility" title={facilityTitle}>
              <div className="filter-panel">
                {facilityOptions.map(opt => (
                  <Tag
                    key={opt.value}
                    className={`filter-chip ${selectedFacilities.includes(opt.value) ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFacilities(prev =>
                        prev.includes(opt.value)
                          ? prev.filter(v => v !== opt.value)
                          : [...prev, opt.value]
                      )
                    }}
                  >
                    {opt.label}
                  </Tag>
                ))}
              </div>
            </Dropdown.Item>

            <Dropdown.Item key="sort" title={sortTitle}>
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
        找到 <span className="highlight">{filteredHotels.length}</span> 家酒店
        {selectedCity && ` · ${selectedCity}`}
        {selectedStar.length > 0 && ` · ${selectedStar.map(s => s + '星').join('、')}`}
        {selectedFacilities.length > 0 && ` · ${selectedFacilities.join('、')}`}
      </div>

      {/* 酒店列表 — 虚拟滚动 */}
      <div
        className="hotel-list"
        ref={listRef}
        onScroll={handleListScroll}
        style={{ flex: 1, overflow: 'auto' }}
      >
        {loading ? (
          // 骨架屏
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <Skeleton animated style={{ width: 120, height: 120, borderRadius: 8 }} />
              <div className="skeleton-info">
                <Skeleton.Title animated />
                <Skeleton.Paragraph lineCount={2} animated />
              </div>
            </div>
          ))
        ) : filteredHotels.length === 0 ? (
          <Empty
            description="暂无符合条件的酒店"
            style={{ marginTop: '60px' }}
          />
        ) : (
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ position: 'absolute', top: offsetTop, left: 0, right: 0 }}>
              {visibleItems.map(hotel => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onClick={handleHotelClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HotelList
