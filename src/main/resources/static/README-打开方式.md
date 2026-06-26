# CampOS 运营指挥舱最终版

## 打开方式

1. 双击 `双击打开指挥舱.bat`。
2. 浏览器会自动打开：`http://127.0.0.1:19090/console/index.html`。
3. 关闭弹出的 Node 服务窗口即可停止本地服务。

## 保留文件说明

- `双击打开指挥舱.bat`：比赛现场推荐入口。
- `start-console.bat`：启动 Node 服务并打开浏览器。
- `run-console-server.bat`：实际运行 `server.cjs`，固定端口 `19090`。
- `server.cjs`：本地静态服务与演示 API。
- `console/`：指挥舱页面代码。
- `data/`、`assets/`、`vendor/`、`node_modules/`：页面运行所需数据、模型与依赖。

## 注意

不要直接双击 `console/index.html`，浏览器的 `file://` 限制可能导致模型、JSON 数据或脚本加载异常。
