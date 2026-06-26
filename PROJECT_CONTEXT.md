# 营地公园全栈管理系统 — 项目上下文文档

> 本文件记录项目完整架构、当前状态、待办事项，用于新对话快速恢复上下文。
> 最后更新：2026-06-26

---

## 一、项目概览

| 项目 | 内容 |
|------|------|
| 项目名 | 营地公园全栈管理系统 (CampOS) |
| 后端 | Spring Boot 3.3.2 + Java 21 + Maven |
| 前端 | React SPA (bloomAdmin) + 5个独立静态页面 |
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
│   │   ├── AdminController.java          # 后台 API (/api/admin)
│   │   ├── PublicController.java         # 前台 API (/api/public, /api/bookings, /api/feedback)
│   │   └── PageController.java           # 页面路由
│   ├── domain/                           # JPA 实体 (9张表)
│   │   ├── UserAccount.java              # users 表
│   │   ├── Zone.java                     # zones 营地区域
│   │   ├── Booking.java                  # bookings 预订
│   │   ├── Activity.java                 # activities 活动
│   │   ├── Feedback.java                 # feedback 反馈
│   │   ├── CampAsset.java                # camp_assets 资产
│   │   ├── Inspection.java               # inspections 巡检
│   │   ├── Alert.java                    # alerts 告警
│   │   └── OperationLog.java             # operation_logs 操作日志
│   ├── dto/                              # 请求/响应 DTO
│   ├── repository/                       # JPA Repository
│   └── service/                          # 业务逻辑
├── src/main/resources/
│   ├── application.yml                   # 数据库/安全配置
│   └── static/                           # 静态文件
│       ├── index.html                    # 首页入口
│       ├── bloom-admin.html              # 后台入口 (Spring Boot 版)
│       ├── admin/index.html              # 后台入口 (含 bridge 脚本)
│       ├── admin/assets/
│       │   ├── bloomAdmin-DJ6i0_H4.js    # React SPA (25KB, 18个组件)
│       │   ├── bloom-admin-bridge.js     # API Bridge (当前 v7)
│       │   └── ...
│       ├── assets/model/                 # 3D 模型
│       ├── assets/media/                 # 视频
│       └── vendor/                       # Three.js 等第三方库
├── 后台/                                 # 独立后台服务
│   ├── start-admin.cjs                   # Node.js 静态服务器 + API 代理
│   ├── admin/index.html                  # 独立版后台入口
│   └── admin/assets/                     # 独立版静态文件
├── 首页/ 前台/ 指挥舱/ 模型/ 作者页/       # 独立前端页面
├── target/camp-system-1.0.0.jar          # 可执行 JAR
├── pom.xml                               # Maven 构建
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

**zones** — 营地区域 (10条演示数据)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | z1-z10 |
| name | VARCHAR | 星空营地, 森林木屋... |
| type | VARCHAR | 帐篷/木屋/房车/公共 |
| capacity | INT | 容量 |
| status | VARCHAR | 开放/维护中 |
| price | DECIMAL | 价格 |
| description | VARCHAR(1000) | 描述 |
| image_url | VARCHAR | 图片URL |

**bookings** — 预订 (5条演示数据)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | b1-b5 |
| name | VARCHAR | 客户名 |
| phone | VARCHAR | 手机号 |
| zone | VARCHAR | 营地区域 |
| date | DATE | 入住日期 |
| people | INT | 人数 |
| status | VARCHAR | 待确认/已确认/已取消 |
| remark | VARCHAR(500) | 备注 |
| created_at | DATETIME | 创建时间 |

**activities** — 活动 (5条)
**feedback** — 反馈 (3条)
**camp_assets** — 资产 (3条)
**inspections** — 巡检 (3条)
**alerts** — 告警 (2条)
**operation_logs** — 操作日志 (自动记录)

---

## 四、API 接口

### 4.1 公开接口 (无需登录)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/login | JSON 登录 {username, password} |
| POST | /api/logout | 登出 |
| GET | /api/public | 前台数据 (营地+活动+统计) |
| POST | /api/bookings | 创建预订 |
| POST | /api/feedback | 提交反馈 |

### 4.2 管理接口 (需登录)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin | 获取全部管理数据 |
| PUT | /api/admin/bookings/{id} | 更新预订状态 |
| PUT | /api/admin/feedback/{id} | 更新反馈状态 |
| DELETE | /api/admin/feedback/{id} | 删除反馈 |
| PUT | /api/admin/zones/{id} | 更新营地状态 |
| PUT | /api/admin/activities/{id} | 更新活动状态 |
| PUT | /api/admin/assets/{id} | 更新资产状态 |
| PUT | /api/admin/inspections/{id} | 更新巡检状态 |
| PUT | /api/admin/alerts/{id} | 更新告警状态 |

### 4.3 登录凭据
- 用户名: admin
- 密码: camp2026

---

## 五、前端 SPA 架构

### 5.1 SPA 文件
`bloomAdmin-DJ6i0_H4.js` (25KB, 已混淆/压缩)

### 5.2 组件列表
| 函数 | 页面 | 说明 |
|------|------|------|
| re | App 根组件 | 管理登录状态 e, 切换登录/后台 |
| ne | LoginPage | 登录表单, 动画角色, onSuccess 回调 |
| H | Dashboard | 统计卡片 + 功能入口 |
| W | Orders | 订单管理 (表格) |
| G | Products | 套餐产品 |
| K | Resources | 资源管理 |
| q | Customers | 客户会员 |
| J | Activities | 活动课程 |
| Y | Finance | 财务管理 |
| X | Staff | 员工权限 |
| Z | Content | 内容管理 |
| Q | Settings | 系统设置 |
| B | Table | 通用表格组件 |
| V | Toolbar | 通用工具栏 |
| $ | Drawer | 详情抽屉 |
| ee | Calendar | 资源日历 |
| te | TabRouter | 标签页路由 |

### 5.3 数据流
```
SPA 硬编码数据 → Bridge v7 (DOM 补丁) → API → MySQL
```

**Bridge v7 功能**:
- 登录拦截: 调 /api/login → 成功后触发 React onSuccess
- 会话检测: 页面加载时检查 /api/admin → 已登录自动进后台
- 仪表盘: 每15秒轮询 /api/admin, 更新统计卡片/功能入口/告警卡片
- 表格数据: 根据当前可见页面, 替换表格 DOM 为真实数据
- 订单点击: 点击订单行 → PUT /api/admin/bookings/{id} 切换状态

### 5.4 当前局限 (Bridge 方案)
- DOM 补丁脆弱, React 重新渲染会覆盖
- 按钮(筛选/搜索/导出/新增) 无实际功能
- 无分页/加载状态/错误提示
- 无表单提交(新增/编辑)

---

## 六、当前运行方式

### 方式 A: Spring Boot JAR (端口 8080)
```
java -jar target/camp-system-1.0.0.jar
→ http://localhost:8080/admin/index.html (bridge v5, 旧版)
```

### 方式 B: 独立后台服务器 (端口 19098)
```
node 后台/start-admin.cjs
→ http://127.0.0.1:19098/admin/index.html (bridge v7, 最新)
```
独立服务器代理 /api/* 到 localhost:8080

### 方式 C: 5页面独立启动
```
node start-five-pages.cjs
→ 首页:19101, 前台:19102, 后台:19098, 指挥舱:19103, 模型:19104
```

---

## 七、GitHub 状态

- 仓库: https://github.com/LIUENXUAN/web-
- 已推送: 源码 (排除 .glb/.mp4/.wasm 等大文件)
- 大文件保留在本地 D:\营地 3D大赛\website（最终版）
- 注意: hosts 文件被 Steam++ 修改, github.com → 127.0.0.1
- 解决方案: gh api 可用, git HTTPS 被劫持, 需用 GIT_SSL_NO_VERIFY=1

---

## 八、商用化改造路线图

### 阶段一: 后端 API 补齐 (2-3天)

#### 1.1 CRUD 接口补齐
- [ ] ZoneController: POST(新增), PUT(编辑), DELETE(删除), GET(分页列表)
- [ ] BookingController: POST(新增), PUT(编辑), DELETE(取消), GET(分页+筛选)
- [ ] ActivityController: POST, PUT, DELETE, GET(分页)
- [ ] FeedbackController: PUT(回复), DELETE, GET(分页)
- [ ] AssetController: POST, PUT, DELETE, GET(分页)
- [ ] InspectionController: POST, PUT, DELETE, GET(分页)
- [ ] AlertController: POST, PUT, DELETE, GET(分页)
- [ ] OperationLogController: GET(分页+筛选)

#### 1.2 增强功能
- [ ] 分页查询 (Pageable + 排序)
- [ ] 多条件筛选 (状态/日期/关键词)
- [ ] 数据校验 (Validation)
- [ ] 批量操作 (批量确认/删除)
- [ ] Excel 导出 (已有 poi-ooxml 依赖)
- [ ] 操作日志记录 (已有 OperationLog)

#### 1.3 权限系统
- [ ] 角色: SUPER_ADMIN, ADMIN, OPERATOR, FINANCE, STAFF
- [ ] 权限注解 @PreAuthorize
- [ ] 用户管理 API (CRUD 管理员账号)
- [ ] 菜单权限控制

### 阶段二: 重写后台 SPA (5-7天)

#### 2.1 技术选型
- [ ] 用 Vite + React 重新构建
- [ ] 使用 React Router 做路由
- [ ] 使用 Ant Design 或 shadcn/ui 组件库
- [ ] 使用 Zustand 或 React Query 管理状态

#### 2.2 模块开发
- [ ] 登录页 (复用现有 UI 设计)
- [ ] 仪表盘 (真实 KPI 图表, ECharts/Recharts)
- [ ] 订单管理 (表格+筛选+分页+详情抽屉+状态操作)
- [ ] 营地区域 (CRUD 表单+状态管理)
- [ ] 活动课程 (CRUD+报名管理)
- [ ] 游客反馈 (列表+回复+删除)
- [ ] 资产管理 (CRUD+健康度)
- [ ] 巡检管理 (CRUD+执行)
- [ ] 告警管理 (列表+处理)
- [ ] 操作日志 (只读列表+筛选)
- [ ] 用户管理 (CRUD 管理员)
- [ ] 系统设置 (营地信息/支付/通知配置)

#### 2.3 通用组件
- [ ] 分页表格 (排序/筛选/批量操作)
- [ ] 表单弹窗 (新增/编辑)
- [ ] 状态标签 (颜色映射)
- [ ] 搜索框 (防抖)
- [ ] 日期选择器
- [ ] 导出按钮
- [ ] 加载骨架屏
- [ ] 错误边界
- [ ] 空状态提示

### 阶段三: 前台页面对接 (2-3天)

#### 3.1 前台预订流程
- [ ] 营地列表页 (从 API 读取)
- [ ] 营地详情页 (图片/价格/描述)
- [ ] 预订表单 (日期选择/人数/套餐)
- [ ] 预订成功页
- [ ] 我的订单查询

#### 3.2 前台功能
- [ ] 活动展示
- [ ] 反馈提交
- [ ] 公告展示
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
2. **JAR 静态文件旧版** — 没装 Maven 无法重新打包
   - 解决: 用独立服务器 (端口 19098) 开发调试
3. **中文编码** — 部分 Java 文件含中文硬编码, 编译后乱码
4. **演示数据硬编码** — CampDemoDataSeeder 用中文做状态值
5. **无单元测试** — 只有骨架测试类
6. **无 API 文档** — 虽然有 springdoc 依赖但未充分使用

---

## 十、启动开发环境

```bash
# 1. 启动 MySQL (确保 3306 端口运行)
# 2. 启动后端
cd D:\营地 3D大赛\website（最终版）
java -jar target/camp-system-1.0.0.jar

# 3. 启动独立后台 (开发用)
node 后台/start-admin.cjs

# 4. 访问
http://127.0.0.1:19098/admin/index.html
# 登录: admin / camp2026
```

---

## 十一、关键文件索引

| 文件 | 作用 |
|------|------|
| application.yml | 数据库/安全/演示数据配置 |
| CampSecurityConfig.java | 安全过滤链 + 登录过滤器 |
| JsonLoginFilter.java | JSON 登录认证 |
| AdminController.java | 后台管理 API |
| PublicController.java | 前台公开 API |
| CampDemoDataSeeder.java | 演示数据填充 |
| bloom-admin-bridge.js | API Bridge (当前 v7) |
| bloomAdmin-DJ6i0_H4.js | React SPA (18个组件) |
| start-admin.cjs | 独立后台服务器 |
