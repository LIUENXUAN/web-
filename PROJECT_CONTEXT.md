# 营地管理系统 — 项目上下文（开新对话时粘贴）

## 一句话
商用级营地运营管理系统，前后端紧密联动，类似景区售卖网站。

## 技术栈
Spring Boot 3.3.2 + Java 21 + JPA + MySQL 8.0 + Spring Security + 原生前端（HTML/CSS/JS）+ Three.js

## 三大使用场景

### 1️⃣ 前台（用户端）— 路径 /
用户访问首页 → 浏览营地/套餐 → 注册登录 → 选择营地+日期 → 提交预约 → 提交反馈
前端数据通过 API 实时写入后端数据库

### 2️⃣ 后台（管理端）— 路径 /admin
管理员登录 → 查看所有预订/反馈 → 确认/取消预订 → 处理/删除反馈 → 管理营地状态
所有操作实时写入数据库

### 3️⃣ 指挥舱（运维端）— 路径 /console
设施维护管理 → 巡检任务 → 告警处置 → 资产健康监控

## 项目当前状态
- ✅ 后端骨架已完成（8 实体 + 8 Repository + Security + 演示数据）
- ✅ API 已完成（公开 API + 管理 API + DTO + 异常处理）
- ✅ 前端资源已整合到 static/，5 个页面路由已配好
- ✅ 核心业务闭环已对接（前端调 API 读写数据库）
- ⬜ 3D 数据联动未做
- ⬜ Excel 导出/分页/文件上传未做
- ⬜ 部署上线未做

## 数据库
MySQL `fullstack_dev`，8 张表：zones / activities / bookings / feedback / camp_assets / inspections / alerts / users
管理员：admin / camp2026

## API 接口一览
公开（无需登录）：
  GET  /api/public           → 营地+活动+统计
  POST /api/bookings         → 提交预订
  POST /api/feedback         → 提交反馈
  POST /api/login            → JSON 登录

管理（需登录）：
  GET  /api/admin            → 全量管理数据
  PUT  /api/admin/bookings/{id}    → 更新预订状态
  PUT  /api/admin/feedback/{id}    → 处理反馈
  DELETE /api/admin/feedback/{id}  → 删除反馈
  PUT  /api/admin/zones/{id}       → 更新营地状态
  PUT  /api/admin/activities/{id}  → 更新活动状态
  PUT  /api/admin/assets/{id}      → 更新资产状态
  PUT  /api/admin/inspections/{id} → 更新巡检状态
  PUT  /api/admin/alerts/{id}      → 更新告警状态

## 编码约定
- 状态字段用中文值（"开放"/"待确认"/"已确认"/"已处理"等）
- 实体 ID 用 String 手动赋值
- 返回格式统一用 ApiResponse { code, msg, data }
- 所有文件 UTF-8 编码
- 前端 fetch 同域访问，base URL 为空

## 目录结构
src/main/java/com/camp/
  domain/       → 8 个实体
  repository/   → 8 个 JPA Repository
  controller/   → PublicController + AdminController + PageController
  service/      → CampPublicDataService + BookingService + FeedbackService + AdminService
  dto/          → ApiResponse + BookingRequest + FeedbackRequest + StatusRequest
  config/       → Security + CORS + 异常处理 + 演示数据 + 常量

src/main/resources/static/
  index.html            → 前台首页
  admin/index.html      → 后台管理
  console/index.html    → 指挥舱
  model-test.html       → 3D 模型页
  bloom-admin.html      → 前台完整版
  app/ assets/ vendor/ draco/ → 静态资源
