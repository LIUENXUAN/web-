@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动 林间律动 高级首页...
echo 打开地址: http://127.0.0.1:8899/
start "" "http://127.0.0.1:8899/"
python -m http.server 8899 --bind 127.0.0.1
pause
