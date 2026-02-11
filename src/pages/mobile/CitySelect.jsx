import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar, SearchBar, Toast } from 'antd-mobile'
import { LeftOutline } from 'antd-mobile-icons'
import { hotCities } from '../../data/cities'
import { allCities } from '../../data/allCities'
import './CitySelect.css'

function CitySelect() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [locating, setLocating] = useState(false)

  // 按省份分组
  const groupedCities = useMemo(() => {
    const groups = {}
    allCities.forEach(city => {
      const province = city.province
      if (!groups[province]) groups[province] = []
      groups[province].push(city)
    })
    return groups
  }, [])

  // 搜索过滤
  const filteredCities = useMemo(() => {
    if (!keyword.trim()) return null
    return allCities.filter(city =>
      city.name.includes(keyword.trim())
    )
  }, [keyword])

  // 选择城市
  const handleSelectCity = (cityName) => {
    sessionStorage.setItem('selectedCity', cityName)
    navigate('/', { state: { selectedCity: cityName } })
  }

  // 高德定位
  const handleLocate = () => {
    if (!window.AMap) {
      Toast.show({ icon: 'fail', content: '地图服务加载中，请稍后重试' })
      return
    }

    setLocating(true)

    window.AMap.plugin('AMap.Geolocation', () => {
      const geolocation = new window.AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        GeoLocationFirst: false,
      })

      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          const { position } = result
          const geocoder = new window.AMap.Geocoder()
          geocoder.getAddress([position.lng, position.lat], (geoStatus, geoResult) => {
            setLocating(false)
            if (geoStatus === 'complete' && geoResult.regeocode) {
              const city = geoResult.regeocode.addressComponent.city ||
                          geoResult.regeocode.addressComponent.province
              const cityName = city.replace(/市$/, '')
              Toast.show({ icon: 'success', content: `定位成功：${cityName}` })
              handleSelectCity(cityName)
            } else {
              Toast.show({ icon: 'fail', content: '无法识别当前城市，请手动选择' })
            }
          })
        } else {
          setLocating(false)
          Toast.show({ icon: 'fail', content: '定位失败，请手动选择城市' })
        }
      })
    })
  }

  return (
    <div className="city-select-page">
      {/* 顶部导航 */}
      <NavBar
        onBack={() => navigate(-1)}
        backArrow={<LeftOutline />}
        style={{
          '--height': '45px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        选择城市
      </NavBar>

      {/* 搜索框 */}
      <div className="city-search-bar">
        <SearchBar
          placeholder="搜索城市"
          value={keyword}
          onChange={setKeyword}
          style={{ '--border-radius': '20px' }}
        />
      </div>

      <div className="city-content">
        {/* 搜索结果 */}
        {filteredCities ? (
          <div className="city-section">
            <div className="section-title">搜索结果</div>
            {filteredCities.length === 0 ? (
              <div className="no-result">未找到匹配的城市</div>
            ) : (
              <div className="city-grid">
                {filteredCities.map(city => (
                  <div
                    key={city.id}
                    className="city-item"
                    onClick={() => handleSelectCity(city.name)}
                  >
                    {city.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* GPS 定位 */}
            <div className="city-section">
              <div className="section-title">当前定位</div>
              <div
                className={`locate-btn ${locating ? 'loading' : ''}`}
                onClick={!locating ? handleLocate : undefined}
              >
                {locating ? '定位中...' : '点击定位当前城市'}
              </div>
            </div>

            {/* 热门城市 */}
            <div className="city-section">
              <div className="section-title">热门城市</div>
              <div className="city-grid">
                {hotCities.map(city => (
                  <div
                    key={city.id}
                    className="city-item hot"
                    onClick={() => handleSelectCity(city.name)}
                  >
                    {city.name}
                  </div>
                ))}
              </div>
            </div>

            {/* 全部城市（按省份分组） */}
            <div className="city-section">
              <div className="section-title">全部城市</div>
              {Object.entries(groupedCities).map(([province, cities]) => (
                <div key={province} className="province-group">
                  <div className="province-name">{province}</div>
                  <div className="city-grid">
                    {cities.map(city => (
                      <div
                        key={city.id}
                        className="city-item"
                        onClick={() => handleSelectCity(city.name)}
                      >
                        {city.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CitySelect
