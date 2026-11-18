@echo off
title ServisIn Application Server
color 0A
echo ========================================================
echo           MEMULAI SERVER APLIKASI SERVISIN
echo ========================================================
echo.
echo Direktori: %~dp0
cd /d "%~dp0"
echo Membuka browser ke http://localhost:3000 dalam 3 detik...
start "" http://localhost:3000
echo.
echo Menjalankan Next.js server...
echo (Tekan Ctrl + C di jendela ini jika ingin menghentikan server)
echo.
call npm run dev
pause
