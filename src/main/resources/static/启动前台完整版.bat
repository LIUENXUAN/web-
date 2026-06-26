@echo off
cd /d "%~dp0"
title Nature Haven Camp Frontend
echo Starting Nature Haven Camp frontend...
echo Do NOT open index.html directly.
echo Browser will open automatically.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 6129
echo.
echo Server stopped. Press any key to close.
pause >nul
