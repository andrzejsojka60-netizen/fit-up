@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Fit Up · 健身训练 — 手机访问服务器

echo.
echo ╔═══════════════════════════════════════╗
echo ║   💪 Fit Up · 健身训练 — 手机安装  ║
echo ╚═══════════════════════════════════════╝
echo.

REM Check Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 检测到 Python
    echo [i] 手机和电脑必须连接同一 WiFi
    echo [i] 关闭此窗口即可停止服务器
    echo.
    echo 扫描网络地址...
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
        set ip=%%a
        set ip=!ip: =!
        if not "!ip!"=="127.0.0.1" (
            echo 📱 手机浏览器打开: http://!ip!:8080
        )
    )
    echo.
    echo ──────────────────────────────
    echo 📲 安装到桌面：
    echo    iPhone:  分享按钮 → 添加到主屏幕
    echo    Android: 菜单按钮 → 添加到主屏幕
    echo ──────────────────────────────
    echo.
    python -m http.server 8080 --bind 0.0.0.0
    goto :end
)

REM Check Node.js
where npx >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 检测到 Node.js (npx)
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
        set ip=%%a
        set ip=!ip: =!
        if not "!ip!"=="127.0.0.1" (
            echo 📱 手机浏览器打开: http://!ip!:8080
        )
    )
    echo.
    echo 📲 iPhone: 分享 → 添加到主屏幕
    echo 📲 Android: 菜单 → 添加到主屏幕
    echo.
    npx serve . -l 8080 --no-clipboard
    goto :end
)

echo [X] 未检测到 Python 或 Node.js
echo.
echo 请安装以下任一工具：
echo   1. Python: https://python.org (勾选 Add to PATH)
echo   2. Node.js: https://nodejs.org
echo.
echo 安装后重新运行此脚本即可。
echo.
pause
:end
