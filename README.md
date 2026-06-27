# 营地系统 Spring Boot 统一版

这是把原来五个独立页面（首页、前台、后台、模型、指挥舱）合并成一个 Spring Boot 工程的版本，适合直接用 IntelliJ IDEA Community Edition 打开运行。

## 环境要求
- JDK 21
- Maven 3.8+
- MySQL 8.x（可选，默认用 H2 文件数据库演示）

## 快速启动

### 方式一：H2 演示模式（开箱即用）
1. 用 IDEA 打开本目录，等待 Maven 依赖下载完成
2. 打开 `CampSystemApplication.java`，右键 Run
3. 浏览器访问 http://localhost:8080

### 方式二：MySQL 模式
1. 启动本地 MySQL，创建空数据库 `camp_system`（自动建表）
2. 修改 `application.yml` 中的数据库用户名密码
3. 启动应用

## 系统入口
- `http://localhost:8080/` - 营地首页
- `http://localhost:8080/visitor` - 游客端（预约、活动、反馈）
- `http://localhost:8080/model` - 3D 营地模型展示
- `http://localhost:8080/admin` - 运营后台管理
  默认账号：admin / camp2026
- `http://localhost:8080/command` - 运营指挥舱
- `http://localhost:8080/h2-console` - H2 数据库控制台（demo 模式）

## 数据闭环
1. 游客端提交预约 → 后台看到预约
2. 后台处理预约 → 指挥舱实时更新指标
3. 指挥舱导出运营日报 → 完整复盘

## 项目结构
```
src/
├── main/java/com/camp/
│   ├── domain/         - 数据实体
│   ├── dto/            - 请求参数
│   ├── repository/     - 数据访问
│   ├── service/        - 业务逻辑
│   ├── config/         - 安全、Web、数据种子
│   ├── api/            - REST API
│   └── CampSystemApplication.java
└── main/resources/
    └── application.yml
```

## 说明
- 原来的页面都保留在根目录下，Spring Boot 通过资源映射统一托管
- 旧前端代码几乎不用改，接口保持兼容
- 启动后所有页面共用同一个数据库、同一个登录体系
📋 对话规划 + 依赖关系图
                        ┌─────────────┐
                        │  对话 0: 总控  │
                        │   (当前)    │
                        └──────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
            ┌─────────────┐       ┌─────────────┐
            │  对话 1: 核心  │       │  对话 3: 前端  │
            │  后端骨架    │──────▶│  资源整合    │
            │  (必须先做)  │       └──────┬──────┘
            └──────┬──────┘              │
                   │                     │
                   ▼                     ▼
            ┌─────────────┐       ┌─────────────┐
            │  对话 2: API  │       │  对话 4: 业务  │
            │  接口层     │◀──────│  闭环对接    │
            └──────┬──────┘       └─────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│对话 5:  │   │对话 6:  │   │对话 7:  │
│3D数据   │   │功能完善  │   │部署上线  │
│联动     │   │(Excel+上传)│ │       │
└─────────┘   └─────────┘   └─────────┘
🎯 每个对话的具体任务
对话 1：核心后端骨架（必须第一个开启）
依赖：无
产出：能启动的 Spring Boot 项目 + 数据库表结构
要做的事情：
创建完整的目录结构
8 个数据库实体类（Zone, Activity, Booking, Feedback, CampAsset, Inspection, Alert, UserAccount）
8 个 JPA Repository 接口
application.yml 配置（MySQL + JPA）
Spring Security 配置类
CampUserDetailsService 用户认证
DemoDataSeeder 演示数据注入（启动时自动建数据）
CampSystemApplication 启动类
验收标准：
项目能正常启动无报错
MySQL 中自动创建 8 张表
表中有演示数据
对话 2：API 接口层
依赖：对话 1 完成后才能开始
产出：完整的 RESTful API
要做的事情：
DTO 类（BookingRequest, FeedbackRequest, StatusRequest, ApiResponse）
CampPublicDataService 公开数据服务
PublicApiController 公开接口：GET /api/public - 获取所有公开数据
POST /api/bookings - 提交预订
POST /api/feedback - 提交反馈

AdminApiController 管理接口：GET /api/admin/stats - 仪表盘统计
GET /api/admin/bookings - 预订列表
PUT /api/admin/bookings/{id} - 更新预订状态
GET /api/admin/feedback - 反馈列表
PUT /api/admin/feedback/{id} - 更新反馈状态
DELETE /api/admin/feedback/{id} - 删除反馈
PUT /api/admin/zones/{id} - 更新营地状态
PUT /api/admin/activities/{id} - 更新活动状态

统一返回格式包装
全局异常处理
验收标准：
Postman 能调用所有 API
数据能正确 CRUD
权限控制正确
对话 3：前端资源整合
依赖：对话 1 完成后即可开始（可与对话 2 并行）
产出：五大网页能通过 Spring Boot 访问
要做的事情：
把五大网页复制到 src/main/resources/static/
整理目录结构，避免路径冲突
创建 PageController 页面路由：GET / → index.html
GET /admin → admin/index.html
GET /console → console/index.html
GET /model → model-test.html
GET /bloom → bloom-admin.html

更新 Security 配置，放行静态资源路径
测试所有页面的资源加载（CSS/JS/图片/3D模型）
验收标准：
5 个 URL 都能正常访问
页面无 404 错误
3D 模型能正常渲染
对话 4：核心业务闭环
依赖：对话 2 + 对话 3 都完成后才能开始
产出：真正能用的预订流程
要做的事情：
前端预订表单对接 POST /api/bookings
前端反馈表单对接 POST /api/feedback
后台管理页面对接 API 获取真实数据
后台状态更新按钮对接 PUT 接口
前端添加提交成功/失败提示
前端表单验证（手机号、必填项）
完整流程测试
验收标准：
完整走一遍：访客预订 → 后台看到 → 确认 → 完成
所有数据正确持久化
刷新不丢失
对话 5：3D 场景数据联动
依赖：对话 2 完成后即可开始（可与对话 4 并行）
产出：3D 模型与业务数据联动
要做的事情：
3D 页面调用 /api/public 获取实时营地状态
Three.js 根据状态设置不同颜色
点击营地弹出信息面板
3D 场景显示实时统计数据
营地选中高亮效果
摄像头平滑过渡动画
鼠标悬停提示
验收标准：
后台改营地状态 → 3D 页面刷新后颜色变化
点击营地能看到详情
操作流畅不卡顿
对话 6：功能完善（锦上添花）
依赖：对话 2 完成后即可开始
产出：更像生产系统的功能
要做的事情：
文件上传功能（营地图片、活动图片）
预订记录 Excel 导出
按日期范围筛选查询
关键字搜索（姓名/手机号）
列表分页
操作日志记录
对话 7：部署上线
依赖：所有对话都完成后
产出：互联网可访问的系统
要做的事情：
Maven 打包 JAR
数据库初始化 SQL 脚本
云服务器部署指南
生产环境配置
备份策略
🚀 建议的开启顺序和时机
顺序	对话	何时开启	预计耗时
1	对话 1：核心后端骨架	现在就开	30 分钟
2	对话 3：前端资源整合	对话 1 能启动后立即开	30 分钟
3	对话 2：API 接口层	对话 1 完成后	2 小时
4	对话 4：核心业务闭环	对话 2 + 对话 3 都完成	1-2 天
5	对话 5：3D 数据联动	对话 2 完成后（可与 4 并行）	2 天
6	对话 6：功能完善	核心业务闭环稳定后	1-2 天
7	对话 7：部署上线	所有功能完成后	半天

💡 关键注意事项
对话 1 是基础，必须第一个做，所有其他对话都依赖它
对话 2 和对话 3 可以并行，互不干扰
每个对话都有明确的验收标准，做完可以独立验证
对话之间通过 API 接口契约 解耦，只要接口定义好，前后端可以分头开发
每个对话开始时，把该对话的任务说明粘贴进去就行
现有架构的问题：
问题	说明
Bridge 是补丁	不是真正的 React 集成，DOM 操作脆弱，React 重新渲染就会覆盖掉
按钮点不动	筛选、搜索、导出、新增、删除等按钮都是假UI，点了没反应
没有表单	不能新增营地、修改价格、编辑活动、创建套餐
没有分页	数据多了表格会崩
没有权限	所有管理员权限一样，没有角色区分
没有日志查看	operation_log 表有数据但没页面看
没有错误提示	API 失败时用户看不到
没有加载状态	数据没回来时显示空白

要变成可商用系统，需要做这些：
重写 SPA — 把硬编码的 React 组件改成真正的 API 驱动
完整的 CRUD — 每个模块都要有增删改查表单
权限系统 — 超级管理员/运营/财务等角色
操作日志页面 — 查看谁做了什么
数据校验 — 前端+后端双重校验
WebSocket 实时推送 — 代替 15 秒轮询
导出功能 — Excel/CSV 导出
部署文档 — Docker 化、环境变量配置、
# 商用化改造 — 对话拆分计划

## 环境准备（你先做，30秒）

```bash
# 把 JAVA_HOME 改成 JDK 21
set JAVA_HOME=C:\Program Files\Java\jdk-21
```

---

## 对话 1：后端 API 补齐（~40分钟编码）

**目标**：后端从"只有状态更新"变成"完整 CRUD"

**改动范围**（全部在 `src/main/java/com/camp/`）：

### 1.1 新增 DTO
- `ZoneRequest.java` — name, type, capacity, price, status, description
- `ActivityRequest.java` — title, date, zone, quota, description
- `AssetRequest.java` — name, zone, type, status, priority, health, owner
- `InspectionRequest.java` — title, zone, owner, frequency, dueDate, result
- `AlertRequest.java` — title, zone, level, type, status, owner
- `UserRequest.java` — username, password, role, status
- `PageResponse.java` — 通用分页响应 {content, totalPages, totalElements, size, number}

### 1.2 重写 AdminController → 拆成多个 Controller
- `ZoneController.java` — GET /api/admin/zones (分页+筛选), POST, PUT, DELETE
- `BookingController.java` — GET /api/admin/bookings (分页+筛选), PUT(状态), DELETE
- `ActivityController.java` — GET /api/admin/activities (分页), POST, PUT, DELETE
- `FeedbackController.java` — GET /api/admin/feedback (分页), PUT(回复), DELETE
- `AssetController.java` — GET /api/admin/assets (分页), POST, PUT, DELETE
- `InspectionController.java` — GET /api/admin/inspections (分页), POST, PUT, DELETE
- `AlertController.java` — GET /api/admin/alerts (分页), POST, PUT, DELETE
- `LogController.java` — GET /api/admin/logs (分页+筛选)
- `UserController.java` — GET /api/admin/users (分页), POST, PUT, DELETE

### 1.3 增强 Service 层
- 所有 Service 增加分页查询 + 操作日志记录
- `BookingService` 增加取消/确认/完成状态流转
- `FeedbackService` 增加回复功能

### 1.4 权限基础
- `UserAccount` 实体增加字段: displayName, email, lastLogin
- 角色枚举: SUPER_ADMIN, ADMIN, OPERATOR, FINANCE, STAFF
- `CampSecurityConfig` 增加方法级安全注解支持

### 1.5 修复 Maven 构建
- 设置正确的 JAVA_HOME
- `mvnw.cmd package -DskipTests` 重新打包 JAR

**验收标准**：
- `mvnw.cmd package` 成功
- 所有 API 通过 curl/Postman 测试
- 分页参数 `?page=0&size=10&sort=createdAt,desc` 生效

---

## 对话 2：重建后台 SPA — 基础框架 + 登录 + 仪表盘 + 订单（~1小时编码）

**目标**：用 Vite + React 重建后台，替换掉那个 28KB 的混淆 SPA

### 2.1 脚手架
```bash
cd 后台
npm create vite@latest admin-spa -- --template react
cd admin-spa
npm install react-router-dom @tanstack/react-query zustand recharts lucide-react
```

### 2.2 基础架构
- `src/api/client.js` — fetch 封装 + 自动携带凭证 + 错误处理
- `src/api/auth.js` — login/logout/checkSession
- `src/api/admin.js` — 所有 CRUD API 调用
- `src/stores/authStore.js` — 登录状态管理 (Zustand)
- `src/App.jsx` — React Router 路由配置
- `src/components/Layout.jsx` — 侧边栏 + 顶栏布局（复用现有 UI 风格）

### 2.3 页面
- **登录页** — 复用现有动画角色设计，调 `/api/login`
- **仪表盘** — 统计卡片 + 图表 (Recharts) + 待办事项
- **订单管理** — 分页表格 + 筛选 + 状态切换 + 详情抽屉

### 2.4 通用组件
- `DataTable.jsx` — 分页表格（排序/筛选/批量操作）
- `StatusBadge.jsx` — 状态标签颜色映射
- `FormModal.jsx` — 新增/编辑弹窗
- `SearchInput.jsx` — 防抖搜索
- `LoadingSkeleton.jsx` — 骨架屏
- `EmptyState.jsx` — 空状态

**验收标准**：
- `npm run dev` 启动，浏览器能访问
- 登录/登出正常工作
- 仪表盘显示真实数据
- 订单表格分页 + 点击切换状态

---

## 对话 3：重建后台 SPA — 剩余页面（~1小时编码）

**目标**：完成所有管理页面

### 3.1 页面
- **营地区域** — 表格 + 新增/编辑弹窗 + 状态管理
- **活动课程** — 表格 + 新增/编辑 + 报名进度
- **游客反馈** — 表格 + 回复弹窗 + 删除
- **资产管理** — 表格 + 新增/编辑 + 健康度指示
- **巡检管理** — 表格 + 新增/编辑 + 执行状态
- **告警管理** — 表格 + 处理/关闭

### 3.2 增强
- 所有表格支持分页 + 搜索 + 排序
- 所有表单支持新增 + 编辑
- 删除确认弹窗
- 操作成功/失败提示 (Toast)

**验收标准**：
- 所有 7 个管理页面都能增删改查
- 数据变化后仪表盘自动更新

---

## 对话 4：收尾 — 系统设置 + 日志 + 前台对接 + 构建（~40分钟编码）

### 4.1 剩余页面
- **操作日志** — 只读表格 + 按操作者/类型/时间筛选
- **用户管理** — 管理员账号 CRUD
- **系统设置** — 营地信息/支付/通知配置（存数据库或配置文件）

### 4.2 前台页面增强
- 前台预订表单确认提交后显示成功页
- 反馈提交后显示感谢页
- 活动列表从 API 读取

### 4.3 构建配置
- Vite 构建输出到 `后台/admin/` 覆盖旧文件
- 更新 `start-admin.cjs` 指向新 SPA
- 更新 Spring Boot 静态文件目录

**验收标准**：
- `npm run build` 成功
- 独立服务器访问正常
- 全流程跑通：前台预订 → 后台看到新订单 → 管理员确认

---

## 对话 5：部署 + 文档 + Git 推送（~30分钟编码）

### 5.1 Docker
- `Dockerfile` — 多阶段构建 (Maven build → JRE runtime)
- `docker-compose.yml` — MySQL + App
- `.env.example` — 环境变量模板

### 5.2 CI/CD
- `.github/workflows/deploy.yml` — Maven 构建 + Docker 推送

### 5.3 文档
- 更新 `README.md` 为完整部署文档
- 更新 `PROJECT_CONTEXT.md`

### 5.4 Git
- 提交所有改动
- 推送到 GitHub

**验收标准**：
- `docker-compose up` 一键启动
- GitHub Actions 通过

---

## 总计

| 对话 | 内容 | 编码时间 |
|------|------|----------|
| 1 | 后端 API 补齐 | ~40min |
| 2 | SPA 基础 + 登录 + 仪表盘 + 订单 | ~60min |
| 3 | SPA 剩余 7 个页面 | ~60min |
| 4 | 日志 + 用户 + 前台 + 构建 | ~40min |

| 5 | Docker + CI/CD + 文档 | ~30min |
| **合计** | **5 次对话** | **~3.5 小时** |
