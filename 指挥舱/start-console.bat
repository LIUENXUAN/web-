@echo off
setlocal
cd /d "%~dp0"
where node.exe >nul 2>nul
if errorlevel 1 goto NO_NODE
start "" /min "%~dp0run-console-server.bat"
ping 127.0.0.1 -n 3 >nul
start "" "http://127.0.0.1:19090/console/index.html"
goto END
:NO_NODE
echo Node.js not found. Please install Node.js, then run this file again.
pause
:END
endlocal