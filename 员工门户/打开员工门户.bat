@echo off
chcp 65001 >nul
cd /d "%~dp0"
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%
echo ============================================
echo  CampOS -- Employee Portal
echo ============================================
echo.
echo [1/2] checking backend...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 "') do set BPID=%%a
if not defined BPID (
  echo backend not running, starting...
  start /B java -jar ..\target\camp-system-1.0.0.jar
  echo waiting for backend...
  ping 127.0.0.1 -n 8 >nul
) else (
  echo backend already running.
)

echo [2/2] starting employee portal...
echo.
node start-employee.cjs
pause
