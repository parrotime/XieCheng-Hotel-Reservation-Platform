# 项目数据库信息（PostgreSQL）

当前使用 PostgreSQL 18.1，本地开发环境。
数据库名称：hotel_booking
连接信息（开发用）：
- Host: localhost
- Port: 5432
- User: postgres
- 密码: 123456
- 默认 schema: public

## 核心表结构（全部在 public schema 下）

-- 1. 用户表
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100),
    phone           VARCHAR(30),
    role            VARCHAR(20) NOT NULL DEFAULT 'guest' 
                    CHECK (role IN ('guest', 'hotel_admin', 'system_admin', 'staff')),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 酒店表
CREATE TABLE hotels (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    name_en         VARCHAR(100),
    star_rating     SMALLINT CHECK (star_rating BETWEEN 1 AND 5),
    address         TEXT NOT NULL,
    city            VARCHAR(50),
    province        VARCHAR(50),
    country         VARCHAR(50) DEFAULT '中国',
    latitude        NUMERIC(10,7),
    longitude       NUMERIC(10,7),
    description     TEXT,
    facilities      JSONB,                      -- 设施列表 e.g. ["wifi","停车","泳池"]
    images          JSONB,                      -- 图片数组 [{url,desc,is_main}]
    status          VARCHAR(20) DEFAULT 'pending' 
                    CHECK (status IN ('pending','approved','rejected','offline')),
    created_by      BIGINT REFERENCES users(id),  -- 酒店管理员/创建人
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 房型表（不是具体房间，而是类别）
CREATE TABLE room_types (
    id              BIGSERIAL PRIMARY KEY,
    hotel_id        BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name            VARCHAR(60) NOT NULL,       -- 豪华大床房 / 海景双床房
    name_en         VARCHAR(60),
    description     TEXT,
    bed_type        VARCHAR(50),                -- 大床/双床/三人间...
    max_guests      SMALLINT DEFAULT 2,
    area_sqm        SMALLINT,
    facilities      JSONB,
    default_price   NUMERIC(10,2),              -- 门市价（参考价）
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (hotel_id, name)
);

-- 4. 具体房间（库存最小单位）
CREATE TABLE rooms (
    id              BIGSERIAL PRIMARY KEY,
    hotel_id        BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id    BIGINT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    room_number     VARCHAR(20) NOT NULL,       -- 101, 豪华套房302
    floor           SMALLINT,
    status          VARCHAR(20) DEFAULT 'active' 
                    CHECK (status IN ('active','maintenance','disabled')),
    remark          TEXT,                       -- 维修中、禁烟房、带阳台...
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (hotel_id, room_number)
);

-- 5. 房型价格日历（支持动态定价）
CREATE TABLE room_type_prices (
    id              BIGSERIAL PRIMARY KEY,
    room_type_id    BIGINT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    price           NUMERIC(10,2) NOT NULL,
    promo_price     NUMERIC(10,2),              -- 促销价（可选）
    stock           INTEGER DEFAULT 10,         -- 当日该房型剩余库存（可超卖控制）
    is_blocked      BOOLEAN DEFAULT FALSE,
    updated_by      BIGINT REFERENCES users(id),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (room_type_id, date)
);

-- 6. 订单表（核心）
CREATE TABLE orders (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    hotel_id        BIGINT NOT NULL REFERENCES hotels(id),
    check_in_date   DATE NOT NULL,
    check_out_date  DATE NOT NULL CHECK (check_out_date > check_in_date),
    total_nights    SMALLINT GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
    total_amount    NUMERIC(12,2) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'pending' 
                    CHECK (status IN (
                        'pending',          -- 待支付/待确认
                        'paid',             -- 已支付
                        'confirmed',        -- 酒店确认
                        'checked_in', 
                        'checked_out',
                        'cancelled',
                        'rejected',
                        'refunded'
                    )),
    payment_method  VARCHAR(30),
    payment_time    TIMESTAMPTZ,
    cancelled_by    VARCHAR(20),                -- user / hotel / system
    cancel_reason   TEXT,
    remark          TEXT,                       -- 订单备注 / 特殊要求
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 订单-房间明细（支持一次订多间房/多种房型）
CREATE TABLE order_items (
    id              BIGSERIAL PRIMARY KEY,
    order_id        BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    room_type_id    BIGINT NOT NULL REFERENCES room_types(id),
    room_id         BIGINT REFERENCES rooms(id),           -- 可为空（到店安排）
    check_in_date   DATE NOT NULL,
    check_out_date  DATE NOT NULL,
    quantity        SMALLINT NOT NULL DEFAULT 1,           -- 预订几间
    price_per_night NUMERIC(10,2) NOT NULL,
    subtotal        NUMERIC(12,2) GENERATED ALWAYS AS (quantity * price_per_night * (check_out_date - check_in_date)) STORED,
    guest_names     TEXT[],                                 -- 入住人姓名（可选）
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 评论表
CREATE TABLE reviews (
    id              BIGSERIAL PRIMARY KEY,
    order_id        BIGINT UNIQUE NOT NULL REFERENCES orders(id),
    user_id         BIGINT NOT NULL REFERENCES users(id),
    hotel_id        BIGINT NOT NULL REFERENCES hotels(id),
    rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
    content         TEXT,
    reply_content   TEXT,                           -- 酒店回复
    reply_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
