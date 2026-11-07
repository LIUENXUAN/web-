# 营地公园全栈管理系统 — 项目上下文文档

> 本文件记录项目完整架构、当前状态、待办事项，用于新对话快速恢复上下文。
> 最后更新：2026-06-28 (v12)

---

## 一、项目概览

| 项目 | 内容 |
|------|------|
| 项目名 | 营地公园全栈管理系统 (CampOS) |
| 后端 | Spring Boot 3.3.2 + Java 21 + Maven |
| 前端 | React SPA (admin-spa.js) + Bridge v10 DOM 补丁 + 5个独立静态页面 |
| 数据库 | MySQL (fullstack_dev) + JPA/Hibernate |
| 认证 | Spring Security + Session + JSON Login Filter |
| 构建 | Maven → JAR (camp-system-1.0.0.jar) |
| 端口 | 后端 8080, 独立后台 19098 |
| GitHub | https://github.com/LIUENXUAN/web- |

---

## 二、项目目录结构

```
D:\营地 3D大赛\website（最终版）\
├── src/main/java/com/camp/
│   ├── CampSystemApplication.java        # 入口
│   ├── config/
│   │   ├── CampSecurityConfig.java       # Spring Security 配置
│   │   ├── CampUserDetailsService.java   # 用户认证服务
│   │   ├── CampDemoDataSeeder.java       # 演示数据填充
│   │   ├── CorsConfig.java               # CORS 跨域
│   │   ├── JsonLoginFilter.java          # JSON 登录过滤器
│   │   ├── GlobalExceptionHandler.java   # 全局异常处理
│   │   └── CampConstants.java            # 常量
│   ├── controller/
│   │   ├── AdminController.java          # 后台聚合 API (/api/admin)
│   │   ├── ZoneController.java           # 营地区域 CRUD (/api/admin/zones)
│   │   ├── BookingController.java        # 预订 CRUD + 筛选 (/api/admin/bookings)
│   │   ├── ActivityController.java       # 活动 CRUD (/api/admin/activities)
│   │   ├── FeedbackController.java       # 反馈管理 (/api/admin/feedback)
│   │   ├── AssetController.java          # 资产 CRUD (/api/admin/assets)
│   │   ├── InspectionController.java     # 巡检 CRUD (/api/admin/inspections)
│   │   ├── AlertController.java          # 告警 CRUD (/api/admin/alerts)
│   │   ├── UserController.java           # 用户管理 (/api/admin/users)
│   │   ├── LogController.java            # 操作日志 (/api/admin/logs)
│   │   ├── PublicController.java         # 前台公开 API
│   │   └── PageController.java           # 页面路由
│   ├── domain/                           # JPA 实体 (9张表)
│   ├── dto/                              # 请求/响应 DTO (11个)
│   ├── repository/                       # JPA Repository
│   └── service/                          # 业务逻辑
├── src/main/resources/
│   ├── application.yml                   # 数据库/安全配置
│   └── static/                           # 静态文件
├── 后台/                                 # 独立后台服务
│   ├── start-admin.cjs                   # Node.js 静态服务器 + API 代理
│   ├── admin/index.html                  # 独立版后台入口
│   └── admin/assets/
│       ├── bloomAdmin-DJ6i0_H4.js        # React SPA (25KB, 18个组件)
│       ├── bloom-admin-bridge.js         # API Bridge v10 (102KB, 9模块完整CRUD)
│       ├── bloomAdmin-BUhvVHef.css       # SPA 样式
│       └── jsx-runtime-DdwvTla4.js       # JSX 运行时
├── admin-spa.html                          # 商用 SPA Part 1 (HTML 入口)
├── admin-spa.js                            # 商用 SPA Part 1 (React 组件, 488行)
├── 首页/ 前台/ 指挥舱/ 模型/ 作者页/       # 独立前端页面
├── target/camp-system-1.0.0.jar          # 可执行 JAR
├── pom.xml                               # Maven 构建
├── AGENTS.md                             # 开发指引
├── PROJECT_CONTEXT.md                    # 项目上下文
└── start-five-pages.cjs                  # 5页面独立启动器
```

---

## 三、数据库 (MySQL: fullstack_dev)

### 3.1 用户: dev / Dev@123456

### 3.2 表结构

**users** — 管理员账号
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | u1 |
| username | VARCHAR UNIQUE | admin |
| password_hash | VARCHAR | BCrypt 加密 |
| role | VARCHAR | ADMIN |
| status | VARCHAR | ACTIVE |
| display_name | VARCHAR | 显示名称 |
| email | VARCHAR | 邮箱 |

**zones** — 营地区域 (10条演示数据)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | z1-z10 |
| name | VARCHAR | 星空营地, 森林木屋... |
| type | VARCHAR | 帐篷/木屋/房车/公共 |
| capacity | INT | 容量 |
| status | VARCHAR | 开放/维护中/可预订 |
| price | DECIMAL | 价格 |
| description | VARCHAR(1000) | 描述 |
| image_url | VARCHAR | 图片URL |

**bookings** — 预订 (5条演示数据)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | b1-b5 |
| name | VARCHAR | 姓名 |
| phone | VARCHAR | 手机号 |
| zone | VARCHAR | 营地名称 |
| date | DATE | 入住日期 |
| people | INT | 人数 |
| status | VARCHAR | 待确认/已确认/已完成/已取消 |
| remark | VARCHAR(500) | 备注 |
| created_at | DATETIME | 创建时间 |

**activities** — 活动 (3条演示数据)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | a1-a3 |
| title | VARCHAR | 活动标题 |
| date | DATE | 活动日期 |
| zone | VARCHAR | 所属区域 |
| quota | INT | 名额上限 |
| joined | INT | 已报名数 |
| status | VARCHAR | 报名中/已满员/已结束 |
| description | VARCHAR(2000) | 描述 |

**feedback** — 反馈 (3条演示数据)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | f1-f3 |
| name | VARCHAR | 游客名 |
| content | VARCHAR(1000) | 反馈内容 |
| status | VARCHAR | 待处理/已处理 |
| created_at | DATETIME | 创建时间 |

**camp_assets** — 资产 (5条演示数据)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | ca1-ca5 |
| name | VARCHAR | 资产名称 |
| zone | VARCHAR | 所属区域 |
| type | VARCHAR | 类型 |
| status | VARCHAR | 正常/维护中/故障 |
| priority | VARCHAR | 优先级 |
| health | INT | 健康度(0-100) |
| owner | VARCHAR | 负责人 |
| last_check | DATE | 最后检查日 |

**inspections** — 巡检 (3条演示数据)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | i1-i3 |
| title | VARCHAR | 巡检标题 |
| zone | VARCHAR | 区域 |
| owner | VARCHAR | 负责人 |
| frequency | VARCHAR | 频率 |
| due_date | DATE | 截止日期 |
| status | VARCHAR | 待执行/进行中/已完成 |
| result | VARCHAR(1000) | 结果 |

**alerts** — 告警 (3条演示数据)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | al1-al3 |
| title | VARCHAR | 告警标题 |
| zone | VARCHAR | 区域 |
| level | VARCHAR | 级别 |
| type | VARCHAR | 类型 |
| status | VARCHAR | 待处理/处理中/已关闭 |
| owner | VARCHAR | 负责人 |
| created_at | DATETIME | 创建时间 |

**operation_logs** — 操作日志
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 自增 |
| operator | VARCHAR | 操作人 |
| action | VARCHAR | 操作动作 |
| entity_type | VARCHAR | 操作对象类型 |
| entity_id | VARCHAR | 操作对象ID |
| detail | VARCHAR | 详情 |
| created_at | DATETIME | 操作时间 |

---

## 四、后端 API 一览

### 4.1 公开接口 (无需登录)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/login | JSON 登录 |
| POST | /api/logout | 登出 |
| GET | /api/public | 前台首页数据 |
| POST | /api/bookings | 前台提交预订 |
| POST | /api/feedback | 前台提交反馈 |

### 4.2 后台接口 (需登录)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin | 聚合数据(metrics+zones+bookings+activities+feedback+assets+inspections+alerts+logs) |
| | | |
| GET | /api/admin/zones | 分页列表 |
| POST | /api/admin/zones | 新增 |
| PUT | /api/admin/zones/{id} | 编辑 |
| PUT | /api/admin/zones/{id}/status | 更新状态 |
| DELETE | /api/admin/zones/{id} | 删除 |
| | | |
| GET | /api/admin/bookings?keyword=&status=&page=&size= | 分页+关键词+状态筛选 |
| PUT | /api/admin/bookings/{id}/status | 更新状态 |
| DELETE | /api/admin/bookings/{id} | 删除 |
| | | |
| GET | /api/admin/activities | 分页列表 |
| POST | /api/admin/activities | 新增 |
| PUT | /api/admin/activities/{id} | 编辑 |
| PUT | /api/admin/activities/{id}/status | 更新状态 |
| DELETE | /api/admin/activities/{id} | 删除 |
| | | |
| GET | /api/admin/feedback | 分页列表 |
| PUT | /api/admin/feedback/{id}/status | 更新状态 |
| DELETE | /api/admin/feedback/{id} | 删除 |
| | | |
| GET | /api/admin/assets | 分页列表 |
| POST | /api/admin/assets | 新增 |
| PUT | /api/admin/assets/{id} | 编辑 |
| PUT | /api/admin/assets/{id}/status | 更新状态 |
| DELETE | /api/admin/assets/{id} | 删除 |
| | | |
| GET | /api/admin/inspections | 分页列表 |
| POST | /api/admin/inspections | 新增 |
| PUT | /api/admin/inspections/{id} | 编辑 |
| PUT | /api/admin/inspections/{id}/status | 更新状态 |
| DELETE | /api/admin/inspections/{id} | 删除 |
| | | |
| GET | /api/admin/alerts | 分页列表 |
| POST | /api/admin/alerts | 新增 |
| PUT | /api/admin/alerts/{id} | 编辑 |
| PUT | /api/admin/alerts/{id}/status | 更新状态 |
| DELETE | /api/admin/alerts/{id} | 删除 |
| | | |
| GET | /api/admin/users | 分页列表 |
| POST | /api/admin/users | 新增 |
| PUT | /api/admin/users/{id} | 编辑 |
| DELETE | /api/admin/users/{id} | 删除 |
| | | |
| GET | /api/admin/logs | 分页列表 |

---

## 五、Bridge v9 架构

### 5.1 工作原理
React SPA (bloomAdmin-DJ6i0_H4.js) 渲染精美 UI 框架（视频背景、毛玻璃面板、导航菜单），
Bridge v9 (bloom-admin-bridge.js) 在 DOM 层面注入真实数据。

### 5.2 页面映射
| SPA 导航 | Bridge 处理函数 | 数据来源 |
|----------|----------------|----------|
| 首页仪表盘 | patchDashboard() | /api/admin 聚合数据 |
| 订单管理 | patchOrdersPage() | /api/admin/bookings (分页+筛选) |
| 产品套餐 | patchProductsPage() | state.zones |
| 资源场地 | patchResourcesPage() | state.assets |
| 客户会员 | patchCustomersPage() | state.feedback |
| 活动课程 | patchActivitiesPage() | state.activities |
| 财务管理 | patchFinancePage() | state.metrics |
| 员工权限 | patchStaffPage() | 静态数据 |
| 内容管理 | patchContentPage() | 静态数据 |

### 5.3 订单 CRUD 功能
- 关键词搜索（姓名/手机号/订单号）
- 状态筛选（全部/待确认/已确认/已完成/已取消）
- 分页导航
- 状态操作：确认/完成/取消（调用 PUT /api/admin/bookings/{id}/status）
- 详情抽屉（毛玻璃右侧面板）
- 操作日志自动记录

---

## 六、演示数据

| 表 | 数量 | 说明 |
|----|------|------|
| users | 1 | admin / camp2026 |
| zones | 10 | 星空营地、森林木屋、湖畔帐篷... |
| bookings | 5 | 张三、李四... |
| activities | 3 | 篝火晚会、自然徒步... |
| feedback | 3 | 游客评价 |
| camp_assets | 5 | 帐篷、发电机... |
| inspections | 3 | 设备检查... |
| alerts | 3 | 告警信息 |

---

## 七、GitHub 状态

- 仓库: https://github.com/LIUENXUAN/web-
- 已推送: 源码 (排除 .glb/.mp4/.wasm 等大文件)
- 大文件保留在本地 D:\营地 3D大赛\website（最终版）
- 注意: hosts 文件被 Steam++ 修改, github.com → 127.0.0.1
- 解决方案: gh api 可用, git HTTPS 被劫持, 需用 GIT_SSL_NO_VERIFY=1

---

## 八、商用化改造路线图

### 阶段一: 后端 API 补齐 ✅ (基本完成)

#### 1.1 CRUD 接口补齐
- [x] ZoneController: POST(新增), PUT(编辑), DELETE(删除), GET(分页列表)
- [x] BookingController: POST(新增), PUT(编辑), DELETE(取消), GET(分页+筛选)
- [x] ActivityController: POST, PUT, DELETE, GET(分页)
- [x] FeedbackController: PUT(回复), DELETE, GET(分页)
- [x] AssetController: POST, PUT, DELETE, GET(分页)
- [x] InspectionController: POST, PUT, DELETE, GET(分页)
- [x] AlertController: POST, PUT, DELETE, GET(分页)
- [x] OperationLogController: GET(分页+筛选)

#### 1.2 增强功能
- [x] 分页查询 (Pageable + 排序)
- [x] 多条件筛选 (Booking: 关键词+状态)
- [x] 数据校验 (Validation)
- [ ] 批量操作 (批量确认/删除)
- [ ] Excel 导出 (已有 poi-ooxml 依赖)
- [x] 操作日志记录 (已有 OperationLog)

#### 1.3 权限系统
- [ ] 角色: SUPER_ADMIN, ADMIN, OPERATOR, FINANCE, STAFF
- [ ] 权限注解 @PreAuthorize
- [x] 用户管理 API (CRUD 管理员账号)
- [ ] 菜单权限控制

### 阶段二: 重写后台 SPA ✅ (Bridge v9 方案)

#### 2.1 技术选型
- [x] 保留现有 React SPA 精美设计
- [x] Bridge v9 脚本在 DOM 层注入数据
- [x] 使用现有 CSS 组件库

#### 2.2 模块开发
- [x] 登录页 (复用现有 UI 设计)
- [x] 仪表盘 (真实 KPI 数据)
- [x] 订单管理 (表格+筛选+分页+详情抽屉+状态操作)
- [x] 营地区域 (列表展示 + CRUD弹窗 + 状态切换 + 分页)
- [x] 活动课程 (列表展示 + CRUD弹窗 + 状态切换 + 分页)
- [x] 游客反馈 (列表展示 + 详情弹窗 + 标记处理 + 分页)
- [x] 资产管理 (列表展示+健康度+CRUD弹窗+状态切换+分页)
- [x] 巡检管理 (列表展示+CRUD弹窗+状态切换+分页)
- [x] 告警管理 (列表展示+处理弹窗+关闭/分配负责人+分页)
- [x] 操作日志 (已接入数据)
- [x] 用户管理 (列表展示+CRUD弹窗+分页)
- [ ] 系统设置 (营地信息/支付/通知配置)


#### 2.4 商用 SPA v2 (admin-spa.html) ✅ 最终版
- [x] 登录页 (复用现有 UI 设计)
- [x] 仪表盘 (真实 KPI + 待办事项 + 最近订单)
- [x] 订单管理 (搜索/筛选/分页/状态操作/详情抽屉)
- [x] 营地区域 (表格 + CRUD 弹窗 + 状态切换 + 分页)
- [x] 活动课程 (表格 + CRUD 弹窗 + 三态切换 + 分页)
- [x] 游客反馈 (表格 + 详情弹窗 + 标记处理 + 分页)
- [x] 资产管理 (表格 + CRUD 弹窗 + 健康度滑块 + 状态切换 + 分页)
- [x] 巡检管理 (表格 + CRUD 弹窗 + 执行巡检 + 分页)
- [x] 告警管理 (表格 + 处理弹窗 + 关闭/分配负责人 + 分页)
- [x] 用户管理 (表格 + CRUD 弹窗 + 角色/状态 + 分页)

技术: React 18 + React Router 6 (CDN), 原生 React.createElement, 88KB, 零构建
- 背景: CDN 绿色地球旋转视频
- 主题: 森系深绿配色（Inter 字体、高对比度）
- 弹窗: overlay 包裹结构 + stopPropagation
- [x] 公告展示
- [x] UI 美化（Inter 字体、森系配色、毛玻璃修复）
- [x] 弹窗交互修复（stopPropagation）
- [ ] FAQ

### 阶段四: 部署与运维 (1-2天)

#### 4.1 Docker 化
- [ ] Dockerfile (多阶段构建)
- [ ] docker-compose.yml (MySQL + App)
- [ ] 环境变量配置 (数据库/密码)

#### 4.2 生产配置
- [ ] 多环境 profile (dev/prod)
- [ ] HTTPS 证书
- [ ] 日志轮转
- [ ] 监控 (Prometheus + Grafana)

#### 4.3 CI/CD
- [ ] GitHub Actions 自动构建
- [ ] 自动部署脚本

### 阶段五: 上线前检查 (1天)

- [ ] 安全审计 (SQL注入/XSS/CSRF)
- [ ] 性能测试 (接口响应时间)
- [ ] 数据备份方案
- [ ] 操作手册
- [ ] 部署文档

---

## 九、已知问题

1. **Steam++ (Watt Toolkit)** 修改 hosts 劫持 GitHub 域名
   - 症状: git push HTTPS 连到 127.0.0.1:443
   - 绕过: GIT_SSL_NO_VERIFY=1 或 gh api
2. **JAR 静态文件旧版** — 需重新打包才能更新 JAR 内的静态文件
   - 解决: 用独立服务器 (端口 19098) 开发调试
   - 打包: `$env:JAVA_HOME="C:\Program Files\Java\jdk-21"; .\mvnw.cmd package -DskipTests`
3. **中文编码** — 部分 Java 文件含中文硬编码, 编译后乱码
4. **演示数据硬编码** — CampDemoDataSeeder 用中文做状态值
5. **无单元测试** — 只有骨架测试类
6. **无 API 文档** — 虽然有 springdoc 依赖但未充分使用

---

## 十、启动开发环境

```bash
# 1. 启动 MySQL (确保 3306 端口运行)

# 2. 启动后端 (需 JDK 21)
cd D:\营地 3D大赛\website（最终版）
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
java -jar target/camp-system-1.0.0.jar

# 3. 启动独立后台 (开发用)
node 后台/start-admin.cjs

# 4. 访问
http://127.0.0.1:19098/后台/admin/admin-spa.html
# 登录: admin / camp2026
```

---

## 十一、关键文件索引

| 文件 | 作用 |
|------|------|
| application.yml | 数据库/安全/演示数据配置 |
| CampSecurityConfig.java | 安全过滤链 + 登录过滤器 |
| JsonLoginFilter.java | JSON 登录认证 |
| AdminController.java | 后台聚合 API |
| BookingController.java | 预订 CRUD + 筛选 |
| BookingRepository.java | 预订仓库 (含 findByFilters JPQL) |
| BookingService.java | 预订业务 (含 listWithFilters) |
| CampDemoDataSeeder.java | 演示数据填充 |
| bloom-admin-bridge.js | API Bridge v10 (97KB, 完整 CRUD: 订单/营地区域/活动课程/游客反馈/资产管理/用户管理/巡检管理/告警管理) |
| bloomAdmin-DJ6i0_H4.js | React SPA (25KB, 18个组件) |
| start-admin.cjs | 独立后台服务器 |
| admin-spa.html | 商用 SPA 唯一入口 (v12) |
| admin-spa.js | React 组件 (88KB, 10页面全功能) |
| pom.xml | Maven 构建 (含 springdoc, poi-ooxml) |
---

---

## 九、版本历史

### v12 (2026-06-28) — UI 美化 + 弹窗修复
- 修复所有弹窗点击穿透问题（overlay 包裹 modal-box + stopPropagation）
- 修复毛玻璃模糊过高导致文字模糊（backdrop-filter: 50px→6px）
- 引入 Inter 字体，统一全站字体
- 提升文字对比度（#e8edf5→#d0e0d8, #5a6a82→#80a898）
- 统一森系绿色配色（主色 #3d7a4a, 强调 #6bcf8a, 危险 #e87060）
- 修复所有表单字段名一致性（name/title 字段对齐）
- 管理后台入口: http://127.0.0.1:19098/admin/admin-spa.html

### v11 (2026-06-28) — UI 美化 + 3D 地球背景
- 替换视频背景为 CDN 绿色地球旋转视频（与 bloomAdmin.js 原版一致）
- 应用森系绿色主题配色（深绿底 + 青绿强调）
- 修复 AssetsPage 表单字段名错误（title→name）
- 修复 ZonesPage 表单字段名错误（title→name）
- 登录页保留原始角色动画（4个 SVG 角色交互）
- 管理后台 UI 风格与绿色地球主题统一
