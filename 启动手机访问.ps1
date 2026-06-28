# Fit Up 健身训练 — 手机访问服务器
# 确保手机和电脑在同一 WiFi 网络下

Write-Host ""
Write-Host "╔═══════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   💪 Fit Up · 健身训练 — 手机安装  ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Get local IP
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -ne '127.0.0.1' -and
    $_.PrefixOrigin -ne 'WellKnown'
} | Select-Object -ExpandProperty IPAddress

if (-not $ips) {
    Write-Host "⚠️ 无法自动获取 IP，尝试备用方法..." -ForegroundColor Yellow
    $ips = @((ipconfig | Select-String 'IPv4.*: ([\d.]+)').Matches | ForEach-Object { $_.Groups[1].Value } | Where-Object { $_ -ne '127.0.0.1' })
}

$urls = $ips | ForEach-Object { "http://${_}:8080" }

Write-Host "✅ 启动服务器..." -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  手机和电脑必须连接同一 WiFi" -ForegroundColor Yellow
Write-Host "⚠️  按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 在手机浏览器打开以下地址：" -ForegroundColor Cyan

$urls | ForEach-Object {
    Write-Host "   $_" -ForegroundColor White
}

Write-Host ""
Write-Host "📲 打开后按以下步骤安装到桌面：" -ForegroundColor Magenta
Write-Host "   iPhone:  点击底部分享 → 「添加到主屏幕」" -ForegroundColor Gray
Write-Host "   Android: 点击右上角菜单 → 「添加到主屏幕」" -ForegroundColor Gray
Write-Host ""
Write-Host "────────────────────────────────────" -ForegroundColor Gray

# Try Python first, then npx
$python = Get-Command python -ErrorAction SilentlyContinue
$npx = Get-Command npx -ErrorAction SilentlyContinue

if ($python) {
    Write-Host "使用 Python 服务器" -ForegroundColor Gray
    Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
    python -m http.server 8080 --bind 0.0.0.0
} elseif ($npx) {
    Write-Host "使用 Node.js (serve) 服务器" -ForegroundColor Gray
    Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
    npx serve . -l 8080 --no-clipboard
} else {
    Write-Host "❌ 未检测到 Python 或 Node.js" -ForegroundColor Red
    Write-Host ""
    Write-Host "请安装以下任一工具：" -ForegroundColor Yellow
    Write-Host "  1. Python: https://python.org (推荐，勾选 Add to PATH)" -ForegroundColor White
    Write-Host "  2. Node.js: https://nodejs.org" -ForegroundColor White
    Write-Host ""
    Read-Host "按 Enter 退出"
}
