@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动最终版后台（自动寻找空闲端口，不影响其他项目）...
echo.
echo 默认从 19098 开始寻找空闲端口。
echo 浏览器会自动打开后台；关闭此窗口即可停止后台服务。
echo.
node start-admin.cjs
pause
