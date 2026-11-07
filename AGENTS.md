# AGENTS.md — 营地公园全栈管理系统

## 项目定位
这是一个营地公园全栈管理系统 (CampOS)，当前处于"演示版→商用版"改造阶段。
完整的项目架构、数据库设计、API 接口、待办事项全部记录在 `PROJECT_CONTEXT.md` 中。
**新对话第一件事：先完整阅读 `PROJECT_CONTEXT.md`。**

## 当前状态 (2026-06-28 v12)
- 后端 API 基本完整（CRUD 状态更新 + 公开接口 + 分页筛选）
- 商用 SPA (admin-spa.html) 是唯一后台入口，10 页面全功能，v12 最终版
- 背景: CDN 绿色地球旋转视频（与 bloomAdmin.js 原版一致）
- 主题: 森系深绿配色，Inter 字体，高对比度
- 弹窗: overlay 包裹结构 + stopPropagation 修复
- 登录凭据: admin / camp2026
- 开发访问: http://127.0.0.1:19098/后台/admin/admin-spa.html (唯一后台入口)
- GitHub: https://github.com/LIUENXUAN/web-

## 开发须知
1. 后端修改后需 `mvn package -DskipTests` 重新打包 JAR 才能生效
   - 注意: 需要设置 `$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"`
   - 或用 `.\mvnw.cmd package -DskipTests`
2. 前端修改直接改 `后台/admin/assets/` 下的文件，独立服务器实时生效
3. 如果 git push 连不上 GitHub，检查 hosts 文件是否被 Steam++ 劫持
4. 所有 Java 源文件在 `src/main/java/com/camp/`
5. 所有前端静态文件在 `src/main/resources/static/` 和 `后台/admin/`

## 当前优先任务
按 `PROJECT_CONTEXT.md` 第八章「商用化改造路线图」的阶段顺序执行。
当前阶段一（后端 API 补齐）基本完成，阶段二（重写后台 SPA）已完成：商用 SPA v2 (admin-spa.html, React 18 CDN, 10 页面全功能)。
阶段二商用 SPA Part 1 完成（admin-spa.html: 仪表盘/订单/营地区域/活动课程/游客反馈）。全部完成。admin-spa.html 是唯一后台入口，Bridge v10 (index.html) 已淘汰。

## 编码规范
- Java: 遵循现有代码风格，Lombok + JPA
- JS: ES5 兼容（独立服务器无转译），避免箭头函数/const/let
- API 响应格式: {code, msg, data} 或 PageResponse {content, totalPages, totalElements, size, number}
- 数据库: JPA ddl-auto=update，实体修改后自动建表
## 商用 SPA 开发须知 (admin-spa.html)
- 文件: 后台/admin/admin-spa.html (HTML 入口) + 后台/admin/admin-spa.js (88KB, React 组件)
- 技术: React 18 + React Router 6 (CDN), 原生 React.createElement, 无需 Babel
- 10 页面全功能: 登录/仪表盘/订单管理/营地区域/活动课程/游客反馈/资产管理/巡检管理/告警管理/用户管理
- 背景: CDN 绿色地球旋转视频（https://d8j0ntlcm91z4...mp4）
- 主题: 森系深绿配色（Inter 字体、高对比度、毛玻璃 blur 6px）
- 弹窗: overlay 包裹 modal-box + stopPropagation
- 复用现有 CSS: 后台/admin/assets/bloomAdmin-BUhvVHef.css
- API: 直连 http://localhost:8080，需后端运行
- 开发方式: 直接编辑 admin-spa.js，浏览器刷新生效，无需构建