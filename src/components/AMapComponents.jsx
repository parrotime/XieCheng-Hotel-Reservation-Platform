import React, { useEffect, useRef, useState, useCallback } from 'react'

const AMAP_KEY = 'bacb7ea0fe70a484fa633d3ea4506942'
const AMAP_SECRET = '2bbc133ce25d73f5ae112f234d9fbf9f'

// 全局只加载一次
let loadPromise = null
function loadAMap() {
  if (loadPromise) return loadPromise
  loadPromise = new Promise((resolve, reject) => {
    if (window.AMap) { resolve(window.AMap); return }
    window._AMapSecurityConfig = { securityJsCode: AMAP_SECRET }
    const s = document.createElement('script')
    s.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
    s.onload = () => resolve(window.AMap)
    s.onerror = () => reject(new Error('高德地图加载失败'))
    document.head.appendChild(s)
  })
  return loadPromise
}

/**
 * 地图选点组件（商户端 — 创建/编辑酒店时使用）
 * Props:
 *   value: { latitude, longitude } | null
 *   onChange: ({ latitude, longitude }) => void
 *   address: string — 用于地址搜索定位
 */
export function MapPicker({ value, onChange, address }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [searchText, setSearchText] = useState('')

  // 初始化地图
  useEffect(() => {
    let cancelled = false
    loadAMap().then(AMap => {
      if (cancelled || !containerRef.current) return
      const center = value?.longitude
        ? [value.longitude, value.latitude]
        : [116.397428, 39.90923] // 默认北京天安门

      const map = new AMap.Map(containerRef.current, {
        zoom: 15,
        center,
        resizeEnable: true,
      })

      const marker = new AMap.Marker({
        position: center,
        draggable: true,
        cursor: 'move',
      })
      marker.setMap(map)

      // 拖拽结束 → 回调坐标
      marker.on('dragend', () => {
        const pos = marker.getPosition()
        onChange?.({ latitude: pos.lat, longitude: pos.lng })
      })

      // 点击地图 → 移动标记
      map.on('click', (e) => {
        marker.setPosition(e.lnglat)
        onChange?.({ latitude: e.lnglat.lat, longitude: e.lnglat.lng })
      })

      mapRef.current = map
      markerRef.current = marker
      setReady(true)
    })
    return () => { cancelled = true; mapRef.current?.destroy() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // value 外部变化时同步标记位置
  useEffect(() => {
    if (!ready || !value?.longitude || !markerRef.current) return
    const pos = [value.longitude, value.latitude]
    markerRef.current.setPosition(pos)
    mapRef.current?.setCenter(pos)
  }, [value?.latitude, value?.longitude, ready])

  // 地址搜索
  const handleSearch = useCallback((text) => {
    if (!ready || !text) return
    const AMap = window.AMap
    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder({ city: '全国' })
      geocoder.getLocation(text, (status, result) => {
        if (status === 'complete' && result.geocodes?.length > 0) {
          const { lng, lat } = result.geocodes[0].location
          markerRef.current?.setPosition([lng, lat])
          mapRef.current?.setCenter([lng, lat])
          onChange?.({ latitude: lat, longitude: lng })
        }
      })
    })
  }, [ready, onChange])

  // 用地址自动定位
  const handleLocateByAddress = () => {
    handleSearch(address || searchText)
  }

  return (
    <div className="map-picker">
      <div className="map-picker-toolbar">
        <input
          type="text"
          placeholder="输入地址搜索定位"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(searchText) } }}
        />
        <button type="button" onClick={() => handleSearch(searchText)}>搜索</button>
        {address && (
          <button type="button" onClick={handleLocateByAddress}>按地址定位</button>
        )}
      </div>
      <div ref={containerRef} style={{ width: '100%', height: 300, borderRadius: 8, overflow: 'hidden' }} />
      {value?.latitude && (
        <div className="map-picker-coords">
          经度: {value.longitude?.toFixed(6)} &nbsp; 纬度: {value.latitude?.toFixed(6)}
        </div>
      )}
    </div>
  )
}

/**
 * 地图展示组件（移动端 — 酒店详情页使用）
 * Props:
 *   latitude: number
 *   longitude: number
 *   name: string — 标记标题
 */
export function MapDisplay({ latitude, longitude, name }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!latitude || !longitude) return
    let map = null
    loadAMap().then(AMap => {
      if (!containerRef.current) return
      map = new AMap.Map(containerRef.current, {
        zoom: 15,
        center: [longitude, latitude],
        dragEnable: true,
        zoomEnable: true,
      })
      const marker = new AMap.Marker({
        position: [longitude, latitude],
        title: name || '酒店位置',
      })
      marker.setMap(map)
    })
    return () => map?.destroy()
  }, [latitude, longitude, name])

  if (!latitude || !longitude) return null

  return (
    <div ref={containerRef} style={{ width: '100%', height: 200, borderRadius: 8, overflow: 'hidden' }} />
  )
}
