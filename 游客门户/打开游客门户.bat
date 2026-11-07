@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动游客门户...
echo.
node start-visitor.cjs
pause
