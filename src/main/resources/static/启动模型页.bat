@echo off
cd /d %~dp0
echo MODEL: http://127.0.0.1:8897/model-test.html
start "" "http://127.0.0.1:8897/model-test.html?v=model"
"C:\Users\Windows\AppData\Local\Programs\Python\Python310\python.exe" -m http.server 8897 --bind 127.0.0.1
pause