# 易宿酒店预订平台 (Hotel Reservation Platform)

全栈酒店预订系统，包含移动端用户预订流程和 PC 端商户/管理员后台。

## 技术栈

**前端：** React 18 + React Router 7 + Vite 7 + antd-mobile 5（移动端）+ 纯 CSS（PC端）

**后端：** Node.js + Express 5 + PostgreSQL 18 + JWT 鉴权

## 项目结构

```
hotel-booking/
├── src/                          # 前端源码
│   ├── api/                      # API 请求层（axios 封装）
│   │   ├── request.js            # axios 实例 + 拦截器（JWT、401 处理）
│   │   ├── auth.js               # 登录/注册/用户信息
│   │   ├── hotels.js             # 酒店 CRUD + 审核 + 库存
│   │   └── orders.js             # 订单相关
│   ├── components/               # 通用组件
│   │   ├── HotelCard.jsx         # 酒店列表卡片（移动端）
│   │   ├── StarRating.jsx        # 星级展示
│   │   ├── PriceDisplay.jsx      # 价格格式化展示
│   │   ├── RatingDisplay.jsx     # 评分展示
│   │   ├── DatePickerRow.jsx     # 日期选择行
│   │   ├── MobileLayout.jsx      # 移动端布局（含底部 TabBar）
│   │   ├── LoginExpiredModal.jsx # 登录过期全局弹窗
│   │   └── StatusTag.jsx         # 状态标签
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useAuth.js            # PC 端鉴权（角色校验 + 跳转）
│   │   └── useDateRange.jsx      # 全局日期 Context（跨页面共享）
│   ├── utils/                    # 工具函数
│   │   ├── dateUtils.js          # 日期格式化、间夜计算
│   │   └── hotelUtils.js         # 最低价提取、星级渲染
│   ├── constants/                # 共享常量
│   │   └── filterOptions.js      # 筛选选项、状态映射、排序配置
│   ├── pages/
│   │   ├── mobile/               # 移动端页面（C 端用户）
│   │   │   ├── HomePage.jsx      # 首页（搜索、Banner、热门城市）
│   │   │   ├── HotelList.jsx     # 酒店列表（筛选、无限滚动）
│   │   │   ├── HotelDetail.jsx   # 酒店详情（图片、房型、预订）
│   │   │   ├── CitySelect.jsx    # 城市选择（高德定位）
│   │   │   ├── PayPage.jsx       # 支付页（倒计时、多支付方式）
│   │   │   ├── PaySuccess.jsx    # 支付成功
│   │   │   ├── OrdersPage.jsx    # 订单列表（Tab 分类、下拉刷新）
│   │   │   ├── OrderDetail.jsx   # 订单详情（状态时间线）
│   │   │   └── ProfilePage.jsx   # 个人中心
│   │   └── pc/                   # PC 端页面（B 端管理）
│   │       ├── Login.jsx         # 登录/注册（双角色）
│   │       ├── HotelManage.jsx   # 商户后台（酒店管理、订单、统计）
│   │       ├── HotelAudit.jsx    # 管理员审核（批量操作、筛选排序）
│   │       └── DevDashboard.jsx  # 开发者工具（仅 dev 环境）
│   └── App.jsx                   # 路由配置
├── server/                       # 后端源码
│   └── src/
│       ├── app.js                # Express 入口 + 中间件
│       ├── config/               # 数据库连接配置
│       ├── controllers/          # 业务逻辑（auth、hotels、orders）
│       ├── middleware/            # JWT 鉴权 + 角色授权中间件
│       ├── routes/               # RESTful 路由定义
│       ├── scheduler.js          # 定时任务（超时订单自动取消）
│       └── seed.js               # 数据库初始化种子数据
├── database.md                   # 数据库表结构文档
├── vite.config.js                # Vite 配置（含 API 代理）
└── package.json
```

## 快速启动

### 1. 数据库

安装 PostgreSQL，创建数据库 `hotel_booking`，执行 `database.md` 中的建表 SQL。

### 2. 后端

```bash
cd server
npm install
npm run seed    # 初始化种子数据（演示账号 + 示例酒店）
npm run dev     # 启动后端 http://localhost:3000
```

### 3. 前端

```bash
cd hotel-booking
npm install
npm run dev     # 启动前端 http://localhost:5173
```

Vite 已配置 `/api` 和 `/uploads` 代理到后端 3000 端口。

## 演示账号

| 角色 | 用户名 | 密码 | 入口 |
|------|--------|------|------|
| 商户 | merchant | 123456 | /login → /manage |
| 管理员 | admin | 123456 | /login → /audit |
| 普通用户 | — | — | / （移动端首页） |

## 功能概览

### 移动端（C 端用户预订流程）

- **首页：** Banner 轮播（点击跳转详情）、城市定位（高德地图）、日期选择、关键词搜索、快捷标签、热门城市、搜索历史
- **列表页：** 多维筛选（星级/价格/设施/排序）、无限滚动分页、骨架屏加载
- **详情页：** 图片轮播 + 全屏查看、酒店信息/设施/地址、房型列表（按价格排序）、实时库存显示、预订确认弹窗
- **预订流程：** 15 分钟支付倒计时、多支付方式、订单状态时间线、取消/退款

### PC 端（B 端管理后台）

- **登录/注册：** 双角色（商户/管理员）、自动识别跳转、表单验证
- **商户后台：** 酒店 CRUD、图片上传/排序、房型管理、库存日历（批量设置）、订单管理、经营统计
- **管理员审核：** 统计卡片、搜索/筛选/排序、批量通过/拒绝、拒绝原因模板、酒店详情弹窗

## 数据库设计

8 张核心表：`users`、`hotels`、`room_types`、`rooms`、`room_type_prices`（价格日历）、`orders`、`order_items`、`reviews`

支持动态定价（按日期设置不同价格）、库存管理（按日期控制可售数量）、多房型预订。

详细表结构见 [database.md](./database.md)。

## 技术亮点

- **纯 CSS 实现 PC 端**：商户后台、审核页、登录页全部脱离 antd，使用原生 CSS 实现企业级 UI
- **全局日期 Context**：通过 React Context 跨页面共享入住/离店日期状态，避免 prop drilling
- **JWT + 自定义事件鉴权**：401 响应触发 `auth:expired` 事件，全局 LoginExpiredModal 监听并提示重新登录
- **定时任务调度**：服务端每 60 秒扫描超时未支付订单，自动取消并恢复库存
- **高德地图定位**：城市选择页集成 AMap JS API，支持 GPS 定位当前城市
- **批量审核操作**：支持多选 + 批量通过/拒绝，拒绝原因模板快捷选择
- **库存日历管理**：按日期可视化管理房型库存，支持批量设置（全部/工作日/周末）
