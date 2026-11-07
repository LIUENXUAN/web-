@echo off
chcp 65001 >nul
cd /d "%~dp0"
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%
echo ============================================
echo  CampOS -- YingDi GongYuan QuanZhan XiTong
echo ============================================
echo.
echo [1/2] starting backend (Spring Boot)...
echo.

start /B java -jar target\camp-system-1.0.0.jar

echo waiting for backend...
ping 127.0.0.1 -n 8 >nul

echo [2/2] starting frontend servers...
echo.

start /B node start-system.cjs

ping 127.0.0.1 -n 4 >nul

echo opening pages...
start "" "http://127.0.0.1:18887/"
start "" "http://127.0.0.1:18888/"
start "" "http://127.0.0.1:18889/"
start "" "http://127.0.0.1:19099/"
start "" "http://127.0.0.1:19101/"
start "" "http://127.0.0.1:19102/"

echo.
echo all services started, close this window to stop.
echo.
pause
