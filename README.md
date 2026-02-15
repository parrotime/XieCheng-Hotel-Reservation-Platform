# 易宿 — 全栈酒店预订平台

> 移动端用户预订 + PC 端商户/管理员后台，覆盖完整的酒店预订业务闭环。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + React Router 7 + Vite 7 |
| 移动端 UI | antd-mobile 5 |
| PC 端 UI | 纯 CSS（脱离组件库，手写企业级界面） |
| 后端 | Node.js + Express 5 |
| 数据库 | PostgreSQL 16 |
| 鉴权 | JWT（access token + 角色授权中间件） |
| 实时通信 | Socket.IO（订单状态推送） |
| 参数校验 | Joi schema 校验 |
| 安全 | Helmet + express-rate-limit + bcryptjs |
| 日志 | Winston + Morgan |
| 前端测试 | Vitest + Testing Library |
| 后端测试 | Jest + Supertest |
| CI/CD | GitHub Actions（Lint → Test → Build） |
| 容器化 | Docker + docker-compose + Nginx 反向代理 |
| 地图 | 高德地图 JS API（GPS 城市定位） |

## 项目结构

```
hotel-booking/
├── src/                            # 前端源码
│   ├── api/                        # Axios 封装 + 拦截器（JWT 注入、401 处理）
│   │   ├── request.js              # axios 实例 + 请求/响应拦截器
│   │   ├── auth.js                 # 登录 / 注册 / 用户信息
│   │   ├── hotels.js               # 酒店 CRUD + 审核 + 库存
│   │   └── orders.js               # 订单 CRUD + 支付 + 取消
│   ├── components/                 # 通用组件（React.memo 优化）
│   │   ├── HotelCard.jsx           # 酒店列表卡片
│   │   ├── StarRating.jsx          # 星级展示
│   │   ├── PriceDisplay.jsx        # 价格格式化
│   │   ├── RatingDisplay.jsx       # 评分展示
│   │   ├── DatePickerRow.jsx       # 日期选择行
│   │   ├── MobileLayout.jsx        # 移动端布局（底部 TabBar）
│   │   ├── ErrorBoundary.jsx       # 错误边界（降级 UI + 重试）
│   │   ├── LoginExpiredModal.jsx   # 登录过期全局弹窗
│   │   └── StatusTag.jsx           # 状态标签
│   ├── hooks/                      # 自定义 Hooks
│   │   ├── useAuth.js              # PC 端鉴权（角色校验 + 自动跳转）
│   │   └── useDateRange.jsx        # 全局日期 Context（跨页面共享）
│   ├── utils/                      # 工具函数
│   │   ├── dateUtils.js            # 日期格式化、间夜计算
│   │   └── hotelUtils.js           # 最低价提取、星级渲染
│   ├── constants/
│   │   └── filterOptions.js        # 筛选选项、状态映射、排序配置
│   ├── pages/
│   │   ├── mobile/                 # 移动端页面（C 端用户）
│   │   │   ├── HomePage.jsx        # 首页（搜索、Banner、热门城市）
│   │   │   ├── HotelList.jsx       # 酒店列表（多维筛选、无限滚动）
│   │   │   ├── HotelDetail.jsx     # 酒店详情（图片轮播、房型、预订）
│   │   │   ├── CitySelect.jsx      # 城市选择（高德定位）
│   │   │   ├── PayPage.jsx         # 支付页（15 分钟倒计时）
│   │   │   ├── PaySuccess.jsx      # 支付成功
│   │   │   ├── OrdersPage.jsx      # 订单列表（Tab 分类、下拉刷新）
│   │   │   ├── OrderDetail.jsx     # 订单详情（状态时间线）
│   │   │   └── ProfilePage.jsx     # 个人中心
│   │   └── pc/                     # PC 端页面（B 端管理）
│   │       ├── Login.jsx           # 登录 / 注册（双角色切换）
│   │       ├── HotelManage.jsx     # 商户后台（酒店、订单、统计）
│   │       ├── HotelAudit.jsx      # 管理员审核（批量操作）
│   │       └── DevDashboard.jsx    # 开发者工具面板
│   ├── __tests__/                  # 前端单元测试
│   └── App.jsx                     # 路由配置（React.lazy 懒加载）
├── server/                         # 后端源码
│   ├── src/
│   │   ├── app.js                  # Express 入口 + 中间件注册
│   │   ├── config/db.js            # PostgreSQL 连接池
│   │   ├── controllers/            # 业务逻辑层
│   │   ├── middleware/             # JWT 鉴权 + 角色授权 + 错误处理
│   │   ├── validators/            # Joi 参数校验 schema
│   │   ├── routes/                # RESTful 路由
│   │   ├── utils/logger.js        # Winston 日志配置
│   │   ├── websocket.js           # Socket.IO 实时推送
│   │   ├── scheduler.js           # 定时任务（超时订单自动取消）
│   │   └── seed.js                # 种子数据初始化
│   ├── __tests__/                 # 后端单元测试
│   └── Dockerfile
├── .github/workflows/ci.yml      # GitHub Actions CI
├── docker-compose.yml             # 一键部署（DB + Server + Nginx）
├── Dockerfile                     # 前端多阶段构建（Nginx）
├── nginx.conf                     # Nginx 反向代理 + SPA 路由
├── database.md                    # 数据库表结构文档
└── vite.config.js                 # Vite 配置（代理 + 构建分包）
```

## 快速启动

### 方式一：Docker 一键部署

```bash
docker-compose up --build
```

启动后访问 `http://localhost`（前端）、`http://localhost:3000`（API）。

### 方式二：本地开发

**1. 数据库**

安装 PostgreSQL，创建数据库 `hotel_booking`，执行 `database.md` 中的建表 SQL。

**2. 后端**

```bash
cd server
npm install
# 配置 .env（DB_HOST、DB_PORT、DB_USER、DB_PASSWORD、DB_NAME、JWT_SECRET）
npm run seed    # 初始化种子数据（演示账号 + 示例酒店）
npm run dev     # 启动后端 http://localhost:3000
```

**3. 前端**

```bash
npm install
npm run dev     # 启动前端 http://localhost:5173
```

Vite 已配置 `/api` 和 `/uploads` 代理到后端 3000 端口，无需额外配置跨域。

## 演示账号

| 角色 | 用户名 | 密码 | 入口 |
|------|--------|------|------|
| 商户 | merchant | 123456 | `/login` → 自动跳转 `/manage` |
| 管理员 | admin | 123456 | `/login` → 自动跳转 `/audit` |
| 普通用户 | 自行注册 | — | `/`（移动端首页） |

## 功能概览

### 移动端（C 端用户预订流程）

- **首页** — Banner 轮播、城市 GPS 定位（高德地图）、日期选择器、关键词搜索、快捷标签、热门城市、搜索历史
- **列表页** — 多维筛选（星级 / 价格区间 / 设施 / 排序）、无限滚动分页、骨架屏加载态
- **详情页** — 图片轮播 + 全屏查看、酒店信息 / 设施 / 地址、房型列表（实时库存）、预订确认弹窗
- **预订流程** — 15 分钟支付倒计时 → 超时自动取消、多支付方式模拟、订单状态时间线、取消退款
- **个人中心** — 用户信息、订单入口

### PC 端（B 端管理后台）

- **登录 / 注册** — 双角色（商户 / 管理员）、JWT 鉴权、自动识别跳转
- **商户后台** — 酒店 CRUD、图片上传 / 排序、房型管理、库存日历（批量设置：全部 / 工作日 / 周末）、订单管理、经营统计图表
- **管理员审核** — 统计卡片、搜索 / 筛选 / 排序、单个 & 批量通过 / 拒绝、拒绝原因模板、酒店详情弹窗

## API 接口

所有接口统一响应格式：`{ code, data, message }`

### 认证

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | `/api/auth/register` | 注册 | — |
| POST | `/api/auth/login` | 登录 | — |
| GET | `/api/auth/me` | 获取当前用户 | JWT |

### 酒店

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/api/hotels` | 酒店列表（支持筛选分页） | 可选 |
| GET | `/api/hotels/:id` | 酒店详情 | — |
| POST | `/api/hotels` | 创建酒店 | 商户 |
| PUT | `/api/hotels/:id` | 更新酒店 | 商户 |
| DELETE | `/api/hotels/:id` | 删除酒店 | 商户 |
| PATCH | `/api/hotels/:id/status` | 审核（通过 / 拒绝 / 下线） | 管理员 |

### 商户专属

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/hotels/merchant/my` | 我的酒店列表 |
| GET | `/api/hotels/merchant/orders` | 我的订单 |
| GET | `/api/hotels/merchant/stats` | 经营统计 |
| GET | `/api/hotels/merchant/inventory` | 查询库存 |
| PUT | `/api/hotels/merchant/inventory` | 更新库存 |

### 订单

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/orders` | 创建订单 |
| GET | `/api/orders` | 订单列表（按状态筛选） |
| GET | `/api/orders/:id` | 订单详情 |
| PUT | `/api/orders/:id/pay` | 支付订单 |
| PUT | `/api/orders/:id/cancel` | 取消订单 |

### 其他

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/upload` | 图片上传（multer） |
| GET | `/api/health` | 健康检查 |

## 数据库设计

8 张核心表：`users`、`hotels`、`room_types`、`rooms`、`room_type_prices`（价格日历）、`orders`、`order_items`、`reviews`

支持动态定价（按日期设置不同价格）、库存管理（按日期控制可售数量）、多房型预订。

详细表结构见 [database.md](./database.md)。

## 测试

```bash
# 前端单元测试（Vitest + Testing Library）
npm test

# 后端单元测试（Jest + Supertest）
cd server && npm test
```

- 前端：组件渲染（HotelCard）、错误边界（ErrorBoundary）、请求拦截器（JWT 注入 / 401 处理）
- 后端：JWT 鉴权中间件、认证 API（注册 / 登录）、Joi 参数校验

## CI/CD

GitHub Actions 在每次 push / PR 到 `main` 时自动执行：

```
Frontend:  npm ci → Lint → Unit Tests → Build
Backend:   npm ci → Unit Tests
```

## 安全措施

- **Helmet** — 设置安全 HTTP 响应头
- **Rate Limiting** — API 全局限流（100 次 / 15 分钟）、登录接口更严格限流（20 次 / 15 分钟）
- **JWT 鉴权** — 角色授权中间件（hotel_admin / system_admin / developer）
- **Joi 校验** — 所有写入接口参数校验，防止非法输入
- **bcryptjs** — 密码哈希存储
- **401 全局处理** — 前端 axios 拦截器捕获 401，触发 `auth:expired` 自定义事件，弹出重新登录弹窗

## 性能优化

- **路由懒加载** — React.lazy + Suspense，按需加载页面组件
- **React.memo** — 高频渲染组件（HotelCard、StarRating、PriceDisplay、RatingDisplay）缓存优化
- **ErrorBoundary** — 错误边界兜底，局部错误不影响全局
- **图片懒加载** — `loading="lazy"` 延迟加载非首屏图片
- **Vite 分包** — manualChunks 拆分 vendor（React）和 ui-mobile（antd-mobile），利用浏览器缓存

## 技术亮点

- **纯 CSS 实现 PC 端** — 商户后台、审核页、登录页全部脱离 UI 组件库，手写企业级界面
- **全局日期 Context** — React Context + Provider 跨页面共享入住 / 离店日期，避免 prop drilling
- **JWT + 自定义事件鉴权** — 401 响应触发 `auth:expired` 事件，全局 LoginExpiredModal 监听并提示重新登录
- **定时任务调度** — 服务端每 60 秒扫描超时未支付订单，自动取消并按日期恢复库存
- **WebSocket 实时推送** — Socket.IO 基于 JWT 鉴权，支持按用户定向推送订单状态变更
- **高德地图定位** — 城市选择页集成 AMap JS API，支持 GPS 定位当前城市
- **库存日历管理** — 按日期可视化管理房型库存和价格，支持批量设置（全部 / 工作日 / 周末）
- **统一响应格式** — 后端所有接口统一 `{ code, data, message }` 结构，前端拦截器统一解包
- **Winston 结构化日志** — 请求日志 + 错误日志分级输出，生产环境可对接日志平台
- **Docker 一键部署** — docker-compose 编排 PostgreSQL + Node.js + Nginx 三容器，开箱即用
