# AGENTS.md — 营地管理系统

## 项目一句话
商用级营地运营管理系统，前后端紧密联动，类似景区售卖网站。

## 技术栈（精确版本）
- Java 21
- Spring Boot 3.3.2
- Spring Data JPA (Hibernate)
- Spring Security 6
- MySQL 8.0 (数据库: fullstack_dev)
- 前端: 原生 HTML/CSS/JS (无框架)
- 3D: Three.js (ES module, 同目录 vendor/three/)
- 构建: Maven, 打包为 JAR
- 其他依赖: Lombok, springdoc-openapi, Apache POI, H2 (仅测试)

## 三大使用场景
1. **前台 /** — 用户浏览营地 → 注册登录 → 选择套餐预约 → 提交反馈
2. **后台 /admin** — 管理员查看/确认/取消预订, 处理反馈, 管理营地状态
3. **指挥舱 /console** — 设施维护、巡检任务、告警处置、资产健康监控
4. **3D 模型 /model** — SKP 数字孪生展示 (暂未对接 API)

## 目录结构
```
D:\营地 3D大赛\website（最终版）\
├── AGENTS.md                          ← 本文件
├── pom.xml
├── src/main/java/com/camp/
│   ├── CampSystemApplication.java     ← 启动类
│   ├── domain/                        ← 8 个 JPA 实体
│   │   ├── Zone.java                  ← 营地区域
│   │   ├── Activity.java              ← 活动
│   │   ├── Booking.java               ← 预订
│   │   ├── Feedback.java              ← 反馈
│   │   ├── CampAsset.java             ← 资产
│   │   ├── Inspection.java            ← 巡检
│   │   ├── Alert.java                 ← 告警
│   │   ├── OperationLog.java          ← 操作日志 (ID 自增 Long)
│   │   └── UserAccount.java           ← 用户
│   ├── repository/                    ← 8 个 JPA Repository
│   ├── service/                       ← 业务逻辑
│   │   ├── CampPublicDataService.java ← 公开数据聚合
│   │   ├── BookingService.java        ← 预订 + 操作日志
│   │   ├── FeedbackService.java       ← 反馈 + 操作日志
│   │   └── AdminService.java          ← 管理端 + 操作日志
│   ├── controller/
│   │   ├── PublicController.java      ← /api/public, /api/bookings, /api/feedback
│   │   ├── AdminController.java       ← /api/admin/*
│   │   └── PageController.java        ← 页面路由
│   ├── dto/
│   │   ├── ApiResponse.java           ← 统一返回 {code, msg, data}
│   │   ├── BookingRequest.java        ← 预订请求 (含 @Valid 校验)
│   │   ├── FeedbackRequest.java       ← 反馈请求
│   │   └── StatusRequest.java         ← 状态更新请求
│   └── config/
│       ├── CampSecurityConfig.java    ← Security 配置
│       ├── CampUserDetailsService.java← 用户认证
│       ├── JsonLoginFilter.java       ← JSON 登录过滤器
│       ├── CorsConfig.java            ← CORS 配置
│       ├── GlobalExceptionHandler.java← 全局异常处理
│       ├── CampDemoDataSeeder.java    ← 启动时注入演示数据
│       └── CampConstants.java         ← 状态常量
├── src/main/resources/
│   ├── application.yml                ← MySQL + JPA + 端口 8080
│   └── static/                        ← 前端静态资源
│       ├── index.html                 ← 前台首页
│       ├── admin/index.html           ← 后台管理
│       ├── console/index.html         ← 指挥舱
│       ├── model-test.html            ← 3D 模型页
│       ├── bloom-admin.html           ← 前台完整版
│       ├── app/app.js                 ← 前台 JS (调 API)
│       ├── admin/admin.js             ← 后台 JS (调 API)
│       ├── console/console.js         ← 指挥舱 JS
│       ├── viewer.js                  ← 3D 模型加载器
│       ├── assets/                    ← 图片/视频/模型纹理
│       ├── vendor/three/              ← Three.js 库
│       └── draco/                     ← Draco 3D 解码器
```

## 编码约定（必须遵守）

### 通用
- 所有文件使用 UTF-8 编码
- 不要添加版权/许可证头
- 不要添加内联注释（除非必要）
- 不要修改不相关的代码

### Java 后端
- 实体 ID: String 类型手动赋值 (UUID 前 8 位, 前缀如 "b", "f", "z")
- OperationLog 的 ID 例外: Long + @GeneratedValue(IDENTITY)
- 状态字段用中文值: "开放"/"维护中"/"已满", "待确认"/"已确认"/"已完成"/"已取消", "待处理"/"已处理", "报名中"/"已满"/"已结束"
- 返回格式统一用 `ApiResponse<T>` 包装 (code/msg/data)
- 控制器方法参数用 `@Valid` 校验
- 不要使用 `@Autowired` 字段注入, 用构造器注入
- 不要用 `@Data` 以外的 Lombok 注解 (已有实体用了 @Data @NoArgsConstructor @AllArgsConstructor)
- 不要修改已有的实体字段定义

### 前端
- 前端 fetch 同域访问, base URL 为空字符串
- 前端状态字段与后端一致 (中文)
- 不要修改已有的 HTML/CSS/JS 文件结构, 只追加功能

### API 风格
- 路径: `/api/public`, `/api/admin/*`, `/api/bookings`, `/api/feedback`, `/api/login`, `/api/logout`
- 请求体: JSON
- 登录: POST `/api/login` 发送 `{"username":"admin","password":"camp2026"}`, 返回 `{"code":200,"msg":"success"}`
- 登录使用 Session 认证 (非 JWT/Token)

## 数据库表结构

### zones (营地区域)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | "z1", "z2"... |
| name | VARCHAR | 名称 |
| type | VARCHAR | 帐篷/木屋/房车/公共 |
| capacity | INT | 容量 |
| status | VARCHAR | 开放/维护中/已满 |
| price | DECIMAL | 价格 |
| description | VARCHAR(1000) | 描述 |
| image_url | VARCHAR | 图片URL |

### bookings (预订)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | "b" + UUID8 |
| name | VARCHAR | 预订人 |
| phone | VARCHAR | 手机号 |
| zone | VARCHAR | 营地名称 (非外键, 存中文名) |
| date | DATE | 入住日期 |
| people | INT | 人数 |
| status | VARCHAR | 待确认/已确认/已完成/已取消 |
| remark | VARCHAR(500) | 备注 |
| created_at | DATETIME | 创建时间 |

### feedback (反馈)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | "f" + UUID8 |
| name | VARCHAR | 姓名 (空则"匿名游客") |
| content | VARCHAR(1000) | 内容 |
| status | VARCHAR | 待处理/已处理 |
| created_at | DATETIME | 创建时间 |

### activities (活动)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | "a1", "a2"... |
| title | VARCHAR | 标题 |
| date | DATE | 日期 |
| zone | VARCHAR | 所属营地 |
| quota | INT | 名额 |
| joined | INT | 已报名 |
| status | VARCHAR | 报名中/已满/已结束 |
| description | VARCHAR(2000) | 描述 |

### camp_assets (资产)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | "ca1"... |
| name | VARCHAR | 名称 |
| zone | VARCHAR | 所属营地 |
| type | VARCHAR | 设备/设施 |
| status | VARCHAR | 正常/待维修/停用 |
| priority | VARCHAR | 高/中/低 |
| last_check | DATE | 最近检查 |
| health | INT | 健康度 0-100 |
| owner | VARCHAR | 负责人 |

### inspections (巡检)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | "i1"... |
| title | VARCHAR | 标题 |
| zone | VARCHAR | 所属营地 |
| owner | VARCHAR | 负责人 |
| frequency | VARCHAR | 每日/每周/每月 |
| due_date | DATE | 截止日期 |
| status | VARCHAR | 待执行/已完成 |
| result | VARCHAR(1000) | 结果 |

### alerts (告警)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | "al1"... |
| title | VARCHAR | 标题 |
| zone | VARCHAR | 所属营地 |
| level | VARCHAR | 高/中/低 |
| type | VARCHAR | 设备故障/环境告警/安全告警 |
| status | VARCHAR | 待处理/处理中/已解决 |
| created_at | DATETIME | 创建时间 |
| owner | VARCHAR | 处理人 |

### users (用户)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | "u1"... |
| username | VARCHAR UNIQUE | 用户名 |
| password_hash | VARCHAR | BCrypt 加密密码 |
| role | VARCHAR | ADMIN |
| status | VARCHAR | ACTIVE |

### operation_logs (操作日志)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO | 自增 |
| operator | VARCHAR | 操作人 |
| action | VARCHAR | 操作 |
| target_type | VARCHAR | 目标类型 |
| target_id | VARCHAR | 目标ID |
| detail | VARCHAR(500) | 详情 |
| created_at | DATETIME | 创建时间 |

## API 接口清单

### 公开 API (无需登录)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/public | 营地+活动+统计 |
| POST | /api/bookings | 提交预订 (body: BookingRequest) |
| POST | /api/feedback | 提交反馈 (body: FeedbackRequest) |
| POST | /api/login | JSON 登录 (body: {username, password}) |

### 管理 API (需登录, Session 认证)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin | 全量管理数据 |
| PUT | /api/admin/bookings/{id} | 更新预订状态 (body: {status}) |
| PUT | /api/admin/feedback/{id} | 更新反馈状态 |
| DELETE | /api/admin/feedback/{id} | 删除反馈 |
| PUT | /api/admin/zones/{id} | 更新营地状态 |
| PUT | /api/admin/activities/{id} | 更新活动状态 |
| PUT | /api/admin/assets/{id} | 更新资产状态 |
| PUT | /api/admin/inspections/{id} | 更新巡检状态 |
| PUT | /api/admin/alerts/{id} | 更新告警状态 |

### 页面路由
| 路径 | 文件 |
|------|------|
| / | index.html |
| /admin | admin/index.html |
| /console | console/index.html |
| /model | model-test.html |
| /bloom | bloom-admin.html |

## 已知问题 & 常见错误（务必避免）

### 编码问题
- ❌ 不要在 Java 文件中使用 GBK/ANSI 编码, 所有文件必须 UTF-8
- ❌ 不要用 native2ascii 转义中文字符串
- ✅ 中文状态值直接写: "开放", "待确认", "已处理"

### 架构问题
- ❌ 不要引入 JWT/Token 认证, 项目使用 Session 认证
- ❌ 不要修改实体字段定义 (增删字段或改类型)
- ❌ 不要修改已有的 API 路径和返回格式 (前端已对接)
- ❌ 不要引入新的前端框架 (Vue/React), 前端是原生 JS
- ✅ 新增功能时保持与现有代码风格一致

### 数据库问题
- ❌ 不要修改 application.yml 中的数据库连接配置
- ❌ 不要删除或修改 DemoDataSeeder 的注入逻辑
- ✅ 新增查询方法在 Repository 中添加, 不要直接写 SQL

### 前端问题
- ❌ 不要修改已有的 HTML 结构 (class/id 名称前端 JS 有依赖)
- ❌ 不要修改已有的 CSS 变量和样式体系
- ✅ 新增功能时在现有 JS 文件中追加函数

## 安全配置要点
- CSRF 已禁用 (前后端分离)
- CORS 允许所有来源 (开发阶段)
- 静态资源路径已放行: /, /index.html, /assets/**, /admin/**, /console/**, /vendor/**, /draco/**, /app/**
- API 路径已放行: /api/public, /api/bookings, /api/feedback, /api/login, /api/logout
- 其他 /api/** 路径需要登录
- 管理员账号: admin / camp2026

## 修改原则
1. 先理解现有代码结构, 再动手修改
2. 改动最小化, 不改不相关的文件
3. 新增功能时保持与现有代码风格一致
4. 修改后验证编译和启动
5. 如果对话上下文太长, 先读 AGENTS.md 和关键文件再操作
