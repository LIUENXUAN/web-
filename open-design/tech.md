# Tech — Nature Haven Camp 游客端小程序

## 一、技术架构

### 1.1 整体架构

`
┌─────────────────────────────────────────────────┐
│              微信小程序客户端                      │
│  (微信开发者工具 / 原生 WXML + WXSS + JS)        │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ 首页      │  │ 详情页   │  │ 我的 / 反馈   │  │
│  │ (活动列表)│  │ (报名)   │  │ (个人中心)    │  │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       └──────────────┴──────────────┘            │
│                        │                         │
│              ┌─────────┴─────────┐               │
│              │   utils/api.js    │               │
│              │  (HTTP 请求封装)   │               │
│              └─────────┬─────────┘               │
└────────────────────────┼─────────────────────────┘
                         │ HTTPS
┌────────────────────────┼─────────────────────────┐
│              ┌─────────┴─────────┐               │
│              │   Spring Boot 后端                │
│              │   (Java 21 + JPA) │               │
│              └─────────┬─────────┘               │
│                        │                         │
│  ┌─────────────────────┼─────────────────────┐   │
│  │  Controller 层      │                     │   │
│  │  ┌──────────────────┴──────────────┐      │   │
│  │  │ WxAuthController               │      │   │
│  │  │ WxActivityController           │      │   │
│  │  │ PublicController (feedback)    │      │   │
│  │  └──────────────────┬──────────────┘      │   │
│  │                     │                     │   │
│  │  Service 层         │                     │   │
│  │  ┌──────────────────┴──────────────┐      │   │
│  │  │ FeedbackService                 │      │   │
│  │  └──────────────────┬──────────────┘      │   │
│  │                     │                     │   │
│  │  Repository 层      │                     │   │
│  │  ┌──────────────────┴──────────────┐      │   │
│  │  │ ActivityRepository             │      │   │
│  │  │ ActivitySignupRepository       │      │   │
│  │  │ FeedbackRepository             │      │   │
│  │  │ UserAccountRepository          │      │   │
│  │  └──────────────────┬──────────────┘      │   │
│  │                     │                     │   │
│  │  Domain 层          │                     │   │
│  │  ┌──────────────────┴──────────────┐      │   │
│  │  │ Activity / ActivitySignup      │      │   │
│  │  │ Feedback / UserAccount         │      │   │
│  │  └─────────────────────────────────┘      │   │
│  └───────────────────────────────────────────┘   │
│                         │                         │
│              ┌──────────┴──────────┐              │
│              │      MySQL          │              │
│              │  (fullstack_dev)    │              │
│              └─────────────────────┘              │
└───────────────────────────────────────────────────┘
`

### 1.2 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 客户端 | 微信小程序原生开发 | — |
| 客户端语言 | JavaScript (ES5/ES6) | — |
| 客户端框架 | 微信原生框架 (WXML + WXSS + JS) | — |
| 后端框架 | Spring Boot | 3.3.2 |
| 后端语言 | Java | 21 |
| ORM | Spring Data JPA / Hibernate | 6.5.2 |
| 数据库 | MySQL | 8.x |
| 构建工具 | Maven | 3.x |
| HTTP 客户端 | RestTemplate (后端) | — |

---

## 二、数据流

### 2.1 微信登录流程

`
小程序端                         微信服务器                   后端
  │                                │                         │
  │  wx.login()                    │                         │
  │ ─────────────────────────────> │                         │
  │  <────── code ─────────────── │                         │
  │                                │                         │
  │  POST /api/wx/login            │                         │
  │  { code: "xxx" }              │                         │
  │ ───────────────────────────────────────────────────────> │
  │                                │                         │
  │                                │  GET jscode2session     │
  │                                │  appid + secret + code  │
  │                                │ ──────────────────────> │
  │                                │  <──── openid ──────── │
  │                                │                         │
  │                                │   查找/创建用户         │
  │                                │ ──────────────────────> │
  │  <── { openid, token } ────── │                         │
  │                                │                         │
  │  存储 openid 到 globalData     │                         │
`

### 2.2 活动报名流程

`
小程序端                          后端                        数据库
  │                                │                          │
  │  GET /api/wx/activities        │                          │
  │ ──────────────────────────────>│                          │
  │                                │ SELECT * FROM activities │
  │                                │ ───────────────────────> │
  │  <── 活动列表 ─────────────── │ <── 数据 ────────────── │
  │                                │                          │
  │  POST /api/wx/activities/{id}/signup                      │
  │  { openid, name, phone }      │                          │
  │ ──────────────────────────────>│                          │
  │                                │ 校验：活动存在？         │
  │                                │ 校验：已报名？           │
  │                                │ 校验：名额未满？         │
  │                                │ INSERT activity_signups  │
  │                                │ UPDATE activities.joined │
  │                                │ ───────────────────────> │
  │  <── { signupId, joined } ─── │                          │
`

### 2.3 反馈提交流程

`
小程序端                          后端                        数据库
  │                                │                          │
  │  POST /api/feedback            │                          │
  │  { name, content }            │                          │
  │ ──────────────────────────────>│                          │
  │                                │ INSERT feedback          │
  │                                │ ───────────────────────> │
  │  <── 成功响应 ─────────────── │                          │
`

---

## 三、API 接口文档

### 3.1 微信登录

| 项目 | 内容 |
|------|------|
| 路径 | POST /api/wx/login |
| 鉴权 | 无（公开接口） |
| 请求体 | { "code": "微信临时登录凭证" } |
| 成功响应 | { "code": 200, "data": { "openid": "...", "token": "...", "username": "..." } } |
| 失败响应 | { "code": 400, "msg": "错误描述" } |

### 3.2 获取活动列表

| 项目 | 内容 |
|------|------|
| 路径 | GET /api/wx/activities |
| 鉴权 | 无（公开接口） |
| 成功响应 | { "code": 200, "data": [ Activity对象 ] } |

### 3.3 获取活动详情

| 项目 | 内容 |
|------|------|
| 路径 | GET /api/wx/activities/{id} |
| 鉴权 | 无（公开接口） |
| 成功响应 | { "code": 200, "data": Activity对象 } |
| 失败响应 | 404 |

### 3.4 报名活动

| 项目 | 内容 |
|------|------|
| 路径 | POST /api/wx/activities/{id}/signup |
| 鉴权 | 无（通过 openid 识别用户） |
| 请求体 | { "openid": "...", "name": "张三", "phone": "13800138000" } |
| 成功响应 | { "code": 200, "data": { "signupId": "s...", "joined": 9 } } |
| 失败响应 | { "code": 400, "msg": "您已报名该活动" / "活动名额已满" / "活动不存在" } |

### 3.5 取消报名

| 项目 | 内容 |
|------|------|
| 路径 | DELETE /api/wx/activities/{id}/signup |
| 鉴权 | 无（通过 openid 识别用户） |
| 请求体 | { "openid": "..." } |
| 成功响应 | { "code": 200, "msg": "取消成功" } |

### 3.6 我的报名列表

| 项目 | 内容 |
|------|------|
| 路径 | GET /api/wx/my/signups?openid=xxx |
| 鉴权 | 无（通过 openid 识别用户） |
| 成功响应 | { "code": 200, "data": [ ActivitySignup对象 ] } |

### 3.7 提交反馈

| 项目 | 内容 |
|------|------|
| 路径 | POST /api/feedback |
| 鉴权 | 无（公开接口） |
| 请求体 | { "name": "游客", "content": "反馈内容" } |
| 成功响应 | { "code": 200, "data": Feedback对象 } |

---

## 四、数据模型

### 4.1 Activity（活动课程）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | a1, a2... |
| title | VARCHAR | 活动标题 |
| date | DATE | 活动日期 |
| zone | VARCHAR | 所属区域 |
| quota | INT | 名额上限 |
| joined | INT | 已报名数 |
| status | VARCHAR | 报名中 / 已满员 / 已结束 |
| description | VARCHAR(2000) | 活动描述 |

### 4.2 ActivitySignup（报名记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | s1, s2... |
| activity_id | VARCHAR | 关联活动 ID |
| openid | VARCHAR | 微信用户标识 |
| name | VARCHAR | 报名者姓名 |
| phone | VARCHAR | 报名者手机号 |
| created_at | DATETIME | 报名时间 |

### 4.3 Feedback（反馈）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR PK | f1, f2... |
| name | VARCHAR | 游客姓名 |
| content | VARCHAR(1000) | 反馈内容 |
| status | VARCHAR | 待处理 / 已处理 |
| created_at | DATETIME | 提交时间 |

---

## 五、项目文件结构

### 5.1 小程序端

`
wx-miniprogram/
├── app.json                    # 小程序全局配置
├── app.js                      # 全局 App 实例
├── app.wxss                    # 全局样式
├── sitemap.json                # 搜索配置
├── utils/
│   └── api.js                  # API 请求封装
├── images/                     # TabBar 图标
│   ├── activity.png
│   ├── activity-active.png
│   ├── mine.png
│   └── mine-active.png
└── pages/
    ├── index/                  # 首页 - 活动课程列表
    │   ├── index.wxml
    │   ├── index.wxss
    │   └── index.js
    ├── detail/                 # 详情页 - 活动信息 + 报名
    │   ├── detail.wxml
    │   ├── detail.wxss
    │   └── detail.js
    ├── mine/                   # 我的 - 个人中心
    │   ├── mine.wxml
    │   ├── mine.wxss
    │   └── mine.js
    └── feedback/               # 反馈 - 提交意见
        ├── feedback.wxml
        ├── feedback.wxss
        └── feedback.js
`

### 5.2 后端新增

`
src/main/java/com/camp/
├── config/
│   ├── WxProperties.java       # 微信配置（appid/secret）
│   └── CampSecurityConfig.java # 已放行 /api/wx/**
├── controller/
│   ├── WxAuthController.java   # 微信登录接口
│   └── WxActivityController.java # 活动/报名接口
├── domain/
│   └── ActivitySignup.java     # 报名记录实体
└── repository/
    └── ActivitySignupRepository.java # 报名数据访问
`

---

## 六、环境配置

### 6.1 后端配置（application.yml）

`yaml
wx:
  appid: your_appid_here       # 微信小程序 AppID
  secret: your_secret_here     # 微信小程序 Secret
`

### 6.2 小程序端配置

`javascript
// utils/api.js
const API_BASE = 'http://localhost:8080/api';  // 开发环境
// 上线后改为: const API_BASE = 'https://your-domain.com/api';
`

### 6.3 微信开发者工具设置

| 设置项 | 值 |
|--------|-----|
| AppID | 在微信小程序后台获取 |
| 开发环境不校验合法域名 | 开发时勾选 |
| 服务端口 | 设置 → 安全设置 → 开启 |

---

## 七、开发规范

### 7.1 代码规范

- 变量命名使用 camelCase
- WXML 使用双引号包裹属性值
- WXSS 使用 rpx 作为单位
- API 调用统一通过 utils/api.js 封装
- 页面数据通过 setData 更新

### 7.2 Git 提交规范

`
feat: 新功能
fix: 修复
docs: 文档
style: 样式
refactor: 重构
chore: 构建/工具
`

### 7.3 版本规划

| 版本 | 内容 | 状态 |
|------|------|------|
| v1.0 | 基础功能：登录 + 活动浏览 + 报名 + 反馈 | ✅ 已完成 |
| v1.1 | 活动评价/评分 | 📅 规划中 |
| v1.2 | 消息推送 | 📅 规划中 |
| v2.0 | 在线支付 + 预订套餐 | 📅 规划中 |
