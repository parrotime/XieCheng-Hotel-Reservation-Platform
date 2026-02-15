-- 为酒店表添加经纬度字段（高德地图选点）
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS latitude  NUMERIC(10, 7);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
