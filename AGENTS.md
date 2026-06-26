# AGENTS.md — 营地公园全栈管理系统

## 项目定位
这是一个营地公园全栈管理系统 (CampOS)，当前处于"演示版→商用版"改造阶段。
完整的项目架构、数据库设计、API 接口、待办事项全部记录在 `PROJECT_CONTEXT.md` 中。
**新对话第一件事：先完整阅读 `PROJECT_CONTEXT.md`。**

## 当前状态 (2026-06-26)
- 后端 API 基本完整（CRUD 状态更新 + 公开接口）
- 前端 SPA 是演示版（硬编码数据），通过 Bridge v7 脚本在 DOM 层打补丁
- 登录凭据: admin / camp2026
- 开发访问: http://127.0.0.1:19098/admin/index.html
- GitHub: https://github.com/LIUENXUAN/web-

## 开发须知
1. 后端修改后需 `mvn package` 重新打包 JAR 才能生效
2. 前端修改直接改 `后台/admin/assets/` 下的文件，独立服务器实时生效
3. 如果 git push 连不上 GitHub，检查 hosts 文件是否被 Steam++ 劫持
4. 所有 Java 源文件在 `src/main/java/com/camp/`
5. 所有前端静态文件在 `src/main/resources/static/` 和 `后台/admin/`

## 当前优先任务
按 `PROJECT_CONTEXT.md` 第八章「商用化改造路线图」的阶段顺序执行。
当前应处于阶段一（后端 API 补齐）和阶段二（重写后台 SPA）的交界处。

## 编码规范
- Java: 遵循现有代码风格，Lombok + JPA
- JS: ES5 兼容（独立服务器无转译），避免箭头函数/const/let
- API 响应格式: {code, msg, data}
- 数据库: JPA ddl-auto=update，实体修改后自动建表
