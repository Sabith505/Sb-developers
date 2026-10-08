@echo off
title SB Developers - Tebex Storefront
echo ========================================================
echo    SB DEVELOPERS - TEBEX STOREFRONT PREVIEW SERVER
echo ========================================================
echo.
echo Starting web server on http://localhost:8080 ...
echo Press Ctrl+C anytime to stop.
echo.
start http://localhost:8080
python -m http.server 8080
pause
