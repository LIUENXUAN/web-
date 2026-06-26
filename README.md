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
